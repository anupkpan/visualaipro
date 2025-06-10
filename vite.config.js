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
      outDir: 'dist' // 👈 Vercel expects this directory for deployment
    },
    base: '/' // 👈 Prevents broken links or 404s in deployed app
  };
});
