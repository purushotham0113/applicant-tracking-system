import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { jobsAPI, applicationsAPI } from '../services/api'
import { MapPin, Clock, Building, Users, Calendar, FileText, X } from 'lucide-react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const JobDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isApplying, setIsApplying] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [applicationData, setApplicationData] = useState({
    coverLetter: ''
  })
  const [resumeFile, setResumeFile] = useState(null)

  useEffect(() => {
    fetchJob()
  }, [id])

  const fetchJob = async () => {
    try {
      const response = await jobsAPI.getJobById(id)
      setJob(response.data.job)
    } catch (error) {
      toast.error('Failed to fetch job details')
      navigate('/jobs')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!user) {
      toast.error('Please login to apply for jobs')
      navigate('/login')
      return
    }

    if (user.role !== 'candidate') {
      toast.error('Only candidates can apply for jobs')
      return
    }

    setShowApplicationModal(true)
  }

  const handleSubmitApplication = async (e) => {
    e.preventDefault()
    setIsApplying(true)

    try {
      await applicationsAPI.applyForJob(id, applicationData, resumeFile)
      toast.success('Application submitted successfully!')
      setShowApplicationModal(false)
      setApplicationData({ coverLetter: '' })
      setResumeFile(null)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit application')
    } finally {
      setIsApplying(false)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setResumeFile(file)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Job not found</h1>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="card">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-4">
            <div className="flex items-center">
              <Building className="h-5 w-5 mr-2" />
              {job.company}
            </div>
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2" />
              {job.location}
            </div>
            <div className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              {format(new Date(job.createdAt), 'MMM d, yyyy')}
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-2" />
              {job.applicationsCount} applications
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="status-badge status-applied">{job.experienceLevel}</span>
            <span className="status-badge status-shortlisted">{job.jobType}</span>
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              Apply by {format(new Date(job.deadline), 'MMM d, yyyy')}
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Job Description</h2>
                <div className="prose prose-sm max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-primary-100 text-primary-800 text-sm rounded-full">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {job.techStack.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Tech Stack</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.techStack.map((tech, index) => (
                      <span key={index} className="px-3 py-1 bg-gray-100 text-gray-800 text-sm rounded-full">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-1">
            <div className="card bg-gray-50 border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Details</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Experience Level</span>
                  <p className="text-gray-900">{job.experienceLevel}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Job Type</span>
                  <p className="text-gray-900">{job.jobType}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Company</span>
                  <p className="text-gray-900">{job.company}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Location</span>
                  <p className="text-gray-900">{job.location}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Posted By</span>
                  <p className="text-gray-900">{job.postedBy.firstName} {job.postedBy.lastName}</p>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <button
                onClick={handleApply}
                className="btn btn-primary w-full py-3"
                disabled={new Date(job.deadline) < new Date()}
              >
                {new Date(job.deadline) < new Date() ? 'Application Closed' : 'Apply for Job'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Apply for {job.title}</h2>
              <button
                onClick={() => setShowApplicationModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmitApplication}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter (optional)
                  </label>
                  <textarea
                    value={applicationData.coverLetter}
                    onChange={(e) => setApplicationData({
                      ...applicationData,
                      coverLetter: e.target.value
                    })}
                    rows={4}
                    className="textarea"
                    placeholder="Tell us why you're interested in this position..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume (optional - will use your profile resume if not provided)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleFileChange}
                      className="input pl-10"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Max file size: 5MB</p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowApplicationModal(false)}
                  className="btn btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isApplying}
                  className="btn btn-primary flex-1 disabled:opacity-50"
                >
                  {isApplying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default JobDetail