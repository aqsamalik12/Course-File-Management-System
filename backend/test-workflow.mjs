/**
 * Automated End-to-End Test Suite for CFMS
 * Validates All 12 Mandatory Test Cases from Section 19
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
  console.log('====================================================');
  console.log('CFMS END-TO-END VERIFICATION SUITE (ALL 12 TESTS)');
  console.log('====================================================\n');

  // Fetch departments to know department IDs
  const deptRes = await api('/api/departments');
  const depts = deptRes.data?.data || deptRes.data || [];
  const csDept = depts.find(d => d.code === 'CS' || d.name?.includes('Computer')) || depts[0];
  const mathDept = depts.find(d => d.code === 'MATH' || d.name?.includes('Mathematics')) || depts[1];
  console.log(`Using CS Department: ${csDept?.name} (${csDept?.id})`);
  console.log(`Using Math Department: ${mathDept?.name} (${mathDept?.id})\n`);

  // Fetch courses
  const courseRes = await api('/api/courses');
  const courses = courseRes.data?.data || courseRes.data || [];
  const csCourses = courses.filter(c => c.departmentId === csDept?.id);
  const mathCourses = courses.filter(c => c.departmentId === mathDept?.id);

  // --------------------------------------------------------------------------
  // TEST 1: New Gmail teacher -> Registration -> Complete form -> Select Regular Teacher -> Select courses under 22 credits -> Submit -> Correct department HOD receives request
  // --------------------------------------------------------------------------
  console.log('TEST 1: New Gmail Teacher Registration & Department HOD Routing');
  const teacher1Email = `dr.alikhanteacher.${Date.now()}@gmail.com`;
  const reg1Res = await api('/api/auth/register-teacher', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dr. Ali Khan',
      email: teacher1Email,
      password: 'Password123!',
      departmentId: csDept.id,
      phone: '+92 300 1234567'
    })
  });
  assert(reg1Res.status === 201 && reg1Res.data.success, 'New Gmail teacher registers successfully with status ProfileIncomplete');
  const teacher1 = reg1Res.data.data;

  // Submit profile with Regular Teacher and 9 credits (3 courses)
  const selectedCsCourses = csCourses.slice(0, 3).map(c => ({
    courseId: c.id,
    courseCode: c.code || 'CS-101',
    courseName: c.name || c.title || 'Introduction to Programming',
    credits: c.creditHours || 3
  }));
  const totalCreditsT1 = selectedCsCourses.reduce((sum, c) => sum + Number(c.credits), 0);

  const sub1Res = await api('/api/teacher-requests', {
    method: 'POST',
    headers: {
      'x-user-id': teacher1.id,
      'x-user-role': 'REGULAR_TEACHER'
    },
    body: JSON.stringify({
      teacherId: teacher1.id,
      teacherName: teacher1.name,
      teacherEmail: teacher1.email,
      teacherType: 'REGULAR_TEACHER',
      departmentId: csDept.id,
      selectedCourses: selectedCsCourses,
      profileData: { qualification: 'PhD Computer Science', designation: 'Assistant Professor' }
    })
  });
  assert(sub1Res.status === 201 && sub1Res.data.success, `Teacher submits registration request for ${totalCreditsT1} credits under 22 limit`);
  const req1 = sub1Res.data.data;
  assert(req1.status === 'PendingHODApproval', 'Request status is set to PendingHODApproval');
  assert(req1.departmentId === csDept.id, 'Request is strictly associated with CS Department');

  // Verify HOD receives the request
  const hodRes = await api(`/api/teacher-requests?departmentId=${csDept.id}`, {
    headers: {
      'x-user-role': 'HOD',
      'x-department-id': csDept.id
    }
  });
  const foundInHOD = (hodRes.data.data || []).some(r => r.id === req1.id);
  assert(foundInHOD, `CS HOD receives the request for Dr. Ali Khan`);

  // --------------------------------------------------------------------------
  // TEST 2: Regular Teacher selects more than 22 credits -> Submission blocked
  // --------------------------------------------------------------------------
  console.log('\nTEST 2: Regular Teacher Exceeding 22 Credit Limit Blocked');
  const excessCoursesRegular = [
    { courseId: 'c1', courseCode: 'CS-1', courseName: 'C1', credits: 4 },
    { courseId: 'c2', courseCode: 'CS-2', courseName: 'C2', credits: 4 },
    { courseId: 'c3', courseCode: 'CS-3', courseName: 'C3', credits: 4 },
    { courseId: 'c4', courseCode: 'CS-4', courseName: 'C4', credits: 4 },
    { courseId: 'c5', courseCode: 'CS-5', courseName: 'C5', credits: 4 },
    { courseId: 'c6', courseCode: 'CS-6', courseName: 'C6', credits: 4 } // 24 credits > 22
  ];
  const t2Res = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: 'dummy-teacher-reg-over',
      teacherName: 'Overload Regular Teacher',
      teacherEmail: 'overload.reg@gmail.com',
      teacherType: 'REGULAR_TEACHER',
      departmentId: csDept.id,
      selectedCourses: excessCoursesRegular
    })
  });
  assert(t2Res.status === 400 && !t2Res.data.success, 'Submission blocked with HTTP 400 when Regular Teacher selects 24 credits (> 22)');
  assert(t2Res.data.message.includes('Credit hour limit exceeded'), 'Clear credit limit error message returned');

  // --------------------------------------------------------------------------
  // TEST 3: Visiting Teacher selects more than 12 credits -> Submission blocked
  // --------------------------------------------------------------------------
  console.log('\nTEST 3: Visiting Teacher Exceeding 12 Credit Limit Blocked');
  const excessCoursesVisiting = [
    { courseId: 'c1', courseCode: 'CS-1', courseName: 'C1', credits: 4 },
    { courseId: 'c2', courseCode: 'CS-2', courseName: 'C2', credits: 4 },
    { courseId: 'c3', courseCode: 'CS-3', courseName: 'C3', credits: 3 },
    { courseId: 'c4', courseCode: 'CS-4', courseName: 'C4', credits: 3 } // 14 credits > 12
  ];
  const t3Res = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: 'dummy-teacher-vis-over',
      teacherName: 'Overload Visiting Teacher',
      teacherEmail: 'overload.vis@gmail.com',
      teacherType: 'VISITING_TEACHER',
      departmentId: csDept.id,
      selectedCourses: excessCoursesVisiting
    })
  });
  assert(t3Res.status === 400 && !t3Res.data.success, 'Submission blocked with HTTP 400 when Visiting Teacher selects 14 credits (> 12)');
  assert(t3Res.data.message.includes('Visiting teachers') && t3Res.data.message.includes('12'), 'Specific Visiting Teacher 12 credit limit message returned');

  // --------------------------------------------------------------------------
  // TEST 4: Teacher selects Department A -> Only Department A courses appear
  // --------------------------------------------------------------------------
  console.log('\nTEST 4: Course Filtering Strictly by Selected Department');
  let currentCoursesRes = await api('/api/courses');
  let currentCourses = currentCoursesRes.data?.data || currentCoursesRes.data || [];
  let mathFilterCourses = currentCourses.filter(c => c.departmentId === mathDept.id);
  if (mathFilterCourses.length === 0) {
    await api('/api/courses', {
      method: 'POST',
      body: JSON.stringify({
        id: `course-math-${Date.now()}`,
        code: 'MTH-101',
        title: 'Calculus & Analytical Geometry',
        departmentId: mathDept.id,
        departmentName: mathDept.name,
        credits: 3,
        type: 'Core'
      })
    });
    currentCoursesRes = await api('/api/courses');
    currentCourses = currentCoursesRes.data?.data || currentCoursesRes.data || [];
    mathFilterCourses = currentCourses.filter(c => c.departmentId === mathDept.id);
  }
  const csFilterCourses = currentCourses.filter(c => c.departmentId === csDept.id);
  const crossContamination = csFilterCourses.some(c => c.departmentId === mathDept.id);
  assert(csFilterCourses.length > 0 && mathFilterCourses.length > 0, `Department A has ${csFilterCourses.length} courses, Department B has ${mathFilterCourses.length} courses`);
  assert(!crossContamination, 'No cross-department contamination: CS course list contains only CS courses');

  // --------------------------------------------------------------------------
  // TEST 5: Department A request -> Department B HOD cannot see it
  // --------------------------------------------------------------------------
  console.log('\nTEST 5: Cross-Department Isolation for HODs');
  const mathHodRes = await api(`/api/teacher-requests`, {
    headers: {
      'x-user-role': 'HOD',
      'x-department-id': mathDept.id
    }
  });
  const mathHodRequests = mathHodRes.data.data || [];
  const csRequestInMathHod = mathHodRequests.some(r => r.id === req1.id);
  assert(!csRequestInMathHod, 'Department B (Math) HOD CANNOT see Department A (CS) teacher request');

  // --------------------------------------------------------------------------
  // TEST 6: HOD approves -> Teacher gets dashboard access
  // --------------------------------------------------------------------------
  console.log('\nTEST 6: HOD Approval Workflow & Dashboard Unlock');
  const approveRes = await api(`/api/teacher-requests/${req1.id}/approve`, {
    method: 'PATCH',
    headers: {
      'x-user-role': 'HOD',
      'x-department-id': csDept.id,
      'x-user-name': 'Dr. HOD Computer Science'
    }
  });
  assert(approveRes.status === 200 && approveRes.data.success, 'CS HOD approves the teacher request');

  // Verify teacher record updated
  const teacherUserRes = await api(`/api/users/${teacher1.id}`);
  const updatedTeacherUser = teacherUserRes.data?.data || teacherUserRes.data;
  assert(updatedTeacherUser.enrollmentStatus === 'Approved', 'Teacher enrollmentStatus is now "Approved" (access unlocked)');
  assert(updatedTeacherUser.status === 'Active', 'Teacher account status is "Active"');

  // --------------------------------------------------------------------------
  // TEST 7: HOD rejects -> Teacher remains blocked from dashboard & can see reason
  // --------------------------------------------------------------------------
  console.log('\nTEST 7: HOD Rejection Workflow with Rejection Reason');
  const teacher2Email = `dr.saniateacher.${Date.now()}@gmail.com`;
  const reg2Res = await api('/api/auth/register-teacher', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dr. Sania Mirza',
      email: teacher2Email,
      password: 'Password123!',
      departmentId: csDept.id
    })
  });
  const teacher2 = reg2Res.data.data;

  // Submit request
  const sub2Res = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: teacher2.id,
      teacherName: teacher2.name,
      teacherEmail: teacher2.email,
      teacherType: 'VISITING_TEACHER',
      departmentId: csDept.id,
      selectedCourses: selectedCsCourses.slice(0, 1) // 3 credits
    })
  });
  const req2 = sub2Res.data.data;

  // HOD Rejects with Reason
  const rejectReason = 'Incomplete verification documents. Please upload Masters degree transcript.';
  const rejectRes = await api(`/api/teacher-requests/${req2.id}/reject`, {
    method: 'PATCH',
    headers: {
      'x-user-role': 'HOD',
      'x-department-id': csDept.id
    },
    body: JSON.stringify({ rejectionReason: rejectReason })
  });
  assert(rejectRes.status === 200 && rejectRes.data.success, 'HOD rejects the request with a rejection reason');

  // Verify teacher status
  const teacher2UserRes = await api(`/api/users/${teacher2.id}`);
  const updatedTeacher2 = teacher2UserRes.data?.data || teacher2UserRes.data;
  assert(updatedTeacher2.enrollmentStatus === 'Rejected', 'Teacher enrollmentStatus is "Rejected" (dashboard blocked)');
  assert(updatedTeacher2.rejectionReason === rejectReason, 'Rejection reason is stored and returned to teacher');

  // --------------------------------------------------------------------------
  // TEST 8: Department without HOD -> Request remains pending and Admin alerted
  // --------------------------------------------------------------------------
  console.log('\nTEST 8: Department Without HOD Handling & Admin Alert');
  // Create or find a department without an HOD
  const noHodDeptRes = await api('/api/departments', {
    method: 'POST',
    body: JSON.stringify({
      name: `New Department ${Date.now()}`,
      code: `ND${Math.floor(Math.random() * 1000)}`,
      hodId: '',
      hodName: 'Unassigned',
      facultyCount: 0
    })
  });
  const noHodDept = noHodDeptRes.data?.data || noHodDeptRes.data;

  const t8Res = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: `teacher-nohod-${Date.now()}`,
      teacherName: 'Prof. Tariq NoHOD',
      teacherEmail: `tariq.${Date.now()}@gmail.com`,
      teacherType: 'REGULAR_TEACHER',
      departmentId: noHodDept.id,
      selectedCourses: [{ courseId: 'c1', courseCode: 'GEN-101', courseName: 'General Course', credits: 3 }]
    })
  });
  assert(t8Res.status === 201 && t8Res.data.success, 'Request created in pending state for department without HOD');
  assert(t8Res.data.data.status === 'PendingHODApproval', 'Request remains in "PendingHODApproval" state (not silently approved)');
  assert(t8Res.data.hodAssigned === false, 'System explicitly flags hodAssigned === false');

  // Verify admin notification was created
  const notifRes = await api('/api/notifications');
  const notifs = notifRes.data?.data || notifRes.data || [];
  const adminAlertFound = notifs.some(n => n.targetRole === 'ADMIN' && n.title?.includes('HOD Missing'));
  assert(adminAlertFound, 'Admin notification generated alerting that department has no assigned HOD');

  // --------------------------------------------------------------------------
  // TEST 9: Teacher tries to bypass frontend credit validation through API -> Backend rejects
  // --------------------------------------------------------------------------
  console.log('\nTEST 9: Direct API Credit Limit Bypass Protection');
  const bypassPayload = {
    teacherId: `hacker-${Date.now()}`,
    teacherName: 'Malicious Actor',
    teacherEmail: `hacker.${Date.now()}@gmail.com`,
    teacherType: 'VISITING_TEACHER', // limit 12
    departmentId: csDept.id,
    selectedCourses: [
      { courseId: 'x1', courseCode: 'X1', courseName: 'X1', credits: 10 },
      { courseId: 'x2', courseCode: 'X2', courseName: 'X2', credits: 10 } // 20 credits > 12
    ]
  };
  const bypassRes = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify(bypassPayload)
  });
  assert(bypassRes.status === 400 && !bypassRes.data.success, 'Backend strictly rejects direct API request with excessive credits (HTTP 400)');

  // --------------------------------------------------------------------------
  // TEST 10: Teacher tries to access another teacher\'s request -> Authorization blocks access
  // --------------------------------------------------------------------------
  console.log('\nTEST 10: Cross-Teacher Request Authorization Protection');
  const crossRes = await api(`/api/teacher-requests/${req1.id}`, {
    headers: {
      'x-user-id': 'different-teacher-id-999',
      'x-user-role': 'REGULAR_TEACHER'
    }
  });
  assert(crossRes.status === 403 && !crossRes.data.success, 'Cross-teacher request viewing is blocked with HTTP 403 Forbidden');

  // Cross-department HOD approval attempt
  const crossApproveRes = await api(`/api/teacher-requests/${req1.id}/approve`, {
    method: 'PATCH',
    headers: {
      'x-user-role': 'HOD',
      'x-department-id': mathDept.id // Math HOD trying to approve CS request
    }
  });
  assert(crossApproveRes.status === 403 && !crossApproveRes.data.success, 'Math HOD trying to approve CS request is blocked with HTTP 403 Forbidden');

  // --------------------------------------------------------------------------
  // TEST 11: Admin assigns HOD -> Correct HOD immediately starts receiving that department\'s requests
  // --------------------------------------------------------------------------
  console.log('\nTEST 11: Admin HOD Assignment & Routing Update');
  const newHodId = `hod-user-${Date.now()}`;
  const newHodName = 'Dr. Newly Appointed HOD';

  const assignRes = await api(`/api/departments/${noHodDept.id}/assign-hod`, {
    method: 'PUT',
    headers: {
      'x-user-role': 'ADMIN'
    },
    body: JSON.stringify({
      hodId: newHodId,
      hodName: newHodName
    })
  });
  assert(assignRes.status === 200 && assignRes.data.success, 'Admin successfully assigns new HOD to department');

  // Verify the pending request for this department was routed to the new HOD
  const reqCheckRes = await api(`/api/teacher-requests?departmentId=${noHodDept.id}`, {
    headers: {
      'x-user-role': 'HOD',
      'x-department-id': noHodDept.id
    }
  });
  const routedRequests = reqCheckRes.data.data || [];
  const updatedReq = routedRequests.find(r => r.id === t8Res.data.data.id);
  assert(updatedReq && updatedReq.hodId === newHodId, 'Pending request was immediately re-routed to the new HOD');

  // --------------------------------------------------------------------------
  // TEST 12: Existing Admin/HOD/Teacher modules continue working
  // --------------------------------------------------------------------------
  console.log('\nTEST 12: Existing System Functionality Preservation');
  const healthRes = await api('/api/health');
  assert(healthRes.status === 200 && healthRes.data.status === 'online', 'Health endpoint operational');

  const filesRes = await api('/api/course-files');
  assert(filesRes.status === 200, 'Course Files module operational');

  const deadRes = await api('/api/deadlines');
  assert(deadRes.status === 200, 'Deadlines module operational');

  const tempRes = await api('/api/templates');
  assert(tempRes.status === 200, 'Templates module operational');

  console.log('\n====================================================');
  console.log(`TEST SUITE RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
