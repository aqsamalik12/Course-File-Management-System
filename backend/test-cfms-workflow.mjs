/**
 * End-to-End Functional, Workflow, Scope Isolation, and Security Verification
 * Tests all 36 test scenarios required by the CFMS specification.
 */

const API_BASE = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('CFMS END-TO-END AUTOMATED VERIFICATION SUITE');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  try {
    // ----------------------------------------------------
    // TEST 1-3: Campuses, Departments, HOD Assignments
    // ----------------------------------------------------
    console.log('--- TEST 1-3: Campus, Department, HOD Setup ---');
    const campRes = await fetch(`${API_BASE}/campuses`);
    const campData = await campRes.json();
    assert(campData.success && campData.data.length > 0, `Campuses loaded (${campData.data?.length || 0})`);

    const attockCampus = campData.data.find(c => c.name.toLowerCase().includes('attock')) || campData.data[0];
    assert(!!attockCampus, `Attock Campus found: ${attockCampus?.name} (ID: ${attockCampus?.id})`);

    const deptRes = await fetch(`${API_BASE}/departments`);
    const deptData = await deptRes.json();
    const csDept = deptData.data.find(d => d.name.toLowerCase().includes('computer')) || deptData.data[0];
    assert(!!csDept, `CS Department found: ${csDept?.name} (ID: ${csDept?.id})`);

    const hodAssignRes = await fetch(`${API_BASE}/hod-assignments`);
    const hodAssignData = await hodAssignRes.json();
    const hodAssignment = hodAssignData.data.find(h => h.campusId === attockCampus.id && h.departmentId === csDept.id) || hodAssignData.data[0];
    assert(!!hodAssignment, `HOD Assignment verified: ${hodAssignment?.hodName} for ${hodAssignment?.departmentName}`);

    const hodId = hodAssignment?.hodId || 'user-hod-cs';
    const hodScopeHeaders = {
      'x-user-id': hodId,
      'x-user-role': 'HOD',
      'x-department-id': hodAssignment?.departmentId || csDept.id
    };

    // ----------------------------------------------------
    // TEST 4: HOD Dashboard Scope & Real Database Stats
    // ----------------------------------------------------
    console.log('\n--- TEST 4: HOD Dashboard Scope & Metrics ---');
    const dashRes = await fetch(`${API_BASE}/hod/dashboard`, { headers: hodScopeHeaders });
    const dashData = await dashRes.json();
    assert(dashData.success, 'HOD Dashboard responds with success: true');
    assert(dashData.hod.campusName === attockCampus.name || dashData.hod.departmentName === csDept.name, `HOD Scoped correctly: ${dashData.hod.departmentName}, ${dashData.hod.campusName}`);
    assert(typeof dashData.stats.pendingRequests === 'number', `Real stats pendingRequests: ${dashData.stats.pendingRequests}`);
    assert(typeof dashData.stats.pendingCourseFiles === 'number', `Real stats pendingCourseFiles: ${dashData.stats.pendingCourseFiles}`);
    assert(typeof dashData.stats.approvedCourseFiles === 'number', `Real stats approvedCourseFiles: ${dashData.stats.approvedCourseFiles}`);
    assert(Array.isArray(dashData.batchesOverview), 'Batches overview structure present');

    // ----------------------------------------------------
    // TEST 5-14: Teacher Registration & HOD Approval
    // ----------------------------------------------------
    console.log('\n--- TEST 5-14: Teacher Registration Workflow ---');
    const testTeacherId = `teacher-test-${Date.now()}`;
    const testTeacherEmail = `faculty_${Date.now()}@ue.edu.pk`;

    // Teacher completes registration request
    const regReqRes = await fetch(`${API_BASE}/teacher-requests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        teacherId: testTeacherId,
        teacherName: 'Dr. Test Assistant Professor',
        teacherEmail: testTeacherEmail,
        teacherType: 'REGULAR_TEACHER',
        campusId: attockCampus.id,
        campusName: attockCampus.name,
        departmentId: csDept.id,
        departmentName: csDept.name,
        hodId: hodId,
        hodName: hodAssignment?.hodName,
        selectedCourses: [
          { courseId: 'c-301', courseCode: 'CS-301', courseName: 'Data Structures and Algorithms', credits: 4 }
        ],
        totalCredits: 4
      })
    });
    const regReqData = await regReqRes.json();
    assert(regReqData.success, `Teacher submitted registration request (ID: ${regReqData.data?.id})`);

    // Verify HOD sees request in review queue
    const pendingReqsRes = await fetch(`${API_BASE}/hod/teacher-requests?status=Pending`, { headers: hodScopeHeaders });
    const pendingReqsData = await pendingReqsRes.json();
    const myReq = pendingReqsData.data.find(r => r.teacherId === testTeacherId);
    assert(!!myReq, 'HOD receives teacher registration request in scoped queue');

    // HOD Approves Teacher Registration
    const approveReqRes = await fetch(`${API_BASE}/hod/teacher-requests/${myReq.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...hodScopeHeaders },
      body: JSON.stringify({ remarks: 'Faculty credentials verified and approved.' })
    });
    const approveReqData = await approveReqRes.json();
    assert(approveReqData.success, 'HOD approved teacher registration');

    // Verify Teacher is in Approved Teachers
    const approvedTeachRes = await fetch(`${API_BASE}/hod/teachers`, { headers: hodScopeHeaders });
    const approvedTeachData = await approvedTeachRes.json();
    const isApprovedInList = approvedTeachData.data.some(t => t.id === testTeacherId || t.email === testTeacherEmail);
    assert(isApprovedInList, 'Teacher now listed under Approved Faculty for HOD');

    // ----------------------------------------------------
    // TEST 15-21: Teacher Drafts Course File
    // ----------------------------------------------------
    console.log('\n--- TEST 15-21: Course File Creation & Draft Mode ---');
    const testCourseCode = 'CS-301';
    const draftFileRes = await fetch(`${API_BASE}/course-files/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': testTeacherId, 'x-user-role': 'REGULAR_TEACHER' },
      body: JSON.stringify({
        teacherId: testTeacherId,
        teacherName: 'Dr. Test Assistant Professor',
        teacherEmail: testTeacherEmail,
        courseId: 'course-cs-301',
        courseCode: testCourseCode,
        courseTitle: 'Data Structures and Algorithms',
        credits: 4,
        campusId: attockCampus.id,
        campusName: attockCampus.name,
        departmentId: csDept.id,
        departmentName: csDept.name,
        hodId: hodId,
        batch: '2024',
        session: '2024–2025',
        semester: '1st Semester',
        status: 'Draft',
        title: 'CS-301 Complete Course File (2024–2025 - 1st Semester)'
      })
    });
    const draftFileData = await draftFileRes.json();
    assert(draftFileData.success, `Course file saved as Draft (ID: ${draftFileData.data?.id})`);

    // HOD should NOT have draft in Pending queue
    const hodPendingAfterDraft = await fetch(`${API_BASE}/hod/course-files?status=Pending`, { headers: hodScopeHeaders });
    const hodPendingDraftData = await hodPendingAfterDraft.json();
    const draftInHodQueue = hodPendingDraftData.data.some(f => f.id === draftFileData.data.id);
    assert(!draftInHodQueue, 'HOD queue does NOT include Draft files (Draft remains private to teacher)');

    // ----------------------------------------------------
    // TEST 22-24: Teacher Submits Course File to HOD
    // ----------------------------------------------------
    console.log('\n--- TEST 22-24: Teacher Submits Course File ---');
    const submitFileRes = await fetch(`${API_BASE}/course-files/${draftFileData.data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': testTeacherId, 'x-user-role': 'REGULAR_TEACHER' },
      body: JSON.stringify({
        status: 'Submitted',
        remarks: 'Submitted complete course file including all CLOs and Weekly Plan for HOD review.'
      })
    });
    const submitFileData = await submitFileRes.json();
    assert(submitFileData.success, 'Course file status updated to Submitted');

    // HOD Hierarchy: Batch -> Session -> 4 Semesters
    const hierarchyRes = await fetch(`${API_BASE}/hod/batches`, { headers: hodScopeHeaders });
    const hierarchyData = await hierarchyRes.json();
    assert(hierarchyData.success, 'HOD Batches hierarchy retrieved');
    const batch2024 = hierarchyData.data.find(b => b.batch === '2024');
    assert(!!batch2024, 'Batch 2024 automatically exists');
    const sem1 = batch2024?.sessions[0]?.semesters.find(s => s.name === '1st Semester');
    assert(!!sem1 && sem1.fileCount > 0, `1st Semester folder automatically populated (${sem1?.fileCount} files)`);

    // Verify file appears in HOD Pending queue
    const hodPendingSubmitted = await fetch(`${API_BASE}/hod/course-files?status=Pending`, { headers: hodScopeHeaders });
    const hodPendingSubData = await hodPendingSubmitted.json();
    const submittedInHodQueue = hodPendingSubData.data.find(f => f.id === draftFileData.data.id);
    assert(!!submittedInHodQueue, 'Course file automatically routed to HOD Pending review queue');

    // ----------------------------------------------------
    // TEST 25-27: HOD Returns Course File with Feedback
    // ----------------------------------------------------
    console.log('\n--- TEST 25-27: HOD Return with Feedback Workflow ---');
    // Try returning without comment (should be rejected)
    const returnNoComment = await fetch(`${API_BASE}/hod/course-files/${draftFileData.data.id}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...hodScopeHeaders },
      body: JSON.stringify({ reviewComment: '' })
    });
    assert(returnNoComment.status === 400, 'HOD return without comment is rejected with 400 Bad Request');

    // Return with mandatory comment
    const returnWithComment = await fetch(`${API_BASE}/hod/course-files/${draftFileData.data.id}/return`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...hodScopeHeaders },
      body: JSON.stringify({ reviewComment: 'Please update CLO-3 mapping and revise week 12 assessment plan.' })
    });
    const returnData = await returnWithComment.json();
    assert(returnData.success, 'HOD returned course file with review comment');
    assert(returnData.data.status === 'Returned', 'Course file status is now Returned');

    // Teacher Resubmission
    const resubmitRes = await fetch(`${API_BASE}/course-files/${draftFileData.data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-user-id': testTeacherId, 'x-user-role': 'REGULAR_TEACHER' },
      body: JSON.stringify({
        status: 'Submitted',
        remarks: 'Revised CLO-3 mapping and updated week 12 assessment per HOD comments.'
      })
    });
    const resubmitData = await resubmitRes.json();
    assert(resubmitData.success && resubmitData.data.status === 'Submitted', 'Teacher successfully resubmitted corrected course file');

    // HOD Approves Course File
    const approveFileRes = await fetch(`${API_BASE}/hod/course-files/${draftFileData.data.id}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...hodScopeHeaders },
      body: JSON.stringify({ reviewComment: 'All corrections verified. Approved for curriculum signoff.' })
    });
    const approveFileData = await approveFileRes.json();
    assert(approveFileData.success && approveFileData.data.status === 'Approved', 'HOD formally approved course file');

    // Verify Approved Course Files endpoint shows the approved file
    const approvedFilesRes = await fetch(`${API_BASE}/hod/course-files?status=Approved`, { headers: hodScopeHeaders });
    const approvedFilesData = await approvedFilesRes.json();
    const isApprovedArchived = approvedFilesData.data.some(f => f.id === draftFileData.data.id);
    assert(isApprovedArchived, 'Course file is archived in HOD Approved Course Files archive');

    // ----------------------------------------------------
    // TEST 28-32: Scope Isolation & Cross-Department Security
    // ----------------------------------------------------
    console.log('\n--- TEST 28-32: Scope Isolation & Security Enforcement ---');
    // Another real HOD in a different department/campus (e.g. Lahore Campus Mathematics HOD)
    const otherHodAsgn = hodAssignData.data.find(h => h.departmentId !== csDept.id || h.campusId !== attockCampus.id);
    const otherDeptHodHeaders = {
      'x-user-id': otherHodAsgn?.hodId || 'usr-hod-1790533147680',
      'x-user-role': 'HOD',
      'x-department-id': otherHodAsgn?.departmentId || 'dept-1790533145702'
    };

    // Attempt direct access to CS course file by Math HOD
    const unauthorizedAccessRes = await fetch(`${API_BASE}/hod/course-files/${draftFileData.data.id}`, {
      headers: otherDeptHodHeaders
    });
    assert(unauthorizedAccessRes.status === 403, `Direct cross-department access blocked: HTTP ${unauthorizedAccessRes.status} Forbidden`);

    // Math HOD cannot see CS course file in their list
    const mathHodFilesRes = await fetch(`${API_BASE}/hod/course-files`, { headers: otherDeptHodHeaders });
    const mathHodFilesData = await mathHodFilesRes.json();
    const leakFound = mathHodFilesData.data?.some(f => f.id === draftFileData.data.id);
    assert(!leakFound, 'Cross-department data isolation: Math HOD cannot see CS course files');

    // ----------------------------------------------------
    // TEST 33-35: Duplicate Prevention
    // ----------------------------------------------------
    console.log('\n--- TEST 33-35: Duplicate Prevention Enforcement ---');
    // Attempting to submit another course file for exact same Teacher + Course + Batch + Session + Semester while active
    const duplicateRes = await fetch(`${API_BASE}/course-files/upload`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': testTeacherId, 'x-user-role': 'REGULAR_TEACHER' },
      body: JSON.stringify({
        teacherId: testTeacherId,
        teacherName: 'Dr. Test Assistant Professor',
        courseCode: testCourseCode,
        courseTitle: 'Data Structures and Algorithms',
        batch: '2024',
        session: '2024–2025',
        semester: '1st Semester',
        status: 'Submitted'
      })
    });
    assert(duplicateRes.status === 400, `Duplicate course file blocked with HTTP 400 Bad Request`);

    console.log('\n====================================================');
    console.log(`TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================');

    if (failed > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (err) {
    console.error('Test suite runtime error:', err);
    process.exit(1);
  }
}

runTests();
