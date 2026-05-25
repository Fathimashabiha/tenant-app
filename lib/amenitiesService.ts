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
  qrPayload?: string;
  status: string;
  facility: Facility;
}

export interface BookedSlot {
  startTime: string;
  endTime: string;
  bookingId: string;
}

export interface FacilityAvailability {
  facilityId: string;
  date: string;
  bookedSlots: BookedSlot[];
}

export interface ParkingRequest {
  id: string;
  tenantId: string;
  vehicleModel: string;
  vehicleType?: string;
  licensePlate: string;
  purpose?: string;
  duration?: string;
  status: string;
  assignedSlot?: string;
  qrCodeUrl?: string;
  qrPayload?: string;
  createdAt: string;
}

export const amenitiesService = {
  getFacilities: async (): Promise<Facility[]> => {
    return axiosInstance.get('/amenities/facilities');
  },

  getAvailability: async (facilityId: string, date: string): Promise<FacilityAvailability> => {
    return axiosInstance.get(`/amenities/facilities/${facilityId}/availability`, {
      params: { date },
    });
  },

  getBookings: async (tenantId: string): Promise<AmenityBooking[]> => {
    return axiosInstance.get('/amenities/bookings', {
      params: { tenantId },
    });
  },

  bookFacility: async (payload: {
    tenantId: string;
    facilityId: string;
    bookingDate: string;
    startTime: string;
    endTime?: string;
  }): Promise<AmenityBooking> => {
    return axiosInstance.post('/amenities/bookings', payload);
  },

  getParkingRequests: async (tenantId: string): Promise<ParkingRequest[]> => {
    return axiosInstance.get('/amenities/parking', {
      params: { tenantId },
    });
  },

  requestParking: async (payload: {
    tenantId: string;
    vehicleModel: string;
    licensePlate: string;
    vehicleType?: string;
    purpose?: string;
    duration?: string;
  }): Promise<ParkingRequest> => {
    return axiosInstance.post('/amenities/parking', payload);
  },
};
