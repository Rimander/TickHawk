import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'components/AuthProvider'
import { Department } from 'models/department.model'

interface User {
  _id: string
  name: string
  email: string
}

interface Company {
  _id: string
  name: string
}

function NewTicket() {
  const { token } = useAuth()
  const navigate = useNavigate()
  
  const [departments, setDepartments] = useState<Department[]>([])
  const [customers, setCustomers] = useState<User[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  
  const [subject, setSubject] = useState('')
  const [content, setContent] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [customerId, setCustomerId] = useState('')
  const [priority, setPriority] = useState('medium')
  const [status, setStatus] = useState('open')
  const [companyFilter, setCompanyFilter] = useState('')
  
  // Fetch departments
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/department`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch departments')
        }
        
        const data = await response.json()
        setDepartments(data)
      } catch (err) {
        setError('Error fetching departments')
        console.error(err)
      }
    }
    
    fetchDepartments()
  }, [token])
  
  // Fetch companies
  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/company`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch companies')
        }
        
        const data = await response.json()
        // La respuesta contiene un objeto con la propiedad 'companies'
        if (data && data.companies) {
          setCompanies(data.companies)
        } else {
          console.error('Unexpected companies response format:', data)
          setCompanies([])
        }
      } catch (err) {
        setError('Error fetching companies')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    
    fetchCompanies()
  }, [token])
  
  // Fetch customers based on company filter
  useEffect(() => {
    const fetchCustomers = async () => {
      if (!companyFilter) return
      
      try {
        const url = `${process.env.REACT_APP_API_URL}/user?role=customer&companyId=${companyFilter}`
        const response = await fetch(url, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error('Failed to fetch customers')
        }
        
        const data = await response.json()
        
        // Handle different response structures
        if (Array.isArray(data)) {
          setCustomers(data)
        } else if (data.users && Array.isArray(data.users)) {
          setCustomers(data.users)
        } else if (data.items && Array.isArray(data.items)) {
          setCustomers(data.items)
        } else {
          console.error('Unexpected users response format:', data)
          setCustomers([])
        }
      } catch (err) {
        setError('Error fetching customers')
        console.error(err)
      }
    }
    
    fetchCustomers()
  }, [token, companyFilter])
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!subject || !content || !departmentId || !customerId || !priority || !status) {
      setError('Please fill in all fields')
      return
    }
    
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/ticket`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject,
          content,
          departmentId,
          customerId,
          priority,
          status
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Server response:', errorData);
        throw new Error(`Failed to create ticket: ${errorData.message || response.statusText}`);
      }
      
      setSuccess(true)
      setTimeout(() => {
        navigate('/backoffice')
      }, 2000)
    } catch (err) {
      setError(`Error creating ticket`)
      console.error('Ticket creation error:', err)
    }
  }
  
  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 pt-20 mx-auto sm:pt-24 md:pt-24 lg:px-0 dark:bg-gray-900">
        <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-semibold text-gray-900 dark:text-white">
            Create New Ticket for Customer
          </h2>
          
          {error && (
            <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">
              {error}
            </div>
          )}
          
          {success && (
            <div className="p-4 mb-4 text-sm text-green-700 bg-green-100 rounded-lg dark:bg-green-200 dark:text-green-800">
              Ticket created successfully! Redirecting...
            </div>
          )}
          
          {loading ? (
            <p className="text-gray-500 dark:text-gray-400">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label htmlFor="company" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Company
                  </label>
                  <select
                    id="company"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={companyFilter}
                    onChange={(e) => {
                      setCompanyFilter(e.target.value)
                      setCustomerId('') // Reset customer when company changes
                    }}
                    required
                  >
                    <option value="">Select Company</option>
                    {companies.map((company) => (
                      <option key={company._id} value={company._id}>
                        {company.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="customer" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Customer
                  </label>
                  <select
                    id="customer"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={customerId}
                    onChange={(e) => setCustomerId(e.target.value)}
                    required
                    disabled={!companyFilter}
                  >
                    <option value="">Select Customer</option>
                    {customers.map((customer) => (
                      <option key={customer._id} value={customer._id}>
                        {customer.name} ({customer.email})
                      </option>
                    ))}
                  </select>
                  {!companyFilter && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Please select a company first
                    </p>
                  )}
                </div>
                
                <div>
                  <label htmlFor="department" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Department
                  </label>
                  <select
                    id="department"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={departmentId}
                    onChange={(e) => setDepartmentId(e.target.value)}
                    required
                  >
                    <option value="">Select Department</option>
                    {departments.map((department) => (
                      <option key={department._id} value={department._id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label htmlFor="priority" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Priority
                  </label>
                  <select
                    id="priority"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    required
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="status" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Status
                  </label>
                  <select
                    id="status"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    required
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="pending">Pending</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ticket subject"
                    maxLength={60}
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {subject.length}/60 characters
                  </p>
                </div>
                
                <div className="col-span-1 md:col-span-2">
                  <label htmlFor="content" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                    Content
                  </label>
                  <textarea
                    id="content"
                    rows={6}
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Describe the issue..."
                    maxLength={500}
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {content.length}/500 characters
                  </p>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  type="button"
                  onClick={() => navigate('/backoffice')}
                  className="mr-3 text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-primary-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
                >
                  Create Ticket
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewTicket