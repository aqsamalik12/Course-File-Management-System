import { Router } from 'express';
import { upload } from '../middlewares/uploadMiddleware';
import {
  getTemplates,
  uploadTemplate,
  getInstructions,
  updateInstructions
} from '../controllers/templateController';

const router = Router();

router.get('/', getTemplates);
router.post('/', upload.single('file'), uploadTemplate);
router.get('/templates', getTemplates);
router.post('/templates', upload.single('file'), uploadTemplate);
router.get('/instructions', getInstructions);
router.post('/instructions', upload.single('file'), updateInstructions);

export default router;
