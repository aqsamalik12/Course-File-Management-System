import { Router } from 'express';
import {
  getDeadlines,
  createDeadline,
  updateDeadline,
  deleteDeadline
} from '../controllers/deadlineController';

const router = Router();

router.get('/', getDeadlines);
router.post('/', createDeadline);
router.put('/:id', updateDeadline);
router.delete('/:id', deleteDeadline);

export default router;
