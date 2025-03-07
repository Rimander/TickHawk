import { useEffect, useState } from 'react'
import TicketComment from './TicketComment'
import TicketEvent from './TicketEvent'

//TODO: add the comments and events props to the function
export default function TicketReplies ({ comments, events }: any) {
  const [allReplies, setAllReplies] = useState([])

  useEffect(() => {
    // Order comments and events by createdAt in same array
    if (!comments && !events) return
    
    if (!comments) comments = []
    if (!events) events = []
    
    const replies = [
      ...comments.map((comment: any) => ({ ...comment, filter: 'comment' })),
      ...events.map((event: any) => ({ ...event, filter: 'event' }))
    ].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    setAllReplies(replies as any)
  }, [comments, events])
  return (
    <div>
      {(allReplies || []).map((reply: any, index: number) => (
        <div key={index}>
          {reply.filter === 'comment' ? (
            <TicketComment key={index} comment={reply} />
          ) : (
            <TicketEvent key={index} event={reply} />
          )}
          <hr className='my-5 border-gray-300 dark:border-gray-600' />
        </div>
      ))}
    </div>
  )
}
