import { chromium } from './frontend/node_modules/playwright/index.mjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.join(__dirname, 'frontend', 'test-results', 'screenshots');

async function testLiveChrome() {
  console.log('--- STARTING LIVE GOOGLE CHROME DIAGNOSTIC TEST ---');
  console.log('Launching visible Google Chrome...');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    slowMo: 150
  });

  const context = await browser.newContext({
    viewport: { width: 1366, height: 768 }
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:5173...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });

  // 1. Show login page & screenshot
  await page.waitForSelector('#login-email', { timeout: 10000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'diagnostic_01_login_page.png') });
  console.log('✓ Login page opened & screenshot captured.');

  // 2. Click / fill visible UI element (#login-email)
  console.log('Interacting with visible UI element: filling #login-email...');
  await page.click('#login-email');
  await page.fill('#login-email', 'admin@ue.edu.pk');
  await page.fill('#login-password', 'admin123');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'diagnostic_02_login_filled.png') });
  console.log('✓ Clicked & filled email and password.');

  // 3. Click submit button
  console.log('Clicking visible Sign In button (#btn-login-submit)...');
  await page.click('#btn-login-submit');

  // 4. Wait for dashboard and capture result
  await page.waitForSelector('text=Welcome Back, Administrator', { timeout: 15000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'diagnostic_03_dashboard_loaded.png') });
  console.log('✓ Successfully authenticated and loaded Admin Dashboard.');

  const heading = await page.locator('h1, h2').first().textContent();
  console.log(`Page Heading Detected: "${heading}"`);

  await browser.close();
  console.log('--- LIVE CHROME DIAGNOSTIC TEST COMPLETED SUCCESSFULLY ---');
}

testLiveChrome().catch(err => {
  console.error('Diagnostic Chrome Test Failed:', err);
  process.exit(1);
});
