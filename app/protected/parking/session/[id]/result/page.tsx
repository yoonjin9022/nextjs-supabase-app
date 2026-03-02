import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 목업 결과 데이터
const MOCK_RESULT = {
  parkingLotName: '강남구 공영주차장',
  durationMinutes: 75, // 1시간 15분
  totalFee: 3500,
  budget: 5000,
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

export default function ParkingSessionResultPage() {
  const { parkingLotName, durationMinutes, totalFee, budget } = MOCK_RESULT
  const usagePercent = budget > 0 ? Math.round((totalFee / budget) * 100) : 0

  return (
    <div className="flex w-full flex-col gap-6 pb-8">
      {/* 헤더 */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">출차 완료</h1>
        {parkingLotName && <p className="text-sm text-muted-foreground">{parkingLotName}</p>}
      </div>

      {/* 결과 카드 */}
      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          {/* 주차 시간 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">주차 시간</span>
            <span className="text-lg font-semibold">{formatDuration(durationMinutes)}</span>
          </div>

          {/* 총 요금 */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">총 요금</span>
            <span className="text-2xl font-bold">{totalFee.toLocaleString()}원</span>
          </div>

          {/* 예산 대비 */}
          <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">예산 대비</span>
              <span className="font-medium">{usagePercent}% 사용</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">예산</span>
              <span>
                {totalFee.toLocaleString()}원 / {budget.toLocaleString()}원
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 즐겨찾기 저장 버튼 (UI만) */}
      <Button variant="outline" className="h-11 w-full" disabled>
        즐겨찾기 저장 (준비 중)
      </Button>

      {/* 하단 액션 버튼 */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/protected/parking">
          <Button variant="outline" className="h-11 w-full">
            홈으로
          </Button>
        </Link>
        <Link href="/protected/parking/history">
          <Button className="h-11 w-full">기록 보기</Button>
        </Link>
      </div>
    </div>
  )
}
