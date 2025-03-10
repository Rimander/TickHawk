import React, { useEffect, useState } from 'react'
import { useAuth } from 'components/AuthProvider'
import { CompanyTicket } from 'models/ticket.model'
import { Link } from 'react-router-dom'
import Loading from 'components/Loading'

function Companies() {
  const [companies, setCompanies] = useState<CompanyTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const auth = useAuth()

  const loadCompanies = React.useCallback(() => {
    setLoading(true)
    auth.axiosClient.get('/company')
      .then((response: { data: any }) => {
        setCompanies(response.data.companies);
        setError(false)
      })
      .catch((error: unknown) => {
        console.error('Error loading companies', error)
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [auth.axiosClient])
  
  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  const handleDeleteCompany = (id: string) => {
    if (window.confirm('Are you sure you want to delete this company?')) {
      setLoading(true)
      auth.axiosClient.delete(`/company/${id}`)
        .then(() => {
          setCompanies(companies.filter(company => company._id !== id))
        })
        .catch((error: unknown) => {
          console.error('Error deleting company', error)
          alert('Failed to delete company. It may have associated users or tickets.')
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
              Companies
            </h3>
            <Link
              to="/backoffice/companies/new"
              className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
            >
              Add Company
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <Loading className="w-14 h-14" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400">
              Error loading companies.
              <button
                onClick={loadCompanies}
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
                    <th scope="col" className="px-6 py-3">Email</th>
                    <th scope="col" className="px-6 py-3">Contracts</th>
                    <th scope="col" className="px-6 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.length === 0 ? (
                    <tr key={0}>
                      <td colSpan={4} className="px-6 py-4 text-center">No companies found</td>
                    </tr>
                  ) : (
                    companies.map(company => (
                      <tr key={company._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {company.name}
                        </td>
                        <td className="px-6 py-4">{company.email}</td>
                        <td className="px-6 py-4">{company.contracts?.length || 0}</td>
                        <td className="px-6 py-4 space-x-2">
                          <Link
                            to={`/backoffice/companies/${company._id}`}
                            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                          >
                            View
                          </Link>
                          <Link
                            to={`/backoffice/companies/edit/${company._id}`}
                            className="font-medium text-yellow-600 dark:text-yellow-500 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDeleteCompany(company._id)}
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

export default Companies