import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
  server: {
    port: 5174,
    host: '0.0.0.0',
    strictPort: false,
    open: false,
  },
      plugins: [react()],
      // REMOVED: API keys should NEVER be in frontend code - they must only be used on the backend
      // The frontend should make requests to the backend API, which uses the key server-side
      define: {
        // Only safe, non-sensitive env vars should be here
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
          '@solana-program/system': path.resolve(__dirname, 'src/stubs/solana-system.js'),
        }
      },
      optimizeDeps: {
        include: ['@privy-io/react-auth', '@solana/web3.js'],
      },
      build: {
        commonjsOptions: {
          include: [/node_modules/],
          transformMixedEsModules: true
        },
        // Optimize chunk splitting
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunks
              'react-vendor': ['react', 'react-dom'],
              'router-vendor': ['react-router', 'react-router-dom'],
              // Large libraries
              'ui-vendor': ['lucide-react'],
              // Keep utilities together
              'utils': ['./services/apiClient', './services/supabaseClient'],
            },
            // Optimize chunk size
            chunkFileNames: 'assets/js/[name]-[hash].js',
            entryFileNames: 'assets/js/[name]-[hash].js',
            assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
          },
        },
        // Enable minification
        minify: 'terser',
        terserOptions: {
          compress: {
            drop_console: true, // Remove console.log in production
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug'],
          },
        },
        // Source maps for production debugging (optional)
        sourcemap: false,
        // Target modern browsers for smaller bundles
        target: 'es2015',
        // Chunk size warnings
        chunkSizeWarningLimit: 1000,
      },
      // Optimize dependencies
      optimizeDeps: {
        include: ['@privy-io/react-auth', '@solana/web3.js'],
        exclude: ['@solana/web3.js'], // Exclude if causing issues
      },
    };
});
