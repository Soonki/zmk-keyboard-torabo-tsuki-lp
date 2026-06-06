import { describe, expect, it } from "vitest";
import {
  backupFilename,
  checksumObject,
  createBackupDocument,
  validateKeymapShape
} from "./backup";
import type { AppContext, DeviceSnapshot } from "./types";

const context: AppContext = {
  appVersion: "0.1.0",
  userAgent: "vitest",
  repository: "Soonki/zmk-keyboard-torabo-tsuki-lp",
  keyboard: "torabo-tsuki LP",
  transport: "mock"
};

describe("backup document", () => {
  it("stores all layers and bindings", () => {
    const snapshot = makeSnapshot(5, 66);
    const backup = createBackupDocument(snapshot, context, new Date("2026-06-06T01:02:03Z"));

    expect(backup.schemaVersion).toBe(1);
    expect(backup.keymap.layers).toHaveLength(5);
    expect(backup.keymap.layers[0].bindings).toHaveLength(66);
    expect(backup.behaviors["12"]).toEqual({ id: 12, displayName: "Key Press" });
    expect(backup.checksum).toMatch(/^fnv1a32:[0-9a-f]{8}$/);
  });

  it("checksums are stable for reordered object keys", () => {
    expect(checksumObject({ b: 1, a: 2 })).toBe(checksumObject({ a: 2, b: 1 }));
  });

  it("generates timestamped filenames", () => {
    expect(backupFilename(new Date("2026-06-06T01:02:03"), "prewrite")).toBe(
      "torabo-tsuki-lp-prewrite-20260606-010203.json"
    );
  });

  it("validates the torabo-tsuki LP layer shape", () => {
    expect(validateKeymapShape(makeSnapshot(5, 66).keymap)).toEqual([]);
    expect(validateKeymapShape(makeSnapshot(4, 66).keymap)).toEqual([
      "Keymap has 4 layers; expected 5."
    ]);
    expect(validateKeymapShape(makeSnapshot(5, 65).keymap)).toEqual([
      "Layer 0 has 65 bindings; expected 66.",
      "Layer 1 has 65 bindings; expected 66.",
      "Layer 2 has 65 bindings; expected 66.",
      "Layer 3 has 65 bindings; expected 66.",
      "Layer 4 has 65 bindings; expected 66."
    ]);
  });
});

function makeSnapshot(layerCount: number, bindingCount: number): DeviceSnapshot {
  return {
    connectionLabel: "mock",
    physicalLayouts: {
      layouts: [],
      activeLayoutIndex: 0
    },
    behaviors: {
      "12": { id: 12, displayName: "Key Press" }
    },
    keymap: {
      layers: Array.from({ length: layerCount }, (_, layerIndex) => ({
        id: layerIndex,
        name: `Layer ${layerIndex}`,
        bindings: Array.from({ length: bindingCount }, () => ({
          behaviorId: 12,
          param1: 0x00070004,
          param2: 0
        }))
      }))
    }
  };
}
