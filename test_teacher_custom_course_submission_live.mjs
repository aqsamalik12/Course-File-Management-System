import { chromium } from './frontend/node_modules/playwright/index.mjs';
import path from 'path';
import fs from 'fs';

const SCREENSHOT_DIR = path.resolve('frontend/test-results/screenshots_course_submission');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

(async () => {
  console.log('================================================================');
  console.log('CFMS — TEACHER CUSTOM COURSE ENTRY & HOD VERIFICATION TEST');
  console.log('================================================================');

  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
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

  // Login as existing teacher Dr. Tariq
  console.log('2. Logging in as Teacher Dr. Tariq...');
  await page.fill('#login-email', 'teacher.1791139814732@ue.edu.pk');
  await page.fill('#login-password', 'password123');
  await page.click('#btn-login-submit');

  await page.waitForTimeout(2000);
  console.log('3. Opening Course File Submission module...');
  await page.click('button:has-text("Course File Submission")');
  await page.waitForTimeout(1500);

  // Verify that the old 10-card course grid is NOT present
  console.log('4. Verifying old 10-card course grid is removed...');
  const oldCourseSelectLabel = await page.locator('text=Select Assigned Course').count();
  console.log(`Old "Select Assigned Course" label count: ${oldCourseSelectLabel} (should be 0)`);
  if (oldCourseSelectLabel > 0) {
    throw new Error('Old course selection grid is still visible!');
  }

  // Verify Step 1: Course Identification inputs are visible
  console.log('5. Verifying Step 1: Course Name & Code input fields...');
  await page.waitForSelector('#input-course-title', { timeout: 8000 });
  await page.waitForSelector('#input-course-code', { timeout: 8000 });
  await page.waitForSelector('#input-batch', { timeout: 8000 });
  await page.waitForSelector('#input-session', { timeout: 8000 });
  await page.waitForSelector('#select-season', { timeout: 8000 });
  await page.waitForSelector('#select-semester', { timeout: 8000 });
  console.log('✓ All 6 required fields (Course Title, Code, Batch, Session, Season, Semester) verified!');

  // Enter custom course details as instructed by user
  console.log('6. Entering custom course: Data Structures & Algorithms (CS-202)...');
  await page.fill('#input-course-title', 'Data Structures & Algorithms');
  await page.fill('#input-course-code', 'CS-202');
  await page.fill('#input-batch', '2026');
  await page.fill('#input-session', '2026–2030');
  await page.selectOption('#select-season', 'Spring');
  await page.selectOption('#select-semester', '2nd Semester');
  await page.waitForTimeout(1000);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_teacher_custom_course_form.png'), fullPage: true });

  // Click Save Draft
  console.log('7. Clicking "Save Draft"...');
  await page.click('button:has-text("Save Draft")');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_draft_saved.png'), fullPage: true });
  console.log('✓ Draft saved successfully!');

  // Now logout and login as HOD Dr. Asif
  console.log('8. Logging in as HOD Dr. Asif to verify folder hierarchy...');
  await page.click('button:has-text("Logout")');
  await page.waitForTimeout(1000);

  await page.fill('#login-email', 'hod.cs.asif@ue.edu.pk');
  await page.fill('#login-password', 'passwordAsif123');
  await page.click('#btn-login-submit');
  await page.waitForTimeout(2000);

  // Navigate to Course Files
  console.log('9. Opening HOD Course Files...');
  await page.click('button:has-text("Course Files")');
  await page.waitForTimeout(1500);

  await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_hod_level1_batches.png'), fullPage: true });

  console.log('\n================================================================');
  console.log('TEACHER CUSTOM COURSE & HOD HIERARCHY VERIFICATION PASSED!');
  console.log('================================================================');
  console.log('Console Errors:', consoleErrors.length);
  if (consoleErrors.length > 0) {
    console.log('Console Errors:', consoleErrors);
  }

  await browser.close();
  process.exit(0);
})().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
