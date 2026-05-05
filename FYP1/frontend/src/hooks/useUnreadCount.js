import { useState, useEffect, useCallback } from "react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";

export const useUnreadCount = () => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    try {
      const response = await api.get("chat/threads/unread_count/");
      setUnreadCount(response.data.unread_count);
    } catch (err) {
      console.error("Failed to fetch unread count", err);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCount();

    // Check every 12 seconds for new messages (more real-time)
    const interval = setInterval(fetchUnreadCount, 12000);

    // Listen for storage events (if multiple tabs are open) or custom events
    const handleRefresh = () => fetchUnreadCount();
    window.addEventListener("storage", handleRefresh);
    window.addEventListener("messages-read", handleRefresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("storage", handleRefresh);
      window.removeEventListener("messages-read", handleRefresh);
    };
  }, [fetchUnreadCount]);

  return { unreadCount, refreshUnreadCount: fetchUnreadCount };
};
