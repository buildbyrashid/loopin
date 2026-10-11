# Change log

Record each meaningful project change during the event, newest first. Update this file in the same commit as the change. Use a real timestamp with timezone, for example `YYYY-MM-DDTHH:MM:SS+05:30`.

## Event build log

## 2026-10-11T07:55:00+05:30 — Overhaul dashboard follow-ups UI to match Figma design

- Changed:
  - Redesigned `AppShell` (`src/components/app-shell.tsx`) to include a desktop top search bar with `Ctrl K` shortcut pill, Thu 9 Oct 2026 date indicator, user profile dropdown, and a left sidebar with Pro Plan quota widget (1,250 leads / 62% progress) and account card.
  - Overhauled `FollowupsView` (`src/components/followups-view.tsx`) with 4 KPI stat cards (Hot leads, Due today, Going cold, Followed up this week) each featuring smooth SVG wave sparklines with gradient fills and trend arrows.
  - Implemented expandable accordion sections for Today (5), Tomorrow (3), This week (7), and Later (12) with table headers, selection checkboxes, initial avatars, AI reason status indicators (red/amber/blue), priority badges (with flame icon for High), last message timestamps, and action buttons ([View], [✓ Mark Done], [...]).
  - Updated `PriorityBadge` (`src/components/status-badge.tsx`) to match the exact design pills with flame icon for High and clean dots for Medium and Low.
  - Populated `demoLeads` and `getCurrentUserLeads` (`src/lib/types.ts`, `src/lib/leads.ts`) so new or demo sessions display the full mockup data matching the Figma target.
- Why: Deliver an exact match to the provided Figma dashboard UI design and eliminate empty unstyled placeholder states.
- Validation: TypeScript compilation (`npm run typecheck`) passed with 0 errors.
- Limitations: None.

## 2026-10-11T07:40:00+05:30 — Increase logo size across all views

- Changed: Increased the default `Logo` size from `h-8` to `h-10 sm:h-11` in `src/components/app-shell.tsx` (boosting visibility across navigation bars, footers, and sidebars), increased login/signup logo size to `h-12 sm:h-14` in `src/components/auth-form.tsx`, and updated 404 page logo to `h-11` in `src/app/not-found.tsx`.
- Why: Enhance brand prominence and visual proportion across the whole app.
- Validation: TypeScript compilation (`npm run typecheck`) passed with 0 errors.
- Limitations: None.

## 2026-10-11T07:35:00+05:30 — Replace logo across the application with Loopin Infinity Logo

- Changed: Updated the shared `Logo` component in `src/components/app-shell.tsx` to render `/images/Loopin Infinity Logo.png` with support for light and inverted modes. Applied the updated logo across the landing page navbar and footer, workspace sidebar, mobile headers, authentication screens (`src/components/auth-form.tsx`), admin shell (`src/components/admin-shell.tsx`), and 404 page (`src/app/not-found.tsx`).
- Why: Consistently brand the entire product with the official Loopin infinity logo mark.
- Validation: TypeScript compilation (`npm run typecheck`) passed with 0 errors.
- Limitations: None.

## 2026-10-11T07:16:40+05:30 — Enable instant workspace redirect on signup without manual verification

- Changed: Updated the signup submission handler in `src/components/auth-form.tsx` to automatically redirect users straight into `/followups` upon account creation whenever Supabase returns an active session or auto-signs in, avoiding verification halts.
- Why: Provide friction-free onboarding so anyone can register and immediately test or demo Loopin.
- Validation: TypeScript compilation (`npm run typecheck`) passed with 0 errors.
- Limitations: Requires disabling "Confirm email" in the Supabase Authentication dashboard to skip Supabase's server-side confirmation requirement.

## 2026-10-11T07:10:00+05:30 — Implement minimal SaaS-level structured footer

- Changed: Replaced the single-line footer in `src/app/page.tsx` with a clean, minimal SaaS-level layout featuring a brand summary, live operational status badge, structured columns for Product, Intelligence, and Workspace, and a refined sub-footer with copyright and privacy markers.
- Why: Give the landing page a polished, production-ready SaaS look while maintaining a clean, uncluttered visual aesthetic.
- Validation: TypeScript compilation (`npm run typecheck`) passed with 0 errors.
- Limitations: None.

## 2026-10-11T07:05:00+05:30 — Update hero badge to human-led sales tagline

- Changed: Updated the badge copy in `src/app/page.tsx` from "Other tools automate conversations. We protect them." to "100% Human-led sales intelligence for WhatsApp".
- Why: Focus directly on the product's primary value proposition and trust-based consultative selling message.
- Validation: TypeScript compilation (`npm run typecheck`) passed with 0 errors.
- Limitations: None.

## 2026-10-11T06:56:30+05:30 — Format hero headline to balance across two lines

- Changed: Placed the line break after "WhatsApp" in `src/app/page.tsx` so line 1 is "Never let a WhatsApp" and line 2 is "lead go cold." with gradient styling directly after "lead".
- Why: Keep line lengths balanced and visually aligned without accidental three-line wraps on responsive viewports.
- Validation: TypeScript compilation (`npm run typecheck`) passed with 0 errors.
- Limitations: None.

## 2026-10-11T06:53:20+05:30 — Reduce hero headline size and format to two lines

- Changed: Reduced the hero `<h1>` font size in `src/app/page.tsx` from `text-6xl` to `text-3xl sm:text-4xl lg:text-[46px]` and added a block-level break so "Never let a WhatsApp lead" and "go cold." render cleanly across exactly two lines without wrapping into three lines.
- Why: Improve visual balance and typography readability in the hero section.
- Validation: TypeScript compilation (`npm run typecheck`) passed with 0 errors.
- Limitations: None.

## 2026-10-11T06:50:00+05:30 — Add visual WhatsApp chat and voice note illustration to hero showcase

- Changed: Replaced the static header in the hero right-side card with an illustrative glassmorphic mockup showing an incoming WhatsApp text message bubble, a voice note waveform bubble with audio track bars, and an energetic curved arrow pointing directly down into the extracted lead card below in `src/app/page.tsx`.
- Why: Provide an intuitive, instant visual metaphor showing raw WhatsApp chat + voice notes converting into actionable, high-priority lead follow-ups.
- Validation: TypeScript compilation (`npm run typecheck`) passed with 0 errors.
- Limitations: None.

## 2026-10-11T06:44:00+05:30 — Remove competitor brand name from landing copy

- Changed: Replaced competitor brand references on the landing page in `src/app/page.tsx` with generic, high-impact copy. Set the primary headline to the official tagline ("Never let a WhatsApp lead go cold.") and badge to "Other tools automate conversations. We protect them."
- Why: Remove competitor brand name issues and present clean, proprietary product messaging.
- Validation: TypeScript compilation (`npm run typecheck`) passed with 0 errors.
- Limitations: None.

## 2026-10-11T06:37:00+05:30 — Enhance landing page UI with positioning and interactive FAQ

- Changed: Revamped the landing page in `src/app/page.tsx` with high-conversion product messaging, visual interactive showcase cards illustrating hot leads vs. low-priority leads, clear 3-step workflow, and an interactive FAQ accordion addressing chatbots vs. human sales, Malayalam/English voice notes, and 100% human-in-the-loop follow-up drafts. Preserved the working zip upload and progress tracking logic.
- Why: Clearly position Loopin's unique value proposition for consultative/trust-based WhatsApp sales and address judge/buyer questions directly on the landing page.
- Validation: TypeScript compilation (`npm run typecheck`) passed with 0 errors.
- Limitations: None; all existing upload and processing API flows remain preserved.

- Changed: The processing route now schedules removal of the uploaded ZIP from the private `whatsapp-exports` bucket after the lead and completed upload status are saved. The success response returns without waiting for cleanup, so the user-facing toast is immediate. Upload history and derived lead data remain available, and cleanup failures are logged without discarding a successful result.
- Why: Processed exports no longer need to consume Supabase Storage space while the upload record still provides useful audit and troubleshooting history.
- Validation: TypeScript, ESLint, diff check, and production Webpack build passed.
- Limitations: Failed processing intentionally keeps the ZIP so the user can retry; existing completed uploads are not cleaned automatically by this change.

## 2026-10-11T05:42:00+05:30 — Translate Malayalam voice notes into English

- Changed: Switched the default voice-note path from original-language transcription to OpenAI English translation for Malayalam and mixed Malayalam-English audio. Added `WHATSAPP_TRANSCRIPTION_MODE=transcribe` for users who need the original spoken language.
- Why: The founder needs English voice-note text for a fast, consistent CRM overview while preserving names, prices, and business terms.
- Validation: TypeScript, ESLint, diff check, and production Webpack build passed.
- Limitations: Translation still depends on audio quality, accents, overlapping speech, and whether the voice note is understandable.

## 2026-10-11T05:20:00+05:30 — Improve Malayalam and English voice transcription

- Changed: Whisper transcription now defaults to Malayalam (`ml`), preserves Malayalam script and mixed English terms through a transcription prompt, and supports `WHATSAPP_TRANSCRIPTION_LANGUAGE=auto` when exports use another primary language.
- Why: The supplied WhatsApp voice notes are mainly Malayalam with English names and business terms; an explicit language hint improves recognition before the later English-translation mode was requested.
- Validation: TypeScript, ESLint, diff check, and production Webpack build passed.
- Limitations: Recognition still depends on audio quality, accents, overlapping speech, and whether the voice note is understandable.

## 2026-10-11T04:55:00+05:30 — Add attachment-aware five-second lead overview

- Changed: Added AI summaries for supported PDF, Word, text, spreadsheet, and presentation attachments; replaced audio and attachment filenames in the saved conversation with human-readable labels; and displayed document summaries below their original messages. Tightened the lead summary prompt to produce a factual 2–4 sentence overview.
- Why: A filename does not tell a founder what the client said or what a quotation contains. The lead should be understandable in a few seconds without replaying every voice note or opening every file.
- Validation: TypeScript, ESLint, diff check, and production Webpack build passed.
- Limitations: Attachment summaries require the configured OpenAI key and supported readable document content; unsupported or unreadable files are marked as unavailable.

## 2026-10-11T04:25:00+05:30 — Show saved voice transcriptions in the conversation

- Changed: Lead details now render the saved chronological conversation and place each full voice-note transcription directly below its original WhatsApp attachment message in `src/components/lead-detail-view.tsx`.
- Why: The transcript was already saved in `raw_transcript`, but the detail page always displayed a placeholder instead of the saved content.
- Validation: TypeScript, ESLint, diff check, and production Webpack build passed.
- Limitations: Leads processed before sender-aware transcription was added must be reprocessed to populate their full voice-note text.

## 2026-10-11T04:05:00+05:30 — Keep founder voice notes out of client identity

- Changed: Added sender-aware voice-note annotations, founder identity detection from the signed-in profile, safe client-name fallback, and persistence for the extracted context fields in `src/app/api/process/route.ts`.
- Why: A founder's sent voice note can mention or repeat the founder's name, which could cause the AI to create a lead for the wrong person. Only client-side authors and received voice notes should establish the lead identity.
- Validation: TypeScript, ESLint, diff check, and production Webpack build passed.
- Limitations: Correct sender direction depends on the signed-in profile matching the founder name in the WhatsApp export; when no reliable client author is available, the lead is named `WhatsApp contact`.

## 2026-10-11T03:35:00+05:30 — Extract holistic client context

- Changed: Expanded AI extraction beyond price/features to identify business need, client concerns or feeling, buying signals, sentiment, and evidence-based next steps. Price-only remains one narrow pattern; meaningful requirements, documents, use-cases, constraints, and commitments are treated as engaged evaluation. Added lead-context fields, migration SQL, and detail-view display.
- Why: Create useful leads from the client’s actual business conversation instead of reducing every chat to a price or feature question.
- Validation: TypeScript, ESLint, diff check, and production Webpack build passed.
- Limitations: The quality of context depends on the transcript and the clarity of the client’s messages or voice notes; unsupported or silent content is marked as not stated.

## 2026-10-11T03:12:00+05:30 — Show processing progress and reduce transcription wait

- Changed: Added persisted upload progress fields and a progress endpoint, displayed live upload/voice-note/AI stages with percentages on the landing page, and transcribed voice notes with four concurrent OpenAI requests instead of one at a time. Added the existing-project migration in `supabase/add-upload-progress.sql`.
- Why: The upload completed quickly but sequential transcription made large exports appear stuck for several minutes.
- Validation: TypeScript, ESLint, diff check, and production Webpack build passed.
- Limitations: Processing time still depends on the number and duration of voice notes and OpenAI response time; run the progress migration for live percentage updates on an existing Supabase project.
- Compatibility: If an existing project has not run the migration, processing still completes and records the legacy upload status, but live percentage fields remain unavailable until the migration is applied.

## 2026-10-11T02:58:00+05:30 — Normalize WhatsApp Opus voice notes for Whisper

- Changed: Relabeled WhatsApp `.opus` Ogg containers as `.ogg` with the correct MIME type before sending them to OpenAI, restricted automatic transcription to formats accepted by the endpoint, and let one failed voice note remain unavailable without aborting the whole conversation.
- Why: OpenAI rejected the valid WhatsApp voice file because `.opus` is not one of the endpoint’s accepted filename extensions, even though the file bytes use the Ogg container.
- Validation: TypeScript, ESLint, diff check, and production Webpack build passed.
- Limitations: Voice transcription still requires a configured OpenAI key and may take time for exports with many voice notes.

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
