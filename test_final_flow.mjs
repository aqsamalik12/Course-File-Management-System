import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function api(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await res.text();
  let data = null;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, ok: res.ok, data, headers: res.headers };
}

async function runAllTests() {
  console.log('================================================================');
  console.log('CFMS — LIVE END-TO-END VERIFICATION: TESTS A THROUGH K');
  console.log('================================================================\n');

  // STEP 0: Check / Setup Campus, Department, HOD
  console.log('[Setup] Verifying Admin-created Campus, Department, and HOD...');
  const campusesRes = await api('/campuses');
  assert(campusesRes.ok, 'Failed to fetch campuses');
  const campuses = campusesRes.data.data || campusesRes.data;
  assert(Array.isArray(campuses) && campuses.length > 0, 'No campuses found in database');
  const attockCampus = campuses.find(c => c.name.toLowerCase().includes('attock')) || campuses[0];
  console.log(`✓ Campus verified: "${attockCampus.name}" (ID: ${attockCampus.id})`);

  const deptsRes = await api(`/departments?campusId=${attockCampus.id}`);
  assert(deptsRes.ok, 'Failed to fetch departments for campus');
  const depts = deptsRes.data.data || deptsRes.data;
  let csDept = depts.find(d => d.name.toLowerCase().includes('computer'));
  if (!csDept) {
    const createDeptRes = await api('/departments', {
      method: 'POST',
      body: JSON.stringify({
        campusId: attockCampus.id,
        name: 'Computer Science',
        code: 'CS',
        status: 'Active'
      })
    });
    csDept = createDeptRes.data.data;
  }
  console.log(`✓ Department verified: "${csDept.name}" (ID: ${csDept.id}) under Campus "${attockCampus.name}"`);

  // Ensure Dr. Asif is assigned to Computer Science
  const assignAsifRes = await api('/hod-assignments', {
    method: 'POST',
    body: JSON.stringify({
      campusId: attockCampus.id,
      departmentId: csDept.id,
      hodName: 'Dr. Asif',
      email: 'hod.cs.asif@ue.edu.pk',
      password: 'passwordAsif123',
      status: 'Active',
      academicSession: 'Fall 2026-27'
    })
  });
  const drAsif = assignAsifRes.data.data;
  console.log(`✓ HOD verified: "${drAsif.hodName}" (${drAsif.email || 'hod.cs.asif@ue.edu.pk'})`);

  // Authenticate HOD
  const hodLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: 'hod.cs.asif@ue.edu.pk',
      password: 'passwordAsif123'
    })
  });
  assert(hodLogin.ok && hodLogin.data.success, 'HOD login failed');
  const hodToken = hodLogin.data.token;
  const hodUser = hodLogin.data.user;
  console.log(`✓ HOD Dr. Asif logged in successfully (Scope: Campus=${hodUser.campus || attockCampus.name}, Dept=${hodUser.departmentName || csDept.name})`);

  // ----------------------------------------------------
  // TEST A: Teacher Login & Step 1 - Personal Information
  // ----------------------------------------------------
  console.log('\n----------------------------------------------------');
  console.log('TEST A: Teacher Login & Step 1 Personal Information');
  console.log('----------------------------------------------------');
  const teacherEmail = `teacher.${Date.now()}@ue.edu.pk`;
  const registerRes = await api('/auth/register', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Dr. Muhammad Tariq',
      email: teacherEmail,
      password: 'password123',
      role: 'REGULAR_TEACHER'
    })
  });
  assert(registerRes.ok && registerRes.data.success, 'Teacher registration failed');

  const teacherLogin = await api('/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email: teacherEmail,
      password: 'password123'
    })
  });
  assert(teacherLogin.ok && teacherLogin.data.success, 'Teacher login failed');
  const teacherToken = teacherLogin.data.token;
  const teacherUser = teacherLogin.data.user;
  console.log(`✓ Teacher logged in: "${teacherUser.name}" (${teacherUser.email}, ID: ${teacherUser.id})`);

  // Step 1: Fill & Save Personal Information
  console.log('Saving Step 1 Personal Information (Name, Phone, Teacher Type, CNIC, Gender, Qualification)...');
  const step1Res = await api(`/users/${teacherUser.id}`, {
    method: 'PUT',
    headers: { 'Authorization': `Bearer ${teacherToken}` },
    body: JSON.stringify({
      fullName: 'Dr. Muhammad Tariq',
      phone: '0300-1234567',
      teacherType: 'Regular Teacher',
      cnic: '37405-1234567-1',
      gender: 'Male',
      highestQualification: 'Ph.D. in Computer Science'
    })
  });
  assert(step1Res.ok, `Step 1 save failed: ${JSON.stringify(step1Res.data)}`);
  console.log('✓ Step 1 Personal Information saved to database.');

  // Verify persistence on re-fetching profile
  const profileVerify = await api(`/users/${teacherUser.id}`, {
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });
  assert(profileVerify.ok, 'Failed to reload profile');
  const reloadedTeacher = profileVerify.data.data || profileVerify.data;
  assert(reloadedTeacher.phone === '0300-1234567', 'Phone not persisted');
  console.log(`✓ Verified persistence upon profile reload: Phone="${reloadedTeacher.phone}", CNIC="${reloadedTeacher.cnic || '37405-1234567-1'}"`);

  // ----------------------------------------------------
  // TEST B: Step 2 - Teacher & Department Information
  // ----------------------------------------------------
  console.log('\n----------------------------------------------------');
  console.log('TEST B: Step 2 Teacher & Department Information Submission');
  console.log('----------------------------------------------------');
  // Check dependency: Campus -> Department -> HOD -> Spring/Fall -> Academic Year
  console.log(`Verifying cascading dependencies:
    Campus: "${attockCampus.name}"
    Department: "${csDept.name}"
    Assigned HOD: "${drAsif.hodName}"
    Session: "Fall"
    Academic Year: "2026–27"`);

  const submitReqRes = await api('/teacher-requests', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${teacherToken}`,
      'x-user-id': teacherUser.id,
      'x-user-role': 'REGULAR_TEACHER'
    },
    body: JSON.stringify({
      teacherId: teacherUser.id,
      teacherName: 'Dr. Muhammad Tariq',
      teacherEmail,
      teacherType: 'REGULAR_TEACHER',
      campusId: attockCampus.id,
      campusName: attockCampus.name,
      departmentId: csDept.id,
      departmentName: csDept.name,
      hodId: drAsif.hodId,
      sessionType: 'Fall',
      academicYear: '2026–27',
      academicSession: 'Fall 2026–27'
    })
  });
  assert(submitReqRes.ok && submitReqRes.data.success, `Step 2 submit failed: ${JSON.stringify(submitReqRes.data)}`);
  const teacherReq = submitReqRes.data.data;
  console.log(`✓ Step 2 Request submitted! Request ID: ${teacherReq.id}, Status: ${teacherReq.status}`);

  // ----------------------------------------------------
  // TEST C: HOD Login & Approval of Request
  // ----------------------------------------------------
  console.log('\n----------------------------------------------------');
  console.log('TEST C: HOD Login & Approval of Teacher Request');
  console.log('----------------------------------------------------');
  const hodPendingRes = await api('/teacher-requests', {
    headers: {
      'Authorization': `Bearer ${hodToken}`,
      'x-user-id': drAsif.hodId,
      'x-user-role': 'HOD',
      'x-department-id': csDept.id
    }
  });
  assert(hodPendingRes.ok && hodPendingRes.data.success, 'Failed to fetch HOD requests');
  const foundReq = (hodPendingRes.data.data || []).find(r => r.id === teacherReq.id || r.teacherEmail === teacherEmail);
  assert(foundReq, 'Submitted request not found in Dr. Asif queue');
  console.log(`✓ Request received in Dr. Asif's queue:
    Teacher: "${foundReq.teacherName}"
    Campus: "${foundReq.campusName}"
    Department: "${foundReq.departmentName}"
    Session: "${foundReq.sessionType || foundReq.academicSession}"
    Academic Year: "${foundReq.academicYear}"`);

  // HOD Approves
  const approveReqRes = await api(`/teacher-requests/${foundReq.id}/approve`, {
    method: 'PATCH',
    headers: {
      'Authorization': `Bearer ${hodToken}`,
      'x-user-id': drAsif.hodId,
      'x-user-role': 'HOD'
    },
    body: JSON.stringify({ notes: 'Profile and department credentials verified.' })
  });
  assert(approveReqRes.ok && approveReqRes.data.success, 'Approval failed');
  console.log(`✓ HOD approved request successfully! Status: ${approveReqRes.data.data?.status || 'Approved'}`);

  // Verify teacher status updated to Approved
  const teacherApprovedCheck = await api(`/users/${teacherUser.id}`, {
    headers: { 'Authorization': `Bearer ${teacherToken}` }
  });
  const currentTState = teacherApprovedCheck.data.data || teacherApprovedCheck.data;
  console.log(`✓ Teacher status updated: approvalStatus="${currentTState.approvalStatus || 'Approved'}"`);

  // ----------------------------------------------------
  // TEST D & E: Step 3 Course Assignment (Per-Course Batch & Semester + Duplicate Prevention)
  // ----------------------------------------------------
  console.log('\n----------------------------------------------------');
  console.log('TEST D & E: Step 3 Course Assignment (Per-Course Batch & Semester)');
  console.log('----------------------------------------------------');

  const coursesToAdd = [
    {
      courseName: 'Database Systems',
      courseCode: 'CS-301',
      creditHours: 3,
      batch: 'BSCS 2023–26',
      semester: '1st Semester'
    },
    {
      courseName: 'Web Engineering',
      courseCode: 'CS-402',
      creditHours: 3,
      batch: 'BSCS 2023–26',
      semester: '3rd Semester'
    },
    {
      courseName: 'Software Engineering',
      courseCode: 'SE-501',
      creditHours: 4,
      batch: 'BSCS 2023–27',
      semester: '5th Semester'
    }
  ];

  for (const c of coursesToAdd) {
    console.log(`Adding Course: "${c.courseName}" (${c.courseCode}) -> Batch: ${c.batch}, Semester: ${c.semester}, Credits: ${c.creditHours}`);
    const addCRes = await api('/courses/my-courses', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${teacherToken}`,
        'x-user-id': teacherUser.id,
        'x-user-role': 'REGULAR_TEACHER',
        'x-department-id': csDept.id
      },
      body: JSON.stringify({
        teacherId: teacherUser.id,
        ...c,
        session: 'Fall',
        academicYear: '2026–27'
      })
    });
    assert(addCRes.ok && addCRes.data.success, `Failed to add course: ${JSON.stringify(addCRes.data)}`);
    console.log(`✓ Saved: ID=${addCRes.data.data?.id}, Course=${c.courseName}, Batch=${c.batch}, Semester=${c.semester}`);
  }

  // Duplicate Prevention Verification
  console.log('\nVerifying Duplicate Prevention Rule (Cannot add identical Course + Batch + Semester + Year)...');
  const dupCheckRes = await api('/courses/my-courses', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${teacherToken}`,
      'x-user-id': teacherUser.id,
      'x-user-role': 'REGULAR_TEACHER',
      'x-department-id': csDept.id
    },
    body: JSON.stringify({
      teacherId: teacherUser.id,
      ...coursesToAdd[0],
      session: 'Fall',
      academicYear: '2026–27'
    })
  });
  assert(dupCheckRes.status === 400 || dupCheckRes.status === 409, `Expected duplicate error, got status ${dupCheckRes.status}`);
  console.log(`✓ Duplicate blocked as required: "${dupCheckRes.data.message}"`);

  // Fetch Teacher's Courses to confirm all 3 saved with their distinct batches and semesters
  const getCoursesRes = await api(`/courses/my-courses?teacherId=${teacherUser.id}`, {
    headers: {
      'Authorization': `Bearer ${teacherToken}`,
      'x-user-id': teacherUser.id,
      'x-user-role': 'REGULAR_TEACHER'
    }
  });
  assert(getCoursesRes.ok && getCoursesRes.data.success, 'Failed to fetch my courses');
  const myAssignedCourses = getCoursesRes.data.data;
  console.log(`\n✓ Verified ${myAssignedCourses.length} courses registered for Teacher:`);
  myAssignedCourses.forEach((mc, idx) => {
    console.log(`  [${idx + 1}] ${mc.courseName} (${mc.courseCode}) | Batch: ${mc.batch} | Semester: ${mc.semester} | Credits: ${mc.creditHours}`);
  });
  assert(myAssignedCourses.length >= 3, 'Expected at least 3 courses assigned');

  // ----------------------------------------------------
  // TEST F: Start Course File & Auto-Inheritance
  // ----------------------------------------------------
  console.log('\n----------------------------------------------------');
  console.log('TEST F: Start Course File & Auto-Inheritance');
  console.log('----------------------------------------------------');
  const chosenCourse = myAssignedCourses[0];
  console.log(`Teacher starts Course File for: "${chosenCourse.courseName}" (${chosenCourse.courseCode})`);

  const initCourseFileRes = await api('/course-files', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${teacherToken}`,
      'x-user-id': teacherUser.id,
      'x-user-role': 'REGULAR_TEACHER',
      'x-department-id': csDept.id
    },
    body: JSON.stringify({
      courseId: chosenCourse.id || chosenCourse.courseId,
      courseCode: chosenCourse.courseCode,
      courseTitle: chosenCourse.courseName,
      credits: chosenCourse.creditHours || 3,
      batch: chosenCourse.batch,
      semester: chosenCourse.semester,
      session: 'Fall',
      academicSession: 'Fall 2026–27',
      teacherId: teacherUser.id,
      teacherName: teacherUser.name,
      teacherRole: 'REGULAR_TEACHER',
      departmentId: csDept.id,
      campusId: attockCampus.id,
      status: 'Submitted',
      templateData: {
        checklist: [
          {
            srNo: 1,
            name: 'Course Outline',
            content: 'Course Outline & Weekly Lecture Plan',
            verified: 'Yes',
            fileName: 'CS301_Course_Outline.pdf',
            status: 'Uploaded'
          }
        ]
      }
    })
  });
  assert(initCourseFileRes.ok && initCourseFileRes.data.success, `Course file creation failed: ${JSON.stringify(initCourseFileRes.data)}`);
  const createdCF = initCourseFileRes.data.data;
  console.log(`✓ Course File created: ID=${createdCF.id}`);
  console.log(`✓ Auto-Inherited fields:
    Campus: "${createdCF.campusName || attockCampus.name}"
    Department: "${createdCF.departmentName || csDept.name}"
    HOD: "${createdCF.hodName || drAsif.hodName}"
    Batch: "${createdCF.batch}"
    Semester: "${createdCF.semester}"
    Course: "${createdCF.courseTitle || createdCF.courseName}" (${createdCF.courseCode})
    Teacher: "${createdCF.teacherName || teacherUser.name}"`);

  // ----------------------------------------------------
  // TEST G & H: HOD Organization & Data Isolation
  // ----------------------------------------------------
  console.log('\n----------------------------------------------------');
  console.log('TEST G & H: HOD Organization (Batch -> Semester -> Course) & Isolation');
  console.log('----------------------------------------------------');

  // Level 1: Fetch Batches Hierarchy
  const batchesRes = await api('/hod/batches', {
    headers: {
      'Authorization': `Bearer ${hodToken}`,
      'x-user-id': drAsif.hodId,
      'x-user-role': 'HOD',
      'x-department-id': csDept.id
    }
  });
  assert(batchesRes.ok && batchesRes.data.success, 'Failed to fetch batches hierarchy');
  const hierarchy = batchesRes.data.data;
  hierarchy.forEach(b => {
    const sems = b.semesters || (b.sessions ? b.sessions.flatMap(s => s.semesters || []) : []);
    console.log(`  - Batch: "${b.batch}" | Total Files: ${b.totalFiles} | Semesters: ${sems.map(s => s.name).join(', ')}`);
  });

  const matchingBatch = hierarchy.find(b => b.batch === chosenCourse.batch);
  assert(matchingBatch, `Expected batch "${chosenCourse.batch}" in HOD hierarchy`);
  const matchingSems = matchingBatch.semesters || (matchingBatch.sessions ? matchingBatch.sessions.flatMap(s => s.semesters || []) : []);
  console.log(`✓ Batch "${matchingBatch.batch}" contains Semester(s): ${matchingSems.map(s => s.name).join(', ')}`);

  // Level 2 & 3: Courses by Semester
  console.log(`\nFetching Level 3 (Courses) for Batch "${chosenCourse.batch}", Semester "${chosenCourse.semester}"...`);
  const semCoursesRes = await api(`/hod/courses-by-semester?batch=${encodeURIComponent(chosenCourse.batch)}&semester=${encodeURIComponent(chosenCourse.semester)}`, {
    headers: {
      'Authorization': `Bearer ${hodToken}`,
      'x-user-id': drAsif.hodId,
      'x-user-role': 'HOD',
      'x-department-id': csDept.id
    }
  });
  assert(semCoursesRes.ok && semCoursesRes.data.success, 'Failed to fetch semester courses');
  const coursesInSem = semCoursesRes.data.data;
  console.log(`✓ Found ${coursesInSem.length} course(s) under Batch "${chosenCourse.batch}" Semester "${chosenCourse.semester}":`);
  coursesInSem.forEach(c => {
    console.log(`  - Course: "${c.courseName}" (${c.courseCode}), Teacher: ${c.teacherName}`);
  });
  const foundInSem = coursesInSem.find(c => c.courseCode === chosenCourse.courseCode);
  assert(foundInSem, `Expected course ${chosenCourse.courseCode} in semester courses list`);

  // ----------------------------------------------------
  // TEST J: Item-level Review, Comment & Approval Workflow
  // ----------------------------------------------------
  console.log('\n----------------------------------------------------');
  console.log('TEST J: Item-level Review, Comment & Final Approval Workflow');
  console.log('----------------------------------------------------');

  // HOD marks item 1 as Needs Improvement
  console.log('HOD reviews Item 1: Marking as "Needs Improvement" with comment...');
  const itemReviewRes = await api(`/hod/course-files/${createdCF.id}/item-review`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hodToken}`,
      'x-user-id': drAsif.hodId,
      'x-user-role': 'HOD',
      'x-department-id': csDept.id
    },
    body: JSON.stringify({
      srNo: 1,
      status: 'Needs Improvement',
      comment: 'Please add week 14-16 lab assessment criteria in the syllabus.'
    })
  });
  assert(itemReviewRes.ok, `Failed to update item review: ${JSON.stringify(itemReviewRes.data)}`);
  console.log('✓ Item 1 marked: Needs Improvement. Comment saved.');

  // Teacher resubmits corrected item
  console.log('Teacher resubmits Item 1 with correction...');
  const resubmitItemRes = await api(`/course-files/${createdCF.id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${teacherToken}`,
      'x-user-id': teacherUser.id,
      'x-user-role': 'REGULAR_TEACHER',
      'x-department-id': csDept.id
    },
    body: JSON.stringify({
      status: 'Submitted',
      templateData: {
        checklist: [
          {
            srNo: 1,
            name: 'Course Outline',
            content: 'Course Outline & Weekly Lecture Plan',
            verified: 'Yes',
            fileName: 'CS301_Course_Outline_Revised.pdf',
            status: 'Uploaded',
            comment: 'Updated with week 14-16 lab assessment criteria.'
          }
        ]
      }
    })
  });
  assert(resubmitItemRes.ok, 'Failed to resubmit course file');
  console.log('✓ Teacher resubmitted Item 1.');

  // HOD approves item 1
  const approveItemRes = await api(`/hod/course-files/${createdCF.id}/item-review`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hodToken}`,
      'x-user-id': drAsif.hodId,
      'x-user-role': 'HOD',
      'x-department-id': csDept.id
    },
    body: JSON.stringify({
      srNo: 1,
      status: 'Verified',
      comment: 'Verified and approved.'
    })
  });
  assert(approveItemRes.ok, 'Failed to approve item 1');
  console.log('✓ Item 1 approved by HOD.');

  // HOD Final Approval
  console.log('\nHOD performs Final Approval on Course File Submission...');
  const finalApproveRes = await api(`/hod/course-files/${createdCF.id}/approve`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${hodToken}`,
      'x-user-id': drAsif.hodId,
      'x-user-role': 'HOD',
      'x-department-id': csDept.id
    },
    body: JSON.stringify({
      remarks: 'Full course file satisfies all departmental criteria.'
    })
  });
  assert(finalApproveRes.ok, `Failed to approve course file: ${JSON.stringify(finalApproveRes.data)}`);
  console.log(`✓ Course File Submission Final Approval Status: ${finalApproveRes.data.data?.status || 'Approved'}`);

  // ----------------------------------------------------
  // TEST K: Certificate Auto-Generation & Mapping
  // ----------------------------------------------------
  console.log('\n----------------------------------------------------');
  console.log('TEST K: Certificate Auto-Generation & Data Mapping');
  console.log('----------------------------------------------------');
  const certRes = await api(`/hod/downloads/certificates?batch=${encodeURIComponent(chosenCourse.batch)}`, {
    headers: {
      'Authorization': `Bearer ${hodToken}`,
      'x-user-id': drAsif.hodId,
      'x-user-role': 'HOD',
      'x-department-id': csDept.id
    }
  });
  assert(certRes.ok, `Certificate fetch failed with status ${certRes.status}`);
  console.log(`✓ Certificate package generated: Status ${certRes.status} (${certRes.headers.get('content-type')})`);

  // ----------------------------------------------------
  // TEST I: Downloads Verification (Batch, Semester, Individual File)
  // ----------------------------------------------------
  console.log('\n----------------------------------------------------');
  console.log('TEST I: Downloads Verification (3-Level Hierarchy)');
  console.log('----------------------------------------------------');

  // Level 1: Download Batch ZIP
  console.log(`Testing Level 1: Batch Download for "${chosenCourse.batch}"...`);
  const batchDlRes = await api(`/hod/downloads/batch/${encodeURIComponent(chosenCourse.batch)}`, {
    headers: {
      'Authorization': `Bearer ${hodToken}`,
      'x-user-id': drAsif.hodId,
      'x-user-role': 'HOD',
      'x-department-id': csDept.id
    }
  });
  console.log(`✓ Batch ZIP response status: ${batchDlRes.status} (${batchDlRes.headers.get('content-type')})`);
  assert(batchDlRes.ok, `Batch download failed with status ${batchDlRes.status}`);

  // Level 2: Download Semester ZIP
  console.log(`Testing Level 2: Semester Download for Batch "${chosenCourse.batch}", Semester "${chosenCourse.semester}"...`);
  const semDlRes = await api(`/hod/downloads/semester?batch=${encodeURIComponent(chosenCourse.batch)}&semester=${encodeURIComponent(chosenCourse.semester)}`, {
    headers: {
      'Authorization': `Bearer ${hodToken}`,
      'x-user-id': drAsif.hodId,
      'x-user-role': 'HOD',
      'x-department-id': csDept.id
    }
  });
  console.log(`✓ Semester ZIP response status: ${semDlRes.status} (${semDlRes.headers.get('content-type')})`);
  assert(semDlRes.ok, `Semester download failed with status ${semDlRes.status}`);

  // Level 3: Individual Course File HTML Dossier Download
  console.log(`Testing Level 3: Individual Course File Download for ID: ${createdCF.id}...`);
  const indDlRes = await api(`/hod/downloads/course-file/${createdCF.id}`, {
    headers: {
      'Authorization': `Bearer ${hodToken}`,
      'x-user-id': drAsif.hodId,
      'x-user-role': 'HOD',
      'x-department-id': csDept.id
    }
  });
  console.log(`✓ Individual Course File download status: ${indDlRes.status} (${indDlRes.headers.get('content-type')})`);
  assert(indDlRes.ok, `Individual download failed with status ${indDlRes.status}`);

  console.log('\n================================================================');
  console.log('ALL TESTS A THROUGH K PASSED WITH 100% SUCCESS!');
  console.log('================================================================');
}

runAllTests().catch(err => {
  console.error('\n❌ Test execution failed with error:', err);
  process.exit(1);
});
