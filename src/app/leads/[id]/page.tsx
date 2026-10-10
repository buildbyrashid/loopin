import { AppShell } from "@/components/app-shell";
import { LeadDetailView } from "@/components/lead-detail-view";
import { demoLeads } from "@/lib/types";

export function generateStaticParams() {
  return demoLeads.map((lead) => ({ id: lead.id }));
}

export default async function LeadPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <AppShell><LeadDetailView id={id} /></AppShell>; }
