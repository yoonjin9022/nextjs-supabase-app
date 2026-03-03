import * as Sentry from '@sentry/nextjs'

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('./sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('./sentry.edge.config')
  }
}

// App Router에서 서버 사이드 에러를 Sentry로 캡처하는 핸들러
export const onRequestError = Sentry.captureRequestError
