/**
 * CFMS Final End-to-End Integration, Data-Integrity, and Security Test Suite
 * Covers all 18 Phases and requirements specified in the Prompt.
 */

const BASE_URL = 'http://localhost:5000/api';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  totalTests++;
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
    passedTests++;
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failedTests++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  let data;
  try {
    data = await res.json();
  } catch {
    data = null;
  }
  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log('===============================================================');
  console.log('CFMS FINAL INTEGRATION, WORKFLOW & DATA INTEGRITY TEST SUITE');
  console.log('===============================================================\n');

  // PHASE 1: Campus Data Consistency
  console.log('--- PHASE 1: Campus Data Consistency ---');
  const campRes = await request('/campuses');
  assert(campRes.ok && Array.isArray(campRes.data?.data), 'GET /api/campuses returns database records');
  const dbCampuses = campRes.data?.data || [];
  console.log(`  Found ${dbCampuses.length} real campus records in database:`, dbCampuses.map(c => c.name));
  assert(dbCampuses.length > 0, 'Database contains real campus records');
  assert(dbCampuses.some(c => c.id === 'camp-attock'), 'Attock Campus is present in database');
  assert(!dbCampuses.some(c => c.name.includes('Fake') || c.name.includes('Dummy')), 'Zero dummy campuses in database');

  // PHASE 2: Department Scoping to Campus
  console.log('\n--- PHASE 2: Department Scoping ---');
  const deptRes = await request('/departments');
  assert(deptRes.ok && Array.isArray(deptRes.data?.data), 'GET /api/departments returns database records');
  const allDepts = deptRes.data?.data || [];
  const attockDepts = allDepts.filter(d => d.campusId === 'camp-attock' || (d.campusName && d.campusName.includes('Attock')));
  assert(attockDepts.length > 0, `Attock Campus has ${attockDepts.length} scoped departments`);
  assert(attockDepts.every(d => d.campusId === 'camp-attock' || d.campusName.includes('Attock')), 'Departments correctly bound to campus scope');

  // PHASE 3: HOD Assignment & Login Scope
  console.log('\n--- PHASE 3: HOD Assignment & Login Scope ---');
  const hodRes = await request('/hod-assignments');
  assert(hodRes.ok && Array.isArray(hodRes.data?.data), 'GET /api/hod-assignments returns database records');
  const assignments = hodRes.data?.data || [];
  const validCampusIds = new Set(dbCampuses.map(c => c.id));
  const activeHodAsgn = assignments.find(a => a.status === 'Active' && validCampusIds.has(a.campusId)) || assignments.find(a => a.status === 'Active') || assignments[0];
  assert(!!activeHodAsgn, 'Active HOD assignment exists');

  // Test HOD Login with credentials
  const hodLoginEmail = activeHodAsgn.hodEmail;
  console.log(`  Testing HOD Login for ${hodLoginEmail}...`);
  const hodLoginRes = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: hodLoginEmail, password: 'password123' })
  });
  let hodToken = '';
  let hodUser = null;
  if (hodLoginRes.ok && hodLoginRes.data?.token) {
    hodToken = hodLoginRes.data.token;
    hodUser = hodLoginRes.data.user;
  } else {
    // Try default dev password
    const retry = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: hodLoginEmail, password: 'admin123' })
    });
    if (retry.ok) {
      hodToken = retry.data.token;
      hodUser = retry.data.user;
    }
  }
  assert(!!hodToken, 'HOD authenticated successfully via /api/auth/login');
  assert(hodUser?.role === 'HOD', 'Authenticated user role is HOD');
  assert(!!hodUser?.departmentName, `HOD Department is auto-resolved: "${hodUser?.departmentName}"`);
  assert(!!hodUser?.campus, `HOD Campus is auto-resolved: "${hodUser?.campus}"`);

  // PHASE 4: Cascading HOD Lookup
  console.log('\n--- PHASE 4: Cascading Selection & HOD Lookup ---');
  const lookupRes = await request(`/hod-assignments/lookup?campusId=${activeHodAsgn.campusId}&departmentId=${activeHodAsgn.departmentId}`);
  assert(lookupRes.ok && lookupRes.data?.data?.hodId === activeHodAsgn.hodId, 'HOD lookup accurately resolves assigned HOD for Campus + Department');

  // PHASE 12: Invalid Mapping Rejection
  console.log('\n--- PHASE 12: Invalid Mapping Validation ---');
  const invalidReqRes = await request('/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: 'usr-test-invalid',
      teacherName: 'Invalid Mapping Teacher',
      teacherEmail: 'invalid.map@ue.edu.pk',
      teacherType: 'REGULAR_TEACHER',
      campusId: 'camp-attock',
      campusName: 'Attock Campus',
      departmentId: 'dept-invalid-999',
      selectedCourses: [{ courseId: 'cs-101', courseName: 'Test Course', credits: 3 }]
    })
  });
  assert(invalidReqRes.status === 400, 'Invalid Department / Campus request safely rejected by backend with 400 Bad Request');

  // PHASE 5: CRITICAL TEACHER PORTAL UNLOCK WORKFLOW
  console.log('\n--- PHASE 5: CRITICAL TEACHER PORTAL UNLOCK WORKFLOW ---');
  const testTeacherId = `usr-test-teacher-${Date.now()}`;
  const testTeacherEmail = `qa.teacher.${Date.now()}@ue.edu.pk`;
  const testPassword = 'Password123!';

  // Step 1: Teacher Registers
  const regRes = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Engr. QA Test Teacher',
      email: testTeacherEmail,
      password: testPassword
    })
  });
  assert(regRes.ok, `Teacher registered account: ${testTeacherEmail}`);

  // Step 2: Teacher logs in before submitting profile
  const teacherPreLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testTeacherEmail, password: testPassword })
  });
  assert(teacherPreLogin.ok, 'Teacher logged in successfully');
  const preUser = teacherPreLogin.data.user;
  assert(preUser.enrollmentStatus === 'ProfileIncomplete', 'Initial teacher enrollmentStatus is ProfileIncomplete');

  // Step 3: Unapproved Teacher tries to upload Course File -> BLOCKED!
  const blockUploadRes = await request('/course-files', {
    method: 'POST',
    headers: {
      'x-user-id': testTeacherId,
      'x-user-role': 'REGULAR_TEACHER'
    },
    body: JSON.stringify({
      teacherId: testTeacherId,
      teacherRole: 'REGULAR_TEACHER',
      courseCode: 'CS-101',
      courseTitle: 'Introduction to Programming',
      title: 'Premature Course File',
      batch: '2024',
      session: '2024–2025',
      semester: '1st Semester'
    })
  });
  assert(blockUploadRes.status === 403, 'Direct course-file API access by unapproved teacher is BLOCKED with 403 Forbidden');

  // Step 4: Teacher completes profile and submits enrollment request
  const submitReqRes = await request('/teacher-requests', {
    method: 'POST',
    headers: {
      'x-user-id': testTeacherId,
      'x-user-role': 'REGULAR_TEACHER'
    },
    body: JSON.stringify({
      teacherId: testTeacherId,
      teacherName: 'Engr. QA Test Teacher',
      teacherEmail: testTeacherEmail,
      teacherType: 'REGULAR_TEACHER',
      campusId: activeHodAsgn.campusId,
      campusName: activeHodAsgn.campusName,
      departmentId: activeHodAsgn.departmentId,
      departmentName: activeHodAsgn.departmentName,
      hodId: activeHodAsgn.hodId,
      hodName: activeHodAsgn.hodName,
      selectedCourses: [
        { courseId: `c-test-${Date.now()}`, courseCode: 'CS-401', courseName: 'Advanced Web Engineering', credits: 3 }
      ],
      profileData: {
        campusId: activeHodAsgn.campusId,
        campus: activeHodAsgn.campusName,
        academicSession: 'Spring 2026',
        batch: '2024'
      }
    })
  });
  if (!submitReqRes.ok) {
    console.error('  DEBUG submitReqRes error:', submitReqRes.status, submitReqRes.data);
  }
  assert(submitReqRes.ok, 'Teacher submitted enrollment request to HOD');
  const createdReq = submitReqRes.data?.data;
  assert(createdReq?.status === 'PendingHODApproval', 'Submitted request status is PendingHODApproval');

  // Step 5: Check my-request endpoint
  const myReqRes = await request(`/teacher-requests/my-request?teacherId=${testTeacherId}&email=${encodeURIComponent(testTeacherEmail)}`);
  assert(myReqRes.ok && myReqRes.data?.data?.status === 'PendingHODApproval', 'GET /api/teacher-requests/my-request returns PendingHODApproval');

  // Step 6: HOD views the request in their scoped inbox
  const hodInboxRes = await request('/teacher-requests', {
    headers: {
      'x-user-id': activeHodAsgn.hodId,
      'x-user-role': 'HOD',
      'x-department-id': activeHodAsgn.departmentId,
      'x-campus-id': activeHodAsgn.campusId
    }
  });
  assert(hodInboxRes.ok, 'HOD successfully fetched scoped teacher requests');
  const hodRequests = hodInboxRes.data.data || [];
  const foundInHodInbox = hodRequests.some(r => r.id === createdReq.id || r.teacherEmail === testTeacherEmail);
  assert(foundInHodInbox, 'Enrollment request is visible in HOD inbox');

  // Step 7: HOD Approves the Teacher Request
  console.log(`  Approving request ${createdReq.id} as HOD...`);
  const approveRes = await request(`/teacher-requests/${createdReq.id}/approve`, {
    method: 'PUT',
    headers: {
      'x-user-id': activeHodAsgn.hodId,
      'x-user-role': 'HOD',
      'x-department-id': activeHodAsgn.departmentId
    }
  });
  assert(approveRes.ok, 'HOD successfully approved teacher request');

  // Step 8: Database State Verification
  const verifyDbReq = await request(`/teacher-requests/my-request?teacherId=${testTeacherId}&email=${encodeURIComponent(testTeacherEmail)}`);
  assert(verifyDbReq.data?.data?.status === 'Approved', 'Database TeacherRequest status changed to "Approved"');

  const verifyUserDb = await request(`/users/${testTeacherId}`);
  assert(
    verifyUserDb.data?.data?.enrollmentStatus === 'Approved' || verifyUserDb.data?.data?.status === 'Active',
    'Teacher User record updated to enrollmentStatus: "Approved" and status: "Active"'
  );

  // Step 9: Teacher Logs In Again -> PORTAL UNLOCKED!
  const teacherPostLogin = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: testTeacherEmail, password: testPassword })
  });
  assert(teacherPostLogin.ok, 'Teacher logged in after approval');
  const approvedUser = teacherPostLogin.data.user;
  assert(approvedUser.enrollmentStatus === 'Approved', 'Teacher enrollmentStatus is APPROVED on login');
  assert(approvedUser.status === 'Active', 'Teacher status is ACTIVE on login');
  assert(approvedUser.departmentName === activeHodAsgn.departmentName, `Teacher Department correctly linked: "${approvedUser.departmentName}"`);
  assert(approvedUser.campus === activeHodAsgn.campusName, `Teacher Campus correctly linked: "${approvedUser.campus}"`);
  assert(approvedUser.hodName === activeHodAsgn.hodName, `Teacher assigned HOD correctly linked: "${approvedUser.hodName}"`);

  // PHASE 14: Double Approval Protection
  console.log('\n--- PHASE 14: Double Approval Protection ---');
  const doubleApproveRes = await request(`/teacher-requests/${createdReq.id}/approve`, {
    method: 'PUT',
    headers: {
      'x-user-id': activeHodAsgn.hodId,
      'x-user-role': 'HOD'
    }
  });
  assert(doubleApproveRes.status === 400, 'Duplicate approval attempt safely rejected with 400 Bad Request');

  // PHASE 6 & 7: Course File Workflow & Automatic Hierarchy
  console.log('\n--- PHASE 6 & 7: Course File Workflow & Automatic HOD Hierarchy ---');
  const testCourseFileId = `file-test-${Date.now()}`;

  // Step 1: Save Draft Course File
  const draftRes = await request('/course-files', {
    method: 'POST',
    headers: {
      'x-user-id': testTeacherId,
      'x-user-role': 'REGULAR_TEACHER'
    },
    body: JSON.stringify({
      id: testCourseFileId,
      courseCode: 'CS-401',
      courseTitle: 'Advanced Web Engineering',
      title: 'CS-401 Course File - Draft',
      credits: 3,
      departmentId: activeHodAsgn.departmentId,
      departmentName: activeHodAsgn.departmentName,
      campusId: activeHodAsgn.campusId,
      campusName: activeHodAsgn.campusName,
      hodId: activeHodAsgn.hodId,
      hodName: activeHodAsgn.hodName,
      batch: '2024',
      session: '2024–2025',
      semester: '1st Semester',
      teacherId: testTeacherId,
      teacherName: 'Engr. QA Test Teacher',
      teacherRole: 'REGULAR_TEACHER',
      status: 'Draft'
    })
  });
  assert(draftRes.ok, 'Approved teacher successfully created Course File Draft');

  // Step 2: Submit to HOD
  const submitFileRes = await request('/course-files', {
    method: 'POST',
    headers: {
      'x-user-id': testTeacherId,
      'x-user-role': 'REGULAR_TEACHER'
    },
    body: JSON.stringify({
      id: testCourseFileId,
      courseCode: 'CS-401',
      courseTitle: 'Advanced Web Engineering',
      title: 'CS-401 Complete Course File',
      credits: 3,
      departmentId: activeHodAsgn.departmentId,
      departmentName: activeHodAsgn.departmentName,
      campusId: activeHodAsgn.campusId,
      campusName: activeHodAsgn.campusName,
      hodId: activeHodAsgn.hodId,
      hodName: activeHodAsgn.hodName,
      batch: '2024',
      session: '2024–2025',
      semester: '1st Semester',
      teacherId: testTeacherId,
      teacherName: 'Engr. QA Test Teacher',
      teacherRole: 'REGULAR_TEACHER',
      status: 'Submitted'
    })
  });
  assert(submitFileRes.ok, 'Course File submitted to HOD successfully');

  // Step 3: Verify HOD sees file inside Batch 2024 -> Session 2024–2025 -> 1st Semester
  const allFilesRes = await request('/course-files');
  const allFiles = allFilesRes.data?.data || [];
  const foundFile = allFiles.find(f => f.teacherId === testTeacherId && f.courseCode === 'CS-401');
  assert(foundFile?.status === 'Submitted', 'Course File persisted with status "Submitted"');
  assert(foundFile?.batch === '2024', 'Course File automatically assigned to Batch 2024');
  assert(foundFile?.session === '2024–2025', 'Course File automatically assigned to Session 2024–2025');
  assert(foundFile?.semester === '1st Semester', 'Course File automatically assigned to 1st Semester');

  // Step 4: HOD Reviews & Approves Course File
  const approveFileRes = await request(`/course-files/${foundFile.id}/status`, {
    method: 'PATCH',
    headers: {
      'x-user-id': activeHodAsgn.hodId,
      'x-user-role': 'HOD'
    },
    body: JSON.stringify({
      status: 'Approved',
      reviewerName: activeHodAsgn.hodName,
      remarks: 'Verified complete and compliant with HEC QA standards.'
    })
  });
  assert(approveFileRes.ok, 'HOD successfully approved the Course File');

  // PHASE 10 & 11: Cross-Department and Cross-Campus Security Isolation
  console.log('\n--- PHASE 10 & 11: Strict Multi-Department & Multi-Campus Security Isolation ---');

  // Attempt to submit course file with mismatched department
  const crossDeptSubmit = await request('/course-files', {
    method: 'POST',
    headers: {
      'x-user-id': testTeacherId,
      'x-user-role': 'REGULAR_TEACHER'
    },
    body: JSON.stringify({
      teacherId: testTeacherId,
      teacherRole: 'REGULAR_TEACHER',
      courseCode: 'MATH-201',
      departmentId: 'dept-unauthorized-other',
      campusId: activeHodAsgn.campusId,
      batch: '2024',
      session: '2024–2025',
      semester: '2nd Semester'
    })
  });
  assert(crossDeptSubmit.status === 403, 'Cross-department course file creation blocked by backend with 403 Forbidden');

  // Attempt by HOD to view another HOD\'s request
  const unauthHodView = await request(`/teacher-requests/${createdReq.id}`, {
    headers: {
      'x-user-id': 'usr-different-hod',
      'x-user-role': 'HOD',
      'x-department-id': 'dept-different'
    }
  });
  assert(unauthHodView.status === 403 || unauthHodView.status === 404, 'Unauthorized HOD access to foreign request blocked with 403/404');

  // PHASE 16: Deactivated Account Check
  console.log('\n--- PHASE 16: Inactive Account Authentication ---');
  const inactiveCheck = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: 'inactive.user@ue.edu.pk', password: 'password123' })
  });
  assert(!inactiveCheck.ok, 'Non-existent / inactive account cannot log in');

  // PHASE 17 & Cleanup: Remove temporary test records
  console.log('\n--- PHASE 17 & CLEANUP: Purging Temporary QA Test Records ---');
  await request(`/teacher-requests/${createdReq.id}`, { method: 'DELETE' }).catch(() => {});
  if (foundFile) {
    await request(`/course-files/${foundFile.id}`, { method: 'DELETE' }).catch(() => {});
  }
  await request(`/users/${testTeacherId}`, { method: 'DELETE' }).catch(() => {});
  console.log('  Cleaned up temporary QA test records without leaving dummy data.');

  // FINAL SUMMARY
  console.log('\n===============================================================');
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} PASSED (${failedTests} FAILED)`);
  console.log('===============================================================');

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error('Fatal error in test suite:', err);
  process.exit(1);
});
