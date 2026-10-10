"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, LogOut, Settings, UsersRound, UploadCloud } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const nav = [
  { href: "/followups", label: "Follow-ups", icon: LayoutDashboard },
  { href: "/leads", label: "Leads", icon: UsersRound },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Logo() {
  return <Link href="/" className="text-[24px] font-bold tracking-[-0.06em] text-slate-950">Loop<span className="text-indigo-600">in</span></Link>;
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
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
          <div className="mt-8 flex items-center gap-3 border-t border-slate-100 pt-5"><div className="grid h-9 w-9 place-items-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">R</div><div><p className="text-sm font-semibold">Rashid</p><p className="text-xs text-slate-400">Founder</p></div></div>
        </div>
      </aside>
      <div className="lg:pl-[242px]">
        <header className="flex items-center justify-between border-b border-slate-200/80 bg-white px-5 py-4 lg:hidden"><Logo /><button className="rounded-lg p-2 text-slate-600"><span className="sr-only">Menu</span>☰</button></header>
        <main className="mx-auto min-h-screen max-w-[1400px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">{children}</main>
      </div>
    </div>
  );
}
