'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ParkingError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[주차 앱 오류]', error)
  }, [error])

  return (
    <div className="flex w-full flex-col items-center gap-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-lg font-semibold">문제가 발생했습니다</h2>
        <p className="text-sm text-muted-foreground">
          페이지를 불러오는 중 오류가 발생했습니다.
          <br />
          잠시 후 다시 시도해주세요.
        </p>
        {process.env.NODE_ENV === 'development' && error.message && (
          <p className="mt-1 rounded bg-muted px-3 py-1.5 font-mono text-xs text-muted-foreground">
            {error.message}
          </p>
        )}
      </div>
      <Button onClick={reset} className="h-11 px-8">
        다시 시도
      </Button>
    </div>
  )
}
