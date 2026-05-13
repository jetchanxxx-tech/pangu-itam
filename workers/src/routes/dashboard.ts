import type { Context } from 'hono';
import { ok } from '../utils/response';

export async function stats(c: Context): Promise<Response> {
  const db = c.env.DB;

  const [assetRow, offlineRow, onlineRow, contractRow, activeContractRow, expiringRow] = await Promise.all([
    db.prepare('SELECT COUNT(*) as count FROM assets WHERE archived = 0').first() as Promise<{ count: number } | null>,
    db.prepare("SELECT COUNT(*) as count FROM assets WHERE archived = 0 AND status IN ('Offline', 'Maintenance')").first() as Promise<{ count: number } | null>,
    db.prepare("SELECT COUNT(*) as count FROM assets WHERE archived = 0 AND status = 'Online'").first() as Promise<{ count: number } | null>,
    db.prepare('SELECT COUNT(*) as count FROM contracts').first() as Promise<{ count: number } | null>,
    db.prepare("SELECT COUNT(*) as count FROM contracts WHERE status = 'active'").first() as Promise<{ count: number } | null>,
    db.prepare("SELECT COUNT(*) as count FROM contracts WHERE status = 'active' AND end_date <= date('now', '+30 days')").first() as Promise<{ count: number } | null>,
  ]);

  const totalAssets = assetRow?.count ?? 0;
  const onlineAssets = onlineRow?.count ?? 0;
  const offlineAssets = offlineRow?.count ?? 0;
  const totalContracts = contractRow?.count ?? 0;
  const activeContracts = activeContractRow?.count ?? 0;
  const expiringContracts = expiringRow?.count ?? 0;

  const sla = totalAssets > 0
    ? Math.round((onlineAssets / totalAssets) * 10000) / 100
    : 100;

  return ok(c, {
    total_assets: totalAssets,
    online_assets: onlineAssets,
    offline_assets: offlineAssets,
    total_contracts: totalContracts,
    active_contracts: activeContracts,
    expiring_contracts: expiringContracts,
    sla_compliance: sla,
  });
}
