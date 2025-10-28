import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  // This will load .env, .env.[mode], and .env.[mode].local
  // Use default envDir (current directory) so that .env files inside frontend are loaded
  // envDir: './',
  define: {
    // Hardcode the production backend URL
    'import.meta.env.VITE_BACKEND_URL': JSON.stringify('http://localhost:3001'),
    'import.meta.env.MODE': JSON.stringify('production'),
    'process.env.NODE_ENV': JSON.stringify('production'),
    
  },
  base: '/',
  plugins: [
    react()
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      // Remove react and other core dependencies from external
      external: []
    },
    commonjsOptions: {
      include: /node_modules/,
      // Add this to handle ESM modules correctly
      esmExternals: true
    },
    // Ensure proper module resolution
    target: 'esnext',
    minify: 'terser',
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'axios', 'socket.io-client'],
  },
  server: {
    port: 5173,
    open: true
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.jsx?$/,
    exclude: [],
  },
})