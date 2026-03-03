'use client'

import { memo } from 'react'

import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface BudgetBarProps {
  currentFee: number
  budget: number
  // null: 최대요금 도달로 무제한, undefined: 계산 불가
  budgetRemainingMs?: number | null
}

// 남은 ms를 "X시간 Y분" 형태로 변환
function formatRemainingTime(ms: number): string {
  const totalMin = Math.ceil(ms / 60000)
  const h = Math.floor(totalMin / 60)
  const m = totalMin % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

// memo로 래핑: currentFee가 요금 경계에서만 변경되므로 경계 사이에서 리렌더링 스킵
export const BudgetBar = memo(function BudgetBar({
  currentFee,
  budget,
  budgetRemainingMs,
}: BudgetBarProps) {
  const ratio = budget > 0 ? currentFee / budget : 0
  const percent = Math.min(ratio * 100, 100)

  // 소진율에 따른 색상 (WCAG AA 4.5:1 기준 충족)
  const colorClass =
    ratio >= 1
      ? 'text-red-600 dark:text-red-400'
      : ratio >= 0.8
        ? 'text-yellow-700 dark:text-yellow-400'
        : 'text-green-700 dark:text-green-400'

  // Progress indicator 색상 (CSS 변수 오버라이드, WCAG AA 기준)
  const progressIndicatorClass =
    ratio >= 1
      ? '[&>div]:bg-red-600 dark:[&>div]:bg-red-400'
      : ratio >= 0.8
        ? '[&>div]:bg-yellow-700 dark:[&>div]:bg-yellow-400'
        : '[&>div]:bg-green-700 dark:[&>div]:bg-green-400'

  return (
    <div className="bg-card flex flex-col gap-2 rounded-xl border p-4 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">예산 소진율</span>
        <span className={cn('font-semibold tabular-nums', colorClass)}>
          {currentFee.toLocaleString()}원 / {budget.toLocaleString()}원
        </span>
      </div>

      <Progress value={percent} className={cn('h-3', progressIndicatorClass)} />

      <div className="flex items-center justify-between">
        <div className={cn('text-xs font-medium tabular-nums', colorClass)}>
          {percent.toFixed(1)}% 소진
        </div>

        {/* 예산 소진 예상 시간 */}
        {budgetRemainingMs !== undefined &&
          budgetRemainingMs !== null &&
          (budgetRemainingMs > 0 ? (
            <div className="text-muted-foreground text-xs">
              약 {formatRemainingTime(budgetRemainingMs)} 후 소진 예정
            </div>
          ) : (
            <div className="text-xs font-medium text-red-600 dark:text-red-400">예산 소진</div>
          ))}
      </div>
    </div>
  )
})
