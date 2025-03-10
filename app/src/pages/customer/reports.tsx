import React, { useState } from 'react'
import { useAuth } from '../../components/AuthProvider'
import { Ticket } from '../../models/ticket.model'
import StatusBadge from '../../components/StatusBadge'
import PriorityBadge from '../../components/PriorityBadge'
import DateFormat from '../../components/DateFormat'
import { PDFDownloadLink } from '@react-pdf/renderer'
import TicketReportPDF from '../../components/TicketReportPDF'

function Reports () {
  const { axiosClient } = useAuth()
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [totalHours, setTotalHours] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchPerformed, setSearchPerformed] = useState(false)

  const fetchReports = async () => {
    if (!startDate || !endDate) {
      setError('Please select both start and end dates')
      return
    }

    try {
      setLoading(true)
      setError('')
      setSearchPerformed(true)
      
      // Convert dates to ISO format
      const start = new Date(startDate).toISOString()
      const end = new Date(endDate).toISOString()
      
      // Fetch tickets with date range filter
      const response = await axiosClient.get(`/ticket/customer/report?startDate=${start}&endDate=${end}`)
      
      if (response.data) {
        setTickets(response.data)
        
        // Calculate total hours from tickets
        let hours = 0
        response.data.forEach((ticket: Ticket) => {
          // Add ticket minutes (converted to hours)
          if (ticket.minutes) {
            hours += ticket.minutes / 60
          }
          
          // Add hours from comments
          if (ticket.comments && ticket.comments.length > 0) {
            ticket.comments.forEach(comment => {
              hours += comment.hours || 0
            })
          }
        })
        
        setTotalHours(parseFloat(hours.toFixed(2)))
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Error fetching report data')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="bg-gray-50 dark:bg-gray-900">
        <div className="container px-4 pt-20 mx-auto sm:pt-24 md:pt-24 lg:px-0 dark:bg-gray-900">
          <div className="p-4 mb-4 bg-white border border-gray-200 rounded-lg shadow-sm 2xl:col-span-2 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <h3 className="mb-4 text-xl font-semibold dark:text-white">Company Reports</h3>

            {/* Filtros en forma de flex más flexible */}
            <div className="flex flex-wrap items-end gap-4 mb-6">
              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Start Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500 dark:text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d="M5.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V12zM6 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H6zM7.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H8a.75.75 0 01-.75-.75V12zM8 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H8zM9.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V10zM10 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H10zM9.25 14a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V14zM12 9.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V10a.75.75 0 00-.75-.75H12zM11.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V12zM12 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H12zM13.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H14a.75.75 0 01-.75-.75V10zM14 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H14z"></path>
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                      ></path>
                    </svg>
                  </div>
                  <input
                    name="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full max-w-[180px] pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="From"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">End Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <svg
                      className="w-5 h-5 text-gray-500 dark:text-gray-400"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path d="M5.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75V12zM6 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H6zM7.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H8a.75.75 0 01-.75-.75V12zM8 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H8zM9.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V10zM10 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H10zM9.25 14a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H10a.75.75 0 01-.75-.75V14zM12 9.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V10a.75.75 0 00-.75-.75H12zM11.25 12a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H12a.75.75 0 01-.75-.75V12zM12 13.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V14a.75.75 0 00-.75-.75H12zM13.25 10a.75.75 0 01.75-.75h.01a.75.75 0 01.75.75v.01a.75.75 0 01-.75.75H14a.75.75 0 01-.75-.75V10zM14 11.25a.75.75 0 00-.75.75v.01c0 .414.336.75.75.75h.01a.75.75 0 00.75-.75V12a.75.75 0 00-.75-.75H14z"></path>
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M5.75 2a.75.75 0 01.75.75V4h7V2.75a.75.75 0 011.5 0V4h.25A2.75 2.75 0 0118 6.75v8.5A2.75 2.75 0 0115.25 18H4.75A2.75 2.75 0 012 15.25v-8.5A2.75 2.75 0 014.75 4H5V2.75A.75.75 0 015.75 2zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75z"
                      ></path>
                    </svg>
                  </div>
                  <input
                    name="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="outline-none bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full max-w-[180px] pl-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500"
                    placeholder="To"
                  />
                </div>
              </div>

              <div>
                <button
                  onClick={fetchReports}
                  disabled={loading}
                  className="h-10 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none dark:focus:ring-primary-800 disabled:opacity-50"
                >
                  {loading ? "Loading..." : "Generate Report"}
                </button>
              </div>

              {tickets.length > 0 && (
                <div>
                  <button className="h-10 px-4 py-2 w-0 text-transparent">.</button>
                  <PDFDownloadLink
                    document={
                      <TicketReportPDF
                        tickets={tickets}
                        totalHours={totalHours}
                        companyName={tickets.length > 0 ? tickets[0].company.name : undefined}
                        startDate={startDate}
                        endDate={endDate}
                      />
                    }
                    fileName={`ticket-report-${new Date().toISOString().split("T")[0]}.pdf`}
                    className="h-10 px-4 py-3 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 focus:ring-4 focus:ring-green-300 dark:bg-green-500 dark:hover:bg-green-600 focus:outline-none dark:focus:ring-green-800"
                  >
                    {({ loading }) => <span>{loading ? "Generating PDF..." : "Export PDF"}</span>}
                  </PDFDownloadLink>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 mb-4 text-sm text-red-700 bg-red-100 rounded-lg dark:bg-red-200 dark:text-red-800">{error}</div>
            )}

            {tickets.length > 0 && (
              <div className="mt-6">
                <div className="p-4 mb-4 text-lg font-semibold bg-blue-100 text-blue-700 rounded-lg dark:bg-blue-200 dark:text-blue-800">
                  Total Hours: {totalHours}
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                      <tr>
                        <th scope="col" className="px-4 py-3">
                          Subject
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Status
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Priority
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Department
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Agent
                        </th>
                        <th scope="col" className="px-4 py-3">
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tickets.map((ticket) => (
                        <tr
                          key={ticket._id}
                          className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                            {ticket.subject}
                          </td>
                          <td className="px-4 py-3">
                            <StatusBadge status={ticket.status} />
                          </td>
                          <td className="px-4 py-3">
                            <PriorityBadge priority={ticket.priority} />
                          </td>
                          <td className="px-4 py-3">{ticket.department?.name || "N/A"}</td>
                          <td className="px-4 py-3">{ticket.agent?.name || "Unassigned"}</td>
                          <td className="px-4 py-3">
                            <DateFormat date={ticket.createdAt} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {!loading && searchPerformed && tickets.length === 0 && (
              <div className="p-4 mt-4 text-sm text-gray-700 bg-gray-100 rounded-lg dark:bg-gray-700 dark:text-gray-300">
                No tickets found in the selected date range.
              </div>
            )}

            {!searchPerformed && !loading && (
              <div className="p-4 mt-4 text-sm text-blue-700 bg-blue-100 rounded-lg dark:bg-blue-800 dark:text-blue-200">
                Select a date range and click "Generate Report" to see your company tickets.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports
