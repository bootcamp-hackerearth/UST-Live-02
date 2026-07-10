---
description: Generate a sprint / changelog report from git history, grouped by app area and contributor.
argument-hint: [--since <ref|date>] [--until <ref|date>] [--author <name>] [--branch <ref>] [--area backend|frontend|patient|ci|docs] [--audience team|standup|stakeholder] [--format markdown|json] [--enrich] [--save <path>]
allowed-tools: Bash(git:*), Bash(gh:*), Read, Write
---

# Sprint Report

## Role

Produce a **sprint / changelog report** for this repository from its git history.
Report only what the commits actually show — never invent work that is not in the log.
Read-only by default; the command writes a file **only** when `--save` is given.

## Inputs

Parse `$ARGUMENTS` (every flag optional):

- `--since <ref|date>` — start of the range. A git revision (branch/tag/sha) **or** a date / relative date. git date keywords work too: `midnight` and `today` (since 00:00 today), `yesterday`, `noon`, `2.weeks.ago`. Default: `2.weeks.ago`. **Today's changes:** `--since midnight`.
- `--until <ref|date>` — end of the range. Default: now (`HEAD`).
- `--author <pattern>` — restrict to matching authors (git `--author` regex). Default: everyone.
- `--branch <ref>` — report on this ref instead of the current branch.
- `--area <backend|frontend|patient|ci|docs>` — restrict the report to one area. Default: all.
- `--audience <team|standup|stakeholder>` — controls tone/detail (see Output). Default: `team`.
- `--format <markdown|json>` — output shape. `markdown` (default) = the human report; `json` = a machine-readable object (schema below) **and nothing else**, so it can be piped into tooling.
- `--enrich` — use the GitHub CLI (`gh`) to link each commit to its pull request and any `#`-referenced issues, pulling their titles. Best-effort: if `gh` is missing or unauthenticated, skip enrichment with a note and continue.
- `--save <path>` — also write the report, in the chosen `--format`, to `<path>`. This is the only case where the command writes a file.

A bare first token that is a date or ref (e.g. `/sprint-report 7.days.ago`) is treated as `--since`.

## Steps

1. **Confirm a git repo.** Run `git rev-parse --is-inside-work-tree`. If it fails, stop and say so plainly — do not guess.

2. **Resolve the range.** If the `--since` value resolves as a revision (`git rev-parse --verify --quiet <value>` succeeds), use range form `<value>..<target>`; otherwise pass it as `--since=<value>` (date keywords like `midnight`/`today` take this path). Apply `--until` the same way. `<target>` is the current `HEAD`, or `--branch` when given.

3. **Detect areas dynamically — do not hardcode app names.** Discover app roots with `git ls-files "*package.json"` (node_modules is gitignored, so only real apps appear). Treat each **top-level** directory that owns a `package.json` as an app area, labelled by its folder name. Also map: `.github/**` → **CI/CD**; root `*.md`, `README*`, and any `*/README.md` / `*/UI_SPEC.md` → **Docs**; anything else at the repo root → **Repo**.

4. **Gather commits** on the resolved range, excluding merges, with per-file line counts:
   `git log --no-merges [--author=<pattern>] <range> --numstat --date=short --pretty=format:"@@@%h|%ad|%an|%s"`
   Each `@@@` line begins a commit; the following lines are `<added>\t<deleted>\t<path>` per changed file (binary files show `-` — count them as 0 lines). Use the paths for area classification and the counts for per-area volume.

5. **Classify each commit** by the first path segment of its changed files:
   - Bucket files into the areas from step 3, summing insertions/deletions per area.
   - The commit's **primary area** is the one with the most changed files; if it also touches others, tag them (e.g. `(+Frontend)`).
   - Infer a **type** heuristically from the subject's leading verb: `Add`→feature, `Fix`→fix, `Refactor`→refactor, `Remove`/`Delete`→removal, `Revert`→revert, `Update`/`Change`/`Restart`/`Reload`→change, `Verify`/`CI`→ci, `Docs`/`Update README`→docs. This is approximate — do not overstate it.

6. **Contributors:** `git shortlog -sn --no-merges <range>` (respecting `--author` if set).

7. **App versions (header context):** Read the `version` field from each detected app's `package.json`.

8. **Enrichment (`--enrich` only).** Confirm `gh` is available and authenticated (`gh auth status`); if not, note it and skip. Then, for each commit: find its pull request (`gh pr list --search "<sha>" --state merged --json number,title`) and parse `#<n>` issue references from the subject, fetching titles (`gh issue view <n> --json title`). Attach the PR number/title and issue titles. Keep the number of calls bounded and degrade gracefully on any failure — enrichment is additive, never a hard error.

## Output

Branch on `--format`:

**`markdown` (default).** Render the report in your reply:

- **`Sprint Report — <resolved date range>`** — header with: target branch/ref, resolved `since → until` (real dates + boundary shas), author filter (if any), total commits, contributor count, total `+insertions / -deletions`, and app versions.
- **Highlights** — 3–6 honest bullets summarizing the theme(s), grounded in the commit subjects. If messages are too vague to summarize (e.g. "CI/CD check"), say so rather than invent detail.
- **By area** — one subsection per area **that had commits**, apps first (in detected order), then CI/CD, Docs, Repo. Header shows the commit count and `(+X / −Y lines)`. Each commit: `` `<sha>` <subject> — <type>[ (+OtherArea)][ · PR #<n>][ · #<issue> <title>] ``. When `--area` is set, include only that area.
- **Contributors** — the shortlog counts.
- **Callouts** — only if present: reverts, CI/deploy churn, changes touching auth / permissions / deployment, or doc-vs-code drift worth a reviewer's eye. Omit the section entirely when there is nothing notable.

  Adapt to `--audience`: `standup` = terse "what shipped / in progress", drop shas; `stakeholder` = outcome-focused, no shas or types; `team` (default) = the full structure above.

**`json`.** Emit **only** this object (no prose), so it can be piped:

```json
{
  "range": { "branch": "", "since": "", "until": "", "sinceSha": "", "untilSha": "", "author": null },
  "totals": { "commits": 0, "contributors": 0, "insertions": 0, "deletions": 0 },
  "versions": { "<app-dir>": "" },
  "areas": [ { "area": "", "commits": 0, "insertions": 0, "deletions": 0 } ],
  "commits": [
    { "sha": "", "date": "", "author": "", "subject": "", "primaryArea": "",
      "areas": [], "type": "", "insertions": 0, "deletions": 0, "pr": null, "issues": [] }
  ],
  "contributors": [ { "name": "", "commits": 0 } ],
  "callouts": []
}
```

If `--save <path>` is set, write the output — in the chosen format — to `<path>` and confirm the path. For `markdown` you may still render it inline; for `json` the file is the deliverable.

## Guardrails

- **Read-only except `--save`.** Never modify tracked source, never commit or push; the only file the command may write is the `--save` target, in the requested format.
- `--enrich` uses `gh` for **read-only** queries only — never open, edit, comment on, or close PRs/issues. If `gh` is unavailable or unauthenticated, skip enrichment and say so.
- **No fabrication.** Every claim must trace to a commit in the range; prefer "the log doesn't say" over guessing.
- If the range is empty, state that clearly with the exact range used and suggest widening `--since`.
- Merge commits are excluded by default; mention it if you deliberately include them.