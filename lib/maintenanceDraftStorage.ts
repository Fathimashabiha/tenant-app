import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Asset } from "./assetService";

const DRAFT_KEY = "@zendwell_maintenance_draft";

export type MaintenanceRequestMode = "asset" | "location";

export interface MaintenanceDraft {
  requestMode: MaintenanceRequestMode | null;
  scannedAsset: Asset | null;
  issueType: string;
  description: string;
  prefTime: string;
  capturedPhotos: string[];
  capturedVideo: { uri: string; name: string } | null;
  capturedAudio: { uri: string; durationSec: number } | null;
}

export async function saveMaintenanceDraft(draft: MaintenanceDraft): Promise<void> {
  const hasContent =
    draft.requestMode ||
    draft.scannedAsset ||
    draft.issueType.trim() ||
    draft.description.trim() ||
    draft.capturedPhotos.length > 0 ||
    draft.capturedVideo ||
    draft.capturedAudio;

  if (!hasContent) {
    await clearMaintenanceDraft();
    return;
  }

  await AsyncStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
}

export async function loadMaintenanceDraft(): Promise<MaintenanceDraft | null> {
  try {
    const raw = await AsyncStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as MaintenanceDraft;
  } catch {
    return null;
  }
}

export async function clearMaintenanceDraft(): Promise<void> {
  await AsyncStorage.removeItem(DRAFT_KEY);
}
