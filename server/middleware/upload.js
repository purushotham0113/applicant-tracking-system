import multer from 'multer';

// Use memory storage since you'll stream the file to Cloudinary
const storage = multer.memoryStorage();

// File type filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error('Invalid file type. Only PDF and Word documents are allowed.'),
      false
    );
  }
};

// Configure multer
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
});

// Exported middleware to handle single file uploads
export const uploadResume = upload.single('resume');

// Middleware to handle any multer-related upload errors
export const handleUploadError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 5MB.',
      });
    }
    return res.status(400).json({
      success: false,
      message: `Multer error: ${err.message}`,
    });
  }

  // Custom error from fileFilter
  if (err && err.message && err.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  // Pass other errors to the global error handler (if any)
  if (err) {
    return res.status(500).json({
      success: false,
      message: 'Unexpected file upload error',
      error: err.message,
    });
  }

  next();
};

// import multer from 'multer';
// import path from 'path';

// const storage = multer.memoryStorage();

// const fileFilter = (req, file, cb) => {
//   const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error('Invalid file type. Only PDF and Word documents are allowed.'), false);
//   }
// };

// const upload = multer({
//   storage,
//   fileFilter,
//   limits: {
//     fileSize: 5 * 1024 * 1024 // 5MB limit
//   }
// });

// export const uploadResume = upload.single('resume');

// export const handleUploadError = (err, req, res, next) => {
//   if (err instanceof multer.MulterError) {
//     if (err.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({
//         success: false,
//         message: 'File size too large. Maximum size is 5MB.'
//       });
//     }
//   }

//   if (err && err.message && err.message.includes('Invalid file type')) {
//     return res.status(400).json({
//       success: false,
//       message: 'Invalid file type. Only PDF and Word documents are allowed.'
//     });
//   }

//   if (err) return next(err);
//   next();
// };