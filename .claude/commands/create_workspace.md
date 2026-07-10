---
description: Scaffold boilerplate for a new project and install deps to start dev
argument-hint: "<stack> [project-name] — e.g. node-express, react-vite, angular, expo, next"
allowed-tools: Read, Write, Edit, Glob, Grep, Bash
---

## Task

Scaffold a new project's boilerplate from scratch, install dependencies, and leave it
in a runnable state so the user can start development immediately.

Request: `$ARGUMENTS`

- First token = **stack** (see table). Second token (optional) = **project name /
  target directory**. If no name is given, ask for one (or use the current empty dir).
- If the stack is missing or ambiguous, ask the user which stack they want before
  scaffolding — do not guess.

## Supported stacks — prefer official scaffolders

| Stack keyword          | How to scaffold                                              |
| ---------------------- | ----------------------------------------------------------- |
| `react-vite`, `vite`   | `npm create vite@latest <name> -- --template react-ts`      |
| `next`                 | `npx create-next-app@latest <name> --ts --eslint`           |
| `angular`              | `npx @angular/cli@latest new <name>`                        |
| `expo`, `react-native` | `npx create-expo-app@latest <name>`                         |
| `vue`                  | `npm create vue@latest <name>`                              |
| `node-express`, `express`, `api` | hand-roll (see below) — no good official scaffolder |
| `node-lib`, `ts-lib`   | hand-roll a minimal TypeScript library                      |

For anything not listed, pick the closest official generator, or hand-roll a minimal
setup and say what you chose.

## Hand-rolled Node/Express (TypeScript) layout

When scaffolding `node-express`, create:

```
<name>/
  src/
    server.ts        # boot: reads PORT, starts app, graceful shutdown
    app.ts           # express() instance, middleware, routes mounted
    routes/health.ts # GET /health -> { status: "ok" }
  .env.example       # PORT=3000  (+ placeholders, no real secrets)
  .gitignore         # node_modules, dist, .env, *.log, coverage
  tsconfig.json      # strict: true, outDir dist, target ES2022
  package.json       # scripts below
  README.md          # what it is, how to run
```

`package.json` scripts: `dev` (tsx/nodemon watch), `build` (tsc), `start`
(node dist/server.js), `test` (whatever runner you add), `lint`.
Dev deps: typescript, tsx (or ts-node + nodemon), @types/node, @types/express.

## Steps (every stack)

1. Confirm the target directory is empty or new. **Never overwrite an existing
   non-empty project without asking.** Check with Glob/`ls` first.
2. Run the scaffolder (or write the hand-rolled files).
3. `cd <name>` and run `npm install` (or the package manager the scaffolder chose).
4. Ensure these exist regardless of stack — add if the scaffolder didn't:
   - `.gitignore` covering `node_modules`, build output, `.env`, logs
   - `.env.example` with placeholder vars (only if the app reads env)
   - `README.md` with a "Getting started" section (install + run commands)
5. `git init` if the directory isn't already inside a git repo.
6. Verify it actually starts: run the build and/or a quick `dev`/typecheck to catch
   breakage. Report the result honestly — if it fails, show the error, don't paper over it.

## After scaffolding

Print a short summary:
- The path created and the stack used.
- The exact commands to start developing (e.g. `cd <name> && npm run dev`).
- Any next steps (fill in `.env`, etc.).
