import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// 목업: 진행 중인 세션 여부 (true = 진행 중 세션 있음 상태로 표시)
const MOCK_HAS_ACTIVE_SESSION = true

const MOCK_ACTIVE_SESSION = {
  id: 'mock-session-1',
  parkingLotName: '강남구 공영주차장',
  entryTime: new Date(Date.now() - 45 * 60 * 1000), // 45분 전
  currentFee: 2500,
}

const MOCK_RECENT_SESSIONS = [
  {
    id: 'session-1',
    parkingLotName: '강남구 공영주차장',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    durationMinutes: 75,
    fee: 3500,
  },
  {
    id: 'session-2',
    parkingLotName: '역삼역 주차장',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    durationMinutes: 120,
    fee: 5500,
  },
]

function formatTimeAgo(date: Date): string {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMin < 60) return `${diffMin}분 전 진입`
  return `${Math.floor(diffMin / 60)}시간 ${diffMin % 60}분 전 진입`
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}분`
  if (m === 0) return `${h}시간`
  return `${h}시간 ${m}분`
}

export default function ParkingHubPage() {
  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">주차 미터</h1>
        <p className="text-sm text-muted-foreground">주차 요금을 실시간으로 추적하세요</p>
      </div>

      {/* 메인 액션 영역 */}
      {MOCK_HAS_ACTIVE_SESSION ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-medium text-muted-foreground">진행 중인 세션</h2>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">{MOCK_ACTIVE_SESSION.parkingLotName}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatTimeAgo(MOCK_ACTIVE_SESSION.entryTime)}
                  </span>
                </div>
                <span className="text-xl font-bold tabular-nums text-primary">
                  {MOCK_ACTIVE_SESSION.currentFee.toLocaleString()}원
                </span>
              </div>
              <Link href={`/protected/parking/session/${MOCK_ACTIVE_SESSION.id}`}>
                <Button className="h-11 w-full">계산기로 이동</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-8">
          <p className="text-center text-sm text-muted-foreground">
            현재 진행 중인 주차 세션이 없습니다
          </p>
          <Link href="/protected/parking/session/new">
            <Button className="h-11 px-8">주차 시작</Button>
          </Link>
        </div>
      )}

      {/* 빠른 메뉴 */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/protected/parking/session/new">
          <Button variant="outline" className="h-11 w-full">
            새 주차 시작
          </Button>
        </Link>
        <Link href="/protected/parking/favorites">
          <Button variant="outline" className="h-11 w-full">
            즐겨찾기
          </Button>
        </Link>
      </div>

      {/* 최근 기록 미리보기 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium text-muted-foreground">최근 기록</h2>
          <Link href="/protected/parking/history" className="text-xs text-primary hover:underline">
            전체 보기
          </Link>
        </div>
        <div className="flex flex-col gap-2">
          {MOCK_RECENT_SESSIONS.map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between rounded-lg border px-4 py-3"
            >
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium">{session.parkingLotName}</span>
                <span className="text-xs text-muted-foreground">
                  {formatDate(session.date)} · {formatDuration(session.durationMinutes)}
                </span>
              </div>
              <span className="text-sm font-semibold tabular-nums">
                {session.fee.toLocaleString()}원
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
