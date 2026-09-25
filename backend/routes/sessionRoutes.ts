import { Router } from 'express';
import {
  getSessions,
  createSession,
  getSubmissionWindow,
  updateSubmissionWindow
} from '../controllers/sessionController';

const router = Router();

router.get('/sessions', getSessions);
router.post('/sessions', createSession);
router.get('/submission-window', getSubmissionWindow);
router.put('/submission-window', updateSubmissionWindow);

export default router;
