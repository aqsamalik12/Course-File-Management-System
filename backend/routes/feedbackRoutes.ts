import { Router } from 'express';
import { getFeedback, submitFeedback, respondToFeedback } from '../controllers/feedbackController';

const router = Router();

router.get('/', getFeedback);
router.post('/', submitFeedback);
router.patch('/:id/respond', respondToFeedback);

export default router;
