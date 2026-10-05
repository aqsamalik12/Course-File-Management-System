import { chromium } from './frontend/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('./frontend/test-results/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

(async () => {
  console.log('====================================================');
  console.log('CFMS — HOD COURSE FILES FOLDER HIERARCHY LIVE TEST');
  console.log('Opening real Google Chrome (visible headless: false)');
  console.log('====================================================');

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

  console.log('2. Logging in as HOD Dr. Asif...');
  await page.fill('#login-email', 'hod.cs.asif@ue.edu.pk');
  await page.fill('#login-password', 'passwordAsif123');
  await page.click('#btn-login-submit');

  await page.waitForSelector('text=HOD Course File Workspace', { timeout: 15000 });
  await page.waitForTimeout(1500);

  console.log('3. Opening Course Files module...');
  // Click on Course Files in sidebar
  await page.click('button:has-text("Course Files")');
  await page.waitForTimeout(1500);

  // LEVEL 1: Verify Batches
  console.log('4. Verifying LEVEL 1: Academic Batches...');
  await page.waitForSelector('text=Level 1 — Academic Batches', { timeout: 8000 });
  await page.waitForSelector('h3:has-text("BSCS 2023–26")', { timeout: 8000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_level1_academic_batches.png'), fullPage: true });

  // LEVEL 2: Click Batch BSCS 2023–26
  console.log('5. Clicking Batch BSCS 2023–26...');
  await page.click('h3:has-text("BSCS 2023–26")');
  await page.waitForTimeout(1200);

  // Verify Level 2 Sessions
  console.log('6. Verifying LEVEL 2: Sessions (Spring and Fall)...');
  await page.waitForSelector('text=Level 2 — Sessions', { timeout: 8000 });
  await page.waitForSelector('h3:has-text("Spring")', { timeout: 5000 });
  await page.waitForSelector('h3:has-text("Fall")', { timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_level2_batch_sessions.png'), fullPage: true });

  // LEVEL 3: Click Spring
  console.log('7. Clicking Spring session...');
  await page.click('h3:has-text("Spring")');
  await page.waitForTimeout(1200);

  // Verify Level 3 Spring Semesters
  console.log('8. Verifying LEVEL 3: Spring Semesters...');
  await page.waitForSelector('text=Level 3 — Semesters', { timeout: 8000 });
  await page.waitForSelector('text=Spring — BSCS 2023–26', { timeout: 5000 });
  await page.waitForSelector('h3:has-text("1st Semester")', { timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_level3_spring_semesters.png'), fullPage: true });

  // Navigate back to Batch via breadcrumb
  console.log('9. Navigating back to Batch via breadcrumb...');
  await page.click('button:has-text("BSCS 2023–26")');
  await page.waitForTimeout(1200);

  // LEVEL 3: Click Fall
  console.log('10. Clicking Fall session...');
  await page.click('h3:has-text("Fall")');
  await page.waitForTimeout(1200);

  // Verify Level 3 Fall Semesters
  console.log('11. Verifying LEVEL 3: Fall Semesters...');
  await page.waitForSelector('text=Level 3 — Semesters', { timeout: 8000 });
  await page.waitForSelector('text=Fall — BSCS 2023–26', { timeout: 5000 });
  await page.waitForSelector('h3:has-text("2nd Semester")', { timeout: 5000 });
  await page.waitForSelector('h3:has-text("7th Semester")', { timeout: 5000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_level3_fall_semesters.png'), fullPage: true });

  // Navigate back to Batch -> Spring -> 1st Semester
  console.log('12. Navigating to Spring -> 1st Semester...');
  await page.click('button:has-text("BSCS 2023–26")');
  await page.waitForTimeout(800);
  await page.click('h3:has-text("Spring")');
  await page.waitForTimeout(800);
  await page.click('h3:has-text("1st Semester")');
  await page.waitForTimeout(1500);

  // LEVEL 4: Course Files in 1st Semester
  console.log('13. Verifying LEVEL 4: Course Files in 1st Semester...');
  await page.waitForSelector('text=Level 4 — Course Files', { timeout: 8000 });
  await page.waitForSelector('text=Database Systems', { timeout: 8000 });
  await page.waitForSelector('text=Dr. Zeeshan Ali', { timeout: 8000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_level4_course_files.png'), fullPage: true });

  // Open Review modal for Database Systems
  console.log('14. Clicking View on Database Systems course file...');
  const viewBtn = page.locator('tbody tr button:has-text("View")').first();
  await viewBtn.waitFor({ state: 'visible', timeout: 8000 });
  await viewBtn.click();
  await page.waitForTimeout(1500);

  console.log('15. Verifying Course File Review Modal...');
  await page.waitForSelector('text=Course Dossier Review', { timeout: 8000 });
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_course_file_review_modal.png'), fullPage: true });

  // Close modal
  const closeBtn = page.locator('button:has(svg.lucide-x)').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
  } else {
    await page.keyboard.press('Escape');
  }
  await page.waitForTimeout(1000);

  // Test Back Navigation button (← Back to Spring)
  console.log('16. Testing Back button: ← Back to Spring...');
  await page.click('button:has-text("← Back to Spring")');
  await page.waitForTimeout(1000);
  await page.waitForSelector('text=Level 3 — Semesters', { timeout: 8000 });

  // Test Back Navigation button (← Back to BSCS 2023–26)
  console.log('17. Testing Back button: ← Back to BSCS 2023–26...');
  await page.click('button:has-text("← Back to BSCS 2023–26")');
  await page.waitForTimeout(1000);
  await page.waitForSelector('text=Level 2 — Sessions', { timeout: 8000 });

  // Test Back Navigation button (← Back to Course Files)
  console.log('18. Testing Back button: ← Back to Course Files...');
  await page.click('button:has-text("← Back to Course Files")');
  await page.waitForTimeout(1000);
  await page.waitForSelector('text=Level 1 — Academic Batches', { timeout: 8000 });

  console.log('19. All 4 levels verified with back navigation and real database data!');
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_back_to_batches_verified.png'), fullPage: true });

  console.log('\n====================================================');
  console.log('LIVE TEST PASSED COMPLETELY!');
  console.log('====================================================');
  console.log('Evidence Screenshots Saved to:');
  console.log('1. 01_level1_academic_batches.png');
  console.log('2. 02_level2_batch_sessions.png');
  console.log('3. 03_level3_spring_semesters.png');
  console.log('4. 04_level3_fall_semesters.png');
  console.log('5. 05_level4_course_files.png');
  console.log('6. 06_course_file_review_modal.png');
  console.log('7. 07_back_to_batches_verified.png');
  console.log('Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Errors:', consoleErrors);
  }

  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
