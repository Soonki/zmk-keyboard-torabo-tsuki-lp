import { describe, expect, it } from "vitest";
import { ZMK_STUDIO_SERIAL_BAUD_RATE } from "./serialTransport";

describe("SerialRpcTransport", () => {
  it("uses the ZMK Studio serial baud rate", () => {
    expect(ZMK_STUDIO_SERIAL_BAUD_RATE).toBe(12500);
  });
});
