export default function Home() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center bg-zinc-50 px-6 py-16 font-sans dark:bg-black">
      <section className="w-full max-w-3xl rounded-3xl bg-white p-8 shadow-sm dark:bg-zinc-950 sm:p-12">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
          Loopin · In development
        </p>
        <h1 className="mt-6 max-w-2xl text-4xl font-semibold tracking-tight text-zinc-950 dark:text-white sm:text-5xl">
          Keep every WhatsApp lead in the loop.
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-600 dark:text-zinc-300">
          Loopin is being built for founders and small agencies who want to keep
          warm leads from going cold. The planned workflow turns exported
          conversations and voice notes into clear lead summaries and timely
          follow-up reminders.
        </p>
        <p className="mt-5 max-w-2xl leading-7 text-zinc-600 dark:text-zinc-400">
          AI may help organize a conversation and draft a reply, but the founder
          always reviews, edits, and sends it. Loopin will never send sales
          messages automatically.
        </p>
        <p className="mt-8 border-t border-zinc-200 pt-5 text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          This version is the project overview only. WhatsApp import,
          transcription, lead management, and follow-up tools are not implemented
          yet.
        </p>
      </section>
    </main>
  );
}
