import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    root: './',
    include: ['**/*.spec.ts'],
    testTimeout: 30000, // ขยายเวลารันเทสเป็น 30 วินาที ป้องกัน NestJS warm-up ช้า
    hookTimeout: 30000, // ขยายเวลา beforeEach/afterEach ป้องกัน Hook timed out
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'src/generated/**', // ไม่นำโค้ดที่ Prisma Gen อัตโนมัติมาคิดเป็นตัวหาร Coverage
        '**/*.spec.ts',
        '**/*.interface.ts',
        '**/*.dto.ts',
        'src/main.ts',
      ],
    },
  },
});