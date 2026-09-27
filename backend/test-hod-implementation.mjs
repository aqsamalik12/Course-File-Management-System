/**
 * Comprehensive End-to-End Test Suite for Final HOD Module Implementation
 * Validates All 12 Acceptance Tests from Requirement 47
 */

const BASE_URL = 'http://localhost:5000';

async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }
  return { status: res.status, ok: res.ok, data };
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

async function runTests() {
  console.log('================================================================');
  console.log('STARTING HOD MODULE IMPLEMENTATION E2E TEST SUITE (12 TESTS)');
  console.log('================================================================\n');

  const ts = Date.now();

  // Ensure Attock Campus exists
  const campusesRes = await api('/api/campuses');
  let attockCampus = campusesRes.data.data?.find(c => c.name.toLowerCase().includes('attock') || c.id === 'camp-attock');
  if (!attockCampus) {
    const createCamp = await api('/api/campuses', {
      method: 'POST',
      body: JSON.stringify({ name: 'Attock Campus', code: 'UE-ATK', city: 'Attock' })
    });
    attockCampus = createCamp.data.data;
  }
  const attockCampusId = attockCampus.id;
  const attockCampusName = attockCampus.name;

  // Ensure Mathematics Department exists under Attock
  const deptRes = await api('/api/departments');
  let mathDept = deptRes.data.data?.find(d => d.name.toLowerCase().includes('mathematics') && (d.campusId === attockCampusId || d.campusName?.includes('Attock')));
  if (!mathDept) {
    const createMath = await api('/api/departments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Mathematics', code: 'MATH', campusId: attockCampusId, campusName: attockCampusName })
    });
    mathDept = createMath.data.data;
  }
  const mathDeptId = mathDept.id;
  const mathDeptName = mathDept.name;

  // Ensure Computer Science Department exists under Attock
  let csDept = deptRes.data.data?.find(d => d.name.toLowerCase().includes('computer science') && (d.campusId === attockCampusId || d.campusName?.includes('Attock')));
  if (!csDept) {
    const createCs = await api('/api/departments', {
      method: 'POST',
      body: JSON.stringify({ name: 'Computer Science', code: 'CS', campusId: attockCampusId, campusName: attockCampusName })
    });
    csDept = createCs.data.data;
  }
  const csDeptId = csDept.id;
  const csDeptName = csDept.name;

  console.log(`[Setup] Campus: ${attockCampusName} (${attockCampusId})`);
  console.log(`[Setup] Math Dept: ${mathDeptName} (${mathDeptId})`);
  console.log(`[Setup] CS Dept: ${csDeptName} (${csDeptId})\n`);

  // ============================================================
  // TEST 1 — HOD ACCOUNT CREATION AND LOGIN
  // ============================================================
  console.log('--- TEST 1: Admin Creates HOD Dr. Asif (Attock + Mathematics) & HOD Login ---');
  const mathHodEmail = `dr.asif.math.${ts}@ue.edu.pk`;
  const mathHodPass = 'Password123!';

  const createMathHodRes = await api('/api/hod-assignments', {
    method: 'POST',
    body: JSON.stringify({
      hodName: 'Dr. Asif',
      hodEmail: mathHodEmail,
      password: mathHodPass,
      campusId: attockCampusId,
      departmentId: mathDeptId,
      status: 'Active'
    })
  });
  assert(createMathHodRes.status === 201 && createMathHodRes.data.success, 'Admin creates HOD Dr. Asif assigned to Attock + Mathematics');
  const mathHodAssignment = createMathHodRes.data.data;

  // Dr. Asif Login
  const loginMathHod = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: mathHodEmail, password: mathHodPass })
  });
  assert(loginMathHod.status === 200 && loginMathHod.data.success, 'Dr. Asif logs in with admin-created email and password');
  const mathHodToken = loginMathHod.data.token;
  const mathHodUser = loginMathHod.data.user;

  // Check HOD Dashboard Header Scope
  const mathDashboardRes = await api('/api/hod/dashboard', {
    headers: { 'Authorization': `Bearer ${mathHodToken}` }
  });
  assert(mathDashboardRes.status === 200 && mathDashboardRes.data.success, 'Dr. Asif accesses /api/hod/dashboard');
  assert(mathDashboardRes.data.hod.name === 'Dr. Asif', `Dashboard displays HOD Name: ${mathDashboardRes.data.hod.name}`);
  assert(mathDashboardRes.data.hod.departmentName.toLowerCase().includes('mathematics'), `Dashboard displays Department: ${mathDashboardRes.data.hod.departmentName}`);
  assert(mathDashboardRes.data.hod.campusName.toLowerCase().includes('attock'), `Dashboard displays Campus: ${mathDashboardRes.data.hod.campusName}`);

  // ============================================================
  // TEST 2 — COMMON DASHBOARD (SAME UI, DATA DIFFERS BY SCOPE)
  // ============================================================
  console.log('\n--- TEST 2: Second HOD Dr. Ahmed (Attock + Computer Science) & Common Dashboard ---');
  const csHodEmail = `dr.ahmed.cs.${ts}@ue.edu.pk`;
  const csHodPass = 'Password123!';

  const createCsHodRes = await api('/api/hod-assignments', {
    method: 'POST',
    body: JSON.stringify({
      hodName: 'Dr. Ahmed',
      hodEmail: csHodEmail,
      password: csHodPass,
      campusId: attockCampusId,
      departmentId: csDeptId,
      status: 'Active'
    })
  });
  assert(createCsHodRes.status === 201 && createCsHodRes.data.success, 'Admin creates CS HOD Dr. Ahmed assigned to Attock + Computer Science');

  const loginCsHod = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: csHodEmail, password: csHodPass })
  });
  assert(loginCsHod.status === 200 && loginCsHod.data.success, 'Dr. Ahmed logs in with admin-created credentials');
  const csHodToken = loginCsHod.data.token;

  const csDashboardRes = await api('/api/hod/dashboard', {
    headers: { 'Authorization': `Bearer ${csHodToken}` }
  });
  assert(csDashboardRes.status === 200 && csDashboardRes.data.success, 'Dr. Ahmed accesses the same /api/hod/dashboard endpoint');
  assert(csDashboardRes.data.hod.name === 'Dr. Ahmed', `CS Dashboard displays Dr. Ahmed`);
  assert(csDashboardRes.data.hod.departmentName.toLowerCase().includes('computer science'), `CS Dashboard displays Computer Science`);
  assert(csDashboardRes.data.hod.campusName.toLowerCase().includes('attock'), `CS Dashboard displays Attock Campus`);

  // ============================================================
  // TEST 3 — MATHEMATICS TEACHER REQUEST
  // ============================================================
  console.log('\n--- TEST 3: Teacher Submits Request for Attock + Mathematics -> Dr. Asif ---');
  const mathTeacherEmail = `math.teacher.${ts}@ue.edu.pk`;
  const regMathTeacher = await api('/api/auth/register-teacher', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Prof. Farhan (Math)',
      email: mathTeacherEmail,
      password: 'Password123!',
      phone: '+92 300 1112233'
    })
  });
  const mathTeacher = regMathTeacher.data.data;

  // Submit request for Math Dept
  const submitMathReq = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: mathTeacher.id,
      teacherName: mathTeacher.name,
      teacherEmail: mathTeacher.email,
      teacherType: 'REGULAR_TEACHER',
      campusId: attockCampusId,
      campusName: attockCampusName,
      departmentId: mathDeptId,
      hodId: mathHodAssignment.hodId,
      hodName: mathHodAssignment.hodName,
      selectedCourses: [
        { courseId: `crs-math-1-${ts}`, courseCode: 'MATH-101', courseName: 'Calculus I', credits: 3, section: 'Section A' },
        { courseId: `crs-math-2-${ts}`, courseCode: 'MATH-201', courseName: 'Linear Algebra', credits: 3, section: 'Section A' }
      ]
    })
  });
  assert(submitMathReq.status === 201 && submitMathReq.data.success, 'Mathematics teacher submits registration request routed to Dr. Asif');
  const mathRequestId = submitMathReq.data.data.id;

  // Verify Dr. Asif sees the request
  const drAsifRequests = await api('/api/hod/teacher-requests', {
    headers: { 'Authorization': `Bearer ${mathHodToken}` }
  });
  const foundInDrAsif = drAsifRequests.data.data?.some(r => r.id === mathRequestId);
  assert(foundInDrAsif, 'Dr. Asif sees the submitted Mathematics request');

  // ============================================================
  // TEST 4 — COMPUTER SCIENCE TEACHER REQUEST
  // ============================================================
  console.log('\n--- TEST 4: Teacher Submits Request for Attock + Computer Science -> CS HOD ---');
  const csTeacherEmail = `cs.teacher.${ts}@ue.edu.pk`;
  const regCsTeacher = await api('/api/auth/register-teacher', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Prof. Bilal (CS)',
      email: csTeacherEmail,
      password: 'Password123!',
      phone: '+92 300 4445566'
    })
  });
  const csTeacher = regCsTeacher.data.data;

  const submitCsReq = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: csTeacher.id,
      teacherName: csTeacher.name,
      teacherEmail: csTeacher.email,
      teacherType: 'REGULAR_TEACHER',
      campusId: attockCampusId,
      campusName: attockCampusName,
      departmentId: csDeptId,
      hodId: createCsHodRes.data.data.hodId,
      hodName: createCsHodRes.data.data.hodName,
      selectedCourses: [
        { courseId: `crs-cs-1-${ts}`, courseCode: 'CS-101', courseName: 'Programming Fundamentals', credits: 4, section: 'Section A' }
      ]
    })
  });
  assert(submitCsReq.status === 201 && submitCsReq.data.success, 'CS teacher submits registration request routed to Dr. Ahmed');
  const csRequestId = submitCsReq.data.data.id;

  // Verify Dr. Ahmed sees it
  const drAhmedRequests = await api('/api/hod/teacher-requests', {
    headers: { 'Authorization': `Bearer ${csHodToken}` }
  });
  const foundInDrAhmed = drAhmedRequests.data.data?.some(r => r.id === csRequestId);
  assert(foundInDrAhmed, 'CS HOD Dr. Ahmed sees the CS teacher request');

  // Verify Dr. Asif does NOT see the CS request
  const drAsifRequestsCheck = await api('/api/hod/teacher-requests', {
    headers: { 'Authorization': `Bearer ${mathHodToken}` }
  });
  const leakedToDrAsif = drAsifRequestsCheck.data.data?.some(r => r.id === csRequestId);
  assert(!leakedToDrAsif, 'Dr. Asif does NOT see the Computer Science request (Isolation Confirmed)');

  // ============================================================
  // TEST 5 — WRONG DATA ACCESS (403 FORBIDDEN)
  // ============================================================
  console.log('\n--- TEST 5: Direct URL/API Cross-Access Attempt by Dr. Asif to CS Request ---');
  const unauthorizedAccessRes = await api(`/api/hod/teacher-requests/${csRequestId}`, {
    headers: { 'Authorization': `Bearer ${mathHodToken}` }
  });
  assert(unauthorizedAccessRes.status === 403, `Direct API access by Dr. Asif to CS request returns 403 Forbidden (Got ${unauthorizedAccessRes.status})`);

  // Direct approval attempt across scope
  const unauthorizedApproveRes = await api(`/api/hod/teacher-requests/${csRequestId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${mathHodToken}` }
  });
  assert(unauthorizedApproveRes.status === 403, `Direct API approve attempt by Dr. Asif on CS request returns 403 Forbidden (Got ${unauthorizedApproveRes.status})`);

  // ============================================================
  // TEST 6 — APPROVAL WORKFLOW
  // ============================================================
  console.log('\n--- TEST 6: Dr. Asif Approves Mathematics Teacher Request ---');
  const approveRes = await api(`/api/hod/teacher-requests/${mathRequestId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${mathHodToken}` }
  });
  assert(approveRes.status === 200 && approveRes.data.success, 'Dr. Asif successfully approves Mathematics teacher request');
  assert(approveRes.data.data.status === 'Approved', 'Request status is updated to Approved in database');

  // Verify teacher user account is now Approved / Active
  const teacherUserRes = await api(`/api/users/${mathTeacher.id}`);
  assert(teacherUserRes.data.data?.enrollmentStatus === 'Approved', 'Teacher user enrollmentStatus is updated to Approved');
  assert(teacherUserRes.data.data?.status === 'Active', 'Teacher user status is updated to Active');

  // Verify teacher appears in Approved Teachers
  const approvedTeachersRes = await api('/api/hod/teachers', {
    headers: { 'Authorization': `Bearer ${mathHodToken}` }
  });
  const inApprovedList = approvedTeachersRes.data.data?.some(t => t.id === mathTeacher.id || t.email === mathTeacherEmail);
  assert(inApprovedList, 'Approved teacher automatically appears under Approved Teachers');

  // Verify notification was generated for teacher
  const notifsRes = await api('/api/notifications');
  const teacherNotif = notifsRes.data.data?.some(n => n.message?.includes('Farhan') || n.targetUserId === mathTeacher.id);
  assert(teacherNotif, 'Teacher notification created upon HOD approval');

  // Verify Double Approval is Safely Rejected (Requirement 18)
  const doubleApproveRes = await api(`/api/hod/teacher-requests/${mathRequestId}/approve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${mathHodToken}` }
  });
  assert(doubleApproveRes.status === 400 && !doubleApproveRes.data.success, 'Double approval is prevented safely with 400 Bad Request');
  assert(doubleApproveRes.data.message.includes('already been approved'), 'Double approval error message explicitly explains duplicate is blocked');

  // Verify cannot reject an already approved request
  const rejectApprovedRes = await api(`/api/hod/teacher-requests/${mathRequestId}/reject`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${mathHodToken}` },
    body: JSON.stringify({ rejectionReason: 'Cannot reject now' })
  });
  assert(rejectApprovedRes.status === 400 && !rejectApprovedRes.data.success, 'Rejecting an already approved request is blocked with 400 Bad Request');

  // ============================================================
  // TEST 7 — REJECTION WORKFLOW
  // ============================================================
  console.log('\n--- TEST 7: Rejection of Teacher Request with Reason ---');
  const mathTeacherEmail2 = `math.teacher.reject.${ts}@ue.edu.pk`;
  const regMathTeacher2 = await api('/api/auth/register-teacher', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Prof. Tariq (Math Rejection Test)',
      email: mathTeacherEmail2,
      password: 'Password123!'
    })
  });
  const mathTeacher2 = regMathTeacher2.data.data;

  const submitMathReq2 = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: mathTeacher2.id,
      teacherName: mathTeacher2.name,
      teacherEmail: mathTeacher2.email,
      teacherType: 'REGULAR_TEACHER',
      campusId: attockCampusId,
      campusName: attockCampusName,
      departmentId: mathDeptId,
      hodId: mathHodAssignment.hodId,
      selectedCourses: [
        { courseId: `crs-math-3-${ts}`, courseCode: 'MATH-301', courseName: 'Differential Equations', credits: 3 }
      ]
    })
  });
  const req2Id = submitMathReq2.data.data.id;

  // Reject the request
  const rejectRes = await api(`/api/hod/teacher-requests/${req2Id}/reject`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${mathHodToken}` },
    body: JSON.stringify({ rejectionReason: 'Please select assigned semester courses as per department timetable.' })
  });
  assert(rejectRes.status === 200 && rejectRes.data.success, 'Dr. Asif rejects the request with a rejection reason');
  assert(rejectRes.data.data.status === 'Rejected', 'Request status is updated to Rejected');
  assert(rejectRes.data.data.rejectionReason.includes('timetable'), 'Rejection reason is saved in database record');

  // Verify teacher workflow remains Locked / Rejected
  const teacher2UserRes = await api(`/api/users/${mathTeacher2.id}`);
  assert(teacher2UserRes.data.data?.enrollmentStatus === 'Rejected', 'Teacher enrollmentStatus is Rejected (Course workflow remains Locked)');

  // Verify Double Rejection is Safely Rejected
  const doubleRejectRes = await api(`/api/hod/teacher-requests/${req2Id}/reject`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${mathHodToken}` },
    body: JSON.stringify({ rejectionReason: 'Another reason' })
  });
  assert(doubleRejectRes.status === 400 && !doubleRejectRes.data.success, 'Double rejection is prevented safely with 400 Bad Request');
  assert(doubleRejectRes.data.message.includes('already been rejected'), 'Double rejection error message explains duplicate is blocked');

  // ============================================================
  // TEST 8 — CAMPUS ISOLATION
  // ============================================================
  console.log('\n--- TEST 8: Campus Isolation Verification ---');
  const otherCampusRes = await api('/api/campuses', {
    method: 'POST',
    body: JSON.stringify({ name: `Lahore Campus ${ts}`, code: `LHR-${ts}`, city: 'Lahore' })
  });
  const otherCampus = otherCampusRes.data.data;

  const otherDeptRes = await api('/api/departments', {
    method: 'POST',
    body: JSON.stringify({ name: 'Mathematics', code: 'MATH-LHR', campusId: otherCampus.id, campusName: otherCampus.name })
  });
  const otherDept = otherDeptRes.data.data;

  const otherHodEmail = `lhr.hod.${ts}@ue.edu.pk`;
  const otherHodRes = await api('/api/hod-assignments', {
    method: 'POST',
    body: JSON.stringify({
      hodName: 'Dr. Lahore HOD',
      hodEmail: otherHodEmail,
      password: 'Password123!',
      campusId: otherCampus.id,
      departmentId: otherDept.id,
      status: 'Active'
    })
  });
  const otherHod = otherHodRes.data.data;

  // Create request for Lahore campus
  const lhrTeacherEmail = `lhr.teacher.${ts}@ue.edu.pk`;
  const regLhrTeacher = await api('/api/auth/register-teacher', {
    method: 'POST',
    body: JSON.stringify({ name: 'Prof. Lahore', email: lhrTeacherEmail, password: 'Password123!' })
  });

  const lhrReq = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: regLhrTeacher.data.data.id,
      teacherName: 'Prof. Lahore',
      teacherEmail: lhrTeacherEmail,
      teacherType: 'REGULAR_TEACHER',
      campusId: otherCampus.id,
      campusName: otherCampus.name,
      departmentId: otherDept.id,
      hodId: otherHod.hodId,
      selectedCourses: [{ courseId: `crs-lhr-${ts}`, courseCode: 'MATH-101', courseName: 'Calculus', credits: 3 }]
    })
  });
  const lhrReqId = lhrReq.data.data.id;

  // Verify Attock HOD (Dr. Asif) CANNOT see Lahore request
  const attockRequests = await api('/api/hod/teacher-requests', {
    headers: { 'Authorization': `Bearer ${mathHodToken}` }
  });
  const lhrInAttock = attockRequests.data.data?.some(r => r.id === lhrReqId);
  assert(!lhrInAttock, 'Attock HOD cannot see requests from another Campus (Campus Isolation Passed)');

  // Direct access to Lahore request by Attock HOD
  const crossCampusAccess = await api(`/api/hod/teacher-requests/${lhrReqId}`, {
    headers: { 'Authorization': `Bearer ${mathHodToken}` }
  });
  assert(crossCampusAccess.status === 403, 'Cross-campus direct request access returns 403 Forbidden');

  // ============================================================
  // TEST 9 — DEPARTMENT ISOLATION UNDER SAME CAMPUS
  // ============================================================
  console.log('\n--- TEST 9: Department Isolation Under Same Campus ---');
  // Mathematics HOD requests
  const mathList = await api('/api/hod/teacher-requests', {
    headers: { 'Authorization': `Bearer ${mathHodToken}` }
  });
  const allBelongToMath = mathList.data.data.every(r => r.departmentName.toLowerCase().includes('mathematics'));
  assert(allBelongToMath, 'All requests visible to Math HOD strictly belong to Mathematics department');

  // CS HOD requests
  const csList = await api('/api/hod/teacher-requests', {
    headers: { 'Authorization': `Bearer ${csHodToken}` }
  });
  const allBelongToCs = csList.data.data.every(r => r.departmentName.toLowerCase().includes('computer science'));
  assert(allBelongToCs, 'All requests visible to CS HOD strictly belong to Computer Science department');

  // ============================================================
  // TEST 10 — MANIPULATED REQUEST MAPPING
  // ============================================================
  console.log('\n--- TEST 10: Manipulated Request Mapping Rejection ---');
  // Attempt to submit request with wrong hodId for math department (sending CS HOD ID for Math dept)
  const badMappingReq = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: `usr-manipulated-${ts}`,
      teacherName: 'Manipulated Teacher',
      teacherEmail: `manipulated.${ts}@ue.edu.pk`,
      teacherType: 'REGULAR_TEACHER',
      campusId: attockCampusId,
      departmentId: mathDeptId,
      hodId: otherHod.hodId, // Mismatched HOD from Lahore!
      selectedCourses: [{ courseId: 'crs-1', credits: 3 }]
    })
  });
  assert(badMappingReq.status === 400 && !badMappingReq.data.success, 'Backend rejects request with mismatched HOD mapping (400 Bad Request)');

  // ============================================================
  // TEST 11 — EMPTY DATA HANDLING (NO DUMMY ROWS)
  // ============================================================
  console.log('\n--- TEST 11: Empty Data Handling with Fresh Scope ---');
  const freshDeptRes = await api('/api/departments', {
    method: 'POST',
    body: JSON.stringify({ name: `English Linguistics ${ts}`, code: `ENG-${ts}`, campusId: attockCampusId, campusName: attockCampusName })
  });
  const freshDept = freshDeptRes.data.data;

  const freshHodEmail = `fresh.hod.${ts}@ue.edu.pk`;
  await api('/api/hod-assignments', {
    method: 'POST',
    body: JSON.stringify({
      hodName: 'Dr. Fresh HOD',
      hodEmail: freshHodEmail,
      password: 'Password123!',
      campusId: attockCampusId,
      departmentId: freshDept.id,
      status: 'Active'
    })
  });

  const freshHodLogin = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: freshHodEmail, password: 'Password123!' })
  });
  const freshHodToken = freshHodLogin.data.token;

  const freshRequests = await api('/api/hod/teacher-requests', {
    headers: { 'Authorization': `Bearer ${freshHodToken}` }
  });
  assert(freshRequests.data.count === 0 && freshRequests.data.data.length === 0, 'Fresh department HOD has 0 requests (No dummy data)');

  const freshTeachers = await api('/api/hod/teachers', {
    headers: { 'Authorization': `Bearer ${freshHodToken}` }
  });
  assert(freshTeachers.data.count === 0 && freshTeachers.data.data.length === 0, 'Fresh department HOD has 0 teachers (No dummy records)');

  // ============================================================
  // TEST 12 — DEACTIVATED HOD ACCESS
  // ============================================================
  console.log('\n--- TEST 12: Admin Deactivates HOD -> Access Denied ---');
  // Admin deactivates the fresh HOD assignment
  const allAssignments = await api('/api/hod-assignments');
  const asgnToDeactivate = allAssignments.data.data?.find(a => a.hodEmail === freshHodEmail);

  if (asgnToDeactivate) {
    const deactRes = await api(`/api/hod-assignments/${asgnToDeactivate.id}`, {
      method: 'PUT',
      body: JSON.stringify({ status: 'Inactive' })
    });
    assert(deactRes.status === 200 && deactRes.data.success, 'Admin sets HOD assignment to Inactive');
  }

  // Deactivated HOD attempts to access /api/hod/dashboard
  const deactAccessRes = await api('/api/hod/dashboard', {
    headers: { 'Authorization': `Bearer ${freshHodToken}` }
  });
  assert(deactAccessRes.status === 403, `Deactivated HOD access to dashboard returns 403 Forbidden (Got ${deactAccessRes.status})`);

  // Deactivated HOD attempts to login again
  const deactLoginRes = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: freshHodEmail, password: 'Password123!' })
  });
  assert(deactLoginRes.status === 403, `Deactivated HOD login attempt is rejected with 403 Forbidden (Got ${deactLoginRes.status})`);

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('[Test Execution Error]', err);
  process.exit(1);
});
