"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileUp,
  Sparkles,
  Check,
  Mic2,
  LockKeyhole,
  AlertCircle,
  HelpCircle,
  Smartphone,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

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

export function ChatImportView() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("Preparing your export...");
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const chooseFile = async (selected?: File) => {
    if (!selected) return;
    if (!selected.name.toLowerCase().endsWith(".zip")) {
      toast.error("Please upload a WhatsApp .zip export archive.");
      return;
    }
    setFile(selected);
    setProcessing(true);
    setProgress(2);
    setProgressMessage("Uploading your export archive...");
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

      setProgress(8);
      setProgressMessage("Upload complete. Extracting transcript & audio notes...");

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
        `${uploadResult.data.messageCount} messages processed. Your leads are ready!`
      );
      router.push("/followups");
      router.refresh();
    } catch (error) {
      setFile(null);
      setProgress(0);
      setProgressMessage("Preparing your export...");
      toast.error(
        error instanceof Error ? error.message : "Something went wrong while processing the chat."
      );
    } finally {
      if (progressTimer !== undefined) window.clearInterval(progressTimer);
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <p className="text-xs font-semibold tracking-wide text-[#4F46E5]">
          Workspace Pipeline
        </p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Import WhatsApp Chat
        </h1>
        <p className="mt-1.5 text-xs text-slate-500 sm:text-sm">
          Drop your WhatsApp export .zip file with media. Loopin automatically transcribes voice notes in Malayalam and English, extracts buying signals and promises, and schedules priority follow-ups.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Column: Drag & Drop Area */}
        <div className="space-y-5">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              chooseFile(e.dataTransfer.files[0]);
            }}
            className={`relative rounded-3xl border-2 border-dashed p-8 transition sm:p-12 ${
              dragActive
                ? "border-indigo-500 bg-indigo-50/50"
                : "border-slate-200 bg-white hover:border-indigo-300 shadow-2xs"
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".zip"
              className="hidden"
              onChange={(e) => chooseFile(e.target.files?.[0])}
            />

            <div className="flex flex-col items-center justify-center text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-indigo-50 text-indigo-600 ring-8 ring-indigo-50/60">
                <FileUp size={30} />
              </div>

              <h2 className="mt-5 text-base font-bold text-slate-900 sm:text-lg">
                {file ? file.name : "Drop WhatsApp export (.zip) here"}
              </h2>

              {processing ? (
                <div className="mt-6 w-full max-w-md">
                  <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                    <span className="truncate pr-2">{progressMessage}</span>
                    <span className="shrink-0">{progress}%</span>
                  </div>

                  <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#4F46E5] transition-all duration-300"
                      style={{ width: `${Math.max(2, Math.min(progress, 100))}%` }}
                    />
                  </div>

                  <p className="mt-3 text-center text-xs text-slate-400">
                    Synthesizing conversations, transcribing voice notes, and calculating follow-up timings...
                  </p>
                </div>
              ) : (
                <>
                  <p className="mt-1.5 max-w-sm text-xs leading-relaxed text-slate-500">
                    Must include <span className="font-semibold text-slate-700">_chat.txt</span> and attached voice notes (.opus / .m4a / .ogg).
                  </p>

                  <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => inputRef.current?.click()}
                      className="inline-flex items-center gap-2 rounded-xl bg-[#4F46E5] px-5 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#4338CA] active:scale-[0.98]"
                    >
                      <FileUp size={15} />
                      <span>Choose .zip file</span>
                    </button>
                  </div>

                  <p className="mt-4 text-[11px] font-medium text-slate-400">
                    Supports 1-on-1 prospect conversations exported from WhatsApp
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Quick Info Strip */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                <Check size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">100% Human-Led</p>
                <p className="text-[11px] text-slate-400 truncate">No bots or auto-replies</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Mic2 size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Malayalam &amp; English</p>
                <p className="text-[11px] text-slate-400 truncate">Whisper voice parsing</p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-2xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-slate-100 text-slate-600">
                <LockKeyhole size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Private &amp; Secure</p>
                <p className="text-[11px] text-slate-400 truncate">Encrypted storage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Step-by-Step Instructions */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/80 bg-white p-6 shadow-2xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
                <Smartphone size={16} />
              </div>
              <h2 className="text-sm font-bold text-slate-900">How to export from WhatsApp</h2>
            </div>

            <ol className="mt-5 space-y-4 text-xs">
              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 font-bold text-slate-700">
                  1
                </span>
                <div>
                  <p className="font-bold text-slate-800">Open WhatsApp Chat</p>
                  <p className="mt-0.5 text-slate-500">
                    Open the chat thread with your prospect or lead on your phone.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 font-bold text-slate-700">
                  2
                </span>
                <div>
                  <p className="font-bold text-slate-800">Tap Chat Name or ⋮ Menu</p>
                  <p className="mt-0.5 text-slate-500">
                    On Android, tap the three dots &rarr; <span className="font-medium text-slate-700">More</span> &rarr; <span className="font-medium text-slate-700">Export chat</span>. On iOS, tap the contact name at the top &rarr; scroll down &rarr; <span className="font-medium text-slate-700">Export Chat</span>.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-indigo-50 font-bold text-indigo-600">
                  3
                </span>
                <div>
                  <p className="font-bold text-indigo-900">Select &ldquo;Attach Media&rdquo;</p>
                  <p className="mt-0.5 text-slate-500">
                    Always choose <span className="font-bold text-slate-800">Attach Media</span> so voice notes, images, and documents are included in the .zip export.
                  </p>
                </div>
              </li>

              <li className="flex gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-slate-100 font-bold text-slate-700">
                  4
                </span>
                <div>
                  <p className="font-bold text-slate-800">Drop the .zip file here</p>
                  <p className="mt-0.5 text-slate-500">
                    Share or air-drop the generated .zip file to your computer and drag it into the box on the left.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Value callout */}
          <div className="rounded-2xl border border-indigo-100/70 bg-[#F5F6FF] p-5">
            <div className="flex items-start gap-3">
              <Sparkles size={18} className="mt-0.5 shrink-0 text-indigo-600" />
              <div>
                <p className="text-xs font-bold text-slate-900">What happens next?</p>
                <p className="mt-1 text-[11px] leading-relaxed text-slate-600">
                  Loopin reads the transcript, transcribes every voice note, identifies client objections and timelines, and creates draft follow-up messages ready for your 1-click review.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
