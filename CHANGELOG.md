# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-10T22:42:19+05:30 — Initialize Next.js project

- Changed: Added the official Next.js 16.4.0 App Router starter with TypeScript, Tailwind CSS 4, ESLint, npm scripts, a lockfile, Node.js engine requirement, and Loopin metadata. Replaced build-time Google Fonts with system fonts and configured Webpack for production builds. Updated README and submission setup commands.
- Why: Establish a current, reproducible project foundation for the hackathon implementation.
- Validation: `npm ci --allow-remote=all --no-audit --no-fund`, `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- Limitations: Product behavior is not defined yet. npm 12 blocked the optional `unrs-resolver` install script; all listed checks passed without it. Turbopack production builds could not spawn workers in this environment, so the production build script uses Next.js's supported Webpack mode.

```text
## <actual timestamp> — <short change title>

- Changed: <feature or files changed>
- Why: <reason for the change>
- Validation: <commands or manual checks actually run, with results>
- Limitations: <known issues or "None identified in these checks">
```

## Template setup — 10 October 2026

- Changed: Added the event README, rules, agent guide, change log, AI usage record, submission checklist, Git ignore rules, and pull request checklist.
- Why: Give participants a consistent starting point for event rules, basic coding patterns, documented changes, and regular commits.
- Validation: Checked local Markdown links, event detail consistency, required documents, and diff whitespace before publishing.
- Limitations: Documentation scaffolding only; no participant project, application, or working demo is included. GitHub publication and template status are verified separately after creation.
