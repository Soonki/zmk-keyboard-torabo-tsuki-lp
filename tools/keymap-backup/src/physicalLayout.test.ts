import { describe, expect, it } from "vitest";
import { bindingIndexForPhysicalKey, physicalLayoutForSize } from "./physicalLayout";

describe("torabo-tsuki physical layouts", () => {
  it("loads S/M/L physical key counts from the shield dtsi", () => {
    expect(physicalLayoutForSize("s").keys).toHaveLength(44);
    expect(physicalLayoutForSize("m").keys).toHaveLength(52);
    expect(physicalLayoutForSize("l").keys).toHaveLength(66);
  });

  it("maps visible physical keys to runtime key positions", () => {
    expect(physicalLayoutForSize("l").keys[0].keyPosition).toBe(0);
    expect(physicalLayoutForSize("m").keys[0].keyPosition).toBe(12);
    expect(physicalLayoutForSize("s").keys[0].keyPosition).toBe(13);
    expect(physicalLayoutForSize("s").keys[43].keyPosition).toBe(64);
  });

  it("uses active physical order when the device returns an active-layout keymap", () => {
    const s = physicalLayoutForSize("s");
    const m = physicalLayoutForSize("m");
    const l = physicalLayoutForSize("l");

    expect(bindingIndexForPhysicalKey(s.keys[0], 44, s, "s")).toBe(0);
    expect(bindingIndexForPhysicalKey(s.keys[0], 66, s, "s")).toBe(0);
    expect(bindingIndexForPhysicalKey(s.keys[43], 66, s, "s")).toBe(43);
    expect(bindingIndexForPhysicalKey(s.keys[0], 66, s)).toBe(13);
    expect(bindingIndexForPhysicalKey(m.keys[0], 52, m, "m")).toBe(0);
    expect(bindingIndexForPhysicalKey(m.keys[0], 66, m, "m")).toBe(0);
    expect(bindingIndexForPhysicalKey(m.keys[0], 66, m)).toBe(12);
    expect(bindingIndexForPhysicalKey(s.keys[0], 52, s, "m")).toBe(1);
    expect(bindingIndexForPhysicalKey(l.keys[0], 44, l, "s")).toBe(-1);
    expect(bindingIndexForPhysicalKey(l.keys[0], 66, l, "s")).toBe(44);
    expect(bindingIndexForPhysicalKey(l.keys[13], 44, l, "s")).toBe(0);
    expect(bindingIndexForPhysicalKey(l.keys[13], 66, l, "s")).toBe(0);
  });

  it("renders the firmware layer 0 S projection in physical key order", () => {
    const s = physicalLayoutForSize("s");
    const lReferenceLabels = [
      "ESC", "N1", "N2", "N3", "N4", "N5", "N6", "N7", "N8", "N9", "N0", "BSPC",
      "TAB", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "BSPC",
      "CAPS", "A", "S", "D", "F", "G", "LCLK", "RCLK", "H", "J", "K", "L", "SEMI", "SQT",
      "LSHFT", "Z", "X", "C", "V", "B", "SPACE", "RET", "N", "M", "COMMA", "DOT", "FSLH/RSFT", "RSHFT",
      "LCTRL", "LCTRL", "LSHFT", "LALT", "BSPC", "L2/SPACE", "LANG1/LSFT", "LANG2/RSFT", "L3/ENTER", "BSPC", "RALT", "RGUI", "RCTRL", "RCTRL"
    ];
    const activeSOrderLabels = s.keys.map(
      (key) => lReferenceLabels[key.keyPosition]
    );

    expect(activeSOrderLabels).toEqual([
      "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P",
      "A", "S", "D", "F", "G", "H", "J", "K", "L", "SEMI",
      "Z", "X", "C", "V", "B", "SPACE", "RET", "N", "M", "COMMA", "DOT", "FSLH/RSFT",
      "LCTRL", "LSHFT", "LALT", "BSPC", "L2/SPACE", "LANG1/LSFT", "LANG2/RSFT", "L3/ENTER", "BSPC", "RALT", "RGUI", "RCTRL"
    ]);
    expect(
      s.keys.map((key) => bindingIndexForPhysicalKey(key, 66, s, "s"))
    ).toEqual([...Array(44).keys()]);
  });

  it("keeps thumb key rotations from the physical layout", () => {
    expect(physicalLayoutForSize("s").keys[36].rotation).toBe(10);
    expect(physicalLayoutForSize("s").keys[37].rotation).toBe(20);
    expect(physicalLayoutForSize("s").keys[38].rotation).toBe(-20);
    expect(physicalLayoutForSize("s").keys[39].rotation).toBe(-10);
  });
});
