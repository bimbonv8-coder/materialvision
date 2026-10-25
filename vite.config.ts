import { defineConfig } from 'vite';

// Serves the Expo web export (dist/) so Bolt's Vite-based preview can render the app.
// The Expo build itself is produced by `expo export --platform web` (see predev script).
export default defineConfig({
  root: 'dist',
  server: {
    host: true,
    port: 3000,
  },
  preview: {
    host: true,
    port: 3000,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: false,
  },
});
