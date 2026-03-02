// 주차 요금 구조 인터페이스
export interface FeeStructure {
  baseDuration: number // 기본요금 적용 시간(분)
  baseFee: number // 기본요금(원)
  unitDuration: number // 추가요금 단위시간(분)
  unitFee: number // 추가요금 단위요금(원)
  maxDailyFee?: number // 일 최대요금(원, 선택)
}

// 요금 계산 결과 인터페이스
export interface FeeResult {
  fee: number // 현재 누적 요금
  elapsedMs: number // 경과 시간(ms)
  msToNextIncrease: number // 다음 요금 증가까지 남은 시간(ms)
  isMaxReached: boolean // 일 최대요금 도달 여부
  currentSection: string // 현재 구간 설명 문자열
}

// 시점별 요금 옵션 인터페이스 (지금/+5분/+10분/+30분)
export interface TimingOption {
  label: string // 표시 레이블
  offsetMinutes: number // 현재 기준 오프셋(분)
  fee: number // 해당 시점 요금
  diff: number // 현재 요금 대비 차이
  isSame: boolean // 현재 요금과 동일 여부
  isMaxReached: boolean // 일 최대요금 도달 여부
}

// 주차 세션 데이터 인터페이스
export interface ParkingSessionData {
  id: string
  entryTime: Date
  feeStructure: FeeStructure
  budget?: number
  parkingLotName?: string
}

// 주차 세션 생성 요청 DTO
export interface CreateParkingSessionDto {
  feeStructure: FeeStructure
  budget?: number
  parkingLotName?: string
  entryAt?: number // Unix timestamp (ms), 없으면 현재 시각
}

// 서비스/리포지토리 공통 응답 타입
export interface ParkingResult<T> {
  data: T | null
  error: string | null
}
