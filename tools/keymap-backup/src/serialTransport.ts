import type { RpcTransport } from "@zmkfirmware/zmk-studio-ts-client/transport/index";

export const ZMK_STUDIO_SERIAL_BAUD_RATE = 12500;

export class SerialRpcTransport implements RpcTransport {
  readonly label: string;
  readonly abortController = new AbortController();
  readonly readable: ReadableStream<Uint8Array>;
  readonly writable: WritableStream<Uint8Array>;

  private constructor(private readonly port: SerialPort) {
    const info = port.getInfo?.();
    const usbLabel =
      info && (info.usbVendorId || info.usbProductId)
        ? `USB ${hex(info.usbVendorId)}:${hex(info.usbProductId)}`
        : "Web Serial device";
    this.label = usbLabel;

    if (!port.readable || !port.writable) {
      throw new Error("Serial port is not readable/writable after opening.");
    }

    this.readable = port.readable;
    this.writable = port.writable;

    this.abortController.signal.addEventListener("abort", () => {
      void this.closePort();
    }, { once: true });
  }

  static isSupported(): boolean {
    return "serial" in navigator;
  }

  static async request(): Promise<SerialRpcTransport> {
    if (!SerialRpcTransport.isSupported()) {
      throw new Error("Web Serial is not available. Use Chrome or Edge.");
    }

    const port = await navigator.serial.requestPort();
    await port.open({ baudRate: ZMK_STUDIO_SERIAL_BAUD_RATE }).catch((error) => {
      if (error instanceof DOMException && error.name === "NetworkError") {
        throw new Error(
          "Failed to open the serial port. Check that the keyboard is not in use by another app.",
          { cause: error }
        );
      }
      throw error;
    });
    return new SerialRpcTransport(port);
  }

  async close(): Promise<void> {
    this.abortController.abort("User disconnected");
    await this.closePort();
  }

  private async closePort(): Promise<void> {
    await Promise.allSettled([
      this.port.writable?.close(),
      this.port.readable?.cancel()
    ]);
    await this.port.close().catch(() => undefined);
  }
}

function hex(value: number | undefined): string {
  return value == null ? "????" : value.toString(16).padStart(4, "0");
}
