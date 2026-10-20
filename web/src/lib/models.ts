import { z } from "zod";
import { env } from "@/lib/env";

/** Which AI writes a change. Stored per generation as the concrete model name. */
export const ModelChoiceSchema = z.enum(["claude", "deepseek"]);
export type ModelChoice = z.infer<typeof ModelChoiceSchema>;

export type ModelOption = { id: ModelChoice; label: string; model: string; available: boolean };

function deepseekLabel(model: string): string {
  return model === "deepseek-flash" ? "DeepSeek V4.1 Flash" : `DeepSeek (${model})`;
}

/** Models offered on "New app" and "Create PR with AI". An option without an API key is shown but cannot be picked. */
export function modelOptions(): ModelOption[] {
  const e = env();
  return [
    { id: "claude", label: `Claude (${e.ANTHROPIC_MODEL})`, model: e.ANTHROPIC_MODEL, available: !!e.ANTHROPIC_API_KEY },
    { id: "deepseek", label: deepseekLabel(e.DEEPSEEK_MODEL), model: e.DEEPSEEK_MODEL, available: !!e.DEEPSEEK_API_KEY },
  ];
}

export function modelOption(id: ModelChoice): ModelOption {
  return modelOptions().find((o) => o.id === id)!;
}

/** The AI picked at first: the one the user last used, when the server still has a key for it; else the first that has one. */
export function preferredModel(lastModel?: string | null): ModelChoice {
  const options = modelOptions();
  const last = lastModel ? choiceForModel(lastModel) : null;
  if (last && options.some((o) => o.id === last && o.available)) return last;
  return options.find((o) => o.available)?.id ?? "claude";
}

/** The choice that produced a stored generation (older rows only ever used Claude). */
export function choiceForModel(model: string): ModelChoice {
  return model.startsWith("deepseek") || model === env().DEEPSEEK_MODEL ? "deepseek" : "claude";
}

/** Display name for the concrete model stored on a generation. */
export function labelForModel(model: string): string {
  return choiceForModel(model) === "deepseek" ? deepseekLabel(model) : `Claude (${model})`;
}
