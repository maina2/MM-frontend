import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
  },
  build: {
    rollupOptions: {
      plugins: [
        visualizer({
          filename: './dist/stats.html',
          open: true,
          gzipSize: true,
        }),
      ],
      output: {
        manualChunks: {
          // Core React libraries
          'vendor-react': ['react', 'react-dom'],
          
          // UI libraries
          'vendor-mui': [
            '@mui/material', 
            '@mui/icons-material', 
            '@mui/x-data-grid',
            '@emotion/react', 
            '@emotion/styled'
          ],
          
          // Map libraries
          'vendor-maps': [
            'react-leaflet', 
            'leaflet', 
            '@react-google-maps/api'
          ],
          
          // Router
          'vendor-router': ['react-router-dom'],
          
          // Other utilities
          'vendor-utils': [
            'axios', 
            'date-fns', 
            'framer-motion',
            'react-hot-toast',
            'react-toastify',
            'react-icons',
            'lucide-react',
            '@reduxjs/toolkit',
            'react-redux',
            'react-slick',
            '@react-oauth/google'
          ]
        },
      },
    },
  },
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