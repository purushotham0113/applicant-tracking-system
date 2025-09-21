
import axios from 'axios';

// const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://applicant-tracking-system-1-ubom.onrender.com/api';
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5500/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData, file) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      if (key === 'skills') {
        formData.append(key, userData[key].join(','));
      } else {
        formData.append(key, userData[key]);
      }
    });
    if (file) formData.append('resume', file);
    return api.post('/auth/register', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
  checkAuth: () => api.get('/auth/check'),
};

export const jobsAPI = {
  getJobs: (params = {}) => api.get('/jobs', { params }),
  getJobById: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getRecruiterJobs: (params = {}) => api.get('/jobs/recruiter/my-jobs', { params }),
};

export const applicationsAPI = {
  applyForJob: (jobId, data, file) => {
    const formData = new FormData();
    if (data.coverLetter) {
      formData.append('coverLetter', data.coverLetter);
    }
    if (file) {
      formData.append('resume', file);
    }
    return api.post(`/applications/apply/${jobId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getCandidateApplications: (params = {}) => api.get('/applications/my-applications', { params }),
  getJobApplications: (jobId, params = {}) => api.get(`/applications/job/${jobId}`, { params }),


  getRecruiterApplications: (params = {}) => api.get('/applications/recruiter/all', { params }),
  updateApplicationStatus: (applicationId, statusData) => api.patch(`/applications/${applicationId}/status`, statusData),
  getApplicationById: (applicationId) => api.get(`/applications/${applicationId}`),
};


export default api;
