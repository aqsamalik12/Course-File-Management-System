import { Router } from 'express';
import {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
  assignDepartmentHOD
} from '../controllers/departmentController';

const router = Router();

router.get('/', getDepartments);
router.post('/', createDepartment);
router.put('/:id', updateDepartment);
router.put('/:id/assign-hod', assignDepartmentHOD);
router.patch('/:id/assign-hod', assignDepartmentHOD);
router.delete('/:id', deleteDepartment);

export default router;
