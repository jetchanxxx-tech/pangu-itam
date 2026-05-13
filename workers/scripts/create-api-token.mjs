// Playwright script: Create a Cloudflare API Token via browser automation
// Usage: node scripts/create-api-token.mjs
// This opens a browser to https://dash.cloudflare.com/profile/api-tokens
// It saves the browser state so you only need to login once.

import { chromium } from 'playwright';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { homedir } from 'os';

const AUTH_FILE = resolve(homedir(), '.claude', 'cf-auth.json');
const TIMEOUT = 120_000;

async function main() {
  // Ensure auth directory exists
  const dir = resolve(homedir(), '.claude');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

  const contextOpts = {};
  if (existsSync(AUTH_FILE)) {
    console.log('[INFO] 发现已保存的 Cloudflare 登录状态，尝试复用...');
    contextOpts.storageState = AUTH_FILE;
  }

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext(contextOpts);
  const page = await context.newPage();

  // Go to API Tokens page
  console.log('[INFO] 正在打开 Cloudflare API Tokens 页面...');
  await page.goto('https://dash.cloudflare.com/profile/api-tokens', {
    waitUntil: 'domcontentloaded',
    timeout: TIMEOUT,
  });

  // Wait for the page to load — either logged in (shows token list) or login form
  try {
    await page.waitForSelector(
      'button:has-text("创建令牌"), button:has-text("Create Token"), h1:has-text("API 令牌"), h1:has-text("API Tokens"), .api-tokens-list, [data-testid="api-tokens-list"]',
      { timeout: 15000 }
    );
    console.log('[OK] 已登录 Cloudflare，开始创建 API Token...');
  } catch {
    console.log('[WAIT] 请在浏览器中登录 Cloudflare（2 分钟内）...');
    // Wait for user to login
    await page.waitForURL('**/profile/api-tokens**', { timeout: TIMEOUT });
    console.log('[OK] 登录成功！');
  }

  // Click "Create Token" button
  try {
    await page.click('button:has-text("创建令牌")');
  } catch {
    await page.click('button:has-text("Create Token")');
  }
  await page.waitForTimeout(2000);

  // Choose "自定义令牌" or "Create Custom Token"
  try {
    await page.click('text=自定义令牌');
  } catch {
    try {
      await page.click('text=Create Custom Token');
    } catch {
      // Fallback: click the first "开始使用" or "Get Started" button
      const btns = await page.$$('button, a');
      for (const btn of btns) {
        const text = await btn.textContent();
        if (text && (text.includes('自定义') || text.includes('Custom') || text.includes('开始'))) {
          await btn.click();
          break;
        }
      }
    }
  }
  await page.waitForTimeout(2000);

  // Fill in token form
  // 1. Token name
  const nameInput = page.locator('input[placeholder*="名称"], input[placeholder*="Name"], input[name="name"]').first();
  await nameInput.fill('ITAM-CLI-Token');
  await page.waitForTimeout(500);

  // 2. Set permissions: D1 + Workers
  // We need to interact with the permission row selectors
  // The Cloudflare dashboard uses a dynamic form with dropdown selects

  // First row: Account - D1 - Edit
  try {
    // Try to find and set the first permission row
    const permissionRows = page.locator('[data-testid="permission-row"], .permission-row, [class*="Permission"], [class*="permission"]');
    const rowCount = await permissionRows.count();

    if (rowCount > 0) {
      // First row exists, configure it
      // Set first dropdown (Scope) to "Account" if not already
      // Set second dropdown (Resource) to "D1"
      // Set third dropdown (Permission) to "Edit"

      // Click all dropdowns/selects
      const selects = page.locator('select, [role="combobox"], [class*="select"]');
      // For complex Cloudflare UI, let's use a simpler approach:
      // Use keyboard navigation to fill the form

      console.log('[INFO] 正在配置权限...请稍候');

      // Strategy: Use radio/checkbox if available for "所有账户" (All accounts)
      const allAccountRadio = page.locator('text=所有账户, text=All accounts, [value="all"]');
      if (await allAccountRadio.count() > 0) {
        await allAccountRadio.first().click();
      }
    }
  } catch (e) {
    console.log('[WARN] 自动配置权限时出现问题，请手动完成:', e.message);
  }

  console.log('[INFO] 请在浏览器中完成以下操作：');
  console.log('  1. Token 名称: ITAM-CLI-Token');
  console.log('  2. 权限: 账户 | D1 | 编辑');
  console.log('  3. 权限: 账户 | Workers Scripts | 编辑');
  console.log('  4. 权限: 账户 | Workers KV Storage | 编辑');
  console.log('  5. 点击"继续"然后"创建令牌"');
  console.log('');
  console.log('[WAIT] 等待 Token 创建完成（3 分钟内）...');

  // Wait for the token value to appear (it's shown once after creation)
  try {
    // The token value is usually shown in a code block or input with copy button
    await page.waitForSelector('text=复制, text=Copy, [data-clipboard]', { timeout: TIMEOUT });
    await page.waitForTimeout(1000);

    // Try to extract the token value
    const tokenElement = page.locator('code, pre, input[readonly], [class*="token-value"], [class*="TokenValue"]').first();
    const token = await tokenElement.textContent();

    if (token && token.length > 20) {
      console.log(`\n[SUCCESS] API Token: ${token.trim()}`);
      console.log('\n将此 Token 保存为环境变量:');
      console.log('  set CLOUDFLARE_API_TOKEN=' + token.trim());
    } else {
      // Try alternative: look for an input with the token
      const allInputs = page.locator('input');
      const inputCount = await allInputs.count();
      for (let i = 0; i < inputCount; i++) {
        const val = await allInputs.nth(i).inputValue();
        if (val && val.length > 20) {
          console.log(`\n[SUCCESS] API Token: ${val}`);
          console.log('\n将此 Token 保存为环境变量:');
          console.log('  set CLOUDFLARE_API_TOKEN=' + val);
          break;
        }
      }
    }
  } catch (e) {
    console.log('[INFO] 请手动复制 API Token');
  }

  // Save auth state
  await context.storageState({ path: AUTH_FILE });
  console.log(`\n[INFO] 登录状态已保存到 ${AUTH_FILE}`);

  console.log('\n按 Enter 关闭浏览器...');
  await new Promise(resolve => process.stdin.once('data', resolve));
  await browser.close();
}

main().catch(err => {
  console.error('[FATAL]', err.message);
  process.exit(1);
});
