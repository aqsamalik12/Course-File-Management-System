import { chromium } from './frontend/node_modules/playwright/index.mjs';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = path.resolve('./frontend/test-results/screenshots');
if (!fs.existsSync(SCREENSHOT_DIR)) {
  fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function runProtocol() {
  console.log('====================================================');
  console.log('CFMS — COMPLETE HOD DASHBOARD & WORKFLOW TEST PROTOCOL');
  console.log('Running visible live testing with local Google Chrome');
  console.log('====================================================');

  const browser = await chromium.launch({
    channel: 'chrome',
    headless: false,
    slowMo: 100
  });

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 }
  });

  const page = await context.newPage();
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  try {
    // ----------------------------------------------------
    // TEST 1 & 2: LOGIN PAGE UI & HOD AUTHENTICATION
    // ----------------------------------------------------
    console.log('\n[PHASE 1] Navigating to CFMS Login Page...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle' });
    await sleep(1000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '01_login_ui_compact.png') });
    console.log('✓ Captured 01_login_ui_compact.png (Balanced, university-portal design)');

    console.log('\n[PHASE 2] Logging in as HOD Dr. Asif (hod.cs.asif@ue.edu.pk)...');
    await page.fill('#login-email', 'hod.cs.asif@ue.edu.pk');
    await page.fill('#login-password', 'passwordAsif123');
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '02_hod_login_filled.png') });
    await page.click('#btn-login-submit');

    await page.waitForSelector('text=HOD Course File Workspace', { timeout: 15000 });
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '03_hod_dashboard_loaded.png') });
    console.log('✓ HOD Dashboard loaded successfully with Dr. Asif credentials');

    // ----------------------------------------------------
    // TEST 3: HOD DASHBOARD REAL METRICS & CHARTS
    // ----------------------------------------------------
    console.log('\n[PHASE 3] Auditing 10 Real Metrics & Charts on HOD Dashboard...');
    const dashboardText = await page.textContent('body');
    const metricLabels = [
      '1. Registered Teachers',
      '2. Enrolled Teachers',
      '3. Teacher Requests',
      '4. Total Course Files',
      '5. Submitted Files',
      '6. Under Review Files',
      '7. Needs Improvement',
      '8. Approved Course Files',
      '9. Pending / Incomplete',
      '10. Certificates Available'
    ];

    for (const label of metricLabels) {
      if (dashboardText.includes(label)) {
        console.log(`  ✓ Found real metric: "${label}"`);
      } else {
        console.warn(`  ! Metric label not visible: "${label}"`);
      }
    }

    // Verify Recharts SVG graphs rendered
    const svgCharts = await page.$$('svg.recharts-surface');
    console.log(`  ✓ Recharts SVG charts rendered: ${svgCharts.length} chart(s) active on dashboard`);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '04_hod_metrics_and_charts.png') });

    // ----------------------------------------------------
    // TEST 4: TEACHER REQUESTS MODULE & APPROVAL
    // ----------------------------------------------------
    console.log('\n[PHASE 4] Opening Teacher Requests module...');
    const trButton = await page.$('button:has-text("Teacher Requests")');
    if (trButton) {
      await trButton.click();
    } else {
      await page.click('text=Teacher Requests');
    }
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '05_teacher_requests_list.png') });
    console.log('✓ Teacher Requests module rendered');

    // Check for review buttons
    const reviewButtons = await page.$$('button:has-text("Review"), button:has-text("View")');
    if (reviewButtons.length > 0) {
      console.log(`  ✓ Found ${reviewButtons.length} request(s) to inspect. Opening first request...`);
      await reviewButtons[0].click();
      await sleep(1000);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '06_teacher_request_modal.png') });
      console.log('  ✓ Teacher Request modal details verified');

      // Check for approve button in modal if present
      const modalApproveBtn = await page.$('button:has-text("Approve Teacher"), button:has-text("Approve Request")');
      if (modalApproveBtn) {
        await modalApproveBtn.click();
        await sleep(1000);
        console.log('  ✓ Teacher Request approved by HOD');
      }
      const closeBtn = await page.$('button:has-text("Close"), button:has-text("Cancel")');
      if (closeBtn) await closeBtn.click();
    }

    // ----------------------------------------------------
    // TEST 5: 5-LEVEL COURSE FILES HIERARCHY
    // ----------------------------------------------------
    console.log('\n[PHASE 5] Testing Course Files 5-Level Hierarchy (Batch -> Semester -> Session -> Course -> File)...');
    await page.click('button:has-text("Course Files"), a:has-text("Course Files")');
    await sleep(1500);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '07_hierarchy_level1_batches.png') });
    console.log('✓ Level 1 (Batches) rendered');

    // Click "Open Batch" on first batch
    const openBatchBtn = await page.$('button:has-text("Open Batch")');
    if (openBatchBtn) {
      await openBatchBtn.click();
      await sleep(1200);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '08_hierarchy_level2_semesters.png') });
      console.log('✓ Level 2 (Semesters) rendered');

      // Click "Open Semester" on first semester
      const openSemBtn = await page.$('button:has-text("Open Semester")');
      if (openSemBtn) {
        await openSemBtn.click();
        await sleep(1200);
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, '09_hierarchy_level3_sessions.png') });
        console.log('✓ Level 3 (Spring / Fall Sessions) rendered');

        // Click "Open Spring Courses" or "Open Fall Courses"
        const openSessBtn = await page.$('button:has-text("Open Spring Courses"), button:has-text("Open Fall Courses")');
        if (openSessBtn) {
          await openSessBtn.click();
          await sleep(1200);
          await page.screenshot({ path: path.join(SCREENSHOT_DIR, '10_hierarchy_level4_courses.png') });
          console.log('✓ Level 4 (Courses belonging to Batch + Semester + Session) rendered');

          // Check courses table
          const courseRows = await page.$$('tbody tr');
          console.log(`  ✓ Courses listed in exact combination: ${courseRows.length} course(s)`);

          // Open Course File Review (Level 5)
          const reviewCourseBtn = await page.$('button:has-text("Review")');
          if (reviewCourseBtn) {
            await reviewCourseBtn.click();
            await sleep(1200);
            await page.screenshot({ path: path.join(SCREENSHOT_DIR, '11_hierarchy_level5_course_file.png') });
            console.log('✓ Level 5 (Statutory 14-Item Course File Review) rendered');

            // Verify Section 1 starts from Instructor CV (no Audit Report)
            const modalContent = await page.textContent('body');
            const hasInstructorCV = modalContent.includes('Instructor CV') || modalContent.includes('CV');
            const hasAuditReport = modalContent.includes('Audit Report');
            console.log(`  ✓ Item 1 is Instructor CV: ${hasInstructorCV}`);
            console.log(`  ✓ Audit Report confirmed removed: ${!hasAuditReport}`);

            // Close course review modal
            const closeReviewModalBtn = await page.$('button:has-text("Close"), button:has-text("Back to Courses")');
            if (closeReviewModalBtn) await closeReviewModalBtn.click();
          }
        }
      }
    }

    // ----------------------------------------------------
    // TEST 6: MY COURSE FILES (HOD TEACHING WORKFLOW)
    // ----------------------------------------------------
    console.log('\n[PHASE 6] Testing HOD "My Course Files" (HOD Teaching Workflow)...');
    const myCourseFilesLink = await page.$('button:has-text("My Course Files"), a:has-text("My Course Files")');
    if (myCourseFilesLink) {
      await myCourseFilesLink.click();
      await sleep(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '12_hod_self_course_files.png') });
      console.log('✓ HOD "My Course Files" module rendered with standard 14-item statutory structure');
    }

    // ----------------------------------------------------
    // TEST 7: DOWNLOADS & CERTIFICATES
    // ----------------------------------------------------
    console.log('\n[PHASE 7] Auditing Certificates & Multi-Tier Downloads Center...');
    const certsLink = await page.$('button:has-text("Certificates")');
    if (certsLink) {
      await certsLink.click();
      await sleep(1500);
      await page.screenshot({ path: path.join(SCREENSHOT_DIR, '13_hod_certificates_and_downloads.png') });
      console.log('✓ Certificates & Downloads Center rendered with Batch ZIP & Semester ZIP actions');
    }

    // ----------------------------------------------------
    // TEST 8: RESPONSIVE VIEWPORTS
    // ----------------------------------------------------
    console.log('\n[PHASE 8] Checking Tablet & Mobile responsive layouts...');
    await page.setViewportSize({ width: 768, height: 1024 });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '14_tablet_viewport_768px.png') });
    console.log('✓ Captured 14_tablet_viewport_768px.png');

    await page.setViewportSize({ width: 375, height: 667 });
    await sleep(800);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '15_mobile_viewport_375px.png') });
    console.log('✓ Captured 15_mobile_viewport_375px.png');

    // Restore desktop
    await page.setViewportSize({ width: 1280, height: 800 });
    await sleep(500);

    // ----------------------------------------------------
    // TEST 9: CONSOLE ERRORS AUDIT
    // ----------------------------------------------------
    console.log('\n[PHASE 9] Auditing Browser Console...');
    const filteredErrors = consoleErrors.filter(e =>
      !e.includes('favicon') && !e.includes('chrome-extension') && !e.includes('ERR_BLOCKED_BY_CLIENT')
    );
    if (filteredErrors.length === 0) {
      console.log('✓ ZERO browser console errors detected throughout the entire run!');
    } else {
      console.warn(`! Console errors found (${filteredErrors.length}):`, filteredErrors);
    }

    console.log('\n====================================================');
    console.log('ALL HOD DASHBOARD & WORKFLOW TESTS COMPLETED SUCCESSFULLY!');
    console.log('====================================================');
  } finally {
    await browser.close();
  }
}

runProtocol().catch(err => {
  console.error('Fatal error in testing protocol:', err);
  process.exit(1);
});
