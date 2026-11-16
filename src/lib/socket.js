import { io } from 'socket.io-client';

export const socket = io(import.meta.env.VITE_SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  extraHeaders: {
    'ngrok-skip-browser-warning': 'true',
  },
  // Jangan paksa transports: biarkan Socket.IO memakai polling lalu upgrade.
});
