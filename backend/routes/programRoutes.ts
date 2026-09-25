import { Router } from 'express';
import {
  getPrograms,
  createProgram,
  updateProgram,
  deleteProgram
} from '../controllers/programController';

const router = Router();

router.get('/', getPrograms);
router.post('/', createProgram);
router.put('/:id', updateProgram);
router.delete('/:id', deleteProgram);

export default router;
