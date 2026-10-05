import { createRequire } from 'module';
const require = createRequire(import.meta.url);

async function testPersistence() {
  console.log('=== PHASE 4: PERSISTENCE VERIFICATION TEST ===\n');

  const BASE_URL = 'http://localhost:5000';

  // 1. Check or Create "Lahore Campus"
  const campRes = await fetch(`${BASE_URL}/api/campuses`).then(r => r.json());
  let lhrCampus = campRes.data.find(c => c.name.toLowerCase().includes('lahore'));

  if (!lhrCampus) {
    console.log('Creating Lahore Campus...');
    const createCampRes = await fetch(`${BASE_URL}/api/campuses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'ADMIN' },
      body: JSON.stringify({
        name: 'Lahore Campus',
        code: 'UE-LHR',
        city: 'Lahore',
        address: 'Canal Road, Lahore',
        directorName: 'Prof. Dr. Munir Ahmad',
        status: 'Active'
      })
    }).then(r => r.json());

    if (!createCampRes.success) {
      throw new Error('Failed to create campus: ' + createCampRes.message);
    }
    lhrCampus = createCampRes.data;
    console.log('✓ Created Lahore Campus:', lhrCampus.id);
  } else {
    console.log('✓ Found existing Lahore Campus:', lhrCampus.id, lhrCampus.name);
  }

  // 2. Check or Create "Computer Science" Department under Lahore Campus
  const deptRes = await fetch(`${BASE_URL}/api/departments?campusId=${lhrCampus.id}`).then(r => r.json());
  let csDept = deptRes.data.find(d => d.name.toLowerCase() === 'computer science');

  if (!csDept) {
    console.log('Creating Computer Science Department under Lahore Campus...');
    const createDeptRes = await fetch(`${BASE_URL}/api/departments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-role': 'ADMIN' },
      body: JSON.stringify({
        name: 'Computer Science',
        code: 'CS-LHR',
        campusId: lhrCampus.id,
        campusName: lhrCampus.name,
        status: 'Active'
      })
    }).then(r => r.json());

    if (!createDeptRes.success) {
      throw new Error('Failed to create department: ' + createDeptRes.message);
    }
    csDept = createDeptRes.data;
    console.log('✓ Created Computer Science Department:', csDept.id);
  } else {
    console.log('✓ Found existing Computer Science Department under Lahore Campus:', csDept.id);
  }

  // 3. Create or Assign HOD "Dr. Asif" under Computer Science at Lahore Campus
  const hodEmail = 'dr.asif.lhr@ue.edu.pk';
  console.log('Assigning HOD Dr. Asif to Computer Science at Lahore Campus...');
  const assignHodRes = await fetch(`${BASE_URL}/api/hod-assignments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-user-role': 'ADMIN' },
    body: JSON.stringify({
      campusId: lhrCampus.id,
      departmentId: csDept.id,
      hodName: 'Dr. Asif',
      email: hodEmail,
      password: 'Password@123',
      status: 'Active',
      academicSession: 'Fall 2026'
    })
  }).then(r => r.json());

  if (!assignHodRes.success) {
    throw new Error('Failed to assign HOD: ' + assignHodRes.message);
  }
  console.log('✓ Successfully assigned HOD Dr. Asif:', assignHodRes.data?.id);

  // 4. Test HOD Login with those credentials
  console.log('Testing HOD login with created credentials...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: hodEmail,
      password: 'Password@123'
    })
  }).then(r => r.json());

  if (!loginRes.success) {
    throw new Error('Failed HOD login: ' + loginRes.message);
  }
  console.log('✓ HOD logged in successfully! Name:', loginRes.user?.name, 'Role:', loginRes.user?.role, 'Campus:', loginRes.user?.campus);

  console.log('\n=== ALL 3 RECORDS CREATED & VERIFIED ===');
  console.log('Campus:', lhrCampus.name, `(${lhrCampus.id})`);
  console.log('Department:', csDept.name, `(${csDept.id})`);
  console.log('HOD:', loginRes.user.name, `(${loginRes.user.email})`);
}

testPersistence().catch(err => {
  console.error('Test Failed:', err);
  process.exit(1);
});
