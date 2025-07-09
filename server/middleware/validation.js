import { body, validationResult } from 'express-validator';

export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

export const validateRegister = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstName').trim().isLength({ min: 1 }).withMessage('First name is required'),
  body('lastName').trim().isLength({ min: 1 }).withMessage('Last name is required'),
  body('role').isIn(['recruiter', 'candidate']).withMessage('Invalid role'),
  body('company').optional().trim(),
  body('phone').optional().trim(),
  handleValidationErrors
];

export const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

export const validateJob = [
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Job title is required (max 100 characters)'),
  body('description').trim().isLength({ min: 1, max: 2000 }).withMessage('Job description is required (max 2000 characters)'),
  body('location').trim().isLength({ min: 1 }).withMessage('Location is required'),
  body('company').trim().isLength({ min: 1 }).withMessage('Company name is required'),
  body('experienceLevel').isIn(['Entry', 'Mid', 'Senior', 'Lead']).withMessage('Invalid experience level'),
  body('jobType').optional().isIn(['Full-time', 'Part-time', 'Contract', 'Internship']).withMessage('Invalid job type'),
  body('deadline').isISO8601().withMessage('Valid deadline date is required'),
  handleValidationErrors
];

export const validateApplication = [
  body('coverLetter').optional().trim().isLength({ max: 1000 }).withMessage('Cover letter cannot exceed 1000 characters'),
  handleValidationErrors
];

export const validateStatusUpdate = [
  body('status').isIn(['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Hired']).withMessage('Invalid status'),
  body('notes').optional().trim(),
  handleValidationErrors
];