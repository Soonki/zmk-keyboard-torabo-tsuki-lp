import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BehaviorBinding } from "./types";

const mocks = vi.hoisted(() => ({
  callRpc: vi.fn()
}));

vi.mock("@zmkfirmware/zmk-studio-ts-client", () => ({
  call_rpc: mocks.callRpc
}));

import { readDeviceSnapshot, saveChanges, setLayerBinding, setLayerName } from "./studioRpc";

describe("studio RPC helpers", () => {
  beforeEach(() => {
    mocks.callRpc.mockReset();
  });

  it("reads keymap, layout metadata, and behavior details", async () => {
    mocks.callRpc
      .mockResolvedValueOnce({
        keymap: {
          getKeymap: {
            layers: [{ id: 0, name: "Base", bindings: [] }]
          }
        }
      })
      .mockResolvedValueOnce({
        keymap: {
          getPhysicalLayouts: {
            layouts: [{ name: "Default", keys: [] }],
            activeLayoutIndex: 0
          }
        }
      })
      .mockResolvedValueOnce({
        behaviors: { listAllBehaviors: { behaviors: [12] } }
      })
      .mockResolvedValueOnce({
        behaviors: {
          getBehaviorDetails: { id: 12, displayName: "Key press" }
        }
      });

    const snapshot = await readDeviceSnapshot({} as never, "USB");

    expect(snapshot.connectionLabel).toBe("USB");
    expect(snapshot.keymap.layers[0].name).toBe("Base");
    expect((snapshot.physicalLayouts?.layouts[0] as { name: string }).name).toBe("Default");
    expect(snapshot.behaviors["12"].displayName).toBe("Key press");
  });

  it("writes a layer binding and saves changes", async () => {
    const binding: BehaviorBinding = { behaviorId: 12, param1: 458756, param2: 0 };
    mocks.callRpc
      .mockResolvedValueOnce({ keymap: { setLayerBinding: 0 } })
      .mockResolvedValueOnce({ keymap: { saveChanges: { err: 0 } } });

    await setLayerBinding({} as never, 1, 2, binding);

    expect(mocks.callRpc).toHaveBeenNthCalledWith(1, {}, {
      keymap: {
        setLayerBinding: {
          layerId: 1,
          keyPosition: 2,
          binding
        }
      }
    });
    expect(mocks.callRpc).toHaveBeenNthCalledWith(2, {}, { keymap: { saveChanges: true } });
  });

  it("writes a layer name and saves changes", async () => {
    mocks.callRpc
      .mockResolvedValueOnce({ keymap: { setLayerProps: 0 } })
      .mockResolvedValueOnce({ keymap: { saveChanges: { err: 0 } } });

    await setLayerName({} as never, 3, "Nav");

    expect(mocks.callRpc).toHaveBeenNthCalledWith(1, {}, {
      keymap: {
        setLayerProps: {
          layerId: 3,
          name: "Nav"
        }
      }
    });
    expect(mocks.callRpc).toHaveBeenNthCalledWith(2, {}, { keymap: { saveChanges: true } });
  });

  it("accepts ok saveChanges responses", async () => {
    mocks.callRpc.mockResolvedValueOnce({ keymap: { saveChanges: { ok: true } } });

    await saveChanges({} as never);

    expect(mocks.callRpc).toHaveBeenCalledWith({}, { keymap: { saveChanges: true } });
  });
});
