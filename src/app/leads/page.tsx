import { AppShell } from "@/components/app-shell";
import { LeadsView } from "@/components/leads-view";
import { getCurrentUserLeads } from "@/lib/leads";
import { connection } from "next/server";
import { Suspense } from "react";

async function LeadsContent() {
  await connection();
  const leads = await getCurrentUserLeads();
  return <AppShell><LeadsView leads={leads} /></AppShell>;
}

function Loading() { return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-sm text-slate-500">Loading your leads...</main>; }
export default function LeadsPage() { return <Suspense fallback={<Loading />}><LeadsContent /></Suspense>; }
