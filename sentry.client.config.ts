import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // 성능 트레이싱: 100% 샘플링 (프로덕션에서는 낮추는 것을 권장)
  tracesSampleRate: 1.0,

  // 세션 리플레이: 에러 발생 시 100%, 일반 세션 10% 수집
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  // 프로덕션에서 디버그 로그 비활성화
  debug: false,
})
