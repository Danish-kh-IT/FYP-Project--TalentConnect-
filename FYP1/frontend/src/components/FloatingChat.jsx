import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Minus, Maximize2 } from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function FloatingChat() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  if (user?.user_type === "admin") return null;
  const [isMinimized, setIsMinimized] = useState(false);
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: "system",
      content: "Hi! How can we help you today?",
      time: "11:12 AM",
    },
  ]);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = {
      id: Date.now(),
      sender: "user",
      content: message,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setChatHistory([...chatHistory, newMsg]);
    setMessage("");

    // Simulate response
    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: "system",
          content:
            "Thanks for reaching out! Our team will get back to you shortly.",
          time: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ]);
    }, 1000);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 p-4 bg-primary-600 text-white rounded-full shadow-2xl hover:scale-110 transition-all z-50 flex items-center gap-3 font-bold px-6 border-4 border-white dark:border-gray-800"
      >
        <MessageCircle className="w-6 h-6" />
        <span>Messages</span>
      </button>
    );
  }

  return (
    <div
      className={`fixed bottom-8 right-8 w-96 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50 transition-all duration-300 ${isMinimized ? "h-16" : "h-[500px]"}`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-indigo-600 p-4 flex items-center justify-between text-white">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold">
            D
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-widest opacity-80">
              Real-time Chat
            </div>
            <div className="text-sm font-bold">DesignStudio Creative</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-white/10 rounded-lg"
          >
            {isMinimized ? (
              <Maximize2 className="w-4 h-4" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1 hover:bg-white/10 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div
            ref={scrollRef}
            className="flex-1 p-6 h-[350px] overflow-y-auto space-y-4 bg-gray-50/50 dark:bg-gray-900/50"
          >
            {chatHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-sm ${
                    msg.sender === "user"
                      ? "bg-primary-600 text-white rounded-tr-none"
                      : "bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm rounded-tl-none border border-gray-100 dark:border-gray-600"
                  }`}
                >
                  <div className="font-bold mb-1 opacity-70 text-[10px] uppercase tracking-widest">
                    {msg.sender === "user" ? "Candidate" : "DesignStudio"}
                  </div>
                  {msg.content}
                  <div className="text-[9px] mt-2 opacity-50 text-right uppercase font-black">
                    {msg.time}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 flex gap-2"
          >
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 dark:bg-gray-700 border-none rounded-2xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500"
            />
            <button
              type="submit"
              className="p-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-all shadow-lg"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
}
