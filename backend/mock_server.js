const http = require('http');
const url = require('url');

const PORT = 8080;

// Mock Data
const dashboardStats = {
  total_assets: 142,
  ueba_score: 15,
  active_alerts: 4,
  sla_compliance: 97.8,
  pending_audits: 6,
};

let assets = [
  {
    ID: 1,
    name: 'Prod-DB-01',
    type: 'Server',
    platform: 'AWS EC2',
    ip: '192.168.1.10',
    status: 'Online',
    owner: 'DBA Team',
    description: 'Primary Database',
    specs: '8vCPU/32GB',
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString(),
  },
  {
    ID: 2,
    name: 'Web-Cluster-A',
    type: 'VM',
    platform: 'VMware',
    ip: '10.0.20.5',
    status: 'Online',
    owner: 'DevOps',
    description: 'Frontend Nginx',
    specs: '4vCPU/8GB',
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString(),
  },
  {
    ID: 3,
    name: 'K8s-Worker-05',
    type: 'Container',
    platform: 'BareMetal',
    ip: '172.16.0.55',
    status: 'Maintenance',
    owner: 'Platform Team',
    description: 'K8s Node',
    specs: '16vCPU/64GB',
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString(),
  },
  {
    ID: 4,
    name: 'Jira-License-2024',
    type: 'Software',
    platform: 'SaaS',
    ip: 'jira.corp.com',
    status: 'Online',
    owner: 'IT Admin',
    description: 'Project Management',
    specs: 'N/A',
    CreatedAt: new Date().toISOString(),
    UpdatedAt: new Date().toISOString(),
  }
];

const server = http.createServer((req, res) => {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url, true);
  const path = parsedUrl.pathname;

  // API Routes
  if (path === '/api/v1/dashboard/stats' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    // Update total assets count dynamically
    dashboardStats.total_assets = assets.length;
    res.end(JSON.stringify(dashboardStats));
  } 
  else if (path === '/api/v1/assets' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(assets));
  } 
  else if (path === '/api/v1/assets' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        const newAsset = JSON.parse(body);
        newAsset.ID = assets.length + 1;
        newAsset.CreatedAt = new Date().toISOString();
        newAsset.UpdatedAt = new Date().toISOString();
        // Default status if missing
        if (!newAsset.status) newAsset.status = 'Online';
        
        assets.push(newAsset);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(newAsset));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } 
  else if (path === '/api/v1/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ message: 'pong' }));
  }
  else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not Found' }));
  }
});

server.listen(PORT, () => {
  console.log(`Mock Server running on http://localhost:${PORT}`);
  console.log('Serving /api/v1/assets and /api/v1/dashboard/stats');
});
