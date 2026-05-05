import { useState, useEffect, useRef, Fragment } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import {
  Send,
  User as UserIcon,
  MoreVertical,
  Trash2,
  Search,
  MessageSquare,
  ShieldAlert,
  Clock,
  AlertTriangle,
  X,
  ChevronLeft,
} from "lucide-react";
import { Menu, Transition, Dialog } from "@headlessui/react";

// Professional Custom Confirmation Modal
const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Delete",
  type = "danger",
}) => (
  <Transition.Root show={isOpen} as={Fragment}>
    <Dialog as="div" className="relative z-[100]" onClose={onClose}>
      <Transition.Child
        as={Fragment}
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm transition-opacity" />
      </Transition.Child>

      <div className="fixed inset-0 z-10 overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="relative transform overflow-hidden rounded-[2.5rem] bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-md sm:p-8 border border-gray-100 dark:border-gray-700">
              <div className="absolute right-6 top-6">
                <button
                  type="button"
                  className="rounded-full bg-gray-50 dark:bg-gray-700 p-2 text-gray-400 hover:text-gray-500 transition-colors"
                  onClick={onClose}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div>
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${type === "danger" ? "bg-red-50 dark:bg-red-900/20 text-red-600" : "bg-primary-50 dark:bg-primary-900/20 text-primary-600"}`}
                >
                  {type === "danger" ? (
                    <Trash2 className="h-7 w-7" />
                  ) : (
                    <AlertTriangle className="h-7 w-7" />
                  )}
                </div>
                <div className="mt-6 text-center">
                  <Dialog.Title
                    as="h3"
                    className="text-2xl font-black leading-6 text-gray-900 dark:text-white"
                  >
                    {title}
                  </Dialog.Title>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      {message}
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  className={`inline-flex w-full justify-center rounded-2xl px-4 py-4 text-sm font-black uppercase tracking-widest text-white shadow-lg transition-all active:scale-95 ${type === "danger" ? "bg-red-600 hover:bg-red-700 shadow-red-500/20" : "bg-primary-600 hover:bg-primary-700 shadow-primary-500/20"}`}
                  onClick={onConfirm}
                >
                  {confirmText}
                </button>
                <button
                  type="button"
                  className="inline-flex w-full justify-center rounded-2xl bg-gray-50 dark:bg-gray-700 px-4 py-4 text-sm font-black uppercase tracking-widest text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 transition-all border border-gray-100 dark:border-gray-600"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition.Root>
);

export default function ChatPage() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [activeThread, setActiveThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
    confirmText: "Delete",
    type: "danger",
  });

  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    fetchThreads();
    const params = new URLSearchParams(window.location.search);
    const userId = params.get("user_id");
    const jobId = params.get("job_id");
    if (userId) {
      handleInitialChat(userId, jobId);
    }

    const interval = setInterval(fetchThreads, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleInitialChat = async (userId, jobId) => {
    try {
      const response = await api.post("chat/threads/start_chat/", {
        user_id: userId,
        job_id: jobId,
      });
      const thread = response.data;
      setActiveThread(thread);
      window.history.replaceState({}, document.title, "/chat");
    } catch (err) {
      console.error("Failed to start initial chat", err);
    }
  };

  useEffect(() => {
    if (!activeThread) return;

    fetchMessages(activeThread.id);

    const token = localStorage.getItem("access_token");
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const backendHost = window.location.hostname + ":8000";
    const wsUrl = `${protocol}//${backendHost}/ws/chat/${activeThread.id}/?token=${token}`;

    socketRef.current = new WebSocket(wsUrl);

    socketRef.current.onmessage = async (event) => {
      const data = json_parse_safe(event.data);
      if (data && !data.type) {
        setMessages((prev) => {
          if (prev.find((m) => m.id === data.id)) return prev;
          return [
            ...prev,
            { ...data, sender: { username: data.sender_username } },
          ].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        });

        // If we are getting a message while ACTIVE, mark it as read immediately
        if (data.sender_username !== user.username) {
          try {
            await api.post(`chat/messages/${data.id}/mark_read/`);
            // Trigger global refresh to ensure header dot is cleared
            window.dispatchEvent(new Event("messages-read"));
          } catch (err) {
            console.error("Failed to mark websocket message as read", err);
          }
        }
      }
    };

    return () => {
      socketRef.current?.close();
    };
  }, [activeThread]);

  const json_parse_safe = (data) => {
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchThreads = async () => {
    try {
      const response = await api.get("chat/threads/");
      setThreads(response.data.results || response.data);
      setLoading(false);
    } catch (err) {
      console.error("Failed to fetch threads", err);
    }
  };

  const fetchMessages = async (threadId) => {
    try {
      const response = await api.get(`chat/messages/?thread_id=${threadId}`);
      const msgs = response.data.results || response.data;
      msgs.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
      setMessages(msgs);

      // Check if there are any unread messages from the OTHER person
      const hasUnread = msgs.some(
        (m) => !m.is_read && m.sender.username !== user.username,
      );

      if (hasUnread) {
        // Mark all messages in this thread as read on backend
        await api.post(`chat/threads/${threadId}/mark_as_read/`);

        // Trigger global unread count refresh
        window.dispatchEvent(new Event("messages-read"));

        // Refresh thread list to update local unread indicators
        fetchThreads();
      }
    } catch (err) {
      console.error("Failed to fetch messages", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    const msgContent = newMessage.trim();
    if (!msgContent || !activeThread) return;

    setNewMessage("");

    if (socketRef.current?.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ message: msgContent }));
    } else {
      try {
        await api.post("chat/messages/", {
          thread_id: activeThread.id,
          content: msgContent,
        });
        fetchMessages(activeThread.id);
      } catch (err) {
        console.error("Failed to send message via HTTP", err);
        setNewMessage(msgContent);
      }
    }
  };

  const handleDeleteThread = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Conversation",
      message:
        "Are you sure you want to delete this entire conversation? This action cannot be undone.",
      confirmText: "Delete Conversation",
      type: "danger",
      onConfirm: async () => {
        try {
          await api.delete(`chat/threads/${id}/`);
          setThreads((prev) => prev.filter((t) => t.id !== id));
          if (activeThread?.id === id) setActiveThread(null);
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error("Failed to delete thread", err);
        }
      },
    });
  };

  const handleDeleteMessage = (id) => {
    setConfirmModal({
      isOpen: true,
      title: "Delete Message",
      message:
        "Remove this message for everyone? This action cannot be reversed.",
      confirmText: "Delete Message",
      type: "danger",
      onConfirm: async () => {
        try {
          await api.delete(`chat/messages/${id}/`);
          setMessages((prev) => prev.filter((m) => m.id !== id));
          setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        } catch (err) {
          console.error("Failed to delete message", err);
        }
      },
    });
  };

  const getOtherParticipant = (thread) => {
    if (!thread || !thread.participants) return null;
    const currentUsername = user.user?.username || user.username;
    return (
      thread.participants.find((p) => p.username !== currentUsername) ||
      thread.participants[0]
    );
  };

  const filteredThreads = threads.filter((t) => {
    const other = getOtherParticipant(t);
    const name = other?.first_name
      ? `${other.first_name} ${other.last_name}`
      : other?.username || "";
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  if (loading)
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-100px)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );

  return (
    <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-8 py-0 sm:py-6 h-[calc(100vh-64px)] sm:h-[calc(100vh-100px)] flex flex-col">
      <div className="flex-1 flex bg-white dark:bg-gray-800 sm:rounded-[2rem] shadow-2xl overflow-hidden border-b sm:border border-gray-100 dark:border-gray-700">
        {/* Sidebar */}
        <div
          className={`${activeThread ? "hidden md:flex" : "flex"} w-full md:w-80 lg:w-96 border-r border-gray-100 dark:border-gray-700 flex flex-col bg-gray-50/50 dark:bg-gray-900/20`}
        >
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-4">
              Chat
            </h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search messages..."
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-gray-800 border-none rounded-xl text-sm focus:ring-2 focus:ring-primary-500 shadow-sm dark:text-white font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {filteredThreads.length === 0 ? (
              <div className="p-8 text-center flex flex-col items-center justify-center opacity-40">
                <MessageSquare className="w-12 h-12 mb-2" />
                <p className="text-sm font-black uppercase tracking-widest text-xs">
                  No conversations
                </p>
              </div>
            ) : (
              filteredThreads.map((thread) => {
                const other = getOtherParticipant(thread);
                const isActive = activeThread?.id === thread.id;
                return (
                  <div key={thread.id} className="relative group">
                    <button
                      onClick={() => setActiveThread(thread)}
                      className={`w-full p-4 flex items-center gap-4 transition-all border-l-4 ${
                        isActive
                          ? "bg-white dark:bg-gray-700 border-primary-600 shadow-xl scale-100 z-10"
                          : "border-transparent hover:bg-white/50 dark:hover:bg-gray-800"
                      }`}
                    >
                      <div className="h-14 w-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 text-primary-600 font-black text-xl shadow-inner border border-primary-50 dark:border-primary-800/50">
                        {other?.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-start mb-0.5">
                          <p className="text-sm font-black text-gray-900 dark:text-white truncate">
                            {other?.first_name
                              ? `${other.first_name} ${other.last_name}`
                              : other?.username}
                          </p>
                          <span className="text-[10px] text-gray-400 font-black uppercase tracking-tighter">
                            {thread.updated_at &&
                              new Date(thread.updated_at).toLocaleDateString(
                                [],
                                { month: "short", day: "numeric" },
                              )}
                          </span>
                        </div>
                        {thread.job_title && (
                          <p className="text-[9px] font-black text-primary-600 dark:text-primary-400 uppercase tracking-[0.2em] mb-1 truncate">
                            {thread.job_title}
                          </p>
                        )}
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate font-semibold leading-relaxed max-w-[140px]">
                          {thread.last_message?.content ||
                            "Start a conversation..."}
                        </p>
                      </div>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteThread(thread.id);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 text-gray-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl opacity-0 group-hover:opacity-100 transition-all active:scale-90"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Chat Content */}
        <div
          className={`${!activeThread ? "hidden md:flex" : "flex"} flex-1 flex flex-col bg-white dark:bg-gray-800`}
        >
          {activeThread ? (
            <>
              {/* Header */}
              <div className="p-3 sm:p-4 px-4 sm:px-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between bg-white/80 dark:bg-gray-800/80 backdrop-blur-md z-10 sticky top-0">
                <div className="flex items-center gap-3 sm:gap-4">
                  <button
                    onClick={() => setActiveThread(null)}
                    className="md:hidden p-2 -ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-primary-600 flex items-center justify-center text-white font-black text-lg sm:text-xl shadow-xl shadow-primary-500/20 ring-4 ring-primary-50 dark:ring-primary-900/20">
                    {getOtherParticipant(
                      activeThread,
                    )?.username?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-gray-900 dark:text-white leading-tight">
                      {getOtherParticipant(activeThread)?.username}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        Online
                      </span>
                    </div>
                  </div>
                </div>

                <Menu as="div" className="relative">
                  <Menu.Button className="p-3 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl transition-all active:scale-90">
                    <MoreVertical className="w-6 h-6" />
                  </Menu.Button>
                  <Transition
                    as={Fragment}
                    enter="transition ease-out duration-200"
                    enterFrom="transform opacity-0 scale-95 translate-y-2"
                    enterTo="transform opacity-100 scale-100 translate-y-0"
                    leave="transition ease-in duration-150"
                    leaveFrom="transform opacity-100 scale-100 translate-y-0"
                    leaveTo="transform opacity-0 scale-95 translate-y-2"
                  >
                    <Menu.Items className="absolute right-0 mt-3 w-56 origin-top-right bg-white dark:bg-gray-700 rounded-3xl shadow-2xl ring-1 ring-black/5 focus:outline-none p-2 z-20 overflow-hidden border border-gray-100 dark:border-gray-600">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleDeleteThread(activeThread.id)}
                            className={`${active ? "bg-red-50 text-red-600 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-200"} group flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm font-black uppercase tracking-widest transition-colors`}
                          >
                            <Trash2 className="w-5 h-5 shadow-sm" /> Delete Chat
                          </button>
                        )}
                      </Menu.Item>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-gray-50/30 dark:bg-gray-900/30 custom-scrollbar">
                {messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-30">
                    <div className="p-8 rounded-[3rem] bg-gray-100 dark:bg-gray-800 mb-6 shadow-inner animate-pulse">
                      <MessageSquare className="w-16 h-16 text-gray-400" />
                    </div>
                    <p className="font-black uppercase tracking-[0.3em] text-[10px]">
                      No messages yet
                    </p>
                  </div>
                ) : (
                  messages.map((msg, idx) => {
                    const isMe =
                      msg.sender.username ===
                      (user.user?.username || user.username);
                    const showAvatar =
                      idx === 0 ||
                      messages[idx - 1].sender.username !== msg.sender.username;

                    return (
                      <div
                        key={msg.id}
                        className={`flex items-end gap-4 ${isMe ? "flex-row-reverse" : "flex-row"}`}
                      >
                        {!isMe && (
                          <div
                            className={`w-9 h-9 rounded-xl bg-white dark:bg-gray-700 flex items-center justify-center text-[11px] font-black text-gray-500 shrink-0 shadow-sm border border-gray-100 dark:border-gray-600 ${showAvatar ? "opacity-100" : "opacity-0 invisible h-0"}`}
                          >
                            {msg.sender.username?.[0]?.toUpperCase()}
                          </div>
                        )}
                        <div
                          className={`group relative max-w-[70%] ${isMe ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`px-6 py-4 rounded-[2rem] shadow-sm text-sm font-semibold border leading-relaxed transition-all duration-300 ${
                              isMe
                                ? "bg-primary-600 text-white rounded-br-none border-primary-500 shadow-primary-500/20"
                                : "bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-bl-none border-gray-100 dark:border-gray-600"
                            }`}
                          >
                            {msg.content}
                            <div
                              className={`flex items-center gap-1.5 mt-2 opacity-50 text-[9px] font-black uppercase tracking-widest ${isMe ? "justify-end text-primary-50" : "text-gray-400"}`}
                            >
                              <Clock className="w-2.5 h-2.5" />
                              {new Date(msg.created_at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>

                          <div
                            className={`absolute top-0 opacity-0 group-hover:opacity-100 transition-all duration-300 ${isMe ? "-left-14" : "-right-14"}`}
                          >
                            <Menu as="div" className="relative">
                              <Menu.Button className="p-2.5 text-gray-300 hover:text-red-500 hover:bg-white dark:hover:bg-gray-700 rounded-2xl shadow-xl transition-all active:scale-90 border border-gray-50 dark:border-gray-600">
                                <MoreVertical className="w-5 h-5" />
                              </Menu.Button>
                              <Transition
                                as={Fragment}
                                enter="transition ease-out duration-200"
                                enterFrom="transform opacity-0 scale-95 translate-y-2"
                                enterTo="transform opacity-100 scale-100 translate-y-0"
                                leave="transition ease-in duration-150"
                                leaveFrom="transform opacity-100 scale-100 translate-y-0"
                                leaveTo="transform opacity-0 scale-95 translate-y-2"
                              >
                                <Menu.Items
                                  className={`absolute mt-2 w-40 origin-top bg-white dark:bg-gray-700 rounded-[1.5rem] shadow-2xl ring-1 ring-black/5 focus:outline-none p-1.5 z-20 border border-gray-100 dark:border-gray-600 ${isMe ? "left-0" : "right-0"}`}
                                >
                                  <Menu.Item>
                                    {({ active }) => (
                                      <button
                                        onClick={() =>
                                          handleDeleteMessage(msg.id)
                                        }
                                        className={`${active ? "bg-red-50 text-red-600 dark:bg-red-900/20" : "text-gray-700 dark:text-gray-200"} flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-[10px] font-black uppercase tracking-widest transition-colors`}
                                      >
                                        <Trash2 className="w-4 h-4" /> Delete
                                      </button>
                                    )}
                                  </Menu.Item>
                                </Menu.Items>
                              </Transition>
                            </Menu>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="p-4 sm:p-8 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                <form
                  onSubmit={handleSendMessage}
                  className="flex gap-4 bg-gray-50 dark:bg-gray-900/50 p-2 sm:p-2.5 pl-5 sm:pl-8 rounded-[3rem] border-2 border-transparent focus-within:border-primary-500/20 focus-within:bg-white dark:focus-within:bg-gray-800 transition-all shadow-inner"
                >
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-base py-3 dark:text-white font-bold placeholder-gray-400 appearance-none"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="h-12 w-12 sm:h-14 sm:w-14 flex items-center justify-center bg-gray-900 dark:bg-gray-700 text-white rounded-full hover:bg-black dark:hover:bg-gray-600 disabled:opacity-20 transition-all shadow-xl shadow-gray-500/20 active:scale-90 shrink-0 transform"
                  >
                    <Send className="w-5 h-5 sm:w-6 sm:h-6 mr-0.5 mt-0.5" />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-gray-50/50 dark:bg-black/10">
              <div className="w-64 h-64 bg-white dark:bg-gray-800 rounded-[4rem] shadow-2xl flex items-center justify-center mb-10 border-4 border-gray-50 dark:border-gray-700 overflow-hidden group">
                <div className="relative">
                  <div className="absolute -inset-8 bg-primary-100 dark:bg-primary-900/20 rounded-full blur-3xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                  <MessageSquare className="w-24 h-24 text-primary-200 dark:text-gray-700 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700 relative z-10" />
                  <div className="absolute -top-6 -right-6 h-16 w-16 bg-primary-600 rounded-[1.5rem] border-[6px] border-white dark:border-gray-800 flex items-center justify-center shadow-2xl animate-bounce">
                    <span className="text-white text-sm font-black tracking-tighter">
                      Hi!
                    </span>
                  </div>
                </div>
              </div>
              <h3 className="text-4xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                Your Conversations
              </h3>
              <p className="max-w-xs text-gray-500 dark:text-gray-400 font-bold leading-relaxed">
                Connect with talent and opportunities instantly. Select a chat
                to get started.
              </p>
            </div>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={confirmModal.onConfirm}
        title={confirmModal.title}
        message={confirmModal.message}
        confirmText={confirmModal.confirmText}
        type={confirmModal.type}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
      `,
        }}
      />
    </div>
  );
}
