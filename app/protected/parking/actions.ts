'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'

import {
  createParkingLot,
  deleteParkingLot,
  updateParkingLot,
} from '@/lib/services/parking-lot.service'
import { endSession, getSession, startSession } from '@/lib/services/parking-session.service'
import { createClient } from '@/lib/supabase/server'

// 서버 사이드 입력값 검증 스키마 (클라이언트 Zod 검증과 독립적으로 적용)
const startSessionSchema = z.object({
  baseDuration: z.coerce.number().int().min(1),
  baseFee: z.coerce.number().min(0),
  unitDuration: z.coerce.number().int().min(1),
  unitFee: z.coerce.number().min(0),
  maxDailyFee: z.coerce.number().min(0).nullish(),
  budget: z.coerce.number().min(0).nullish(),
  parkingLotName: z.string().max(100).nullish(),
  enteredAt: z.coerce.number().optional(),
})

// 주차 세션 시작 서버 액션
// FormData에서 요금 체계 및 선택 항목을 파싱하여 DB에 세션을 생성하고
// 생성된 세션 페이지로 redirect합니다.
export async function startParkingSession(formData: FormData) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect('/auth/login')
  }

  // 서버 사이드 입력값 검증 (NaN, 음수, 비정상 값 차단)
  const validation = startSessionSchema.safeParse({
    baseDuration: formData.get('baseDuration'),
    baseFee: formData.get('baseFee'),
    unitDuration: formData.get('unitDuration'),
    unitFee: formData.get('unitFee'),
    maxDailyFee: formData.get('maxDailyFee') || undefined,
    budget: formData.get('budget') || undefined,
    parkingLotName: formData.get('parkingLotName') || undefined,
    enteredAt: formData.get('enteredAt') || undefined,
  })

  if (!validation.success) {
    redirect('/protected/parking/session/new?error=invalid_input')
  }

  const {
    baseDuration,
    baseFee,
    unitDuration,
    unitFee,
    maxDailyFee,
    budget,
    parkingLotName,
    enteredAt,
  } = validation.data

  // 입차 시간: FormData에 enteredAt이 있으면 사용, 없으면 현재 시각
  const enteredAtIso = enteredAt ? new Date(enteredAt).toISOString() : new Date().toISOString()

  const {
    data: session,
    error,
    activeSessionId,
  } = await startSession(userId, {
    user_id: userId,
    parking_lot_name: parkingLotName ?? null,
    base_duration: baseDuration,
    base_fee: baseFee,
    unit_duration: unitDuration,
    unit_fee: unitFee,
    max_daily_fee: maxDailyFee ?? null,
    budget: budget ?? null,
    entered_at: enteredAtIso,
  })

  // 이미 진행 중인 세션이 있는 경우 기존 세션으로 redirect
  if (activeSessionId) {
    redirect(`/protected/parking/session/${activeSessionId}`)
  }

  // 기타 에러는 주차 허브로 redirect
  if (error || !session) {
    redirect('/protected/parking?error=start_failed')
  }

  // 세션 생성 성공 시 실시간 계산기 페이지로 redirect
  redirect(`/protected/parking/session/${session.id}`)
}

// 주차 세션 종료 서버 액션
// 현재 시각으로 출차 시간을 기록하고 최종 요금을 계산하여 DB에 저장합니다.
export async function endParkingSession(sessionId: string) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect('/auth/login')
  }

  const exitedAt = new Date()
  const { data: session, error } = await endSession(sessionId, userId, exitedAt)

  if (error || !session) {
    // 종료 실패 시 에러 파라미터와 함께 계산기 페이지로 redirect
    redirect(`/protected/parking/session/${sessionId}?error=end_failed`)
  }

  // 종료 성공 시 결과 페이지로 redirect
  redirect(`/protected/parking/session/${sessionId}/result`)
}

// ─── 즐겨찾기(ParkingLot) CRUD 서버 액션 ───

// 즐겨찾기 생성/수정 공통 유효성 검증 스키마
const favoriteSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요.').max(100, '100자 이하로 입력해주세요.'),
  base_duration: z.coerce.number().int().min(1, '1분 이상이어야 합니다.'),
  base_fee: z.coerce.number().min(0, '0원 이상이어야 합니다.'),
  unit_duration: z.coerce.number().int().min(1, '1분 이상이어야 합니다.'),
  unit_fee: z.coerce.number().min(0, '0원 이상이어야 합니다.'),
  max_daily_fee: z.coerce.number().min(0).nullish(),
})

// 즐겨찾기 생성 서버 액션
export async function createFavoriteAction(
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect('/auth/login')
  }

  const raw = Object.fromEntries(formData)
  // max_daily_fee가 빈 문자열인 경우 null로 처리
  if (raw.max_daily_fee === '') {
    raw.max_daily_fee = null as unknown as string
  }

  const validation = favoriteSchema.safeParse(raw)
  if (!validation.success) {
    return { success: false, error: '입력값을 확인해주세요.' }
  }

  const { data, error } = await createParkingLot(userId, {
    name: validation.data.name,
    base_duration: validation.data.base_duration,
    base_fee: validation.data.base_fee,
    unit_duration: validation.data.unit_duration,
    unit_fee: validation.data.unit_fee,
    max_daily_fee: validation.data.max_daily_fee ?? null,
  })

  if (error || !data) {
    return { success: false, error: error ?? '즐겨찾기 생성에 실패했습니다.' }
  }

  revalidatePath('/protected/parking/favorites')
  return { success: true }
}

// 즐겨찾기 수정 서버 액션
export async function updateFavoriteAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect('/auth/login')
  }

  const raw = Object.fromEntries(formData)
  // max_daily_fee가 빈 문자열인 경우 null로 처리
  if (raw.max_daily_fee === '') {
    raw.max_daily_fee = null as unknown as string
  }

  const validation = favoriteSchema.safeParse(raw)
  if (!validation.success) {
    return { success: false, error: '입력값을 확인해주세요.' }
  }

  const { data, error } = await updateParkingLot(id, userId, {
    name: validation.data.name,
    base_duration: validation.data.base_duration,
    base_fee: validation.data.base_fee,
    unit_duration: validation.data.unit_duration,
    unit_fee: validation.data.unit_fee,
    max_daily_fee: validation.data.max_daily_fee ?? null,
  })

  if (error || !data) {
    return { success: false, error: error ?? '즐겨찾기 수정에 실패했습니다.' }
  }

  revalidatePath('/protected/parking/favorites')
  return { success: true }
}

// 즐겨찾기 삭제 서버 액션
export async function deleteFavoriteAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect('/auth/login')
  }

  const { data, error } = await deleteParkingLot(id, userId)

  if (error || !data) {
    return { success: false, error: error ?? '즐겨찾기 삭제에 실패했습니다.' }
  }

  revalidatePath('/protected/parking/favorites')
  return { success: true }
}

// 출차 결과에서 즐겨찾기 저장 서버 액션
// 세션의 요금 체계를 기반으로 새 즐겨찾기를 생성합니다.
export async function saveFavoriteFromSessionAction(
  sessionId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect('/auth/login')
  }

  // 세션 조회
  const { data: session, error: sessionError } = await getSession(sessionId, userId)
  if (sessionError || !session) {
    return { success: false, error: sessionError ?? '세션을 찾을 수 없습니다.' }
  }

  // 즐겨찾기 이름: 세션의 주차장 이름이 없으면 '새 즐겨찾기' 사용
  const name = session.parking_lot_name ?? '새 즐겨찾기'

  const { data, error } = await createParkingLot(userId, {
    name,
    base_duration: session.base_duration,
    base_fee: session.base_fee,
    unit_duration: session.unit_duration,
    unit_fee: session.unit_fee,
    max_daily_fee: session.max_daily_fee,
  })

  if (error || !data) {
    return { success: false, error: error ?? '즐겨찾기 저장에 실패했습니다.' }
  }

  revalidatePath('/protected/parking/favorites')
  return { success: true }
}
