import { Card, CardContent } from '@/components/ui/card'

// 목업 세션 데이터
const MOCK_SESSIONS = [
  {
    id: 'session-1',
    parkingLotName: '강남구 공영주차장',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2일 전
    durationMinutes: 75,
    fee: 3500,
  },
  {
    id: 'session-2',
    parkingLotName: '역삼역 주차장',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5일 전
    durationMinutes: 120,
    fee: 5500,
  },
  {
    id: 'session-3',
    parkingLotName: '강남구 공영주차장',
    date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8일 전
    durationMinutes: 45,
    fee: 2000,
  },
]

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' })
}

interface SessionListProps {
  sessions?: typeof MOCK_SESSIONS
}

export function SessionList({ sessions = MOCK_SESSIONS }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-muted-foreground">이 달의 주차 기록이 없습니다</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {sessions.map((session) => (
        <Card key={session.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex flex-col gap-0.5">
              <span className="font-medium">{session.parkingLotName}</span>
              <span className="text-xs text-muted-foreground">{formatDate(session.date)}</span>
              <span className="text-sm text-muted-foreground">
                {formatDuration(session.durationMinutes)}
              </span>
            </div>
            <span className="text-lg font-semibold tabular-nums">
              {session.fee.toLocaleString()}원
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
