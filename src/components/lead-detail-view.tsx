"use client";

import Link from "next/link";
import { ArrowLeft, ChevronDown, Clock3, MessageSquareText, Save, ShieldCheck, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Lead } from "@/lib/types";
import { PriorityBadge, StatusBadge } from "@/components/status-badge";

export function LeadDetailView({ lead }: { lead: Lead }) {
  const [draft, setDraft] = useState(lead.suggestedFollowup);
  return <div>
    <Link href="/leads" className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-600"><ArrowLeft size={16} /> Back to leads</Link>
    <div className="mt-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
      <div><div className="flex flex-wrap items-center gap-3"><h1 className="text-3xl font-bold tracking-tight">{lead.name}</h1><StatusBadge status={lead.status} /><PriorityBadge priority={lead.priority} /></div><p className="mt-2 text-sm text-slate-500">{lead.phone} · Last contact {lead.lastContactDate}</p></div>
      <button onClick={() => toast.success("Lead saved")} className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white"><Save size={16} /> Save changes</button>
    </div>
    <div className="mt-8 grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
      <div className="space-y-5">
        <Card title="AI summary" icon={<Sparkles size={18} className="text-indigo-600" />}><p className="text-sm leading-7 text-slate-600">{lead.summary}</p></Card>
        <Card title="Follow-up draft" icon={<MessageSquareText size={18} className="text-indigo-600" />}><div className="rounded-xl bg-indigo-50 p-4 text-xs text-indigo-800">AI drafted this from the conversation. Review and edit it before sending.</div><textarea value={draft} onChange={(event) => setDraft(event.target.value)} rows={6} className="mt-4 w-full resize-none rounded-xl border border-slate-200 p-4 text-sm leading-6 outline-none focus:border-indigo-400" /><button onClick={() => toast.success("Follow-up draft saved")} className="mt-3 rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700">Save draft</button></Card>
        <Card title="Original conversation" icon={<MessageSquareText size={18} className="text-slate-500" />}><details><summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-slate-700">View transcript <ChevronDown size={16} /></summary>{lead.rawTranscript ? <TranscriptView transcript={lead.rawTranscript} /> : <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm leading-7 text-slate-600">Transcript becomes available after you upload and process a WhatsApp export.</p>}</details></Card>
      </div>
      <div className="space-y-5">
        <Card title="Lead context" icon={<Clock3 size={18} className="text-slate-500" />}>
          <Info label="Engagement" value={lead.engagementPattern === "engaged_evaluating" ? "Engaged evaluator" : lead.engagementPattern === "price_only" ? "Price only" : "Unclear"} />
          <Info label="Why this classification" value={lead.engagementReason ?? "No classification reason available."} />
          <Info label="Business need" value={lead.businessNeed ?? "Not stated"} />
          <Info label="Client concerns and feeling" value={lead.clientConcerns ?? "Not stated"} />
          <Info label="Buying signals" value={lead.buyingSignals ?? "Not stated"} />
          <Info label="Sentiment" value={lead.clientSentiment ?? "unclear"} />
          <Info label="Objections" value={lead.objections ?? "None captured yet."} />
          <Info label="Promise made" value={lead.promisesMade ?? "None captured yet."} />
        </Card>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5"><div className="flex items-start gap-3"><ShieldCheck size={19} className="mt-0.5 text-emerald-600" /><div><p className="text-sm font-bold text-emerald-900">Human-led sales</p><p className="mt-2 text-xs leading-5 text-emerald-800">Loopin never sends messages automatically. You always decide what goes out.</p></div></div></div>
      </div>
    </div>
  </div>;
}

type TranscriptEntry = { original: string; direction?: string; voiceTranscript?: string };

function parseTranscript(transcript: string): TranscriptEntry[] {
  const entries: TranscriptEntry[] = [];
  let current: TranscriptEntry | undefined;
  for (const line of transcript.split(/\r?\n/)) {
    const isMessage = /^\[[^\]]+\]\s[^:]+:/.test(line);
    if (isMessage) {
      const markerStart = line.indexOf(" [Voice note ");
      if (markerStart < 0) {
        current = { original: line };
      } else {
        const original = line.slice(0, markerStart);
        const marker = line.slice(markerStart);
        const match = marker.match(/^ \[Voice note (sent by founder|received from client); transcript: ([\s\S]*)\]$/);
        current = match ? { original, direction: match[1], voiceTranscript: match[2] } : { original: line };
      }
      entries.push(current);
    } else if (current) {
      if (current.voiceTranscript !== undefined) current.voiceTranscript += `\n${line}`;
      else current.original += `\n${line}`;
    }
  }
  return entries;
}

function TranscriptView({ transcript }: { transcript: string }) {
  const entries = parseTranscript(transcript);
  return <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4">{entries.map((entry, index) => <div key={`${entry.original}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3"><p className="whitespace-pre-wrap text-sm leading-6 text-slate-700">{entry.original}</p>{entry.voiceTranscript !== undefined && <div className="mt-3 rounded-lg border-l-4 border-indigo-400 bg-indigo-50 px-3 py-2"><p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Full voice transcription · {entry.direction}</p><p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-indigo-950">{entry.voiceTranscript}</p></div>}</div>)}</div>;
}

function Card({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) { return <section className="rounded-2xl border border-slate-200 bg-white p-5"><div className="mb-5 flex items-center gap-2"><span className="grid h-8 w-8 place-items-center rounded-lg bg-slate-50">{icon}</span><h2 className="text-sm font-bold">{title}</h2></div>{children}</section>; }
function Info({ label, value }: { label: string; value: string }) { return <div className="border-b border-slate-100 py-3 first:pt-0 last:border-0"><p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</p><p className="mt-2 text-sm leading-6 text-slate-600">{value}</p></div>; }
