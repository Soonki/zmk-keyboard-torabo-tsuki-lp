import layoutDtsi from "../../../boards/shields/torabo_tsuki_lp/torabo_tsuki_lp_layouts.dtsi?raw";
import type { KeyboardLayoutSize, PhysicalKeyboardLayout, PhysicalLayoutKey } from "./types";

const layoutSource = layoutDtsi.replace(/\/\/.*$/gm, "");

export const KEYBOARD_LAYOUT_SIZES: Array<{
  id: KeyboardLayoutSize;
  label: string;
  title: string;
}> = [
  { id: "s", label: "S", title: "S physical layout" },
  { id: "m", label: "M", title: "M physical layout" },
  { id: "l", label: "L", title: "L physical layout" }
];

const CACHE = new Map<KeyboardLayoutSize, PhysicalKeyboardLayout>();

export function physicalLayoutForSize(size: KeyboardLayoutSize): PhysicalKeyboardLayout {
  const cached = CACHE.get(size);
  if (cached) return cached;

  const rawKeys = parsePhysicalKeys(size);
  const positionMap = parsePositionMap(size);
  const keyPositionByPhysicalIndex = invertPositionMap(positionMap, rawKeys.length);
  const keys = rawKeys.map((key, physicalIndex) => ({
    ...key,
    physicalIndex,
    keyPosition: keyPositionByPhysicalIndex.get(physicalIndex) ?? physicalIndex
  }));
  const width = Math.max(...keys.map((key) => key.x + key.w));
  const height = Math.max(...keys.map((key) => key.y + key.h));
  const layout: PhysicalKeyboardLayout = {
    size,
    label: `${size.toUpperCase()} Layout`,
    width,
    height,
    keys
  };
  CACHE.set(size, layout);
  return layout;
}

export function isKeyboardLayoutSize(value: unknown): value is KeyboardLayoutSize {
  return value === "s" || value === "m" || value === "l";
}

export function bindingIndexForPhysicalKey(
  key: PhysicalLayoutKey,
  bindingCount: number,
  layout: PhysicalKeyboardLayout,
  activeSize?: KeyboardLayoutSize
): number {
  const referencePosition = key.keyPosition;

  if (activeSize) {
    const activePhysicalIndex = parsePositionMap(activeSize)[referencePosition];
    return activePhysicalIndex >= 0 && activePhysicalIndex < bindingCount
      ? activePhysicalIndex
      : -1;
  }

  if (bindingCount === layout.keys.length) {
    return key.physicalIndex;
  }
  if (bindingCount === physicalLayoutForSize("l").keys.length) {
    return referencePosition;
  }
  return referencePosition;
}

function parsePhysicalKeys(
  size: KeyboardLayoutSize
): Array<Omit<PhysicalLayoutKey, "physicalIndex" | "keyPosition">> {
  const body = extractBlock(`physical_layout_${size}:`);
  const keysBody = body.match(/keys[\s\S]*?=([\s\S]*?);/)?.[1];
  if (!keysBody) {
    throw new Error(`Could not parse physical_layout_${size} keys.`);
  }

  return [...keysBody.matchAll(/key_physical_attrs\s+([^>]+)>/g)].map((match) => {
    const values = match[1].replace(/[()]/g, "").trim().split(/\s+/).map(Number);
    if (values.length !== 7 || values.some(Number.isNaN)) {
      throw new Error(`Invalid physical key attrs in layout ${size}: ${match[1]}`);
    }
    const [w, h, x, y, rotationCentidegrees, rx, ry] = values;
    return {
      w,
      h,
      x,
      y,
      rotation: rotationCentidegrees / 100,
      rx,
      ry
    };
  });
}

function parsePositionMap(size: KeyboardLayoutSize): number[] {
  const body = extractBlock(`position_map_${size}_1`);
  const positionsBody = body.match(/positions\s*=\s*<([\s\S]*?)>/)?.[1];
  if (!positionsBody) {
    throw new Error(`Could not parse position_map_${size}_1 positions.`);
  }
  return positionsBody.trim().split(/\s+/).map(Number);
}

function invertPositionMap(positionMap: number[], physicalKeyCount: number): Map<number, number> {
  const result = new Map<number, number>();
  positionMap.forEach((physicalIndex, keyPosition) => {
    if (
      physicalIndex >= 0 &&
      physicalIndex < physicalKeyCount &&
      !result.has(physicalIndex)
    ) {
      result.set(physicalIndex, keyPosition);
    }
  });
  return result;
}

function extractBlock(marker: string): string {
  const start = layoutSource.indexOf(marker);
  if (start < 0) {
    throw new Error(`Could not find ${marker}.`);
  }
  const open = layoutSource.indexOf("{", start);
  if (open < 0) {
    throw new Error(`Could not find block body for ${marker}.`);
  }

  let depth = 0;
  for (let index = open; index < layoutSource.length; index++) {
    const char = layoutSource[index];
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return layoutSource.slice(open + 1, index);
      }
    }
  }

  throw new Error(`Could not close block for ${marker}.`);
}
