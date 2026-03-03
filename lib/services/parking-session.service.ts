import {
  create,
  findActiveByUserId,
  findById,
  findByUserIdAndMonth,
  updateExitedAt,
} from '@/lib/repositories/parking-session.repository'
import type {
  CreateParkingSessionDbDto,
  ParkingResult,
  ParkingSession,
  StartSessionResult,
} from '@/lib/types/parking.types'
import { calculateFee } from '@/lib/utils/parking-fee'

// 진행 중인 세션 조회 (없으면 data: null, error: null 반환)
export async function getActiveSession(
  userId: string
): Promise<ParkingResult<ParkingSession | null>> {
  try {
    const data = await findActiveByUserId(userId)
    return { data, error: null }
  } catch (err) {
    console.error('[ParkingSessionService] getActiveSession 오류:', err)
    return { data: null, error: '진행 중인 세션 조회 중 오류가 발생했습니다.' }
  }
}

// 특정 세션 조회
export async function getSession(
  id: string,
  userId: string
): Promise<ParkingResult<ParkingSession>> {
  try {
    const data = await findById(id, userId)
    if (!data) {
      return { data: null, error: '세션을 찾을 수 없습니다.' }
    }
    return { data, error: null }
  } catch (err) {
    console.error('[ParkingSessionService] getSession 오류:', err)
    return { data: null, error: '세션 조회 중 오류가 발생했습니다.' }
  }
}

// 특정 월 세션 목록 조회
export async function getSessionsByMonth(
  userId: string,
  year: number,
  month: number
): Promise<ParkingResult<ParkingSession[]>> {
  try {
    const data = await findByUserIdAndMonth(userId, year, month)
    return { data, error: null }
  } catch (err) {
    console.error('[ParkingSessionService] getSessionsByMonth 오류:', err)
    return { data: null, error: '세션 목록 조회 중 오류가 발생했습니다.' }
  }
}

// 세션 시작 (진행 중 세션 중복 체크 포함)
export async function startSession(
  userId: string,
  dto: CreateParkingSessionDbDto
): Promise<StartSessionResult> {
  try {
    // 이미 진행 중인 세션이 있으면 중복 생성 방지
    const activeSession = await findActiveByUserId(userId)
    if (activeSession) {
      return {
        data: null,
        error: '이미 진행 중인 세션이 있습니다.',
        activeSessionId: activeSession.id,
      }
    }

    const data = await create(dto)
    if (!data) {
      return { data: null, error: '세션 생성에 실패했습니다.' }
    }
    return { data, error: null }
  } catch (err) {
    console.error('[ParkingSessionService] startSession 오류:', err)
    return { data: null, error: '세션 시작 중 오류가 발생했습니다.' }
  }
}

// 세션 종료 (최종 요금 계산 포함)
export async function endSession(
  id: string,
  userId: string,
  exitedAt: Date
): Promise<ParkingResult<ParkingSession>> {
  try {
    // 세션 조회 (요금 체계 및 입차 시간 확인)
    const session = await findById(id, userId)
    if (!session) {
      return { data: null, error: '세션을 찾을 수 없습니다.' }
    }

    // 이미 종료된 세션인지 확인
    if (session.exited_at !== null) {
      return { data: null, error: '이미 종료된 세션입니다.' }
    }

    // 경과 시간(ms) 계산
    const elapsedMs = exitedAt.getTime() - new Date(session.entered_at).getTime()

    // DB에 저장된 요금 체계로 최종 요금 계산
    const feeStructure = {
      baseDuration: session.base_duration,
      baseFee: session.base_fee,
      unitDuration: session.unit_duration,
      unitFee: session.unit_fee,
      ...(session.max_daily_fee !== null && { maxDailyFee: session.max_daily_fee }),
    }
    const totalFee = calculateFee(elapsedMs, feeStructure)

    // 출차 시간 및 최종 요금 업데이트
    const data = await updateExitedAt(id, userId, {
      exited_at: exitedAt.toISOString(),
      total_fee: totalFee,
    })
    if (!data) {
      return { data: null, error: '세션 종료에 실패했습니다.' }
    }
    return { data, error: null }
  } catch (err) {
    console.error('[ParkingSessionService] endSession 오류:', err)
    return { data: null, error: '세션 종료 중 오류가 발생했습니다.' }
  }
}
