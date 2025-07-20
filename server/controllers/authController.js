
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

function parseSkills(skills) {
  if (!skills) return [];
  if (Array.isArray(skills)) return skills;
  return skills.split(',').map(skill => skill.trim()).filter(Boolean);
}

export const register = async (req, res) => {
  // console.log('🔍 req.body:', req.body);
  // console.log('📎 req.file:', req.file);

  try {
    const { email, password, firstName, lastName, role, company, phone, skills } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    let resumeUrl = null;
    if (role === 'candidate') {
      if (!req.file) return res.status(400).json({ success: false, message: 'Resume is required' });
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { resource_type: 'auto', folder: 'ats-resumes' },
          (err, result) => err ? reject(err) : resolve(result)
        ).end(req.file.buffer);
      });
      resumeUrl = result.secure_url;
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName,
      role,
      company: role === 'recruiter' ? company : undefined,
      phone,
      resume: resumeUrl,
      skills: parseSkills(skills)
    });

    await user.save();

    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.userEmail = user.email;

    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company,
        phone: user.phone,
        resume: user.resume,
        skills: user.skills,
      }
    });
  } catch (error) {
    console.log("in the register catch")
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Registration failed', error: error.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findOne({ email, role, isActive: true });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    req.session.userId = user._id;
    req.session.userRole = user.role;
    req.session.userEmail = user.email;

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        company: user.company,
        phone: user.phone,
        resume: user.resume,
        skills: user.skills,
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed', error: error.message });
  }
};

export const logout = (req, res) => {
  req.session.destroy(err => {
    if (err) return res.status(500).json({ success: false, message: 'Logout failed' });
    res.clearCookie('connect.sid');
    res.json({ success: true, message: 'Logout successful' });
  });
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.session.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' });
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
        role: req.session.userRole,
      }
    });
  } else {
    res.json({ success: true, isAuthenticated: false });
  }
};