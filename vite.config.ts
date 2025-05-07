import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    headers: {
      'Cross-Origin-Opener-Policy': 'unsafe-none', // Temporarily disable COOP for development
      'Cross-Origin-Embedder-Policy': 'unsafe-none', // Disable COEP if needed
    },
  },
});