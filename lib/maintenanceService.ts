import axiosInstance from './axios';

export interface MaintenancePhoto {
  id: string;
  photoUrl: string;
  createdAt: string;
}

export interface MaintenanceRating {
  id: string;
  rating: number;
  comments?: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  tenantId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  scheduledDate?: string;
  workorderId?: string;
  technicianId?: string;
  technicianName?: string;
  technicianPhone?: string;
  technicianAvatar?: string;
  createdAt: string;
  updatedAt: string;
  photos: MaintenancePhoto[];
  ratings: MaintenanceRating[];
  videoUrl?: string;
  audioUrl?: string;
}

export interface CreateMaintenanceRequestPayload {
  tenantId: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  requestType?: "asset" | "location";
  assetId?: string;
  assetName?: string;
  location?: string;
  preferredTime?: string;
  photos?: string[];
  videoUrl?: string;
  audioUrl?: string;
}

export const maintenanceService = {
  getRequests: async (tenantId: string): Promise<MaintenanceRequest[]> => {
    return axiosInstance.get('/maintenance/requests', {
      params: { tenantId },
    });
  },

  getRequestById: async (id: string): Promise<MaintenanceRequest> => {
    return axiosInstance.get(`/maintenance/requests/${id}`);
  },

  createRequest: async (payload: CreateMaintenanceRequestPayload): Promise<MaintenanceRequest> => {
    return axiosInstance.post('/maintenance/requests', payload);
  },

  rateRequest: async (id: string, rating: number, comments?: string): Promise<MaintenanceRating> => {
    return axiosInstance.post(`/maintenance/requests/${id}/rate`, {
      rating,
      comments,
    });
  },
};
