"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronRight,
  Crown,
  Home,
  LogOut,
  Search,
  Settings,
  UploadCloud,
  UsersRound,
  X,
  Menu,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toast } from "sonner";

const navItems = [
  { href: "/followups", label: "Follow-ups", icon: Home },
  { href: "/leads", label: "Leads", icon: UsersRound },
  { href: "/import", label: "Import chat", icon: UploadCloud },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Logo({
  className = "h-9 w-auto",
  light = false,
}: {
  className?: string;
  light?: boolean;
} = {}) {
  return (
    <Link href="/" className="inline-flex items-center gap-2">
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
  const [leadsCount, setLeadsCount] = useState<number>(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formattedDate, setFormattedDate] = useState("Thu, 9 Oct 2026");

  useEffect(() => {
    setFormattedDate(
      new Intl.DateTimeFormat("en-GB", {
        weekday: "short",
        day: "numeric",
        month: "short",
        year: "numeric",
      }).format(new Date())
    );
  }, []);

  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;
    const loadAccount = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setAccount({ name: "Account", role: "Client" });
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name,role")
        .eq("id", user.id)
        .maybeSingle();

      const { count } = await supabase
        .from("leads")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user.id);

      if (typeof count === "number") {
        setLeadsCount(count);
      }

      const metadataName =
        typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : "";
      const fallbackName = user.email?.split("@")[0] ?? "Account";
      setAccount({
        name: profile?.full_name || metadataName || fallbackName,
        role: profile?.role === "admin" ? "Admin" : "Client",
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

  const signOut = async () => {
    const supabase = createClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const initial = account.name.trim().charAt(0).toUpperCase() || "N";

  return (
    <div className="min-h-screen bg-[#f8f9fd] text-slate-900 antialiased selection:bg-indigo-500 selection:text-white">
      {/* Sidebar for Desktop */}
      <aside className="fixed inset-y-0 left-0 hidden w-[250px] flex-col justify-between border-r border-slate-200/80 bg-white px-5 py-6 lg:flex">
        <div>
          {/* Logo */}
          <div className="px-2">
            <Logo className="h-9 w-auto" />
          </div>

          {/* Navigation Links */}
          <nav className="mt-9 space-y-1.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const active =
                href === "/followups"
                  ? pathname === "/followups" || pathname.startsWith("/followups/")
                  : href === "/"
                  ? pathname === "/"
                  : pathname === href || pathname.startsWith(`${href}/`);
              return (
                <Link
                  key={label}
                  href={href}
                  className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                    active
                      ? "bg-[#EEF2FF] text-[#4F46E5]"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                  }`}
                >
                  <Icon
                    size={19}
                    className={active ? "text-[#4F46E5]" : "text-slate-400"}
                  />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Widgets */}
        <div className="space-y-4">
          {/* Pro Plan Box */}
          <div className="rounded-2xl border border-indigo-100/70 bg-[#F5F6FF] p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-8 w-8 place-items-center rounded-xl bg-indigo-100/80 text-indigo-600">
                <Crown size={16} />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-900">Workspace</p>
                <p className="text-[11px] text-slate-500">{leadsCount} leads</p>
              </div>
            </div>

            <div className="mt-3 flex items-center justify-between gap-2.5">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200/80">
                <div
                  className="h-full rounded-full bg-[#4F46E5] transition-all"
                  style={{
                    width: `${Math.max(
                      Math.min(Math.round((leadsCount / 250) * 100), 100),
                      leadsCount > 0 ? 5 : 0
                    )}%`,
                  }}
                />
              </div>
              <span className="text-[11px] font-bold text-slate-600">
                {Math.min(Math.round((leadsCount / 250) * 100), 100)}%
              </span>
            </div>

            <button
              onClick={() =>
                toast.info("Unlimited lead extractions included in your plan.")
              }
              className="mt-3.5 w-full rounded-xl bg-[#4F46E5] py-2 text-center text-xs font-semibold text-white shadow-xs transition hover:bg-[#4338CA] active:scale-[0.99]"
            >
              Upgrade Plan
            </button>
          </div>

          {/* Profile Card */}
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex w-full items-center gap-3 rounded-xl border border-transparent p-2 text-left transition hover:bg-slate-50"
            >
              <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#1e232d] text-xs font-bold text-white shadow-xs">
                {initial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-bold text-slate-800">
                  {account.name}
                </p>
                <p className="truncate text-[11px] text-slate-400">
                  {account.role}
                </p>
              </div>
              <ChevronRight size={16} className="text-slate-400" />
            </button>

            {profileDropdownOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                <Link
                  href="/settings"
                  onClick={() => setProfileDropdownOpen(false)}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  <Settings size={14} /> Account Settings
                </Link>
                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-[250px]">
        {/* Top Navbar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/95 px-5 backdrop-blur-xs sm:px-8">
          {/* Left: Mobile Menu Toggle / Search input */}
          <div className="flex flex-1 items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            >
              <Menu size={20} />
            </button>

            <div className="relative w-full max-w-sm sm:max-w-md">
              <Search
                size={16}
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search leads, messages, or keywords..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-14 text-xs font-medium text-slate-800 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 shadow-2xs"
              />
              <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded border border-slate-200 bg-slate-50 px-1.5 py-0.5 text-[10px] font-semibold text-slate-400">
                Ctrl K
              </kbd>
            </div>
          </div>

          {/* Right: Date Badge & Profile Menu */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-xl border border-slate-200/90 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs sm:flex">
              <Calendar size={15} className="text-slate-500" />
              <span>{formattedDate}</span>
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 rounded-xl border border-slate-200/90 bg-white px-2.5 py-1.5 shadow-2xs transition hover:bg-slate-50"
              >
                <div className="grid h-7 w-7 place-items-center rounded-full bg-[#1e232d] text-xs font-bold text-white">
                  {initial}
                </div>
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-bold leading-none text-slate-800">
                    {account.name}
                  </p>
                  <p className="text-[10px] leading-none text-slate-400 mt-1">
                    {account.role}
                  </p>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg">
                  <div className="border-b border-slate-100 px-3 py-2 sm:hidden">
                    <p className="text-xs font-bold text-slate-800">{account.name}</p>
                    <p className="text-[10px] text-slate-400">{account.role}</p>
                  </div>
                  <Link
                    href="/settings"
                    onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    <Settings size={14} /> Account Settings
                  </Link>
                  <button
                    onClick={signOut}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-medium text-rose-600 hover:bg-rose-50"
                  >
                    <LogOut size={14} /> Log out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative flex w-72 flex-col justify-between bg-white p-6 shadow-xl">
              <div>
                <div className="flex items-center justify-between">
                  <Logo className="h-8 w-auto" />
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg p-1 text-slate-400 hover:bg-slate-100"
                  >
                    <X size={20} />
                  </button>
                </div>
                <nav className="mt-8 space-y-1.5">
                  {navItems.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={label}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-3.5 rounded-xl px-3.5 py-3 text-sm font-semibold transition ${
                        pathname === href
                          ? "bg-[#EEF2FF] text-[#4F46E5]"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon size={19} />
                      {label}
                    </Link>
                  ))}
                </nav>
              </div>

              <div className="space-y-4 pt-6 border-t border-slate-100">
                <button
                  onClick={signOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-medium text-rose-600 hover:bg-rose-50"
                >
                  <LogOut size={18} /> Log out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Page Main Content */}
        <main className="mx-auto min-h-[calc(100vh-4rem)] max-w-7xl px-5 py-7 sm:px-8 lg:px-9 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
