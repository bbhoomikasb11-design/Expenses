import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', { autoConnect: false });

export const joinGroup = (id) => {
  if (!socket.connected) socket.connect();
  socket.emit('join-group', id);
};

export const onGroupUpdated = (callback) => {
  socket.on('group-updated', callback);
  return () => socket.off('group-updated', callback);
};
