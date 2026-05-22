import axiosInstance from './axios';

export interface Facility {
  id: string;
  name: string;
  description: string;
  amenityType: string;
}

export interface AmenityBooking {
  id: string;
  tenantId: string;
  facilityId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  qrCodeUrl?: string;
  status: string;
  facility: Facility;
}

export interface ParkingRequest {
  id: string;
  tenantId: string;
  vehicleModel: string;
  licensePlate: string;
  status: string;
  assignedSlot?: string;
  createdAt: string;
}

export const amenitiesService = {
  getFacilities: async (): Promise<Facility[]> => {
    return axiosInstance.get('/amenities/facilities');
  },

  getBookings: async (tenantId: string): Promise<AmenityBooking[]> => {
    return axiosInstance.get('/amenities/bookings', {
      params: { tenantId },
    });
  },

  bookFacility: async (payload: { tenantId: string; facilityId: string; bookingDate: string; startTime: string; endTime: string }): Promise<AmenityBooking> => {
    return axiosInstance.post('/amenities/bookings', payload);
  },

  getParkingRequests: async (tenantId: string): Promise<ParkingRequest[]> => {
    return axiosInstance.get('/amenities/parking', {
      params: { tenantId },
    });
  },

  requestParking: async (payload: { vehicleModel: string; licensePlate: string }): Promise<ParkingRequest> => {
    return axiosInstance.post('/amenities/parking', payload);
  },
};
