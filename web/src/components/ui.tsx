import Link from "next/link";
import type { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`max-w-6xl mx-auto px-4 py-6 ${className}`}>{children}</div>;
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-md border border-border bg-canvas ${className}`}>{children}</div>;
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
  return d.toLocaleString("ja-JP", { dateStyle: "medium", timeStyle: "short" });
}

export function timeAgo(value: string | Date | null | undefined): string {
  if (!value) return "";
  const d = typeof value === "string" ? new Date(value) : value;
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "たった今";
  if (diff < 3600) return `${Math.floor(diff / 60)} 分前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 時間前`;
  if (diff < 86400 * 30) return `${Math.floor(diff / 86400)} 日前`;
  return d.toLocaleDateString("ja-JP");
}
