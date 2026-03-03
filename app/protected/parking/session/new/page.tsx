import { redirect } from 'next/navigation'

import { startParkingSession } from '@/app/protected/parking/actions'
import { NewSessionTabs } from '@/components/parking/new-session-tabs'
import { getParkingLots } from '@/lib/services/parking-lot.service'
import { getActiveSession } from '@/lib/services/parking-session.service'
import { createClient } from '@/lib/supabase/server'

// 세션 시작 페이지 (Server Component)
// 이미 진행 중인 세션이 있으면 해당 세션 페이지로 redirect합니다.
export default async function NewParkingSessionPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect('/auth/login')
  }

  // 이미 진행 중인 세션이 있으면 해당 세션으로 redirect
  const { data: activeSession } = await getActiveSession(userId)
  if (activeSession) {
    redirect(`/protected/parking/session/${activeSession.id}`)
  }

  // 즐겨찾기 목록 조회 (실패 시 빈 배열로 처리)
  const { data: favorites } = await getParkingLots(userId)

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">주차 시작</h1>
        <p className="text-muted-foreground text-sm">요금 체계를 입력하면 계산기가 시작됩니다</p>
      </div>

      {/* 즐겨찾기 탭 상태를 관리하는 Client Component에 서버 액션과 즐겨찾기 목록을 prop으로 전달 */}
      <NewSessionTabs formAction={startParkingSession} favorites={favorites ?? []} />
    </div>
  )
}
