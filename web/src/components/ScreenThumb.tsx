"use client";

import { useEffect, useRef } from "react";
import type { Screen } from "@/vendor/wireframe/core";

type ThumbModule = {
  renderThumbnail(screen: Screen, projectDevice: string, theme: unknown, registry: unknown, maxWidth: number): HTMLElement;
  registry: unknown;
  BUILTIN_THEMES: { id: string }[];
  themeOrDefault(themes: { id: string }[], id: string): unknown;
};

let loading: Promise<ThumbModule> | undefined;
/** The editor's thumbnail renderer, served as a static module (public/wireframe/embed-thumb.js). */
function thumbModule(): Promise<ThumbModule> {
  // Not a bundler import: the file is copied from the wireframe tool as is (scripts/sync-wireframe.mjs).
  loading ??= (new Function("u", "return import(u)") as (u: string) => Promise<ThumbModule>)("/wireframe/embed-thumb.js");
  return loading;
}

/** One screen drawn small, exactly as the editor draws it. */
export function ScreenThumb({ screen, theme, device, width }: { screen: Screen; theme: string; device: string; width: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let gone = false;
    thumbModule()
      .then((m) => {
        if (gone || !ref.current) return;
        ref.current.replaceChildren(m.renderThumbnail(screen, device, m.themeOrDefault(m.BUILTIN_THEMES, theme), m.registry, width));
      })
      .catch((e) => console.warn("thumbnail failed:", e));
    return () => {
      gone = true;
    };
  }, [screen, theme, device, width]);
  return <div ref={ref} className="overflow-hidden rounded-md border border-border bg-canvas-subtle" style={{ width }} />;
}
