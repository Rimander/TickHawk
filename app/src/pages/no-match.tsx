import React from 'react'
import { Link } from 'react-router-dom'

function NoMatch () {
  return (
    <div className='bg-gray-50 dark:bg-gray-900  min-h-screen'>
      <div className='flex flex-col justify-center items-center px-6 mx-auto h-screen xl:px-0 dark:bg-gray-900'>
        <div className='block md:max-w-lg'>
          <img src='/assets/images/tickhawk.svg' width={300} alt='logo' />
        </div>
        <div className='text-center xl:max-w-4xl'>
          <h1 className='mb-3 text-2xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl dark:text-white'>
            Page not found
          </h1>
          <p className='mb-5 text-base font-normal text-gray-500 md:text-lg dark:text-gray-400'>
            Oops! Looks like you followed a bad link. If you think this is a
            problem with us, please tell us.
          </p>
          <Link
            to='/'
            className='text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center inline-flex items-center mr-3 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800'
          >
            <svg
              className='mr-2 -ml-1 w-5 h-5'
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
            Go back home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NoMatch
