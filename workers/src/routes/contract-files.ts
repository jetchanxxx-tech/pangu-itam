import type { Context } from 'hono';
import { ok, notFound, err } from '../utils/response';
import { listFiles, getFile, storeFile, deleteFile, validateFileSize } from '../services/file-store';

export async function list(c: Context): Promise<Response> {
  const contractId = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(contractId)) return err(c, 'VALIDATION_ERROR', 'Invalid contract ID');

  const db = c.env.DB;

  const contract = await db.prepare('SELECT id FROM contracts WHERE id = ?').bind(contractId).first();
  if (!contract) return notFound(c, 'Contract');

  const files = await listFiles(db, contractId);
  return ok(c, files);
}

export async function upload(c: Context): Promise<Response> {
  const contractId = parseInt(c.req.param('id') ?? '', 10);
  if (isNaN(contractId)) return err(c, 'VALIDATION_ERROR', 'Invalid contract ID');

  const db = c.env.DB;

  const contract = await db.prepare('SELECT id FROM contracts WHERE id = ?').bind(contractId).first();
  if (!contract) return notFound(c, 'Contract');

  const formData = await c.req.formData();
  const file = formData.get('file');

  if (!file || !(file instanceof File)) {
    return err(c, 'VALIDATION_ERROR', 'No file uploaded. Use form field "file".');
  }

  if (!validateFileSize(file.size)) {
    return err(c, 'FILE_TOO_LARGE', 'File exceeds the 10MB size limit', 413);
  }

  const arrayBuffer = await file.arrayBuffer();
  const remark = (formData.get('remark') as string) ?? '';

  let uploadedBy = 'unknown';
  try {
    const user = c.get('user');
    uploadedBy = user?.username ?? 'unknown';
  } catch {
    // optional auth
  }

  const fileId = await storeFile(
    db, contractId, file.name, arrayBuffer, file.type, uploadedBy, remark
  );

  const row = await getFile(db, fileId);

  return ok(c, {
    id: row?.id ?? fileId,
    file_name: row?.file_name ?? file.name,
    file_size: row?.file_size ?? file.size,
    file_type: row?.file_type ?? file.type,
    version: row?.version ?? 1,
    uploaded_by: row?.uploaded_by ?? uploadedBy,
    remark: row?.remark ?? remark,
    created_at: row?.created_at ?? new Date().toISOString(),
  }, 201);
}

export async function download(c: Context): Promise<Response> {
  const fileId = parseInt(c.req.param('fileId') ?? '', 10);
  if (isNaN(fileId)) return err(c, 'VALIDATION_ERROR', 'Invalid file ID');

  const db = c.env.DB;
  const file = await getFile(db, fileId);

  if (!file || !file.file_data) {
    return notFound(c, 'File');
  }

  return new Response(file.file_data, {
    headers: {
      'Content-Type': file.file_type || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.file_name)}"`,
      'Content-Length': String(file.file_size),
      'Cache-Control': 'private, max-age=3600',
    },
  });
}

export async function remove(c: Context): Promise<Response> {
  const fileId = parseInt(c.req.param('fileId') ?? '', 10);
  if (isNaN(fileId)) return err(c, 'VALIDATION_ERROR', 'Invalid file ID');

  const db = c.env.DB;

  const existing = await getFile(db, fileId);
  if (!existing) return notFound(c, 'File');

  await deleteFile(db, fileId);

  return ok(c, { message: 'File deleted' });
}
