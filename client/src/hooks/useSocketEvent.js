import { useEffect } from 'react';
import { useSocket } from '../context/SocketContext';

export function useSocketEvent(event, handler) {
  const { on, off } = useSocket();

  useEffect(() => {
    on(event, handler);
    return () => off(event, handler);
  }, [event, handler, on, off]);
}
