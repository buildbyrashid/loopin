import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { ToastProvider } from "@/components/toast-provider";

export const metadata: Metadata = {
  title: "Loopin — WhatsApp lead follow-up",
  description:
    "Loopin helps founders keep WhatsApp leads warm with clear summaries and human-reviewed follow-ups.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col">{children}<ToastProvider /></body>
    </html>
  );
}
