import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';


export const applyForJob = async (req, res) => {
  // //console.log('📥 applyForJob controller triggered');

  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;

    // … your job existence and duplicate‐apply checks …

    let resumeUrl;
    const candidate = await User.findById(req.session.userId);

    if (req.file) {
      //console.log('📎 File received:', req.file.originalname, req.file.mimetype, req.file.size);

      try {
        // upload to Cloudinary as a raw file
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            {
              resource_type: 'raw',
              folder: 'ats-resumes',
              public_id: `resume-${req.session.userId}-${Date.now()}`,
              format: 'pdf'
            },
            (error, result) => (error ? reject(error) : resolve(result))
          ).end(req.file.buffer);
        });

        // log the Cloudinary response
        // //console.log('✅ Cloudinary upload result:', result);

        // assign the outer resumeUrl (no `const` here!)
        resumeUrl = cloudinary.url(result.public_id, {
          resource_type: 'raw',
          secure: true
        });

        // //console.log('🔗 Final resume URL:', resumeUrl);

      } catch (uploadError) {
        // //console.error('❌ Error uploading to Cloudinary:', uploadError);
        return res.status(500).json({ success: false, message: 'Failed to upload resume', error: uploadError.message });
      }
    } else {
      // no new file—use existing
      resumeUrl = candidate.resume;
      //console.log('ℹ️ Using existing resume URL:', resumeUrl);
    }

    if (!resumeUrl) {
      return res.status(400).json({ success: false, message: 'Resume is required' });
    }

    // Create and save the application
    const application = new Application({ job: jobId, candidate: req.session.userId, resume: resumeUrl, coverLetter });
    await application.save();
    await Job.findByIdAndUpdate(jobId, { $inc: { applicationsCount: 1 } });

    res.status(201).json({ success: true, message: 'Application submitted successfully', application });

  } catch (error) {
    //console.error('Apply for job error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit application', error: error.message });
  }
};

export const getCandidateApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const applications = await Application.find({ candidate: req.session.userId })
      .populate('job', 'title company location experienceLevel jobType deadline')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments({ candidate: req.session.userId });

    res.json({
      success: true,
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    //console.error('Get candidate applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

export const getJobApplications = async (req, res) => {
  try {
    const { jobId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if job exists and user is the owner
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.postedBy.toString() !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }

    const { status } = req.query;
    let query = { job: jobId };

    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('candidate', 'firstName lastName email phone skills')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    //console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, notes } = req.body;

    const application = await Application.findById(applicationId).populate('job');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is the job owner
    if (application.job.postedBy.toString() !== req.session.userId) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    application.status = status;
    application.notes = notes;
    application.statusUpdatedBy = req.session.userId;

    await application.save();

    res.json({
      success: true,
      message: 'Application status updated successfully',
      application
    });

  } catch (error) {
    //console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application status',
      error: error.message
    });
  }
};

export const getApplicationById = async (req, res) => {
  try {
    const { applicationId } = req.params;

    const application = await Application.findById(applicationId)
      .populate('job', 'title company location experienceLevel')
      .populate('candidate', 'firstName lastName email phone skills')
      .populate('statusUpdatedBy', 'firstName lastName');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check authorization
    const isCandidate = application.candidate._id.toString() === req.session.userId;
    const isRecruiter = application.job.postedBy && application.job.postedBy.toString() === req.session.userId;

    if (!isCandidate && !isRecruiter) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.json({
      success: true,
      application
    });

  } catch (error) {
    //console.error('Get application by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message
    });
  }
};

export const getRecruiterApplications = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const { status } = req.query;

    // Get all jobs posted by the recruiter
    const jobs = await Job.find({ postedBy: req.session.userId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    let query = { job: { $in: jobIds } };

    if (status) {
      query.status = status;
    }

    const applications = await Application.find(query)
      .populate('job', 'title company location')
      .populate('candidate', 'firstName lastName email phone skills')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(query);

    res.json({
      success: true,
      applications,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    //console.error('Get recruiter applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message
    });
  }
};