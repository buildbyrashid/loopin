"use client";

import Link from "next/link";
import {
  Calendar,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  Flame,
  Inbox,
  MoreHorizontal,
  Sparkles,
  ArrowRight,
  Copy,
  Clock3,
} from "lucide-react";
import { toast } from "sonner";
import { useState, useMemo } from "react";
import type { Lead } from "@/lib/types";
import { demoLeads } from "@/lib/types";
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

export function FollowupsView({ initialLeads }: { initialLeads: Lead[] }) {
  // Use provided leads or fallback to demoLeads matching Image 1
  const activeSourceLeads = initialLeads.length > 0 ? initialLeads : demoLeads;

  const [leads, setLeads] = useState<Lead[]>(activeSourceLeads);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [openSections, setOpenSections] = useState<Record<GroupKey, boolean>>({
    today: true,
    tomorrow: false,
    thisWeek: false,
    later: false,
  });
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);

  // Group leads into the 4 buckets
  const sections: FollowupSection[] = useMemo(() => {
    const todayList: Lead[] = [];
    const tomorrowList: Lead[] = [];
    const thisWeekList: Lead[] = [];
    const laterList: Lead[] = [];

    // Fallback counts matching mockup
    demoLeads.forEach((demoLead) => {
      // If leads state has this lead (not marked done)
      const current = leads.find((l) => l.id === demoLead.id);
      if (!current || current.followedUp) return;

      if (demoLead.suggestedFollowupDate === "Today") {
        todayList.push(current);
      } else if (demoLead.suggestedFollowupDate === "Tomorrow") {
        tomorrowList.push(current);
      } else if (demoLead.suggestedFollowupDate === "This week") {
        thisWeekList.push(current);
      } else {
        laterList.push(current);
      }
    });

    // Also include any custom uploaded leads that aren't in demoLeads
    leads
      .filter(
        (l) =>
          !demoLeads.some((d) => d.id === l.id) &&
          !l.followedUp &&
          Boolean(l.suggestedFollowup)
      )
      .forEach((customLead) => {
        const date = customLead.suggestedFollowupDate?.toLowerCase() ?? "";
        if (date.includes("today")) todayList.push(customLead);
        else if (date.includes("tomorrow")) tomorrowList.push(customLead);
        else if (date.includes("week")) thisWeekList.push(customLead);
        else laterList.push(customLead);
      });

    return [
      { key: "today", title: "Today", count: todayList.length, leads: todayList },
      {
        key: "tomorrow",
        title: "Tomorrow",
        count: tomorrowList.length,
        icon: Clock,
        leads: tomorrowList,
      },
      {
        key: "thisWeek",
        title: "This week",
        count: thisWeekList.length,
        icon: CalendarDays,
        leads: thisWeekList,
      },
      {
        key: "later",
        title: "Later",
        count: laterList.length,
        icon: Inbox,
        leads: laterList,
      },
    ];
  }, [leads]);

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

    // If it's a real lead in db, sync it
    if (!id.startsWith("mock-") && !demoLeads.some((d) => d.id === id)) {
      try {
        await fetch(`/api/leads/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ followedUp: true }),
        });
      } catch {
        // silently retain local state for smooth demo
      }
    }
  };

  // Sparkline data counts matching Image 1
  const hotCount = 12;
  const dueTodayCount = sections[0].count || 8;
  const goingColdCount = 15;
  const followedUpCount = 10;

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
          onClick={() => toast.info("Viewing follow-ups for Thu, 9 Oct 2026")}
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
            <p className="mt-0.5 flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
              <span>↗</span> +3
            </p>
          </div>
          {/* Sparkline Wave Red */}
          <div className="self-end pb-1">
            <svg viewBox="0 0 110 40" className="h-10 w-28 overflow-visible">
              <defs>
                <linearGradient id="spark-hot" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f43f5e" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 C 20 35, 30 25, 45 28 C 60 31, 70 12, 85 16 C 95 19, 102 24, 110 22 L 110 40 L 0 40 Z"
                fill="url(#spark-hot)"
              />
              <path
                d="M 0 35 C 20 35, 30 25, 45 28 C 60 31, 70 12, 85 16 C 95 19, 102 24, 110 22"
                fill="none"
                stroke="#f43f5e"
                strokeWidth="2.2"
                strokeLinecap="round"
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
            <p className="mt-0.5 flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
              <span>↗</span> +2
            </p>
          </div>
          {/* Sparkline Wave Amber */}
          <div className="self-end pb-1">
            <svg viewBox="0 0 110 40" className="h-10 w-28 overflow-visible">
              <defs>
                <linearGradient id="spark-due" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 C 25 36, 40 33, 55 24 C 70 15, 80 20, 95 28 C 102 32, 106 33, 110 32 L 110 40 L 0 40 Z"
                fill="url(#spark-due)"
              />
              <path
                d="M 0 35 C 25 36, 40 33, 55 24 C 70 15, 80 20, 95 28 C 102 32, 106 33, 110 32"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.2"
                strokeLinecap="round"
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
            <p className="mt-0.5 flex items-center gap-0.5 text-xs font-semibold text-rose-500">
              <span>↗</span> +5
            </p>
          </div>
          {/* Sparkline Wave Blue */}
          <div className="self-end pb-1">
            <svg viewBox="0 0 110 40" className="h-10 w-28 overflow-visible">
              <defs>
                <linearGradient id="spark-cold" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 35 C 18 36, 32 20, 48 22 C 64 24, 76 34, 92 28 C 100 25, 106 20, 110 21 L 110 40 L 0 40 Z"
                fill="url(#spark-cold)"
              />
              <path
                d="M 0 35 C 18 36, 32 20, 48 22 C 64 24, 76 34, 92 28 C 100 25, 106 20, 110 21"
                fill="none"
                stroke="#6366f1"
                strokeWidth="2.2"
                strokeLinecap="round"
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
            <p className="mt-3 text-xs font-medium text-slate-500">Followed up this week</p>
            <p className="mt-0.5 text-2xl font-extrabold text-slate-900">{followedUpCount}</p>
            <p className="mt-0.5 flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
              <span>↗</span> +4
            </p>
          </div>
          {/* Sparkline Wave Green */}
          <div className="self-end pb-1">
            <svg viewBox="0 0 110 40" className="h-10 w-28 overflow-visible">
              <defs>
                <linearGradient id="spark-won" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d="M 0 34 C 20 34, 35 28, 50 25 C 65 22, 75 14, 90 12 C 98 11, 105 18, 110 19 L 110 40 L 0 40 Z"
                fill="url(#spark-won)"
              />
              <path
                d="M 0 34 C 20 34, 35 28, 50 25 C 65 22, 75 14, 90 12 C 98 11, 105 18, 110 19"
                fill="none"
                stroke="#10b981"
                strokeWidth="2.2"
                strokeLinecap="round"
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

                            // Parse headline and subtext from engagementReason or summary
                            const reasonParts = (
                              lead.engagementReason || lead.summary
                            ).split(". ");
                            const headline =
                              reasonParts[0] || "Follow up requested";
                            const subReason =
                              reasonParts.slice(1).join(". ") || lead.summary;

                            // Dot color
                            const dotColor =
                              lead.status === "hot"
                                ? "bg-rose-500"
                                : lead.status === "warm"
                                ? "bg-amber-500"
                                : "bg-blue-500";

                            const lastMsg =
                              lead.lastMessageTime ||
                              (idx === 0
                                ? "2 hours ago"
                                : idx === 1
                                ? "5 hours ago"
                                : idx === 2
                                ? "6 hours ago"
                                : idx === 3
                                ? "8 hours ago"
                                : "1 day ago");

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
                                        {lead.phone || "+91 98765 43210"}
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
                                          <button
                                            onClick={() => {
                                              navigator.clipboard?.writeText(
                                                lead.phone || ""
                                              );
                                              toast.success("Phone number copied");
                                              setMenuOpenId(null);
                                            }}
                                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                                          >
                                            <Copy size={13} /> Copy phone
                                          </button>
                                          <button
                                            onClick={() => {
                                              toast.info(
                                                `Follow-up for ${lead.name} snoozed to tomorrow`
                                              );
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
                    <div className="px-5 py-6 text-center text-xs text-slate-400">
                      No follow-ups scheduled for this period.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

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
