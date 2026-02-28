'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, Trash2, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useNotifications } from '@/lib/hooks/useNotifications';
import { cn } from '@/lib/utils';

/**
 * Notification Bell Component with Dropdown
 */
export function NotificationBell({ className }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const {
    notifications,
    unreadCount,
    realtimeCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    clearRealtimeNotifications,
    isConnected
  } = useNotifications();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle dropdown toggle
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    // Don't clear realtime notifications immediately - let them show in the list
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'new_learner_registration':
      case 'new_lecturer_application':
        return '👤';
      case 'lecturer_approved':
        return '✅';
      case 'lecturer_rejected':
        return '❌';
      case 'new_course_published':
        return '📚';
      case 'announcement':
        return '📢';
      default:
        return '🔔';
    }
  };

  const totalUnread = unreadCount + realtimeCount;

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />

        {/* Unread Badge */}
        {totalUnread > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center text-xs font-bold text-white bg-red-500 rounded-full">
            {totalUnread > 99 ? '99+' : totalUnread}
          </span>
        )}

        {/* Connection Indicator */}
        <span
          className={cn(
            'absolute bottom-0 right-0 h-2 w-2 rounded-full border border-white',
            isConnected ? 'bg-green-500' : 'bg-gray-400'
          )}
          title={isConnected ? 'Connected' : 'Disconnected'}
        />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-[70vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 flex items-center gap-1"
                  title="Mark all as read"
                >
                  <CheckCheck className="h-3 w-3" />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                <Bell className="h-12 w-12 text-gray-300 mb-2" />
                <p className="text-gray-500 dark:text-gray-400">No notifications yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  We&apos;ll notify you when something important happens
                </p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {notifications.map((notification, index) => {
                  const notifId = notification._id || notification.id || index;
                  const isUnread = notification.read === false || notification.read === undefined;

                  return (
                  <li
                    key={notifId}
                    className={cn(
                      'px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer',
                      isUnread && 'bg-blue-50 dark:bg-blue-900/20'
                    )}
                    onClick={() => {
                      if (isUnread && notifId) {
                        markAsRead(notifId);
                      }
                      if (notification.actionUrl) {
                        window.location.href = notification.actionUrl;
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <span className="text-xl flex-shrink-0">
                        {getNotificationIcon(notification.type)}
                      </span>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {notification.title || 'New Notification'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                          {notification.message}
                        </p>
                        {notification.createdAt && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            {formatDistanceToNow(new Date(notification.createdAt), {
                              addSuffix: true
                            })}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {isUnread && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(notifId);
                            }}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4 text-gray-500" />
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNotification(notifId);
                          }}
                          className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </li>
                  );
                })}
              </ul>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <button
                onClick={deleteAll}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Clear all
              </button>
              <a
                href="/notifications"
                className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400"
              >
                View all
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default NotificationBell;
