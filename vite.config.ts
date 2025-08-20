import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://vartalap-qm32.onrender.com'
    }
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
