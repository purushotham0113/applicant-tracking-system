import express from 'express';
import { register, login, logout, getProfile, checkAuth } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';
import { uploadResume, handleUploadError } from '../middleware/upload.js';

const router = express.Router();

// Auth routes
router.post('/register', uploadResume, handleUploadError, validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/logout', logout);
router.get('/profile', requireAuth, getProfile);
router.get('/check', checkAuth);

export default router;