import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api/v1',
  timeout: 5000,
});

export interface DashboardStats {
  total_assets: number;
  ueba_score: number;
  active_alerts: number;
  sla_compliance: number;
  pending_audits: number;
}

export interface Asset {
  ID: number;
  name: string;
  type: string;
  platform: string;
  ip: string;
  status: string;
  region: string;
  owner: string;
  description: string;
  specs: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export const getDashboardStats = async () => {
  const response = await api.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

export const getAssets = async () => {
  const response = await api.get<Asset[]>('/assets');
  return response.data;
};

export const createAsset = async (data: Partial<Asset>) => {
  const response = await api.post<Asset>('/assets', data);
  return response.data;
};

export const updateAsset = async (id: number, data: Partial<Asset>) => {
  const response = await api.put<Asset>(`/assets/${id}`, data);
  return response.data;
};

export const deleteAsset = async (id: number) => {
  const response = await api.delete(`/assets/${id}`);
  return response.data;
};

export default api;
