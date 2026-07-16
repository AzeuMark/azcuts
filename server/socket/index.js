import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import env from '../config/env.js';

let io = null;

export function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: env.clientOrigin,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));

    try {
      const decoded = jwt.verify(token, env.jwtAccessSecret);
      socket.user = { id: decoded.id, role: decoded.role };
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const { id, role } = socket.user;

    // Join personal room
    socket.join(`user:${id}`);

    // Join role rooms
    if (role === 'staff') socket.join('staff');
    if (role === 'admin') socket.join('admin');

    socket.on('disconnect', () => {
      // Cleanup handled automatically by Socket.io
    });
  });

  return io;
}

export function getIO() {
  if (!io) throw new Error('Socket.io not initialized');
  return io;
}
