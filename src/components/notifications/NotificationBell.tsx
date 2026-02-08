"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface NotificationBellProps {
  onClick?: () => void;
  className?: string;
}

export function NotificationBell({ onClick, className = "" }: NotificationBellProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasNewNotification, setHasNewNotification] = useState(false);

  useEffect(() => {
    fetchUnreadCount();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(() => {
      fetchUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/notifications?limit=1&unreadOnly=true");
      if (res.ok) {
        const data = await res.json();
        const newCount = data.unreadCount || 0;

        // Trigger animation if count increased
        if (newCount > unreadCount && unreadCount > 0) {
          setHasNewNotification(true);
          setTimeout(() => setHasNewNotification(false), 2000);
        }

        setUnreadCount(newCount);
      }
    } catch (error) {
      console.error("Error fetching unread count:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Public method to refresh count (can be called from parent)
  useEffect(() => {
    (window as any).__refreshNotificationCount = fetchUnreadCount;
  }, []);

  return (
    <button
      onClick={onClick}
      className={`
        relative p-2 rounded-lg transition-colors
        hover:bg-gray-100
        focus:outline-none focus:ring-2 focus:ring-blue-500
        ${className}
      `}
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} non lues)` : ""}`}
    >
      {/* Bell Icon */}
      <motion.div
        animate={hasNewNotification ? { rotate: [0, -15, 15, -15, 15, 0] } : {}}
        transition={{ duration: 0.5 }}
      >
        <Bell
          className={`w-6 h-6 ${
            unreadCount > 0 ? "text-blue-600" : "text-gray-600"
          }`}
        />
      </motion.div>

      {/* Unread Badge */}
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </motion.div>
        )}
      </AnimatePresence>

      {/* New notification pulse */}
      {hasNewNotification && (
        <motion.div
          initial={{ scale: 1, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0 bg-blue-400 rounded-full"
        />
      )}

      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
        </div>
      )}
    </button>
  );
}

/**
 * Compact version for mobile/header
 */
export function NotificationBellCompact({ onClick }: NotificationBellProps) {
  return (
    <NotificationBell
      onClick={onClick}
      className="sm:hidden" // Only show on mobile
    />
  );
}

/**
 * Helper to manually trigger refresh from anywhere in the app
 */
export function refreshNotificationCount() {
  if (typeof window !== "undefined" && (window as any).__refreshNotificationCount) {
    (window as any).__refreshNotificationCount();
  }
}
