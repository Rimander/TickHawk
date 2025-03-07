import { useAuth } from 'components/AuthProvider'
import ProrityBadge from 'components/PriorityBadge'
import StatusBadge from 'components/StatusBadge'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Ticket } from 'models/ticket.model'
import Loading from 'components/Loading'

function TicketList({ departmentId = '', companyId = '' }) {
  const [tickets, setTickets] = useState([] as Ticket[])
  const [errors, setErrors] = useState(false)
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalTickets, setTotalTickets] = useState(0)
  const [limit, setLimit] = useState(10)

  const navigate = useNavigate()
  const auth = useAuth()

  const goToTicketHandler = (_id: string) => {
    navigate(`/backoffice/tickets/${_id}`)
  }

  const loadTickets = React.useCallback(() => {
    setLoading(true)
    // Construir la URL con filtros opcionales
    let url = `/ticket?page=${page}`
    if (departmentId) {
      url += `&departmentId=${departmentId}`
    }
    if (companyId) {
      url += `&companyId=${companyId}`
    }
    
    auth.axiosClient
      .get(url)
      .then((response: { data: { tickets: Ticket[], total: number, page: number, limit: number } }) => {
        setTickets(response.data.tickets)
        setTotalTickets(response.data.total)
        setLimit(response.data.limit)
        setErrors(false)
      })
      .catch((error: any) => {
        setErrors(true)
      }).finally(() => {
        setLoading(false)
      })
  }, [page, departmentId, companyId, auth.axiosClient]);

  useEffect(() => {
    loadTickets()
  }, [page, departmentId, companyId, loadTickets])
  
  return (
    <div>
      <table className='min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600'>
        <thead className='bg-gray-100 dark:bg-gray-700'>
          <tr>
            <th
              scope='col'
              className='p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400'
            >
              Subject
            </th>
            <th
              scope='col'
              className='p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 hidden xl:table-cell'
            >
              Excerpt
            </th>
            <th
              scope='col'
              className='p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 hidden lg:table-cell'
            >
              Department
            </th>
            <th
              scope='col'
              className='p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 hidden lg:table-cell'
            >
              Company
            </th>
            <th
              scope='col'
              className='p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 hidden lg:table-cell'
            >
              Created date
            </th>
            <th
              scope='col'
              className='p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400'
            >
              Status
            </th>
            <th
              scope='col'
              className='p-4 max-w-3 font-medium text-left text-gray-500 uppercase dark:text-gray-400'
            ></th>
          </tr>
        </thead>
        <tbody className='bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700'>
          {tickets.map(ticket => (
            <tr
              onClick={() => goToTicketHandler(ticket._id)}
              key={ticket._id}
              className='hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'
            >
              <td className='max-w-72 p-4 mr-2 space-x-6 overflow-hidden truncate whitespace-nowrap text-base font-semibold text-gray-900 dark:text-white'>
                <ProrityBadge priority={ticket.priority} />
                {ticket.subject}
              </td>
              <td className='max-w-sm p-4 overflow-hidden text-base font-normal text-gray-500 truncate xl:max-w-xs dark:text-gray-400 hidden xl:table-cell'>
                {ticket.content.slice(0, 70)}
              </td>
              <td className='p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white hidden lg:table-cell'>
                {ticket.department.name}
              </td>
              <td className='p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white hidden lg:table-cell'>
                {ticket.company.name}
              </td>
              <td className='p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white hidden lg:table-cell'>
                {new Date(ticket.createdAt).toLocaleDateString()}
              </td>
              <td className='p-4 text-base font-normal text-gray-900 whitespace-nowrap dark:text-white'>
                <div className='flex items-center'>
                  <StatusBadge status={ticket.status} />
                </div>
              </td>
              <td className='p-4 whitespace-nowrap'>
                <span className='inline-flex items-center p-2 text-xs font-medium uppercase rounded-lg text-primary-700 sm:text-sm hover:bg-gray-100 dark:text-primary-500 dark:hover:bg-gray-700'>
                  <svg
                    className='w-4 h-4 ml-1 sm:w-5 sm:h-5'
                    fill='none'
                    stroke='currentColor'
                    viewBox='0 0 24 24'
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path
                      strokeLinecap='round'
                      strokeLinejoin='round'
                      strokeWidth='2'
                      d='M9 5l7 7-7 7'
                    ></path>
                  </svg>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        className={`w-full text-center transition-all duration-500 ease-in-out ${
          errors ? 'opacity-100 max-h-10 !mt-4 !mb-4' : 'opacity-0 max-h-0'
        }`}
      >
        <span className='text-base text-black-600 dark:text-white'>
          Error fetching tickets
        </span>
        <span
          onClick={loadTickets}
          className='ml-2 text-base text-black-600 dark:text-white border-b border-black dark:border-white cursor-pointer'
        >
          Refresh
        </span>
      </div>
      <div className={`${loading ? 'block' : 'hidden'}`}>
        <Loading className='w-14 h-14 mx-auto mt-2 mb-2'/>
      </div>
      <div className='sticky bottom-0 right-0 items-center w-full pt-4 bg-white border-t border-gray-200 sm:flex sm:justify-between dark:bg-gray-800 dark:border-gray-700'>
        <div className='flex items-center mb-0 sm:mb-0'>
          <span 
          onClick={() => setPage(Math.max(1, page - 1))}
          className={`inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white ${page === 1 ? 'invisible' : 'block'}`}>
            <svg
              className='w-7 h-7'
              fill='currentColor'
              viewBox='0 0 20 20'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fillRule='evenodd'
                d='M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z'
                clipRule='evenodd'
              ></path>
            </svg>
          </span>
          <span className="mx-2 text-sm text-gray-600 dark:text-gray-400">
            {totalTickets > 0 ? `Página ${page} de ${Math.ceil(totalTickets / limit)}` : 'No hay tickets'}
          </span>
          <span 
          onClick={() => setPage(page + 1)}
          className={`inline-flex justify-center p-1 text-gray-500 rounded cursor-pointer hover:text-gray-900 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-white ${tickets.length < limit || page * limit >= totalTickets ? 'invisible' : 'block'}`}>
            <svg
              className='w-7 h-7'
              fill='currentColor'
              viewBox='0 0 20 20'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                fillRule='evenodd'
                d='M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z'
                clipRule='evenodd'
              ></path>
            </svg>
          </span>
        </div>
      </div>
    </div>
  )
}
export default TicketList