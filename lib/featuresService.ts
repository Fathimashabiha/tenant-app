import axiosInstance from './axios';

export interface TenantFeatures {
  tenantId: string;
  communityEnabled: boolean;
  tenancyEnabled: boolean;
}

export const featuresService = {
  getFeatures: async (tenantId: string): Promise<TenantFeatures> => {
    return axiosInstance.get('/features', { params: { tenantId } });
  },
};
