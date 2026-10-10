"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, Database, LayoutDashboard, LogOut, ShieldCheck, UsersRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/app-shell";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: UsersRound },
  { href: "/admin/leads", label: "Leads", icon: BarChart3 },
  { href: "/admin/uploads", label: "Uploads", icon: Database },
];

export function AdminShell({ children, email }: { children: React.ReactNode; email?: string | null }) {
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
      <aside className="fixed inset-y-0 left-0 hidden w-[242px] border-r border-slate-200/80 bg-slate-950 px-5 py-7 text-white lg:flex lg:flex-col">
        <Logo />
        <div className="mt-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300"><ShieldCheck size={14} /> Admin console</div>
        <nav className="mt-10 space-y-2">
          {nav.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));
            return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${active ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"}`}><Icon size={17} />{label}</Link>;
          })}
        </nav>
        <div className="mt-auto space-y-2">
          <button onClick={signOut} className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"><LogOut size={17} />Log out</button>
          <div className="mt-5 border-t border-slate-800 pt-5"><p className="truncate text-xs text-slate-400">{email ?? "Admin account"}</p><p className="mt-1 text-xs font-semibold text-indigo-300">Administrator</p></div>
        </div>
      </aside>
      <div className="lg:pl-[242px]"><header className="flex items-center justify-between border-b border-slate-200/80 bg-white px-5 py-4 lg:hidden"><Logo /><span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Admin</span></header><main className="mx-auto min-h-screen max-w-[1400px] px-5 py-7 sm:px-8 lg:px-10 lg:py-10">{children}</main></div>
    </div>
  );
}
