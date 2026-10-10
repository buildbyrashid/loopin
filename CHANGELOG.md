# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-11T02:46:00+05:30 — Accept custom WhatsApp chat filenames

- Changed: Scan `.txt` files inside uploaded ZIPs, prioritize `chat.txt`/`_chat.txt`, and accept custom names such as `WhatsApp Chat with Dipin Aicura.txt` when they contain readable WhatsApp messages. Updated the upload and processing diagnostics and README.
- Why: WhatsApp exports with media can use the chat name as the text filename; the previous exact-name check rejected valid archives before voice transcription.
- Validation: TypeScript, ESLint, diff check, and production Webpack build passed.
- Limitations: A `.txt` file must still contain parseable WhatsApp message lines; arbitrary text files remain invalid.

## 2026-10-11T02:34:49+05:30 — Add exact upload diagnostics

- Changed: Added request IDs, structured error codes, safe archive-entry diagnostics, terminal/browser logging, and persisted `uploads.error_message` details for upload and processing failures. Invalid archives now create a failed upload record so the same cause is visible in the Admin → Uploads page and Supabase table.
- Why: Make a 400 upload response actionable instead of requiring the user to infer the cause from a generic toast or server status line.
- Validation: TypeScript, ESLint, diff check, and production Webpack build passed.
- Limitations: Supabase platform Logs do not automatically receive logs emitted by a separate Next.js server; the exact upload diagnostic is persisted in the `uploads` table and shown in the admin console.

## 2026-10-11T02:28:00+05:30 — Harden AI extraction and processing failures

- Changed: Normalize common AI response variations before schema validation, log validation fields without conversation content, and mark failed uploads when processing errors occur.
- Why: A valid uploaded conversation reached OpenAI but failed because optional or empty model fields did not match the strict lead schema; failed uploads also remained stuck in processing.
- Validation: TypeScript, ESLint, diff check, and production Webpack build passed after the change.
- Limitations: AI output still depends on the configured OpenAI account and model availability; archives without media cannot produce voice transcripts.

## 2026-10-11T02:16:00+05:30 — Accept standard WhatsApp chat filenames and audio attachments

- Changed: Accepted both `chat.txt` and `_chat.txt` in upload and processing routes, recognized standard `(file attached)` message filenames, and restricted transcription attempts to audio extensions.
- Why: A valid WhatsApp export with `chat.txt` was rejected because the parser only accepted `_chat.txt`; this also prepares full media exports for voice-note processing.
- Validation: TypeScript, ESLint, diff check, production Webpack build, and the supplied ZIP structure were checked.
- Limitations: The supplied ZIP has no audio binaries, so voice transcription cannot be verified against that archive.

## 2026-10-11T02:07:00+05:30 — Show the current workspace account

- Changed: Replaced the hardcoded workspace sidebar founder label with the authenticated profile name, initials, and Admin or Client role label.
- Why: Prevent every workspace user from seeing the starter account name and make the active account clear.
- Validation: TypeScript, ESLint, diff check, and the production Webpack build passed.
- Limitations: The profile name comes from the Supabase profile or auth metadata and falls back to the email prefix when no name is available.

## 2026-10-11T02:04:18+05:30 — Fix Google account selection and signed-in header

- Changed: Added the Google OAuth `select_account` prompt and made the landing header load the current Supabase profile name and role-aware destination.
- Why: Prevent Google from silently reusing another browser account and make the signed-in state visible to users.
- Validation: TypeScript, ESLint, `git diff --check`, and the production Webpack build passed.
- Limitations: Google account selection still depends on the provider being enabled and the callback URL being registered in Supabase and Google Cloud.

## 2026-10-11T00:52:00+05:30 — Use Webpack for local development

- Changed: Updated `npm run dev` to use `next dev --webpack`.
- Why: The default Turbopack worker crashes with an access-denied error on this Windows environment while compiling the global CSS; the Webpack dev server renders the app correctly.
- Validation: Local signup page and the production-compatible CSS rendering were verified with Webpack mode.
- Limitations: Turbopack remains available through the direct Next command but is not the project's default development mode.

## 2026-10-11T00:46:30+05:30 — Verify local auth configuration

- Changed: Corrected the local Supabase URL from an accidentally duplicated anon JWT, added visible Google OAuth error handling, and documented the required Supabase URL/key distinction and Google provider setup.
- Why: The local auth client rejected the invalid URL before signup or OAuth could run. The configured Supabase project currently has Google OAuth disabled.
- Validation: Supabase auth settings returned HTTP 200; local routes and production checks passed earlier. Google authorization correctly reports a 400 while the provider is disabled.
- Limitations: A real email signup still requires an inbox that can receive Supabase's verification email. Google OAuth requires provider credentials configured in Supabase and Google Cloud.

## 2026-10-11T00:24:24+05:30 — Fix production CSS bundle

- Changed: Added Tailwind's PostCSS adapter and production stylesheet configuration.
- Why: The deployed Webpack build emitted Tailwind's base styles but omitted utility classes, leaving the production page unstyled while development remained styled through Turbopack.
- Validation: `node node_modules/typescript/bin/tsc --noEmit`, ESLint, and `next build --webpack` passed; the generated CSS now contains utility selectors.
- Limitations: Visual verification was performed against the deployed page and local production build; external service behavior remains credential-dependent.

## 2026-10-11T00:07:22+05:30 — Verify upload processing foundation

- Changed: Connected the landing upload control to the API, added WhatsApp message parsing and private export storage, implemented the Whisper/GPT processing path with schema validation, and fixed dynamic lead-route prerendering.
- Why: Complete the first end-to-end foundation described in the build brief while keeping credentials outside the repository.
- Validation: `npm run typecheck`, `npm run lint`, and `npm run build` passed. External Supabase/OpenAI calls were not run without credentials.
- Limitations: Dashboard reads still use preview data; external integrations need a configured Supabase project and OpenAI key.

## 2026-10-11T00:04:37+05:30 — Build Loopin production foundation

- Changed: Added the UI kit-inspired landing/upload page, auth flows, protected route middleware, Supabase browser/server clients, profiles/leads/uploads schema with RLS and private storage bucket, upload/process/leads API routes, follow-up dashboard, leads pipeline, lead detail editor, settings, error/404 pages, shared types, environment example, and production dependencies.
- Why: Turn the starter into the first production-ready Loopin application foundation described in the supplied build brief.
- Validation: `npm run typecheck` and `npm run lint` passed.
- Limitations: Supabase and OpenAI behavior requires credentials. Dashboard screens use preview data until database reads are connected.

## 2026-10-11T00:59:42+05:30 — Add protected admin console

- Changed: Added server-side admin authorization, a service-role Supabase client, responsive admin navigation, overview/users/leads/uploads pages, admin promotion SQL, and `/admin` middleware protection. Updated README setup instructions.
- Why: Provide a real operations surface for monitoring Loopin accounts and processing activity instead of returning a 404 at `/admin`.
- Validation: `node node_modules/typescript/bin/tsc --noEmit`, `node node_modules/eslint/bin/eslint.js`, `git diff --check`, and `node node_modules/next/dist/bin/next build --webpack` passed. The production build reports all four admin routes as partial-prerendered.
- Limitations: The Supabase schema must be applied, an account must sign up, and `supabase/promote-admin.sql` must be run before the first admin login. No admin password or credential was created by the code change.

## 2026-10-11T01:14:36+05:30 — Scope workspace data by user role

- Changed: Replaced seeded workspace leads with authenticated Supabase queries, added user-scoped lead mapping and empty states, routed admin logins and OAuth callbacks to `/admin`, and blocked admins from regular workspace routes.
- Why: Prevent admin sessions from opening client preview data and ensure each regular user sees only leads created or uploaded in their own workspace.
- Validation: `node node_modules/typescript/bin/tsc --noEmit`, `node node_modules/eslint/bin/eslint.js`, `git diff --check`, and `node node_modules/next/dist/bin/next build --webpack` passed.
- Limitations: End-to-end role behavior requires the Supabase schema, authenticated profiles, and real lead rows in the configured project.

## 2026-10-11T01:19:00+05:30 — Render admin overview for admin sessions

- Changed: Added a server-side role check to the follow-ups route so an admin session renders the admin overview and usage insights even when the browser opens `/followups` directly.
- Why: Avoid showing the regular empty workspace to administrators when a stale tab or dev session bypasses the login redirect.
- Validation: TypeScript, ESLint, diff check, and the production Webpack build passed after the role-aware route change.
- Limitations: The browser must be restarted or refreshed to load the latest local code.

## 2026-10-11T01:23:39+05:30 — Require sign-in before uploads

- Changed: Kept the landing-page `Browse files` button visible for everyone, but added an authentication check before opening the picker or accepting a dropped file. Anonymous visitors are sent to login, while `/api/upload` and `/api/process` continue enforcing authentication server-side.
- Why: Prevent visitors from selecting or attempting to upload WhatsApp exports before they have a private workspace.
- Validation: TypeScript, ESLint, diff check, and `next build --webpack` passed.
- Limitations: The landing page still shows illustrative example cards; those cards are not user data and cannot be uploaded.

## 2026-10-11T01:33:55+05:30 — Apply engagement classification rules

- Changed: Added the detailed `price_only`, `engaged_evaluating`, and `unclear` rules to the AI prompt; enforce priority server-side; calculate explicit or default follow-up dates; store `engagement_reason`; and show reasons, pattern labels, and real date groups in the follow-up dashboard. Added the existing-database migration SQL.
- Why: Make classification and follow-up urgency match the requested sales behavior instead of relying on unvalidated model output.
- Validation: TypeScript, ESLint, diff check, and `next build --webpack` passed.
- Limitations: Existing Supabase projects must run `supabase/add-engagement-reason.sql` before processing new uploads. AI classification remains dependent on the quality of the exported conversation.

## 2026-10-10T23:04:57+05:30 — Record solo participant

- Changed: Replaced the README team placeholder with the supplied name, GitHub handle, and email; completed the participant row in `SUBMISSION.md` with the name, handle, and contribution.
- Why: Make project and submission records reflect the solo participant details.
- Validation: Reviewed the documentation diff; no application checks run.
- Limitations: Repository URL and final submitted commit remain to be filled in later.

## 2026-10-10T23:01:01+05:30 — Add Loopin project details

- Changed: Replaced generic starter copy with Loopin's purpose and human-led messaging policy. Updated project overview, planned stack and integrations, run/demo details, and submission description. Marked proposed integrations as planned rather than implemented.
- Why: Reflect the supplied project context in the existing starter without implementing product features.
- Validation: No feature checks run; content-only update as requested.
- Limitations: WhatsApp import, transcription, extraction, persistence, follow-ups, and lead views remain unimplemented.

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
