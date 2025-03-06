import React, { useEffect, useState } from 'react'
import { useAuth } from 'components/AuthProvider'
import { Department } from 'models/department.model'
import { CompanyTicket } from 'models/ticket.model'

function TicketFilter({ onFilterChange }: { onFilterChange: (departmentId: string, companyId: string) => void }) {
  const [departments, setDepartments] = useState([] as Department[])
  const [companies, setCompanies] = useState([] as CompanyTicket[])
  const [selectedDepartment, setSelectedDepartment] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [searchText, setSearchText] = useState('')
  const auth = useAuth()

  useEffect(() => {
    // Cargar departamentos
    auth.axiosClient
      .get('/department')
      .then((response: { data: Department[] }) => {
        setDepartments(response.data)
      })
      .catch((error: any) => {
        console.error('Error fetching departments', error)
      })

    // Cargar compañías
    auth.axiosClient
      .get("/company")
      .then((response: { data: { companies: CompanyTicket[] } }) => {
        setCompanies(response.data.companies);
      })
      .catch((error: any) => {
        console.error("Error fetching companies", error);
      });
  }, [auth.axiosClient])

  const handleDepartmentChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDepartment(event.target.value)
    onFilterChange(event.target.value, selectedCompany)
  }

  const handleCompanyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCompany(event.target.value)
    onFilterChange(selectedDepartment, event.target.value)
  }

  const handleSearch = () => {
    // Implementar búsqueda por texto
    console.log('Searching for:', searchText)
  }

  return (
    <div className='items-center justify-between block sm:flex md:divide-x md:divide-gray-100 dark:divide-gray-700'>
      <div className='flex items-center mb-4 sm:mb-0'>
        <div className='sm:pr-3'>
          <label className='sr-only'>Search tickets</label>
          <div className='relative w-48 mt-1 sm:w-64 xl:w-96'>
            <input
              type='text'
              className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
              placeholder='Search tickets'
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        </div>
        <div className='flex items-center space-x-4'>
          <div className='relative'>
            <select 
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
              value={selectedDepartment}
              onChange={handleDepartmentChange}
            >
              <option value=''>All Departments</option>
              {departments.map((department) => (
                <option key={department._id} value={department._id}>
                  {department.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className='relative'>
            <select 
              className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500'
              value={selectedCompany}
              onChange={handleCompanyChange}
            >
              <option value=''>All Companies</option>
              {companies.map((company) => (
                <option key={company._id} value={company._id}>
                  {company.name}
                </option>
              ))}
            </select>
          </div>
          
          <span className='inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white' onClick={handleSearch}>
            <svg
              className='w-6 h-6'
              fill='none'
              height='24'
              stroke='currentColor'
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth='2'
              viewBox='0 0 24 24'
              width='24'
              xmlns='http://www.w3.org/2000/svg'
            >
              <circle cx='11' cy='11' r='8' />
              <line x1='21' x2='16.65' y1='21' y2='16.65' />
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}
export default TicketFilter