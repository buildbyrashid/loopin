import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    if (supabase) {
      const { data: { user } } = await supabase.auth.exchangeCodeForSession(code);
      if (user) {
        const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
        return NextResponse.redirect(new URL(profile?.role === "admin" ? "/admin" : "/followups", request.url));
      }
    }
  }
  return NextResponse.redirect(new URL("/login", request.url));
}
