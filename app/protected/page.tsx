import { Car, ChevronRight, History, Plus } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { MonthlyStats } from '@/components/parking/monthly-stats'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getActiveSession, getSessionsByMonth } from '@/lib/services/parking-session.service'
import { getProfile } from '@/lib/services/profile.service'
import { createClient } from '@/lib/supabase/server'

function formatTimeAgo(date: Date): string {
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000)
  if (diffMin < 60) return `${diffMin}분 전 진입`
  const hours = Math.floor(diffMin / 60)
  const mins = diffMin % 60
  return `${hours}시간 ${mins}분 전 진입`
}

export default async function ProtectedPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getClaims()

  if (error || !data?.claims) {
    redirect('/auth/login')
  }

  const userId = data.claims.sub as string

  // 진행 중인 세션, 이번 달 통계, 프로필 조회
  const now = new Date()
  const [{ data: activeSession }, { data: sessions }, { data: profile }] = await Promise.all([
    getActiveSession(userId),
    getSessionsByMonth(userId, now.getFullYear(), now.getMonth() + 1),
    getProfile(userId),
  ])

  // 닉네임 우선, 없으면 이메일 앞부분
  const email = data.claims.email as string | undefined
  const displayName = profile?.nickname ?? (email ? email.split('@')[0] : '사용자')

  const sessionList = sessions ?? []
  const totalFee = sessionList.reduce((sum, sess) => sum + (sess.total_fee ?? 0), 0)
  const sessionCount = sessionList.length
  const averageFee = sessionCount > 0 ? Math.round(totalFee / sessionCount) : 0

  return (
    <div className="flex w-full flex-col gap-6">
      {/* 환영 헤더 */}
      <div>
        <h1 className="text-xl font-bold">안녕하세요, {displayName}님</h1>
        <p className="text-muted-foreground text-sm">오늘의 주차 현황입니다</p>
      </div>

      {/* 진행 중인 세션 */}
      {activeSession ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-muted-foreground text-sm font-medium">진행 중인 세션</h2>
            <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">진행 중</Badge>
          </div>
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="flex flex-col gap-3 p-4">
              <div className="flex items-start justify-between">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5">
                    <Car className="text-primary h-4 w-4" strokeWidth={2} />
                    <span className="font-semibold">
                      {activeSession.parking_lot_name ?? '이름 없는 주차장'}
                    </span>
                  </div>
                  <span className="text-muted-foreground text-xs">
                    {formatTimeAgo(new Date(activeSession.entered_at))}
                  </span>
                </div>
              </div>
              <Button asChild className="h-11 w-full gap-2">
                <Link href={`/protected/parking/session/${activeSession.id}`}>
                  계산기로 이동
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-8">
          <Car className="text-muted-foreground/50 h-10 w-10" strokeWidth={1.5} />
          <p className="text-muted-foreground text-center text-sm">
            현재 진행 중인 주차 세션이 없습니다
          </p>
          <Button asChild className="h-11 gap-2 px-8">
            <Link href="/protected/parking/session/new">
              <Plus className="h-4 w-4" />
              주차 시작
            </Link>
          </Button>
        </div>
      )}

      {/* 이번 달 요약 */}
      <div className="flex flex-col gap-3">
        <h2 className="text-muted-foreground text-sm font-medium">이번 달 주차비 요약</h2>
        <MonthlyStats totalFee={totalFee} sessionCount={sessionCount} averageFee={averageFee} />
      </div>

      {/* 빠른 액션 */}
      <div className="grid grid-cols-2 gap-3">
        <Button asChild variant="outline" className="h-11 gap-2">
          <Link href="/protected/parking/session/new">
            <Plus className="h-4 w-4" />새 주차 시작
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-11 gap-2">
          <Link href="/protected/parking/history">
            <History className="h-4 w-4" />
            기록 보기
          </Link>
        </Button>
      </div>
    </div>
  )
}
