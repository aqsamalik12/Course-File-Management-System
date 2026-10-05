async function verifyCold() {
  console.log('=== VERIFYING PERSISTENCE IN INDEPENDENT SCRIPT ===');
  const BASE_URL = 'http://localhost:5000';

  // 1. Verify Campuses
  const campRes = await fetch(`${BASE_URL}/api/campuses`).then(r => r.json());
  const lhr = campRes.data.find(c => c.name.toLowerCase().includes('lahore'));
  if (!lhr) throw new Error('FAIL: Lahore Campus not found!');
  console.log('✓ Verified Campus:', lhr.id, lhr.name);

  // 2. Verify Department
  const deptRes = await fetch(`${BASE_URL}/api/departments?campusId=${lhr.id}`).then(r => r.json());
  const cs = deptRes.data.find(d => d.name.toLowerCase() === 'computer science');
  if (!cs) throw new Error('FAIL: Computer Science department not found under Lahore campus!');
  console.log('✓ Verified Department:', cs.id, cs.name, 'under Campus:', cs.campusId);

  // 3. Verify HOD Assignment
  const hodRes = await fetch(`${BASE_URL}/api/hod-assignments?campusId=${lhr.id}&departmentId=${cs.id}`).then(r => r.json());
  const asgn = hodRes.data.find(a => a.status === 'Active');
  if (!asgn) throw new Error('FAIL: Active HOD assignment not found under Lahore Campus + CS!');
  console.log('✓ Verified HOD Assignment:', asgn.id, asgn.hodName, asgn.hodEmail);

  // 4. Verify HOD User login
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'dr.asif.lhr@ue.edu.pk',
      password: 'Password@123'
    })
  }).then(r => r.json());

  if (!loginRes.success) throw new Error('FAIL: HOD login failed: ' + loginRes.message);
  console.log('✓ Verified HOD Login: Token issued for', loginRes.user.name, 'Role:', loginRes.user.role);

  console.log('\n>>> PERSISTENCE TEST 100% PASSED <<<');
}

verifyCold().catch(err => {
  console.error(err);
  process.exit(1);
});
