# Loopin

Loopin helps solo founders and small agencies keep WhatsApp leads from going cold by organizing conversations and surfacing follow-ups. The project is being built at the [DevDay Exchange Community Hackathon: Kochi](https://luma.com/z10nz8gp).

**[Event and registration on Luma](https://luma.com/z10nz8gp)** · **[Event rules](RULES.md)** · **[Agent instructions](AGENTS.md)**

## Event details

| Detail | Information |
| --- | --- |
| Venue | JAIN University, Kochi |
| Location | [Open the venue map](https://maps.app.goo.gl/Eme7gR7NDXSNRANu5) |
| Rooms | 2008 and 2009 |
| Check-in | 10 October 2026, 6:00 PM IST |
| Kick-off | 10 October 2026, 6:30 PM IST |
| Wrap-up | 11 October 2026, by 10:00 AM IST |
| Participation | Solo or a team of up to 4 participants |
| Theme | Open — build anything you like |

Keep your approved Luma QR code ready for entry, and bring your laptop and charger. Eligible checked-in participants will receive Codex credits and OpenAI API credits.

## Project workflow

1. Read [RULES.md](RULES.md) and [AGENTS.md](AGENTS.md) before building. Project implementation must start from scratch at the event.
2. Update the project overview as Loopin features are implemented, keeping planned work distinct from working behavior.
3. Record meaningful changes in [CHANGELOG.md](CHANGELOG.md) and Codex usage in [AI_USAGE.md](AI_USAGE.md). Commit after completed milestones.
4. Complete [SUBMISSION.md](SUBMISSION.md) with the repository, short project description, and working demo. Follow submission instructions announced by the organizers.

The project starts from the official Next.js App Router starter, generated with `create-next-app`. The documentation and commit cadence are repository workflow guidance; the event participation rules are in [RULES.md](RULES.md).

## Project overview

- **Project name:** Loopin
- **Short description:** Helps founders keep up with WhatsApp leads by turning exported conversations and voice notes into lead summaries and follow-up reminders, while keeping all sales replies human-led.
- **Team:** Solo — Mohammed Rashid ([buildbyrashid](https://github.com/buildbyrashid)); GitHub email: mhdrashid142@gmail.com.
- **Working demo:** Run the app locally using the commands below. The UI includes the Loopin landing page, auth screens, follow-up dashboard, leads pipeline, lead details, and settings.
- **Technology stack:** Next.js 16.4.0 App Router, React 19, TypeScript, Tailwind CSS 4, Supabase SSR, OpenAI, JSZip, Zod, React Hook Form, Sonner.

The Supabase schema and RLS policies live in [`supabase/schema.sql`](supabase/schema.sql). Supabase storage, Whisper transcription, and GPT extraction are wired in the API routes and require real credentials to run. Tailwind is compiled through the standard PostCSS adapter so production builds include the same utility styles as local development.

### Run the project

Prerequisites: Node.js 20.9 or newer and npm.

```powershell
npm ci --allow-remote=all
npm run dev
```

Open <http://localhost:3000>. Copy `.env.local.example` to `.env.local` and fill the values before using authentication or processing. Development and production use Next.js's Webpack mode for compatibility with constrained worker environments.

Run the project checks and production server with:

```powershell
npm run lint
npm run typecheck
npm run build
npm run start
```

### Current status

- Working features: Responsive Loopin landing/upload UI, auth screens, Supabase session middleware, RLS schema, upload validation and ZIP parsing, OpenAI processing route, follow-up dashboard, leads pipeline, lead detail editor, settings, API error shapes, and custom error/404 pages.
- Known limitations: Real auth, storage, AI processing, and database behavior require a configured Supabase project and OpenAI key. The dashboard uses preview lead data until the data-fetching layer is connected to a populated database.
- Libraries, APIs, and public datasets used: Next.js, React, TypeScript, Tailwind CSS, Supabase SSR/Postgres/Storage, OpenAI Whisper and GPT, JSZip, Zod, React Hook Form, Sonner, and Lucide React. No public dataset is used.

### Supabase setup

1. Create a Supabase project and enable Email/Password under Authentication. Enable Google only after adding its OAuth client ID and secret.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor. This creates profiles, leads, uploads, the private `whatsapp-exports` bucket, and user-scoped RLS policies.
3. Set `NEXT_PUBLIC_SUPABASE_URL` to the project URL (`https://<project-ref>.supabase.co`) and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to the anon JWT. Do not put a JWT in the URL field. Add an OpenAI key to enable Whisper/GPT processing.
4. For Google OAuth, add `${NEXT_PUBLIC_SITE_URL}/auth/callback` to Supabase's redirect URLs and configure the same callback in the Google Cloud OAuth client.

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.
