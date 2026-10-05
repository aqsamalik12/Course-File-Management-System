import { chromium } from './frontend/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('./frontend/test-results/screenshots_admin');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

(async () => {
  console.log('================================================================');
  console.log('CFMS — ADMIN & TEACHER REGISTRATION LIVE E2E TEST (CHROME)');
  console.log('================================================================');

  const browser = await chromium.launch({
    headless: false,
    channel: 'chrome',
    args: ['--start-maximized', '--window-size=1280,850'],
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 850 }
  });
  const page = await context.newPage();

  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  console.log('1. Navigating to CFMS login page...');
  await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  console.log('2. Logging in as Administrator...');
  await page.fill('#login-email', 'admin@ue.edu.pk');
  await page.fill('#login-password', 'admin123');
  await page.click('#btn-login-submit');

  await page.waitForSelector('text=Welcome Back, Administrator', { timeout: 15000 });
  console.log('✓ Admin Dashboard loaded successfully!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_admin_dashboard.png'), fullPage: true });

  // Campus Management
  console.log('3. Testing Campus Management module...');
  await page.click('button:has-text("Campus Management")');
  await page.waitForSelector('text=All Campus', { timeout: 10000 });
  await page.waitForTimeout(1000);
  console.log('✓ Campus Management loaded!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_admin_campus_management.png'), fullPage: true });

  // Department Management
  console.log('4. Testing Department Management module...');
  await page.click('button:has-text("Department Management")');
  await page.waitForSelector('text=All Department', { timeout: 10000 });
  await page.waitForTimeout(1000);
  console.log('✓ Department Management loaded!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_admin_department_management.png'), fullPage: true });

  // HOD Management
  console.log('5. Testing HOD Management module...');
  await page.click('button:has-text("HOD Management")');
  await page.waitForSelector('h1:has-text("HOD Management")', { timeout: 10000 });
  await page.waitForTimeout(1000);
  console.log('✓ HOD Management loaded!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_admin_hod_management.png'), fullPage: true });

  // Teacher Registration (Campus-Wise Hierarchy)
  console.log('6. Testing Teacher Registration Module (Campus Hierarchy)...');
  await page.locator('nav span:text-is("Teacher Registration")').click();
  await page.waitForSelector('h1:has-text("Teacher Registration")', { timeout: 10000 });
  await page.waitForSelector('text=Campus Hierarchy', { timeout: 10000 });
  await page.waitForSelector('text=University Campuses', { timeout: 10000 });
  await page.waitForTimeout(1000);
  console.log('✓ Teacher Registration Level 1 (Campuses) loaded!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_teacher_reg_level1_campuses.png'), fullPage: true });

  // Click on Attock Campus
  console.log('7. Drilling down into "Attock Campus"...');
  await page.click('h4:has-text("Attock Campus")');
  await page.waitForSelector('text=Academic Departments — Attock Campus', { timeout: 8000 });
  await page.waitForTimeout(1000);
  console.log('✓ Teacher Registration Level 2 (Departments in Attock Campus) loaded!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_teacher_reg_level2_departments.png'), fullPage: true });

  // Click on Computer Science
  console.log('8. Drilling down into "Computer Science" Department...');
  await page.click('h4:has-text("Computer Science")');
  await page.waitForSelector('text=Total Allocated Credits', { timeout: 8000 });
  await page.waitForTimeout(1000);
  console.log('✓ Teacher Registration Level 3 (Faculty in Computer Science) loaded!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_teacher_reg_level3_teachers.png'), fullPage: true });

  // Open Full Registration Dossier for first teacher
  console.log('9. Opening Full Registration Dossier...');
  const dossierBtn = page.locator('button:has-text("Full Registration Dossier")').first();
  await dossierBtn.waitFor({ state: 'visible', timeout: 8000 });
  await dossierBtn.click();
  await page.waitForTimeout(1500);

  await page.waitForSelector('text=Academic & Personal Information', { timeout: 8000 });
  await page.waitForSelector('text=Approved Teaching Allotments', { timeout: 8000 });
  await page.waitForSelector('text=Course File Submissions & Quality Review Status', { timeout: 8000 });
  await page.waitForSelector('text=Certificate Status', { timeout: 8000 });
  console.log('✓ Complete Teacher Registration Dossier with all required sections verified!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_teacher_reg_level4_dossier.png'), fullPage: true });

  // Close Dossier
  console.log('10. Closing Dossier modal...');
  await page.click('button:has-text("Close Dossier")');
  await page.waitForTimeout(1000);

  // Test Back Navigation buttons
  console.log('11. Testing Back to Departments navigation...');
  await page.click('button:has-text("Back to Departments")');
  await page.waitForTimeout(1000);
  await page.waitForSelector('text=Academic Departments — Attock Campus', { timeout: 8000 });

  console.log('12. Testing Back to Campuses navigation...');
  await page.click('button:has-text("Back to Campuses")');
  await page.waitForTimeout(1000);
  await page.waitForSelector('text=University Campuses', { timeout: 8000 });

  // Test Switching to All Registered Teachers tab
  console.log('13. Testing "All Registered Teachers" table tab...');
  await page.click('button:has-text("All Registered Teachers")');
  await page.waitForTimeout(1000);
  await page.waitForSelector('th:has-text("Faculty Member")', { timeout: 8000 });
  await page.waitForSelector('th:has-text("Teaching Workload")', { timeout: 8000 });
  console.log('✓ Table view verified!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_all_teachers_table.png'), fullPage: true });

  // Test Switching to Registration Records tab
  console.log('14. Testing "Registration Records" compliance table tab...');
  await page.click('button:has-text("Registration Records")');
  await page.waitForTimeout(1000);
  await page.waitForSelector('th:has-text("Ref / Faculty Name")', { timeout: 8000 });
  console.log('✓ Compliance Records view verified!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_registration_records_table.png'), fullPage: true });

  console.log('\n================================================================');
  console.log('LIVE ADMIN + TEACHER REGISTRATION TEST PASSED 100%!');
  console.log('================================================================');
  console.log('Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console Error Logs:', consoleErrors);
  }

  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
