import bundleAnalyzer from '@next/bundle-analyzer'
import { withSentryConfig } from '@sentry/nextjs'
import type { NextConfig } from 'next'

// ANALYZE=true npm run build 실행 시 .next/analyze 폴더에 번들 리포트 생성
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

const nextConfig: NextConfig = {}

// withSentryConfig로 최외각 래핑, 내부에 withBundleAnalyzer 유지
export default withSentryConfig(withBundleAnalyzer(nextConfig), {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // CI 환경에서만 업로드 로그 출력
  silent: !process.env.CI,

  // 더 넓은 범위의 소스 파일 업로드로 스택트레이스 정확도 향상
  widenClientFileUpload: true,

  // 소스맵 업로드 후 자동 삭제 (클라이언트 번들에 소스맵 노출 방지)
  sourcemaps: {
    deleteSourcemapsAfterUpload: true,
  },

  webpack: {
    // 프로덕션 번들에서 Sentry 로거 제거 (번들 크기 감소)
    treeshake: {
      removeDebugLogging: true,
    },

    // Vercel Cron Monitor 자동 연동
    automaticVercelMonitors: true,
  },
})
