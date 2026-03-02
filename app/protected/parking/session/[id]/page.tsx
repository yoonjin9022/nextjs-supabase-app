import Link from 'next/link'
import { z } from 'zod'

import { ParkingCalculator } from '@/components/parking/parking-calculator'
import { Button } from '@/components/ui/button'
import { MOCK_SESSION } from '@/lib/mocks/parking.mocks'
import type { ParkingSessionData } from '@/lib/types/parking.types'

// searchParams 입력값 검증 스키마
// unitDuration은 min(1)로 0 나누기를 방지합니다
const sessionParamsSchema = z.object({
  baseDuration: z.coerce.number().int().min(1),
  baseFee: z.coerce.number().min(0),
  unitDuration: z.coerce.number().int().min(1),
  unitFee: z.coerce.number().min(0),
  maxDailyFee: z.coerce.number().min(0).optional(),
  budget: z.coerce.number().min(0).optional(),
  entryAt: z.coerce.number().optional(),
  name: z.string().max(100).optional(),
})

export default async function ParkingSessionPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<Record<string, string>>
}) {
  const { id } = await params
  const sp = await searchParams

  // searchParams 파싱 및 검증 (실패 시 fallback 목업 세션 사용)
  const parsed = sp.baseDuration ? sessionParamsSchema.safeParse(sp) : null

  const session: ParkingSessionData =
    parsed?.success === true
      ? {
          id,
          entryTime: new Date(parsed.data.entryAt ?? Date.now() - 45 * 60 * 1000),
          feeStructure: {
            baseDuration: parsed.data.baseDuration,
            baseFee: parsed.data.baseFee,
            unitDuration: parsed.data.unitDuration,
            unitFee: parsed.data.unitFee,
            maxDailyFee: parsed.data.maxDailyFee,
          },
          budget: parsed.data.budget,
          parkingLotName: parsed.data.name,
        }
      : MOCK_SESSION

  return (
    <div className="flex w-full flex-col gap-4 pb-8">
      {/* 헤더: 주차장 이름 및 출차 버튼 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold">주차 계산기</h1>
          {session.parkingLotName && (
            <p className="text-sm text-muted-foreground">{session.parkingLotName}</p>
          )}
        </div>
        <Link href={`/protected/parking/session/${id}/result`}>
          <Button variant="outline" className="h-11">
            출차하기
          </Button>
        </Link>
      </div>

      {/* 실시간 요금 계산기 (타이머/계산 로직 포함 클라이언트 컴포넌트) */}
      <ParkingCalculator session={session} />

      {/* 하단 출차 버튼 */}
      <Link href={`/protected/parking/session/${id}/result`} className="mt-2">
        <Button className="h-12 w-full text-base font-semibold">지금 출차하기</Button>
      </Link>
    </div>
  )
}
