import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: '/',
    build: {
      outDir: '../dist',
    },
    envDir: '../',
    plugins: [react()],
    publicDir: '../public',
    resolve: {
      alias: {
        '~': path.resolve(__dirname, 'src'),
      },
    },
    root: './src',
    server: {
      port: +(env.PORT || 3000),
      proxy: {
        // Forward all requests starting with /api to the Express backend on port 3000
        '/api': {
          target: env.SERVER_TARGET_URL || `http://localhost:${env.SERVER_TARGET_PORT || 5000}`, // Replace with your Express server URL
          changeOrigin: true,
          secure: mode !== 'development', // Set to `true` if your backend uses HTTPS
        },
      },
    },
  };
});
