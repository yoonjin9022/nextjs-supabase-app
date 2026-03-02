import path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
  resolve: {
    alias: {
      // tsconfig.json의 "@/*" 경로 별칭을 vitest에서도 사용할 수 있도록 설정
      '@': path.resolve(__dirname, '.'),
    },
  },
})
