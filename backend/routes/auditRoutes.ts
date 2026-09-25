import { Router } from 'express';
import { getAuditLogs, addActivityLog } from '../controllers/auditController';

const router = Router();

router.get('/', getAuditLogs);
router.post('/activity', addActivityLog);

export default router;
