"use client";

import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Bell, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";

export default function NotificationBell() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const menuRef = useRef(null);

  const fetchNotifications = async () => {
    if (!session?.user) return;
    try {
      const { data } = await axios.get("/api/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Could not fetch notifications", err);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [session]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = async (id = null) => {
    try {
      await axios.put("/api/notifications", id ? { notificationId: id } : {});
      fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.read) markAsRead(notif._id);
    setIsOpen(false);
  };

  if (!session?.user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 transition-colors"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-950"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-800 dark:bg-gray-950 z-50">
          <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900/50">
            <h3 className="font-semibold text-gray-950 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAsRead()}
                className="text-xs font-medium text-primary hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-500">
                You have no notifications.
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map((notif) => (
                  <div
                    key={notif._id}
                    className={`block p-4 transition-colors ${notif.read ? "bg-white dark:bg-gray-950" : "bg-blue-50/50 dark:bg-blue-900/10"}`}
                  >
                    <div className="flex gap-3">
                      {!notif.read && <div className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-blue-500"></div>}
                      <div className="flex-1">
                        <p className={`text-sm ${notif.read ? "font-medium text-gray-700 dark:text-gray-300" : "font-semibold text-gray-950 dark:text-white"}`}>
                          {notif.title}
                        </p>
                        <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
                          {notif.message}
                        </p>
                        <p className="mt-1.5 text-xs text-gray-400 dark:text-gray-500">
                          {new Date(notif.createdAt).toLocaleString("en-IN")}
                        </p>
                        {notif.link && (
                          <Link
                            href={notif.link}
                            onClick={() => handleNotificationClick(notif)}
                            className="mt-2 inline-block text-xs font-medium text-primary hover:underline"
                          >
                            View details →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
