import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { jobsAPI } from '../services/api'
import { toast } from 'react-toastify'

const CreateJob = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    location: '',
    company: '',
    experienceLevel: 'Mid',
    jobType: 'Full-time',
    requiredSkills: [],
    techStack: [],
    deadline: '',
    salary: {
      min: '',
      max: '',
      currency: 'INR'
    }
  })
  const [skillsInput, setSkillsInput] = useState('')
  const [techStackInput, setTechStackInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('salary.')) {
      const field = name.split('.')[1]
      setFormData({
        ...formData,
        salary: {
          ...formData.salary,
          [field]: value
        }
      })
    } else {
      setFormData({
        ...formData,
        [name]: value
      })
    }
  }

  const handleSkillsChange = (e) => {
    const skills = e.target.value.split(',').map(skill => skill.trim()).filter(skill => skill)
    setSkillsInput(e.target.value)
    setFormData({
      ...formData,
      requiredSkills: skills
    })
  }

  const handleTechStackChange = (e) => {
    const techStack = e.target.value.split(',').map(tech => tech.trim()).filter(tech => tech)
    setTechStackInput(e.target.value)
    setFormData({
      ...formData,
      techStack: techStack
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await jobsAPI.createJob(formData)
      toast.success('Job created successfully!')
      navigate('/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create job')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create New Job</h1>
        <p className="text-gray-600">Post a new job opportunity for candidates</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Job Details</h2>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Job Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className="input"
                required
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                Location *
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="input"
                placeholder="e.g., New York, Remote, Hybrid"
                required
              />
            </div>

            <div>
              <label htmlFor="experienceLevel" className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level *
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="select"
                required
              >
                <option value="Entry">Entry Level</option>
                <option value="Mid">Mid Level</option>
                <option value="Senior">Senior Level</option>
                <option value="Lead">Lead</option>
              </select>
            </div>

            <div>
              <label htmlFor="jobType" className="block text-sm font-medium text-gray-700 mb-2">
                Job Type *
              </label>
              <select
                id="jobType"
                name="jobType"
                value={formData.jobType}
                onChange={handleChange}
                className="select"
                required
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-2">
                Application Deadline *
              </label>
              <input
                type="date"
                id="deadline"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="input"
                required
              />
            </div>
          </div>

          <div className="mt-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Job Description *
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={8}
              className="textarea"
              placeholder="Describe the job responsibilities, requirements, and what you're looking for in a candidate..."
              required
            />
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Requirements & Skills</h2>

          <div className="space-y-6">
            <div>
              <label htmlFor="requiredSkills" className="block text-sm font-medium text-gray-700 mb-2">
                Required Skills (comma-separated)
              </label>
              <textarea
                id="requiredSkills"
                value={skillsInput}
                onChange={handleSkillsChange}
                rows={3}
                className="textarea"
                placeholder="e.g., JavaScript, React, Node.js, MongoDB, Git"
              />
            </div>

            <div>
              <label htmlFor="techStack" className="block text-sm font-medium text-gray-700 mb-2">
                Tech Stack (comma-separated)
              </label>
              <textarea
                id="techStack"
                value={techStackInput}
                onChange={handleTechStackChange}
                rows={3}
                className="textarea"
                placeholder="e.g., React, Express, PostgreSQL, AWS, Docker"
              />
            </div>
          </div>
        </div>

        <div className="card">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Salary Information (Optional)</h2>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="salary.min" className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Salary
              </label>
              <input
                type="number"
                id="salary.min"
                name="salary.min"
                value={formData.salary.min}
                onChange={handleChange}
                className="input"
                placeholder="50000"
              />
            </div>

            <div>
              <label htmlFor="salary.max" className="block text-sm font-medium text-gray-700 mb-2">
                Maximum Salary
              </label>
              <input
                type="number"
                id="salary.max"
                name="salary.max"
                value={formData.salary.max}
                onChange={handleChange}
                className="input"
                placeholder="80000"
              />
            </div>

            <div>
              <label htmlFor="salary.currency" className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                id="salary.currency"
                name="salary.currency"
                value={formData.salary.currency}
                onChange={handleChange}
                className="select"
              >
                <option value="INR">INR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="CAD">CAD</option>
                <option value="AUD">AUD</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4 justify-end">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary disabled:opacity-50"
          >
            {isLoading ? 'Creating...' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateJob