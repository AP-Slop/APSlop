"use client";

import type { ModelChoice } from "@/lib/models";

export type ModelPick = { id: ModelChoice; label: string; available: boolean };

/** Which AI writes the code. An AI the server has no key for is listed but cannot be picked. */
export function ModelSelect({
  models,
  value,
  onChange,
  disabled,
}: {
  models: ModelPick[];
  value: ModelChoice;
  onChange: (model: ModelChoice) => void;
  disabled?: boolean;
}) {
  return (
    <label className="block text-sm">
      <span className="text-xs text-fg-muted">Model</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as ModelChoice)}
        disabled={disabled}
        className="mt-1 block w-80 rounded-md border border-border bg-canvas px-2 py-1.5"
      >
        {models.map((m) => (
          <option key={m.id} value={m.id} disabled={!m.available}>
            {m.available ? m.label : `${m.label} — not set up`}
          </option>
        ))}
      </select>
    </label>
  );
}
