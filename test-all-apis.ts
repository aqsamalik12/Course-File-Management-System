import http from 'http';

const BASE_URL = 'http://localhost:3000';

async function makeRequest(method: string, path: string, body?: any): Promise<{ status: number; data: any }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const payload = body ? JSON.stringify(body) : undefined;

    const options: http.RequestOptions = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {})
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode || 500, data: parsed });
        } catch {
          resolve({ status: res.statusCode || 500, data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

async function runFullTestSuite() {
  console.log('=====================================================');
  console.log('STARTING COMPLETE USER MANAGEMENT SUITE TESTS');
  console.log('=====================================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<boolean>) {
    try {
      const ok = await fn();
      if (ok) {
        console.log(`[PASS] ${name}`);
        passed++;
      } else {
        console.error(`[FAIL] ${name}`);
        failed++;
      }
    } catch (e: any) {
      console.error(`[ERROR] ${name}: ${e.message}`);
      failed++;
    }
  }

  const testId = Date.now();
  const testEmail = `test.teacher.${testId}@ue.edu.pk`;

  // 1. Health Check
  await test('Health Check Endpoint (GET /api/health)', async () => {
    const res = await makeRequest('GET', '/api/health');
    return res.status === 200 && res.data.status === 'online';
  });

  // 2. Create User with Custom Credentials
  await test('Create New User Account (POST /api/users)', async () => {
    const res = await makeRequest('POST', '/api/users', {
      id: `usr-prof-${testId}`,
      name: 'Dr. Ahmad Farooq',
      employeeId: `EMP-2026-${testId.toString().slice(-4)}`,
      email: testEmail,
      password: 'TeacherPass@123',
      role: 'REGULAR_TEACHER',
      departmentId: 'dept-cs',
      departmentName: 'Computer Science',
      designation: 'Assistant Professor',
      gender: 'Male',
      status: 'Active'
    });
    return res.status === 201 && res.data.success;
  });

  // 3. Duplicate Email Validation
  await test('Duplicate Email Prevention (HTTP 400 Bad Request)', async () => {
    const res = await makeRequest('POST', '/api/users', {
      name: 'Duplicate Test',
      email: testEmail,
      password: 'TeacherPass@123',
      role: 'REGULAR_TEACHER'
    });
    return res.status === 400 && res.data.success === false;
  });

  // 4. Login with Created User Credentials
  await test('Login using Created Credentials', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'TeacherPass@123'
    });
    return res.status === 200 && res.data.success && !!res.data.token;
  });

  // 5. Reset Password
  await test('Reset User Password (PATCH /api/users/:id/reset-password)', async () => {
    const res = await makeRequest('PATCH', `/api/users/usr-prof-${testId}/reset-password`, {
      newPassword: 'UpdatedSecret@2026'
    });
    return res.status === 200 && res.data.success;
  });

  await test('Login with Reset Password', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'UpdatedSecret@2026'
    });
    return res.status === 200 && res.data.success && !!res.data.token;
  });

  // 6. Lock Account & Login Rejection
  await test('Lock Account Status (PATCH /api/users/:id/status => Locked)', async () => {
    const res = await makeRequest('PATCH', `/api/users/usr-prof-${testId}/status`, { status: 'Locked' });
    return res.status === 200 && res.data.success && res.data.data.status === 'Locked';
  });

  await test('Verify Locked Account Login Rejection (HTTP 403 Forbidden)', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'UpdatedSecret@2026'
    });
    return res.status === 403 && res.data.success === false;
  });

  // 7. Unlock Account & Login Approval
  await test('Unlock Account Status (PATCH /api/users/:id/status => Active)', async () => {
    const res = await makeRequest('PATCH', `/api/users/usr-prof-${testId}/status`, { status: 'Active' });
    return res.status === 200 && res.data.success && res.data.data.status === 'Active';
  });

  await test('Verify Unlocked Account Login Success', async () => {
    const res = await makeRequest('POST', '/api/auth/login', {
      email: testEmail,
      password: 'UpdatedSecret@2026'
    });
    return res.status === 200 && res.data.success && !!res.data.token;
  });

  // 8. Edit User Profile
  await test('Edit User Profile (PUT /api/users/:id)', async () => {
    const res = await makeRequest('PUT', `/api/users/usr-prof-${testId}`, {
      designation: 'Associate Professor',
      phone: '+92 300 8887776'
    });
    return res.status === 200 && res.data.success;
  });

  // 9. Audit Log Verification
  await test('Verify Audit Trail Recording (GET /api/audit-logs)', async () => {
    const res = await makeRequest('GET', '/api/audit-logs');
    return res.status === 200 && res.data.success && res.data.data.length > 0;
  });

  // 10. Soft Delete User
  await test('Soft Delete Account (DELETE /api/users/:id)', async () => {
    const res = await makeRequest('DELETE', `/api/users/usr-prof-${testId}`);
    return res.status === 200 && res.data.success;
  });

  console.log('\n=====================================================');
  console.log(`TEST SUITE COMPLETE: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} TESTS`);
  console.log('=====================================================\n');
}

runFullTestSuite();
