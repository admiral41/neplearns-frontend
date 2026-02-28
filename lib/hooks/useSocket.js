'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from '@/lib/providers/AuthProvider';

// Extract just the origin (protocol + host) for socket connection
const getSocketUrl = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return 'http://localhost:5000';
  }
  try {
    const url = new URL(apiUrl);
    return url.origin; // Returns just protocol + host (e.g., 'https://api.neplearns.com')
  } catch {
    // If URL parsing fails, try basic extraction
    console.error('Invalid NEXT_PUBLIC_API_URL:', apiUrl);
    return 'http://localhost:5000';
  }
};

const SOCKET_URL = getSocketUrl();

/**
 * Custom hook for Socket.IO connection management
 * @returns {object} Socket instance and connection state
 */
export const useSocket = () => {
  const { user, token, logout } = useAuth();
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [forceLogoutData, setForceLogoutData] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    if (!token) {
      // Disconnect if no token
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        setIsConnected(false);
      }
      return;
    }

    // Create socket connection with auth
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000
    });

    const socket = socketRef.current;

    // Connection handlers
    socket.on('connect', () => {
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('disconnect', (reason) => {
      setIsConnected(false);
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error.message);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socket.on('reconnect', (attemptNumber) => {
      setIsConnected(true);
      setConnectionError(null);
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error.message);
    });

    socket.on('reconnect_failed', () => {
      console.error('Socket reconnection failed');
      setConnectionError('Failed to reconnect to server');
    });

    // SINGLE SESSION ENFORCEMENT: Listen for force_logout event
    socket.on('force_logout', (data) => {
      setForceLogoutData(data);

      // Show alert to user before logging out
      const message = data.message || 'You have been logged out because your account was accessed from another device.';

      // Store the reason for display on login page
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('force_logout_reason', message);
      }

      // Trigger logout
      logout();
    });

    // Cleanup on unmount or token change
    return () => {
      if (socket) {
        socket.off('force_logout');
        socket.disconnect();
      }
    };
  }, [token, logout]);

  // Subscribe to an event
  const on = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.on(event, callback);
    }
  }, []);

  // Unsubscribe from an event
  const off = useCallback((event, callback) => {
    if (socketRef.current) {
      socketRef.current.off(event, callback);
    }
  }, []);

  // Emit an event
  const emit = useCallback((event, data) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit(event, data);
    }
  }, [isConnected]);

  // Join a room
  const joinRoom = useCallback((room) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('join_room', room);
    }
  }, [isConnected]);

  // Leave a room
  const leaveRoom = useCallback((room) => {
    if (socketRef.current && isConnected) {
      socketRef.current.emit('leave_room', room);
    }
  }, [isConnected]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionError,
    forceLogoutData,
    on,
    off,
    emit,
    joinRoom,
    leaveRoom
  };
};

export default useSocket;
