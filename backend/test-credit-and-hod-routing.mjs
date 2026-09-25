/**
 * Specialized Test Suite:
 * 1. 2, 3, 4 Credit Hours Verification
 * 2. Two 2-credit courses and Multiple Sections Selection ("press again")
 * 3. Visiting Teacher Limit (Max 12 Credits) & Regular Teacher Limit (Max 22 Credits)
 * 4. Automatic Department HOD Routing & Approval
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

async function run() {
  console.log('================================================================');
  console.log('TESTING 2, 3, 4 CREDITS, MULTIPLE SECTIONS, AND HOD ROUTING');
  console.log('================================================================\n');

  // 1. Verify Course Catalog contains 2, 3, and 4 credit courses
  console.log('--- 1. Course Catalog Credits Verification ---');
  const courseRes = await api('/api/courses');
  assert(courseRes.status === 200 && courseRes.data.success, 'Course API is responsive');
  const allCourses = courseRes.data.data;
  
  const credits2 = allCourses.filter(c => Number(c.credits) === 2);
  const credits3 = allCourses.filter(c => Number(c.credits) === 3);
  const credits4 = allCourses.filter(c => Number(c.credits) === 4);

  assert(credits2.length >= 2, `Found ${credits2.length} courses with 2 credits (e.g., CS-101L, CS-201L, CS-302L)`);
  assert(credits3.length >= 1, `Found ${credits3.length} courses with 3 credits (e.g., CS-101, CS-401)`);
  assert(credits4.length >= 1, `Found ${credits4.length} courses with 4 credits (e.g., CS-201, CS-302, CS-405)`);

  const csDeptId = 'dept-cs';

  // 2. Test Visiting Teacher Limit (Max 12 Credits)
  console.log('\n--- 2. Visiting Teacher Workflow & 12 Credits Limit ---');
  const visitingEmail = `visiting.tester.${Date.now()}@university.edu`;
  const regVisiting = await api('/api/auth/register-teacher', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Visiting Prof. Zain',
      email: visitingEmail,
      password: 'Password123!',
      departmentId: csDeptId,
      phone: '+92 300 7654321'
    })
  });
  assert(regVisiting.status === 201, 'Visiting teacher registered successfully');
  const visitingTeacher = regVisiting.data.data;

  // Test 2a: Visiting Teacher attempts to select 14 credits (> 12 limit) -> MUST BE BLOCKED
  const overLimitCoursesVisiting = [
    { courseId: 'crs-1', courseCode: 'CS-101', courseName: 'Programming', credits: 4, section: 'Section A' },
    { courseId: 'crs-2', courseCode: 'CS-201', courseName: 'Data Structures', credits: 4, section: 'Section A' },
    { courseId: 'crs-3', courseCode: 'CS-302', courseName: 'Databases', credits: 4, section: 'Section A' },
    { courseId: 'crs-lab1', courseCode: 'CS-101L', courseName: 'Programming Lab', credits: 2, section: 'Section A' }
  ]; // Total = 4 + 4 + 4 + 2 = 14 credits
  const overResVisiting = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: visitingTeacher.id,
      teacherName: visitingTeacher.name,
      teacherEmail: visitingTeacher.email,
      teacherType: 'VISITING_TEACHER',
      departmentId: csDeptId,
      selectedCourses: overLimitCoursesVisiting
    })
  });
  assert(overResVisiting.status === 400 && !overResVisiting.data.success, 'Visiting teacher exceeding 12 credits (14 credits) is correctly blocked with 400 error');

  // Test 2b: Visiting Teacher selects TWO 2-credit courses + ONE 4-credit course + ONE 4-credit course = 12 credits exactly (valid)
  const validVisitingCourses = [
    { courseId: 'crs-101L', courseCode: 'CS-101L', courseName: 'Computer Programming Lab', credits: 2, section: 'Section A' },
    { courseId: 'crs-201L', courseCode: 'CS-201L', courseName: 'Data Structures Lab', credits: 2, section: 'Section B' },
    { courseId: 'crs-201', courseCode: 'CS-201', courseName: 'Data Structures & Algorithms', credits: 4, section: 'Section A' },
    { courseId: 'crs-302', courseCode: 'CS-302', courseName: 'Database Management Systems', credits: 4, section: 'Section A' }
  ]; // Total = 2 + 2 + 4 + 4 = 12 credits
  const validResVisiting = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: visitingTeacher.id,
      teacherName: visitingTeacher.name,
      teacherEmail: visitingTeacher.email,
      teacherType: 'VISITING_TEACHER',
      departmentId: csDeptId,
      selectedCourses: validVisitingCourses,
      profileData: { specialization: 'Software Systems', employmentType: 'Visiting' }
    })
  });
  assert(validResVisiting.status === 201 && validResVisiting.data.success, 'Visiting teacher with two 2-credit courses + 4-credit courses (Total 12 Credits) submitted successfully');
  const visitingRequestId = validResVisiting.data.data.id;

  // 3. Test Regular Teacher Limit (Max 22 Credits) & Multiple Sections of Same Course ("Press Again")
  console.log('\n--- 3. Regular Teacher Workflow, Multiple Sections ("Press Again") & 22 Credits Limit ---');
  const regularEmail = `regular.tester.${Date.now()}@university.edu`;
  const regRegular = await api('/api/auth/register-teacher', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dr. Sarah Ahmed',
      email: regularEmail,
      password: 'Password123!',
      departmentId: csDeptId,
      phone: '+92 300 9876543'
    })
  });
  assert(regRegular.status === 201, 'Regular teacher registered successfully');
  const regularTeacher = regRegular.data.data;

  // Test 3a: Regular Teacher attempts to select 24 credits (> 22 limit) -> MUST BE BLOCKED
  const overLimitCoursesRegular = [
    { courseId: 'crs-1', courseCode: 'CS-101', courseName: 'Programming', credits: 4, section: 'Section A' },
    { courseId: 'crs-1', courseCode: 'CS-101', courseName: 'Programming', credits: 4, section: 'Section B' },
    { courseId: 'crs-2', courseCode: 'CS-201', courseName: 'Data Structures', credits: 4, section: 'Section A' },
    { courseId: 'crs-2', courseCode: 'CS-201', courseName: 'Data Structures', credits: 4, section: 'Section B' },
    { courseId: 'crs-3', courseCode: 'CS-302', courseName: 'Databases', credits: 4, section: 'Section A' },
    { courseId: 'crs-4', courseCode: 'CS-405', courseName: 'Networks', credits: 4, section: 'Section A' }
  ]; // Total = 24 credits
  const overResRegular = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: regularTeacher.id,
      teacherName: regularTeacher.name,
      teacherEmail: regularTeacher.email,
      teacherType: 'REGULAR_TEACHER',
      departmentId: csDeptId,
      selectedCourses: overLimitCoursesRegular
    })
  });
  assert(overResRegular.status === 400 && !overResRegular.data.success, 'Regular teacher exceeding 22 credits (24 credits) is correctly blocked with 400 error');

  // Test 3b: Regular Teacher selects multiple sections of 2-credit lab course and 3-credit + 4-credit courses
  // e.g.:
  // - CS-101 (Section A) - 3 Credits
  // - CS-101 (Section B) - 3 Credits ("pressed again")
  // - CS-101L (Section A) - 2 Credits
  // - CS-101L (Section B) - 2 Credits (another 2-credit course section)
  // - CS-201 (Section A) - 4 Credits
  // - CS-302 (Section A) - 4 Credits
  // Total = 3 + 3 + 2 + 2 + 4 + 4 = 18 Credits (<= 22 limit)
  const validRegularCourses = [
    { courseId: 'crs-101', courseCode: 'CS-101', courseName: 'Introduction to Programming', credits: 3, section: 'Section A' },
    { courseId: 'crs-101', courseCode: 'CS-101', courseName: 'Introduction to Programming', credits: 3, section: 'Section B' },
    { courseId: 'crs-101L', courseCode: 'CS-101L', courseName: 'Computer Programming Lab', credits: 2, section: 'Section A' },
    { courseId: 'crs-101L', courseCode: 'CS-101L', courseName: 'Computer Programming Lab', credits: 2, section: 'Section B' },
    { courseId: 'crs-201', courseCode: 'CS-201', courseName: 'Data Structures & Algorithms', credits: 4, section: 'Section A' },
    { courseId: 'crs-302', courseCode: 'CS-302', courseName: 'Database Management Systems', credits: 4, section: 'Section A' }
  ];
  const validResRegular = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: regularTeacher.id,
      teacherName: regularTeacher.name,
      teacherEmail: regularTeacher.email,
      teacherType: 'REGULAR_TEACHER',
      departmentId: csDeptId,
      selectedCourses: validRegularCourses,
      profileData: { specialization: 'Algorithms & AI', employmentType: 'Regular' }
    })
  });
  assert(validResRegular.status === 201 && validResRegular.data.success, 'Regular teacher with multiple sections & 2, 3, 4 credits (Total 18 Credits) submitted successfully');
  const regularRequestId = validResRegular.data.data.id;

  // 4. Test Automatic Department HOD Routing
  console.log('\n--- 4. Department HOD Routing & Department Isolation ---');
  // Check that the request automatically went to Computer Science department HOD
  const csHodRes = await api('/api/teacher-requests', {
    headers: {
      'x-user-role': 'HOD',
      'x-department-id': csDeptId,
      'x-user-name': 'Dr. Fatima Zahra (HOD CS)'
    }
  });
  assert(csHodRes.status === 200 && csHodRes.data.success, 'CS HOD successfully retrieves departmental requests');
  const csRequests = csHodRes.data.data;
  const foundVisitingInCS = csRequests.find(r => r.id === visitingRequestId);
  const foundRegularInCS = csRequests.find(r => r.id === regularRequestId);
  assert(!!foundVisitingInCS, `Visiting Teacher request was automatically routed to CS HOD (Request ID: ${visitingRequestId})`);
  assert(!!foundRegularInCS, `Regular Teacher request was automatically routed to CS HOD (Request ID: ${regularRequestId})`);
  assert(foundRegularInCS?.selectedCourses?.length === 6, `CS HOD receives all 6 course offerings/sections with sections preserved`);
  assert(foundRegularInCS?.totalCredits === 18, `CS HOD verifies exact credit load (18 credits)`);

  // Verify Department Isolation: English HOD should NOT see CS requests!
  const engHodRes = await api('/api/teacher-requests', {
    headers: {
      'x-user-role': 'HOD',
      'x-department-id': 'dept-eng',
      'x-user-name': 'Dr. Ayesha Siddiqa (HOD English)'
    }
  });
  assert(engHodRes.status === 200, 'English HOD retrieves departmental requests');
  const engRequests = engHodRes.data.data;
  const csInEng = engRequests.find(r => r.id === regularRequestId || r.id === visitingRequestId);
  assert(!csInEng, 'Department Isolation Verified: English HOD CANNOT see Computer Science teacher requests');

  // English HOD attempts to approve CS request -> MUST BE FORBIDDEN (403)
  const illegalApprove = await api(`/api/teacher-requests/${regularRequestId}/approve`, {
    method: 'PATCH',
    headers: {
      'x-user-role': 'HOD',
      'x-department-id': 'dept-eng',
      'x-user-name': 'Dr. Ayesha Siddiqa (HOD English)'
    }
  });
  assert(illegalApprove.status === 403, 'Cross-department approval blocked: English HOD cannot approve CS teacher request');

  // CS HOD approves the Regular Teacher request
  console.log('\n--- 5. CS HOD Review & Approval Workflow ---');
  const csApproveRes = await api(`/api/teacher-requests/${regularRequestId}/approve`, {
    method: 'PATCH',
    headers: {
      'x-user-role': 'HOD',
      'x-department-id': csDeptId,
      'x-user-name': 'Dr. Fatima Zahra (HOD CS)'
    }
  });
  assert(csApproveRes.status === 200 && csApproveRes.data.success, 'CS HOD approves Regular Teacher request successfully');

  // Verify Teacher user record is now Approved
  const checkTeacherUser = await api(`/api/users/${regularTeacher.id}`);
  assert(
    checkTeacherUser.data?.data?.enrollmentStatus === 'Approved' ||
    checkTeacherUser.data?.enrollmentStatus === 'Approved',
    'Teacher enrollmentStatus is now marked as Approved'
  );

  // CS HOD approves the Visiting Teacher request
  const csApproveVisiting = await api(`/api/teacher-requests/${visitingRequestId}/approve`, {
    method: 'PATCH',
    headers: {
      'x-user-role': 'HOD',
      'x-department-id': csDeptId,
      'x-user-name': 'Dr. Fatima Zahra (HOD CS)'
    }
  });
  assert(csApproveVisiting.status === 200 && csApproveVisiting.data.success, 'CS HOD approves Visiting Teacher request successfully');

  console.log('\n================================================================');
  console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

run().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
