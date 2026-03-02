import type { FeeResult, FeeStructure, TimingOption } from '@/lib/types/parking.types'

// 시점별 요금 계산 옵션 레이블 및 오프셋 정의
const TIMING_OFFSETS: Array<{ label: string; offsetMinutes: number }> = [
  { label: '지금', offsetMinutes: 0 },
  { label: '+5분', offsetMinutes: 5 },
  { label: '+10분', offsetMinutes: 10 },
  { label: '+30분', offsetMinutes: 30 },
]

/**
 * 경과 시간(ms)과 요금 구조를 받아 현재 요금을 계산한다.
 * - 경과 분수 = Math.floor(elapsedMs / 60000)
 * - 경과 분 <= baseDuration: baseFee 반환
 * - 경과 분 > baseDuration: baseFee + Math.ceil((경과분 - baseDuration) / unitDuration) * unitFee
 * - maxDailyFee 있으면 Math.min(total, maxDailyFee) 적용
 */
export function calculateFee(elapsedMs: number, fs: FeeStructure): number {
  const elapsedMinutes = Math.floor(elapsedMs / 60000)

  // 기본 요금 구간 이내인 경우
  if (elapsedMinutes <= fs.baseDuration) {
    return fs.maxDailyFee !== undefined ? Math.min(fs.baseFee, fs.maxDailyFee) : fs.baseFee
  }

  // 추가 요금 계산
  const extraMinutes = elapsedMinutes - fs.baseDuration
  const extraUnits = Math.ceil(extraMinutes / fs.unitDuration)
  const total = fs.baseFee + extraUnits * fs.unitFee

  // 일 최대요금 적용
  if (fs.maxDailyFee !== undefined) {
    return Math.min(total, fs.maxDailyFee)
  }

  return total
}

/**
 * 다음 요금 증가까지 남은 시간(ms)을 계산한다.
 * - 기본 요금 구간 내: 기본 구간 종료까지 남은 ms 반환
 * - 추가 요금 구간: 다음 단위 경계까지 남은 ms 반환
 */
export function msToNextIncrease(elapsedMs: number, fs: FeeStructure): number {
  const elapsedMinutesF = elapsedMs / 60000

  // 기본 요금 구간 내인 경우
  if (elapsedMinutesF < fs.baseDuration) {
    return (fs.baseDuration - elapsedMinutesF) * 60000
  }

  // 추가 요금 구간에서 다음 경계까지 계산
  const extraMinutesF = elapsedMinutesF - fs.baseDuration
  const nextBoundary = Math.ceil(extraMinutesF / fs.unitDuration) * fs.unitDuration
  return (fs.baseDuration + nextBoundary - elapsedMinutesF) * 60000
}

/**
 * 경과 시간(ms)과 요금 구조를 받아 FeeResult 객체를 반환한다.
 */
export function calculateFeeResult(elapsedMs: number, fs: FeeStructure): FeeResult {
  const fee = calculateFee(elapsedMs, fs)
  const isMaxReached = fs.maxDailyFee !== undefined && fee >= fs.maxDailyFee
  const elapsedMinutes = Math.floor(elapsedMs / 60000)

  // 현재 구간 설명 문자열 생성
  const currentSection =
    elapsedMinutes <= fs.baseDuration
      ? `기본요금 구간 (${fs.baseDuration}분)`
      : `추가요금 구간 (${fs.unitDuration}분마다 ${fs.unitFee.toLocaleString()}원)`

  return {
    fee,
    elapsedMs,
    msToNextIncrease: isMaxReached ? 0 : msToNextIncrease(elapsedMs, fs),
    isMaxReached,
    currentSection,
  }
}

/**
 * 4개 시점(지금/+5분/+10분/+30분)별 TimingOption 배열을 반환한다.
 * @param elapsedMs 현재 경과 시간(ms)
 * @param fs 요금 구조
 */
export function calculateTimingOptions(elapsedMs: number, fs: FeeStructure): TimingOption[] {
  const currentFee = calculateFee(elapsedMs, fs)

  return TIMING_OFFSETS.map(({ label, offsetMinutes }) => {
    const futureElapsedMs = elapsedMs + offsetMinutes * 60000
    const fee = calculateFee(futureElapsedMs, fs)
    const diff = fee - currentFee
    const isSame = diff === 0
    const isMaxReached = fs.maxDailyFee !== undefined && fee >= fs.maxDailyFee

    return {
      label,
      offsetMinutes,
      fee,
      diff,
      isSame,
      isMaxReached,
    }
  })
}

/**
 * 예산(원)까지 주차 가능한 시간(ms)을 반환한다.
 * - 예산이 baseFee보다 작은 경우: baseDuration * 60000 반환 (기본 구간 동안은 주차 가능)
 * - 불가능한 경우: null 반환
 * @param fs 요금 구조
 * @param budget 예산(원)
 */
export function estimateTimeToBudget(fs: FeeStructure, budget: number): number | null {
  // 예산이 baseFee 미만이면 기본 구간 시간 반환
  if (budget < fs.baseFee) {
    return fs.baseDuration * 60000
  }

  // 추가 요금 없이 기본 요금만으로 해결 가능한 경우
  if (budget === fs.baseFee) {
    return fs.baseDuration * 60000
  }

  // 추가 가능한 단위 수 계산
  const remainingBudget = budget - fs.baseFee
  const additionalUnits = Math.floor(remainingBudget / fs.unitFee)
  const totalMs = (fs.baseDuration + additionalUnits * fs.unitDuration) * 60000

  // maxDailyFee 제한 적용 여부 확인
  if (fs.maxDailyFee !== undefined && budget >= fs.maxDailyFee) {
    // 최대요금에 도달하는 경우: 무제한에 가까운 값 반환 (null 처리)
    return null
  }

  return totalMs
}

/**
 * ms를 HH:MM:SS 형식 문자열로 변환한다.
 * @example formatElapsed(3661000) → '01:01:01'
 */
export function formatElapsed(ms: number): string {
  const totalSec = Math.floor(ms / 1000)
  const h = Math.floor(totalSec / 3600)
  const m = Math.floor((totalSec % 3600) / 60)
  const s = totalSec % 60
  return [h, m, s].map((v) => String(v).padStart(2, '0')).join(':')
}

/**
 * ms를 MM:SS 형식 문자열로 변환한다.
 * @example formatCountdown(65000) → '01:05'
 */
export function formatCountdown(ms: number): string {
  const totalSec = Math.max(0, Math.ceil(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return [m, s].map((v) => String(v).padStart(2, '0')).join(':')
}
