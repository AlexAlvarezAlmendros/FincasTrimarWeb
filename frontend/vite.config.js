import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Desactivar sourcemaps en producción para mejor performance
    rollupOptions: {
      output: {
        manualChunks: {
          // Code splitting para mejor cache y performance
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'auth-vendor': ['@auth0/auth0-react'],
          'ui-vendor': ['@fortawesome/fontawesome-svg-core', '@fortawesome/react-fontawesome'],
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Aumentar límite de advertencia
    minify: 'esbuild', // Usar esbuild en lugar de terser (más rápido)
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
  },
})