---
description: Mirror the EC2 deploy pipeline locally to catch build/boot failures before you push.
argument-hint: [--skip-build] [--health] [--fetch] [--changed]
allowed-tools: Bash, Read
---

# Deploy Preflight

## Role

Mirror the deploy workflow's gates **as closely as the local repository allows**, run **before a push**, so a broken build or a backend that won't boot never reaches EC2. This is **verify-only**: end with a GO / NO-GO verdict — never fix, commit, push, deploy, or edit tracked files. It does **not** perfectly reproduce the server: some deployment checks are inherently server-only (see **Local vs Server Verification**) and cannot be observed from here, so a GO reflects local readiness, not a guarantee the deployment target is healthy.

## Inputs

Parse `$ARGUMENTS`:

- `--skip-build` — skip the Angular production build; run only the fast static checks.
- `--health` — additionally probe the backend health endpoint if a local server is already running.
- `--fetch` — refresh remote-tracking refs (`git fetch origin <branch>`) before the ahead/behind and change-scope checks, so they compare against the true remote state. Refs only — no merge, rebase, or working-tree change.
- `--changed` — only run an app's checks when that app changed in the deploy scope (skip the backend smoke or the frontend build when nothing under its directory will deploy).

## Steps

1. **Read the pipeline — do not hardcode it.** Read `.github/workflows/deploy.yml` and extract, from the file itself:
   - the trigger branch(es) (`on.push.branches`);
   - the backend and frontend directories (the `cd` targets);
   - the backend install + process commands (`npm ci`, `pm2 restart <name>`);
   - the health-check URL (the `curl` target);
   - the frontend build command and the **expected build-output dir** it verifies (e.g. `dist/<project>/browser`);
   - the deploy target dir it copies into.
   If the workflow file is absent, stop and say so plainly — there is no pipeline to mirror.

2. **Git readiness.** The server does `git reset --hard HEAD` + `git clean -fd` then `git pull origin <branch>`, so **only pushed commits on that branch deploy**:
   - If `--fetch` is set, run `git fetch origin <branch>` first so the comparisons below use the real remote state; otherwise use the existing remote-tracking refs and note they may be stale.
   - Current branch vs. the trigger branch — warn if they differ (this push won't trigger a deploy).
   - Working tree clean (`git status --porcelain`) — warn and list changes; uncommitted/untracked work will not reach the server.
   - Local branch ahead of `origin/<branch>` — warn about unpushed commits.
   - **Local-only note.** These checks validate the **local repository against `origin` only**. They cannot detect deployment-server Git problems — divergent branch history, manual commits made directly on EC2, an unexpected `HEAD`, repository corruption, or any Git state that exists only on the server. Any of these can still break the deploy (the server's `git reset --hard` + `git pull` may fail or land on the wrong commit) even when this preflight passes.

3. **Change scope** (drives `--changed`). Compute the files this push would newly deploy: `git diff --name-only origin/<branch>...HEAD` — changes vs. the deployed remote branch. Uncommitted/untracked work is excluded on purpose, because the server hard-resets before pulling. If `origin/<branch>` is unavailable, skip scoping and run every check (note the reduced precision). Without `--changed`, run all app checks regardless of this set.

4. **Backend** (in the backend dir from step 1). If `--changed` and no files under the backend dir are in the change scope, **SKIP** with a note.
   - `package-lock.json` present — CI uses `npm ci`, which fails without a lockfile.
   - **Deps installed & lockfile-consistent** — the boot smoke must run against the same dependencies the server installs. If `node_modules` is missing, or the boot smoke below reports a missing module that *is* declared in `package.json` and present in `package-lock.json`, run `npm ci` (the server's exact install command) to reconcile before judging — a stale or incomplete local install is not a deploy problem and must not drive a NO-GO.
   - **Env contract** — run the project's own validator against the local `.env`:
     `node -e "require('dotenv').config(); require('./src/config/validateEnv')()"`
     Exit 0 → PASS. On failure this is a **WARN, not a FAIL**: the server sets its own environment (pm2 `--update-env`), which this cannot inspect. Report the thrown message and list the vars the validator requires so the developer can confirm the **server** env has them.
   - **New required env vars** — diff the validator against the deployed version and any uncommitted edits:
     `git diff origin/<branch>...HEAD -- <backendDir>/src/config/validateEnv.js` and `git diff -- <same path>`.
     If its required-vars list gained entries, flag each as a **server-env action item**: the backend refuses to boot when a required var is missing, so these must be set in the EC2 environment (read by pm2 `--update-env`) as part of this deploy — otherwise the restart fails and takes the API down.
   - **Boot smoke (no DB)** — `node -e "require('./src/app')"` loads Express and every route/controller/model **without** connecting to Mongo; it catches the syntax / broken-import errors that make `pm2 restart` fail on the server. Exit 0 → PASS.
     - If it fails with `Cannot find module '<pkg>'` / `MODULE_NOT_FOUND` **and** `<pkg>` is declared in `package.json` *and* present in `package-lock.json`, the local `node_modules` is stale or incomplete — **not** a code defect. Run `npm ci` in the backend dir (the server's exact install command; a gitignored write), then re-run the boot smoke. Report the reinstall as a **note**, and if the re-run now exits 0 it is a **PASS** — never a FAIL and never a NO-GO on account of the stale install.
     - Report **FAIL** only when the boot smoke still fails after a clean `npm ci`, or the missing module is **not** declared + locked, or the error is a genuine syntax / broken-import bug — those are the cases that would also break `pm2 restart` on the server.
   - **Health (`--health` only)** — `curl -fsS <healthURL>`; PASS if it returns `UP`; SKIP with a note if nothing is listening (a real health check needs a running server + Mongo, which CI verifies post-deploy).

5. **Frontend** (in the frontend dir from step 1). If `--changed` and no files under the frontend dir are in the change scope, **SKIP** the build with a note.
   - **Output-path consistency** — read the Angular project name from `angular.json`; the `@angular/build:application` builder emits to `dist/<project>/browser`. Confirm that equals the output dir the workflow verifies. A mismatch (e.g. a renamed project) means the deploy's "verify build output" step will fail — report **FAIL**.
   - `node_modules` present — if missing, the build needs deps (`npm install`); if dependencies changed, reinstall first, since CI builds from a clean install.
   - **Production build (unless `--skip-build`)** — run the workflow's build command (`npm run build`, which defaults to the production configuration). On failure, report **FAIL** with the compiler output — this is the most common cause of a broken deploy. On success, confirm `dist/<project>/browser/index.html` exists (the exact file CI checks).
   - **Info** — read `apiUrl` from `src/environments/environment.ts` and report the API base the production bundle will target (catches a wrong or localhost URL shipping to prod).

6. **Verdict.** Print a table of every check with PASS / WARN / FAIL / SKIP, then an overall **GO** or **NO-GO**. A boot smoke that only failed on a stale/incomplete local install and passed after `npm ci` is a **PASS** (note the reinstall) — it must never drive a NO-GO. Explicitly list what could **not** be verified locally, because it only exists on the server:
   - production environment variables;
   - MongoDB connectivity from EC2;
   - the `pm2` runtime;
   - the server health endpoint;
   - the nginx deployment (copy + restart);
   - deployment-server Git state — divergent history, manual commits on EC2, an unexpected `HEAD`, repository corruption.

   End with: **A GO verdict means the LOCAL repository is ready to deploy and all locally verifiable deployment gates passed. It does NOT guarantee that the deployment target itself is healthy or deployable.**

## Local vs Server Verification

This command **intentionally verifies locally only**. It does **not** SSH into the deployment server, so any problem that lives solely on EC2 is invisible to it and can fail a deploy the preflight called GO. Examples it cannot catch:

- deployment-server Git divergence (divergent history, manual commits, unexpected `HEAD`, corruption);
- manual changes made directly on the server;
- incorrect or missing server environment variables;
- MongoDB connectivity from EC2;
- `pm2` restart / runtime failures;
- nginx configuration or restart issues;
- disk space exhaustion;
- file-permission errors.

## Guardrails

- **Verify-only.** Never edit tracked source, never commit / push / deploy, never touch `.env`, and never manually `rm -rf node_modules`. The one exception: the preflight may run `npm ci` in the **backend** dir to reconcile a stale or incomplete install before the boot smoke — this mirrors the server's exact install step and writes only to the gitignored `node_modules`.
- `--fetch` updates remote-tracking refs only; it must not merge, rebase, or change the working tree.
- The only writes are gitignored: build artifacts under `dist/`, and `node_modules` when the preflight runs `npm ci` in the backend (or the user installs). Say so before building or installing.
- Don't start long-running servers; health is opt-in and best-effort.
- Report failures honestly with the real command output — a GO verdict must mean the local gates actually passed, not that they were skipped.