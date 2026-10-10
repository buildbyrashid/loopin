import { AdminOverview } from "@/components/admin-data";
import { connection } from "next/server";
import { Suspense } from "react";

async function AdminOverviewContent() {
  await connection();
  return <AdminOverview />;
}

function AdminLoading() {
  return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-sm text-slate-500">Loading admin console...</main>;
}

export default function AdminPage() {
  return <Suspense fallback={<AdminLoading />}><AdminOverviewContent /></Suspense>;
}
