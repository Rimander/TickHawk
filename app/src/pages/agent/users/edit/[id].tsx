import React, { useState, useEffect } from 'react'
import { useAuth } from 'components/AuthProvider'
import { useNavigate, useParams } from 'react-router-dom'
import Loading from 'components/Loading'
import { User } from 'models/user.model'
import { CompanyTicket } from 'models/ticket.model'
import { Department } from 'models/department.model'
import ProfileImageEdit from 'components/ProfileImageEdit'
import { toast } from 'react-toastify'

function EditUser() {
  // State for user data - we'll use it for reference but not accessing directly
  const [, setUser] = useState<User | null>(null)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<'admin' | 'agent' | 'customer'>('customer')
  const [lang, setLang] = useState('en')
  const [companyId, setCompanyId] = useState('')
  const [password, setPassword] = useState('')
  const [companies, setCompanies] = useState<CompanyTicket[]>([])
  const [departmentIds, setDepartmentIds] = useState<string[]>([])
  const [departments, setDepartments] = useState<Department[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [deleteProfileImage, setDeleteProfileImage] = useState(false)
  
  const auth = useAuth()
  const navigate = useNavigate()
  const { id } = useParams<{ id: string }>()

  // Load user data and dependent data (companies, departments)
  useEffect(() => {
    if (!id) {
      navigate('/backoffice/users')
      return
    }

    const fetchData = async () => {
      setInitialLoading(true)
      
      try {
        // Fetch user data
        const userResponse = await auth.axiosClient.get(`/user/${id}`)
        const userData: User = userResponse.data
        
        setUser(userData)
        setName(userData.name)
        setEmail(userData.email)
        setRole(userData.role)
        setLang(userData.lang || 'en')
        setCompanyId(userData.companyId || '')
        setDepartmentIds(userData.departmentIds || [])
        
        // Fetch companies for dropdown
        const companiesResponse = await auth.axiosClient.get('/company')
        if (companiesResponse.data && companiesResponse.data.companies) {
          setCompanies(companiesResponse.data.companies)
        } else {
          console.error('Unexpected companies response format:', companiesResponse.data)
          setCompanies([])
        }
        
        // Fetch departments for dropdown (if role is agent)
        const departmentsResponse = await auth.axiosClient.get('/department')
        setDepartments(departmentsResponse.data)
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load user information')
      } finally {
        setInitialLoading(false)
      }
    }

    fetchData()
  }, [id, auth.axiosClient, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Validate input
    if (!name.trim()) {
      setError('Name is required')
      setLoading(false)
      return
    }

    // Email validation
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address')
      setLoading(false)
      return
    }

    try {
      // No need to create formData here anymore, as we'll create it specifically when needed
      
      // First, handle profile image operations if needed
      try {
        // Handle delete profile image if requested
        if (deleteProfileImage) {
          await auth.axiosClient.post(`/user/${id}/remove-profile-image`);
          toast.success("Profile image deleted successfully");
        }
        
        // Then handle image upload if a new image is selected
        if (profileImage) {
          try {
            const imageFormData = new FormData();
            
            // Add the image with the key expected by the backend
            imageFormData.append('image', profileImage);
            
            // Add other required fields - ensure we have the right structure
            imageFormData.append('name', name);
            imageFormData.append('email', email);
            imageFormData.append('role', role);
            imageFormData.append('lang', lang);
            
            if (password) {
              imageFormData.append('password', password);
            }
            
            // Upload image with user data - using the correct endpoint with ID parameter
            const response = await auth.axiosClient.put(`/user/${id}/with-image`, imageFormData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            });
            
            toast.success("User profile updated with new image");
            
            // Skip the normal update since we've already updated everything
            return;
          } catch (uploadError: any) {
            console.error("Error uploading image:", uploadError);
            toast.error(`Error uploading image: ${uploadError.message || "Unknown error"}`);
            throw uploadError;
          }
        } else if (!deleteProfileImage) {
          // If no image changes, just update the user data
          await auth.axiosClient.put(`/user/${id}`, {
            _id: id,
            name,
            email,
            role,
            lang,
            ...(password ? { password } : {})
          });
        }
      } catch (error) {
        console.error("Error updating user profile:", error);
        throw error; // Re-throw to be caught by the outer catch block
      }
      
      // Always update company assignment for any role (even if removing it)
      // This makes the company update work for all roles, not just customer
      await auth.axiosClient.post('/user/assign-company', {
        userId: id,
        companyId: companyId || null
      })
      
      // If agent role and departments need to be assigned/updated
      if (role === 'agent' && departmentIds.length > 0) {
        for (const departmentId of departmentIds) {
          await auth.axiosClient.post('/user/assign-department', {
            userId: id,
            departmentId
          })
        }
      }
      
      toast.success('User updated successfully')
      navigate('/backoffice/users')
    } catch (error) {
      if (error instanceof Error) {
        setError(`Failed to update user: ${error.message}`)
      } else {
        setError('Failed to update user')
      }
      console.error('Error updating user:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = Array.from(e.target.selectedOptions, option => option.value)
    setDepartmentIds(value)
  }
  
  if (initialLoading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
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
    <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="container px-4 pt-20 mx-auto sm:pt-24 md:pt-24 lg:px-0 dark:bg-gray-900">
        <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <div className="mb-4">
            <h3 className="text-xl font-semibold dark:text-white">
              Edit User
            </h3>
          </div>

          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mb-4">
              <div className="col-span-1 md:col-span-2">
                <ProfileImageEdit 
                  userId={id} 
                  onImageChange={setProfileImage}
                  onDelete={() => setDeleteProfileImage(true)}
                />
              </div>
              
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="Enter full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Role <span className="text-red-500">*</span>
                </label>
                <select
                  id="role"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'admin' | 'agent' | 'customer')}
                  required
                >
                  <option value="admin">Admin</option>
                  <option value="agent">Agent</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div>
                <label htmlFor="lang" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Language <span className="text-red-500">*</span>
                </label>
                <select
                  id="lang"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  value={lang}
                  onChange={(e) => setLang(e.target.value)}
                  required
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                </select>
              </div>

              <div>
                <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                  Password (leave blank to keep current)
                </label>
                <input
                  type="password"
                  id="password"
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              {/* Show company selector only for customer role */}
              {role === 'customer' && (
                <div>
                  <label htmlFor="company" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Company
                  </label>
                  <select
                    id="company"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={companyId}
                    onChange={(e) => setCompanyId(e.target.value)}
                  >
                    <option value="">No Company</option>
                    {companies.map(company => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              {/* Show departments selector only for agent role */}
              {role === 'agent' && (
                <div>
                  <label htmlFor="departments" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Departments
                  </label>
                  <select
                    id="departments"
                    multiple
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={departmentIds}
                    onChange={handleDepartmentChange}
                    size={4}
                  >
                    {departments.map(department => (
                      <option key={department._id} value={department._id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Hold Ctrl/Cmd key to select multiple departments
                  </p>
                </div>
              )}
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
                ) : 'Update User'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/backoffice/users')}
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

export default EditUser