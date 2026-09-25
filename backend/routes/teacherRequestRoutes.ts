import { Router } from 'express';
import {
  getTeacherRequests,
  getTeacherRequestById,
  getMyTeacherRequest,
  createTeacherRequest,
  approveTeacherRequest,
  rejectTeacherRequest
} from '../controllers/teacherRequestController';

const router = Router();

router.get('/', getTeacherRequests);
router.get('/my-request', getMyTeacherRequest);
router.get('/:id', getTeacherRequestById);
router.post('/', createTeacherRequest);
router.patch('/:id/approve', approveTeacherRequest);
router.put('/:id/approve', approveTeacherRequest);
router.patch('/:id/reject', rejectTeacherRequest);
router.put('/:id/reject', rejectTeacherRequest);

export default router;
