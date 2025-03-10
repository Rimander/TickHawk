import React, { useEffect, useState } from 'react'
import { useAuth } from 'components/AuthProvider'
import { Link } from 'react-router-dom'
import Loading from 'components/Loading'
import { User, UserListResponse } from 'models/user.model'
import ProfileImage from 'components/ProfileImage'
import { CompanyTicket } from 'models/ticket.model'

function Users() {
  const [users, setUsers] = useState<User[]>([])
  const [companies, setCompanies] = useState<CompanyTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('')
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  
  const auth = useAuth()

  const loadCompanies = React.useCallback(() => {
    auth.axiosClient.get('/company')
      .then((response: { data: { companies: CompanyTicket[] } }) => {
        setCompanies(response.data.companies)
      })
      .catch((error: unknown) => {
        console.error('Error loading companies:', error)
      })
  }, [auth.axiosClient])

  const loadUsers = React.useCallback(() => {
    setLoading(true)
    
    // Construct query parameters
    const params = new URLSearchParams()
    params.append('page', page.toString())
    params.append('limit', limit.toString())
    
    if (searchTerm) {
      params.append('search', searchTerm)
    }
    
    if (roleFilter) {
      params.append('role', roleFilter)
    }
    
    auth.axiosClient.get(`/user?${params.toString()}`)
      .then((response: { data: UserListResponse }) => {
        setUsers(response.data.users)
        setTotal(response.data.total)
        setError(false)
      })
      .catch((error: unknown) => {
        console.error('Error loading users', error)
        setError(true)
      })
      .finally(() => {
        setLoading(false)
      })
  }, [auth.axiosClient, page, limit, searchTerm, roleFilter])
  
  useEffect(() => {
    loadCompanies()
  }, [loadCompanies])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])
  
  // Load all companies to use for matching companyId to company name
  // Function declarations removed - using the useCallback versions above

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setPage(1) // Reset to first page when search changes
  }
  
  const handleRoleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRoleFilter(e.target.value)
    setPage(1) // Reset to first page when filter changes
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  const totalPages = Math.ceil(total / limit)
  
  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
      case 'agent':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      case 'customer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    }
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 pt-20 mx-auto sm:pt-24 md:pt-24 lg:px-0 dark:bg-gray-900">
        <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <div className="mb-6">
            <h3 className="text-xl font-semibold dark:text-white mb-4">
              Users
            </h3>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 max-w-96">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                      <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                    </svg>
                  </div>
                  <input
                    type="search"
                    id="user-search"
                    className="block p-2.5 w-full pl-10 text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-primary-500 focus:border-primary-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                </div>
              </div>
              
              <div className="w-full sm:w-36">
                <select
                  id="role-filter"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  value={roleFilter}
                  onChange={handleRoleFilterChange}
                >
                  <option value="">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                  <option value="customer">Customer</option>
                </select>
              </div>
              
              <div className="w-full sm:w-auto">
                <Link
                  to="/backoffice/users/new"
                  className="w-full sm:w-auto flex items-center justify-center text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 dark:bg-primary-600 dark:hover:bg-primary-700 focus:outline-none dark:focus:ring-primary-800"
                >
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                  </svg>
                  Add User
                </Link>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center">
              <Loading className="w-14 h-14" />
            </div>
          ) : error ? (
            <div className="text-center text-red-600 dark:text-red-400">
              Error loading users.
              <button
                onClick={loadUsers}
                className="ml-2 underline"
              >
                Retry
              </button>
            </div>
          ) : (
            <>
              <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" className="px-6 py-3">User</th>
                      <th scope="col" className="px-6 py-3">Email</th>
                      <th scope="col" className="px-6 py-3">Role</th>
                      <th scope="col" className="px-6 py-3">Company</th>
                      <th scope="col" className="px-6 py-3">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-4 text-center">No users found</td>
                      </tr>
                    ) : (
                      users.map(user => (
                        <tr key={user._id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                          <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            <div className="flex items-center">
                              <ProfileImage userId={user._id} className="w-10 h-10 rounded-full mr-3" />
                              <span>{user.name}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">{user.email}</td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeClass(user.role)}`}>
                              {user.role}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            {user.companyId ? 
                              (user.company?.name || 'Unknown company') : 
                              (user.role === 'customer' ? 'No company assigned' : 'N/A')}
                          </td>
                          <td className="px-6 py-4">
                            <Link
                              to={`/backoffice/users/edit/${user._id}`}
                              className="font-medium text-primary-600 dark:text-primary-500 hover:underline"
                            >
                              Edit
                            </Link>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4">
                  <nav aria-label="Page navigation">
                    <ul className="inline-flex items-center -space-x-px">
                      <li>
                        <button
                          onClick={() => handlePageChange(Math.max(1, page - 1))}
                          disabled={page === 1}
                          className="block px-3 py-2 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 rounded-l-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          <span className="sr-only">Previous</span>
                          <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"></path>
                          </svg>
                        </button>
                      </li>
                      
                      {[...Array(totalPages)].map((_, i) => (
                        <li key={i}>
                          <button
                            onClick={() => handlePageChange(i + 1)}
                            className={`px-3 py-2 leading-tight ${page === i + 1 
                              ? 'text-primary-600 border border-primary-300 bg-primary-50 hover:bg-primary-100 hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white' 
                              : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white'}`}
                          >
                            {i + 1}
                          </button>
                        </li>
                      ))}
                      
                      <li>
                        <button
                          onClick={() => handlePageChange(Math.min(totalPages, page + 1))}
                          disabled={page === totalPages}
                          className="block px-3 py-2 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                        >
                          <span className="sr-only">Next</span>
                          <svg className="w-5 h-5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"></path>
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default Users