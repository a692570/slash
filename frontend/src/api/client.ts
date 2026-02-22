// ===========================================
// API CLIENT - Slash Frontend
// ===========================================

// Types
export interface Bill {
  id: string;
  provider: string;
  category: string;
  providerName?: string;
  currentRate: number;
  accountNumber: string;
  planName?: string;
  status?: string;
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
  totalSavings?: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalSavings: number;
  activeNegotiations: number;
  successRate: number;
  billsTracked: number;
  totalBills?: number;
  totalMonthlySavings?: number;
  totalLifetimeSavings?: number;
  completedNegotiations?: number;
  successfulNegotiations?: number;
}

export interface CreateBillRequest {
  provider: string;
  category: string;
  providerName?: string;
  currentRate: number;
  accountNumber: string;
  planName?: string;
}

// ===========================================
// DEMO USER MANAGEMENT
// ===========================================

const DEMO_USER_KEY = 'slash_demo_user_id';

function getDemoUserId(): string | null {
  return localStorage.getItem(DEMO_USER_KEY);
}

function setDemoUserId(id: string): void {
  localStorage.setItem(DEMO_USER_KEY, id);
}

/**
 * Initialize demo user - call on app boot.
 * Hits POST /api/demo/setup to create/get demo user, stores ID.
 */
export async function initDemoUser(): Promise<string | null> {
  // Check if already initialized
  const existing = getDemoUserId();
  if (existing) return existing;

  try {
    const res = await fetch(`${API_BASE}/demo/setup`, { method: 'POST' });
    const json = await res.json();
    if (json.success && json.data?.userId) {
      setDemoUserId(json.data.userId);
      return json.data.userId;
    }
  } catch (error) {
    console.warn('[API] Demo setup failed:', error);
  }
  return null;
}

// ===========================================
// FETCH WRAPPER
// ===========================================

const API_BASE = '/api';

async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const userId = getDemoUserId();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string>),
  };
  if (userId) {
    headers['x-user-id'] = userId;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }
  
  return response.json();
}

// ===========================================
// API METHODS
// ===========================================

export const api = {
  // Bills
  getBills: async (): Promise<Bill[]> => {
    const res = await fetchJSON<any>(`${API_BASE}/bills`);
    // Backend returns { success, data: { items: [...] } }
    if (res?.data?.items) return res.data.items;
    if (res?.items) return res.items;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  },

  getBill: async (id: string): Promise<Bill | null> => {
    const res = await fetchJSON<any>(`${API_BASE}/bills/${id}`);
    return res?.data || res || null;
  },
  
  createBill: async (data: CreateBillRequest): Promise<Bill> => {
    const res = await fetchJSON<any>(`${API_BASE}/bills`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return res?.data || res;
  },
  
  negotiateBill: async (billId: string): Promise<{ negotiationId: string; status: string }> => {
    const res = await fetchJSON<any>(`${API_BASE}/bills/${billId}/negotiate`, {
      method: 'POST',
    });
    // Backend returns { success, data: { negotiationId, status, ... } }
    return res?.data || res;
  },
  
  // Negotiations
  getNegotiations: async (): Promise<Negotiation[]> => {
    const res = await fetchJSON<any>(`${API_BASE}/negotiations`);
    if (res?.data?.items) return res.data.items;
    if (Array.isArray(res?.data)) return res.data;
    if (Array.isArray(res)) return res;
    return [];
  },

  getNegotiation: async (id: string): Promise<Negotiation> => {
    const res = await fetchJSON<any>(`${API_BASE}/negotiations/${id}`);
    return res?.data || res;
  },
  
  // Dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const res = await fetchJSON<any>(`${API_BASE}/dashboard`);
    // Backend returns { success, data: { user, stats, recentNegotiations, activeBills } }
    const stats = res?.data?.stats || res?.data || res;
    return {
      totalSavings: stats.totalMonthlySavings || stats.totalSavings || 0,
      activeNegotiations: stats.activeNegotiations || 0,
      successRate: stats.successRate || 0,
      billsTracked: stats.totalBills || stats.billsTracked || 0,
      ...stats,
    };
  },

  // Graph insights
  getProviderInsights: async (providerId: string) => {
    const res = await fetchJSON<any>(`${API_BASE}/graph/provider/${providerId}`);
    return res?.data || res;
  },
};
