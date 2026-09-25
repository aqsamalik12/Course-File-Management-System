import { Router } from 'express';
import {
  getReportsSummary,
  getDepartmentReports
} from '../controllers/reportController';

const router = Router();

router.get('/summary', getReportsSummary);
router.get('/departments', getDepartmentReports);

export default router;
