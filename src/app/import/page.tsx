import { AppShell } from "@/components/app-shell";
import { ChatImportView } from "@/components/chat-import-view";

export const metadata = {
  title: "Import WhatsApp Chat — Loopin",
  description: "Upload and analyze your WhatsApp chat export to extract leads and follow-up recommendations.",
};

export default function ImportPage() {
  return (
    <AppShell>
      <ChatImportView />
    </AppShell>
  );
}
