import { statusMeta, type LeadStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: LeadStatus }) {
  const meta = statusMeta[status];
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.color}`}><span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />{meta.label}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const styles = priority === "high" ? "bg-red-50 text-red-700" : priority === "low" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700";
  return <span className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${styles}`}>{priority === "unclear" ? "Unclear" : priority}</span>;
}
