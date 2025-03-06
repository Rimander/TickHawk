import React, { useState } from "react";
import TicketList from "components/agent/TicketList";
import TicketFilter from "components/agent/TicketFilter";
import { Link } from "react-router-dom";

function Home() {
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");

  const handleFilterChange = (departmentId: string, companyId: string) => {
    setDepartmentFilter(departmentId);
    setCompanyFilter(companyId);
  };

  return (
    <div>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <div className="container px-4 pt-20 mx-auto sm:pt-24 md:pt-24 lg:px-0 dark:bg-gray-900">
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold dark:text-white">Tickets</h3>
              <Link
                to="/backoffice/tickets/new"
                className="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
              >
                New ticket
              </Link>
            </div>
            <div className="mb-4">
              <TicketFilter onFilterChange={handleFilterChange} />
            </div>
            <div className="flex flex-col">
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full align-middle">
                  <div className="overflow-hidden shadow">
                    <TicketList departmentId={departmentFilter} companyId={companyFilter} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
