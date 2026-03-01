import { FlatCompat } from '@eslint/eslintrc'
import simpleImportSort from 'eslint-plugin-simple-import-sort'
import { dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const eslintConfig = [
  // 빌드 산출물 및 외부 패키지 제외
  {
    ignores: ['.next/**', 'node_modules/**', 'out/**', 'build/**'],
  },

  ...compat.extends('next/core-web-vitals', 'next/typescript'),

  // import/export 정렬 플러그인
  {
    plugins: {
      'simple-import-sort': simpleImportSort,
    },
    rules: {
      'simple-import-sort/imports': 'error',
      'simple-import-sort/exports': 'error',
    },
  },

  // 반드시 마지막: Prettier와 충돌하는 ESLint 규칙 비활성화
  ...compat.extends('prettier'),
]

export default eslintConfig
