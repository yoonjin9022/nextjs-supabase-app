import { redirect } from 'next/navigation'

import { endParkingSession } from '@/app/protected/parking/actions'
import { EndSessionButton } from '@/components/parking/end-session-button'
import { ParkingCalculator } from '@/components/parking/parking-calculator'
import { getSession } from '@/lib/services/parking-session.service'
import { createClient } from '@/lib/supabase/server'
import type { ParkingSessionData } from '@/lib/types/parking.types'

export default async function ParkingSessionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect('/auth/login')
  }

  // DB에서 세션 조회
  const { data: dbSession, error } = await getSession(id, userId)

  // 세션을 찾을 수 없거나 오류 발생 시 허브로 redirect
  if (error || !dbSession) {
    redirect('/protected/parking')
  }

  // 이미 종료된 세션이면 결과 페이지로 redirect
  if (dbSession.exited_at !== null) {
    redirect(`/protected/parking/session/${id}/result`)
  }

  // DB 세션을 ParkingCalculator가 사용하는 ParkingSessionData 타입으로 변환
  const session: ParkingSessionData = {
    id: dbSession.id,
    entryTime: new Date(dbSession.entered_at),
    feeStructure: {
      baseDuration: dbSession.base_duration,
      baseFee: dbSession.base_fee,
      unitDuration: dbSession.unit_duration,
      unitFee: dbSession.unit_fee,
      ...(dbSession.max_daily_fee !== null && { maxDailyFee: dbSession.max_daily_fee }),
    },
    ...(dbSession.budget !== null && { budget: dbSession.budget }),
    ...(dbSession.parking_lot_name !== null && { parkingLotName: dbSession.parking_lot_name }),
  }

  // 서버 액션 바인딩 (sessionId를 클로저로 캡처)
  const handleEndSession = endParkingSession.bind(null, id)

  return (
    <div className="flex w-full flex-col gap-4 pb-8">
      {/* 헤더: 주차장 이름 및 출차 버튼 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">주차 계산기</h1>
          {session.parkingLotName && (
            <p className="text-muted-foreground text-sm">{session.parkingLotName}</p>
          )}
        </div>
        <EndSessionButton onEndSession={handleEndSession} variant="outline" className="h-11">
          출차하기
        </EndSessionButton>
      </div>

      {/* 실시간 요금 계산기 (타이머/계산 로직 포함 클라이언트 컴포넌트) */}
      <ParkingCalculator session={session} />

      {/* 하단 출차 버튼 */}
      <EndSessionButton
        onEndSession={handleEndSession}
        className="mt-2 h-12 w-full text-base font-semibold"
      >
        지금 출차하기
      </EndSessionButton>
    </div>
  )
}
