import { createContext, useContext, useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { getAccessToken } from '../config/axios';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export function SocketProvider({ children }) {
  const socketRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      return;
    }

    const socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
      auth: { token: getAccessToken() },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    });

    socket.on('connect', () => {
      // Connected — server assigns rooms by role
    });

    socket.on('connect_error', () => {
      // Will auto-retry
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  const on = useCallback((event, handler) => {
    socketRef.current?.on(event, handler);
  }, []);

  const off = useCallback((event, handler) => {
    socketRef.current?.off(event, handler);
  }, []);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current, on, off }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used within SocketProvider');
  return ctx;
}
