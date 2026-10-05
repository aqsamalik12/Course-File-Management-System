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
  getHODSemesterCourses,
  getHODCourseFiles,
  getHODCourseFileById,
  approveHODCourseFile,
  returnHODCourseFile,
  reviewHODCourseFileItem,
  reviewHODCourseFileChecklist,
  getHODCourseProgress,
  getHODNotifications,
  getHODProfile,
  downloadHODBatchZip,
  downloadHODSemesterZip,
  downloadHODCertificatesZip,
  downloadSingleCourseFileDossier
} from '../controllers/hodController';

const router = Router();

// All HOD routes require active HOD authentication & scope verification
router.use(authenticateHOD);

// 1. Dashboard
router.get('/dashboard', getHODDashboard);

// 2. Course Files Management (Primary Module - Requirement 3 & 4)
router.get('/batches', getHODBatchesHierarchy);
router.get('/courses-by-semester', getHODSemesterCourses);
router.get('/course-files', getHODCourseFiles);
router.get('/course-files/:id', getHODCourseFileById);
router.post('/course-files/:id/approve', approveHODCourseFile);
router.post('/course-files/:id/return', returnHODCourseFile);
router.post('/course-files/:id/reject', returnHODCourseFile);
router.post('/course-files/:id/item-review', reviewHODCourseFileItem);
router.patch('/course-files/:id/item-review', reviewHODCourseFileItem);
router.post('/course-files/:id/checklist-review', reviewHODCourseFileChecklist);
router.put('/course-files/:id/checklist-review', reviewHODCourseFileChecklist);

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

// 8. HOD Multi-Tier Downloads (Options 1, 2, 3, and Certificates)
router.get('/downloads/batch/:batch', downloadHODBatchZip);
router.get('/downloads/batch', downloadHODBatchZip);
router.get('/downloads/semester', downloadHODSemesterZip);
router.get('/downloads/certificates', downloadHODCertificatesZip);
router.get('/downloads/course-file/:id', downloadSingleCourseFileDossier);

export default router;
