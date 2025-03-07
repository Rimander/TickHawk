import { useCallback } from "react";
import FileInfo from "./FileInfo";
import DateFormat from "./DateFormat";
import ProfileImage from "./ProfileImage";

export type TicketCommentType = {
  user: {
    name: string;
    _id?: string;
  };
  content: string;
  minutes?: number;
  files?: {
    _id: string;
    name: string;
    mimetype: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
};
export type TicketCommentProps = {
  className?: string;
  comment: TicketCommentType;
};

export default function TicketComment({ className, comment }: TicketCommentProps) {
  // Replaces new lines with <br /> tags
  const toHtml = useCallback((content: string) => {
    return content.replace(/(?:\r\n|\r|\n)/g, "<br />");
  }, []);

  return (
    <article className={className}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <p className="inline-flex items-center mr-3 text-sm font-semibold text-gray-900 dark:text-white">
            <ProfileImage userId={comment.user._id} />
            {comment.user.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            <DateFormat date={comment.createdAt} />
          </p>
        </div>
      </div>
      <div className="mb-2 p-2 text-gray-900 dark:text-white">
        {comment.minutes !== undefined && comment.minutes > 0  && (
        <div className="py-1.5 mb-2 px-3 inline-flex items-center rounded-lg bg-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600 dark:bg-gray-700">
          <p className="text-gray-900 dark:text-white">{comment.minutes} min</p>
        </div>
        )}
        <div dangerouslySetInnerHTML={{ __html: toHtml(comment.content) }} />
      </div>
      <div className="items-center 2xl:space-x-4 2xl:flex">
        {comment.files?.map((file, index) => <FileInfo key={index} file={file} />)}
      </div>
    </article>
  );
}
