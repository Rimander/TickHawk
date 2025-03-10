import TicketList from 'components/customer/TicketList'
import TicketFilter from 'components/customer/TicketFilter'
import { useNavigate } from 'react-router-dom'

function Home () {
  const navigate = useNavigate()
  return (
    <div>
      <div className='bg-gray-50 dark:bg-gray-900'>
        <div className='container px-4 pt-20 mx-auto sm:pt-24 md:pt-24 lg:px-0 dark:bg-gray-900'>
          <div className='p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800'>
            <div className='flex items-center justify-between mb-2'>
              <h3 className='mb-4 text-xl font-semibold dark:text-white'>
                Tickets
              </h3>
              <button
                onClick={() => navigate('/new-ticket')}
                className='text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
              >
                New ticket
              </button>
            </div>
            <div className='mb-4 hidden'>
              <TicketFilter />
            </div>
            <div className='flex flex-col'>
              <div className='overflow-x-auto'>
                <div className='inline-block min-w-full align-middle'>
                  <div className='overflow-hidden shadow'>
                    <TicketList />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home
