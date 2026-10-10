"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Check, ChevronDown, FileUp, LockKeyhole, MessageCircle, Mic2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

type ApiError = { code?: string; message: string; requestId?: string; hint?: string; entries?: string[] };

function formatApiError(error: ApiError | undefined, fallback: string) {
  if (!error) return fallback;
  const parts = [error.message];
  if (error.hint && error.hint !== error.message) parts.push(error.hint);
  if (error.entries?.length) parts.push(`Archive entries: ${error.entries.join(", ")}`);
  if (error.code) parts.push(`Code: ${error.code}`);
  if (error.requestId) parts.push(`Request: ${error.requestId}`);
  return parts.join(" ");
}

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [account, setAccount] = useState<{ name: string; isAdmin: boolean } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const loadAccount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAccount(null); return; }
      const { data: profile } = await supabase.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle();
      const metadataName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
      const fallbackName = user.email?.split("@")[0] ?? "Account";
      setAccount({ name: profile?.full_name || metadataName || fallbackName, isAdmin: profile?.role === "admin" });
    };
    void loadAccount();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { window.setTimeout(() => void loadAccount(), 0); });
    return () => subscription.unsubscribe();
  }, []);
  const requireSignIn = async () => { const supabase = createClient(); const { data: { user } } = supabase ? await supabase.auth.getUser() : { data: { user: null } }; if (user) return true; toast.info("Sign in before uploading a WhatsApp export."); router.push("/login?next=/"); return false; };
  const openFilePicker = async () => { if (await requireSignIn()) inputRef.current?.click(); };
  const chooseFile = async (selected?: File) => {
    if (!selected || !(await requireSignIn())) return;
    if (!selected.name.toLowerCase().endsWith(".zip")) { toast.error("Please upload a WhatsApp .zip export."); return; }
    setFile(selected); setProcessing(true);
    try {
      const body = new FormData();
      body.append("file", selected);
      const uploadResponse = await fetch("/api/upload", { method: "POST", body });
      const uploadResult = await uploadResponse.json() as { success: boolean; data?: { uploadId: string; messageCount: number }; error?: ApiError };
      if (!uploadResponse.ok || !uploadResult.success || !uploadResult.data) {
        console.error("Loopin upload failed", uploadResult);
        throw new Error(formatApiError(uploadResult.error, "Upload failed"));
      }
      const processResponse = await fetch("/api/process", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uploadId: uploadResult.data.uploadId }) });
      const processResult = await processResponse.json() as { success: boolean; error?: ApiError };
      if (!processResponse.ok || !processResult.success) {
        console.error("Loopin processing failed", processResult);
        throw new Error(formatApiError(processResult.error, "Processing failed"));
      }
      toast.success(`${uploadResult.data.messageCount} messages processed. Your leads are ready.`);
    } catch (error) {
      setFile(null);
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally { setProcessing(false); }
  };
  return <main className="min-h-screen bg-white text-[#111936]">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10"><Logo /><nav className="hidden items-center gap-8 text-xs font-medium text-slate-600 md:flex"><a href="#how">How it works</a><a href="#privacy">Privacy</a><Link href={account ? (account.isAdmin ? "/admin" : "/followups") : "/login"}>{account?.name ?? "Sign in"}</Link><Link href={account ? (account.isAdmin ? "/admin" : "/followups") : "/signup"} className="rounded-lg bg-indigo-600 px-5 py-3 text-white shadow-lg shadow-indigo-200">{account ? "Open workspace" : "Get started"}</Link></nav><Link href={account ? (account.isAdmin ? "/admin" : "/followups") : "/login"} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white md:hidden">{account?.name ?? "Sign in"}</Link></header>
    <section className="mx-auto grid max-w-7xl items-center gap-12 px-6 pb-16 pt-14 lg:grid-cols-[1.02fr_.98fr] lg:px-10 lg:pb-24 lg:pt-20"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-indigo-500">WhatsApp-first sales CRM</p><h1 className="mt-5 max-w-xl text-5xl font-bold leading-[1.03] tracking-[-.055em] sm:text-6xl">Never let a WhatsApp lead go cold.</h1><p className="mt-6 max-w-lg text-base leading-7 text-slate-600">Upload your exported WhatsApp chat. We&apos;ll transcribe, analyze, and tell you exactly who to follow up with.</p><div className="mt-8 rounded-2xl border border-dashed border-indigo-300 bg-[#fbfcff] p-5" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); chooseFile(event.dataTransfer.files[0]); }}><div className="flex min-h-[200px] flex-col items-center justify-center rounded-xl text-center"><input ref={inputRef} type="file" accept=".zip" className="hidden" onChange={(event) => chooseFile(event.target.files?.[0])} /><div className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-100 text-indigo-600"><FileUp size={28} /></div><p className="mt-4 text-sm font-semibold">{file ? file.name : "Drop your WhatsApp export (.zip) here"}</p><p className="mt-1 text-sm text-slate-500">or</p><button type="button" onClick={openFilePicker} className="mt-3 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white">{processing ? "Preparing..." : "Browse files"}</button><p className="mt-4 text-xs text-slate-400">Only .zip files exported from WhatsApp are supported.</p></div></div></div><div className="relative hidden min-h-[430px] lg:block"><div className="absolute right-2 top-10 h-72 w-72 rounded-full bg-indigo-100/70 blur-3xl" /><div className="relative mx-auto max-w-[500px] rounded-[36px] border border-indigo-100 bg-gradient-to-br from-indigo-50 to-white p-10 shadow-2xl shadow-indigo-100"><div className="rounded-2xl bg-white p-5 shadow-lg"><div className="flex items-center gap-3"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-500 text-white"><MessageCircle size={27} /></div><div><p className="font-bold">WhatsApp conversation</p><p className="text-xs text-slate-400">3 leads found</p></div></div><div className="mt-5 space-y-3">{[["Arjun Nair","Hot","bg-red-500"],["Fathima Rahman","Warm","bg-amber-500"],["Ramees","Cold","bg-blue-500"]].map(([name, status, color]) => <div key={name} className="flex items-center justify-between rounded-xl border border-slate-100 p-3"><span className="text-sm font-semibold">{name}</span><span className="flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-1 text-xs text-slate-600"><i className={`h-2 w-2 rounded-full ${color}`} />{status}</span></div>)}</div></div><div className="mt-5 flex items-center gap-3 rounded-2xl bg-[#111936] p-5 text-white shadow-xl"><div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500"><Sparkles size={22} /></div><div><p className="text-sm font-semibold">Your next best follow-up</p><p className="mt-1 text-xs text-slate-300">Arjun promised to confirm today.</p></div></div></div></div></section>
    <section id="how" className="border-t border-slate-100 bg-[#f7f8fc] px-6 py-16 lg:px-10"><div className="mx-auto max-w-7xl"><div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.18em] text-indigo-500">How it works</p><h2 className="mt-3 text-3xl font-bold tracking-tight">From chat export to clear next steps.</h2></div><Link href="/signup" className="flex items-center gap-2 text-sm font-semibold text-indigo-600">Create your workspace <ArrowRight size={16} /></Link></div><div className="mt-10 grid gap-4 md:grid-cols-3">{[[FileUp,"1","Upload your chat","Export a WhatsApp chat with media and drop the .zip here."],[Mic2,"2","We find the signal","Voice notes are transcribed and the conversation is summarized."],[Check,"3","You follow up","See who needs your attention and review every draft yourself."]].map(([Icon, number, title, copy]) => <div key={number as string} className="rounded-2xl border border-slate-200 bg-white p-6"><div className="flex items-center justify-between"><div className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={21} /></div><span className="text-4xl font-bold text-slate-100">{number as string}</span></div><h3 className="mt-7 text-lg font-bold">{title as string}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{copy as string}</p></div>)}</div></div></section>
    <section id="privacy" className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-12 sm:flex-row sm:items-center sm:justify-between lg:px-10"><div className="flex items-center gap-4"><div className="grid h-11 w-11 place-items-center rounded-xl bg-slate-100"><LockKeyhole size={19} /></div><div><p className="font-semibold">Your data stays private</p><p className="text-sm text-slate-500">You control your workspace and every message sent.</p></div></div><p className="flex items-center gap-2 text-sm text-slate-400"><ChevronDown size={15} /> Human-led by design</p></section>
  </main>;
}
