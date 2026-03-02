import { Card, CardContent } from '@/components/ui/card'

// 목업 통계 데이터
const MOCK_STATS = {
  totalFee: 15000,
  sessionCount: 5,
  averageFee: 3000,
}

interface MonthlyStatsProps {
  totalFee?: number
  sessionCount?: number
  averageFee?: number
}

export function MonthlyStats({
  totalFee = MOCK_STATS.totalFee,
  sessionCount = MOCK_STATS.sessionCount,
  averageFee = MOCK_STATS.averageFee,
}: MonthlyStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="flex flex-col items-center gap-1 p-4">
          <span className="text-xs text-muted-foreground">총 요금</span>
          <span className="text-lg font-bold tabular-nums">{totalFee.toLocaleString()}원</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center gap-1 p-4">
          <span className="text-xs text-muted-foreground">주차 횟수</span>
          <span className="text-lg font-bold tabular-nums">{sessionCount}회</span>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex flex-col items-center gap-1 p-4">
          <span className="text-xs text-muted-foreground">평균 요금</span>
          <span className="text-lg font-bold tabular-nums">{averageFee.toLocaleString()}원</span>
        </CardContent>
      </Card>
    </div>
  )
}
