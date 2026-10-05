import { Router } from 'express';
import {
  getCourses,
  createCourse,
  updateCourse,
  deleteCourse,
  getMyCourses,
  assignMyCourse,
  deleteMyCourse
} from '../controllers/courseController';

const router = Router();

// Teacher course assignment endpoints
router.get('/my-courses', getMyCourses);
router.post('/my-courses', assignMyCourse);
router.delete('/my-courses/:id', deleteMyCourse);

router.get('/', getCourses);
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

export default router;
