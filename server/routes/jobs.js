import express from 'express';
import { 
  createJob, 
  getJobs, 
  getJobById, 
  updateJob, 
  deleteJob, 
  getRecruiterJobs 
} from '../controllers/jobController.js';
import { requireAuth, requireRecruiter } from '../middleware/auth.js';
import { validateJob } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.get('/', getJobs);
router.get('/:id', getJobById);

// Protected routes
router.use(requireAuth);

// Recruiter routes
router.post('/', requireRecruiter, validateJob, createJob);
router.put('/:id', requireRecruiter, validateJob, updateJob);
router.delete('/:id', requireRecruiter, deleteJob);
router.get('/recruiter/my-jobs', requireRecruiter, getRecruiterJobs);

export default router;