import type {
  AppContext,
  BackupDocument,
  BehaviorDetails,
  DeviceSnapshot,
  RuntimeKeymap
} from "./types";

export const EXPECTED_TORABO_TSUKI_KEY_COUNT = 66;
export const EXPECTED_TORABO_TSUKI_LAYER_COUNT = 5;

export function createBackupDocument(
  snapshot: DeviceSnapshot,
  context: AppContext,
  exportedAt = new Date()
): BackupDocument {
  const base = {
    schemaVersion: 1 as const,
    exportedAt: exportedAt.toISOString(),
    app: {
      name: "torabo-tsuki-keymap-backup",
      version: context.appVersion
    },
    source: {
      repository: context.repository,
      keyboard: context.keyboard,
      transport: context.transport
    },
    device: {
      label: snapshot.connectionLabel,
      userAgent: context.userAgent
    },
    physicalLayouts: clone(snapshot.physicalLayouts),
    activePhysicalLayoutIndex: snapshot.physicalLayouts?.activeLayoutIndex,
    keymap: clone(snapshot.keymap),
    behaviors: clone(snapshot.behaviors)
  };

  return {
    ...base,
    checksum: checksumObject(base)
  };
}

export function validateKeymapShape(
  keymap: RuntimeKeymap,
  expectedKeyCount = EXPECTED_TORABO_TSUKI_KEY_COUNT,
  expectedLayerCount = EXPECTED_TORABO_TSUKI_LAYER_COUNT
): string[] {
  const errors: string[] = [];
  if (!Array.isArray(keymap.layers) || keymap.layers.length === 0) {
    errors.push("No layers were returned from the device.");
    return errors;
  }
  if (keymap.layers.length !== expectedLayerCount) {
    errors.push(
      `Keymap has ${keymap.layers.length} layers; expected ${expectedLayerCount}.`
    );
  }

  keymap.layers.forEach((layer, index) => {
    if (!Array.isArray(layer.bindings)) {
      errors.push(`Layer ${index} has no bindings array.`);
      return;
    }
    if (layer.bindings.length !== expectedKeyCount) {
      errors.push(
        `Layer ${index} has ${layer.bindings.length} bindings; expected ${expectedKeyCount}.`
      );
    }
  });

  return errors;
}

export function backupFilename(date = new Date(), label = "keymap"): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  const timestamp = [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate())
  ].join("") +
    "-" +
    [pad(date.getHours()), pad(date.getMinutes()), pad(date.getSeconds())].join("");

  return `torabo-tsuki-lp-${label}-${timestamp}.json`;
}

export function checksumObject(value: unknown): string {
  const input = stableStringify(value);
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return `fnv1a32:${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function stableStringify(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

export function behaviorSummary(behaviors: Record<string, BehaviorDetails>): string[] {
  return Object.keys(behaviors).sort();
}

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value && typeof value === "object") {
    const sorted: Record<string, unknown> = {};
    Object.keys(value as Record<string, unknown>)
      .sort()
      .forEach((key) => {
        sorted[key] = sortValue((value as Record<string, unknown>)[key]);
      });
    return sorted;
  }
  return value;
}

function clone<T>(value: T): T {
  return value == null ? value : JSON.parse(JSON.stringify(value));
}
