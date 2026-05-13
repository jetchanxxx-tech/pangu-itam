import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? '/api/v1' : 'https://itam-api.jet-s.workers.dev/api/v1',
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('username');
      localStorage.removeItem('role');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Unified response types
export interface ApiOk<T> {
  ok: true;
  data: T;
}

export interface ApiList<T> {
  ok: true;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  total_assets: number;
  online_assets: number;
  offline_assets: number;
  total_contracts: number;
  active_contracts: number;
  expiring_contracts: number;
  sla_compliance: number;
}

export interface WikiArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string;
  created_at: string;
  updated_at: string;
}

export interface Asset {
  id: number;
  name: string;
  type: string;
  platform: string;
  ip: string;
  status: string;
  region: string;
  owner: string;
  description: string;
  specs: string;
  created_at: string;
  updated_at: string;
}

export interface Contract {
  id: number;
  name: string;
  code: string;
  type: string;
  status: string;
  vendor: string;
  amount: number;
  currency: string;
  start_date: string;
  end_date: string;
  sign_date: string;
  description: string;
  owner: string;
  contact_info: string;
  asset_id?: number | null;
  created_at: string;
  updated_at: string;
}

export interface ContractFile {
  id: number;
  contract_id: number;
  file_name: string;
  file_size: number;
  file_type: string;
  version: number;
  uploaded_by: string;
  remark: string;
  created_at: string;
}

export interface SystemInterface {
  id: number;
  name: string;
  method: string;
  url: string;
  description: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface UserInfo {
  user_id: number;
  username: string;
  role: string;
}

// Auth
export const login = async (username: string, password: string): Promise<ApiOk<{ token: string; username: string; role: string }>> => {
  const response = await api.post('/auth/login', { username, password });
  return response.data;
};

export const logout = async (): Promise<ApiOk<{ message: string }>> => {
  const response = await api.post('/auth/logout');
  return response.data;
};

export const getUserInfo = async (): Promise<ApiOk<UserInfo>> => {
  const response = await api.get('/user/me');
  return response.data;
};

export const changePassword = async (oldPassword: string, newPassword: string): Promise<ApiOk<{ message: string }>> => {
  const response = await api.post('/user/change-password', { oldPassword, newPassword });
  return response.data;
};

// Dashboard
export const getDashboardStats = async (): Promise<ApiOk<DashboardStats>> => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

// Assets
export const getAssets = async (params?: {
  page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc'; search?: string; archived?: string;
}): Promise<ApiList<Asset>> => {
  const response = await api.get('/assets', { params });
  return response.data;
};

export const createAsset = async (data: Partial<Asset>): Promise<ApiOk<Asset>> => {
  const response = await api.post('/assets', data);
  return response.data;
};

export const updateAsset = async (id: number, data: Partial<Asset>): Promise<ApiOk<Asset>> => {
  const response = await api.put(`/assets/${id}`, data);
  return response.data;
};

export const deleteAsset = async (id: number): Promise<ApiOk<{ message: string }>> => {
  const response = await api.delete(`/assets/${id}`);
  return response.data;
};

// Contracts
export const getContracts = async (params?: {
  page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc'; search?: string;
}): Promise<ApiList<Contract>> => {
  const response = await api.get('/contracts', { params });
  return response.data;
};

export const getContract = async (id: number): Promise<ApiOk<Contract>> => {
  const response = await api.get(`/contracts/${id}`);
  return response.data;
};

export const createContract = async (data: Partial<Contract>): Promise<ApiOk<Contract>> => {
  const response = await api.post('/contracts', data);
  return response.data;
};

export const updateContract = async (id: number, data: Partial<Contract>): Promise<ApiOk<Contract>> => {
  const response = await api.put(`/contracts/${id}`, data);
  return response.data;
};

export const deleteContract = async (id: number): Promise<ApiOk<{ message: string }>> => {
  const response = await api.delete(`/contracts/${id}`);
  return response.data;
};

// Contract Files
export const getContractFiles = async (contractId: number): Promise<ApiOk<ContractFile[]>> => {
  const response = await api.get(`/contracts/${contractId}/files`);
  return response.data;
};

export const uploadContractFile = async (contractId: number, file: File, remark?: string): Promise<ApiOk<ContractFile>> => {
  const formData = new FormData();
  formData.append('file', file);
  if (remark) formData.append('remark', remark);
  const response = await api.post(`/contracts/${contractId}/files`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const downloadContractFile = async (fileId: number): Promise<Blob> => {
  const response = await api.get(`/contract-files/${fileId}/download`, {
    responseType: 'blob',
  });
  return response.data;
};

export const deleteContractFile = async (fileId: number): Promise<ApiOk<{ message: string }>> => {
  const response = await api.delete(`/contract-files/${fileId}`);
  return response.data;
};

// Interfaces
export const getInterfaces = async (params?: {
  page?: number; limit?: number; sort?: string; order?: 'asc' | 'desc'; search?: string;
}): Promise<ApiList<SystemInterface>> => {
  const response = await api.get('/interfaces', { params });
  return response.data;
};

export const getInterface = async (id: number): Promise<ApiOk<SystemInterface>> => {
  const response = await api.get(`/interfaces/${id}`);
  return response.data;
};

export const createInterface = async (data: Partial<SystemInterface>): Promise<ApiOk<SystemInterface>> => {
  const response = await api.post('/interfaces', data);
  return response.data;
};

export const updateInterface = async (id: number, data: Partial<SystemInterface>): Promise<ApiOk<SystemInterface>> => {
  const response = await api.put(`/interfaces/${id}`, data);
  return response.data;
};

export const deleteInterface = async (id: number): Promise<ApiOk<{ message: string }>> => {
  const response = await api.delete(`/interfaces/${id}`);
  return response.data;
};

// Wiki
export const getWikiArticles = async (params?: {
  page?: number; limit?: number; search?: string; category?: string;
}): Promise<ApiList<WikiArticle>> => {
  const response = await api.get('/wiki', { params });
  return response.data;
};

export const getWikiArticle = async (id: number): Promise<ApiOk<WikiArticle>> => {
  const response = await api.get(`/wiki/${id}`);
  return response.data;
};

export const createWikiArticle = async (data: Partial<WikiArticle>): Promise<ApiOk<WikiArticle>> => {
  const response = await api.post('/wiki', data);
  return response.data;
};

export const updateWikiArticle = async (id: number, data: Partial<WikiArticle>): Promise<ApiOk<WikiArticle>> => {
  const response = await api.put(`/wiki/${id}`, data);
  return response.data;
};

export const deleteWikiArticle = async (id: number): Promise<ApiOk<{ message: string }>> => {
  const response = await api.delete(`/wiki/${id}`);
  return response.data;
};

export const getWikiCategories = async (): Promise<ApiOk<string[]>> => {
  const response = await api.get('/wiki/categories');
  return response.data;
};

// Asset archive & import
export const archiveAsset = async (id: number): Promise<ApiOk<{ message: string }>> => {
  const response = await api.post(`/assets/${id}/archive`);
  return response.data;
};

export const unarchiveAsset = async (id: number): Promise<ApiOk<{ message: string }>> => {
  const response = await api.post(`/assets/${id}/unarchive`);
  return response.data;
};

export const importAssetsCsv = async (file: File): Promise<ApiOk<{ imported: number; total: number; errors?: string[] }>> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/assets/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default api;
