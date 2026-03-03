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

// 세션 시작 결과 타입
// 이미 활성 세션이 있는 경우 activeSessionId 필드에 기존 세션 ID를 담아 반환합니다.
export interface StartSessionResult extends ParkingResult<ParkingSession> {
  activeSessionId?: string
}

// ─── DB Entity 타입 (DB 컬럼과 1:1 대응) ───

// parking_lots 테이블 행 타입
export interface ParkingLot {
  id: string
  user_id: string
  name: string
  base_duration: number
  base_fee: number
  unit_duration: number
  unit_fee: number
  max_daily_fee: number | null
  created_at: string
  updated_at: string
}

// parking_sessions 테이블 행 타입
export interface ParkingSession {
  id: string
  user_id: string
  parking_lot_name: string | null
  base_duration: number
  base_fee: number
  unit_duration: number
  unit_fee: number
  max_daily_fee: number | null
  budget: number | null
  entered_at: string
  exited_at: string | null
  total_fee: number | null
  created_at: string
  updated_at: string
}

// ─── DB DTO 타입 ───

// 즐겨찾기 생성 DTO
export interface CreateParkingLotDto {
  name: string
  base_duration: number
  base_fee: number
  unit_duration: number
  unit_fee: number
  max_daily_fee?: number | null
}

// 즐겨찾기 수정 DTO
export interface UpdateParkingLotDto {
  name?: string
  base_duration?: number
  base_fee?: number
  unit_duration?: number
  unit_fee?: number
  max_daily_fee?: number | null
}

// 세션 생성 DB 삽입용 DTO (서버 사이드)
export interface CreateParkingSessionDbDto {
  user_id: string
  parking_lot_name?: string | null
  base_duration: number
  base_fee: number
  unit_duration: number
  unit_fee: number
  max_daily_fee?: number | null
  budget?: number | null
  entered_at: string // ISO 8601 형식 필수 (예: new Date().toISOString())
}

// 출차 업데이트 DTO
export interface ExitParkingSessionDto {
  exited_at: string
  total_fee: number
}
