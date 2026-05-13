// Open Cloudflare API Token page so the user can add missing permissions
// The token needs: Workers Routes Edit, Account Settings Read

import { chromium } from 'playwright';

async function main() {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  console.log('[INFO] 打开 API Token 管理页面...');
  await page.goto('https://dash.cloudflare.com/profile/api-tokens', {
    waitUntil: 'domcontentloaded',
    timeout: 30000,
  });

  console.log('');
  console.log('请在浏览器中添加以下权限到 Token "ITAM-CLI"：');
  console.log('  1. 找到 ITAM-CLI Token，点击右侧 ⋮ → "编辑"');
  console.log('  2. 添加权限: 账户 | Workers Routes | 编辑');
  console.log('  3. 添加权限: 账户 | Account Settings | 读取');
  console.log('  4. 点击 "继续" → "更新令牌"');
  console.log('');
  console.log('完成后按 Enter 继续...');

  await new Promise(resolve => process.stdin.once('data', resolve));
  await browser.close();
  console.log('[INFO] Token 权限已更新，可以继续部署。');
}

main().catch(console.error);
