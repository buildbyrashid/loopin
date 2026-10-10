import { AuthForm } from "@/components/auth-form";
import { Suspense } from "react";

async function LoginContent({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const params = await searchParams;
  const nextPath = params.next?.startsWith("/") && !params.next.startsWith("//") ? params.next : "/followups";
  return <AuthForm mode="login" nextPath={nextPath} />;
}

function Loading() { return <main className="grid min-h-screen place-items-center bg-slate-50 p-6 text-sm text-slate-500">Loading sign in...</main>; }
export default function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) { return <Suspense fallback={<Loading />}><LoginContent searchParams={searchParams} /></Suspense>; }
