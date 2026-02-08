"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Check,
  Trash2,
  Bell,
  Calendar,
  TrendingUp,
  Award,
  Flame,
  RefreshCw,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { refreshNotificationCount } from "./NotificationBell";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  read: boolean;
  sentAt: string;
  data?: Record<string, any>;
}

interface NotificationDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export function NotificationDropdown({
  isOpen,
  onClose,
  anchorRef,
}: NotificationDropdownProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMarkingAllAsRead, setIsMarkingAllAsRead] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        anchorRef?.current &&
        !anchorRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose, anchorRef]);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=20&unreadOnly=false");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notificationId ? { ...n, read: true } : n
          )
        );
        refreshNotificationCount();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setIsMarkingAllAsRead(true);
    try {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllAsRead: true }),
      });

      if (res.ok) {
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, read: true }))
        );
        refreshNotificationCount();
      }
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setIsMarkingAllAsRead(false);
    }
  };

  const handleDelete = async (notificationId: string) => {
    try {
      const res = await fetch(`/api/notifications?id=${notificationId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
        refreshNotificationCount();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "DAILY_FACT":
        return <Bell className="w-5 h-5 text-blue-500" />;
      case "FISCAL_ALERT":
        return <Calendar className="w-5 h-5 text-orange-500" />;
      case "WEEKLY_DIGEST":
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case "BADGE_EARNED":
        return <Award className="w-5 h-5 text-yellow-500" />;
      case "STREAK_REMINDER":
        return <Flame className="w-5 h-5 text-red-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const formatTime = (sentAt: string) => {
    const date = new Date(sentAt);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "À l'instant";
    if (diffMins < 60) return `Il y a ${diffMins} min`;

    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `Il y a ${diffHours}h`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `Il y a ${diffDays}j`;

    return date.toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
    });
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 sm:hidden"
          />

          {/* Dropdown */}
          <motion.div
            ref={dropdownRef}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden"
            style={{
              maxHeight: "calc(100vh - 100px)",
            }}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Bell className="w-5 h-5" />
                  <h3 className="text-lg font-bold">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="bg-white/20 text-xs px-2 py-0.5 rounded-full">
                      {unreadCount} nouvelle{unreadCount > 1 ? "s" : ""}
                    </span>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="p-1 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {unreadCount > 0 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleMarkAllAsRead}
                    disabled={isMarkingAllAsRead}
                    className="text-white hover:bg-white/10 text-xs h-8"
                  >
                    {isMarkingAllAsRead ? (
                      <>
                        <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                        Marquage...
                      </>
                    ) : (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Tout marquer comme lu
                      </>
                    )}
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    onClose();
                    window.location.href = "/settings/notifications";
                  }}
                  className="text-white hover:bg-white/10 text-xs h-8"
                >
                  <Settings className="w-3 h-3 mr-1" />
                  Paramètres
                </Button>
              </div>
            </div>

            {/* Notifications List */}
            <div
              className="overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 220px)" }}
            >
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-12 px-4">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">
                    Aucune notification
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Vous serez notifié ici des événements importants
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      notification={notification}
                      onMarkAsRead={handleMarkAsRead}
                      onDelete={handleDelete}
                      getIcon={getNotificationIcon}
                      formatTime={formatTime}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="border-t border-gray-200 p-3 text-center">
                <button
                  onClick={() => {
                    onClose();
                    // TODO: Navigate to notifications page
                  }}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Voir toutes les notifications →
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
  getIcon: (type: string) => JSX.Element;
  formatTime: (sentAt: string) => string;
}

function NotificationItem({
  notification,
  onMarkAsRead,
  onDelete,
  getIcon,
  formatTime,
}: NotificationItemProps) {
  return (
    <div
      className={`
        p-4 transition-colors group
        ${notification.read ? "bg-white" : "bg-blue-50"}
        hover:bg-gray-50
      `}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">{getIcon(notification.type)}</div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4
              className={`text-sm font-semibold ${
                notification.read ? "text-gray-900" : "text-gray-900"
              }`}
            >
              {notification.title}
            </h4>
            {!notification.read && (
              <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
            )}
          </div>

          <p className="text-sm text-gray-600 line-clamp-2 mb-2">
            {notification.body}
          </p>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">
              {formatTime(notification.sentAt)}
            </span>

            {/* Actions */}
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              {!notification.read && (
                <button
                  onClick={() => onMarkAsRead(notification.id)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
                  title="Marquer comme lu"
                >
                  <Check className="w-4 h-4 text-gray-600" />
                </button>
              )}
              <button
                onClick={() => onDelete(notification.id)}
                className="p-1 hover:bg-red-100 rounded transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
