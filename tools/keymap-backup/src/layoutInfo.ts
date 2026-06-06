import infoJson from "../../../config/info.json";
import type { InfoJson, LayoutKey } from "./types";

export const info = infoJson as InfoJson;

export function fallbackLayout(): LayoutKey[] {
  return info.layouts.LAYOUT.layout;
}
