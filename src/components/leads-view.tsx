"use client";

import Link from "next/link";
import { Plus, Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { statusMeta, type Lead, type LeadStatus } from "@/lib/types";
import { StatusBadge } from "@/components/status-badge";

const columns: LeadStatus[] = ["hot", "warm", "cold", "won"];
export function LeadsView({ leads }: { leads: Lead[] }) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => leads.filter((lead) => lead.name.toLowerCase().includes(search.toLowerCase()) || lead.summary.toLowerCase().includes(search.toLowerCase())), [leads, search]);
  return <div><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><h1 className="text-3xl font-bold tracking-tight">All leads</h1><p className="mt-2 text-sm text-slate-500">View and manage all your leads from WhatsApp.</p></div><button className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100"><Plus size={17} /> Add lead manually</button></div><div className="mt-7 flex flex-col gap-3 sm:flex-row"><div className="relative flex-1"><Search size={17} className="absolute left-3 top-3.5 text-slate-400" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search by name, phone or keyword..." className="w-full rounded-lg border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-indigo-400" /></div><button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600"><SlidersHorizontal size={16} /> Filters</button></div><div className="mt-8 grid gap-4 xl:grid-cols-4">{columns.map((status) => { const meta = statusMeta[status]; const items = filtered.filter((lead) => lead.status === status); return <section key={status} className={`rounded-2xl border bg-white p-3 ${status === "hot" ? "border-red-100" : status === "warm" ? "border-amber-100" : status === "cold" ? "border-blue-100" : "border-emerald-100"}`}><div className="flex items-center justify-between px-2 py-2"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${meta.dot}`} /><h2 className="text-sm font-bold">{meta.label}</h2><span className="text-xs text-slate-400">{items.length}</span></div><span className="text-lg text-slate-400">...</span></div><div className="space-y-3">{items.map((lead) => <Link href={`/leads/${lead.id}`} key={lead.id} className="block rounded-xl border border-slate-100 p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"><div className="flex items-start justify-between gap-2"><p className="text-sm font-bold">{lead.name}</p><span className="text-xs text-slate-400">...</span></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">{lead.summary}</p><div className="mt-4 flex items-center justify-between"><StatusBadge status={lead.status} /><span className="text-[11px] text-slate-400">{lead.lastContactDate || "-"}</span></div></Link>)}</div></section>; })}</div>{!leads.length && (
    <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center text-sm text-slate-500">
      <p>No leads yet. Import a WhatsApp chat to extract your first leads.</p>
      <Link
        href="/import"
        className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
      >
        Import WhatsApp chat
      </Link>
    </div>
  )}</div>;
}
