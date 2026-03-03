import { Card, CardContent } from '@/components/ui/card'
import type { ParkingSession } from '@/lib/types/parking.types'
import { formatDuration } from '@/lib/utils/format'

// 날짜를 "M월 D일 (요일)" 형식으로 변환
function formatDate(dateStr: string): string {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}

interface SessionListProps {
  sessions: ParkingSession[]
}

export function SessionList({ sessions }: SessionListProps) {
  // 빈 배열인 경우 빈 상태 UI 표시
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-muted-foreground">이 달의 주차 기록이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => {
        // entered_at ~ exited_at 경과 시간(ms) 계산
        const elapsedMs = session.exited_at
          ? new Date(session.exited_at).getTime() - new Date(session.entered_at).getTime()
          : 0

        return (
          <Card key={session.id}>
            <CardContent className="flex items-center justify-between p-4">
              <div className="flex flex-col gap-0.5">
                <span className="font-medium">
                  {session.parking_lot_name ?? '이름 없는 주차장'}
                </span>
                <span className="text-muted-foreground text-xs">
                  {formatDate(session.entered_at)}
                </span>
                <span className="text-muted-foreground text-sm">{formatDuration(elapsedMs)}</span>
              </div>
              <span className="text-lg font-semibold tabular-nums">
                {(session.total_fee ?? 0).toLocaleString()}원
              </span>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
