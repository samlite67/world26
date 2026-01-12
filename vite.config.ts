import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, process.cwd(), '');
    const isProd = mode === 'production';

    return {
      base: isProd ? '/world26/' : '/',
      envPrefix: 'VITE_',
      define: {
        'import.meta.env.VITE_PROXY_URL': JSON.stringify(
          isProd 
            ? 'https://mistralapicaller.yusufsamodin67.workers.dev/v1/chat/completions'
            : undefined
        )
      },
      server: {
        port: 3000,
        host: '0.0.0.0',
        proxy: {
          '/api': {
            target: 'http://localhost:3001',
            changeOrigin: true,
          }
        }
      },
      plugins: [react()],
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
