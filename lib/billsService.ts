import axiosInstance from './axios';

export interface BillPayment {
  id: string;
  billId: string;
  paymentMethod: string;
  receiptUrl?: string;
  paidAt: string;
}

export interface Bill {
  id: string;
  tenantId: string;
  title: string;
  amount: number | string;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue' | string;
  billType: string;
  billingPeriod: string;
  workorderId?: string;
  maintenanceRequestId?: string;
  createdAt: string;
  payments: BillPayment[];
}

export interface BillsSummary {
  totalBalance: number;
  unpaidCount: number;
  paidCount: number;
}

export const billsService = {
  getBillsSummary: async (tenantId: string): Promise<BillsSummary> => {
    return axiosInstance.get('/bills/summary', {
      params: { tenantId },
    });
  },

  getBills: async (tenantId: string): Promise<Bill[]> => {
    return axiosInstance.get('/bills', {
      params: { tenantId },
    });
  },

  payBill: async (billId: string, paymentMethod: string, receiptUrl?: string): Promise<BillPayment> => {
    return axiosInstance.post(`/bills/${billId}/pay`, {
      paymentMethod,
      receiptUrl,
    });
  },
};
