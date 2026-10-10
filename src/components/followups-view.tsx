"use client";

import Link from "next/link";
import { CalendarDays, Check, ChevronDown, Flame, Inbox, ListTodo, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import type { Lead } from "@/lib/types";
import { PriorityBadge } from "@/components/status-badge";

type Group = { name: string; leads: Lead[] };

function startOfDay(date: Date) { return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime(); }
function groupLeads(leads: Lead[]): Group[] {
  const today = startOfDay(new Date());
  const day = 24 * 60 * 60 * 1000;
  const todayDate = new Date(today);
  const daysUntilWeekEnd = todayDate.getDay() === 0 ? 0 : 7 - todayDate.getDay();
  const weekEnd = today + daysUntilWeekEnd * day;
  const groups: Group[] = [{ name: "Today", leads: [] }, { name: "Tomorrow", leads: [] }, { name: "This week", leads: [] }, { name: "Later", leads: [] }];
  for (const lead of leads) {
    const date = lead.suggestedFollowupDateIso ? new Date(`${lead.suggestedFollowupDateIso}T00:00:00`).getTime() : Number.NaN;
    if (Number.isNaN(date) || date > weekEnd) groups[3].leads.push(lead);
    else if (date <= today) groups[0].leads.push(lead);
    else if (date <= today + day) groups[1].leads.push(lead);
    else groups[2].leads.push(lead);
  }
  return groups;
}
function patternLabel(pattern: Lead["engagementPattern"]) { if (pattern === "engaged_evaluating") return "Engaged evaluator"; if (pattern === "price_only") return "Price only"; return "Unclear engagement"; }

export function FollowupsView({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState(initialLeads.filter((lead) => !lead.followedUp && lead.suggestedFollowup));
  const groups = groupLeads(leads);
  const markDone = async (id: string) => { const previous = leads; setLeads((current) => current.filter((lead) => lead.id !== id)); const response = await fetch(`/api/leads/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ followedUp: true }) }); if (!response.ok) { setLeads(previous); toast.error("Unable to update this lead."); return; } toast.success("Follow-up marked as done"); };
  const todayCount = groups[0].leads.length;
  return <div><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-sm font-semibold text-indigo-600">Your workspace</p><h1 className="mt-1 text-3xl font-bold tracking-tight">Today&apos;s follow-ups</h1><p className="mt-2 text-sm text-slate-500">The conversations most likely to move forward, with the reason behind each recommendation.</p></div><button className="flex items-center gap-2 self-start rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600"><CalendarDays size={16} />Select date</button></div><div className="mt-8 grid gap-3 sm:grid-cols-4"><Stat icon={Flame} label="Hot leads" value={String(initialLeads.filter((lead) => lead.status === "hot").length)} tint="text-red-500 bg-red-50" /><Stat icon={ListTodo} label="Due today" value={String(todayCount)} tint="text-amber-500 bg-amber-50" /><Stat icon={Inbox} label="Going cold" value={String(initialLeads.filter((lead) => lead.status === "cold").length)} tint="text-indigo-500 bg-indigo-50" /><Stat icon={Check} label="Followed up" value={String(initialLeads.filter((lead) => lead.followedUp).length)} tint="text-emerald-500 bg-emerald-50" /></div><div className="mt-8 space-y-3">{groups.map((group) => <section key={group.name} className="overflow-hidden rounded-xl border border-slate-200 bg-white"><div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><h2 className="text-sm font-bold">{group.name} <span className="ml-1 text-slate-400">({group.leads.length})</span></h2><ChevronDown size={17} className="text-slate-400" /></div>{group.leads.length ? <div className="divide-y divide-slate-100">{group.leads.map((lead) => <div key={lead.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-start"><div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${lead.status === "hot" ? "bg-red-500" : lead.status === "warm" ? "bg-amber-500" : "bg-blue-500"}`} /><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><Link href={`/leads/${lead.id}`} className="font-semibold hover:text-indigo-600">{lead.name}</Link><PriorityBadge priority={lead.priority} /><span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">{patternLabel(lead.engagementPattern)}</span></div><p className="mt-2 text-sm text-slate-600">{lead.engagementReason || lead.summary}</p><p className="mt-1 text-xs text-slate-400">Follow up {lead.suggestedFollowupDate || "when you have enough context"}</p></div><div className="flex shrink-0 gap-2"><Link href={`/leads/${lead.id}`} className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">View</Link><button onClick={() => markDone(lead.id)} className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Mark done</button></div></div>)}</div> : <div className="px-5 py-5 text-sm text-slate-400">Nothing scheduled here yet.</div>}</section>)}</div><div className="mt-5 flex items-center gap-3 rounded-xl border border-indigo-100 bg-indigo-50 p-4 text-sm text-indigo-900"><Sparkles size={18} className="text-indigo-600" /><span>These follow-ups are suggestions. Review every draft before sending it.</span></div></div>;
}
function Stat({ icon: Icon, label, value, tint }: { icon: typeof Flame; label: string; value: string; tint: string }) { return <div className="rounded-xl border border-slate-200 bg-white p-4"><div className="flex items-center justify-between"><div className={`grid h-9 w-9 place-items-center rounded-lg ${tint}`}><Icon size={18} /></div><span className="text-2xl font-bold">{value}</span></div><p className="mt-3 text-xs font-medium text-slate-500">{label}</p></div>; }
