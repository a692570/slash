// Types
export interface Bill {
  id: string;
  provider: string;
  category: string;
  providerName?: string;
  currentRate: number;
  accountNumber: string;
  planName?: string;
  createdAt: string;
}

export interface Negotiation {
  id: string;
  billId: string;
  status: 'pending' | 'researching' | 'calling' | 'negotiating' | 'success' | 'failed';
  originalRate?: number;
  newRate?: number;
  monthlySavings?: number;
  annualSavings?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalSavings: number;
  activeNegotiations: number;
  successRate: number;
  billsTracked: number;
}

export interface CreateBillRequest {
  provider: string;
  category: string;
  providerName?: string;
  currentRate: number;
  accountNumber: string;
  planName?: string;
}

// API Client
const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

export const api = {
  // Bills
  getBills: () => fetchJSON<Bill[]>(`${API_BASE}/bills`),
  
  createBill: (data: CreateBillRequest) => 
    fetchJSON<Bill>(`${API_BASE}/bills`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  
  negotiateBill: (billId: string) =>
    fetchJSON<Negotiation>(`${API_BASE}/bills/${billId}/negotiate`, {
      method: 'POST',
    }),
  
  // Negotiations
  getNegotiation: (id: string) =>
    fetchJSON<Negotiation>(`${API_BASE}/negotiations/${id}`),
  
  // Dashboard
  getDashboardStats: () =>
    fetchJSON<DashboardStats>(`${API_BASE}/dashboard`),
};

// Mock data for demo/fallback
export const mockStats: DashboardStats = {
  totalSavings: 1847,
  activeNegotiations: 2,
  successRate: 87,
  billsTracked: 6,
};

export const mockBills: Bill[] = [
  {
    id: '1',
    provider: 'Xfinity',
    category: 'internet',
    currentRate: 89.99,
    accountNumber: '8472916352',
    planName: 'Performance Pro Internet',
    createdAt: '2024-01-15T10:30:00Z',
  },
  {
    id: '2',
    provider: 'T-Mobile',
    category: 'cell_phone',
    currentRate: 85.00,
    accountNumber: '5129384761',
    planName: 'Magenta MAX',
    createdAt: '2024-01-20T14:15:00Z',
  },
  {
    id: '3',
    provider: 'Geico',
    category: 'insurance',
    currentRate: 145.00,
    accountNumber: 'GEICO123456',
    planName: 'Auto Insurance - Full Coverage',
    createdAt: '2024-02-01T09:00:00Z',
  },
  {
    id: '4',
    provider: 'Stanford Medical Center',
    category: 'medical',
    providerName: 'Stanford Medical Center',
    currentRate: 450.00,
    accountNumber: 'SMC-789456',
    planName: 'Emergency Room Visit',
    createdAt: '2024-01-28T11:00:00Z',
  },
];

export const mockNegotiations: Negotiation[] = [
  {
    id: 'n1',
    billId: '1',
    status: 'success',
    originalRate: 89.99,
    newRate: 64.99,
    monthlySavings: 25.00,
    annualSavings: 300.00,
    createdAt: '2024-02-10T08:00:00Z',
    updatedAt: '2024-02-10T08:15:00Z',
  },
  {
    id: 'n2',
    billId: '3',
    status: 'calling',
    createdAt: '2024-02-17T18:00:00Z',
    updatedAt: '2024-02-17T18:05:00Z',
  },
];
