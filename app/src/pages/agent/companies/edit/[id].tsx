import React, { useState, useEffect } from 'react'
import { useAuth } from 'components/AuthProvider'
import { useNavigate, useParams } from 'react-router-dom'
import Loading from 'components/Loading'
import { CompanyTicket } from 'models/ticket.model'

function EditCompany() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const auth = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Load company data
  useEffect(() => {
    if (!id) {
      navigate('/backoffice/companies')
      return
    }

    setInitialLoading(true)
    auth.axiosClient.get(`/company/${id}`)
      .then((response: { data: CompanyTicket }) => {
        const company = response.data
        setName(company.name)
        setEmail(company.email || '')
      })
      .catch((error: unknown) => {
        console.error('Error loading company:', error)
        setError('Failed to load company information')
      })
      .finally(() => {
        setInitialLoading(false)
      })
  }, [id, auth.axiosClient, navigate])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate input
    if (!name.trim()) {
      setError('Company name is required')
      setLoading(false)
      return
    }

    // Email validation (optional field but should be valid if provided)
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    // Update the company
    auth.axiosClient.put(`/company/${id}`, { name, email })
      .then(() => {
        navigate('/backoffice/companies')
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          setError(`Failed to update company: ${error.message}`)
        } else {
          setError('Failed to update company')
        }
        console.error('Error updating company:', error)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  if (initialLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 pt-20 mx-auto sm:pt-24 md:pt-24 lg:px-0 dark:bg-gray-900">
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <div className="flex justify-center">
              <Loading className="w-14 h-14" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 pt-20 mx-auto sm:pt-24 md:pt-24 lg:px-0 dark:bg-gray-900">
        <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <div className="mb-4">
            <h3 className="text-xl font-semibold dark:text-white">
              Edit Company
            </h3>
          </div>

          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Company Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Enter company name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="company@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                {loading ? (
                  <div className="flex items-center">
                    <Loading className="w-4 h-4 mr-2" />
                    Updating...
                  </div>
                ) : 'Update Company'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/backoffice/companies')}
                className="text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default EditCompany