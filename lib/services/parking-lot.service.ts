import {
  create,
  findById,
  findByUserId,
  remove,
  update,
} from '@/lib/repositories/parking-lot.repository'
import type {
  CreateParkingLotDto,
  ParkingLot,
  ParkingResult,
  UpdateParkingLotDto,
} from '@/lib/types/parking.types'

// 사용자의 모든 즐겨찾기 주차장 조회
export async function getParkingLots(userId: string): Promise<ParkingResult<ParkingLot[]>> {
  try {
    const data = await findByUserId(userId)
    return { data, error: null }
  } catch (err) {
    console.error('[ParkingLotService] getParkingLots 오류:', err)
    return { data: null, error: '즐겨찾기 목록 조회 중 오류가 발생했습니다.' }
  }
}

// 특정 즐겨찾기 주차장 조회
export async function getParkingLot(
  id: string,
  userId: string
): Promise<ParkingResult<ParkingLot>> {
  try {
    const data = await findById(id, userId)
    if (!data) {
      return { data: null, error: '즐겨찾기를 찾을 수 없습니다.' }
    }
    return { data, error: null }
  } catch (err) {
    console.error('[ParkingLotService] getParkingLot 오류:', err)
    return { data: null, error: '즐겨찾기 조회 중 오류가 발생했습니다.' }
  }
}

// 즐겨찾기 주차장 생성 (이름 중복 체크 포함)
export async function createParkingLot(
  userId: string,
  dto: CreateParkingLotDto
): Promise<ParkingResult<ParkingLot>> {
  try {
    // 동일 사용자의 이름 중복 체크
    const existing = await findByUserId(userId)
    const isDuplicate = existing.some(
      (lot) => lot.name.trim().toLowerCase() === dto.name.trim().toLowerCase()
    )
    if (isDuplicate) {
      return { data: null, error: '이미 동일한 이름의 즐겨찾기가 존재합니다.' }
    }

    const data = await create(userId, dto)
    if (!data) {
      return { data: null, error: '즐겨찾기 생성에 실패했습니다.' }
    }
    return { data, error: null }
  } catch (err) {
    console.error('[ParkingLotService] createParkingLot 오류:', err)
    return { data: null, error: '즐겨찾기 생성 중 오류가 발생했습니다.' }
  }
}

// 즐겨찾기 주차장 수정
export async function updateParkingLot(
  id: string,
  userId: string,
  dto: UpdateParkingLotDto
): Promise<ParkingResult<ParkingLot>> {
  try {
    // 이름 변경 시 중복 체크
    if (dto.name !== undefined) {
      const existing = await findByUserId(userId)
      const isDuplicate = existing.some(
        (lot) => lot.id !== id && lot.name.trim().toLowerCase() === dto.name!.trim().toLowerCase()
      )
      if (isDuplicate) {
        return { data: null, error: '이미 동일한 이름의 즐겨찾기가 존재합니다.' }
      }
    }

    const data = await update(id, userId, dto)
    if (!data) {
      return { data: null, error: '즐겨찾기 수정에 실패했습니다.' }
    }
    return { data, error: null }
  } catch (err) {
    console.error('[ParkingLotService] updateParkingLot 오류:', err)
    return { data: null, error: '즐겨찾기 수정 중 오류가 발생했습니다.' }
  }
}

// 즐겨찾기 주차장 삭제
export async function deleteParkingLot(
  id: string,
  userId: string
): Promise<ParkingResult<boolean>> {
  try {
    const success = await remove(id, userId)
    if (!success) {
      return { data: null, error: '즐겨찾기 삭제에 실패했습니다.' }
    }
    return { data: true, error: null }
  } catch (err) {
    console.error('[ParkingLotService] deleteParkingLot 오류:', err)
    return { data: null, error: '즐겨찾기 삭제 중 오류가 발생했습니다.' }
  }
}
