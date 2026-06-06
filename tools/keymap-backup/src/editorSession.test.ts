import { describe, expect, it } from "vitest";
import { KeymapEditorSession, type KeymapWriter } from "./editorSession";
import type { AppContext, BehaviorBinding, DeviceSnapshot } from "./types";

const context: AppContext = {
  appVersion: "0.1.0",
  userAgent: "vitest",
  repository: "Soonki/zmk-keyboard-torabo-tsuki-lp",
  keyboard: "torabo-tsuki LP",
  transport: "mock"
};

describe("KeymapEditorSession", () => {
  it("creates a pre-write backup before the first binding write", async () => {
    const events: string[] = [];
    const writer = new MockWriter(events);
    const session = new KeymapEditorSession(makeSnapshot(), writer, context, {
      onPreWriteBackup: () => {
        events.push("backup");
      }
    });
    const binding: BehaviorBinding = { behaviorId: 12, param1: 0x00070005, param2: 0 };

    const first = await session.setBinding(0, 0, binding);
    const second = await session.setBinding(0, 1, binding);

    expect(first.backup?.keymap.layers[0].bindings[0].param1).toBe(0x00070004);
    expect(second.backup).toBeUndefined();
    expect(writer.bindingWrites).toHaveLength(2);
    expect(events).toEqual(["backup", "binding", "binding"]);
    expect(session.snapshot.keymap.layers[0].bindings[0]).toEqual(binding);
  });

  it("writes layer names and supports undo", async () => {
    const writer = new MockWriter();
    const session = new KeymapEditorSession(makeSnapshot(), writer, context);

    await session.setLayerName(0, "Base");
    expect(session.snapshot.keymap.layers[0].name).toBe("Base");
    expect(session.hasUndo).toBe(true);

    await session.undoLast();
    expect(session.snapshot.keymap.layers[0].name).toBe("Layer 0");
    expect(writer.nameWrites).toEqual([
      { layerId: 7, name: "Base" },
      { layerId: 7, name: "Layer 0" }
    ]);
  });

  it("preserves unsupported bindings unless explicitly replaced", async () => {
    const writer = new MockWriter();
    const snapshot = makeSnapshot();
    snapshot.keymap.layers[0].bindings[0] = { behaviorId: 999, param1: 1, param2: 2 };
    const session = new KeymapEditorSession(snapshot, writer, context);

    expect(session.exportBackup().backup.keymap.layers[0].bindings[0]).toEqual({
      behaviorId: 999,
      param1: 1,
      param2: 2
    });

    await session.setBinding(0, 0, { behaviorId: 13, param1: 0, param2: 0 });
    expect(session.snapshot.keymap.layers[0].bindings[0].behaviorId).toBe(13);
  });

  it("rejects missing key positions before creating a backup", async () => {
    const events: string[] = [];
    const writer = new MockWriter(events);
    const session = new KeymapEditorSession(makeSnapshot(), writer, context, {
      onPreWriteBackup: () => {
        events.push("backup");
      }
    });

    await expect(
      session.setBinding(0, 66, { behaviorId: 12, param1: 0, param2: 0 })
    ).rejects.toThrow("Key position 66 does not exist on layer 0.");
    expect(events).toEqual([]);
    expect(writer.bindingWrites).toEqual([]);
  });
});

class MockWriter implements KeymapWriter {
  bindingWrites: Array<{ layerId: number; keyPosition: number; binding: BehaviorBinding }> = [];
  nameWrites: Array<{ layerId: number; name: string }> = [];

  constructor(private readonly events?: string[]) {}

  async setLayerBinding(
    layerId: number,
    keyPosition: number,
    binding: BehaviorBinding
  ): Promise<void> {
    this.events?.push("binding");
    this.bindingWrites.push({ layerId, keyPosition, binding });
  }

  async setLayerName(layerId: number, name: string): Promise<void> {
    this.events?.push("name");
    this.nameWrites.push({ layerId, name });
  }
}

function makeSnapshot(): DeviceSnapshot {
  return {
    connectionLabel: "mock",
    behaviors: {},
    keymap: {
      layers: [
        {
          id: 7,
          name: "Layer 0",
          bindings: Array.from({ length: 66 }, () => ({
            behaviorId: 12,
            param1: 0x00070004,
            param2: 0
          }))
        }
      ]
    }
  };
}
