import { describe, expect, it } from "vitest";
import {
  formatBinding,
  formatKeycapLabel,
  isSupportedBinding,
  makeBinding,
  resolveBehaviorOptions
} from "./bindings";
import type { BehaviorDetails, KeymapLayer } from "./types";

describe("binding helpers", () => {
  it("resolves supported editor behaviors from behavior metadata", () => {
    const options = resolveBehaviorOptions(makeBehaviorDetails());

    expect(options.map((option) => option.role)).toEqual([
      "bt",
      "kp",
      "lt",
      "mkp",
      "mo",
      "mt",
      "none",
      "out",
      "trans"
    ]);
  });

  it("formats common supported bindings", () => {
    const behaviors = makeBehaviorDetails();
    const layers: KeymapLayer[] = [
      { id: 0, name: "Base", bindings: [] },
      { id: 2, name: "Symbols", bindings: [] }
    ];

    expect(formatBinding({ behaviorId: 1, param1: 0x00070004, param2: 0 }, layers, behaviors)).toBe("&kp A");
    expect(formatBinding({ behaviorId: 2, param1: 2, param2: 0 }, layers, behaviors)).toBe("&mo Symbols (2)");
    expect(formatBinding({ behaviorId: 3, param1: 2, param2: 0x0007002c }, layers, behaviors)).toBe("&lt Symbols (2) SPACE");
    expect(formatBinding({ behaviorId: 8, param1: 0, param2: 0 }, layers, behaviors)).toBe("&trans");
  });

  it("formats simple keycap labels for the keyboard view", () => {
    const behaviors = makeBehaviorDetails();
    const layers: KeymapLayer[] = [
      { id: 0, name: "Base", bindings: [] },
      { id: 2, name: "Symbols", bindings: [] }
    ];

    expect(formatKeycapLabel({ behaviorId: 1, param1: 0x00070014, param2: 0 }, layers, behaviors)).toBe("Q");
    expect(formatKeycapLabel({ behaviorId: 3, param1: 2, param2: 0x0007002c }, layers, behaviors)).toBe("L2/Space");
    expect(formatKeycapLabel({ behaviorId: 4, param1: 0x000700e1, param2: 0x0107002c }, layers, behaviors)).toBe("IME/LSft");
    expect(formatKeycapLabel({ behaviorId: 4, param1: 0x000700e5, param2: 0x00070038 }, layers, behaviors)).toBe("Slash/RSft");
    expect(formatKeycapLabel({ behaviorId: 7, param1: 1, param2: 0 }, layers, behaviors)).toBe("LClick");
    expect(formatKeycapLabel({ behaviorId: 7, param1: 16, param2: 0 }, layers, behaviors)).toBe("Fwd");
    expect(formatKeycapLabel({ behaviorId: 5, param1: 1, param2: 0 }, layers, behaviors)).toBe("BT Next");
    expect(formatKeycapLabel({ behaviorId: 6, param1: 2, param2: 0 }, layers, behaviors)).toBe("BLE");
    expect(formatKeycapLabel({ behaviorId: 8, param1: 0, param2: 0 }, layers, behaviors)).toBe("—");
  });

  it("preserves raw unsupported bindings for display", () => {
    const behaviors: Record<string, BehaviorDetails> = {
      "99": { id: 99, displayName: "Macro Tap" }
    };

    expect(isSupportedBinding({ behaviorId: 99, param1: 12, param2: 34 }, behaviors)).toBe(false);
    expect(formatBinding({ behaviorId: 99, param1: 12, param2: 34 }, [], behaviors)).toBe(
      "Macro Tap 12 34"
    );
    expect(formatBinding({ behaviorId: 100, param1: 12, param2: 34 }, [], {})).toBe("#100 12 34");
  });

  it("clears unused params when making no-param bindings", () => {
    const trans = resolveBehaviorOptions(makeBehaviorDetails()).find((option) => option.role === "trans");
    expect(trans).toBeDefined();

    expect(makeBinding(trans!.behaviorId, trans!, 12, 34)).toEqual({
      behaviorId: 8,
      param1: 0,
      param2: 0
    });
  });
});

function makeBehaviorDetails(): Record<string, BehaviorDetails> {
  return {
    "1": { id: 1, displayName: "Key Press" },
    "2": { id: 2, displayName: "Momentary Layer" },
    "3": { id: 3, displayName: "Layer Tap" },
    "4": { id: 4, displayName: "Mod Tap" },
    "5": { id: 5, displayName: "Bluetooth" },
    "6": { id: 6, displayName: "Output Selection" },
    "7": { id: 7, displayName: "Mouse Button" },
    "8": { id: 8, displayName: "Transparent" },
    "9": { id: 9, displayName: "No Action" }
  };
}
