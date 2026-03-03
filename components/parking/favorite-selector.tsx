'use client'

import type { FeeFormFillData } from '@/components/parking/fee-structure-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { ParkingLot } from '@/lib/types/parking.types'
import { parkingLotToFeeFormFillData } from '@/lib/utils/parking-lot'

interface FavoriteSelectorProps {
  favorites: ParkingLot[]
  onSelect: (data: FeeFormFillData) => void
}

export function FavoriteSelector({ favorites, onSelect }: FavoriteSelectorProps) {
  if (favorites.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-muted-foreground text-sm">저장된 즐겨찾기가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {favorites.map((lot) => (
        <Card key={lot.id} className="hover:bg-accent/50 cursor-pointer transition-colors">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{lot.name}</span>
              <span className="text-muted-foreground text-xs">
                기본 {lot.base_duration}분 {lot.base_fee.toLocaleString()}원 · 추가{' '}
                {lot.unit_duration}분 {lot.unit_fee.toLocaleString()}원
                {lot.max_daily_fee ? ` · 최대 ${lot.max_daily_fee.toLocaleString()}원` : ''}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-11 shrink-0"
              onClick={() => onSelect(parkingLotToFeeFormFillData(lot))}
            >
              선택
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
