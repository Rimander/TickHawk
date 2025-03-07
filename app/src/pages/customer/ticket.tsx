import { useAuth } from 'components/AuthProvider'
import DateFormat from 'components/DateFormat'
import { useDialog } from 'components/DialogProvider'
import FilePicker from 'components/FilePicker'
import CrossIcon from 'components/icons/CrossIcon'
import FileIcon from 'components/icons/FileIcon'
import ProfileImage from 'components/ProfileImage'
import StatusBadge from 'components/StatusBadge'
import TicketComment from 'components/TicketComment'
import TicketReplies from 'components/TicketReplies'
import TimeFormat from 'components/TimeFormat'
import { FileModel } from 'models/file.model'
import React, { useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

function Ticket () {
  const { id } = useParams()
  const auth = useAuth()
  const dialog = useDialog()
  const [ticket, setTicket] = React.useState<any>(null)
  const [files, setFiles] = React.useState<FileModel[]>([])

  const loadTicket = () => {
    auth.axiosClient.get(`/ticket/customer/${id}`).then((response: any) => {
      const ticket_data = response.data
      // Change date string to date object
      ticket_data.createdAt = new Date(ticket_data.createdAt)
      ticket_data.updatedAt = new Date(ticket_data.updatedAt)

      // Comment dates
      ticket_data.comments.forEach((comment: any) => {
        comment.createdAt = new Date(comment.createdAt)
        comment.updatedAt = new Date(comment.updatedAt)
      })

      // Event dates
      ticket_data.events.forEach((event: any) => {
        event.createdAt = new Date(event.createdAt)
        event.updatedAt = new Date(event.updatedAt)
      })
      setTicket(response.data)
    })
  }

  useEffect(() => {
    loadTicket()
    // eslint-disable-next-line
  }, [])

  const handleFilesUploaded = async (_files: FileModel[]) => {
    // Max 3 files
    if (files.length + _files.length > 3) {
      return
    }
    setFiles([...files, ..._files])
  }

  const handleCloseTicket = () => {
    dialog.openDialog({
      title: 'Close ticket',
      content: 'Are you sure you want to close this ticket?',
      primaryAction: 'Close ticket',
      secondaryAction: 'Cancel',
      onPrimaryAction: [() => {
        auth.axiosClient
          .post(`/ticket/customer/close/${id}`)
          .then((response: any) => {
            if (response.status !== 201) {
              toast.error('Error closing ticket')
              return
            }
            loadTicket()
          })
      }]
    })
  }

  const handleReply = (event: any) => {
    event.preventDefault()
    const form = event.target
    const formData = new FormData(form)

    const content = formData.get('content')?.toString()

    if (content && (content.length > 600 || content.length < 2)) {
      toast.error('Message must be between 2 and 600 characters')
      return
    }

    const data = {
      _id: id,
      content: content,
      files: files.map(file => file._id)
    }

    auth.axiosClient
      .post('/ticket/customer/reply', data)
      .then((response: any) => {
        if (response.status !== 201) {
          toast.error('Error replying to ticket')
          return
        }
        setFiles([])
        form.reset()
        loadTicket()
      })
  }
  //TODO: Check if closed to not show reply form and show a message
  return (
    <div>
      <div className='bg-gray-50 dark:bg-gray-900 min-h-screen'>
        <div className='container px-4 pt-20 mx-auto sm:pt-24 md:pt-24 lg:px-0 dark:bg-gray-900'>
          <div className='grid gap-4 xl:grid-cols-3 2xl:grid-cols-4'>
            <div className='p-4 mb-5 bg-white border border-gray-200 rounded-lg shadow-sm xl:col-span-2 2xl:col-span-3 dark:border-gray-700 sm:p-6 dark:bg-gray-800'>
              <h3 className='mb-4 text-xl font-semibold dark:text-white'>
                {ticket?.subject}
              </h3>
              <div className='overflow-y-auto lg:max-h-[60rem] 2xl:max-h-fit p-2'>
                {ticket !== null && (
                  <div>
                    <TicketComment
                      comment={{
                        user: {
                          name: ticket?.customer?.name,
                          _id: ticket?.customer?._id
                        },
                        content: ticket?.content,
                        createdAt: ticket?.createdAt,
                        updatedAt: ticket?.updatedAt,
                        files: ticket?.files
                      }}
                    />
                    <hr className='my-5 border-gray-300 dark:border-gray-600' />
                  </div>
                )}

                <TicketReplies
                  comments={ticket?.comments}
                  events={ticket?.events}
                />
              </div>
              {ticket && ticket?.status !== 'closed' && (
                <form onSubmit={handleReply}>
                  <div className='w-full border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600'>
                    <div className='px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800'>
                      <label className='sr-only'>Write your message</label>
                      <textarea
                        id='content'
                        name='content'
                        rows={8}
                        className='w-full px-0 text-sm outline-none text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400'
                        placeholder='Write your message'
                      ></textarea>
                    </div>
                    <div className='flex items-center justify-between px-3 py-2 border-t dark:border-gray-600'>
                      <div>
                        {files.map((file: FileModel) => (
                          <div
                            key={file._id}
                            className='flex items-center space-x-2'
                          >
                            <FileIcon />
                            <span className='text-sm font-medium text-gray-900 dark:text-white'>
                              {file.name}
                            </span>
                            <button
                              type='button'
                              className='text-sm font-medium text-red-500 dark:text-red-500'
                              onClick={() => {
                                setFiles(files.filter(f => f._id !== file._id))
                              }}
                            >
                              <CrossIcon />
                            </button>
                          </div>
                        ))}
                      </div>
                      <FilePicker onFilesUploaded={handleFilesUploaded} />
                    </div>
                  </div>
                  <div className='pt-4 flex justify-end'>
                    <button
                      type='submit'
                      className='inline-flex items-end p-2 text-sm font-medium text-center text-white bg-primary-600 rounded-lg focus:ring-4 focus:ring-reprimaryd-200 dark:focus:ring-primary-900 hover:bg-primary-700'
                    >
                      Reply
                    </button>
                  </div>
                </form>
              )}
            </div>
            <div>
              <div className='p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800'>
                <h3 className='mb-4 text-xl font-semibold dark:text-white'>
                  Ticket <span className='text-base'>#{ticket?._id}</span>
                </h3>
                <ul className='divide-y divide-gray-200 dark:divide-gray-700'>
                  <li className='py-4'>
                    <div className='grid grid-cols-2 gap-4'>
                      <div className='flex items-center space-x-4 border-r-[1px] border-gray-200 dark:border-gray-700'>
                        <div className='flex-1 min-w-0'>
                          <span className='block text-base font-semibold text-gray-900 truncate dark:text-white'>
                            Status
                          </span>
                        </div>
                        <div className='inline-flex items-center'>
                          <StatusBadge status={ticket?.status} />
                        </div>
                      </div>
                      <div className='flex items-center space-x-4'>
                        <div className='flex-1 min-w-0'>
                          <span className='block text-base font-semibold text-gray-900 truncate dark:text-white'>
                            Priority
                          </span>
                        </div>
                        <div className='inline-flex items-center dark:text-white capitalize'>
                          {ticket?.priority}
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className='py-4'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex-1 min-w-0'>
                        <span className='block text-base font-semibold text-gray-900 truncate dark:text-white'>
                          Time
                        </span>
                      </div>
                      <div className='inline-flex items-center'>
                        <div className='flex-1 min-w-0'>
                          <span className='block text-base text-gray-900 truncate dark:text-white'>
                            {(ticket && (
                              <TimeFormat minutes={ticket?.minutes} />
                            )) ||
                              '0h 0m'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className='py-4'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex-1 min-w-0'>
                        <span className='block text-base font-semibold text-gray-900 truncate dark:text-white'>
                          Last message
                        </span>
                      </div>
                      <div className='inline-flex items-center'>
                        <div className='flex-1 min-w-0'>
                          <span className='block text-base text-gray-900 truncate dark:text-white'>
                            {ticket && ticket?.updatedAt && (
                              <DateFormat date={ticket?.updatedAt} />
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className='py-4'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex-1 min-w-0'>
                        <span className='block text-base font-semibold text-gray-900 truncate dark:text-white'>
                          Agent
                        </span>
                      </div>
                      <div className='inline-flex items-center'>
                        <div className='flex-shrink-0'>
                          {ticket && ticket?.agent?._id && (
                            <ProfileImage 
                              userId={ticket?.agent?._id} 
                              className='w-6 h-6 rounded-full mr-2'
                            />
                          )}
                        </div>
                        <div className='flex-1 min-w-0'>
                          <span className='block text-base text-gray-900 truncate dark:text-white'>
                            {ticket && ticket?.agent?.name
                              ? ticket?.agent?.name
                              : 'No agent assigned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                  <li className='py-4'>
                    <div className='flex items-center space-x-4'>
                      <div className='flex-1 min-w-0'>
                        <span className='block text-base font-semibold text-gray-900 truncate dark:text-white'>
                          Department
                        </span>
                      </div>
                      <div className='inline-flex items-center'>
                        <div className='flex-1 min-w-0'>
                          <span className='block text-base text-gray-900 truncate dark:text-white'>
                            {ticket && ticket?.department?.name
                              ? ticket?.department?.name
                              : 'No department assigned'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </li>
                  {ticket && ticket?.status === 'open' && (
                    <li className='pt-4 flex justify-end'>
                      <button
                        type='button'
                        onClick={handleCloseTicket}
                        className='inline-flex items-end p-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 hover:bg-red-700'
                      >
                        Close ticket
                      </button>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Ticket
