import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors';
import { authMiddleware } from './middleware/auth';
import { errorHandler } from './middleware/error-handler';
import * as auth from './routes/auth';
import * as assets from './routes/assets';
import * as contracts from './routes/contracts';
import * as contractFiles from './routes/contract-files';
import * as interfaces from './routes/interfaces';
import * as dashboard from './routes/dashboard';
import * as wiki from './routes/wiki';
import { handleTerminalWs } from './routes/terminal';

export type Env = {
  DB: D1Database;
  JWT_SECRET: string;
  NOTIFICATION_ENABLE?: string;
  FEISHU_WEBHOOK?: string;
  FEISHU_SECRET?: string;
  TERMINAL_GATEWAY_URL?: string;
};

const app = new Hono<{ Bindings: Env }>();

// Global middleware
app.use('*', corsMiddleware);
app.onError(errorHandler);

// Health check
app.get('/health', (c) =>
  c.json({ ok: true, data: { status: 'ok', timestamp: new Date().toISOString() } })
);

// Public auth routes
app.post('/api/v1/auth/login', auth.login);
app.post('/api/v1/auth/logout', auth.logout);

// Protected routes
const api = new Hono<{ Bindings: Env }>();
api.use('*', authMiddleware);

api.get('/user/me', auth.me);
api.post('/user/change-password', auth.changePassword);

api.get('/dashboard/stats', dashboard.stats);

api.get('/assets', assets.list);
api.post('/assets', assets.create);
api.put('/assets/:id', assets.update);
api.delete('/assets/:id', assets.remove);
api.post('/assets/:id/archive', assets.archive);
api.post('/assets/:id/unarchive', assets.unarchive);
api.post('/assets/import', assets.importCsv);

api.get('/contracts', contracts.list);
api.get('/contracts/:id', contracts.get);
api.post('/contracts', contracts.create);
api.put('/contracts/:id', contracts.update);
api.delete('/contracts/:id', contracts.remove);

api.get('/contracts/:id/files', contractFiles.list);
api.post('/contracts/:id/files', contractFiles.upload);
api.get('/contract-files/:fileId/download', contractFiles.download);
api.delete('/contract-files/:fileId', contractFiles.remove);

api.get('/interfaces', interfaces.list);
api.get('/interfaces/:id', interfaces.get);
api.post('/interfaces', interfaces.create);
api.put('/interfaces/:id', interfaces.update);
api.delete('/interfaces/:id', interfaces.remove);

api.get('/wiki', wiki.list);
api.get('/wiki/categories', wiki.categories);
api.get('/wiki/:id', wiki.get);
api.post('/wiki', wiki.create);
api.put('/wiki/:id', wiki.update);
api.delete('/wiki/:id', wiki.remove);

api.get('/ping', (c) =>
  c.json({ ok: true, data: { message: 'pong' } })
);

app.get('/api/v1/terminal/ws', (c) => handleTerminalWs(c.req.raw, c.env));
app.route('/api/v1', api);

export default app;
