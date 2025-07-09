# ATS - Applicant Tracking System

A full-stack MERN (MongoDB, Express, React, Node.js) application for managing job postings and applications with session-based authentication.

## Features

### For Recruiters
- 🔐 Secure session-based authentication
- 📝 Create, edit, and delete job postings
- 👥 View and manage job applications
- 📊 Update application status (Applied, Shortlisted, Interview, Rejected, Hired)
- 📈 Professional dashboard with analytics
- 🔍 Search and filter applications

### For Candidates
- 🔐 Secure user registration and login
- 📄 Upload resume during registration
- 🔍 Browse and search job listings
- 📋 Apply to jobs with optional cover letter
- 📊 Track application status
- 💼 Personal dashboard to manage applications

### Technical Features
- 🛡️ Session-based authentication with MongoDB session store
- 📁 File upload with Cloudinary integration
- 🎨 Responsive design with Tailwind CSS
- 🔔 Toast notifications for user feedback
- 📱 Mobile-first responsive design
- 🔍 Advanced search and filtering
- 📄 Pagination for large datasets

## Tech Stack

### Frontend
- **React** - UI framework
- **React Router DOM** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Toastify** - Notifications
- **Date-fns** - Date formatting

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **Express Session** - Session management
- **Connect Mongo** - Session store
- **BCrypt** - Password hashing
- **Multer** - File upload
- **Cloudinary** - File storage
- **Express Validator** - Input validation

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB Atlas account
- Cloudinary account

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the server directory:
```bash
cp .env.example .env
```

4. Update the `.env` file with your credentials:
```env
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/ats
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SESSION_SECRET=your_session_secret
BASE_URL=http://localhost:5000
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

5. Start the development server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/profile` - Get user profile
- `GET /api/auth/check` - Check authentication status

### Jobs
- `GET /api/jobs` - Get all jobs (public)
- `GET /api/jobs/:id` - Get job by ID
- `POST /api/jobs` - Create job (recruiter only)
- `PUT /api/jobs/:id` - Update job (recruiter only)
- `DELETE /api/jobs/:id` - Delete job (recruiter only)
- `GET /api/jobs/recruiter/my-jobs` - Get recruiter's jobs

### Applications
- `POST /api/applications/apply/:jobId` - Apply for job (candidate only)
- `GET /api/applications/my-applications` - Get candidate's applications
- `GET /api/applications/job/:jobId` - Get job applications (recruiter only)
- `GET /api/applications/recruiter/all` - Get all recruiter applications
- `PATCH /api/applications/:id/status` - Update application status
- `GET /api/applications/:id` - Get application details

## Database Schema

### User Model
```javascript
{
  email: String (unique, required),
  password: String (required, hashed),
  firstName: String (required),
  lastName: String (required),
  role: String (enum: ['recruiter', 'candidate'], required),
  company: String (required for recruiters),
  phone: String,
  resume: String (Cloudinary URL, required for candidates),
  skills: [String],
  isActive: Boolean (default: true),
  timestamps: true
}
```

### Job Model
```javascript
{
  title: String (required),
  description: String (required),
  location: String (required),
  company: String (required),
  requiredSkills: [String],
  techStack: [String],
  experienceLevel: String (enum: ['Entry', 'Mid', 'Senior', 'Lead']),
  jobType: String (enum: ['Full-time', 'Part-time', 'Contract', 'Internship']),
  salary: {
    min: Number,
    max: Number,
    currency: String (default: 'USD')
  },
  deadline: Date (required),
  postedBy: ObjectId (ref: 'User', required),
  isActive: Boolean (default: true),
  applicationsCount: Number (default: 0),
  timestamps: true
}
```

### Application Model
```javascript
{
  job: ObjectId (ref: 'Job', required),
  candidate: ObjectId (ref: 'User', required),
  status: String (enum: ['Applied', 'Shortlisted', 'Interview', 'Rejected', 'Hired']),
  resume: String (Cloudinary URL, required),
  coverLetter: String,
  appliedAt: Date (default: Date.now),
  statusUpdatedAt: Date,
  statusUpdatedBy: ObjectId (ref: 'User'),
  notes: String,
  timestamps: true
}
```

## Deployment

### Backend Deployment (Render)

1. Create a new Web Service on Render
2. Connect your GitHub repository
3. Set the build command: `npm install`
4. Set the start command: `npm start`
5. Add environment variables in Render dashboard
6. Deploy

### Frontend Deployment (Vercel)

1. Install Vercel CLI: `npm i -g vercel`
2. In the client directory, run: `vercel`
3. Follow the prompts to deploy
4. Update the API URL in your environment variables

## Environment Variables

### Server (.env)
```env
MONGO_URI=mongodb+srv://username:password@cluster0.mongodb.net/ats
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SESSION_SECRET=your_session_secret
BASE_URL=https://your-app.onrender.com
CLIENT_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Client (.env.local)
```env
VITE_API_URL=https://your-backend-url.onrender.com/api
```

## Demo Credentials

For testing purposes, you can use these demo credentials:

**Recruiter Account:**
- Email: recruiter@demo.com
- Password: password123

**Candidate Account:**
- Email: candidate@demo.com
- Password: password123

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License.

## Support

For support, please contact [your-email@example.com](mailto:your-email@example.com) or create an issue in the repository.