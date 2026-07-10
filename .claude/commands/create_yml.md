---
description: Detect the stack and generate a GitHub Actions CI/CD workflow (any repo)
argument-hint: "[ci|cd|both] — defaults to ci"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(ls:*), Bash(cat:*), Bash(git:*)
---

## Task

Generate a GitHub Actions workflow YAML under `.github/workflows/` for **this**
repository. First detect the stack from the files present, then write a workflow
that matches it. Do not assume any particular language or framework.

Argument: `$ARGUMENTS` — `ci` (lint/test/build, default), `cd` (deploy), or `both`.

## Step 1 — Detect the stack (don't guess, look)

Use Glob/Read/Grep to identify what's here. Common signals:

| Signal file                          | Stack → toolchain                              |
| ------------------------------------ | ---------------------------------------------- |
| `package.json`                       | Node — read it for the real script names       |
| `pnpm-lock.yaml` / `yarn.lock` / `package-lock.json` | package manager (use the matching install cmd) |
| `angular.json`                       | Angular (`ng build` / `ng test`)               |
| `next.config.*`                      | Next.js                                         |
| `vite.config.*`                      | Vite                                            |
| `pyproject.toml` / `requirements.txt`| Python (pip/poetry/uv)                          |
| `go.mod`                             | Go                                              |
| `Cargo.toml`                         | Rust                                            |
| `pom.xml` / `build.gradle`           | Java (Maven/Gradle)                             |
| `Dockerfile`                         | container build available                      |

- **Monorepo?** If multiple `package.json`/project roots exist under subfolders,
  detect each, and either emit one workflow per project with `paths:` scoping, or
  a single matrix — pick whichever fits and say why.
- Read the actual manifest to confirm script/target names. Never invent a `test`
  or `lint` script that doesn't exist — omit the step or use the real command.

## Step 2 — Generate the workflow

CI requirements:

1. Trigger on `push` and `pull_request` to the default branch (detect it via
   `git branch` / the repo; fall back to `main`).
2. `runs-on: ubuntu-latest`, `permissions: contents: read`.
3. Use the correct setup action + dependency cache for the detected stack
   (`setup-node` + `cache`, `setup-python` + pip cache, `setup-go`, etc.).
4. Steps in order: install deps → lint (only if a lint script/tool exists) →
   test (only if tests exist) → build (if there's a build step).
5. For a monorepo, scope each job with `paths:` and set the working directory.
6. Add a short header comment describing what the workflow does.

CD (only if requested): keep it minimal and gated behind the default branch.
If secrets are required (registry creds, deploy keys), reference them via
`${{ secrets.NAME }}` and list every secret the user must add.

## Step 3 — Write and report

- Choose a clear filename: `ci.yml`, or `ci-<project>.yml` per monorepo project.
- Check `.github/workflows/` first and avoid clobbering or duplicating existing
  workflows — if one already covers this, extend it instead.
- After writing, print the path(s), a one-line summary of each job, and any
  repository secrets the user still needs to configure.
