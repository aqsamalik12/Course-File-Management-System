import { Router } from 'express';
import {
  login,
  registerTeacher,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword
} from '../controllers/authController';

const router = Router();

router.post('/login', login);
router.post('/register', registerTeacher);
router.post('/register-teacher', registerTeacher);
router.post('/logout', logout);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/change-password', changePassword);

export default router;
