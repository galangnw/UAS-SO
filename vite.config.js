import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
<<<<<<< HEAD
    // Host ngrok berubah setiap restart, jadi izinkan semua subdomain ngrok.
    allowedHosts: ['.ngrok-free.dev'],
=======
    allowedHosts: ['trident-savings-patronize.ngrok-free.dev'],
>>>>>>> 94e911e2c5920961426dbb809e762ecf642e1d89
  },
});