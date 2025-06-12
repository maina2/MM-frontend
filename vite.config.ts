import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Force single React instance
      'react': path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    }
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mui/material', '@emotion/react', '@emotion/styled'],
    force: true
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
        manualChunks(id) {
          // Vendor libraries - be more specific
          if (id.includes('node_modules/react/') && !id.includes('react-')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          if (id.includes('node_modules/@mui') || id.includes('node_modules/@emotion')) {
            return 'vendor-mui';
          }
          if (id.includes('node_modules/react-leaflet') || id.includes('node_modules/leaflet')) {
            return 'vendor-leaflet';
          }
          if (id.includes('node_modules/react-router-dom')) {
            return 'vendor-router';
          }
          if (id.includes('node_modules/axios')) {
            return 'vendor-axios';
          }

          // App chunks
          if (id.includes('DeliveryRoute') || id.includes('DeliveryTasks') || id.includes('DeliveryDetails') || id.includes('DeliveryManagement')) {
            return 'chunk-delivery';
          }
          if (id.includes('AdminDashboard') || id.includes('UserManagement') || id.includes('ProductManagement') || id.includes('CategoryManagement') || id.includes('OrderManagement') || id.includes('PaymentManagement') || id.includes('Settings')) {
            return 'chunk-admin';
          }
          if (id.includes('Cart') || id.includes('Payment') || id.includes('Products') || id.includes('ProductDetail') || id.includes('Categories') || id.includes('CategoryDetail') || id.includes('OrderConfirmation') || id.includes('Checkout') || id.includes('SearchResults') || id.includes('Offers') || id.includes('Orders')) {
            return 'chunk-customer';
          }
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