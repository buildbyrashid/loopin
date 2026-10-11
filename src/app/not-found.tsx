import Link from "next/link";
import { Logo } from "@/components/app-shell";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f7f8fc] px-6 text-center">
      <div>
        <div className="flex justify-center">
          <Logo className="h-8 w-auto" />
        </div>
        <h1 className="mt-6 text-6xl font-bold">404</h1>
        <p className="mt-3 text-sm text-slate-500">That page doesn&apos;t exist.</p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white"
        >
          Back home
        </Link>
      </div>
    </main>
  );
}
