import assert from 'assert';

const BASE_URL = 'http://localhost:5000';

async function run() {
  console.log('===============================================================');
  console.log('STARTING COMPLETE END-TO-END WORKFLOW & ACCESS ISOLATION TESTS');
  console.log('===============================================================');

  // Helper fetch wrapper
  async function api(path, options = {}) {
    const res = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const json = await res.json().catch(() => null);
    return { status: res.status, ok: res.ok, data: json };
  }

  // TEST 1: Admin verifies / creates Attock Campus
  console.log('\n[TEST 1] Admin ensures Attock Campus exists...');
  const campusesRes = await api('/api/campuses');
  assert(campusesRes.ok && campusesRes.data.success, 'Failed to fetch campuses');
  let attockCampus = campusesRes.data.data.find(c => c.name.toLowerCase().includes('attock'));
  if (!attockCampus) {
    const createCampRes = await api('/api/campuses', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Attock Campus',
        code: 'UE-ATK',
        city: 'Attock',
        address: 'University Road, Attock City',
        status: 'Active'
      })
    });
    assert(createCampRes.ok, 'Failed to create Attock Campus');
    attockCampus = createCampRes.data.data;
  }
  console.log('✓ Attock Campus verified:', attockCampus.id, attockCampus.name);

  // TEST 2: Admin creates Computer Science Department under Attock Campus
  console.log('\n[TEST 2] Admin creates Computer Science Department under Attock Campus...');
  let deptCs = null;
  const deptsRes = await api(`/api/departments?campusId=${attockCampus.id}`);
  deptCs = (deptsRes.data.data || []).find(d => d.name === 'Computer Science');
  if (!deptCs) {
    const createCsRes = await api('/api/departments', {
      method: 'POST',
      body: JSON.stringify({
        campusId: attockCampus.id,
        name: 'Computer Science',
        code: 'CS',
        status: 'Active'
      })
    });
    assert(createCsRes.ok, `Failed to create CS Dept: ${JSON.stringify(createCsRes.data)}`);
    deptCs = createCsRes.data.data;
  }
  console.log('✓ CS Department verified:', deptCs.id, deptCs.name, 'campusId:', deptCs.campusId);

  // TEST 3: Admin creates Mathematics Department under Attock Campus
  console.log('\n[TEST 3] Admin creates Mathematics Department under Attock Campus...');
  let deptMath = (deptsRes.data.data || []).find(d => d.name === 'Mathematics');
  if (!deptMath) {
    const createMathRes = await api('/api/departments', {
      method: 'POST',
      body: JSON.stringify({
        campusId: attockCampus.id,
        name: 'Mathematics',
        code: 'MATH',
        status: 'Active'
      })
    });
    assert(createMathRes.ok, `Failed to create Math Dept: ${JSON.stringify(createMathRes.data)}`);
    deptMath = createMathRes.data.data;
  }
  console.log('✓ Mathematics Department verified:', deptMath.id, deptMath.name, 'campusId:', deptMath.campusId);

  // TEST 4: Admin assigns Dr. Asif → Attock → Computer Science
  console.log('\n[TEST 4] Admin assigns Dr. Asif → Attock → Computer Science with Email & Password...');
  const assignAsifRes = await api('/api/hod-assignments', {
    method: 'POST',
    body: JSON.stringify({
      campusId: attockCampus.id,
      departmentId: deptCs.id,
      hodName: 'Dr. Asif',
      email: 'hod.cs.asif@ue.edu.pk',
      password: 'passwordAsif123',
      status: 'Active',
      academicSession: 'Fall 2026'
    })
  });
  assert(assignAsifRes.ok, `Failed to assign Dr. Asif: ${JSON.stringify(assignAsifRes.data)}`);
  const asifAssignment = assignAsifRes.data.data;
  const drAsifId = asifAssignment.hodId;
  console.log('✓ Dr. Asif assigned as HOD CS. User ID:', drAsifId, 'Email: hod.cs.asif@ue.edu.pk');

  // TEST 5: Admin assigns Dr. Abu Zarr → Attock → Mathematics
  console.log('\n[TEST 5] Admin assigns Dr. Abu Zarr → Attock → Mathematics with Email & Password...');
  const assignAbuZarrRes = await api('/api/hod-assignments', {
    method: 'POST',
    body: JSON.stringify({
      campusId: attockCampus.id,
      departmentId: deptMath.id,
      hodName: 'Dr. Abu Zarr',
      email: 'hod.math.abuzarr@ue.edu.pk',
      password: 'passwordAbuZarr123',
      status: 'Active',
      academicSession: 'Fall 2026'
    })
  });
  assert(assignAbuZarrRes.ok, `Failed to assign Dr. Abu Zarr: ${JSON.stringify(assignAbuZarrRes.data)}`);
  const abuZarrAssignment = assignAbuZarrRes.data.data;
  const drAbuZarrId = abuZarrAssignment.hodId;
  console.log('✓ Dr. Abu Zarr assigned as HOD Math. User ID:', drAbuZarrId, 'Email: hod.math.abuzarr@ue.edu.pk');

  // TEST 6: Login as Dr. Asif
  console.log('\n[TEST 6] Login as Dr. Asif and verify automatic scope resolution...');
  const loginAsif = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'hod.cs.asif@ue.edu.pk',
      password: 'passwordAsif123'
    })
  });
  assert(loginAsif.ok && loginAsif.data.success, 'Dr. Asif login failed');
  assert(loginAsif.data.user.role === 'HOD', 'Role is not HOD');
  assert(loginAsif.data.user.campusId === attockCampus.id, 'Campus ID does not match Attock');
  assert(loginAsif.data.user.departmentId === deptCs.id, 'Department ID does not match Computer Science');
  const asifToken = loginAsif.data.token;
  console.log('✓ Dr. Asif logged in successfully!');
  console.log('  Scope resolved: Campus =', loginAsif.data.user.campus, 'Department =', loginAsif.data.user.departmentName);

  // TEST 7: Login as Dr. Abu Zarr
  console.log('\n[TEST 7] Login as Dr. Abu Zarr and verify automatic scope resolution...');
  const loginAbuZarr = await api('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'hod.math.abuzarr@ue.edu.pk',
      password: 'passwordAbuZarr123'
    })
  });
  assert(loginAbuZarr.ok && loginAbuZarr.data.success, 'Dr. Abu Zarr login failed');
  assert(loginAbuZarr.data.user.role === 'HOD', 'Role is not HOD');
  assert(loginAbuZarr.data.user.campusId === attockCampus.id, 'Campus ID does not match Attock');
  assert(loginAbuZarr.data.user.departmentId === deptMath.id, 'Department ID does not match Mathematics');
  const abuZarrToken = loginAbuZarr.data.token;
  console.log('✓ Dr. Abu Zarr logged in successfully!');
  console.log('  Scope resolved: Campus =', loginAbuZarr.data.user.campus, 'Department =', loginAbuZarr.data.user.departmentName);

  // TEST 8: Teacher cascading lookup for CS
  console.log('\n[TEST 8] Teacher cascading lookup: Attock + Computer Science...');
  const lookupCsHod = await api(`/api/hod-assignments/lookup?campusId=${attockCampus.id}&departmentId=${deptCs.id}`);
  assert(lookupCsHod.ok && lookupCsHod.data.success, 'Lookup for CS HOD failed');
  assert(lookupCsHod.data.data.hodId === drAsifId, `Expected Dr. Asif (${drAsifId}), got: ${lookupCsHod.data.data.hodId}`);
  assert(lookupCsHod.data.data.hodName === 'Dr. Asif', 'Expected Dr. Asif name');
  console.log('✓ Cascading resolution returns Dr. Asif for Attock + Computer Science');

  // TEST 9: Submit CS Teacher Request -> Dr. Asif
  console.log('\n[TEST 9] Create and submit CS Teacher Request...');
  const csTeacherId = `usr-teacher-cs-${Date.now()}`;
  const submitCsReq = await api('/api/teacher-requests', {
    method: 'POST',
    headers: {
      'x-user-id': csTeacherId,
      'x-user-role': 'REGULAR_TEACHER'
    },
    body: JSON.stringify({
      teacherId: csTeacherId,
      teacherName: 'Zahid Khan (CS Teacher)',
      teacherEmail: 'zahid.cs@ue.edu.pk',
      teacherType: 'REGULAR_TEACHER',
      campusId: attockCampus.id,
      campusName: attockCampus.name,
      departmentId: deptCs.id,
      hodId: drAsifId,
      selectedCourses: [
        { courseId: 'c-cs-101', courseCode: 'CS-101', courseName: 'Programming Fundamentals', credits: 4, section: 'Section A' },
        { courseId: 'c-cs-102', courseCode: 'CS-102', courseName: 'Object Oriented Programming', credits: 4, section: 'Section A' }
      ]
    })
  });
  assert(submitCsReq.ok && submitCsReq.data.success, `CS Request submission failed: ${JSON.stringify(submitCsReq.data)}`);
  const csRequestId = submitCsReq.data.data.id;
  console.log('✓ CS Teacher Request submitted successfully! ID:', csRequestId);

  // TEST 10: Verify Dr. Abu Zarr cannot see CS Request
  console.log('\n[TEST 10] Verify Dr. Abu Zarr (Math HOD) CANNOT see CS Teacher Request...');
  const abuZarrRequests = await api('/api/teacher-requests', {
    headers: {
      'Authorization': `Bearer ${abuZarrToken}`,
      'x-user-id': drAbuZarrId,
      'x-user-role': 'HOD',
      'x-department-id': deptMath.id
    }
  });
  assert(abuZarrRequests.ok, 'Failed to fetch Dr. Abu Zarr requests');
  const foundCsInAbuZarr = abuZarrRequests.data.data.find(r => r.id === csRequestId);
  assert(!foundCsInAbuZarr, 'SECURITY BREACH: CS Request leaked into Math HOD list!');
  console.log('✓ Confirmed: CS Request is NOT visible to Dr. Abu Zarr (Math HOD)!');

  // Verify Dr. Asif CAN see CS Request
  const asifRequests = await api('/api/teacher-requests', {
    headers: {
      'Authorization': `Bearer ${asifToken}`,
      'x-user-id': drAsifId,
      'x-user-role': 'HOD',
      'x-department-id': deptCs.id
    }
  });
  assert(asifRequests.ok, 'Failed to fetch Dr. Asif requests');
  const foundCsInAsif = asifRequests.data.data.find(r => r.id === csRequestId);
  assert(foundCsInAsif, 'CS Request NOT found in Dr. Asif list!');
  console.log('✓ Confirmed: CS Request is visible to Dr. Asif (CS HOD)!');

  // TEST 11: Create Mathematics teacher request -> Dr. Abu Zarr
  console.log('\n[TEST 11] Create and submit Mathematics Teacher Request...');
  const mathTeacherId = `usr-teacher-math-${Date.now()}`;
  const submitMathReq = await api('/api/teacher-requests', {
    method: 'POST',
    headers: {
      'x-user-id': mathTeacherId,
      'x-user-role': 'REGULAR_TEACHER'
    },
    body: JSON.stringify({
      teacherId: mathTeacherId,
      teacherName: 'Bilal Ahmad (Math Teacher)',
      teacherEmail: 'bilal.math@ue.edu.pk',
      teacherType: 'REGULAR_TEACHER',
      campusId: attockCampus.id,
      campusName: attockCampus.name,
      departmentId: deptMath.id,
      hodId: drAbuZarrId,
      selectedCourses: [
        { courseId: 'c-mth-101', courseCode: 'MTH-101', courseName: 'Calculus I', credits: 3, section: 'Section A' },
        { courseId: 'c-mth-102', courseCode: 'MTH-102', courseName: 'Linear Algebra', credits: 3, section: 'Section A' }
      ]
    })
  });
  assert(submitMathReq.ok && submitMathReq.data.success, `Math Request submission failed: ${JSON.stringify(submitMathReq.data)}`);
  const mathRequestId = submitMathReq.data.data.id;
  console.log('✓ Mathematics Teacher Request submitted successfully! ID:', mathRequestId);

  // TEST 12: Verify Dr. Asif cannot see Mathematics Request
  console.log('\n[TEST 12] Verify Dr. Asif (CS HOD) CANNOT see Mathematics Teacher Request...');
  const asifRequestsCheck = await api('/api/teacher-requests', {
    headers: {
      'Authorization': `Bearer ${asifToken}`,
      'x-user-id': drAsifId,
      'x-user-role': 'HOD',
      'x-department-id': deptCs.id
    }
  });
  const foundMathInAsif = asifRequestsCheck.data.data.find(r => r.id === mathRequestId);
  assert(!foundMathInAsif, 'SECURITY BREACH: Mathematics Request leaked into CS HOD list!');
  console.log('✓ Confirmed: Mathematics Request is NOT visible to Dr. Asif (CS HOD)!');

  // Verify Dr. Abu Zarr CAN see Mathematics Request
  const abuZarrRequestsCheck = await api('/api/teacher-requests', {
    headers: {
      'Authorization': `Bearer ${abuZarrToken}`,
      'x-user-id': drAbuZarrId,
      'x-user-role': 'HOD',
      'x-department-id': deptMath.id
    }
  });
  const foundMathInAbuZarr = abuZarrRequestsCheck.data.data.find(r => r.id === mathRequestId);
  assert(foundMathInAbuZarr, 'Mathematics Request NOT found in Dr. Abu Zarr list!');
  console.log('✓ Confirmed: Mathematics Request is visible to Dr. Abu Zarr (Math HOD)!');

  // TEST 13: Dr. Asif approves CS teacher
  console.log('\n[TEST 13] Dr. Asif approves CS teacher...');
  // Before approval: Course file upload must be locked
  const preApprovalUpload = await api('/api/course-files/upload', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: csTeacherId,
      teacherRole: 'REGULAR_TEACHER',
      courseCode: 'CS-101',
      title: 'Course Dossier'
    })
  });
  assert(preApprovalUpload.status === 403, 'Pre-approval course file upload was NOT locked!');
  console.log('✓ Course workflow locked prior to HOD approval (403 Forbidden verified)');

  const approveRes = await api(`/api/teacher-requests/${csRequestId}/approve`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${asifToken}`,
      'x-user-id': drAsifId,
      'x-user-role': 'HOD',
      'x-department-id': deptCs.id
    }
  });
  assert(approveRes.ok && approveRes.data.success, `Approval failed: ${JSON.stringify(approveRes.data)}`);
  assert(approveRes.data.data.status === 'Approved', 'Request status is not Approved');
  console.log('✓ CS Request Approved by Dr. Asif! Teacher registered.');

  // Post approval: Course workflow unlocked
  const postApprovalUpload = await api('/api/course-files/upload', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: csTeacherId,
      teacherRole: 'REGULAR_TEACHER',
      courseCode: 'CS-101',
      courseTitle: 'Programming Fundamentals',
      departmentId: deptCs.id,
      departmentName: deptCs.name,
      title: 'Programming Fundamentals Course Dossier'
    })
  });
  assert(postApprovalUpload.ok, `Post-approval course upload failed: ${JSON.stringify(postApprovalUpload.data)}`);
  console.log('✓ Course workflow UNLOCKED after HOD approval!');

  // TEST 14: Mathematics HOD tries to access / approve CS request -> 403 Forbidden
  console.log('\n[TEST 14] Mathematics HOD attempts to access CS request (Direct API test)...');
  const mathHodAccessCs = await api(`/api/teacher-requests/${csRequestId}`, {
    headers: {
      'Authorization': `Bearer ${abuZarrToken}`,
      'x-user-id': drAbuZarrId,
      'x-user-role': 'HOD',
      'x-department-id': deptMath.id
    }
  });
  assert(mathHodAccessCs.status === 403, `Expected 403 Forbidden, got ${mathHodAccessCs.status}`);
  console.log('✓ Blocked: Math HOD cannot view CS Request (403 Forbidden verified)');

  const mathHodApproveCs = await api(`/api/teacher-requests/${csRequestId}/approve`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${abuZarrToken}`,
      'x-user-id': drAbuZarrId,
      'x-user-role': 'HOD',
      'x-department-id': deptMath.id
    }
  });
  assert(mathHodApproveCs.status === 403, `Expected 403 Forbidden, got ${mathHodApproveCs.status}`);
  console.log('✓ Blocked: Math HOD cannot approve CS Request (403 Forbidden verified)');

  // TEST 15: CS HOD tries to access / approve Mathematics request -> 403 Forbidden
  console.log('\n[TEST 15] CS HOD attempts to access Mathematics request (Direct API test)...');
  const csHodAccessMath = await api(`/api/teacher-requests/${mathRequestId}`, {
    headers: {
      'Authorization': `Bearer ${asifToken}`,
      'x-user-id': drAsifId,
      'x-user-role': 'HOD',
      'x-department-id': deptCs.id
    }
  });
  assert(csHodAccessMath.status === 403, `Expected 403 Forbidden, got ${csHodAccessMath.status}`);
  console.log('✓ Blocked: CS HOD cannot view Mathematics Request (403 Forbidden verified)');

  const csHodApproveMath = await api(`/api/teacher-requests/${mathRequestId}/approve`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${asifToken}`,
      'x-user-id': drAsifId,
      'x-user-role': 'HOD',
      'x-department-id': deptCs.id
    }
  });
  assert(csHodApproveMath.status === 403, `Expected 403 Forbidden, got ${csHodApproveMath.status}`);
  console.log('✓ Blocked: CS HOD cannot approve Mathematics Request (403 Forbidden verified)');

  // TEST 16: Security Test - Manipulated request with mismatched Campus / Dept / HOD
  console.log('\n[TEST 16] Security Test: Submit mismatched Campus / Department / HOD...');
  // Scenario A: Attock + Mathematics with Dr. Asif (who belongs to CS)
  const spoofHodReq = await api('/api/teacher-requests', {
    method: 'POST',
    body: JSON.stringify({
      teacherId: `usr-spoof-${Date.now()}`,
      teacherName: 'Hacker Teacher',
      teacherEmail: 'spoof@ue.edu.pk',
      teacherType: 'REGULAR_TEACHER',
      campusId: attockCampus.id,
      departmentId: deptMath.id, // Math
      hodId: drAsifId,           // But sent Dr. Asif (CS HOD)!
      selectedCourses: [{ courseId: 'c-1', courseCode: 'X-1', credits: 3 }]
    })
  });
  assert(spoofHodReq.status === 400, `Expected 400 Bad Request for mismatched HOD, got ${spoofHodReq.status}`);
  console.log('✓ Blocked: Mismatched HOD rejected with 400:', spoofHodReq.data.message);

  // Scenario B: Attock Campus with Department belonging to Main Campus
  const mainCamp = campusesRes.data.data.find(c => c.id === 'camp-main' || c.name.toLowerCase().includes('main'));
  const deptsMainRes = await api(`/api/departments?campusId=${mainCamp?.id || 'camp-main'}`);
  const mainDept = deptsMainRes.data.data?.[0];
  if (mainDept) {
    const crossCampusReq = await api('/api/teacher-requests', {
      method: 'POST',
      body: JSON.stringify({
        teacherId: `usr-cross-${Date.now()}`,
        teacherName: 'Cross Campus Teacher',
        teacherEmail: 'cross@ue.edu.pk',
        teacherType: 'REGULAR_TEACHER',
        campusId: attockCampus.id, // Attock Campus
        departmentId: mainDept.id, // Department belonging to Main Campus!
        hodId: drAsifId,
        selectedCourses: [{ courseId: 'c-1', courseCode: 'X-1', credits: 3 }]
      })
    });
    assert(crossCampusReq.status === 400, `Expected 400 for cross-campus department, got ${crossCampusReq.status}`);
    console.log('✓ Blocked: Cross-campus department mismatch rejected with 400:', crossCampusReq.data.message);
  }

  // TEST 17: Admin creates New Campus, adds Department, assigns HOD, verifies full dynamic workflow
  console.log('\n[TEST 17] Future Scalability: Create New Campus, Department, HOD & repeat flow...');
  const newCampRes = await api('/api/campuses', {
    method: 'POST',
    body: JSON.stringify({
      name: `Rawalpindi Sub-Campus ${Date.now()}`,
      code: `UE-RWP-${Math.floor(Math.random() * 1000)}`,
      city: 'Rawalpindi',
      status: 'Active'
    })
  });
  assert(newCampRes.ok, `Failed to create new campus: ${JSON.stringify(newCampRes.data)}`);
  const dynCampus = newCampRes.data.data;
  console.log('✓ New dynamic campus created:', dynCampus.id, dynCampus.name);

  // Add department to new campus
  const dynDeptRes = await api('/api/departments', {
    method: 'POST',
    body: JSON.stringify({
      campusId: dynCampus.id,
      name: 'Software Engineering',
      code: 'SE',
      status: 'Active'
    })
  });
  assert(dynDeptRes.ok, `Failed to create department for new campus: ${JSON.stringify(dynDeptRes.data)}`);
  const dynDept = dynDeptRes.data.data;
  console.log('✓ New department created for dynamic campus:', dynDept.id, dynDept.name);

  // Assign HOD to new campus + department
  const dynHodRes = await api('/api/hod-assignments', {
    method: 'POST',
    body: JSON.stringify({
      campusId: dynCampus.id,
      departmentId: dynDept.id,
      hodName: 'Dr. Zeeshan',
      email: `hod.se.zeeshan.${Date.now()}@ue.edu.pk`,
      password: 'passwordZeeshan123',
      status: 'Active',
      academicSession: 'Fall 2026'
    })
  });
  assert(dynHodRes.ok, `Failed to assign HOD to dynamic campus: ${JSON.stringify(dynHodRes.data)}`);
  const dynHod = dynHodRes.data.data;
  console.log('✓ HOD assigned to dynamic campus + department:', dynHod.hodName, dynHod.hodEmail);

  // Verify lookup returns this HOD
  const dynLookup = await api(`/api/hod-assignments/lookup?campusId=${dynCampus.id}&departmentId=${dynDept.id}`);
  assert(dynLookup.ok && dynLookup.data.data.hodId === dynHod.hodId, 'Dynamic lookup failed');
  console.log('✓ Dynamic cascading lookup verified for new campus!');

  console.log('\n===============================================================');
  console.log('ALL 17 TESTS PASSED WITH 100% SUCCESS!');
  console.log('===============================================================');
}

run().catch((err) => {
  console.error('\n❌ TEST FAILED WITH EXCEPTION:', err);
  process.exit(1);
});
