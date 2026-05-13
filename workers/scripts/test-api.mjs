// Quick API test script
const BASE = 'https://itam-api.jet-s.workers.dev';

async function test() {
  // Login
  const loginRes = await fetch(`${BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'admin123' }),
  });
  const loginData = await loginRes.json();
  console.log('Login:', loginData.ok ? 'OK' : 'FAIL');
  const token = loginData.data.token;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
  };

  // Dashboard
  const dashRes = await fetch(`${BASE}/api/v1/dashboard/stats`, { headers });
  const dashData = await dashRes.json();
  console.log('Dashboard:', dashData.ok ? 'OK' : 'FAIL', JSON.stringify(dashData.data));

  // Create asset
  const assetRes = await fetch(`${BASE}/api/v1/assets`, {
    method: 'POST', headers,
    body: JSON.stringify({ name: 'Test-Server-01', type: 'Server', platform: 'AWS', ip: '10.0.0.1', status: 'Online', owner: 'admin' }),
  });
  const assetData = await assetRes.json();
  console.log('Create Asset:', assetData.ok ? 'OK' : 'FAIL', `id=${assetData.data?.id}`);

  // List assets
  const listRes = await fetch(`${BASE}/api/v1/assets?page=1&limit=10`, { headers });
  const listData = await listRes.json();
  console.log('List Assets:', listData.ok ? 'OK' : 'FAIL', `total=${listData.pagination?.total}`);

  // Create contract
  const contractRes = await fetch(`${BASE}/api/v1/contracts`, {
    method: 'POST', headers,
    body: JSON.stringify({ name: 'AWS Support', code: 'CT-001', type: 'maintenance', vendor: 'AWS', amount: 120000, start_date: '2025-01-01', end_date: '2025-12-31' }),
  });
  const contractData = await contractRes.json();
  console.log('Create Contract:', contractData.ok ? 'OK' : 'FAIL');

  // Create interface
  const ifaceRes = await fetch(`${BASE}/api/v1/interfaces`, {
    method: 'POST', headers,
    body: JSON.stringify({ name: 'User API', method: 'GET', url: 'https://api.example.com/users', status: 'Active' }),
  });
  const ifaceData = await ifaceRes.json();
  console.log('Create Interface:', ifaceData.ok ? 'OK' : 'FAIL');

  // Ping
  const pingRes = await fetch(`${BASE}/api/v1/ping`, { headers });
  const pingData = await pingRes.json();
  console.log('Ping:', pingData.ok ? 'OK' : 'FAIL');

  console.log('\n=== All tests complete ===');
  console.log(`API URL: ${BASE}`);
  console.log(`Login: admin / admin123`);
}

test().catch(console.error);
