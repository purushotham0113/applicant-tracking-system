import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

export const register = async (req, res) => {
  try {
    const { email, password, firstName, lastName, role, company, phone, skills } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    let resumeUrl = null;
    
    // Handle resume upload for candidates
    if (role === 'candidate' && req.file) {
      try {
        const result = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream(
            { 
              resource_type: 'auto',
              folder: 'ats-resumes',
              public_id: `resume-${Date.now()}`
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          ).end(req.file.buffer);
        });
        
        resumeUrl = result.secure_url;
      } catch (uploadError) {
        return res.status(500).json({
          success: false,
          message: 'Failed to upload resume'
        });
      }
    }
    
    // Create user
    const userData = {
      email,
      password,
      firstName,
      lastName,
      role,
      phone,
      skills: skills ? skills.split(',').map(skill => skill.trim()) : []
    };
    
    if (role === 'recruiter') {
      userData.company = company;
    }
    
    if (role === 'candidate' && resumeUrl) {
      userData.resume = resumeUrl;
    }
    
    const user = new User(userData);
    await user.save();
    
    // Set session
    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.userEmail = user.email;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company,
        phone: user.phone,
        skills: user.skills,
        resume: user.resume
      }
    });
    
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    // Find user by email and role
    const user = await User.findOne({ email, role, isActive: true });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Set session
    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.userEmail = user.email;
    
    res.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company,
        phone: user.phone,
        skills: user.skills,
        resume: user.resume
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    });
  }
};

export const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
    
    res.clearCookie('connect.sid');
    res.json({
      success: true,
      message: 'Logout successful'
    });
  });
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.json({
      success: true,
      user
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch profile',
      error: error.message
    });
  }
};

export const checkAuth = (req, res) => {
  if (req.session.userId) {
    res.json({
      success: true,
      isAuthenticated: true,
      user: {
        id: req.session.userId,
        email: req.session.userEmail,
        role: req.session.userRole
      }
    });
  } else {
    res.json({
      success: true,
      isAuthenticated: false
    });
  }
};