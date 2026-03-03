import { createClient } from '@/lib/supabase/server'
import type {
  CreateParkingLotDto,
  ParkingLot,
  UpdateParkingLotDto,
} from '@/lib/types/parking.types'

// 사용자의 모든 즐겨찾기 주차장 조회
export async function findByUserId(userId: string): Promise<ParkingLot[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parking_lots')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[ParkingLotRepository] findByUserId 오류:', error)
    return []
  }
  return data ?? []
}

// 특정 즐겨찾기 주차장 단건 조회 (RLS로 userId 소유권 검증)
export async function findById(id: string, userId: string): Promise<ParkingLot | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parking_lots')
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('[ParkingLotRepository] findById 오류:', error)
    return null
  }
  return data
}

// 즐겨찾기 주차장 생성
export async function create(userId: string, dto: CreateParkingLotDto): Promise<ParkingLot | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parking_lots')
    .insert({ ...dto, user_id: userId })
    .select()
    .single()

  if (error) {
    console.error('[ParkingLotRepository] create 오류:', error)
    return null
  }
  return data
}

// 즐겨찾기 주차장 수정
export async function update(
  id: string,
  userId: string,
  dto: UpdateParkingLotDto
): Promise<ParkingLot | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('parking_lots')
    .update(dto)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('[ParkingLotRepository] update 오류:', error)
    return null
  }
  return data
}

// 즐겨찾기 주차장 삭제
export async function remove(id: string, userId: string): Promise<boolean> {
  const supabase = await createClient()
  const { error } = await supabase.from('parking_lots').delete().eq('id', id).eq('user_id', userId)

  if (error) {
    console.error('[ParkingLotRepository] remove 오류:', error)
    return false
  }
  return true
}
