# AI usage record

Use Codex during the hackathon and briefly document its actual contribution here. Add a row after each meaningful task or milestone. Keep summaries concise and omit secrets, private data, and full chat transcripts.

## Event build log

| 2026-10-11T08:08:00+05:30 | Codex | Fix Next.js unstable new Date() client prerender error | Replaced dynamic `new Date().getFullYear()` with static `2026` in `src/app/page.tsx` footer, and deferred date calculation into `useEffect` in `src/components/app-shell.tsx` to eliminate Next.js prerender warnings on route `/`. | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T08:04:00+05:30 | Codex | Remove hardcoded demo data and dynamically handle real leads and empty states | Removed hardcoded `demoLeads` from `src/lib/leads.ts` and `src/components/followups-view.tsx`. Updated followups view and KPI metrics to compute dynamically from actual user leads in Supabase, displaying clean empty states when no data is present and the full table view when leads exist. Updated `AppShell` with live date and real lead count. | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T07:55:00+05:30 | Codex | Overhaul dashboard follow-ups UI to match Figma design | Rebuilt `FollowupsView` and `AppShell` with desktop search bar with `Ctrl K`, Thu 9 Oct 2026 date indicator, user profile dropdown, Pro Plan progress card, 4 stat cards with SVG sparkline wave charts, interactive expandable accordion sections for Today (5), Tomorrow (3), This week (7), Later (12) with table headers, styled priority badges with flame icon for High, and rich demo data fallback. | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T07:40:00+05:30 | Codex | Increase logo size across all views | Increased default Logo component size to `h-10 sm:h-11` in `src/components/app-shell.tsx`, login/signup logo to `h-12 sm:h-14` in `src/components/auth-form.tsx`, and 404 page logo to `h-11` in `src/app/not-found.tsx`. | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T07:35:00+05:30 | Codex | Replace logo across application with Loopin Infinity Logo | Updated `src/components/app-shell.tsx` to render `/images/Loopin Infinity Logo.png` with support for light/dark themes across navbar, footer, sidebar, auth forms, admin console, and 404 page. | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T07:16:40+05:30 | Codex | Enable instant workspace redirect on signup without manual verification | Updated `src/components/auth-form.tsx` to automatically redirect users to `/followups` upon signup when Supabase returns an active session or auto-signs in. | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T07:10:00+05:30 | Codex | Implement minimal SaaS-level structured footer | Replaced single-line footer with minimal 4-column SaaS footer including operational badge, Product/Intelligence/Workspace links, and copyright sub-bar in `src/app/page.tsx`. | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T07:05:00+05:30 | Codex | Update hero badge to human-led sales tagline | Updated badge text in `src/app/page.tsx` to "100% Human-led sales intelligence for WhatsApp". | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T06:56:30+05:30 | Codex | Format hero headline to balance across two lines | Adjusted line break position in `src/app/page.tsx` so line 1 is "Never let a WhatsApp" and line 2 is "lead go cold." for balanced line lengths. | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T06:53:20+05:30 | Codex | Reduce hero headline size and format to two lines | Reduced `<h1>` font size to `text-3xl sm:text-4xl lg:text-[46px]` and added a block-level break so the headline fits cleanly on two lines in `src/app/page.tsx`. | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T06:50:00+05:30 | Codex | Add visual WhatsApp chat and voice note illustration to hero showcase | Added glassmorphic incoming chat mockup with WhatsApp icon, text skeleton, voice waveform pill, and curved arrow pointing down into extracted lead card in `src/app/page.tsx`. | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T06:44:00+05:30 | Codex | Remove competitor brand name from landing copy | Replaced competitor brand name Wati in `src/app/page.tsx` with generic, brand-agnostic positioning; updated hero headline to "Never let a WhatsApp lead go cold." | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T06:37:00+05:30 | Codex | Enhance landing page UI with positioning and interactive FAQ | Revamped `src/app/page.tsx` with sharp product copy, hot vs low priority preview cards, 3-step workflow, and interactive FAQ accordion covering bots vs humans, regional voice notes, and 100% human-led drafting while preserving upload functionality. | Pending | TypeScript check (`tsc --noEmit`) passed with 0 errors. |

| 2026-10-11T04:14:13+05:30 | Codex | Clean up processed WhatsApp exports | Added background successful-processing cleanup for the private Supabase Storage ZIP while preserving the uploads history row and generated lead in `src/app/api/process/route.ts`; documented retry behavior. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |

| 2026-10-11T05:42:00+05:30 | Codex | Translate Malayalam voice notes into English | Switched the default audio path to OpenAI English translation for Malayalam and mixed Malayalam-English notes, with an optional original-language transcription mode in `src/app/api/process/route.ts` and `.env.local.example`. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |

| 2026-10-11T05:20:00+05:30 | Codex | Tune transcription for Malayalam-first mixed speech | Added Malayalam language guidance, verbatim mixed-language instructions, and the configurable `WHATSAPP_TRANSCRIPTION_LANGUAGE` environment variable in `src/app/api/process/route.ts` and `.env.local.example`. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |

| 2026-10-11T04:55:00+05:30 | Codex | Build a five-second conversation overview | Added OpenAI document summaries, replaced attachment filenames with voice/document content markers, and tightened the lead summary prompt and detail rendering in `src/app/api/process/route.ts` and `src/components/lead-detail-view.tsx`. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |

| 2026-10-11T04:25:00+05:30 | Codex | Display saved WhatsApp and voice-note transcripts | Replaced the lead-detail placeholder with a chronological transcript renderer that shows each full saved voice transcription below its original message in `src/components/lead-detail-view.tsx`. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |

| 2026-10-11T04:05:00+05:30 | Codex | Prevent founder names from becoming client leads | Added profile-aware sender direction for voice notes, client-author fallback naming, and saved the holistic context fields during processing in `src/app/api/process/route.ts`. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |

| 2026-10-11T03:35:00+05:30 | Codex | Extract holistic client context | Expanded the processing prompt and lead schema for business need, concerns, buying signals, sentiment, and evidence-based follow-ups; added the Supabase migration and lead detail display. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |

| 2026-10-11T03:12:00+05:30 | Codex | Add live processing progress and concurrent transcription | Added `uploads.progress` fields and status polling, a progress UI, and bounded four-at-a-time voice transcription in `src/app/api/process/route.ts`, `src/app/api/upload/status/route.ts`, `src/app/page.tsx`, and Supabase migration docs. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |

| 2026-10-11T03:18:00+05:30 | Codex | Preserve completion on older upload schemas | Kept the final upload status update compatible when the progress migration has not yet been applied. | Pending | TypeScript, ESLint, and diff check passed. |

| 2026-10-11T02:58:00+05:30 | Codex | Normalize WhatsApp Opus voice notes | Confirmed the supplied voice file begins with the Ogg container signature, then updated `src/app/api/process/route.ts` to send `.opus` bytes as supported `.ogg` audio and continue when an individual note fails. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |

| 2026-10-11T02:46:00+05:30 | Codex | Accept custom WhatsApp chat filenames | Added ZIP text-file discovery and readable-message validation so media exports with names such as `WhatsApp Chat with Dipin Aicura.txt` can reach processing; updated upload/process routes and README. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |

| 2026-10-11T02:34:49+05:30 | Codex | Add exact upload diagnostics | Added request-scoped error responses, browser/terminal logging, and persisted safe upload failure details for Supabase/admin inspection in `src/lib/api.ts`, `src/app/api/upload/route.ts`, `src/app/api/process/route.ts`, and `src/app/page.tsx`; documented the behavior in `README.md`. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |

| 2026-10-11T02:28:00+05:30 | Codex | Harden AI extraction and failed-upload handling | Added response normalization, safe validation diagnostics, and failed status updates in `src/app/api/process/route.ts` after reproducing the supplied archive’s schema mismatch. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed; live OpenAI processing still needs a retry with the configured key. |

| 2026-10-11T02:16:00+05:30 | Codex | Make WhatsApp import compatible with standard exports | Updated chat filename detection, attachment parsing, audio filtering, and import documentation in `src/lib/whatsapp.ts`, `src/app/api/upload/route.ts`, and `src/app/api/process/route.ts`. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed; the supplied archive has no audio binaries for end-to-end transcription validation. |

| 2026-10-11T02:07:00+05:30 | Codex | Make the workspace identity user-specific | Replaced the hardcoded sidebar founder identity with authenticated profile name, initials, and Admin or Client role data in `src/components/app-shell.tsx`; updated setup documentation. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |

| 2026-10-11T02:04:18+05:30 | Codex | Fix Google account selection and signed-in landing header | Added the Google `select_account` OAuth parameter and role-aware profile loading in `src/components/auth-form.tsx` and `src/app/page.tsx`. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed; Google provider configuration remains external. |

The table below records participant AI usage during the event. Mark human review as pending until someone has reviewed the contribution.

| Date and time with timezone | Tool / model, if known | Task | Assistance and affected files | Human review / corrections | Validation and result |
| --- | --- | --- | --- | --- | --- |
| 2026-10-11T00:52:00+05:30 | Codex | Make local development reliable on Windows | Changed the `dev` script to use Webpack after reproducing the Turbopack CSS worker access-denied failure. | Pending | Webpack dev server rendered the signup page successfully. |
| 2026-10-11T00:59:42+05:30 | Codex | Build the protected admin console | Added server-only admin authorization, service-role aggregate reads, admin navigation and overview/users/leads/uploads pages, middleware protection, and `supabase/promote-admin.sql`; documented the setup in README. | Pending | TypeScript, ESLint, diff check, and `next build --webpack` passed. Human must apply the schema, create/sign in the chosen account, and run the promotion SQL. |
| 2026-10-11T01:14:36+05:30 | Codex | Separate admin and regular workspace data | Replaced preview lead data in workspace pages with authenticated Supabase reads, added per-user lead mapping and empty states, role-aware login/OAuth redirects, and middleware protection for admin routes. | Pending | TypeScript, ESLint, diff check, and `next build --webpack` passed. Live role and RLS behavior still needs verification with two Supabase accounts. |
| 2026-10-11T01:19:00+05:30 | Codex | Make the follow-ups route role-aware | Added a server-side admin role check so administrators see the admin overview and aggregate insights even if `/followups` is opened directly. | Pending | TypeScript, ESLint, diff check, and production Webpack build passed. |
| 2026-10-11T01:23:39+05:30 | Codex | Gate uploads behind authentication | Added a sign-in guard before opening the landing upload picker or accepting a drop, while keeping the `Browse files` button visible; documented that the upload and processing APIs require an authenticated user. | Pending | TypeScript, ESLint, diff check, and `next build --webpack` passed. |
| 2026-10-11T01:33:55+05:30 | Codex | Implement engagement classification and follow-up rules | Added the requested classification prompt, server-side priority/date normalization, engagement reason persistence, date-based follow-up groups, and reason/pattern display in the workspace. | Pending | TypeScript, ESLint, diff check, and `next build --webpack` passed. Human should run the Supabase migration and review classifications on real exports. |
| 2026-10-11T00:46:30+05:30 | Codex | Verify local signup and Google OAuth configuration | Validated the local environment without printing secrets, identified the Supabase URL/JWT mix-up, corrected `.env.local`, checked Supabase auth settings, and added Google error feedback in `src/components/auth-form.tsx`. | Pending | Supabase auth settings returned HTTP 200. Email auth is enabled; Google provider is disabled until configured. |
| 2026-10-11T00:24:24+05:30 | Codex | Diagnose and fix missing production CSS | Compared the deployed and local renderings, traced the missing utilities to the Webpack/Tailwind integration, and added `postcss.config.mjs` plus `@tailwindcss/postcss`. | Pending | TypeScript, ESLint, and `next build --webpack` passed. The production CSS artifact contains Tailwind utility selectors. |
| 2026-10-11T00:07:22+05:30 | Codex | Verify the Loopin production foundation | Connected landing upload to the API contract, added WhatsApp parsing/storage and Whisper/GPT processing logic, and fixed the dynamic lead route for static prerendering. | Pending | `npm run typecheck`, `npm run lint`, and `npm run build` passed. External Supabase/OpenAI calls were not run without credentials. |
| 2026-10-11T00:04:37+05:30 | Codex | Build Loopin production foundation from the supplied brief and UI reference | Added the Loopin landing/upload UI, auth screens, Supabase clients and middleware, schema/RLS, API routes, dashboard pages, shared lead types, error pages, environment example, and production dependency setup. | Pending | TypeScript and ESLint passed. External-service behavior needs configured credentials and a Supabase project. |
| 2026-10-10T23:04:57+05:30 | Codex | Record solo participant details | Updated README with the supplied name, GitHub handle, and email; updated the SUBMISSION participant table with the name, handle, and contribution. | Pending | Documentation diff reviewed; no application checks run. |
| 2026-10-10T23:01:01+05:30 | Codex | Apply Loopin project context to the starter | Updated the homepage copy, metadata, README, and submission details to describe Loopin and distinguish planned integrations from implemented starter behavior. No feature integrations added. | Pending | No feature checks run; this was a content-only update as requested. |
| 2026-10-10T22:42:19+05:30 | Codex | Set up a production-ready Next.js project starter | Generated the App Router starter, pinned Next.js dependencies, added runtime and type-check scripts, updated metadata and setup docs, and added the project change log entry. Replaced build-time Google Fonts with system fonts and configured Webpack for production builds. | Pending | `npm ci --allow-remote=all`, `npm run lint`, `npm run typecheck`, and `npm run build` passed. |

## Template preparation

On 10 October 2026, Codex prepared this documentation template from the organizer's supplied rules and checked the linked Luma page for the event name and dates. This covered `README.md`, `RULES.md`, `AGENTS.md`, `CHANGELOG.md`, `AI_USAGE.md`, `SUBMISSION.md`, `.gitignore`, and the pull request checklist. Agent validation covered local links, event consistency, required documents, and diff whitespace; organizer review is pending.

This preparation is separate from participant project implementation and participant AI usage during the event.
