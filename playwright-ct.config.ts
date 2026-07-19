import { defineConfig } from '@playwright/experimental-ct-react';
import react from '@vitejs/plugin-react';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/module-11-*/exercise.spec.tsx',
  use: {
    ctPort: 3100,
    ctViteConfig: {
      plugins: [react()],
    },
  },
});
