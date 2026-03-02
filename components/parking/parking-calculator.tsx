'use client'

import { useEffect, useState } from 'react'

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

  // 마운트 전 로딩 상태
  if (now === null) {
    return (
      <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-6 shadow-sm">
        <span className="text-sm text-muted-foreground">로딩 중...</span>
      </div>
    )
  }

  // 경과 시간 기반으로 요금 계산 결과 및 타이밍 옵션 산출
  const elapsedMs = now - session.entryTime.getTime()
  const feeResult = calculateFeeResult(elapsedMs, session.feeStructure)
  const timingOptions = calculateTimingOptions(elapsedMs, session.feeStructure)

  // 예산 소진까지 남은 시간 계산 (null = 최대요금 도달로 무제한, undefined = 예산 미설정)
  const budgetTotalMs =
    session.budget !== undefined && session.budget > 0
      ? estimateTimeToBudget(session.feeStructure, session.budget)
      : undefined
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
        <h2 className="text-sm font-medium text-muted-foreground">출차 타이밍 비교</h2>
        <TimingCards options={timingOptions} />
      </div>
    </>
  )
}
