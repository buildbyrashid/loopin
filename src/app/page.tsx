"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bot,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  FileUp,
  Flame,
  HelpCircle,
  LockKeyhole,
  MessageCircle,
  Mic2,
  ShieldCheck,
  Sparkles,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/app-shell";
import { createClient } from "@/lib/supabase/client";

type ApiError = {
  code?: string;
  message: string;
  requestId?: string;
  hint?: string;
  entries?: string[];
};

type UploadProgress = {
  status: "processing" | "completed" | "failed";
  progress: number;
  progress_message: string | null;
  error_message: string | null;
};

function formatApiError(error: ApiError | undefined, fallback: string) {
  if (!error) return fallback;
  const parts = [error.message];
  if (error.hint && error.hint !== error.message) parts.push(error.hint);
  if (error.entries?.length) parts.push(`Archive entries: ${error.entries.join(", ")}`);
  if (error.code) parts.push(`Code: ${error.code}`);
  if (error.requestId) parts.push(`Request: ${error.requestId}`);
  return parts.join(" ");
}

const faqs = [
  {
    q: "Why not just use WhatsApp Business API or automated chatbots?",
    a: "Trust-based sales (consulting, agencies, coaching, advisory) require genuine human conversation. Automated bots and canned replies kill deals when prospects have real objections. Loopin protects your personal sales motion—we just make sure you never forget what was discussed.",
  },
  {
    q: "Does AI ever send messages directly to my leads?",
    a: "Never. Loopin is strictly 100% human-led. We transcribe the chat, extract objections, and draft a high-context follow-up message, but you always review, edit, and send it personally.",
  },
  {
    q: "Does Loopin understand voice notes in regional languages?",
    a: "Yes! Powered by OpenAI Whisper, Loopin natively transcribes voice notes in Malayalam, English, and Manglish, picking up client doubts, promises, and timelines accurately.",
  },
  {
    q: "How does Loopin detect who is high priority vs low priority?",
    a: "Loopin separates two distinct behaviors: 'Price-only' leads who ask for rates and go silent are flagged low priority. 'Engaged evaluators' who discuss features and give soft commitments (e.g. 'I'll confirm in 2 days') get urgent follow-up timers.",
  },
  {
    q: "Do I need to connect a CRM or configure API keys?",
    a: "Zero CRM or developer setup needed. Simply tap 'Export Chat' with media in your WhatsApp mobile app and drop the .zip file here. Loopin creates your pipeline instantly.",
  },
];

export default function Home() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("Preparing your export...");
  const [account, setAccount] = useState<{ name: string; isAdmin: boolean } | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const loadAccount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAccount(null);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,role")
        .eq("id", user.id)
        .maybeSingle();
      const metadataName =
        typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
      const fallbackName = user.email?.split("@")[0] ?? "Account";
      setAccount({
        name: profile?.full_name || metadataName || fallbackName,
        isAdmin: profile?.role === "admin",
      });
    };
    void loadAccount();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      window.setTimeout(() => void loadAccount(), 0);
    });
    return () => subscription.unsubscribe();
  }, []);

  const requireSignIn = async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = supabase ? await supabase.auth.getUser() : { data: { user: null } };
    if (user) return true;
    toast.info("Sign in before uploading a WhatsApp export.");
    router.push("/login?next=/");
    return false;
  };

  const openFilePicker = async () => {
    if (await requireSignIn()) inputRef.current?.click();
  };

  const chooseFile = async (selected?: File) => {
    if (!selected || !(await requireSignIn())) return;
    if (!selected.name.toLowerCase().endsWith(".zip")) {
      toast.error("Please upload a WhatsApp .zip export.");
      return;
    }
    setFile(selected);
    setProcessing(true);
    setProgress(1);
    setProgressMessage("Uploading your export...");
    let progressTimer: number | undefined;
    try {
      const body = new FormData();
      body.append("file", selected);
      const uploadResponse = await fetch("/api/upload", { method: "POST", body });
      const uploadResult = (await uploadResponse.json()) as {
        success: boolean;
        data?: { uploadId: string; messageCount: number };
        error?: ApiError;
      };
      if (!uploadResponse.ok || !uploadResult.success || !uploadResult.data) {
        console.error("Loopin upload failed", uploadResult);
        throw new Error(formatApiError(uploadResult.error, "Upload failed"));
      }
      setProgress(5);
      setProgressMessage("Upload complete. Starting analysis...");
      const readProgress = async () => {
        const response = await fetch(
          `/api/upload/status?uploadId=${encodeURIComponent(uploadResult.data!.uploadId)}`,
          { cache: "no-store" }
        );
        if (!response.ok) return;
        const result = (await response.json()) as { success: boolean; data?: UploadProgress };
        if (result.success && result.data) {
          setProgress(result.data.progress);
          if (result.data.progress_message) setProgressMessage(result.data.progress_message);
        }
      };
      void readProgress();
      progressTimer = window.setInterval(() => void readProgress(), 1000);
      const processResponse = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uploadId: uploadResult.data.uploadId }),
      });
      const processResult = (await processResponse.json()) as {
        success: boolean;
        error?: ApiError;
      };
      if (!processResponse.ok || !processResult.success) {
        console.error("Loopin processing failed", processResult);
        throw new Error(formatApiError(processResult.error, "Processing failed"));
      }
      toast.success(
        `${uploadResult.data.messageCount} messages processed. Your leads are ready.`
      );
      router.push("/followups");
    } catch (error) {
      setFile(null);
      setProgress(0);
      setProgressMessage("Preparing your export...");
      toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      if (progressTimer !== undefined) window.clearInterval(progressTimer);
      setProcessing(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <div className="flex items-center gap-8">
            <Logo />
            <span className="hidden rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-inset ring-indigo-200 sm:inline-block">
              WhatsApp-First Sales
            </span>
          </div>
          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#how" className="transition hover:text-indigo-600">
              How it works
            </a>
            <a href="#wedge" className="transition hover:text-indigo-600">
              Why Loopin
            </a>
            <a href="#faq" className="transition hover:text-indigo-600">
              FAQ
            </a>
            <Link
              href={account ? (account.isAdmin ? "/admin" : "/followups") : "/login"}
              className="text-slate-700 transition hover:text-indigo-600"
            >
              {account?.name ?? "Sign in"}
            </Link>
            <Link
              href={account ? (account.isAdmin ? "/admin" : "/followups") : "/signup"}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
            >
              {account ? "Open workspace" : "Get started free"}
              <ArrowRight size={15} />
            </Link>
          </nav>
          <Link
            href={account ? (account.isAdmin ? "/admin" : "/followups") : "/login"}
            className="rounded-lg bg-indigo-600 px-3.5 py-2 text-xs font-semibold text-white md:hidden"
          >
            {account?.name ?? "Sign in"}
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 lg:pt-20 lg:pb-24">
        {/* Subtle background glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-200/40 via-purple-100/30 to-blue-200/30 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-6 lg:grid-cols-[1.1fr_.9fr] lg:px-10">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-indigo-700 shadow-xs">
              <Sparkles size={14} className="text-indigo-600" />
              <span>100% Human-led sales intelligence for WhatsApp</span>
            </div>

            <h1 className="mt-5 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl lg:text-[46px] lg:leading-[1.15]">
              Never let a WhatsApp <br className="hidden sm:inline" />
              lead{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-500">
                go cold.
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
              When you sell through personal voice notes and messages, chatbots kill trust. But when
              leads pile up, follow-ups silently slip away. Loopin turns your exported chat into
              priority follow-up timers, objection summaries, and draft messages.
            </p>

            {/* Dropzone Upload Component */}
            <div
              className="mt-8 rounded-2xl border-2 border-dashed border-indigo-200 bg-white/90 p-6 shadow-sm transition hover:border-indigo-400"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                chooseFile(event.dataTransfer.files[0]);
              }}
            >
              <div className="flex flex-col items-center justify-center rounded-xl text-center">
                <input
                  ref={inputRef}
                  type="file"
                  accept=".zip"
                  className="hidden"
                  onChange={(event) => chooseFile(event.target.files?.[0])}
                />
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 ring-4 ring-indigo-50">
                  <FileUp size={28} />
                </div>
                <p className="mt-4 text-base font-semibold text-slate-900">
                  {file ? file.name : "Drop your WhatsApp chat export (.zip) here"}
                </p>

                {processing ? (
                  <div className="mt-5 w-full max-w-md text-left">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{progressMessage}</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                        style={{ width: `${Math.max(1, Math.min(progress, 100))}%` }}
                      />
                    </div>
                    <p className="mt-2.5 text-center text-xs text-slate-500">
                      Transcribing Malayalam &amp; English voice notes concurrently...
                    </p>
                  </div>
                ) : (
                  <>
                    <p className="mt-1 text-xs text-slate-500">
                      Includes <span className="font-semibold text-slate-700">_chat.txt</span> and{" "}
                      <span className="font-semibold text-slate-700">.opus voice notes</span>
                    </p>
                    <div className="mt-4 flex items-center gap-3">
                      <button
                        type="button"
                        onClick={openFilePicker}
                        className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-500"
                      >
                        Choose .zip export
                      </button>
                    </div>
                    <p className="mt-3 text-[11px] text-slate-400">
                      Export Chat &rarr; Include Media &rarr; Upload here
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Quick Proof Badges */}
            <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
              <span className="flex items-center gap-1.5">
                <Check size={14} className="text-emerald-500" /> 100% Human-led (zero auto-replies)
              </span>
              <span className="flex items-center gap-1.5">
                <Mic2 size={14} className="text-indigo-500" /> Malayalam, English &amp; Manglish
              </span>
              <span className="flex items-center gap-1.5">
                <LockKeyhole size={14} className="text-slate-400" /> Private &amp; encrypted
              </span>
            </div>
          </div>

          {/* Interactive Hero Visual Showcase */}
          <div className="relative">
            <div className="relative rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl lg:p-7">
              {/* WhatsApp chat & voice note illustration (as per user UI design) */}
              <div className="relative mb-4 rounded-2xl border border-indigo-100/70 bg-gradient-to-br from-indigo-50/70 via-slate-50/40 to-white/90 p-3.5 shadow-xs">
                {/* Top: WhatsApp icon + text message bubble */}
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#25D366] text-white shadow-md shadow-emerald-500/25">
                    <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                      <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm0 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.32a8.19 8.19 0 0 1-1.26-4.37c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.25 8.23zm4.52-6.17c-.25-.12-1.47-.72-1.7-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.07-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.47-1.39-1.72-.14-.25-.02-.38.11-.5.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.12-.56-1.34-.76-1.84-.2-.49-.4-.42-.56-.43h-.47c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.12.17 1.78 2.71 4.3 3.8.6.26 1.07.41 1.44.53.61.19 1.16.17 1.6.1.49-.07 1.47-.6 1.68-1.18.21-.58.21-1.07.15-1.18-.06-.12-.22-.19-.47-.31z" />
                    </svg>
                  </div>
                  {/* Incoming text message skeleton bubble */}
                  <div className="flex-1 rounded-2xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 rounded-full bg-slate-200" />
                      <div className="h-2 w-28 rounded-full bg-slate-200" />
                    </div>
                    <div className="mt-2 h-2 w-40 rounded-full bg-slate-100" />
                  </div>
                </div>

                {/* Bottom row: Voice note message bubble + curved arrow pointing down */}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-3.5 py-2.5 shadow-xs">
                    {/* Voice waveform icon */}
                    <div className="flex items-center gap-0.5 text-indigo-600">
                      <span className="inline-block h-2 w-0.5 rounded-full bg-indigo-400" />
                      <span className="inline-block h-3.5 w-0.5 rounded-full bg-indigo-500" />
                      <span className="inline-block h-5 w-0.5 rounded-full bg-indigo-600" />
                      <span className="inline-block h-3 w-0.5 rounded-full bg-indigo-500" />
                      <span className="inline-block h-4 w-0.5 rounded-full bg-indigo-600" />
                      <span className="inline-block h-2 w-0.5 rounded-full bg-indigo-400" />
                    </div>
                    {/* Audio track placeholders */}
                    <div className="space-y-1.5">
                      <div className="h-2 w-24 rounded-full bg-indigo-100" />
                      <div className="h-1.5 w-14 rounded-full bg-slate-100" />
                    </div>
                  </div>

                  {/* Curved arrow pointing down into extracted lead card */}
                  <div className="pr-4 pt-1">
                    <svg
                      width="38"
                      height="38"
                      viewBox="0 0 38 38"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="text-indigo-500"
                    >
                      <path
                        d="M6 10C18 10 26 16 26 28M26 28L21 23M26 28L31 23"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Lead 1: Engaged Evaluator (Hot) */}
              <div className="mt-4 rounded-2xl border border-red-100 bg-red-50/30 p-4 transition hover:shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-red-100 font-bold text-red-700 text-xs">
                      RN
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">Rahul Nair</p>
                      <p className="text-[11px] text-slate-500">Software Agency Lead</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    <Flame size={12} /> Hot Lead
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="rounded-lg bg-white p-2.5 border border-red-100/80">
                    <p className="font-semibold text-slate-700">
                      🎙️ Voice note transcript (Malayalam / English):
                    </p>
                    <p className="mt-0.5 text-slate-600 italic">
                      &quot;Feature integration looks good. Njan partner-odu discuss cheythitt Tuesday confirm cheyyam.&quot;
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] font-medium text-amber-700 pt-1">
                    <Clock size={13} /> Promise detected: Soft commitment for Tuesday &bull; Due Today
                  </div>
                </div>
              </div>

              {/* Lead 2: Price-only (Low Priority) */}
              <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-3.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="grid h-7 w-7 place-items-center rounded-full bg-slate-200 font-semibold text-slate-600 text-xs">
                      VS
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Vivek Sharma</p>
                      <p className="text-[10px] text-slate-400">Asked pricing &rarr; Went silent</p>
                    </div>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                    Low Priority
                  </span>
                </div>
              </div>

              {/* Bottom Insight Bar */}
              <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-900 px-4 py-3 text-white">
                <div className="flex items-center gap-2.5">
                  <Sparkles size={16} className="text-indigo-400" />
                  <span className="text-xs font-medium">
                    AI drafted personal follow-up ready for Rahul
                  </span>
                </div>
                <Link
                  href="/followups"
                  className="text-xs font-semibold text-indigo-300 hover:text-white"
                >
                  View draft &rarr;
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem / Wedge Comparison */}
      <section id="wedge" className="border-t border-slate-200/80 bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
              The Reality of Consultative Sales
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Why automated bots and typical CRMs fail on WhatsApp
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base text-slate-600">
              Clients need confidence before transferring money. They ask tricky questions over voice
              notes and expect an authentic person on the other end.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-3">
            {/* Box 1 */}
            <div className="rounded-2xl border border-red-100 bg-red-50/20 p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-red-100 text-red-600">
                <Bot size={24} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Chatbots Kill Deals</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Generic API chatbots send canned answers that feel robotic. When an agency or
                consulting client raises a nuanced doubt, a chatbot kills trust immediately.
              </p>
            </div>

            {/* Box 2 */}
            <div className="rounded-2xl border border-amber-100 bg-amber-50/20 p-6">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber-100 text-amber-600">
                <Clock size={24} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">CRMs Get Abandoned</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Re-listening to 2-minute voice notes and manually typing CRM notes at 11 PM never
                happens. Warm leads silently go cold simply because you ran out of time.
              </p>
            </div>

            {/* Box 3 */}
            <div className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-6 ring-1 ring-indigo-300">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-600 text-white shadow-sm">
                <ShieldCheck size={24} />
              </div>
              <h3 className="mt-5 text-lg font-bold text-slate-900">Loopin Protects Your Sales</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                Zero bots. Zero manual typing. Just drop your chat export: Loopin extracts promises,
                tags hot leads on a timer, and writes personalized drafts you send with one tap.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="border-t border-slate-200/80 bg-slate-50 py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-600">
                Simple 3-Step Flow
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
                From chat export to scheduled follow-up
              </h2>
            </div>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Get started in 30 seconds <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: FileUp,
                num: "01",
                title: "Export & Drop",
                desc: "In WhatsApp mobile, tap 'Export Chat' with media. Drop the .zip here—no CRM setup or API keys required.",
              },
              {
                icon: Mic2,
                num: "02",
                title: "Whisper & GPT Analysis",
                desc: "Voice notes in Malayalam, English, or Manglish are transcribed. Promises, objections, and timelines are surfaced instantly.",
              },
              {
                icon: Zap,
                num: "03",
                title: "You Review & Close",
                desc: "Loopin drafts high-context follow-up messages tailored to each lead. You review, tweak, and send directly from your WhatsApp.",
              },
            ].map(({ icon: Icon, num, title, desc }) => (
              <div
                key={num}
                className="group relative rounded-2xl border border-slate-200/80 bg-white p-7 shadow-xs transition hover:border-indigo-300 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition">
                    <Icon size={24} />
                  </div>
                  <span className="text-3xl font-extrabold text-slate-200">{num}</span>
                </div>
                <h3 className="mt-6 text-lg font-bold text-slate-900">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="border-t border-slate-200/80 bg-white py-16 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
              <HelpCircle size={14} /> Got Questions?
            </div>
            <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Everything you need to know about how Loopin protects your sales conversations.
            </p>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={faq.q}
                  className="rounded-2xl border border-slate-200 bg-white transition"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="flex w-full items-center justify-between px-6 py-5 text-left text-base font-bold text-slate-900"
                  >
                    <span>{faq.q}</span>
                    <span className="ml-4 text-slate-400">
                      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="border-t border-slate-100 px-6 pt-3 pb-6 text-sm leading-relaxed text-slate-600">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="bg-slate-900 py-16 text-white">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-10">
          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Stop losing high-value deals to busy schedules.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-base text-slate-300">
            Export any WhatsApp chat and experience how easy it is to keep every prospect in the
            loop.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:bg-indigo-500"
            >
              Get started free
            </Link>
            <Link
              href="/login"
              className="rounded-xl border border-slate-700 bg-slate-800 px-6 py-3.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              Sign in to workspace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-10 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row lg:px-10">
          <div className="flex items-center gap-3">
            <Logo />
            <span className="text-slate-300">|</span>
            <span>Never let a WhatsApp lead go cold.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#how" className="hover:text-slate-900">
              How it works
            </a>
            <a href="#wedge" className="hover:text-slate-900">
              Why Loopin
            </a>
            <a href="#faq" className="hover:text-slate-900">
              FAQ
            </a>
            <Link href="/login" className="hover:text-slate-900">
              Login
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
