import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`max-w-6xl mx-auto px-4 py-6 ${className}`}>{children}</div>;
}

export function Card({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
  return <div id={id} className={`rounded-md border border-border bg-canvas ${className}`}>{children}</div>;
}

export function CardHeader({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 py-2.5 bg-canvas-subtle border-b border-border rounded-t-md text-sm font-semibold flex items-center gap-2">
      {children}
    </div>
  );
}

const btn = {
  base: "inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors",
  default: "border-border bg-canvas-subtle hover:bg-[#eef1f4] text-fg",
  primary: "border-[#1f883d] bg-[#1f883d] hover:bg-[#1a7f37] text-white",
  danger: "border-border bg-canvas-subtle hover:bg-danger hover:text-white hover:border-danger text-danger",
};

export type ButtonVariant = keyof Omit<typeof btn, "base">;

export function buttonClass(variant: ButtonVariant = "default") {
  return `${btn.base} ${btn[variant]}`;
}

export function LinkButton({
  href,
  children,
  variant = "default",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
}) {
  return (
    <Link href={href} className={`${buttonClass(variant)} ${className}`}>
      {children}
    </Link>
  );
}

export function Badge({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "success" | "danger" | "accent" | "attention";
}) {
  const tones = {
    muted: "border-border text-fg-muted",
    success: "border-success text-success",
    danger: "border-danger text-danger",
    accent: "border-accent text-accent",
    attention: "border-attention text-attention",
  };
  return (
    <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return <div className="text-center text-fg-muted py-16 text-sm">{children}</div>;
}

export function ErrorBox({ children }: { children: ReactNode }) {
  return <div className="rounded-md border border-danger/40 bg-diff-del text-danger px-4 py-3 text-sm">{children}</div>;
}

export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  // "Sep 12, 14:02"
  return `${d.toLocaleDateString("en-US", { month: "short", day: "numeric" })}, ${d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
}

/** "812 B", "1.0 KB", "2.4 MB" */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function ago(n: number, unit: string): string {
  return `${n} ${unit}${n === 1 ? "" : "s"} ago`;
}

export function timeAgo(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return ago(Math.floor(diff / 60), "minute");
  if (diff < 86400) return ago(Math.floor(diff / 3600), "hour");
  if (diff < 86400 * 30) return ago(Math.floor(diff / 86400), "day");
  return `on ${d.toLocaleDateString("en-US", { dateStyle: "medium" })}`;
}

/** Store state of an app as shown next to its name: "Published v0.1.1", "Draft" or "Failed". */
export function AppStatusBadge({ status, version }: { status: string; version: string | null }) {
  if (status === "PUBLISHED") return <Badge tone="success">Published v{version ?? "-"}</Badge>;
  if (status === "FAILED") return <Badge tone="danger">Failed</Badge>;
  return <Badge tone="attention">Draft</Badge>;
}
