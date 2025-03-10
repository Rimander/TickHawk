import React, { useState, useEffect } from 'react'
import { useAuth } from 'components/AuthProvider'
import { useNavigate, useParams } from 'react-router-dom'
import Loading from 'components/Loading'
import { Department } from 'models/department.model'

function EditDepartment() {
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const auth = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Load department data
  useEffect(() => {
    if (!id) {
      navigate('/backoffice/departments')
      return
    }

    setInitialLoading(true)
    auth.axiosClient.get(`/department/${id}`)
      .then((response: { data: Department }) => {
        const department = response.data
        setName(department.name)
      })
      .catch((error: unknown) => {
        console.error('Error loading department:', error)
        setError('Failed to load department information')
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
      setError('Department name is required')
      setLoading(false)
      return
    }

    // Update the department
    auth.axiosClient.put(`/department/${id}`, { name })
      .then(() => {
        navigate('/backoffice/departments')
      })
      .catch((error: unknown) => {
        if (error instanceof Error) {
          setError(`Failed to update department: ${error.message}`)
        } else {
          setError('Failed to update department')
        }
        console.error('Error updating department:', error)
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
              Edit Department
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
                Department Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                placeholder="Enter department name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
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
                ) : 'Update Department'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/backoffice/departments')}
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

export default EditDepartment