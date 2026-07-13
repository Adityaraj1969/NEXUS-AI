import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

/**
 * Vite Configuration for NEXUS AI
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [react(), tailwindcss()],

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  server: {
    port: 5173,
    open: true,
    host: true,
  },

  preview: {
    port: 4173,
  },

  build: {
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },

  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'recharts', 'lucide-react'],
  },
});
