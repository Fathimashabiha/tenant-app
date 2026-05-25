import axios from "axios";
import axiosInstance from "./axios";
import { amenitiesService } from "./amenitiesService";
import { billsService } from "./billsService";
import { maintenanceService } from "./maintenanceService";
import { featuresService } from "./featuresService";
import { buildHomeFeed, type HomeFeedResponse } from "./homeFeed";
import {
  loadReadNotificationIds,
  markAllNotificationsRead,
  markNotificationsRead,
} from "./notificationReadStorage";

function isHomeApiMissing(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false;
  return error.response?.status === 404;
}

async function fetchHomeFeedWithReadIds(
  tenantId: string,
  readIds: Set<string>,
): Promise<HomeFeedResponse> {
  const [bills, maintenance, bookings, features] = await Promise.all([
    billsService.getBills(tenantId),
    maintenanceService.getRequests(tenantId),
    amenitiesService.getBookings(tenantId),
    featuresService.getFeatures(tenantId),
  ]);

  return buildHomeFeed(
    { bills, maintenance, bookings },
    features.tenancyEnabled,
    readIds,
  );
}

async function fetchHomeFeedFallback(tenantId: string): Promise<HomeFeedResponse> {
  const readIds = await loadReadNotificationIds();
  return fetchHomeFeedWithReadIds(tenantId, readIds);
}

export type { HomeFeedResponse };

export const homeService = {
  getFeed: async (tenantId: string): Promise<HomeFeedResponse> => {
    try {
      return await axiosInstance.get("/home", { params: { tenantId } });
    } catch (error) {
      if (isHomeApiMissing(error)) {
        console.warn("[home] /api/home not found — using client fallback. Restart sz-tenant-service.");
        return fetchHomeFeedFallback(tenantId);
      }
      throw error;
    }
  },

  markNotificationsRead: async (
    tenantId: string,
    notificationIds: string[],
  ): Promise<HomeFeedResponse> => {
    try {
      return await axiosInstance.post("/home/notifications/read", {
        tenantId,
        notificationIds,
      });
    } catch (error) {
      if (!isHomeApiMissing(error)) throw error;
      const readIds = await markNotificationsRead(notificationIds);
      return fetchHomeFeedWithReadIds(tenantId, readIds);
    }
  },

  markAllNotificationsRead: async (tenantId: string): Promise<HomeFeedResponse> => {
    try {
      return await axiosInstance.post("/home/notifications/read-all", { tenantId });
    } catch (error) {
      if (!isHomeApiMissing(error)) throw error;
      const feed = await fetchHomeFeedFallback(tenantId);
      const readIds = await markAllNotificationsRead(feed.notifications.map((n) => n.id));
      return fetchHomeFeedWithReadIds(tenantId, readIds);
    }
  },
};
