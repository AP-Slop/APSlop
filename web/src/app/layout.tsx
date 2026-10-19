import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/Header";
import { fdroidRepoUrl, publicEnv } from "@/lib/env";

export const metadata: Metadata = {
  title: { default: publicEnv.siteName, template: `%s · ${publicEnv.siteName}` },
  description: "Apps made by everyone on campus: browse and install them, or describe one and AI writes the code.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <footer className="border-t border-border text-fg-muted text-xs py-6 mt-12">
          <div className="max-w-6xl mx-auto px-4 flex flex-wrap gap-4 justify-between">
            <span>{publicEnv.siteName} — a campus community GitHub</span>
            <span>
              F-Droid repository: <code className="font-mono">{fdroidRepoUrl()}</code>
            </span>
          </div>
        </footer>
      </body>
    </html>
  );
}
