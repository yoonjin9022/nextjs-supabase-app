'use client'

import { useEffect, useMemo, useState } from 'react'

import type { ParkingSessionData } from '@/lib/types/parking.types'
import {
  calculateFeeResult,
  calculateTimingOptions,
  estimateTimeToBudget,
} from '@/lib/utils/parking-fee'

import { BudgetBar } from './budget-bar'
import { FeeCounter } from './fee-counter'
import { TimingCards } from './timing-cards'

interface ParkingCalculatorProps {
  session: ParkingSessionData
}

// 실시간 타이머를 통해 계산 결과를 갱신하는 통합 컴포넌트
export function ParkingCalculator({ session }: ParkingCalculatorProps) {
  // 서버/클라이언트 하이드레이션 불일치 방지를 위해 null 초기값 사용
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    // 클라이언트 마운트 후 1초 간격으로 현재 시각 갱신
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  // 모든 useMemo는 조건부 return 이전에 위치해야 함 (Hooks 규칙)
  // now가 null이면 0 사용, 실제 렌더링은 now !== null 이후에만 활용
  const elapsedMs = now !== null ? now - session.entryTime.getTime() : 0

  // 요금 계산 결과: 매초 elapsedMs가 바뀌므로 매번 재계산
  const feeResult = useMemo(
    () => calculateFeeResult(elapsedMs, session.feeStructure),
    [elapsedMs, session.feeStructure]
  )

  // 타이밍 옵션: feeResult.fee가 바뀔 때만 재계산 (경계 사이에서는 동일한 요금 결과)
  const timingOptions = useMemo(
    () => calculateTimingOptions(elapsedMs, session.feeStructure),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [feeResult.fee, session.feeStructure]
  )

  // 예산 소진 예상 시간: budget과 feeStructure는 세션 중 변경되지 않으므로 메모이제이션
  const budgetTotalMs = useMemo(
    () =>
      session.budget !== undefined && session.budget > 0
        ? estimateTimeToBudget(session.feeStructure, session.budget)
        : undefined,
    [session.budget, session.feeStructure]
  )

  // 마운트 전 로딩 상태 (hooks 이후에 조건부 return)
  if (now === null) {
    return (
      <div className="bg-card flex flex-col items-center gap-4 rounded-xl border p-6 shadow-sm">
        <span className="text-muted-foreground text-sm">로딩 중...</span>
      </div>
    )
  }

  // 예산 소진까지 남은 시간 (null = 최대요금 도달로 무제한, undefined = 예산 미설정)
  const budgetRemainingMs =
    budgetTotalMs !== undefined
      ? budgetTotalMs !== null
        ? budgetTotalMs - elapsedMs
        : null
      : undefined

  return (
    <>
      {/* 실시간 요금 카운터 */}
      <FeeCounter result={feeResult} />

      {/* 예산 설정 시에만 예산 바 표시 */}
      {session.budget !== undefined && session.budget > 0 && (
        <BudgetBar
          currentFee={feeResult.fee}
          budget={session.budget}
          budgetRemainingMs={budgetRemainingMs}
        />
      )}

      {/* 출차 타이밍 비교 카드 */}
      <div className="flex flex-col gap-2">
        <h2 className="text-muted-foreground text-sm font-medium">출차 타이밍 비교</h2>
        <TimingCards options={timingOptions} />
      </div>
    </>
  )
}
