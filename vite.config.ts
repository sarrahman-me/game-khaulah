import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.AI_API_KEY;
  const apiUrl = env.AI_API_URL || 'http://localhost:20128/v1';

  return {
    plugins: [react()],
    server: {
      port: 3000,
      host: true,
      proxy: {
        '/ai-proxy': {
          target: apiUrl,
          changeOrigin: true,
          configure: (proxy) => {
            proxy.on('proxyReq', (request) => {
              if (apiKey) request.setHeader('Authorization', `Bearer ${apiKey}`);
            });
          },
          rewrite: (path) => path.replace(/^\/ai-proxy/, ''),
        },
      },
    },
  };
});

