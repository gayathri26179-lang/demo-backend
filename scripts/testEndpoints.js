const http = require('http');

// Helper to make local HTTP requests
function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 5000,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
          ...headers
        }
      },
      (res) => {
        let responseData = '';
        res.on('data', chunk => responseData += chunk);
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(responseData);
          } catch (e) {
            parsed = responseData;
          }
          resolve({ status: res.statusCode, data: parsed });
        });
      }
    );

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting End-to-End API Test Suite for AR IT CRM Engine...\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extraInfo = '') {
    if (condition) {
      console.log(`  ✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${testName} ${extraInfo}`);
      failed++;
    }
  }

  try {
    // 1. Health & Root
    const health = await request('GET', '/api/health');
    assert(health.status === 200 && health.data.status === 'healthy', 'GET /api/health');

    const root = await request('GET', '/');
    assert(root.status === 200 && root.data.status === 'online', 'GET /');

    // 2. Auth - Admin Login
    const adminLogin = await request('POST', '/api/auth/admin/login', {
      email: 'admin@aritcompany.com',
      password: 'admin123'
    });
    assert(adminLogin.status === 200 && adminLogin.data.success && adminLogin.data.token, 'POST /api/auth/admin/login');
    const adminToken = adminLogin.data.token;
    const authHeaders = { Authorization: `Bearer ${adminToken}` };

    // 3. Auth - Token Verification
    const verify = await request('GET', '/api/auth/verify', null, authHeaders);
    assert(verify.status === 200 && verify.data.success, 'GET /api/auth/verify');

    // 4. Auth - Mentor Login
    const mentorLogin = await request('POST', '/api/auth/mentor/login', {
      email: 'rajesh.sharma@aritcompany.com',
      password: 'mentor123'
    });
    assert(mentorLogin.status === 200 && mentorLogin.data.success, 'POST /api/auth/mentor/login');

    // 5. Students - GET all
    const students = await request('GET', '/api/students', null, authHeaders);
    assert(students.status === 200 && Array.isArray(students.data.data), 'GET /api/students', `(count: ${students.data.count})`);

    // 6. Students - POST create
    const createdStudent = await request('POST', '/api/students', {
      name: 'Integration Test Student',
      email: 'test.student@example.com',
      course: 'Full Stack Development',
      phone: '+91 99999 11111',
      totalFee: 35000,
      paidAmount: 35000
    }, authHeaders);
    assert(createdStudent.status === 201 && createdStudent.data.success, 'POST /api/students');
    const testStudentId = createdStudent.data.data.id;

    // 7. Students - GET by ID
    const studentById = await request('GET', `/api/students/${testStudentId}`, null, authHeaders);
    assert(studentById.status === 200 && studentById.data.data.name === 'Integration Test Student', `GET /api/students/${testStudentId}`);

    // 8. Students - PUT update
    const updatedStudent = await request('PUT', `/api/students/${testStudentId}`, {
      address: 'Updated Bangalore Test Center'
    }, authHeaders);
    assert(updatedStudent.status === 200 && updatedStudent.data.data.address === 'Updated Bangalore Test Center', `PUT /api/students/${testStudentId}`);

    // 9. Students - Website Sync
    const syncRes = await request('POST', '/api/students/sync-website-registrations', {}, authHeaders);
    assert(syncRes.status === 200 && syncRes.data.success, 'POST /api/students/sync-website-registrations');

    // 10. Courses - GET
    const courses = await request('GET', '/api/courses');
    assert(courses.status === 200 && courses.data.count >= 7, 'GET /api/courses', `(count: ${courses.data.count})`);

    // 11. Internships - GET
    const internships = await request('GET', '/api/internships', null, authHeaders);
    assert(internships.status === 200 && internships.data.count >= 6, 'GET /api/internships', `(count: ${internships.data.count})`);

    // 12. Internships - PATCH status
    const firstInternship = internships.data.data[0];
    if (firstInternship) {
      const updateStatus = await request('PATCH', `/api/internships/${firstInternship.id}/status`, {
        status: 'Ongoing'
      }, authHeaders);
      assert(updateStatus.status === 200 && updateStatus.data.success, `PATCH /api/internships/${firstInternship.id}/status`);
    }

    // 13. Daily Activities - GET & POST & FEEDBACK
    const activities = await request('GET', '/api/daily-activities', null, authHeaders);
    assert(activities.status === 200 && Array.isArray(activities.data.data), 'GET /api/daily-activities');

    const createdActivity = await request('POST', '/api/daily-activities', {
      studentId: testStudentId,
      studentName: 'Integration Test Student',
      course: 'Full Stack Development',
      taskTitle: 'Tested Full Stack REST Integration',
      workDescription: 'Automated test suite verification for student, course, and activity modules.'
    }, authHeaders);
    assert(createdActivity.status === 201 && createdActivity.data.success, 'POST /api/daily-activities');

    if (createdActivity.data.data) {
      const feedback = await request('PATCH', `/api/daily-activities/${createdActivity.data.data.id}/feedback`, {
        feedback: 'Excellent automated tests with high fidelity.',
        status: 'Approved'
      }, authHeaders);
      assert(feedback.status === 200 && feedback.data.success, 'PATCH /api/daily-activities/:id/feedback');
    }

    // 14. Attendance - GET & POST & SUMMARY
    const attendance = await request('GET', '/api/attendance', null, authHeaders);
    assert(attendance.status === 200 && Array.isArray(attendance.data.data), 'GET /api/attendance');

    const markAtt = await request('POST', '/api/attendance', {
      studentId: testStudentId,
      status: 'Present'
    }, authHeaders);
    assert(markAtt.status === 200 && markAtt.data.success, 'POST /api/attendance');

    const attSummary = await request('GET', '/api/attendance/summary', null, authHeaders);
    assert(attSummary.status === 200 && attSummary.data.data.overallPercentage >= 0, 'GET /api/attendance/summary');

    // 15. Payments - GET & POST & SUMMARY
    const payments = await request('GET', '/api/payments', null, authHeaders);
    assert(payments.status === 200 && Array.isArray(payments.data.data), 'GET /api/payments');

    const paySummary = await request('GET', '/api/payments/summary', null, authHeaders);
    assert(paySummary.status === 200 && paySummary.data.data.totalRevenueCollected >= 0, 'GET /api/payments/summary');

    // 16. Certificates - GET & PUBLIC VERIFY
    const certs = await request('GET', '/api/certificates', null, authHeaders);
    assert(certs.status === 200 && certs.data.count >= 2, 'GET /api/certificates');

    const verifyCert = await request('GET', '/api/certificates/verify/ARIT-VERIFY-0101');
    assert(verifyCert.status === 200 && verifyCert.data.verified, 'GET /api/certificates/verify/ARIT-VERIFY-0101 (Public)');

    // 17. Mentors - GET
    const mentors = await request('GET', '/api/mentors');
    assert(mentors.status === 200 && mentors.data.count >= 5, 'GET /api/mentors');

    // 18. Progress - GET
    const progress = await request('GET', '/api/progress', null, authHeaders);
    assert(progress.status === 200 && Array.isArray(progress.data.data), 'GET /api/progress');

    // 19. Notifications - GET
    const notifs = await request('GET', '/api/notifications', null, authHeaders);
    assert(notifs.status === 200 && Array.isArray(notifs.data.data), 'GET /api/notifications');

    // 20. Communications - GET
    const comms = await request('GET', '/api/communications', null, authHeaders);
    assert(comms.status === 200 && Array.isArray(comms.data.data), 'GET /api/communications');

    // 21. Reports - GET
    const reports = await request('GET', '/api/reports', null, authHeaders);
    assert(reports.status === 200 && reports.data.data.metrics.totalStudents >= 8, 'GET /api/reports (Analytics KPIs)');

    // Clean up created test student
    await request('DELETE', `/api/students/${testStudentId}`, null, authHeaders);

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  }

  console.log(`\n====================================================`);
  console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log(`====================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

// Start backend server in same process if not already running, then run tests
const { app, server } = require('../Src/Server');
setTimeout(() => {
  runTests().then(() => {
    server.close();
  });
}, 1000);
