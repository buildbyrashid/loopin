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
- **Working demo:** Run the starter locally using the commands below. The product workflow is not implemented yet.
- **Technology stack:** Next.js 16.4.0, React 19, TypeScript, Tailwind CSS 4, ESLint.

Planned integrations: Supabase Postgres and Storage, OpenAI Whisper and GPT, `jszip`, and Vercel deployment. These integrations are not implemented in the current starter.

### Run the project

Prerequisites: Node.js 20.9 or newer and npm.

```powershell
npm ci --allow-remote=all
npm run dev
```

Open <http://localhost:3000>. No environment variables are required for the current starter. When the planned integrations are added, the expected variable names are `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `OPENAI_API_KEY`; do not commit secret values. The install flag handles npm 12's default restriction on registry-hosted tarball dependencies; the lockfile pins package integrity. Production builds use Next.js's supported Webpack mode for compatibility with constrained worker environments.

Run the project checks and production server with:

```powershell
npm run lint
npm run typecheck
npm run build
npm run start
```

### Current status

- Working features: Loopin project overview page and production build scripts.
- Known limitations: WhatsApp ZIP parsing, voice-note transcription, GPT extraction, Supabase storage, follow-up reminders, lead views, and Vercel deployment are planned but not implemented.
- Libraries, APIs, and public datasets used: Next.js starter generated with [create-next-app](https://nextjs.org/docs/app/api-reference/cli/create-next-app); current dependencies are Next.js, React, TypeScript, Tailwind CSS, and ESLint. No external API or dataset is currently used.

See [AI_USAGE.md](AI_USAGE.md) for AI assistance and [CHANGELOG.md](CHANGELOG.md) for the development record.
