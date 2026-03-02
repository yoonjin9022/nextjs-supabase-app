'use client'

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

export function BudgetBar({ currentFee, budget, budgetRemainingMs }: BudgetBarProps) {
  const ratio = budget > 0 ? currentFee / budget : 0
  const percent = Math.min(ratio * 100, 100)

  // 소진율에 따른 색상
  const colorClass =
    ratio >= 1 ? 'text-red-500' : ratio >= 0.8 ? 'text-yellow-500' : 'text-green-500'

  // Progress indicator 색상 (CSS 변수 오버라이드)
  const progressIndicatorClass =
    ratio >= 1
      ? '[&>div]:bg-red-500'
      : ratio >= 0.8
        ? '[&>div]:bg-yellow-500'
        : '[&>div]:bg-green-500'

  return (
    <div className="flex flex-col gap-2 rounded-xl border bg-card p-4 shadow-sm">
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
            <div className="text-xs text-muted-foreground">
              약 {formatRemainingTime(budgetRemainingMs)} 후 소진 예정
            </div>
          ) : (
            <div className="text-xs font-medium text-red-500">예산 소진</div>
          ))}
      </div>
    </div>
  )
}
