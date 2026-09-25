import { Router } from 'express';
import {
  getNotifications,
  markAsRead,
  clearAll
} from '../controllers/notificationController';

const router = Router();

router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.post('/clear-all', clearAll);

export default router;
