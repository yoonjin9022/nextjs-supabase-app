import type { FeeFormFillData } from '@/components/parking/fee-structure-form'
import type { ParkingLot } from '@/lib/types/parking.types'

// ParkingLot(DB, snake_case) → FeeFormFillData(폼, camelCase) 변환 mapper
export function parkingLotToFeeFormFillData(lot: ParkingLot): FeeFormFillData {
  return {
    parkingLotName: lot.name,
    baseDuration: lot.base_duration,
    baseFee: lot.base_fee,
    unitDuration: lot.unit_duration,
    unitFee: lot.unit_fee,
    maxDailyFee: lot.max_daily_fee ?? undefined,
  }
}
