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

export interface Contract {
  ID: number;
  name: string;
  number: string;
  amount: number;
  currency: string;
  sign_date: string;
  expire_date: string;
  vendor: string;
  status: string;
  description: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export interface ContractFile {
  ID: number;
  contract_id: number;
  file_name: string;
  file_path: string;
  version: number;
  uploaded_by: string;
  CreatedAt: string;
}

export interface SystemInterface {
  ID: number;
  name: string;
  method: string;
  url: string;
  description: string;
  status: string;
  CreatedAt: string;
  UpdatedAt: string;
}

export const getDashboardStats = async () => {
  const response = await api.get<DashboardStats>('/dashboard/stats');
  return response.data;
};

// Assets
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

// Contracts
export const getContracts = async () => {
  const response = await api.get<Contract[]>('/contracts');
  return response.data;
};

export const getContract = async (id: number) => {
  const response = await api.get<Contract>(`/contracts/${id}`);
  return response.data;
};

export const createContract = async (data: Partial<Contract>) => {
  const response = await api.post<Contract>('/contracts', data);
  return response.data;
};

export const updateContract = async (id: number, data: Partial<Contract>) => {
  const response = await api.put<Contract>(`/contracts/${id}`, data);
  return response.data;
};

export const deleteContract = async (id: number) => {
  const response = await api.delete(`/contracts/${id}`);
  return response.data;
};

// Contract Files
export const getContractFiles = async (contractId: number) => {
  const response = await api.get<ContractFile[]>(`/contracts/${contractId}/files`);
  return response.data;
};

export const uploadContractFile = async (contractId: number, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post<ContractFile>(`/contracts/${contractId}/files`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getContractFileDownloadUrl = (fileId: number) => {
  return `http://localhost:8080/api/v1/contract-files/${fileId}/download`;
};

// Interfaces
export const getInterfaces = async () => {
  const response = await api.get<SystemInterface[]>('/interfaces');
  return response.data;
};

export const createInterface = async (data: Partial<SystemInterface>) => {
  const response = await api.post<SystemInterface>('/interfaces', data);
  return response.data;
};

export const updateInterface = async (id: number, data: Partial<SystemInterface>) => {
  const response = await api.put<SystemInterface>(`/interfaces/${id}`, data);
  return response.data;
};

export const deleteInterface = async (id: number) => {
  const response = await api.delete(`/interfaces/${id}`);
  return response.data;
};

export default api;
