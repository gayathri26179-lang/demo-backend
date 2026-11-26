const authController = require('../Src/controller/authcontroller');
const studentController = require('../Src/controller/studentController');
const courseController = require('../Src/controller/courseController');
const internshipController = require('../Src/controller/internshipController');
const activityController = require('../Src/controller/activityController');
const attendanceController = require('../Src/controller/attendanceController');
const paymentController = require('../Src/controller/paymentController');
const certificateController = require('../Src/controller/certificateController');
const mentorController = require('../Src/controller/mentorController');
const progressController = require('../Src/controller/progressController');
const notificationController = require('../Src/controller/notificationController');
const communicationController = require('../Src/controller/communicationController');
const reportController = require('../Src/controller/reportController');

// Mock response creator
function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.data = payload;
      return this;
    },
    send(payload) {
      this.data = payload;
      return this;
    }
  };
  return res;
}

async function runControllerTests() {
  console.log('🧪 Starting Controller & Business Logic Verification Suite...\n');
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
    // 1. Auth: Admin Login
    {
      const req = { body: { email: 'admin@aritcompany.com', password: 'admin123' } };
      const res = createMockRes();
      await authController.adminLogin(req, res);
      assert(res.statusCode === 200 && res.data.success && res.data.token, 'authController.adminLogin (Valid credentials)');
    }

    // 2. Auth: Admin Register
    {
      const req = {
        body: {
          fullName: 'New Admin Test',
          email: 'newadmin@aritcompany.com',
          phone: '+91 98888 77777',
          password: 'password123',
          confirmPassword: 'password123'
        }
      };
      const res = createMockRes();
      await authController.registerAdmin(req, res);
      assert(res.statusCode === 201 && res.data.success, 'authController.registerAdmin (New admin)');
    }

    // 3. Auth: Mentor Login
    {
      const req = { body: { email: 'rajesh.sharma@aritcompany.com', password: 'mentor123' } };
      const res = createMockRes();
      await authController.mentorLogin(req, res);
      assert(res.statusCode === 200 && res.data.success, 'authController.mentorLogin (Valid mentor)');
    }

    // 4. Students: getAllStudents
    {
      const req = { query: {} };
      const res = createMockRes();
      await studentController.getAllStudents(req, res);
      assert(res.statusCode === 200 && res.data.data.length >= 8, `studentController.getAllStudents (found ${res.data.count})`);
    }

    // 5. Students: createStudent
    let createdStudentId = null;
    {
      const req = {
        body: {
          name: 'Pooja Verma',
          email: 'pooja.v@example.com',
          phone: '+91 97777 66666',
          course: 'Full Stack Development',
          totalFee: 35000,
          paidAmount: 35000
        }
      };
      const res = createMockRes();
      await studentController.createStudent(req, res);
      createdStudentId = res.data.data.id;
      assert(res.statusCode === 201 && res.data.success && createdStudentId, 'studentController.createStudent');
    }

    // 6. Students: getStudentById
    {
      const req = { params: { id: createdStudentId } };
      const res = createMockRes();
      await studentController.getStudentById(req, res);
      assert(res.statusCode === 200 && res.data.data.name === 'Pooja Verma', `studentController.getStudentById (${createdStudentId})`);
    }

    // 7. Students: updateStudent
    {
      const req = { params: { id: createdStudentId }, body: { address: 'Tech Park, Bangalore' } };
      const res = createMockRes();
      await studentController.updateStudent(req, res);
      assert(res.statusCode === 200 && res.data.data.address === 'Tech Park, Bangalore', 'studentController.updateStudent');
    }

    // 8. Students: syncWebsiteRegistrations
    {
      const req = {};
      const res = createMockRes();
      await studentController.syncWebsiteRegistrations(req, res);
      assert(res.statusCode === 200 && res.data.success, 'studentController.syncWebsiteRegistrations');
    }

    // 9. Courses: getAllCourses
    {
      const req = {};
      const res = createMockRes();
      await courseController.getAllCourses(req, res);
      assert(res.statusCode === 200 && res.data.count >= 7, `courseController.getAllCourses (count: ${res.data.count})`);
    }

    // 10. Courses: createCourse
    {
      const req = { body: { name: 'DevOps & Cloud Architecture', fee: 32000, category: 'Cloud' } };
      const res = createMockRes();
      await courseController.createCourse(req, res);
      assert(res.statusCode === 201 && res.data.success, 'courseController.createCourse');
    }

    // 11. Internships: getAllInternships
    {
      const req = { query: {} };
      const res = createMockRes();
      await internshipController.getAllInternships(req, res);
      assert(res.statusCode === 200 && res.data.count >= 6, `internshipController.getAllInternships (count: ${res.data.count})`);
    }

    // 12. Internships: updateStatus
    {
      const req = { params: { id: 'INT-APP-102' }, body: { status: 'Ongoing', notes: 'Progressing nicely' } };
      const res = createMockRes();
      await internshipController.updateStatus(req, res);
      assert(res.statusCode === 200 && res.data.success, 'internshipController.updateStatus');
    }

    // 13. Activities: getAllActivities & createActivity
    {
      const req = { query: {} };
      const res = createMockRes();
      await activityController.getAllActivities(req, res);
      assert(res.statusCode === 200 && res.data.count >= 6, 'activityController.getAllActivities');

      const createReq = {
        body: {
          studentId: createdStudentId,
          studentName: 'Pooja Verma',
          course: 'Full Stack Development',
          taskTitle: 'Database Schema & Integration Tests',
          workDescription: 'Configured models, routes, and verified full CRUD cycle.'
        }
      };
      const createRes = createMockRes();
      await activityController.createActivity(createReq, createRes);
      assert(createRes.statusCode === 201 && createRes.data.success, 'activityController.createActivity');
    }

    // 14. Attendance: markAttendance & getAttendanceSummary
    {
      const req = {
        body: {
          records: [
            { studentId: 'ARIT-2026-STU01', status: 'Present' },
            { studentId: 'ARIT-2026-STU02', status: 'Present' }
          ],
          date: '2026-11-26'
        }
      };
      const res = createMockRes();
      await attendanceController.markAttendance(req, res);
      assert(res.statusCode === 200 && res.data.success, 'attendanceController.markAttendance (Batch)');

      const sumReq = {};
      const sumRes = createMockRes();
      await attendanceController.getAttendanceSummary(sumReq, sumRes);
      assert(sumRes.statusCode === 200 && sumRes.data.data.overallPercentage >= 0, 'attendanceController.getAttendanceSummary');
    }

    // 15. Payments: recordPayment & getPaymentSummary
    {
      const req = {
        body: {
          studentId: createdStudentId,
          amountPaid: 10000,
          method: 'UPI'
        }
      };
      const res = createMockRes();
      await paymentController.recordPayment(req, res);
      assert(res.statusCode === 201 && res.data.success, 'paymentController.recordPayment');

      const sumReq = {};
      const sumRes = createMockRes();
      await paymentController.getPaymentSummary(sumReq, sumRes);
      assert(sumRes.statusCode === 200 && sumRes.data.data.totalRevenueCollected > 0, 'paymentController.getPaymentSummary');
    }

    // 16. Certificates: verifyCertificate (Public) & getAllCertificates
    {
      const req = { params: { code: 'ARIT-VERIFY-0101' } };
      const res = createMockRes();
      await certificateController.verifyCertificate(req, res);
      assert(res.statusCode === 200 && res.data.verified, 'certificateController.verifyCertificate (Public)');

      const allReq = { query: {} };
      const allRes = createMockRes();
      await certificateController.getAllCertificates(allReq, allRes);
      assert(allRes.statusCode === 200 && allRes.data.count >= 2, 'certificateController.getAllCertificates');
    }

    // 17. Mentors: getAllMentors
    {
      const req = {};
      const res = createMockRes();
      await mentorController.getAllMentors(req, res);
      assert(res.statusCode === 200 && res.data.count >= 5, 'mentorController.getAllMentors');
    }

    // 18. Progress: getProgress
    {
      const req = {};
      const res = createMockRes();
      await progressController.getProgress(req, res);
      assert(res.statusCode === 200 && Array.isArray(res.data.data), 'progressController.getProgress');
    }

    // 19. Notifications: getAllNotifications
    {
      const req = {};
      const res = createMockRes();
      await notificationController.getAllNotifications(req, res);
      assert(res.statusCode === 200 && res.data.count > 0, 'notificationController.getAllNotifications');
    }

    // 20. Communications: sendAnnouncement & getAllCommunications
    {
      const req = {
        user: { name: 'Dr. Maya Raman' },
        body: {
          title: 'System Integration Notice',
          category: 'General Announcement',
          content: 'Backend and Frontend integration verified successfully.'
        }
      };
      const res = createMockRes();
      await communicationController.sendAnnouncement(req, res);
      assert(res.statusCode === 201 && res.data.success, 'communicationController.sendAnnouncement');

      const allReq = {};
      const allRes = createMockRes();
      await communicationController.getAllCommunications(allReq, allRes);
      assert(allRes.statusCode === 200 && allRes.data.count >= 4, 'communicationController.getAllCommunications');
    }

    // 21. Reports: getReports
    {
      const req = {};
      const res = createMockRes();
      await reportController.getReports(req, res);
      assert(
        res.statusCode === 200 &&
        res.data.data.metrics.totalStudents > 0 &&
        res.data.data.metrics.totalRevenue > 0,
        'reportController.getReports (KPI Metrics)'
      );
    }

    // 22. Clean up test student
    {
      const req = { params: { id: createdStudentId } };
      const res = createMockRes();
      await studentController.deleteStudent(req, res);
      assert(res.statusCode === 200 && res.data.success, `studentController.deleteStudent (${createdStudentId})`);
    }

  } catch (err) {
    console.error('Fatal test error:', err);
    failed++;
  }

  console.log(`\n====================================================`);
  console.log(`🏁 TEST RESULTS: ${passed} PASSED | ${failed} FAILED`);
  console.log(`====================================================\n`);

  process.exit(failed > 0 ? 1 : 0);
}

runControllerTests();
