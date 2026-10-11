"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, LogOut, Settings, UsersRound, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/followups", label: "Follow-ups", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: UsersRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Logo({
  className = "h-10 sm:h-11 w-auto",
  light = false,
}: {
  className?: string;
  light?: boolean;
} = {}) {
  return (
    <Link href="/" className="inline-flex items-center">
      <img
        src="/images/Loopin Infinity Logo.png"
        alt="Loopin"
        className={`${className} object-contain transition-opacity hover:opacity-90 ${
          light ? "brightness-0 invert" : ""
        }`}
      />
    </Link>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [account, setAccount] = useState({ name: "Account", role: "Client" });
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const loadAccount = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setAccount({ name: "Account", role: "Client" }); return; }
      const { data: profile } = await supabase.from("profiles").select("full_name,role").eq("id", user.id).maybeSingle();
      const metadataName = typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name : "";
      const fallbackName = user.email?.split("@")[0] ?? "Account";
      setAccount({ name: profile?.full_name || metadataName || fallbackName, role: profile?.role === "admin" ? "Admin" : "Client" });
    };
    void loadAccount();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { window.setTimeout(() => void loadAccount(), 0); });
    return () => subscription.unsubscribe();
  }, []);
  const signOut = async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-[#f7f8fc] text-slate-950">
      <aside className="fixed inset-y-0 left-0 hidden w-[242px] border-r border-slate-200/80 bg-white px-5 py-7 lg:flex lg:flex-col">
        <Logo />
        <nav className="mt-12 space-y-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(`${href}/`);
            return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-indigo-50 text-indigo-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}><Icon size={17} />{label}</Link>;
          })}
        </nav>
        <div className="mt-auto">
          <Link href="/" className="mb-3 flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-500 hover:bg-slate-50"><UploadCloud size={17} />Import chat</Link>
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-slate-900"><LogOut size={17} />Log out</button>
          <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-5"><div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">{account.name.trim().charAt(0).toUpperCase()}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{account.name}</p><p className="text-xs text-slate-400">{account.role}</p></div></div>
        </div>
      </aside>
      <div className="lg:pl-[242px]">
        <header className="flex items-center justify-between border-b border-slate-200/80 bg-white px-5 py-4 lg:hidden"><Logo /><button className="rounded-lg p-2 text-slate-600"><span className="sr-only">Menu</span>☰</button></header>
        <main className="mx-auto min-h-screen max-w-[1400px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
