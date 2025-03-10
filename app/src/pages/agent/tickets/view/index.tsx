import { useAuth } from "components/AuthProvider";
import DateFormat from "components/DateFormat";
import { useDialog } from "components/DialogProvider";
import FilePicker from "components/FilePicker";
import CrossIcon from "components/icons/CrossIcon";
import FileIcon from "components/icons/FileIcon";
import ProfileImage from "components/ProfileImage";
import StatusBadge from "components/StatusBadge";
import TicketReplies from "components/TicketReplies";
import TimeFormat from "components/TimeFormat";
import { FileModel } from "models/file.model";
import { Ticket } from "models/ticket.model";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

function AgentTicketView() {
  const { id } = useParams();
  const auth = useAuth();
  const dialog = useDialog();
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [files, setFiles] = useState<FileModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);
  const [statusOptions] = useState([
    { value: "open", label: "Open" },
    { value: "in-progress", label: "In Progress" },
    { value: "pending", label: "Pending" },
    { value: "resolved", label: "Resolved" },
    { value: "closed", label: "Closed" },
  ]);

  const loadTicket = () => {
    if (!ticket) {
      setLoading(true);
    }
    setError(null);

    auth.axiosClient
      .get(`/ticket/${id}`)
      .then((response: any) => {
        const ticketData = response.data;

        // Convert date strings to Date objects
        ticketData.createdAt = new Date(ticketData.createdAt);
        ticketData.updatedAt = new Date(ticketData.updatedAt);

        // Convert comment dates
        if (ticketData.comments) {
          ticketData.comments.forEach((comment: any) => {
            comment.createdAt = new Date(comment.createdAt);
            comment.updatedAt = new Date(comment.updatedAt);
          });
        }

        // Convert event dates
        if (ticketData.events) {
          ticketData.events.forEach((event: any) => {
            event.createdAt = new Date(event.createdAt);
            event.updatedAt = new Date(event.updatedAt);
          });
        }

        setTicket(ticketData);
        setLoading(false);
      })
      .catch((err: any) => {
        console.error("Error loading ticket:", err);
        setError("Failed to load ticket. Please try again.");
        setLoading(false);
      });
  };

  // Fetch available agents
  const loadAgents = () => {
    auth.axiosClient
      .get("/user?role=agent")
      .then((response: any) => {
        const agentData = response.data.users || [];
        // Map agents to a simpler format
        const formattedAgents = agentData.map((agent: any) => ({
          id: agent._id,
          name: agent.name,
        }));
        setAgents(formattedAgents);
      })
      .catch((err: any) => {
        console.error("Error loading agents:", err);
      });
  };

  useEffect(() => {
    loadTicket();
    loadAgents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleFilesUploaded = (uploadedFiles: FileModel[]) => {
    // Max 3 files
    if (files.length + uploadedFiles.length > 3) {
      toast.error("Maximum 3 files allowed");
      return;
    }
    setFiles([...files, ...uploadedFiles]);
  };

  const handleUpdateStatus = (newStatus: string) => {
    dialog.openDialog({
      title: "Update Status",
      content: `Are you sure you want to change the status to ${newStatus}?`,
      primaryAction: "Update Status",
      secondaryAction: "Cancel",
      onPrimaryAction: [
        () => {
          auth.axiosClient
            .patch(`/ticket/${id}/status`, { status: newStatus })
            .then(() => {
              toast.success(`Status updated to ${newStatus}`);
              // Reload ticket data
              loadTicket();
            })
            .catch((error: any) => {
              console.error("Error updating status:", error);
              toast.error("Failed to update status. Please try again.");
            });
        },
      ],
    });
  };

  const handleAssignToMe = () => {
    dialog.openDialog({
      title: "Assign Ticket",
      content: "Are you sure you want to assign this ticket to yourself?",
      primaryAction: "Assign to Me",
      secondaryAction: "Cancel",
      onPrimaryAction: [
        () => {
          auth.axiosClient
            .patch(`/ticket/${id}/assign`, { agentId: auth.user?.id })
            .then(() => {
              toast.success("Ticket assigned to you");
              // Reload ticket data
              loadTicket();
            })
            .catch((error: any) => {
              console.error("Error assigning ticket:", error);
              toast.error("Failed to assign ticket. Please try again.");
            });
        },
      ],
    });
  };

  const handleReassignTicket = () => {
    if (agents.length === 0) {
      toast.error("No agents available to reassign");
      return;
    }

    // Create agent options for dropdown
    const agentOptions = agents.map((agent) => ({
      value: agent.id,
      label: agent.name,
    }));

    // Custom content for the dialog with a dropdown
    const dialogContent = (
      <div>
        <p className="mb-4">Select an agent to assign this ticket to:</p>
        <select
          id="agent-select"
          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
        >
          {agentOptions.map((agent) => (
            <option key={agent.value} value={agent.value}>
              {agent.label}
            </option>
          ))}
        </select>
      </div>
    );

    dialog.openDialog({
      title: "Reassign Ticket",
      content: dialogContent,
      primaryAction: "Reassign",
      secondaryAction: "Cancel",
      onPrimaryAction: [
        () => {
          const selectElement = document.getElementById("agent-select") as HTMLSelectElement;
          const selectedAgentId = selectElement?.value;

          if (!selectedAgentId) {
            toast.error("Please select an agent");
            return;
          }

          auth.axiosClient
            .patch(`/ticket/${id}/assign`, { agentId: selectedAgentId })
            .then(() => {
              toast.success("Ticket reassigned successfully");
              // Reload ticket data
              loadTicket();
            })
            .catch((error: any) => {
              console.error("Error reassigning ticket:", error);
              toast.error("Failed to reassign ticket. Please try again.");
            });
        },
      ],
    });
  };

  const handleCloseTicket = () => {
    dialog.openDialog({
      title: "Close Ticket",
      content: "Are you sure you want to close this ticket?",
      primaryAction: "Close Ticket",
      secondaryAction: "Cancel",
      onPrimaryAction: [
        () => {
          auth.axiosClient
            .patch(`/ticket/${id}/status`, { status: "closed" })
            .then(() => {
              toast.success("Ticket closed");
              // Update status to closed
              loadTicket();
            })
            .catch((error: any) => {
              console.error("Error closing ticket:", error);
              toast.error("Failed to close ticket. Please try again.");
            });
        },
      ],
    });
  };

  const handleReply = (event: React.FormEvent) => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    const formData = new FormData(form);

    const content = formData.get("content")?.toString();
    const minutesInput = formData.get("minutes")?.toString();
    
    // Convertir la entrada de tiempo en un número
    let minutes = 0;
    if (minutesInput) {
      minutes = parseInt(minutesInput, 10); // Usamos directamente minutos
    }

    if (!content || content.length < 2 || content.length > 600) {
      toast.error("Reply must be between 2 and 600 characters");
      return;
    }

    // Preparar datos para la respuesta
    const replyData = {
      _id: id,
      content,
      minutes: minutes, // Enviamos el tiempo en minutos
      files: files.map((file) => file._id),
    };

    // Enviar respuesta al servidor
    auth.axiosClient
      .post(`/ticket/reply`, replyData)
      .then(() => {
        toast.success("Reply sent");
        setFiles([]);
        loadTicket();
        // clear form
        form.reset();
      })
      .catch((error: any) => {
        console.error("Error sending reply:", error);
        toast.error("Failed to send reply. Please try again.");
      });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div role="status">
            <svg
              aria-hidden="true"
              className="inline w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-primary-600"
              viewBox="0 0 100 101"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                fill="currentColor"
              />
              <path
                d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                fill="currentFill"
              />
            </svg>
            <span className="sr-only">Loading...</span>
          </div>
          <p className="mt-2 text-gray-500 dark:text-gray-400">Loading ticket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-900 mb-4">
            <svg
              className="w-6 h-6 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Error</h2>
          <p className="text-gray-500 dark:text-gray-400">{error}</p>
          <button
            onClick={loadTicket}
            className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:ring-primary-300 dark:focus:ring-primary-900"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <div className="container px-4 pt-20 mx-auto sm:pt-24 md:pt-24 lg:px-0 dark:bg-gray-900">
        <div className="grid gap-4 xl:grid-cols-3 2xl:grid-cols-4">
          {/* Main ticket content */}
          <div className="p-4 mb-5 bg-white border border-gray-200 rounded-lg shadow-sm xl:col-span-2 2xl:col-span-3 dark:border-gray-700 sm:p-6 dark:bg-gray-800">
            <div className="flex justify-between mb-4">
              <h3 className="text-xl font-semibold dark:text-white">{ticket?.subject}</h3>
              <div className="flex space-x-2">
                <select
                  className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                  value={ticket?.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                {ticket && ticket.status !== "closed" && (
                  <>
                    {!ticket.agent && (
                      <button
                        onClick={handleAssignToMe}
                        className="px-3 py-2 text-xs font-medium text-center text-white bg-primary-600 rounded-lg hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 mr-2"
                      >
                        Assign to me
                      </button>
                    )}
                    <button
                      onClick={handleReassignTicket}
                      className="px-3 py-2 text-xs font-medium text-center text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      {ticket.agent ? "Reassign" : "Assign to agent"}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="overflow-y-auto lg:max-h-[60rem] 2xl:max-h-fit p-2">
              {ticket && (
                <div>
                  <article className="mb-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <p className="inline-flex items-center mr-3 text-sm font-semibold text-gray-900 dark:text-white">
                          {ticket.content_user ? (
                            <>
                              <ProfileImage userId={ticket.content_user._id} />
                              {ticket.content_user.name}
                            </>
                          ) : (
                            <>
                              <ProfileImage userId={ticket.customer?._id} />
                              {ticket.customer?.name || "Unknown"}
                            </>
                          )}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <DateFormat date={ticket.createdAt} />
                        </p>
                      </div>
                    </div>
                    <div className="mb-2 p-2 text-gray-900 dark:text-white">
                      <div dangerouslySetInnerHTML={{ __html: ticket.content.replace(/(?:\r\n|\r|\n)/g, "<br />") }} />
                    </div>
                  </article>
                  <hr className="my-5 border-gray-300 dark:border-gray-600" />
                </div>
              )}

              <TicketReplies comments={ticket?.comments} events={ticket?.events} />
            </div>

            {/* Reply form - only show if ticket is not closed */}
            {ticket && ticket.status !== "closed" && (
              <form onSubmit={handleReply}>
                <div className="w-full border border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
                  <div className="px-4 py-2 bg-white rounded-t-lg dark:bg-gray-800">
                    <label className="sr-only">Write your message</label>
                    <textarea
                      id="content"
                      name="content"
                      rows={8}
                      className="w-full px-0 text-sm outline-none text-gray-900 bg-white border-0 dark:bg-gray-800 focus:ring-0 dark:text-white dark:placeholder-gray-400"
                      placeholder="Write your reply..."
                      required
                    ></textarea>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 border-t dark:border-gray-600">
                    <div className="flex items-center">
                      <div className="flex items-center mr-4">
                        <label htmlFor="minutes" className="text-sm font-medium text-gray-900 dark:text-white mr-2">
                          Time spent:
                        </label>
                        <input
                          type="number"
                          id="minutes"
                          name="minutes"
                          min="0"
                          step="1"
                          defaultValue="0"
                          className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 w-16 p-1 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
                        />
                        <span className="ml-1 text-sm text-gray-500 dark:text-gray-400">min</span>
                      </div>
                      <div>
                        {files.map((file: FileModel) => (
                          <div key={file._id} className="flex items-center space-x-2">
                            <FileIcon />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</span>
                            <button
                              type="button"
                              className="text-sm font-medium text-red-500 dark:text-red-500"
                              onClick={() => {
                                setFiles(files.filter((f) => f._id !== file._id));
                              }}
                            >
                              <CrossIcon />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                    <FilePicker onFilesUploaded={handleFilesUploaded} />
                  </div>
                </div>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="inline-flex items-end p-2 text-sm font-medium text-center text-white bg-primary-600 rounded-lg focus:ring-4 focus:ring-primary-200 dark:focus:ring-primary-900 hover:bg-primary-700"
                  >
                    Reply
                  </button>
                </div>
              </form>
            )}
          </div>

          {/* Sidebar with ticket information */}
          <div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:border-gray-700 sm:p-6 dark:bg-gray-800">
              <h3 className="mb-4 text-xl font-semibold dark:text-white">
                Ticket <span className="text-base">#{ticket?._id}</span>
              </h3>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                <li className="py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-4 border-r-[1px] border-gray-200 dark:border-gray-700">
                      <div className="flex-1 min-w-0">
                        <span className="block text-base font-semibold text-gray-900 truncate dark:text-white">Status</span>
                      </div>
                      <div className="inline-flex items-center">{ticket && <StatusBadge status={ticket.status} />}</div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex-1 min-w-0">
                        <span className="block text-base font-semibold text-gray-900 truncate dark:text-white">Priority</span>
                      </div>
                      <div className="inline-flex items-center dark:text-white capitalize">{ticket?.priority}</div>
                    </div>
                  </div>
                </li>

                <li className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <span className="block text-base font-semibold text-gray-900 truncate dark:text-white">Time</span>
                    </div>
                    <div className="inline-flex items-center">
                      <div className="flex-1 min-w-0">
                        <span className="block text-base text-gray-900 truncate dark:text-white">
                          {(ticket && <TimeFormat minutes={ticket?.minutes || 0} />) || "0h 0m"}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <span className="block text-base font-semibold text-gray-900 truncate dark:text-white">Created</span>
                    </div>
                    <div className="inline-flex items-center">
                      <div className="flex-1 min-w-0">
                        <span className="block text-base text-gray-900 truncate dark:text-white">
                          {ticket && ticket?.createdAt && <DateFormat date={ticket?.createdAt} />}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <span className="block text-base font-semibold text-gray-900 truncate dark:text-white">Last updated</span>
                    </div>
                    <div className="inline-flex items-center">
                      <div className="flex-1 min-w-0">
                        <span className="block text-base text-gray-900 truncate dark:text-white">
                          {ticket && ticket?.updatedAt && <DateFormat date={ticket?.updatedAt} />}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <span className="block text-base font-semibold text-gray-900 truncate dark:text-white">Customer</span>
                    </div>
                    <div className="inline-flex items-center">
                      <div className="flex-shrink-0 mr-2">
                        {ticket?.customer?._id && <ProfileImage userId={ticket.customer._id} size="sm" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-base text-gray-900 truncate dark:text-white">
                          {ticket?.customer?.name || "Unknown"}
                        </span>
                        <span className="block text-sm text-gray-500 truncate dark:text-gray-400">
                          {ticket?.customer?.email || ""}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <span className="block text-base font-semibold text-gray-900 truncate dark:text-white">Company</span>
                    </div>
                    <div className="inline-flex items-center">
                      <div className="flex-1 min-w-0">
                        <span className="block text-base text-gray-900 truncate dark:text-white">
                          {ticket?.company?.name || "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <span className="block text-base font-semibold text-gray-900 truncate dark:text-white">Agent</span>
                    </div>
                    <div className="inline-flex items-center">
                      <div className="flex-shrink-0 mr-2">
                        {ticket?.agent?._id && <ProfileImage userId={ticket.agent._id} size="sm" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="block text-base text-gray-900 truncate dark:text-white">
                          {ticket?.agent?.name || "No agent assigned"}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>

                <li className="py-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                      <span className="block text-base font-semibold text-gray-900 truncate dark:text-white">Department</span>
                    </div>
                    <div className="inline-flex items-center">
                      <div className="flex-1 min-w-0">
                        <span className="block text-base text-gray-900 truncate dark:text-white">
                          {ticket?.department?.name || "None"}
                        </span>
                      </div>
                    </div>
                  </div>
                </li>

                {/* Actions */}
                {ticket && ticket.status !== "closed" && (
                  <li className="pt-4 flex justify-center">
                    <button
                      type="button"
                      onClick={handleCloseTicket}
                      className="inline-flex items-center p-2 text-sm font-medium text-center text-white bg-red-600 rounded-lg focus:ring-4 focus:ring-red-200 dark:focus:ring-red-900 hover:bg-red-700"
                    >
                      Close Ticket
                    </button>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AgentTicketView;
