import { Router } from 'express';
import { authenticateHOD } from '../middlewares/hodAuthMiddleware';
import {
  getHODDashboard,
  getHODTeacherRequests,
  getHODTeacherRequestById,
  approveHODTeacherRequest,
  rejectHODTeacherRequest,
  getHODTeachers,
  getHODTeacherProfileById,
  getHODBatchesHierarchy,
  getHODCourseFiles,
  getHODCourseFileById,
  approveHODCourseFile,
  returnHODCourseFile,
  getHODCourseProgress,
  getHODNotifications,
  getHODProfile
} from '../controllers/hodController';

const router = Router();

// All HOD routes require active HOD authentication & scope verification
router.use(authenticateHOD);

// 1. Dashboard
router.get('/dashboard', getHODDashboard);

// 2. Course Files Management (Primary Module - Requirement 3 & 4)
router.get('/batches', getHODBatchesHierarchy);
router.get('/course-files', getHODCourseFiles);
router.get('/course-files/:id', getHODCourseFileById);
router.post('/course-files/:id/approve', approveHODCourseFile);
router.post('/course-files/:id/return', returnHODCourseFile);
router.post('/course-files/:id/reject', returnHODCourseFile);

// 3. Teacher Requests (Registration approval only)
router.get('/teacher-requests', getHODTeacherRequests);
router.get('/teacher-requests/:id', getHODTeacherRequestById);
router.post('/teacher-requests/:id/approve', approveHODTeacherRequest);
router.patch('/teacher-requests/:id/approve', approveHODTeacherRequest);
router.post('/teacher-requests/:id/reject', rejectHODTeacherRequest);
router.patch('/teacher-requests/:id/reject', rejectHODTeacherRequest);

// 4. Approved Teachers & Profiles
router.get('/teachers', getHODTeachers);
router.get('/teachers/:id', getHODTeacherProfileById);

// 5. Course / File Progress
router.get('/course-progress', getHODCourseProgress);

// 6. Notifications
router.get('/notifications', getHODNotifications);

// 7. HOD Profile
router.get('/profile', getHODProfile);

export default router;
