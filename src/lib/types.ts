export type LeadStatus = "hot" | "warm" | "cold" | "won" | "lost";
export type LeadPriority = "high" | "low" | "unclear";
export type EngagementPattern = "price_only" | "engaged_evaluating" | "unclear";

export type Lead = {
  id: string;
  name: string;
  phone?: string;
  status: LeadStatus;
  priority: LeadPriority;
  engagementPattern?: EngagementPattern;
  engagementReason?: string;
  summary: string;
  objections?: string;
  promisesMade?: string;
  suggestedFollowup: string;
  suggestedFollowupDate: string;
  suggestedFollowupDateIso?: string;
  lastContactDate?: string;
  followedUp: boolean;
  rawTranscript?: string;
};

export const demoLeads: Lead[] = [
  {
    id: "arjun-nair",
    name: "Arjun Nair",
    phone: "+91 98470 11234",
    status: "hot",
    priority: "high",
    engagementPattern: "engaged_evaluating",
    summary: "Said he will confirm pricing today after checking the proposal.",
    objections: "Needs confidence that the onboarding timeline fits his launch.",
    promisesMade: "Send the revised proposal with the implementation timeline.",
    suggestedFollowup: "Hey Arjun, sharing the revised proposal with the launch timeline we discussed. Happy to answer anything before you confirm today.",
    suggestedFollowupDate: "Today",
    lastContactDate: "Today",
    followedUp: false,
  },
  {
    id: "fathima-rahman",
    name: "Fathima Rahman",
    phone: "+91 98951 77420",
    status: "warm",
    priority: "unclear",
    engagementPattern: "engaged_evaluating",
    summary: "Asked for product details and wants to compare the available plans.",
    objections: "Comparing the feature set with another vendor.",
    promisesMade: "Share the one-page product overview.",
    suggestedFollowup: "Hi Fathima, here is the product overview we discussed. Which part would you like me to unpack for your team?",
    suggestedFollowupDate: "Today",
    lastContactDate: "Yesterday",
    followedUp: false,
  },
  {
    id: "shibin-tk",
    name: "Shibin TK",
    phone: "+91 97461 92310",
    status: "hot",
    priority: "high",
    engagementPattern: "engaged_evaluating",
    summary: "Interested in the 50-unit plan and waiting on a final quote.",
    objections: "Wants a better price at higher volume.",
    promisesMade: "Return with volume pricing by end of day.",
    suggestedFollowup: "Hi Shibin, I have the 50-unit pricing ready. Want me to send the full breakdown here?",
    suggestedFollowupDate: "Today",
    lastContactDate: "Yesterday",
    followedUp: false,
  },
  {
    id: "neha-joseph",
    name: "Neha Joseph",
    phone: "+91 99610 08213",
    status: "warm",
    priority: "unclear",
    engagementPattern: "engaged_evaluating",
    summary: "Will share requirements today after an internal discussion.",
    objections: "Needs her co-founder to review the workflow.",
    promisesMade: "Share a tailored workflow example.",
    suggestedFollowup: "Hi Neha, checking if your team had a chance to review the workflow example. I can tailor it around your current process.",
    suggestedFollowupDate: "Today",
    lastContactDate: "2 days ago",
    followedUp: false,
  },
  {
    id: "ramees",
    name: "Ramees",
    phone: "+91 90370 14421",
    status: "cold",
    priority: "low",
    engagementPattern: "price_only",
    summary: "Comparing with another vendor and has not replied since the quote.",
    objections: "Price is the main deciding factor.",
    promisesMade: "Follow up with a concise comparison.",
    suggestedFollowup: "Hi Ramees, checking in on the quote. Is there a specific part of the comparison you would like me to clarify?",
    suggestedFollowupDate: "Tomorrow",
    lastContactDate: "3 days ago",
    followedUp: false,
  },
  {
    id: "akhil-dev",
    name: "Akhil Dev",
    phone: "+91 80754 01324",
    status: "won",
    priority: "low",
    summary: "Order confirmed and onboarding is complete.",
    suggestedFollowup: "",
    suggestedFollowupDate: "",
    lastContactDate: "2 days ago",
    followedUp: true,
  },
  {
    id: "liya",
    name: "Liya",
    status: "won",
    priority: "low",
    summary: "Payment completed and handoff is scheduled.",
    suggestedFollowup: "",
    suggestedFollowupDate: "",
    lastContactDate: "3 days ago",
    followedUp: true,
  },
  {
    id: "sajid",
    name: "Sajid",
    status: "won",
    priority: "low",
    summary: "First order placed successfully.",
    suggestedFollowup: "",
    suggestedFollowupDate: "",
    lastContactDate: "1 week ago",
    followedUp: true,
  },
];

export const statusMeta: Record<LeadStatus, { label: string; color: string; dot: string }> = {
  hot: { label: "Hot", color: "text-red-700 bg-red-50 border-red-100", dot: "bg-red-500" },
  warm: { label: "Warm", color: "text-amber-700 bg-amber-50 border-amber-100", dot: "bg-amber-500" },
  cold: { label: "Cold", color: "text-blue-700 bg-blue-50 border-blue-100", dot: "bg-blue-500" },
  won: { label: "Won", color: "text-emerald-700 bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
  lost: { label: "Lost", color: "text-zinc-600 bg-zinc-100 border-zinc-200", dot: "bg-zinc-400" },
};
