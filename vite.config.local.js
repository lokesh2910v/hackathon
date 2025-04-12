import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// This is a simplified Vite config for local development
// It removes Replit-specific plugins that cause errors locally
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './client/src'),
      '@shared': path.resolve(__dirname, './shared'),
      '@assets': path.resolve(__dirname, './attached_assets'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
});