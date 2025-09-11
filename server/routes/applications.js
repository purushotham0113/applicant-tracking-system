import express from 'express';
import {
  applyForJob,
  getCandidateApplications,
  getJobApplications,
  updateApplicationStatus,
  getApplicationById,
  getRecruiterApplications
} from '../controllers/applicationController.js';
import { requireAuth, requireRecruiter, requireCandidate } from '../middleware/auth.js';
import { validateApplication, validateStatusUpdate } from '../middleware/validation.js';
import { uploadResume, handleUploadError } from '../middleware/upload.js';
import { isAuthenticated } from '../middleware/isAuthenticated.js';

const router = express.Router();

// Protected routes

router.use(requireAuth);

// Candidate routes
router.post('/apply/:jobId', requireCandidate, uploadResume, handleUploadError, validateApplication, applyForJob);
router.get('/my-applications', requireCandidate, getCandidateApplications);


// Recruiter routes
router.get('/recruiter/all', requireRecruiter, getRecruiterApplications);
router.get('/job/:jobId', requireRecruiter, getJobApplications);
router.patch('/:applicationId/status', requireRecruiter, validateStatusUpdate, updateApplicationStatus);

// Common routes (must be after all above or will catch everything)
router.get('/:applicationId', getApplicationById);

export default router;