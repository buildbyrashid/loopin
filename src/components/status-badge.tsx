import { Flame } from "lucide-react";
import { statusMeta, type LeadStatus } from "@/lib/types";

export function StatusBadge({ status }: { status: LeadStatus }) {
  const meta = statusMeta[status] ?? statusMeta.warm;
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${meta.color}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: string }) {
  const normalized = priority.toLowerCase();
  if (normalized === "high") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-100/80 bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600">
        <Flame size={12} className="fill-rose-500 text-rose-500" />
        High
      </span>
    );
  }
  if (normalized === "low") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100/80 bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-600">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
        Low
      </span>
    );
  }
  // medium or unclear
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100/80 bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-600">
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      Medium
    </span>
  );
}
