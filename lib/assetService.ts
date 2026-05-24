import axiosInstance from "./axios";

export interface Asset {
  id: string;
  name: string;
  type: string;
  category: string;
  location: string;
  unit: string;
  floor: string;
  tower: string;
  building: string;
  status: string;
  lastServiceDate?: string;
  serialNumber?: string;
}

const MOCK_ASSETS: Record<string, Asset> = {
  "AST-AC-1204": {
    id: "AST-AC-1204",
    name: "Split AC Unit",
    type: "HVAC",
    category: "Air Conditioning",
    location: "Unit 1204, 12th Floor, Tower A, Marina Heights",
    unit: "1204",
    floor: "12th Floor",
    tower: "Tower A",
    building: "Marina Heights",
    status: "Active",
    lastServiceDate: "Jan 15, 2026",
    serialNumber: "HVAC-2024-8841",
  },
  "AST-WH-1204": {
    id: "AST-WH-1204",
    name: "Water Heater",
    type: "Plumbing",
    category: "Water Heater",
    location: "Unit 1204, 12th Floor, Tower A, Marina Heights",
    unit: "1204",
    floor: "12th Floor",
    tower: "Tower A",
    building: "Marina Heights",
    status: "Active",
    lastServiceDate: "Dec 8, 2025",
    serialNumber: "WH-2023-1204",
  },
  "AST-LGT-1204": {
    id: "AST-LGT-1204",
    name: "Living Room Light Fixture",
    type: "Electrical",
    category: "Lighting",
    location: "Unit 1204, 12th Floor, Tower A, Marina Heights",
    unit: "1204",
    floor: "12th Floor",
    tower: "Tower A",
    building: "Marina Heights",
    status: "Active",
    lastServiceDate: "Nov 2, 2025",
    serialNumber: "EL-2022-4410",
  },
};

function parseAssetIdFromQr(qrData: string): string | null {
  const trimmed = qrData.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith("{")) {
    try {
      const parsed = JSON.parse(trimmed) as { assetId?: string; id?: string };
      return parsed.assetId ?? parsed.id ?? null;
    } catch {
      return null;
    }
  }

  if (trimmed.startsWith("zen-dwell-mobile://asset/")) {
    return trimmed.replace("zen-dwell-mobile://asset/", "");
  }

  return trimmed;
}

export const assetService = {
  lookupByQr: async (qrData: string): Promise<Asset | null> => {
    const assetId = parseAssetIdFromQr(qrData);
    if (!assetId) return null;

    try {
      return await axiosInstance.get(`/assets/${encodeURIComponent(assetId)}`);
    } catch {
      return MOCK_ASSETS[assetId.toUpperCase()] ?? MOCK_ASSETS[assetId] ?? null;
    }
  },
};
