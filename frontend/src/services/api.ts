import type {
  Safehouse,
  Resident,
  Donation,
  Supporter,
  DashboardOverview,
  DashboardMetrics,
} from '../types/api';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============ Safehouses ============

export async function getSafehouses(): Promise<Safehouse[]> {
  return fetchApi<Safehouse[]>('/safehouses');
}

export async function getSafehouse(id: number): Promise<Safehouse> {
  return fetchApi<Safehouse>(`/safehouses/${id}`);
}

export async function createSafehouse(data: Partial<Safehouse>): Promise<Safehouse> {
  return fetchApi<Safehouse>('/safehouses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSafehouse(id: number, data: Partial<Safehouse>): Promise<void> {
  return fetchApi(`/safehouses/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSafehouse(id: number): Promise<void> {
  return fetchApi(`/safehouses/${id}`, { method: 'DELETE' });
}

// ============ Residents ============

export async function getResidents(params?: {
  safehouseId?: number;
  status?: string;
  category?: string;
}): Promise<Resident[]> {
  const query = new URLSearchParams();
  if (params?.safehouseId) query.set('safehouseId', String(params.safehouseId));
  if (params?.status) query.set('status', params.status);
  if (params?.category) query.set('category', params.category);
  
  return fetchApi<Resident[]>(`/residents?${query.toString()}`);
}

export async function getResident(id: number): Promise<Resident> {
  return fetchApi<Resident>(`/residents/${id}`);
}

export async function getResidentTimeline(id: number): Promise<{
  resident: Resident;
  processRecordings: Resident['processRecordings'];
  homeVisitations: Resident['homeVisitations'];
  incidents: Resident['incidentReports'];
}> {
  return fetchApi(`/residents/${id}/timeline`);
}

export async function createResident(data: Partial<Resident>): Promise<Resident> {
  return fetchApi<Resident>('/residents', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateResident(id: number, data: Partial<Resident>): Promise<void> {
  return fetchApi(`/residents/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteResident(id: number): Promise<void> {
  return fetchApi(`/residents/${id}`, { method: 'DELETE' });
}

// ============ Donations ============

export async function getDonations(params?: {
  supporterId?: number;
  type?: string;
  startDate?: string;
  endDate?: string;
}): Promise<Donation[]> {
  const query = new URLSearchParams();
  if (params?.supporterId) query.set('supporterId', String(params.supporterId));
  if (params?.type) query.set('type', params.type);
  if (params?.startDate) query.set('startDate', params.startDate);
  if (params?.endDate) query.set('endDate', params.endDate);
  
  return fetchApi<Donation[]>(`/donations?${query.toString()}`);
}

export async function getDonation(id: number): Promise<Donation> {
  return fetchApi<Donation>(`/donations/${id}`);
}

export async function getDonationStats(): Promise<{
  totalAmount: number;
  totalByType: Array<{ type: string; count: number; total: number }>;
  recurringDonations: number;
  averageDonation: number;
  totalDonations: number;
}> {
  return fetchApi('/donations/stats');
}

export async function createDonation(data: Partial<Donation>): Promise<Donation> {
  return fetchApi<Donation>('/donations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateDonation(id: number, data: Partial<Donation>): Promise<void> {
  return fetchApi(`/donations/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteDonation(id: number): Promise<void> {
  return fetchApi(`/donations/${id}`, { method: 'DELETE' });
}

// ============ Supporters ============

export async function getSupporters(params?: {
  type?: string;
  atRisk?: boolean;
}): Promise<Supporter[]> {
  const query = new URLSearchParams();
  if (params?.type) query.set('type', params.type);
  if (params?.atRisk !== undefined) query.set('atRisk', String(params.atRisk));
  
  return fetchApi<Supporter[]>(`/supporters?${query.toString()}`);
}

export async function getSupporter(id: number): Promise<Supporter> {
  return fetchApi<Supporter>(`/supporters/${id}`);
}

export async function getAtRiskSupporters(): Promise<Supporter[]> {
  return fetchApi<Supporter[]>('/supporters/at-risk/list');
}

export async function createSupporter(data: Partial<Supporter>): Promise<Supporter> {
  return fetchApi<Supporter>('/supporters', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateSupporter(id: number, data: Partial<Supporter>): Promise<void> {
  return fetchApi(`/supporters/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteSupporter(id: number): Promise<void> {
  return fetchApi(`/supporters/${id}`, { method: 'DELETE' });
}

// ============ Dashboard ============

export async function getDashboardOverview(): Promise<DashboardOverview> {
  return fetchApi<DashboardOverview>('/dashboard/overview');
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  return fetchApi<DashboardMetrics>('/dashboard/metrics');
}

// ============ Health ============

export async function getHealthStatus(): Promise<{ status: string; timestamp: string }> {
  return fetchApi('/health');
}