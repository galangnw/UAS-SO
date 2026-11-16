<<<<<<< HEAD
const API_BASE = import.meta.env.VITE_API_BASE_URL;
=======
import { io } from 'socket.io-client';

const API_BASE = import.meta.env.VITE_API_BASE_URL;
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89

export async function api(path, options = {}) {
  const headers = {
    'ngrok-skip-browser-warning': 'true',
    ...options.headers,
  };

  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok || body.success === false) {
    throw new Error(
<<<<<<< HEAD
      body.error?.message ||
        body.error?.code ||
        `Request gagal (${response.status})`,
=======
      body.error?.message || body.error?.code || `Request gagal (${response.status})`,
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
    );
  }

  return body.data;
}
<<<<<<< HEAD
=======

export function createRoomSocket() {
  return io(SOCKET_URL, {
    withCredentials: true,
    extraHeaders: {
      'ngrok-skip-browser-warning': 'true',
    },
    // Jangan paksa transports: biarkan Socket.IO memakai default polling lalu upgrade.
  });
}
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
