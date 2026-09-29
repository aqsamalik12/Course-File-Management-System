// Comprehensive automated test suite for all 10 scenarios requested by USER
const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('========================================================================');
  console.log('STARTING STRICT TEACHER ASSIGNMENT & HOD ROUTING VERIFICATION SUITE');
  console.log('========================================================================\n');

  let passedCount = 0;
  let totalTests = 10;

  const EXPECTED_ERR_MSG = "Invalid selection. This Department, Section, or Course is not assigned to your account. Please select an authorized option.";

  // Teacher Ahmed Khan
  const TEACHER_AHMED_ID = 'usr-teacher-ahmed';
  const TEACHER_AHMED_NAME = 'Ahmed Khan';
  const TEACHER_AHMED_EMAIL = 'teacher.ahmed@ue.edu.pk';

  // Computer Science Details
  const CS_DEPT_ID = 'dept-1790466035357';
  const CS_DEPT_NAME = 'Computer Science';
  const CS_SEC_5A_ID = 'sec-cs-5a';
  const CS_SEC_5A_NAME = 'BSCS-5A';
  const CS_COURSE_AI_ID = 'c-cs-ai';
  const CS_COURSE_AI_CODE = 'CS-401';
  const CS_COURSE_AI_NAME = 'Artificial Intelligence';
  const CS_HOD_ID = 'usr-hod-1790490218261'; // Dr. Asif

  // Business Administration Details
  const BBA_DEPT_ID = 'dept-business-admin';
  const BBA_DEPT_NAME = 'Business Administration';
  const BBA_SEC_3A_ID = 'sec-bba-3a';
  const BBA_SEC_3A_NAME = 'BBA-3A';
  const BBA_COURSE_MGT_ID = 'c-bba-mgt';
  const BBA_COURSE_MGT_CODE = 'MGT-101';
  const BBA_COURSE_MGT_NAME = 'Principles of Management';
  const BBA_HOD_ID = 'usr-hod-business'; // Dr. Tariq Mahmood

  // -------------------------------------------------------------------------
  // TEST 1: Teacher selects valid Department + Section + Course -> Validate & Submit
  // -------------------------------------------------------------------------
  console.log('[TEST 1] Teacher selects valid Department (CS) + Section (BSCS-5A) + Course (AI)...');
  try {
    const valRes = await fetch(`${BASE_URL}/teacher-assignments/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: TEACHER_AHMED_ID,
        departmentId: CS_DEPT_ID,
        sectionId: CS_SEC_5A_ID,
        courseId: CS_COURSE_AI_ID
      })
    });
    const valData = await valRes.json();
    if (valRes.status === 200 && valData.isValid === true) {
      console.log('  -> Validation endpoint returned 200 OK & isValid: true');

      // Now create teacher request with valid combo
      const reqRes = await fetch(`${BASE_URL}/teacher-requests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: TEACHER_AHMED_ID,
          teacherName: TEACHER_AHMED_NAME,
          teacherEmail: TEACHER_AHMED_EMAIL,
          departmentId: CS_DEPT_ID,
          departmentName: CS_DEPT_NAME,
          sectionId: CS_SEC_5A_ID,
          sectionName: CS_SEC_5A_NAME,
          courseId: CS_COURSE_AI_ID,
          courseName: CS_COURSE_AI_NAME,
          selectedCourses: [{
            courseId: CS_COURSE_AI_ID,
            courseCode: CS_COURSE_AI_CODE,
            courseTitle: CS_COURSE_AI_NAME,
            credits: 3,
            section: CS_SEC_5A_NAME
          }],
          totalCredits: 3,
          teacherType: 'REGULAR_TEACHER',
          campusId: 'camp-attock',
          campusName: 'Attock Campus'
        })
      });
      const reqData = await reqRes.json();
      if ((reqRes.status === 201 || reqRes.status === 200) && reqData.success === true && reqData.data?.hodId === CS_HOD_ID) {
        console.log('  -> PASSED: Request created successfully and routed to CS HOD (' + reqData.data.hodId + ')');
        passedCount++;
      } else {
        console.error('  -> FAILED: Request creation failed or wrong HOD', reqRes.status, reqData);
      }
    } else {
      console.error('  -> FAILED: Validation failed for authorized assignment', valData);
    }
  } catch (err) {
    console.error('  -> FAILED with error:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 2: Teacher tries unauthorized Department
  // -------------------------------------------------------------------------
  console.log('\n[TEST 2] Teacher tries unauthorized Department (dept-math for Teacher Ahmed)...');
  try {
    const valRes = await fetch(`${BASE_URL}/teacher-assignments/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: TEACHER_AHMED_ID,
        departmentId: 'dept-math-unauthorized', // Unauthorized
        sectionId: CS_SEC_5A_ID,
        courseId: CS_COURSE_AI_ID
      })
    });
    const valData = await valRes.json();
    if (valRes.status === 400 && valData.message === EXPECTED_ERR_MSG) {
      console.log('  -> PASSED: Unauthorized Department rejected with exact message:');
      console.log('     "' + valData.message + '"');
      passedCount++;
    } else {
      console.error('  -> FAILED: Expected 400 with strict error message, got:', valRes.status, valData);
    }
  } catch (err) {
    console.error('  -> FAILED with error:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 3: Teacher modifies API payload to another Department (Postman / DevTools bypass)
  // -------------------------------------------------------------------------
  console.log('\n[TEST 3] Teacher modifies API payload to another Department (Direct POST /api/teacher-requests)...');
  try {
    const bypassRes = await fetch(`${BASE_URL}/teacher-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: TEACHER_AHMED_ID,
        teacherName: TEACHER_AHMED_NAME,
        teacherEmail: TEACHER_AHMED_EMAIL,
        departmentId: 'dept-math-unauthorized', // Forged department
        departmentName: 'Mathematics',
        sectionId: CS_SEC_5A_ID,
        sectionName: CS_SEC_5A_NAME,
        courseId: CS_COURSE_AI_ID,
        courseName: CS_COURSE_AI_NAME,
        selectedCourses: [{
          courseId: CS_COURSE_AI_ID,
          courseCode: CS_COURSE_AI_CODE,
          courseTitle: CS_COURSE_AI_NAME,
          credits: 3,
          section: CS_SEC_5A_NAME
        }],
        totalCredits: 3,
        teacherType: 'REGULAR_TEACHER',
        campusId: 'camp-attock',
        campusName: 'Attock Campus'
      })
    });
    const bypassData = await bypassRes.json();
    if (bypassRes.status === 400 && bypassData.message === EXPECTED_ERR_MSG) {
      console.log('  -> PASSED: Backend rejected forged department with status 400:');
      console.log('     "' + bypassData.message + '"');
      passedCount++;
    } else {
      console.error('  -> FAILED: Backend did not reject forged department payload:', bypassRes.status, bypassData);
    }
  } catch (err) {
    console.error('  -> FAILED with error:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 4: Teacher selects valid Department but unauthorized Section
  // -------------------------------------------------------------------------
  console.log('\n[TEST 4] Teacher selects valid Department (CS) but unauthorized Section (sec-cs-7a for Ahmed)...');
  try {
    const valRes = await fetch(`${BASE_URL}/teacher-assignments/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: TEACHER_AHMED_ID,
        departmentId: CS_DEPT_ID,
        sectionId: 'sec-cs-7a', // Assigned to Ali, NOT Ahmed
        courseId: CS_COURSE_AI_ID
      })
    });
    const valData = await valRes.json();
    if (valRes.status === 400 && valData.message === EXPECTED_ERR_MSG) {
      console.log('  -> PASSED: Unauthorized Section rejected with exact message:');
      console.log('     "' + valData.message + '"');
      passedCount++;
    } else {
      console.error('  -> FAILED: Expected 400 with strict error message, got:', valRes.status, valData);
    }
  } catch (err) {
    console.error('  -> FAILED with error:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 5: Teacher selects valid Department + Section but unauthorized Course
  // -------------------------------------------------------------------------
  console.log('\n[TEST 5] Teacher selects valid Department (CS) + Section (BSCS-5A) but unauthorized Course (Calculus)...');
  try {
    const valRes = await fetch(`${BASE_URL}/teacher-assignments/validate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: TEACHER_AHMED_ID,
        departmentId: CS_DEPT_ID,
        sectionId: CS_SEC_5A_ID,
        courseId: 'crs-math-calc' // Unauthorized course
      })
    });
    const valData = await valRes.json();
    if (valRes.status === 400 && valData.message === EXPECTED_ERR_MSG) {
      console.log('  -> PASSED: Unauthorized Course rejected with exact message:');
      console.log('     "' + valData.message + '"');
      passedCount++;
    } else {
      console.error('  -> FAILED: Expected 400 with strict error message, got:', valRes.status, valData);
    }
  } catch (err) {
    console.error('  -> FAILED with error:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 6: Teacher submits valid Computer Science request -> Only CS HOD receives it
  // -------------------------------------------------------------------------
  console.log('\n[TEST 6] Verifying CS Request routing ONLY to CS HOD...');
  try {
    const res = await fetch(`${BASE_URL}/teacher-requests`);
    const data = await res.json();
    const allReqs = data.data || data.requests || [];
    const csRequests = allReqs.filter(r => r.departmentId === CS_DEPT_ID);
    const csReq = csRequests.find(r => r.teacherId === TEACHER_AHMED_ID);

    if (csReq && csReq.hodId === CS_HOD_ID) {
      console.log('  -> PASSED: CS Request hodId is strictly CS HOD (' + csReq.hodId + ')');
      passedCount++;
    } else {
      console.error('  -> FAILED: CS request not routed to CS HOD:', csReq);
    }
  } catch (err) {
    console.error('  -> FAILED with error:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 7: Teacher submits Business Administration request -> Only BBA HOD receives it
  // -------------------------------------------------------------------------
  console.log('\n[TEST 7] Submitting BBA request, verifying ONLY BBA HOD receives it...');
  try {
    // Submit BBA Request
    const bbaReqRes = await fetch(`${BASE_URL}/teacher-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: TEACHER_AHMED_ID,
        teacherName: TEACHER_AHMED_NAME,
        teacherEmail: TEACHER_AHMED_EMAIL,
        departmentId: BBA_DEPT_ID,
        departmentName: BBA_DEPT_NAME,
        sectionId: BBA_SEC_3A_ID,
        sectionName: BBA_SEC_3A_NAME,
        courseId: BBA_COURSE_MGT_ID,
        courseName: BBA_COURSE_MGT_NAME,
        selectedCourses: [{
          courseId: BBA_COURSE_MGT_ID,
          courseCode: BBA_COURSE_MGT_CODE,
          courseTitle: BBA_COURSE_MGT_NAME,
          credits: 3,
          section: BBA_SEC_3A_NAME
        }],
        totalCredits: 3,
        teacherType: 'REGULAR_TEACHER',
        campusId: 'camp-attock',
        campusName: 'Attock Campus'
      })
    });
    const bbaReqData = await bbaReqRes.json();

    if ((bbaReqRes.status === 201 || bbaReqRes.status === 200) && bbaReqData.data?.hodId === BBA_HOD_ID) {
      console.log('  -> PASSED: BBA Request routed strictly to BBA HOD: ' + bbaReqData.data.hodId + ' (' + bbaReqData.data.hodName + ')');
      passedCount++;
    } else {
      console.error('  -> FAILED: BBA request not routed to BBA HOD:', bbaReqRes.status, bbaReqData);
    }
  } catch (err) {
    console.error('  -> FAILED with error:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 8: HOD Isolation -> CS HOD sees only CS; BBA HOD sees only BBA
  // -------------------------------------------------------------------------
  console.log('\n[TEST 8] Verifying Department HOD Isolation...');
  try {
    const res = await fetch(`${BASE_URL}/teacher-requests`);
    const data = await res.json();
    const allRequests = data.data || data.requests || [];

    // Filter as CS HOD would see
    const csHodVisible = allRequests.filter(r => r.hodId === CS_HOD_ID || r.departmentId === CS_DEPT_ID);
    // Filter as BBA HOD would see
    const bbaHodVisible = allRequests.filter(r => r.hodId === BBA_HOD_ID || r.departmentId === BBA_DEPT_ID);

    const csHasOtherDept = csHodVisible.some(r => r.departmentId !== CS_DEPT_ID);
    const bbaHasOtherDept = bbaHodVisible.some(r => r.departmentId !== BBA_DEPT_ID);

    if (!csHasOtherDept && !bbaHasOtherDept && csHodVisible.length > 0 && bbaHodVisible.length > 0) {
      console.log('  -> PASSED: CS HOD sees ' + csHodVisible.length + ' CS requests (0 other depts).');
      console.log('             BBA HOD sees ' + bbaHodVisible.length + ' BBA requests (0 other depts).');
      passedCount++;
    } else {
      console.error('  -> FAILED: Department request leakage or empty requests detected!');
    }
  } catch (err) {
    console.error('  -> FAILED with error:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 9: Admin changes / deactivates teacher assignment -> Immediate revocation
  // -------------------------------------------------------------------------
  console.log('\n[TEST 9] Admin deactivates teacher assignment -> Verify immediate revocation...');
  try {
    // Find an active assignment for Ahmed in BBA
    const myAsgnRes = await fetch(`${BASE_URL}/teacher-assignments?teacherId=${TEACHER_AHMED_ID}`);
    const myAsgnData = await myAsgnRes.json();
    const bbaAssignment = (myAsgnData.data || []).find(a => a.departmentId === BBA_DEPT_ID && a.active);

    if (bbaAssignment) {
      // Admin deactivates the assignment
      const patchRes = await fetch(`${BASE_URL}/teacher-assignments/${bbaAssignment.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: false })
      });
      const patchData = await patchRes.json();

      // Now teacher tries to validate or submit with deactivated assignment
      const testValRes = await fetch(`${BASE_URL}/teacher-assignments/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          teacherId: TEACHER_AHMED_ID,
          departmentId: BBA_DEPT_ID,
          sectionId: BBA_SEC_3A_ID,
          courseId: BBA_COURSE_MGT_ID
        })
      });
      const testValData = await testValRes.json();

      if (testValRes.status === 400 && testValData.message === EXPECTED_ERR_MSG) {
        console.log('  -> PASSED: Deactivated assignment immediately rejected with exact message:');
        console.log('     "' + testValData.message + '"');

        // Restore assignment to active for further use
        await fetch(`${BASE_URL}/teacher-assignments/${bbaAssignment.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ active: true })
        });

        passedCount++;
      } else {
        console.error('  -> FAILED: Deactivated assignment was not rejected:', testValRes.status, testValData);
      }
    } else {
      console.error('  -> FAILED: Could not locate BBA assignment to deactivate. Available:', myAsgnData.data);
    }
  } catch (err) {
    console.error('  -> FAILED with error:', err.message);
  }

  // -------------------------------------------------------------------------
  // TEST 10: Teacher attempts to bypass frontend restrictions through Course File API
  // -------------------------------------------------------------------------
  console.log('\n[TEST 10] Teacher attempts to upload course file with unauthorized combination via direct API...');
  try {
    const fileRes = await fetch(`${BASE_URL}/course-files/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        courseId: 'crs-math-calc', // Unauthorized
        courseCode: 'MATH-201',
        courseTitle: 'Calculus',
        departmentId: 'dept-math',
        departmentName: 'Mathematics',
        section: 'BSMATH-1A',
        teacherId: TEACHER_AHMED_ID,
        teacherName: TEACHER_AHMED_NAME,
        teacherRole: 'REGULAR_TEACHER',
        title: 'Unauthorized Math Course File',
        status: 'Submitted'
      })
    });
    const fileData = await fileRes.json();

    if ((fileRes.status === 400 || fileRes.status === 403) && fileData.message === EXPECTED_ERR_MSG) {
      console.log(`  -> PASSED: Course file upload rejected with status ${fileRes.status} and exact message:`);
      console.log('     "' + fileData.message + '"');
      passedCount++;
    } else {
      console.error('  -> FAILED: Unauthorized course file upload was not rejected:', fileRes.status, fileData);
    }
  } catch (err) {
    console.error('  -> FAILED with error:', err.message);
  }

  console.log('\n========================================================================');
  console.log(`TEST SUITE COMPLETE: ${passedCount} / ${totalTests} TESTS PASSED`);
  console.log('========================================================================');

  if (passedCount === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
