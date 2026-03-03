import { Card, CardContent } from '@/components/ui/card'

interface MonthlyStatsProps {
  totalFee: number
  sessionCount: number
  averageFee: number
}

export function MonthlyStats({ totalFee, sessionCount, averageFee }: MonthlyStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="flex flex-col items-center gap-1 p-4">
          <span className="text-muted-foreground text-xs">총 요금</span>
          <span className="text-lg font-bold tabular-nums">{totalFee.toLocaleString()}원</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center gap-1 p-4">
          <span className="text-muted-foreground text-xs">주차 횟수</span>
          <span className="text-lg font-bold tabular-nums">{sessionCount}회</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center gap-1 p-4">
          <span className="text-muted-foreground text-xs">평균 요금</span>
          <span className="text-lg font-bold tabular-nums">{averageFee.toLocaleString()}원</span>
        </CardContent>
      </Card>
    </div>
  )
}
