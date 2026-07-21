import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
    sourcemap: false,
    chunkSizeWarningLimit: 1800,
  },
  server: {
    host: '127.0.0.1',
    port: 4173,
  },
});
