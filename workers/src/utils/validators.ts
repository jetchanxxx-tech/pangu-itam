import { z } from 'zod';

export const createAssetSchema = z.object({
  name: z.string().min(1).max(200),
  type: z.string().max(50).optional().default(''),
  platform: z.string().max(50).optional().default(''),
  ip: z.string().max(45).optional().default(''),
  status: z.enum(['Online', 'Offline', 'Maintenance']).optional().default('Online'),
  region: z.string().max(100).optional().default(''),
  owner: z.string().max(100).optional().default(''),
  description: z.string().max(2000).optional().default(''),
  specs: z.string().max(200).optional().default(''),
});

export const updateAssetSchema = createAssetSchema.partial();

export const createContractSchema = z.object({
  name: z.string().min(1).max(200),
  code: z.string().max(100).optional().default(''),
  type: z.string().max(50).optional().default(''),
  status: z.enum(['draft', 'active', 'expired', 'terminated']).optional().default('draft'),
  vendor: z.string().max(200).optional().default(''),
  amount: z.number().min(0).optional().default(0),
  currency: z.string().max(10).optional().default('CNY'),
  start_date: z.string().optional().default(''),
  end_date: z.string().optional().default(''),
  sign_date: z.string().optional().default(''),
  description: z.string().max(2000).optional().default(''),
  owner: z.string().max(100).optional().default(''),
  contact_info: z.string().max(200).optional().default(''),
  asset_id: z.number().int().positive().optional().nullable(),
});

export const updateContractSchema = createContractSchema.partial();

export const createInterfaceSchema = z.object({
  name: z.string().min(1).max(200),
  method: z.enum(['GET', 'POST', 'PUT', 'DELETE', 'PATCH']).optional().default('GET'),
  url: z.string().max(500).optional().default(''),
  description: z.string().max(2000).optional().default(''),
  status: z.enum(['Active', 'Deprecated']).optional().default('Active'),
});

export const updateInterfaceSchema = createInterfaceSchema.partial();

export const loginSchema = z.object({
  username: z.string().min(1).max(100),
  password: z.string().min(1).max(100),
});

export const changePasswordSchema = z.object({
  oldPassword: z.string().min(1),
  newPassword: z.string().min(4).max(100),
});
