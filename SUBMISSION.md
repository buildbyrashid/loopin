# Project submission

Complete this file during the hackathon and use it to prepare your submission through the method announced by the organizers. Do not submit your project to the template repository.

## Project

- **Project name:** Loopin
- **Short description:** Loopin is a WhatsApp-first AI sales CRM that turns exported chats and voice notes into lead summaries and human-reviewed follow-up suggestions.
- **Code repository URL:** https://github.com/buildbyrashid/loopin
- **Final submitted implementation commit SHA:** 4b88e62
- **Working demo URL or local demo steps:** Copy `.env.local.example` to `.env.local`, run `npm ci --allow-remote=all`, then `npm run dev` and open <http://localhost:3000>. Auth and data processing require Supabase/OpenAI credentials.
- **Demo access requirements:** Local demo requires Node.js 20.9+, npm, and a configured Supabase project. Upload processing additionally requires an OpenAI API key. Use local environment variables; no credentials are stored in the repository.

## Participants

Participate solo or in a team of up to 4. Remove unused rows.

| Participant name | GitHub handle | Contribution |
| --- | --- | --- |
| Mohammed Rashid | buildbyrashid | Product design, Next.js implementation, Supabase schema/API integration, documentation, and submission preparation |

## Run and demonstrate

- **Prerequisites and versions:** Node.js 20.9 or newer; npm.
- **Install command:** `npm ci --allow-remote=all`
- **Required environment variable names:** `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY`, `NEXT_PUBLIC_SITE_URL`.
- **Start command:** `npm run dev` (local development); `npm run build` then `npm run start` (production mode).
- **Demo walkthrough:** View the landing/upload page, sign in or create an account, open Follow-ups, browse the Leads pipeline, open a lead detail page, edit a follow-up draft, and visit Settings. Upload processing requires configured services.
- **Checks performed and results:** `npm ci --allow-remote=all --no-audit --no-fund`, `npm run lint`, `npm run typecheck`, and `npm run build` passed.
- **Known limitations or incomplete features:** Dashboard cards currently use preview data until database fetching is connected. Auth, storage, transcription, and AI extraction require configured external services. The production build uses Webpack because this environment blocks Turbopack worker processes.
- **Libraries, APIs, and public datasets used:** Next.js 16.4.0, React 19.3.0, TypeScript, Tailwind CSS 4, Supabase SSR/Postgres/Storage, OpenAI Whisper and GPT, JSZip, Zod, React Hook Form, Sonner, and Lucide React. Starter source: [Next.js create-next-app documentation](https://nextjs.org/docs/app/api-reference/cli/create-next-app). No public dataset is used.
- **AI usage record:** [AI_USAGE.md](AI_USAGE.md)
- **Development change log:** [CHANGELOG.md](CHANGELOG.md)

## Submission checklist

- [ ] The project implementation started from scratch at the event.
- [ ] I participated solo or with no more than 4 team members in total.
- [ ] Codex was used during development and its usage is documented.
- [ ] The code repository URL, short description, and working demo are provided.
- [ ] README setup and demo instructions match the submitted code.
- [ ] Actual checks and known limitations are documented.
- [ ] Meaningful changes are documented and committed throughout development.
- [ ] The final implementation is committed and pushed, and its SHA is recorded above.
- [ ] No credentials or private data are included in the repository or demo instructions.
- [ ] The organizers' announced submission method and timing have been followed.

Event reference: [DevDay Exchange Community: Kochi on Luma](https://luma.com/z10nz8gp). The event wraps up by **10:00 AM IST on 11 October 2026**.
