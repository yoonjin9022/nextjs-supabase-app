/**
 * 주차 기능 목업 데이터 (MVP 단계 전용)
 * DB 연동 시 이 파일의 데이터를 실제 API 호출로 교체합니다.
 */

import type { FeeFormFillData } from '@/components/parking/fee-structure-form'
import type { ParkingSessionData } from '@/lib/types/parking.types'

// 즐겨찾기 목업 (favorites 페이지 + FavoriteSelector 공용)
export const MOCK_FAVORITES: (FeeFormFillData & { id: string })[] = [
  {
    id: 'fav-1',
    parkingLotName: '강남구 공영주차장',
    baseDuration: 30,
    baseFee: 1000,
    unitDuration: 10,
    unitFee: 500,
    maxDailyFee: 10000,
  },
  {
    id: 'fav-2',
    parkingLotName: '역삼역 주차장',
    baseDuration: 60,
    baseFee: 2000,
    unitDuration: 30,
    unitFee: 1000,
  },
  {
    id: 'fav-3',
    parkingLotName: '선릉 공영주차장',
    baseDuration: 30,
    baseFee: 800,
    unitDuration: 15,
    unitFee: 400,
    maxDailyFee: 8000,
  },
]

// 계산기 페이지 fallback 세션 목업
export const MOCK_SESSION: ParkingSessionData = {
  id: 'mock-session-1',
  entryTime: new Date(Date.now() - 45 * 60 * 1000), // 45분 전 진입
  feeStructure: {
    baseDuration: 30,
    baseFee: 1000,
    unitDuration: 10,
    unitFee: 500,
    maxDailyFee: 10000,
  },
  budget: 5000,
  parkingLotName: '강남구 공영주차장',
}
