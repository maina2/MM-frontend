import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://mm-backend-8rp8.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});