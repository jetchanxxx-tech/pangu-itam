// Contract file storage using D1 BLOB columns

export interface ContractFileRow {
  id: number;
  contract_id: number;
  file_name: string;
  file_data: ArrayBuffer | null;
  file_size: number;
  file_type: string;
  version: number;
  uploaded_by: string;
  remark: string;
  created_at: string;
}

export interface ContractFileMeta {
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

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export function validateFileSize(size: number): boolean {
  return size > 0 && size <= MAX_FILE_SIZE;
}

export async function listFiles(
  db: D1Database,
  contractId: number
): Promise<ContractFileMeta[]> {
  const { results } = await db.prepare(
    `SELECT id, contract_id, file_name, file_size, file_type, version, uploaded_by, remark, created_at
     FROM contract_files
     WHERE contract_id = ?
     ORDER BY version DESC`
  ).bind(contractId).all();

  return (results ?? []) as unknown as ContractFileMeta[];
}

export async function getFile(
  db: D1Database,
  fileId: number
): Promise<ContractFileRow | null> {
  const row = await db.prepare(
    'SELECT * FROM contract_files WHERE id = ?'
  ).bind(fileId).first<Record<string, unknown>>();

  if (!row) return null;

  return {
    id: row.id as number,
    contract_id: row.contract_id as number,
    file_name: row.file_name as string,
    file_data: (row.file_data ?? null) as ArrayBuffer | null,
    file_size: row.file_size as number,
    file_type: row.file_type as string,
    version: row.version as number,
    uploaded_by: row.uploaded_by as string,
    remark: row.remark as string,
    created_at: row.created_at as string,
  };
}

export async function storeFile(
  db: D1Database,
  contractId: number,
  fileName: string,
  fileData: ArrayBuffer,
  mimeType: string,
  uploadedBy: string,
  remark: string
): Promise<number> {
  const last = await db.prepare(
    'SELECT MAX(version) as maxv FROM contract_files WHERE contract_id = ?'
  ).bind(contractId).first<{ maxv: number | null }>();

  const version = (last?.maxv ?? 0) + 1;

  const result = await db.prepare(
    `INSERT INTO contract_files (contract_id, file_name, file_data, file_size, file_type, version, uploaded_by, remark)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    contractId, fileName, fileData, fileData.byteLength, mimeType,
    version, uploadedBy, remark
  ).run();

  return result.meta.last_row_id ?? 0;
}

export async function deleteFile(
  db: D1Database,
  fileId: number
): Promise<boolean> {
  const result = await db.prepare(
    'DELETE FROM contract_files WHERE id = ?'
  ).bind(fileId).run();

  return result.meta.changes > 0;
}
