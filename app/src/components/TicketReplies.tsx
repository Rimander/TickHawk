import { useEffect, useState } from 'react'
import TicketComment from './TicketComment'
import TicketEvent from './TicketEvent'

type ReplyFilter = 'all' | 'internal' | 'public';

//TODO: add the comments and events props to the function
export default function TicketReplies ({ comments, events }: any) {
  const [allReplies, setAllReplies] = useState([])
  const [activeFilter, setActiveFilter] = useState<ReplyFilter>('all')
  const [hasInternalComments, setHasInternalComments] = useState(false)

  useEffect(() => {
    // Order comments and events by createdAt in same array
    if (!comments && !events) return
    
    if (!comments) comments = []
    if (!events) events = []
    
    // Detect if there are internal comments
    const hasInternal = comments.some((comment: any) => comment.internal);
    setHasInternalComments(hasInternal);
    
    const replies = [
      ...comments.map((comment: any) => ({ 
        ...comment, 
        filter: 'comment',
        commentType: comment.internal ? 'internal' : 'public'
      })),
      ...events.map((event: any) => ({ ...event, filter: 'event' }))
    ].sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    )
    setAllReplies(replies as any)
  }, [comments, events])
  // Filtrar respuestas según el filtro activo
  const filteredReplies = allReplies.filter((reply: any) => {
    if (activeFilter === 'all') return true;
    
    if (activeFilter === 'public') {
      // En vista pública, mostrar eventos y comentarios públicos
      return (reply.filter === 'event' || reply.commentType === 'public');
    }
    
    if (activeFilter === 'internal') {
      // En vista interna, mostrar solo comentarios internos
      return reply.commentType === 'internal';
    }
    
    return false;
  });

  return (
    <div>
      {/* Filtros de visualización - Solo mostrar si hay comentarios internos */}
      {hasInternalComments && (
        <div className="flex items-center space-x-4 mb-4 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveFilter('all')}
            className={`pb-2 px-1 ${
              activeFilter === 'all'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-500 dark:border-primary-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            All Activities
          </button>
          <button
            onClick={() => setActiveFilter('public')}
            className={`pb-2 px-1 ${
              activeFilter === 'public'
                ? 'border-b-2 border-primary-500 text-primary-600 dark:text-primary-500 dark:border-primary-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Public Replies & Events
          </button>
          <button
            onClick={() => setActiveFilter('internal')}
            className={`pb-2 px-1 flex items-center ${
              activeFilter === 'internal'
                ? 'border-b-2 border-yellow-500 text-yellow-600 dark:text-yellow-500 dark:border-yellow-500'
                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <span>Internal Notes</span>
            <span className="ml-2 inline-flex items-center justify-center w-4 h-4 text-xs font-semibold text-white bg-yellow-500 rounded-full">
              {allReplies.filter((r: any) => r.commentType === 'internal').length}
            </span>
          </button>
        </div>
      )}

      {/* Lista de respuestas */}
      {filteredReplies.map((reply: any, index: number) => (
        <div key={index}>
          {reply.filter === 'comment' ? (
            <TicketComment key={index} comment={reply} />
          ) : (
            <TicketEvent key={index} event={reply} />
          )}
          <hr className='my-5 border-gray-300 dark:border-gray-600' />
        </div>
      ))}
      
      {/* Mensaje si no hay resultados con el filtro actual */}
      {filteredReplies.length === 0 && (
        <div className="py-4 text-center text-gray-500 dark:text-gray-400">
          No replies match the current filter.
        </div>
      )}
    </div>
  )
}
