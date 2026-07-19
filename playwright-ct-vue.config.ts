import { defineConfig } from '@playwright/experimental-ct-vue';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/module-11-*/exercise.vue.spec.tsx',
  use: {
    ctPort: 3101,
    ctViteConfig: {
      plugins: [vue()],
    },
  },
});
