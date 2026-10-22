// Types for core.js, the wireframe editor's core bundled for this server (scripts/sync-wireframe.mjs).
// Only what src/lib/wireframe-store.ts and src/lib/design-ai.ts use; the shapes follow the editor's schema.ts.

export type DeviceName = "phone" | "phone-android" | "tablet" | "desktop";
export type DeviceSize = { w: number; h: number };
export type Device = DeviceName | DeviceSize;

export interface Element {
  id: string;
  type: string;
  x?: number;
  y?: number;
  w?: number | "fit" | "fill";
  h?: number | "fit" | "fill";
  text?: string;
  name?: string;
  variant?: string;
  props?: Record<string, unknown>;
  style?: Record<string, unknown>;
  children?: Element[];
  hidden?: boolean;
  locked?: boolean;
  [key: string]: unknown;
}

export interface Screen {
  version: 1;
  id: string;
  title: string;
  device?: Device;
  elements: Element[];
  [key: string]: unknown;
}

export interface Proposal {
  id: string;
  name: string;
  screens: string[];
  base?: string;
  note?: string;
  theme?: string;
}

export interface Project {
  version: 1;
  name: string;
  theme: string;
  device: Device;
  screens?: string[];
  proposals?: Proposal[];
  references?: unknown[];
  [key: string]: unknown;
}

export interface Theme {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface Issue {
  path: string;
  message: string;
}
export interface ValidationResult {
  errors: Issue[];
  warnings: Issue[];
}

/** The element types the editor knows (opaque here). */
export type Registry = { get(type: string): { label: string } | undefined; keys(): Iterable<string> };
export const registry: Registry;

export function validateScreen(
  data: unknown,
  opts: { registry: Registry; fileId?: string; projectDevice?: Device; screenIds?: readonly string[]; defaults?: Record<string, unknown> },
): ValidationResult;
export function validateProject(
  data: unknown,
  opts: { themeIds: string[]; screenIds: string[]; proposalScreenIds?: Record<string, string[]> },
): ValidationResult;
export function formatIssues(file: string, result: ValidationResult): string[];

export function fillScreen(screen: Screen, projectDevice: Device, registry: Registry, defaults?: Record<string, unknown>): Screen;
export function settleStated<S>(screen: S): S;
export function normalizeScreen(screen: Screen): Screen;
export function normalizeProject(project: Project): Project;
export function serialize(value: unknown): string;
export function hashText(text: string): Promise<string>;

export type Change = { kind: string; [key: string]: unknown };
export interface ChangeRecord {
  at: string;
  screen: string;
  from: string;
  to: string;
  forced: boolean;
  changes: Change[];
}
export function diffScreens(before: Screen, after: Screen): Change[];
export function diffTheme(before: string, after: string): Change[];
export function describeLines(change: Change, label: (id: string) => string): string[];
export function summarizeScreen(screen: Screen, records: ChangeRecord[], registry: Registry): string;

export const BUILTIN_TEMPLATES: Screen[];
export function findBuiltin(id: string): Screen | undefined;
export function parseTemplateRef(from: string): { source: "blank" } | { source: "builtin" | "project" | "ai"; id: string } | undefined;

export const BUILTIN_THEMES: Theme[];
export const DEFAULT_THEME_ID: string;
export function themeOrDefault(themes: Theme[], id: string): Theme;

export const DEVICES: Record<DeviceName, DeviceSize>;
export function deviceSize(device: Device): DeviceSize;
export const ID_PATTERN: RegExp;

export function emptyDefaults(): { version: 1; parts: Record<string, unknown> };
export const NO_DEFAULTS: Record<string, never>;
export function flatten<E extends Element>(elements: E[], parent?: string): { el: E; parent?: string }[];
