import { Router } from 'express';
import {
  getHODAssignments,
  getMyHODScope,
  lookupHODForScope,
  createHODAssignment,
  updateHODAssignment,
  deleteHODAssignment,
  resetHODPassword
} from '../controllers/hodAssignmentController';

const router = Router();

// Lookup scope for teacher profile flow (Campus + Department -> Assigned HOD)
router.get('/lookup', lookupHODForScope);

// HOD's own authorized scope
router.get('/my-scope', getMyHODScope);

// Admin listing and management
router.get('/', getHODAssignments);
router.post('/', createHODAssignment);
router.put('/:id', updateHODAssignment);
router.post('/:id/reset-password', resetHODPassword);
router.delete('/:id', deleteHODAssignment);

export default router;
