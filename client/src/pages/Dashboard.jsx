import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Link } from 'react-router-dom'
import { jobsAPI, applicationsAPI } from '../services/api'
import { Plus, Briefcase, Users, Clock, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({})
  const [recentJobs, setRecentJobs] = useState([])
  const [recentApplications, setRecentApplications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      if (user.role === 'recruiter') {
        const [jobsResponse, applicationsResponse] = await Promise.all([
          jobsAPI.getRecruiterJobs({ limit: 5 }),
          applicationsAPI.getRecruiterApplications({ limit: 5 })
        ])
        
        setRecentJobs(jobsResponse.data.jobs)
        setRecentApplications(applicationsResponse.data.applications)
        
        setStats({
          totalJobs: jobsResponse.data.pagination.total,
          totalApplications: applicationsResponse.data.pagination.total,
          activeJobs: jobsResponse.data.jobs.filter(job => job.isActive).length,
          pendingApplications: applicationsResponse.data.applications.filter(app => app.status === 'Applied').length
        })
      } else {
        const applicationsResponse = await applicationsAPI.getCandidateApplications({ limit: 5 })
        setRecentApplications(applicationsResponse.data.applications)
        
        const statusCounts = applicationsResponse.data.applications.reduce((acc, app) => {
          acc[app.status] = (acc[app.status] || 0) + 1
          return acc
        }, {})
        
        setStats({
          totalApplications: applicationsResponse.data.pagination.total,
          pendingApplications: statusCounts.Applied || 0,
          interviewApplications: statusCounts.Interview || 0,
          hiredApplications: statusCounts.Hired || 0
        })
      }
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      try {
        await jobsAPI.deleteJob(jobId)
        toast.success('Job deleted successfully')
        fetchDashboardData()
      } catch (error) {
        toast.error('Failed to delete job')
      }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user.firstName}!
        </h1>
        <p className="text-gray-600">
          {user.role === 'recruiter' ? 'Manage your job postings and applications' : 'Track your job applications'}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {user.role === 'recruiter' ? (
          <>
            <div className="card bg-primary-50 border-primary-200">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Briefcase className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-primary-600">Total Jobs</p>
                  <p className="text-2xl font-bold text-primary-900">{stats.totalJobs}</p>
                </div>
              </div>
            </div>
            <div className="card bg-success-50 border-success-200">
              <div className="flex items-center">
                <div className="p-3 bg-success-100 rounded-full">
                  <Users className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-success-600">Total Applications</p>
                  <p className="text-2xl font-bold text-success-900">{stats.totalApplications}</p>
                </div>
              </div>
            </div>
            <div className="card bg-warning-50 border-warning-200">
              <div className="flex items-center">
                <div className="p-3 bg-warning-100 rounded-full">
                  <Clock className="h-6 w-6 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-warning-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-warning-900">{stats.activeJobs}</p>
                </div>
              </div>
            </div>
            <div className="card bg-error-50 border-error-200">
              <div className="flex items-center">
                <div className="p-3 bg-error-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-error-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-error-600">Pending Reviews</p>
                  <p className="text-2xl font-bold text-error-900">{stats.pendingApplications}</p>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="card bg-primary-50 border-primary-200">
              <div className="flex items-center">
                <div className="p-3 bg-primary-100 rounded-full">
                  <Briefcase className="h-6 w-6 text-primary-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-primary-600">Total Applications</p>
                  <p className="text-2xl font-bold text-primary-900">{stats.totalApplications}</p>
                </div>
              </div>
            </div>
            <div className="card bg-warning-50 border-warning-200">
              <div className="flex items-center">
                <div className="p-3 bg-warning-100 rounded-full">
                  <Clock className="h-6 w-6 text-warning-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-warning-600">Pending</p>
                  <p className="text-2xl font-bold text-warning-900">{stats.pendingApplications}</p>
                </div>
              </div>
            </div>
            <div className="card bg-success-50 border-success-200">
              <div className="flex items-center">
                <div className="p-3 bg-success-100 rounded-full">
                  <Users className="h-6 w-6 text-success-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-success-600">Interviews</p>
                  <p className="text-2xl font-bold text-success-900">{stats.interviewApplications}</p>
                </div>
              </div>
            </div>
            <div className="card bg-green-50 border-green-200">
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <TrendingUp className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-green-600">Hired</p>
                  <p className="text-2xl font-bold text-green-900">{stats.hiredApplications}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Jobs (Recruiter) or Recent Applications (Candidate) */}
        {user.role === 'recruiter' ? (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Jobs</h2>
              <Link to="/create-job" className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Post Job
              </Link>
            </div>
            <div className="space-y-4">
              {recentJobs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No jobs posted yet</p>
              ) : (
                recentJobs.map((job) => (
                  <div key={job._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{job.title}</h3>
                      <p className="text-sm text-gray-600">{job.company} • {job.location}</p>
                      <p className="text-xs text-gray-500">
                        {job.applicationsCount} applications • {format(new Date(job.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/jobs/${job._id}`}
                        className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                      <Link
                        to={`/edit-job/${job._id}`}
                        className="p-2 text-gray-500 hover:text-warning-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteJob(job._id)}
                        className="p-2 text-gray-500 hover:text-error-600 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentJobs.length > 0 && (
              <div className="mt-4 text-center">
                <Link to="/applications" className="text-primary-600 hover:text-primary-800">
                  View all jobs →
                </Link>
              </div>
            )}
          </div>
        ) : (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
              <Link to="/jobs" className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                Browse Jobs
              </Link>
            </div>
            <div className="space-y-4">
              {recentApplications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No applications yet</p>
              ) : (
                recentApplications.map((application) => (
                  <div key={application._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{application.job.title}</h3>
                      <p className="text-sm text-gray-600">{application.job.company} • {application.job.location}</p>
                      <p className="text-xs text-gray-500">
                        Applied on {format(new Date(application.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`status-badge status-${application.status.toLowerCase()}`}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            {recentApplications.length > 0 && (
              <div className="mt-4 text-center">
                <Link to="/applications" className="text-primary-600 hover:text-primary-800">
                  View all applications →
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Recent Applications (Recruiter) */}
        {user.role === 'recruiter' && (
          <div className="card">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
              <Link to="/applications" className="text-primary-600 hover:text-primary-800">
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {recentApplications.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No applications yet</p>
              ) : (
                recentApplications.map((application) => (
                  <div key={application._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {application.candidate.firstName} {application.candidate.lastName}
                      </h3>
                      <p className="text-sm text-gray-600">{application.job.title}</p>
                      <p className="text-xs text-gray-500">
                        Applied on {format(new Date(application.createdAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`status-badge status-${application.status.toLowerCase()}`}>
                        {application.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard