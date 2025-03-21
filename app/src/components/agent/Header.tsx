import React from 'react'
import { Link } from 'react-router-dom'
import ThemeSelector from '../ThemeSelector'
import ProfileImage from 'components/ProfileImage'
import { useAuth } from 'components/AuthProvider'

function Header() {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  return (
    <nav className="fixed z-50 w-full bg-white border-b border-gray-200 sm:py-2 dark:bg-gray-800 dark:border-gray-700">
      <div className="container py-2 mx-auto">
        <div className="flex items-center justify-between mx-2 md:mx-0">
          <div className="flex items-center justify-start">
            <Link to={"/backoffice"} className="flex mr-4">
              <img src="/assets/images/tickhawk.svg" alt="TickHawk" className="w-11 h-11" />
              <span className="self-center text-2xl font-semibold whitespace-nowrap dark:text-white">TickHawk</span>
            </Link>
            <div className="hidden sm:flex sm:ml-6">
              <ul className="flex space-x-8">
                <li>
                  <Link
                    to="/backoffice"
                    className="text-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-400 dark:hover:text-primary-500"
                  >
                    Dashboard
                  </Link>
                </li>
                
                {isAdmin && (
                  <>
                    <li>
                      <Link
                        to="/backoffice/companies"
                        className="text-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-400 dark:hover:text-primary-500"
                      >
                        Companies
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/backoffice/departments"
                        className="text-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-400 dark:hover:text-primary-500"
                      >
                        Departments
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/backoffice/users"
                        className="text-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-400 dark:hover:text-primary-500"
                      >
                        Users
                      </Link>
                    </li>
                  </>
                )}
                <li>
                  <Link
                    to="/backoffice/reports"
                    className="text-sm font-medium text-gray-700 hover:text-primary-700 dark:text-gray-400 dark:hover:text-primary-500"
                  >
                    Reports
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div>
            <div className="flex items-center">
              <div className="hidden mr-3 -mb-1 sm:block">
                <span></span>
              </div>
              <ThemeSelector />
              <div className="flex items-center ml-3">
                <div>
                  <Link
                    to="/backoffice/profile"
                    className="flex text-sm bg-white dark:bg-gray-800 rounded-full focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                  >
                    <ProfileImage className="w-8 h-8 rounded-full" />
                  </Link>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center justify-center p-2 ml-3 text-gray-400 rounded-lg sm:hidden hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-300 dark:hover:bg-gray-700 dark:hover:text-white"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <span className="sr-only">Open main menu</span>

                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path
                    fillRule="evenodd"
                    d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  ></path>
                </svg>

                <svg
                  className="hidden w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  ></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {isMenuOpen && (
        <div>
          <ul className="pt-2">
            <li>
              <Link
                to="/backoffice"
                className="block py-2 pl-3 pr-4 text-base font-normal text-gray-900 bg-gray-100 dark:bg-gray-700 dark:text-white"
              >
                Dashboard
              </Link>
            </li>
            
            {isAdmin && (
              <>
                <li>
                  <Link
                    to="/backoffice/companies"
                    className="block px-3 py-2 text-base font-normal text-gray-600 border-b border-gray-100 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white"
                  >
                    Companies
                  </Link>
                </li>
                <li>
                  <Link
                    to="/backoffice/departments"
                    className="block px-3 py-2 text-base font-normal text-gray-600 border-b border-gray-100 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white"
                  >
                    Departments
                  </Link>
                </li>
                <li>
                  <Link
                    to="/backoffice/users"
                    className="block px-3 py-2 text-base font-normal text-gray-600 border-b border-gray-100 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white"
                  >
                    Users
                  </Link>
                </li>
              </>
            )}
            
            <li>
              <Link
                to="/backoffice/reports"
                className="block px-3 py-2 text-base font-normal text-gray-600 border-b border-gray-100 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-900 dark:border-gray-700 dark:hover:bg-gray-700 dark:text-gray-400 dark:hover:text-white"
              >
                Reports
              </Link>
            </li>
          </ul>
        </div>
      )}
    </nav>
  );
}

export default Header