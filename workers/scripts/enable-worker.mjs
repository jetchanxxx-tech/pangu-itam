// Playwright script: Enable workers.dev for the itam-api Worker
// The user already has Cloudflare open in their browser

import { chromium } from 'playwright';

const WORKER_NAME = 'itam-api';
const WORKER_URL = `https://dash.cloudflare.com/93e35d7819929da5d9a3ccfac38ed6e9/workers-and-pages/${WORKER_NAME}`;

async function main() {
  console.log('[INFO] 正在打开 Cloudflare Workers 管理页面...');
  console.log(`[INFO] URL: ${WORKER_URL}`);

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Navigate to the Worker's page
  await page.goto(WORKER_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

  console.log('[WAIT] 请在浏览器中完成以下操作：');
  console.log('  1. 如果未登录，请先登录 Cloudflare');
  console.log('  2. 找到 "Settings" 或 "Triggers" 标签页');
  console.log('  3. 确保 workers.dev 路由已启用');
  console.log('  4. 如果看到 "Enable workers.dev" 按钮，点击启用');
  console.log('');
  console.log('[INFO] 完成后按 Enter 关闭浏览器...');

  // Keep browser open for manual interaction
  await new Promise(resolve => process.stdin.once('data', resolve));
  await browser.close();
  console.log('[INFO] 浏览器已关闭。现在测试部署...');
}

main().catch(console.error);
