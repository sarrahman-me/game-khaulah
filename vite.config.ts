import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.AI_API_KEY || env.VITE_AI_API_KEY || 'sk-4cab929cfbc506c0-qcqx76-caf94a9c';
  const apiUrl = env.AI_API_URL || env.VITE_AI_API_URL || 'http://localhost:20128/v1';

  return {
    plugins: [react()],
    define: {
      'import.meta.env.VITE_AI_API_KEY': JSON.stringify(apiKey),
      'import.meta.env.VITE_AI_API_URL': JSON.stringify(apiUrl),
    },
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

