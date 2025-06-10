import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  return {
    plugins: [react()],
    define: {
      'process.env.OPENAI_API_KEY': JSON.stringify(env.OPENAI_API_KEY)
    },
    build: {
      outDir: 'dist'       // <- ensure Vercel finds your build
    },
    base: '/'              // <- ensure links work on Vercel
  };
});
