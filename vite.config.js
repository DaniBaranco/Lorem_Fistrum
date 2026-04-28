import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Lorem_Fistrum/',
  build: {
    outDir: 'docs',
  },
  plugins: [react()],
});
