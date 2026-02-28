'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import apiClient from '../api/client';
import { useSocket } from './useSocket';
import { useAuth } from '@/lib/providers/AuthProvider';

/**
 * Notification Service Functions
 */
const notificationService = {
  getNotifications: async (page = 1, limit = 20, unreadOnly = false) => {
    const response = await apiClient.get('/notifications', {
      params: { page, limit, unreadOnly }
    });
    return response.data;
  },

  getUnreadCount: async () => {
    const response = await apiClient.get('/notifications/unread-count');
    return response.data;
  },

  markAsRead: async (notificationId) => {
    const response = await apiClient.patch(`/notifications/${notificationId}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    const response = await apiClient.patch('/notifications/read-all');
    return response.data;
  },

  deleteNotification: async (notificationId) => {
    const response = await apiClient.delete(`/notifications/${notificationId}`);
    return response.data;
  },

  deleteAllNotifications: async () => {
    const response = await apiClient.delete('/notifications/all');
    return response.data;
  }
};

/**
 * Custom hook for notifications management
 * @param {object} options - Hook options
 * @returns {object} Notifications state and functions
 */
export const useNotifications = (options = {}) => {
  const { enabled = true } = options;
  const { user } = useAuth();
  const { on, off, isConnected } = useSocket();
  const queryClient = useQueryClient();

  // Local state for real-time notifications
  const [realtimeNotifications, setRealtimeNotifications] = useState([]);

  // Fetch notifications
  const {
    data: notificationsData,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications(1, 50),
    enabled: enabled && !!user,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true
  });

  // Fetch unread count
  const { data: unreadData, refetch: refetchUnreadCount } = useQuery({
    queryKey: ['notifications-unread-count'],
    queryFn: notificationService.getUnreadCount,
    enabled: enabled && !!user,
    staleTime: 10000, // 10 seconds
    refetchInterval: 60000 // Refetch every minute
  });

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      setRealtimeNotifications([]);
    }
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    }
  });

  // Delete all notifications mutation
  const deleteAllMutation = useMutation({
    mutationFn: notificationService.deleteAllNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
      setRealtimeNotifications([]);
    }
  });

  // Handle real-time notifications from Socket.IO
  useEffect(() => {
    if (!isConnected || !user) return;

    const handleNotification = (notification) => {
      // Add to real-time notifications
      setRealtimeNotifications((prev) => [notification, ...prev]);

      // Show toast notification
      toast(notification.title || 'New Notification', {
        description: notification.message,
        action: notification.actionUrl
          ? {
              label: 'View',
              onClick: () => {
                window.location.href = notification.actionUrl;
              }
            }
          : undefined
      });

      // Invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      queryClient.invalidateQueries({ queryKey: ['notifications-unread-count'] });
    };

    on('notification', handleNotification);

    return () => {
      off('notification', handleNotification);
    };
  }, [isConnected, user, on, off, queryClient]);

  // Combine real-time and fetched notifications
  // Note: apiClient interceptor already unwraps response.data, and service does another .data,
  // so notificationsData is { notifications: [...], pagination: {...}, unreadCount: N }
  const dbNotifications = notificationsData?.notifications || [];

  // Filter out realtime notifications that are already in DB (by id or _id)
  const uniqueRealtimeNotifications = realtimeNotifications.filter((rt) => {
    const rtId = rt.id || rt._id;
    if (!rtId) return false; // Don't show realtime notifications without valid ID
    return !dbNotifications.some((n) => n._id === rtId || n._id === rt.id || n._id === rt._id);
  });

  // Combine: realtime first (newest), then DB notifications
  const notifications = [...uniqueRealtimeNotifications, ...dbNotifications];

  const unreadCount = unreadData?.unreadCount || 0;

  // Mark notification as read
  const markAsRead = useCallback(
    (notificationId) => {
      // Skip if notificationId is not a valid MongoDB ObjectId (24 hex chars)
      if (!notificationId || typeof notificationId === 'number' ||
          (typeof notificationId === 'string' && !/^[a-f\d]{24}$/i.test(notificationId))) {
        console.warn('Invalid notification ID, skipping mark as read:', notificationId);
        return;
      }
      markAsReadMutation.mutate(notificationId);
      // Remove from real-time notifications if present
      setRealtimeNotifications((prev) => prev.filter((n) => n.id !== notificationId && n._id !== notificationId));
    },
    [markAsReadMutation]
  );

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    markAllAsReadMutation.mutate();
  }, [markAllAsReadMutation]);

  // Delete notification
  const deleteNotification = useCallback(
    (notificationId) => {
      // Skip if notificationId is not a valid MongoDB ObjectId (24 hex chars)
      if (!notificationId || typeof notificationId === 'number' ||
          (typeof notificationId === 'string' && !/^[a-f\d]{24}$/i.test(notificationId))) {
        console.warn('Invalid notification ID, skipping delete:', notificationId);
        return;
      }
      deleteNotificationMutation.mutate(notificationId);
      setRealtimeNotifications((prev) => prev.filter((n) => n.id !== notificationId && n._id !== notificationId));
    },
    [deleteNotificationMutation]
  );

  // Delete all notifications
  const deleteAll = useCallback(() => {
    deleteAllMutation.mutate();
  }, [deleteAllMutation]);

  // Clear real-time notifications (when dropdown is opened)
  const clearRealtimeNotifications = useCallback(() => {
    setRealtimeNotifications([]);
  }, []);

  return {
    notifications,
    unreadCount,
    realtimeCount: realtimeNotifications.length,
    isLoading,
    error,
    refetch,
    refetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
    clearRealtimeNotifications,
    isConnected
  };
};

export default useNotifications;
