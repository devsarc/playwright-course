import { defineConfig } from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';

export default defineConfig({
  testDir: './tests',
  testMatch: [
    '**/module-51-*/**/*.spec.tsx',
    '**/module-52-*/**/*.spec.tsx',
    '**/module-54-*/**/*.spec.tsx',
  ],
  use: {
    ctPort: 3100,
    ctViteConfig: {
      plugins: [react()],
    },
  },
});
