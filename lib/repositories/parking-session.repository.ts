import { createClient } from '@/lib/supabase/server'
import type {
  CreateParkingSessionDbDto,
  ExitParkingSessionDto,
  ParkingSession,
} from '@/lib/types/parking.types'

// 사용자의 진행 중인 세션 조회 (exited_at IS NULL)
export async function findActiveByUserId(userId: string): Promise<ParkingSession | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parking_sessions')
    .select('*')
    .eq('user_id', userId)
    .is('exited_at', null)
    .order('entered_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    console.error('[ParkingSessionRepository] findActiveByUserId 오류:', error)
    return null
  }
  return data
}

// 특정 세션 단건 조회 (RLS로 userId 소유권 검증)
export async function findById(id: string, userId: string): Promise<ParkingSession | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parking_sessions')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('[ParkingSessionRepository] findById 오류:', error)
    return null
  }
  return data
}

// 사용자의 특정 월 세션 목록 조회 (종료된 세션만, entered_at DESC)
export async function findByUserIdAndMonth(
  userId: string,
  year: number,
  month: number
): Promise<ParkingSession[]> {
  // UTC 기준으로 월 범위 계산 (로컬 타임존 영향 방지)
  const startDate = new Date(Date.UTC(year, month - 1, 1)).toISOString()
  const endDate = new Date(Date.UTC(year, month, 1)).toISOString()

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parking_sessions')
    .select('*')
    .eq('user_id', userId)
    .not('exited_at', 'is', null) // 종료된 세션만
    .gte('entered_at', startDate)
    .lt('entered_at', endDate)
    .order('entered_at', { ascending: false })

  if (error) {
    console.error('[ParkingSessionRepository] findByUserIdAndMonth 오류:', error)
    return []
  }
  return data ?? []
}

// 새 세션 생성
export async function create(dto: CreateParkingSessionDbDto): Promise<ParkingSession | null> {
  const supabase = await createClient()
  const { data, error } = await supabase.from('parking_sessions').insert(dto).select().single()

  if (error) {
    console.error('[ParkingSessionRepository] create 오류:', error)
    return null
  }
  return data
}

// 출차 시간 및 최종 요금 업데이트
export async function updateExitedAt(
  id: string,
  userId: string,
  dto: ExitParkingSessionDto
): Promise<ParkingSession | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parking_sessions')
    .update(dto)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('[ParkingSessionRepository] updateExitedAt 오류:', error)
    return null
  }
  return data
}
