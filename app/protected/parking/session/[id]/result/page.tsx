import Link from 'next/link'
import { redirect } from 'next/navigation'

import { SaveFavoriteButton } from '@/components/parking/save-favorite-button'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { getSession } from '@/lib/services/parking-session.service'
import { createClient } from '@/lib/supabase/server'
import { formatDuration } from '@/lib/utils/format'

export default async function ParkingSessionResultPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect('/auth/login')
  }

  // DB에서 세션 조회
  const { data: session, error } = await getSession(id, userId)

  // 세션을 찾을 수 없거나 오류 발생 시 허브로 redirect
  if (error || !session) {
    redirect('/protected/parking')
  }

  // 아직 종료되지 않은 세션이면 계산기 페이지로 redirect
  if (session.exited_at === null || session.total_fee === null) {
    redirect(`/protected/parking/session/${id}`)
  }

  // 경과 시간 계산
  const elapsedMs = new Date(session.exited_at).getTime() - new Date(session.entered_at).getTime()

  const totalFee = session.total_fee
  const budget = session.budget
  const usagePercent = budget !== null && budget > 0 ? Math.round((totalFee / budget) * 100) : null

  return (
    <div className="flex w-full flex-col gap-6 pb-8">
      {/* 헤더 */}
      <div className="flex flex-col gap-1">
        <h1 className="text-xl font-bold">출차 완료</h1>
        {session.parking_lot_name && (
          <p className="text-muted-foreground text-sm">{session.parking_lot_name}</p>
        )}
      </div>

      {/* 결과 카드 */}
      <Card>
        <CardContent className="flex flex-col gap-6 p-6">
          {/* 주차 시간 */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">주차 시간</span>
            <span className="text-lg font-semibold">{formatDuration(elapsedMs)}</span>
          </div>

          {/* 총 요금 */}
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground text-sm">총 요금</span>
            <span className="text-2xl font-bold">{totalFee.toLocaleString()}원</span>
          </div>

          {/* 예산 대비 (예산이 설정된 경우에만 표시) */}
          {budget !== null && budget > 0 && (
            <div className="bg-muted/50 flex flex-col gap-2 rounded-lg p-4">
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
          )}
        </CardContent>
      </Card>

      {/* 즐겨찾기 저장 버튼 */}
      <SaveFavoriteButton sessionId={id} />

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
