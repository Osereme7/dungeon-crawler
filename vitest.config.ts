import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/main.ts', 'src/config.ts', 'src/scenes/**'],
      thresholds: {
        'src/systems/**': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        'src/utils/**': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        'src/dungeon/**': {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
      },
    },
    deps: {
      optimizer: {
        web: {
          include: ['vitest-canvas-mock'],
        },
      },
    },
    isolate: false,
  },
});
