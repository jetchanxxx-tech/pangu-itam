import type { Context } from 'hono';
import { ok } from '../utils/response';

export async function stats(c: Context): Promise<Response> {
  const db = c.env.DB;

  const [assetRow, offlineRow, contractRow, activeContractRow] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM assets').first() as Promise<{ count: number } | null>,
    db.prepare("SELECT COUNT(*) as count FROM assets WHERE status IN ('Offline', 'Maintenance', 'Stopped')").first() as Promise<{ count: number } | null>,
    db.prepare('SELECT COUNT(*) as count FROM contracts').first() as Promise<{ count: number } | null>,
    db.prepare("SELECT COUNT(*) as count FROM contracts WHERE status = 'active'").first() as Promise<{ count: number } | null>,
  ]);

  const totalAssets = assetRow?.count ?? 0;
  const totalOffline = offlineRow?.count ?? 0;
  const totalContracts = contractRow?.count ?? 0;
  const activeContracts = activeContractRow?.count ?? 0;

  const sla = totalAssets > 0
    ? Math.round(((totalAssets - totalOffline) / totalAssets) * 1000) / 10
    : 100;

  return ok(c, {
    total_assets: totalAssets,
    total_contracts: totalContracts,
    active_contracts: activeContracts,
    ueba_score: 15,
    active_alerts: totalOffline,
    sla_compliance: sla,
    pending_audits: 5,
  });
}
