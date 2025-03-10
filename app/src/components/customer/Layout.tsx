import React from 'react'
import TwSizeIndicator from 'components/TwSizeIndicator'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Footer from '../Footer'

function Layout () {
  //TODO: Check if user role is customer
  return (
    <div className="flex flex-col bg-gray-50 dark:bg-gray-900 min-h-screen overflow-auto">
      <TwSizeIndicator />
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export default Layout
