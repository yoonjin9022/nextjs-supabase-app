'use client'

import { useReportWebVitals } from 'next/web-vitals'

// Web Vitals 지표 수집 컴포넌트
// - 개발 환경: 콘솔에 출력
// - 프로덕션: Vercel Analytics가 <Analytics /> 컴포넌트를 통해 자동 수집
export function WebVitals() {
  useReportWebVitals((metric) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(metric)
    }
  })

  return null
}
