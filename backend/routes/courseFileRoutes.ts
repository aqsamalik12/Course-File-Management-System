import { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware';
import {
  getCourseFiles,
  uploadCourseFile,
  updateCourseFile,
  uploadNewVersion,
  updateFileStatus,
  archiveCourseFile,
  restoreCourseFile,
  softDeleteCourseFile,
  permanentlyDeleteFile,
  downloadFile
} from '../controllers/courseFileController';

const router = Router();

router.get('/', getCourseFiles);
router.post('/', upload.single('file'), uploadCourseFile);
router.post('/upload', upload.single('file'), uploadCourseFile);
router.put('/:id', updateCourseFile);
router.patch('/:id', updateCourseFile);
router.post('/:id/version', upload.single('file'), uploadNewVersion);
router.patch('/:id/status', updateFileStatus);
router.patch('/:id/archive', archiveCourseFile);
router.patch('/:id/restore', restoreCourseFile);
router.delete('/:id/soft', softDeleteCourseFile);
router.delete('/:id/permanent', permanentlyDeleteFile);
router.get('/download/:filename', downloadFile);

export default router;
