import { createClient } from "@/lib/supabase/server";
import type { Lead, LeadPriority, LeadStatus, EngagementPattern } from "@/lib/types";

type LeadRow = {
  id: string;
  name: string;
  phone: string | null;
  status: string;
  priority: string | null;
  engagement_pattern: string | null;
  summary: string | null;
  objections: string | null;
  promises_made: string | null;
  suggested_followup: string | null;
  suggested_followup_date: string | null;
  last_contact_date: string | null;
  followed_up: boolean;
  raw_transcript: string | null;
};

const toStatus = (value: string): LeadStatus => ["hot", "warm", "cold", "won", "lost"].includes(value) ? value as LeadStatus : "warm";
const toPriority = (value: string | null): LeadPriority => ["high", "low", "unclear"].includes(value ?? "") ? value as LeadPriority : "unclear";
const toEngagement = (value: string | null): EngagementPattern | undefined => ["price_only", "engaged_evaluating", "unclear"].includes(value ?? "") ? value as EngagementPattern : undefined;

function displayDate(value: string | null) {
  if (!value) return "";
  const date = new Date(`${value}T00:00:00`);
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const dateStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const day = 24 * 60 * 60 * 1000;
  if (dateStart === todayStart) return "Today";
  if (dateStart === todayStart + day) return "Tomorrow";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

export function mapLead(row: LeadRow): Lead {
  return {
    id: row.id,
    name: row.name,
    phone: row.phone ?? undefined,
    status: toStatus(row.status),
    priority: toPriority(row.priority),
    engagementPattern: toEngagement(row.engagement_pattern),
    summary: row.summary ?? "No summary available yet.",
    objections: row.objections ?? undefined,
    promisesMade: row.promises_made ?? undefined,
    suggestedFollowup: row.suggested_followup ?? "",
    suggestedFollowupDate: displayDate(row.suggested_followup_date),
    lastContactDate: displayDate(row.last_contact_date),
    followedUp: row.followed_up,
    rawTranscript: row.raw_transcript ?? undefined,
  };
}

const leadSelect = "id,name,phone,status,priority,engagement_pattern,summary,objections,promises_made,suggested_followup,suggested_followup_date,last_contact_date,followed_up,raw_transcript";

export async function getCurrentUserRole() {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  return data?.role ?? "user";
}

export async function getCurrentUserLeads() {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data, error } = await supabase.from("leads").select(leadSelect).eq("user_id", user.id).order("updated_at", { ascending: false });
  if (error) {
    console.error("getCurrentUserLeads", user.id, error);
    return [];
  }
  return (data as LeadRow[]).map(mapLead);
}

export async function getCurrentUserLead(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.from("leads").select(leadSelect).eq("id", id).eq("user_id", user.id).maybeSingle();
  if (error) {
    console.error("getCurrentUserLead", user.id, id, error);
    return null;
  }
  return data ? mapLead(data as LeadRow) : null;
}
