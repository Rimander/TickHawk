import React from 'react'
import { TicketState, useTicketsStore } from 'store/tickets/tickets.store'

function StatusBadge ({ status }: { status: string }) {
  let color = ''
  let text = ''
  switch (status) {
    case 'open':
      color = 'green'
      text = 'Open'
      break
    case 'in-progress':
      color = 'purple'
      text = 'In progress'
      break
    case 'in-review':
      color = 'orange'
      text = 'In review'
      break
    case 'closed':
      color = 'red'
      text = 'Closed'
      break
    default:
      color = 'gray'
      text = 'Unknown'
  }

  return (
    <span
      className={`bg-${color}-100 text-${color}-800 text-sm font-medium mr-2 px-2.5 py-0.5 rounded-md border border-${color}-100 dark:bg-gray-700 dark:border-${color}-500 dark:text-${color}-400`}
    >
      {text}
    </span>
  )
}

function TicketList () {
  const tickets = useTicketsStore((state: TicketState) => state.tickets)

  return (
    <table className='min-w-full divide-y divide-gray-200 table-fixed dark:divide-gray-600'>
      <thead className='bg-gray-100 dark:bg-gray-700'>
        <tr>
          <th
            scope='col'
            className='p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400'
          >
            Subjet
          </th>
          <th
            scope='col'
            className='p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 hidden xl:display-revert'
          >
            Excerpt
          </th>
          <th
            scope='col'
            className='p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 hidden lg:display-revert'
          >
            Department
          </th>
          <th
            scope='col'
            className='p-4 text-xs font-medium text-left text-gray-500 uppercase dark:text-gray-400 hidden lg:display-revert'
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
          <tr className='hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer'>
            <td className='max-w-72 p-4 mr-2 space-x-6 overflow-hidden truncate whitespace-nowrap text-base font-semibold text-gray-900 dark:text-white'>
              {ticket.subject}
            </td>
            <td className='max-w-sm p-4 overflow-hidden text-base font-normal text-gray-500 truncate xl:max-w-xs dark:text-gray-400 hidden xl:display-revert'>
              {ticket.content.slice(0, 70)}
            </td>
            <td className='p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white hidden lg:display-revert'>
              Departamento X
            </td>
            <td className='p-4 text-base font-medium text-gray-900 whitespace-nowrap dark:text-white hidden lg:display-revert'>
              {ticket.createdAt.toLocaleDateString()}
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
                    stroke-linecap='round'
                    stroke-linejoin='round'
                    stroke-width='2'
                    d='M9 5l7 7-7 7'
                  ></path>
                </svg>
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
export default TicketList
