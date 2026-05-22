import axiosInstance from './axios';

export interface ChecklistItem {
  id: string;
  tenantId: string;
  itemCategory: string;    // room / category name (e.g. "Living Room")
  itemName: string;
  status: 'pending' | 'completed' | 'issue' | string;
  notes?: string;
  photoUrl?: string;
  updatedAt: string;
}

export interface MoveInPhoto {
  id: string;
  tenantId: string;
  photoUrl: string;
  createdAt: string;
}

export interface MoveInSignature {
  id: string;
  tenantId: string;
  signatureUrl: string;
  signedAt: string;
}

// Named export so screens can import as `moveinService`
export const moveinService = {
  getChecklist: async (tenantId: string): Promise<ChecklistItem[]> => {
    return axiosInstance.get('/movein/checklist', {
      params: { tenantId },
    });
  },

  updateChecklistItem: async (id: string, data: { status?: string; notes?: string; photoUrl?: string }): Promise<void> => {
    return axiosInstance.patch(`/movein/checklist/${id}`, data);
  },

  getPhotos: async (tenantId: string): Promise<MoveInPhoto[]> => {
    return axiosInstance.get('/movein/photos', {
      params: { tenantId },
    });
  },

  addPhoto: async (photoUrl: string): Promise<MoveInPhoto> => {
    return axiosInstance.post('/movein/photos', { photoUrl });
  },

  getSignature: async (tenantId: string): Promise<MoveInSignature> => {
    return axiosInstance.get('/movein/signature', {
      params: { tenantId },
    });
  },

  signAgreement: async (payload: { tenantId: string; signatureUrl: string }): Promise<MoveInSignature> => {
    return axiosInstance.post('/movein/signature', payload);
  },
};

// Keep backward-compatible alias
export const moveInService = moveinService;
