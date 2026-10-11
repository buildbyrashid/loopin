"use client";

import Link from "next/link";
import {
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Clock3,
  Copy,
  Flame,
  Inbox,
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  UploadCloud,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import type { Lead } from "@/lib/types";
import { PriorityBadge } from "@/components/status-badge";

type GroupKey = "today" | "tomorrow" | "thisWeek" | "later";

type FollowupSection = {
  key: GroupKey;
  title: string;
  count: number;
  icon?: typeof Clock;
  leads: Lead[];
};

const avatarColors = [
  "bg-[#EDE9FE] text-[#7C3AED]", // lavender
  "bg-[#E0E7FF] text-[#4F46E5]", // indigo
  "bg-[#EDE9FE] text-[#7C3AED]", // purple
  "bg-[#E0E7FF] text-[#4F46E5]", // blue-indigo
  "bg-[#E0F2FE] text-[#0284C7]", // sky
  "bg-[#FEF3C7] text-[#D97706]", // amber
  "bg-[#DCFCE7] text-[#16A34A]", // emerald
];

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
}

function groupLeads(leads: Lead[]) {
  const today = startOfDay(new Date());
  const day = 24 * 60 * 60 * 1000;
  const todayDate = new Date(today);
  const daysUntilWeekEnd = todayDate.getDay() === 0 ? 0 : 7 - todayDate.getDay();
  const weekEnd = today + daysUntilWeekEnd * day;

  const groups: Record<GroupKey, Lead[]> = {
    today: [],
    tomorrow: [],
    thisWeek: [],
    later: [],
  };

  for (const lead of leads) {
    if (lead.followedUp) continue;

    const date = lead.suggestedFollowupDateIso
      ? new Date(`${lead.suggestedFollowupDateIso}T00:00:00`).getTime()
      : Number.NaN;

    if (Number.isNaN(date)) {
      const text = (lead.suggestedFollowupDate || "").toLowerCase();
      if (text.includes("today")) groups.today.push(lead);
      else if (text.includes("tomorrow")) groups.tomorrow.push(lead);
      else if (text.includes("week")) groups.thisWeek.push(lead);
      else groups.later.push(lead);
    } else if (date <= today) {
      groups.today.push(lead);
    } else if (date <= today + day) {
      groups.tomorrow.push(lead);
    } else if (date <= weekEnd) {
      groups.thisWeek.push(lead);
    } else {
      groups.later.push(lead);
    }
  }

  return groups;
}

export function FollowupsView({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState<Record<GroupKey, boolean>>({
    today: true,
    tomorrow: false,
    thisWeek: false,
    later: false,
  });
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Group real leads
  const grouped = useMemo(() => groupLeads(leads), [leads]);

  const sections: FollowupSection[] = useMemo(
    () => [
      {
        key: "today",
        title: "Today",
        count: grouped.today.length,
        leads: grouped.today,
      },
      {
        key: "tomorrow",
        title: "Tomorrow",
        count: grouped.tomorrow.length,
        icon: Clock,
        leads: grouped.tomorrow,
      },
      {
        key: "thisWeek",
        title: "This week",
        count: grouped.thisWeek.length,
        icon: CalendarDays,
        leads: grouped.thisWeek,
      },
      {
        key: "later",
        title: "Later",
        count: grouped.later.length,
        icon: Inbox,
        leads: grouped.later,
      },
    ],
    [grouped]
  );

  const toggleSection = (key: GroupKey) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAllToday = (todayLeads: Lead[]) => {
    setSelectedIds((prev) => {
      const allSelected = todayLeads.every((l) => prev.has(l.id));
      const next = new Set(prev);
      if (allSelected) {
        todayLeads.forEach((l) => next.delete(l.id));
      } else {
        todayLeads.forEach((l) => next.add(l.id));
      }
      return next;
    });
  };

  const markDone = async (id: string, name: string) => {
    const previous = leads;
    setLeads((current) =>
      current.map((l) => (l.id === id ? { ...l, followedUp: true } : l))
    );
    toast.success(`Follow-up marked as done for ${name}`);

    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ followedUp: true }),
      });
      if (!res.ok) {
        setLeads(previous);
        toast.error("Unable to update lead on server");
      }
    } catch {
      setLeads(previous);
      toast.error("Network error while updating lead");
    }
  };

  // Real computed KPI counts from actual data
  const hotCount = leads.filter((l) => l.status === "hot" && !l.followedUp).length;
  const dueTodayCount = grouped.today.length;
  const goingColdCount = leads.filter((l) => l.status === "cold" && !l.followedUp).length;
  const followedUpCount = leads.filter((l) => l.followedUp).length;

  const hasAnyLeads = leads.length > 0;

  return (
    <div className="space-y-7">
      {/* Page Title & Date Action */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-semibold tracking-wide text-[#4F46E5]">
            Your workspace
          </p>
          <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Today&apos;s follow-ups
          </h1>
          <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
            The conversations most likely to move forward, with the reason behind each recommendation.
          </p>
        </div>

        <button
          onClick={() => toast.info("Select date filter coming soon")}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50 sm:self-auto"
        >
          <CalendarDays size={15} className="text-slate-500" />
          <span>Select date</span>
        </button>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Hot leads */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-rose-50 text-rose-500">
              <Flame size={19} />
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">Hot leads</p>
            <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{hotCount}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              {hotCount > 0 ? (
                <span className="text-emerald-500">↗ +{hotCount}</span>
              ) : (
                "None pending"
              )}
            </p>
          </div>
          <div className="self-end pb-1">
            <svg viewBox="0 0 110 40" className="h-10 w-28 overflow-visible">
              <defs>
                <linearGradient id="spark-hot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity={hotCount > 0 ? 0.25 : 0.05} />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={
                  hotCount > 0
                    ? "M 0 35 C 20 35, 30 25, 45 28 C 60 31, 70 12, 85 16 C 95 19, 102 24, 110 22 L 110 40 L 0 40 Z"
                    : "M 0 36 L 110 36 L 110 40 L 0 40 Z"
                }
                fill="url(#spark-hot)"
              />
              <path
                d={
                  hotCount > 0
                    ? "M 0 35 C 20 35, 30 25, 45 28 C 60 31, 70 12, 85 16 C 95 19, 102 24, 110 22"
                    : "M 0 36 L 110 36"
                }
                fill="none"
                stroke="#f43f5e"
                strokeWidth={hotCount > 0 ? "2.2" : "1.5"}
                strokeLinecap="round"
                strokeDasharray={hotCount > 0 ? undefined : "3 3"}
              />
            </svg>
          </div>
        </div>

        {/* Card 2: Due today */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-amber-50 text-amber-500">
              <Clock size={19} />
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">Due today</p>
            <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{dueTodayCount}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              {dueTodayCount > 0 ? (
                <span className="text-emerald-500">↗ +{dueTodayCount}</span>
              ) : (
                "None today"
              )}
            </p>
          </div>
          <div className="self-end pb-1">
            <svg viewBox="0 0 110 40" className="h-10 w-28 overflow-visible">
              <defs>
                <linearGradient id="spark-due" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={dueTodayCount > 0 ? 0.25 : 0.05} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={
                  dueTodayCount > 0
                    ? "M 0 35 C 25 36, 40 33, 55 24 C 70 15, 80 20, 95 28 C 102 32, 106 33, 110 32 L 110 40 L 0 40 Z"
                    : "M 0 36 L 110 36 L 110 40 L 0 40 Z"
                }
                fill="url(#spark-due)"
              />
              <path
                d={
                  dueTodayCount > 0
                    ? "M 0 35 C 25 36, 40 33, 55 24 C 70 15, 80 20, 95 28 C 102 32, 106 33, 110 32"
                    : "M 0 36 L 110 36"
                }
                fill="none"
                stroke="#f59e0b"
                strokeWidth={dueTodayCount > 0 ? "2.2" : "1.5"}
                strokeLinecap="round"
                strokeDasharray={dueTodayCount > 0 ? undefined : "3 3"}
              />
            </svg>
          </div>
        </div>

        {/* Card 3: Going cold */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-indigo-50 text-indigo-500">
              <Inbox size={19} />
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">Going cold</p>
            <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{goingColdCount}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              {goingColdCount > 0 ? (
                <span className="text-rose-500">↗ +{goingColdCount}</span>
              ) : (
                "None cold"
              )}
            </p>
          </div>
          <div className="self-end pb-1">
            <svg viewBox="0 0 110 40" className="h-10 w-28 overflow-visible">
              <defs>
                <linearGradient id="spark-cold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity={goingColdCount > 0 ? 0.25 : 0.05} />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={
                  goingColdCount > 0
                    ? "M 0 35 C 18 36, 32 20, 48 22 C 64 24, 76 34, 92 28 C 100 25, 106 20, 110 21 L 110 40 L 0 40 Z"
                    : "M 0 36 L 110 36 L 110 40 L 0 40 Z"
                }
                fill="url(#spark-cold)"
              />
              <path
                d={
                  goingColdCount > 0
                    ? "M 0 35 C 18 36, 32 20, 48 22 C 64 24, 76 34, 92 28 C 100 25, 106 20, 110 21"
                    : "M 0 36 L 110 36"
                }
                fill="none"
                stroke="#6366f1"
                strokeWidth={goingColdCount > 0 ? "2.2" : "1.5"}
                strokeLinecap="round"
                strokeDasharray={goingColdCount > 0 ? undefined : "3 3"}
              />
            </svg>
          </div>
        </div>

        {/* Card 4: Followed up this week */}
        <div className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-2xs">
          <div>
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-50 text-emerald-500">
              <CheckCircle2 size={19} />
            </div>
            <p className="mt-3 text-xs font-medium text-slate-500">Followed up</p>
            <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{followedUpCount}</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-400">
              {followedUpCount > 0 ? (
                <span className="text-emerald-500">↗ +{followedUpCount}</span>
              ) : (
                "0 this week"
              )}
            </p>
          </div>
          <div className="self-end pb-1">
            <svg viewBox="0 0 110 40" className="h-10 w-28 overflow-visible">
              <defs>
                <linearGradient id="spark-won" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={followedUpCount > 0 ? 0.25 : 0.05} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={
                  followedUpCount > 0
                    ? "M 0 34 C 20 34, 35 28, 50 25 C 65 22, 75 14, 90 12 C 98 11, 105 18, 110 19 L 110 40 L 0 40 Z"
                    : "M 0 36 L 110 36 L 110 40 L 0 40 Z"
                }
                fill="url(#spark-won)"
              />
              <path
                d={
                  followedUpCount > 0
                    ? "M 0 34 C 20 34, 35 28, 50 25 C 65 22, 75 14, 90 12 C 98 11, 105 18, 110 19"
                    : "M 0 36 L 110 36"
                }
                fill="none"
                stroke="#10b981"
                strokeWidth={followedUpCount > 0 ? "2.2" : "1.5"}
                strokeLinecap="round"
                strokeDasharray={followedUpCount > 0 ? undefined : "3 3"}
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Accordion Sections */}
      <div className="space-y-3.5">
        {sections.map((section) => {
          const isOpen = openSections[section.key];
          const SectionIcon = section.icon;
          const isToday = section.key === "today";
          const allTodaySelected =
            isToday &&
            section.leads.length > 0 &&
            section.leads.every((l) => selectedIds.has(l.id));

          return (
            <div
              key={section.key}
              className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-2xs"
            >
              {/* Section Accordion Header */}
              <div
                onClick={() => toggleSection(section.key)}
                className="flex cursor-pointer items-center justify-between border-b border-slate-100 bg-white px-5 py-4 transition hover:bg-slate-50/60"
              >
                <div className="flex items-center gap-3">
                  <ChevronDown
                    size={18}
                    className={`text-slate-400 transition-transform duration-200 ${
                      isOpen ? "rotate-0" : "-rotate-90"
                    }`}
                  />
                  {SectionIcon && (
                    <SectionIcon size={16} className="text-slate-600" />
                  )}
                  <h2 className="text-sm font-bold text-slate-900">
                    {section.title}{" "}
                    <span className="ml-0.5 font-normal text-slate-400">
                      ({section.count})
                    </span>
                  </h2>
                </div>

                <div className="flex items-center gap-1 text-xs font-semibold text-[#4F46E5] hover:text-[#4338CA]">
                  <span>View all</span>
                  {isToday ? (
                    <ArrowRight size={13} className="mt-0.5" />
                  ) : (
                    <ChevronDown
                      size={13}
                      className={`mt-0.5 transition-transform ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  )}
                </div>
              </div>

              {/* Section Body Content */}
              {isOpen && (
                <div>
                  {section.leads.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[760px] text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-[11px] font-semibold text-slate-400">
                            <th className="w-12 px-5 py-3 text-center">
                              {isToday ? (
                                <input
                                  type="checkbox"
                                  checked={allTodaySelected}
                                  onChange={() => toggleSelectAllToday(section.leads)}
                                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                />
                              ) : (
                                <span className="sr-only">Select</span>
                              )}
                            </th>
                            <th className="w-[200px] px-3 py-3 font-medium">Lead</th>
                            <th className="px-3 py-3 font-medium">AI reason</th>
                            <th className="w-[120px] px-3 py-3 font-medium">Priority</th>
                            <th className="w-[120px] px-3 py-3 font-medium">Last message</th>
                            <th className="w-[180px] px-5 py-3 text-right font-medium">
                              Actions
                            </th>
                          </tr>
                        </thead>

                        <tbody className="divide-y divide-slate-100">
                          {section.leads.map((lead, idx) => {
                            const isSelected = selectedIds.has(lead.id);
                            const avatarColor =
                              avatarColors[idx % avatarColors.length];
                            const initial =
                              lead.name.trim().charAt(0).toUpperCase() || "L";

                            const reasonParts = (
                              lead.engagementReason || lead.summary || ""
                            ).split(". ");
                            const headline =
                              reasonParts[0] || "Follow-up recommended";
                            const subReason =
                              reasonParts.slice(1).join(". ") || lead.summary;

                            const dotColor =
                              lead.status === "hot"
                                ? "bg-rose-500"
                                : lead.status === "warm"
                                ? "bg-amber-500"
                                : "bg-blue-500";

                            const lastMsg =
                              lead.lastMessageTime ||
                              lead.lastContactDate ||
                              "Recently";

                            return (
                              <tr
                                key={lead.id}
                                className={`group transition hover:bg-slate-50/70 ${
                                  isSelected ? "bg-indigo-50/40" : ""
                                }`}
                              >
                                {/* Checkbox */}
                                <td className="px-5 py-4 text-center">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelect(lead.id)}
                                    className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                  />
                                </td>

                                {/* Lead Avatar & Name */}
                                <td className="px-3 py-4">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ${avatarColor}`}
                                    >
                                      {initial}
                                    </div>
                                    <div className="min-w-0">
                                      <Link
                                        href={`/leads/${lead.id}`}
                                        className="block truncate font-bold text-slate-900 transition hover:text-[#4F46E5]"
                                      >
                                        {lead.name}
                                      </Link>
                                      <p className="truncate text-[11px] font-medium text-slate-400">
                                        {lead.phone || "No phone recorded"}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* AI Reason with status dot */}
                                <td className="px-3 py-4">
                                  <div className="flex items-start gap-2.5">
                                    <span
                                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${dotColor}`}
                                    />
                                    <div className="min-w-0">
                                      <p className="font-bold text-slate-900 leading-snug">
                                        {headline}
                                      </p>
                                      <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5 line-clamp-1">
                                        {subReason}
                                      </p>
                                    </div>
                                  </div>
                                </td>

                                {/* Priority Badge */}
                                <td className="px-3 py-4">
                                  <PriorityBadge priority={lead.priority} />
                                </td>

                                {/* Last Message */}
                                <td className="px-3 py-4 text-[11px] font-medium text-slate-500 whitespace-nowrap">
                                  {lastMsg}
                                </td>

                                {/* Actions */}
                                <td className="px-5 py-4 text-right">
                                  <div className="flex items-center justify-end gap-1.5">
                                    <Link
                                      href={`/leads/${lead.id}`}
                                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs transition hover:bg-slate-50"
                                    >
                                      View
                                    </Link>

                                    <button
                                      onClick={() => markDone(lead.id, lead.name)}
                                      className="inline-flex items-center gap-1.5 rounded-lg bg-[#4F46E5] px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition hover:bg-[#4338CA] active:scale-[0.98]"
                                    >
                                      <Check size={13} strokeWidth={2.5} />
                                      <span>Mark Done</span>
                                    </button>

                                    <div className="relative">
                                      <button
                                        onClick={() =>
                                          setMenuOpenId(
                                            menuOpenId === lead.id ? null : lead.id
                                          )
                                        }
                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                      >
                                        <MoreHorizontal size={16} />
                                      </button>

                                      {menuOpenId === lead.id && (
                                        <div className="absolute right-0 top-full z-20 mt-1 w-44 rounded-xl border border-slate-200 bg-white p-1 text-left shadow-lg">
                                          {lead.phone && (
                                            <button
                                              onClick={() => {
                                                navigator.clipboard?.writeText(lead.phone || "");
                                                toast.success("Phone number copied");
                                                setMenuOpenId(null);
                                              }}
                                              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                            >
                                              <Copy size={13} /> Copy phone
                                            </button>
                                          )}
                                          <button
                                            onClick={() => {
                                              toast.info(`Follow-up for ${lead.name} snoozed`);
                                              setMenuOpenId(null);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                          >
                                            <Clock3 size={13} /> Snooze 1 day
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="px-5 py-7 text-center text-xs text-slate-400">
                      Nothing scheduled here yet.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Empty State Banner if no leads exist anywhere */}
      {!hasAnyLeads && (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center shadow-2xs">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600">
            <UploadCloud size={24} />
          </div>
          <h3 className="mt-3 text-sm font-bold text-slate-800">No leads in workspace yet</h3>
          <p className="mt-1 text-xs text-slate-500 max-w-md mx-auto">
            Export a chat from WhatsApp (.zip with media) and drop it here. Loopin will automatically detect hot leads, objections, and follow-up schedules.
          </p>
          <Link
            href="/import"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-700"
          >
            <UploadCloud size={14} /> Import chat export
          </Link>
        </div>
      )}

      {/* AI Advice Footer Note */}
      <div className="flex items-center gap-3 rounded-2xl border border-indigo-100/80 bg-indigo-50/60 p-4 text-xs font-medium text-indigo-900">
        <Sparkles size={17} className="shrink-0 text-indigo-600" />
        <span>
          These follow-ups are intelligent suggestions synthesized from your WhatsApp chats. Review every draft before sending.
        </span>
      </div>
    </div>
  );
}
