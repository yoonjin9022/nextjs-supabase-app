import Link from 'next/link'
import { redirect } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getActiveSession, getSessionsByMonth } from '@/lib/services/parking-session.service'
import { createClient } from '@/lib/supabase/server'
import { formatDuration } from '@/lib/utils/format'
import { calculateFee } from '@/lib/utils/parking-fee'

function formatTimeAgo(date: Date): string {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMin < 60) return `${diffMin}분 전 진입`
  return `${Math.floor(diffMin / 60)}시간 ${diffMin % 60}분 전 진입`
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

export default async function ParkingHubPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect('/auth/login')
  }

  // 진행 중인 세션 + 이번 달 세션 목록 병렬 조회 (순차 실행 대비 레이턴시 절감)
  const now = new Date()
  const [{ data: activeSession }, { data: monthlySessions }] = await Promise.all([
    getActiveSession(userId),
    getSessionsByMonth(userId, now.getFullYear(), now.getMonth() + 1),
  ])
  const recentSessions = (monthlySessions ?? []).slice(0, 3)

  // 진행 중 세션의 현재 요금 계산 (실시간 타이머 없이 현재 시각 기준으로 계산)
  const activeCurrentFee = activeSession
    ? calculateFee(Date.now() - new Date(activeSession.entered_at).getTime(), {
        baseDuration: activeSession.base_duration,
        baseFee: activeSession.base_fee,
        unitDuration: activeSession.unit_duration,
        unitFee: activeSession.unit_fee,
        ...(activeSession.max_daily_fee !== null && {
          maxDailyFee: activeSession.max_daily_fee,
        }),
      })
    : null

  return (
    <div className="flex w-full flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold">주차 미터</h1>
        <p className="text-muted-foreground text-sm">주차 요금을 실시간으로 추적하세요</p>
      </div>

      {/* 메인 액션 영역 */}
      {activeSession ? (
        <div className="flex flex-col gap-3">
          <h2 className="text-muted-foreground text-sm font-medium">진행 중인 세션</h2>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <span className="font-semibold">
                    {activeSession.parking_lot_name ?? '이름 없는 주차장'}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    {formatTimeAgo(new Date(activeSession.entered_at))}
                  </span>
                </div>
                <span className="text-primary text-xl font-bold tabular-nums">
                  {(activeCurrentFee ?? 0).toLocaleString()}원
                </span>
              </div>
              <Link href={`/protected/parking/session/${activeSession.id}`}>
                <Button className="h-11 w-full">계산기로 이동</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-8">
          <p className="text-muted-foreground text-center text-sm">
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
          <h2 className="text-muted-foreground text-sm font-medium">최근 기록</h2>
          <Link href="/protected/parking/history" className="text-primary text-xs hover:underline">
            전체 보기
          </Link>
        </div>

        {recentSessions.length === 0 ? (
          <p className="text-muted-foreground py-4 text-center text-sm">이번 달 기록이 없습니다</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recentSessions.map((session) => {
              const elapsedMs = session.exited_at
                ? new Date(session.exited_at).getTime() - new Date(session.entered_at).getTime()
                : 0
              return (
                <div
                  key={session.id}
                  className="flex items-center justify-between rounded-lg border px-4 py-3"
                >
                  <div className="flex flex-col gap-0.5">
                    <span className="text-sm font-medium">
                      {session.parking_lot_name ?? '이름 없는 주차장'}
                    </span>
                    <span className="text-muted-foreground text-xs">
                      {formatDate(session.entered_at)} · {formatDuration(elapsedMs)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {(session.total_fee ?? 0).toLocaleString()}원
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
