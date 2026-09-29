import { Router } from 'express';
import {
  getTeacherAssignments,
  getMyAssignments,
  validateTeacherSelection,
  createTeacherAssignment,
  updateTeacherAssignment,
  deleteTeacherAssignment
} from '../controllers/teacherAssignmentController';

const router = Router();

router.get('/', getTeacherAssignments);
router.get('/my-assignments', getMyAssignments);
router.post('/validate', validateTeacherSelection);
router.post('/', createTeacherAssignment);
router.put('/:id', updateTeacherAssignment);
router.patch('/:id', updateTeacherAssignment);
router.delete('/:id', deleteTeacherAssignment);

export default router;
