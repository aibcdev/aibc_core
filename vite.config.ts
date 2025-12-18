import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
  server: {
    port: 5174,
        host: '0.0.0.0',
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
        }
      }
    };
});
