import React, { useEffect, useState } from 'react'
import { useAuth } from 'components/AuthProvider'
import { Department } from 'models/department.model'
import { Link } from 'react-router-dom'
import Loading from 'components/Loading'

function Departments() {
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const auth = useAuth()

  const loadDepartments = React.useCallback(() => {
    setLoading(true)
    auth.axiosClient.get('/department')
      .then((response: { data: Department[] }) => {
        setDepartments(response.data)
        setError(false)
      })
      .catch((error: unknown) => {
        console.error('Error loading departments', error)
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [auth.axiosClient])
  
  useEffect(() => {
    loadDepartments()
  }, [loadDepartments])

  const handleDeleteDepartment = (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      setLoading(true)
      auth.axiosClient.delete(`/department/${id}`)
        .then(() => {
          setDepartments(departments.filter(department => department._id !== id))
        })
        .catch((error: unknown) => {
          console.error('Error deleting department', error)
          alert('Failed to delete department. It may have assigned users or tickets.')
        })
        .finally(() => {
          setLoading(false)
        })
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 pt-20 mx-auto sm:pt-24 md:pt-24 lg:px-0 dark:bg-gray-900">
        <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold dark:text-white">
              Departments
            </h3>
            <Link
              to="/backoffice/departments/new"
              className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Add Department
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <Loading className="w-14 h-14" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400">
              Error loading departments.
              <button
                onClick={loadDepartments}
                className="ml-2 underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
              <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">Name</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-6 py-4 text-center">No departments found</td>
                    </tr>
                  ) : (
                    departments.map(department => (
                      <tr key={department._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {department.name}
                        </td>
                        <td className="px-6 py-4 space-x-2">
                          <Link
                            to={`/backoffice/departments/${department._id}`}
                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                          >
                            View
                          </Link>
                          <Link
                            to={`/backoffice/departments/edit/${department._id}`}
                            className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteDepartment(department._id)}
                            className="font-medium text-red-600 dark:text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Departments