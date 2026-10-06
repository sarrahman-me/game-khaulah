import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiKey = env.AI_API_KEY || 'sk-4cab929cfbc586c0-ftrki9-b93ed40e';
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
          rewrite: (path) => path.replace(/^\/ai-proxy/, ''),
        },
      },
    },
    define: {
      __AI_API_KEY__: JSON.stringify(apiKey),
      __AI_API_URL__: JSON.stringify(apiUrl),
    },
  };
});

