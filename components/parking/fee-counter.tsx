'use client'

import type { FeeResult } from '@/lib/types/parking.types'
import { formatCountdown, formatElapsed } from '@/lib/utils/parking-fee'

interface FeeCounterProps {
  result: FeeResult
}

// FeeResult를 받아 요금 정보를 표시하는 순수 디스플레이 컴포넌트
export function FeeCounter({ result }: FeeCounterProps) {
  const { fee, elapsedMs, msToNextIncrease, isMaxReached, currentSection } = result

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 shadow-sm">
      {/* 누적 요금 */}
      <div className="flex flex-col items-center gap-1">
        <span className="text-sm text-muted-foreground">현재 누적 요금</span>
        <span className="text-3xl font-bold tabular-nums text-foreground">
          {fee.toLocaleString()}원
        </span>
      </div>

      {/* 다음 요금 증가까지 카운트다운 */}
      <div className="flex flex-col items-center gap-1">
        {isMaxReached ? (
          <span className="rounded-full bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive">
            일 최대요금 도달
          </span>
        ) : (
          <>
            <span className="text-xs text-muted-foreground">다음 요금 증가까지</span>
            <span className="text-xl font-semibold tabular-nums text-primary">
              {formatCountdown(msToNextIncrease)}
            </span>
          </>
        )}
      </div>

      {/* 현재 요금 구간 안내 */}
      <div className="text-center text-xs text-muted-foreground">{currentSection}</div>

      {/* 총 경과시간 */}
      <div className="flex flex-col items-center gap-0.5">
        <span className="text-xs text-muted-foreground">총 경과시간</span>
        <span className="font-mono text-lg font-medium tabular-nums">
          {formatElapsed(elapsedMs)}
        </span>
      </div>
    </div>
  )
}
