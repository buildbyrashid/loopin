import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";

export async function requireAdmin() {
  const user = await getUser();
  if (!user) redirect("/login?next=/admin");

  const adminClient = createAdminClient();
  if (!adminClient) redirect("/settings?error=admin-config");

  const { data: profile } = await adminClient
    .from("profiles")
    .select("id,email,full_name,role,plan,created_at")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.role !== "admin") redirect("/followups?error=admin-required");
  return { user, profile, adminClient };
}
