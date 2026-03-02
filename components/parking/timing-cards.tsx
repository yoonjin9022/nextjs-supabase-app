'use client'

import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { TimingOption } from '@/lib/types/parking.types'

interface TimingCardsProps {
  options: TimingOption[]
}

// TimingOption 배열을 받아 시점별 요금을 카드로 표시하는 순수 디스플레이 컴포넌트
export function TimingCards({ options }: TimingCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3">
      {options.map(({ label, offsetMinutes, fee, diff, isSame, isMaxReached }) => (
        <Card key={label} className="relative overflow-hidden">
          <CardContent className="flex flex-col items-center gap-2 p-4">
            {/* 시점 레이블 (지금 / +5분 / +10분 / +30분) */}
            <span className="text-sm font-medium text-muted-foreground">{label}</span>

            {/* 해당 시점 예상 요금 */}
            <span className="text-xl font-bold tabular-nums">{fee.toLocaleString()}원</span>

            {/* 상태 배지: 최대요금 / 현재와 동일(절약 가능) / 추가 요금 발생 */}
            {isMaxReached ? (
              <Badge variant="destructive" className="text-xs">
                최대요금
              </Badge>
            ) : isSame ? (
              <Badge variant="secondary" className="text-xs">
                절약 가능 {offsetMinutes}분
              </Badge>
            ) : (
              <Badge variant="outline" className="text-xs text-orange-600">
                +{diff.toLocaleString()}원
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
