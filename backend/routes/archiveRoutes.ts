import { Router } from 'express';
import {
  getArchives,
  restoreArchive,
  deleteArchive
} from '../controllers/archiveController';

const router = Router();

router.get('/', getArchives);
router.patch('/:id/restore', restoreArchive);
router.delete('/:id', deleteArchive);

export default router;
