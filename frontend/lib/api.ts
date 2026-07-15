const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000/api';

// ── Auth token helpers ──────────────────────────────────
export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function setToken(token: string): void {
  localStorage.setItem('token', token);
}

export function removeToken(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Clear cookies
  document.cookie = 'token=; path=/; max-age=0';
  document.cookie = 'role=; path=/; max-age=0';
}

export function setUser(user: User): void {
  localStorage.setItem('user', JSON.stringify(user));
  // Role-based session: 7 days for employees, 1 day for admins
  const maxAge = user.role === 'admin' ? 24 * 60 * 60 : 7 * 24 * 60 * 60;
  // Set both token and role cookies with matching expiry
  const token = localStorage.getItem('token');
  if (token) {
    document.cookie = `token=${token}; path=/; max-age=${maxAge}; SameSite=Lax`;
  }
  document.cookie = `role=${user.role}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem('user');
  return raw ? JSON.parse(raw) : null;
}

// ── Core fetch wrapper ──────────────────────────────────
async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...init, headers });
  const json = await res.json();

  if (!res.ok) {
    throw new Error(json.message ?? 'Request failed');
  }
  return json.data as T;
}

// ── Types ──────────────────────────────────────────────
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: 'admin' | 'employee';
  employee_id?: string;
  department?: string;
  position?: string;
  phone?: string;
  work_location?: string;
  status?: string;
}

export interface Asset {
  id: string;
  name: string;
  asset_tag: string;
  serial_number?: string;
  category: string;
  status: string;
  condition: string;
  purchase_date?: string;
  purchase_cost?: number;
  warranty_expiry?: string;
  vendor?: string;
  location?: string;
  description?: string;
}

export interface Assignment {
  id: string;
  asset_id: string;
  user_id: string;
  assigned_by?: string;
  assigned_date: string;
  expected_return_date?: string;
  actual_return_date?: string;
  status: string;
  notes?: string;
  asset?: Asset;
  user?: User;
}

export interface AssetRequest {
  id: string;
  requested_by: string;
  asset_id?: string;
  asset_name: string;
  category?: string;
  reason?: string;
  status: string;
  admin_comment?: string;
  created_at: string;
  requested_by_user?: {
    id: string;
    first_name: string;
    last_name: string;
  };
}

export interface MaintenanceLog {
  id: string;
  asset_id: string;
  reported_by?: string;
  assigned_to?: string;
  technician_id?: string;
  type: string;
  description?: string;
  cost?: number;
  status: string;
  scheduled_date?: string;
  completed_date?: string;
  asset?: Asset;
  technician?: User;
}

// ── Auth ───────────────────────────────────────────────
export const auth = {
  login: (email: string, password: string) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  signup: (data: {
    first_name: string;
    last_name: string;
    email: string;
    password: string;
    employee_id: string;
    department: string;
  }) =>
    request<{ token: string; user: User }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  logout: () =>
    request<null>('/auth/logout', { method: 'POST' }),
};

// ── Assets ─────────────────────────────────────────────
export const assets = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Asset[]>(`/assets${qs}`);
  },
  get: (id: string) => request<Asset>(`/assets/${id}`),
  create: (data: Partial<Asset>) =>
    request<Asset>('/assets', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Asset>) =>
    request<Asset>(`/assets/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<null>(`/assets/${id}`, { method: 'DELETE' }),
};

// ── Employees ──────────────────────────────────────────
export const employees = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<User[]>(`/employees${qs}`);
  },
  get: (id: string) => request<User>(`/employees/${id}`),
  update: (id: string, data: Partial<User>) =>
    request<User>(`/employees/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  delete: (id: string) =>
    request<null>(`/employees/${id}`, { method: 'DELETE' }),
};

export const users = {
  create: (data: Partial<User> & { password?: string }) =>
    request<User>('/users', { method: 'POST', body: JSON.stringify(data) }),
  submitSupportTicket: (subject: string, message: string) =>
    request<null>('/users/me/support-tickets', {
      method: 'POST',
      body: JSON.stringify({ subject, message }),
    }),
};

// ── Returns ────────────────────────────────────────────
export const returns = {
  create: (data: { assignment_id: string; condition_on_return?: string; return_notes?: string; return_date?: string }) =>
    request<unknown>('/returns', { method: 'POST', body: JSON.stringify(data) }),
};

// ── Assignments ────────────────────────────────────────
export const assignments = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<Assignment[]>(`/assignments${qs}`);
  },
  get: (id: string) => request<Assignment>(`/assignments/${id}`),
  create: (data: Partial<Assignment>) =>
    request<Assignment>('/assignments', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<Assignment>) =>
    request<Assignment>(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Asset Requests ─────────────────────────────────────
export const assetRequests = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<AssetRequest[]>(`/requests${qs}`);
  },
  get: (id: string) => request<AssetRequest>(`/requests/${id}`),
  create: (data: Partial<AssetRequest>) =>
    request<AssetRequest>('/requests', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<AssetRequest>) =>
    request<AssetRequest>(`/requests/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Maintenance ────────────────────────────────────────
export const maintenance = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<MaintenanceLog[]>(`/maintenance${qs}`);
  },
  get: (id: string) => request<MaintenanceLog>(`/maintenance/${id}`),
  create: (data: Partial<MaintenanceLog>) =>
    request<MaintenanceLog>('/maintenance', { method: 'POST', body: JSON.stringify(data) }),
  update: (id: string, data: Partial<MaintenanceLog>) =>
    request<MaintenanceLog>(`/maintenance/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
};

// ── Activities ─────────────────────────────────────────
export const activities = {
  list: (params?: Record<string, string>) => {
    const qs = params ? '?' + new URLSearchParams(params).toString() : '';
    return request<unknown[]>(`/activities${qs}`);
  },
};
