export const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in.'
    });
  }
  next();
};

export const requireRecruiter = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in.'
    });
  }

  if (req.session.userRole !== 'recruiter') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Recruiter privileges required.'
    });
  }

  next();
};

export const requireCandidate = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. Please log in.'
    });
  }

  if (req.session.userRole !== 'candidate') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Candidate privileges required.'
    });
  }

  next();
};