import { call_rpc, type RpcConnection } from "@zmkfirmware/zmk-studio-ts-client";
import type {
  BehaviorBinding,
  BehaviorDetails,
  DeviceSnapshot,
  PhysicalLayouts,
  RuntimeKeymap
} from "./types";

export async function readDeviceSnapshot(
  conn: RpcConnection,
  connectionLabel: string
): Promise<DeviceSnapshot> {
  const keymap = await readKeymap(conn);
  const physicalLayouts = await readPhysicalLayouts(conn);
  const behaviors = await readBehaviors(conn);

  return {
    connectionLabel,
    keymap,
    physicalLayouts,
    behaviors
  };
}

export async function readKeymap(conn: RpcConnection): Promise<RuntimeKeymap> {
  const response = await rpc(conn, { keymap: { getKeymap: true } });
  const keymap = response?.keymap?.getKeymap;
  if (!keymap?.layers) {
    throw new Error("The device did not return a keymap.");
  }
  return keymap as RuntimeKeymap;
}

export async function readPhysicalLayouts(conn: RpcConnection): Promise<PhysicalLayouts | undefined> {
  try {
    const response = await rpc(conn, { keymap: { getPhysicalLayouts: true } });
    const data = response?.keymap?.getPhysicalLayouts;
    if (!data) {
      return undefined;
    }
    return {
      layouts: data.layouts ?? [],
      activeLayoutIndex: data.activeLayoutIndex ?? 0
    };
  } catch (error) {
    console.warn("Unable to read physical layouts", error);
    return undefined;
  }
}

export async function readBehaviors(
  conn: RpcConnection
): Promise<Record<string, BehaviorDetails>> {
  try {
    const response = await rpc(conn, { behaviors: { listAllBehaviors: true } });
    const behaviorIds: number[] = response?.behaviors?.listAllBehaviors?.behaviors ?? [];
    const details: Record<string, BehaviorDetails> = {};

    for (const behaviorId of behaviorIds) {
      try {
        const detailResponse = await rpc(conn, {
          behaviors: { getBehaviorDetails: { behaviorId } }
        });
        const behaviorDetails = detailResponse?.behaviors?.getBehaviorDetails;
        if (typeof behaviorDetails?.id === "number") {
          details[String(behaviorDetails.id)] = behaviorDetails;
        }
      } catch (error) {
        details[String(behaviorId)] = {
          id: behaviorId,
          error: error instanceof Error ? error.message : String(error)
        };
      }
    }

    return details;
  } catch (error) {
    console.warn("Unable to read behavior details", error);
    return {};
  }
}

export async function setLayerBinding(
  conn: RpcConnection,
  layerId: number,
  keyPosition: number,
  binding: BehaviorBinding
): Promise<void> {
  const response = await rpc(conn, {
    keymap: {
      setLayerBinding: {
        layerId,
        keyPosition,
        binding
      }
    }
  });
  assertOkEnum(response?.keymap?.setLayerBinding, "set layer binding");
  await saveChanges(conn);
}

export async function setLayerName(
  conn: RpcConnection,
  layerId: number,
  name: string
): Promise<void> {
  const response = await rpc(conn, {
    keymap: {
      setLayerProps: {
        layerId,
        name
      }
    }
  });
  assertOkEnum(response?.keymap?.setLayerProps, "set layer name");
  await saveChanges(conn);
}

export async function saveChanges(conn: RpcConnection): Promise<void> {
  const response = await rpc(conn, { keymap: { saveChanges: true } });
  const saveResponse = response?.keymap?.saveChanges;
  const errorCode = saveResponse?.err;
  if (saveResponse?.ok === true) {
    return;
  }
  if (errorCode === 0 || errorCode === "SAVE_CHANGES_ERR_OK") {
    return;
  }
  throw new Error(`Failed to save keymap changes: ${String(errorCode)}`);
}

async function rpc(conn: RpcConnection, request: Record<string, unknown>): Promise<any> {
  return await call_rpc(conn, request as never);
}

function assertOkEnum(value: unknown, action: string): void {
  if (value === 0 || value === "SET_LAYER_BINDING_RESP_OK" || value === "SET_LAYER_PROPS_RESP_OK") {
    return;
  }
  throw new Error(`Failed to ${action}: ${String(value)}`);
}
