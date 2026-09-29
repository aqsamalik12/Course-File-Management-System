import { Router } from 'express';
import {
  getSections,
  getSectionById,
  createSection,
  updateSection,
  deleteSection
} from '../controllers/sectionController';

const router = Router();

router.get('/', getSections);
router.get('/:id', getSectionById);
router.post('/', createSection);
router.put('/:id', updateSection);
router.delete('/:id', deleteSection);

export default router;
