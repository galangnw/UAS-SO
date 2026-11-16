import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Host ngrok berubah setiap restart, jadi izinkan semua subdomain ngrok.
    allowedHosts: ['.ngrok-free.dev'],
  },
});