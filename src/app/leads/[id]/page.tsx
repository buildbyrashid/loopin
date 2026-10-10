import { AppShell } from "@/components/app-shell";
import { LeadDetailView } from "@/components/lead-detail-view";
import { getCurrentUserLead } from "@/lib/leads";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";

async function LeadContent({ id }: { id: string }) {
  await connection();
  const lead = await getCurrentUserLead(id);
  if (!lead) notFound();
  return <AppShell><LeadDetailView lead={lead} /></AppShell>;
}

function Loading() { return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-sm text-slate-500">Loading lead...</main>; }
async function LeadPageContent({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <LeadContent id={id} />; }
export default function LeadPage({ params }: { params: Promise<{ id: string }> }) { return <Suspense fallback={<Loading />}><LeadPageContent params={params} /></Suspense>; }
