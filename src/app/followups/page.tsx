import { AppShell } from "@/components/app-shell";
import { FollowupsView } from "@/components/followups-view";
import { getCurrentUserLeads } from "@/lib/leads";
import { connection } from "next/server";
import { Suspense } from "react";

async function FollowupsContent() {
  await connection();
  const leads = await getCurrentUserLeads();
  return <AppShell><FollowupsView initialLeads={leads} /></AppShell>;
}

function Loading() { return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-sm text-slate-500">Loading your workspace...</main>; }
export default function FollowupsPage() { return <Suspense fallback={<Loading />}><FollowupsContent /></Suspense>; }
