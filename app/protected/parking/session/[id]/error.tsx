'use client'

import { useEffect } from 'react'

import { Button } from '@/components/ui/button'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ParkingSessionError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error('[계산기 오류]', error)
  }, [error])

  return (
    <div className="flex w-full flex-col items-center gap-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-lg font-semibold">계산기를 불러올 수 없습니다</h2>
        <p className="text-sm text-muted-foreground">
          주차 세션 정보를 가져오는 중 오류가 발생했습니다.
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
