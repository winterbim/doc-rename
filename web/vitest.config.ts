import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./vitest.setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov', 'json-summary'],
      include: ['lib/bim/**/*.ts'],
      exclude: ['**/*.test.ts', '**/__tests__/**', '**/*.d.ts'],
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 80,
        branches: 75,
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname) },
  },
});
