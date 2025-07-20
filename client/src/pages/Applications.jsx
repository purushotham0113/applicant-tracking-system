import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { applicationsAPI } from '../services/api'
import { Search, Filter, Eye, Edit, ExternalLink } from 'lucide-react'
import { toast } from 'react-toastify'
import { format } from 'date-fns'

const Applications = () => {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: '',
    search: ''
  })
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  })
  const [selectedApplication, setSelectedApplication] = useState(null)
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: ''
  })

  useEffect(() => {
    fetchApplications()
  }, [filters, pagination.page])

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const response = user.role === 'recruiter'
        ? await applicationsAPI.getRecruiterApplications({
          ...filters,
          page: pagination.page,
          limit: pagination.limit
        })
        : await applicationsAPI.getCandidateApplications({
          page: pagination.page,
          limit: pagination.limit
        })

      setApplications(response.data.applications)
      setPagination(response.data.pagination)
    } catch (error) {
      toast.error('Failed to fetch applications')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
    setPagination({ ...pagination, page: 1 })
  }

  const handleStatusUpdate = async (applicationId) => {
    try {
      await applicationsAPI.updateApplicationStatus(applicationId, statusUpdate)
      toast.success('Application status updated successfully')
      setSelectedApplication(null)
      setStatusUpdate({ status: '', notes: '' })
      fetchApplications()
    } catch (error) {
      toast.error('Failed to update application status')
    }
  }

  const handlePageChange = (newPage) => {
    setPagination({ ...pagination, page: newPage })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'Applied': return 'status-applied'
      case 'Shortlisted': return 'status-shortlisted'
      case 'Interview': return 'status-interview'
      case 'Rejected': return 'status-rejected'
      case 'Hired': return 'status-hired'
      default: return 'status-applied'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {user.role === 'recruiter' ? 'Applications Management' : 'My Applications'}
        </h1>
        <p className="text-gray-600">
          {user.role === 'recruiter'
            ? 'Review and manage candidate applications'
            : 'Track the status of your job applications'
          }
        </p>
      </div>

      {/* Filters */}
      <div className="card mb-8">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              placeholder={user.role === 'recruiter' ? 'Search candidates...' : 'Search jobs...'}
              className="input pl-10"
            />
          </div>
          <select
            name="status"
            value={filters.status}
            onChange={handleFilterChange}
            className="select"
          >
            <option value="">All Status</option>
            <option value="Applied">Applied</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
            <option value="Hired">Hired</option>
          </select>
          <div className="flex items-center">
            <Filter className="h-4 w-4 mr-2 text-gray-400" />
            <span className="text-sm text-gray-600">
              {pagination.total} applications found
            </span>
          </div>
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
              <p className="text-gray-600">
                {user.role === 'recruiter'
                  ? 'No applications have been submitted yet'
                  : 'You haven\'t applied to any jobs yet'
                }
              </p>
            </div>
          ) : (
            applications.map((application) => (

              <div key={application._id} className="card hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {user.role === 'recruiter'
                          ? `${application.candidate.firstName} ${application.candidate.lastName}`
                          : application.job.title
                        }
                      </h3>
                      <span className={`status-badge ${getStatusColor(application.status)}`}>
                        {application.status}
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-2">
                      {user.role === 'recruiter' ? (
                        <>
                          <p>Applied for: {application.job.title}</p>
                          <p>Email: {application.candidate.email}</p>
                          <p>Phone: {application.candidate.phone}</p>
                        </>
                      ) : (
                        <>
                          <p>Company: {application.job.company}</p>
                          <p>Location: {application.job.location}</p>
                          <p>Type: {application.job.jobType}</p>
                        </>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-2">
                      {user.role === 'recruiter'
                        ? application.candidate.skills.slice(0, 3).map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded">
                            {skill}
                          </span>
                        ))
                        : application.job.experienceLevel && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                            {application.job.experienceLevel}
                          </span>
                        )
                      }
                    </div>

                    <p className="text-xs text-gray-500">
                      Applied on {format(new Date(application.createdAt), 'MMM d, yyyy')}
                      {application.statusUpdatedAt && application.statusUpdatedAt !== application.createdAt && (
                        <> • Status updated on {format(new Date(application.statusUpdatedAt), 'MMM d, yyyy')}</>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    {user.role === 'recruiter' && (
                      <button
                        onClick={() => {
                          setSelectedApplication(application)
                          setStatusUpdate({
                            status: application.status,
                            notes: application.notes || ''
                          })
                        }}
                        className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                    )}

                    <a
                      href={application.resume}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 text-gray-500 hover:text-primary-600 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </div>

                {application.coverLetter && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Cover Letter</h4>
                    <p className="text-sm text-gray-700">{application.coverLetter}</p>
                  </div>
                )}

                {application.notes && (
                  <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Notes</h4>
                    <p className="text-sm text-gray-700">{application.notes}</p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="mt-8 flex justify-center">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="btn btn-secondary disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm text-gray-600">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="btn btn-secondary disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-semibold mb-4">Update Application Status</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={statusUpdate.status}
                  onChange={(e) => setStatusUpdate({
                    ...statusUpdate,
                    status: e.target.value
                  })}
                  className="select"
                >
                  <option value="Applied">Applied</option>
                  <option value="Shortlisted">Shortlisted</option>
                  <option value="Interview">Interview</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Hired">Hired</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (optional)
                </label>
                <textarea
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate({
                    ...statusUpdate,
                    notes: e.target.value
                  })}
                  rows={3}
                  className="textarea"
                  placeholder="Add any notes about this application..."
                />
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={() => setSelectedApplication(null)}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedApplication._id)}
                className="btn btn-primary flex-1"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Applications