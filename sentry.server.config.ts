import * as Sentry from '@sentry/nextjs'

Sentry.init({
  // 서버 전용 DSN 우선, 없으면 공개 DSN 사용
  dsn: process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 성능 트레이싱: 100% 샘플링 (프로덕션에서는 낮추는 것을 권장)
  tracesSampleRate: 1.0,

  // 프로덕션에서 디버그 로그 비활성화
  debug: false,
})
