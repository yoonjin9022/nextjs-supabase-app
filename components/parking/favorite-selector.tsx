'use client'

import type { FeeFormFillData } from '@/components/parking/fee-structure-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MOCK_FAVORITES } from '@/lib/mocks/parking.mocks'

interface FavoriteSelectorProps {
  onSelect: (data: FeeFormFillData) => void
}

export function FavoriteSelector({ onSelect }: FavoriteSelectorProps) {
  if (MOCK_FAVORITES.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 py-8 text-center">
        <p className="text-sm text-muted-foreground">저장된 즐겨찾기가 없습니다</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {MOCK_FAVORITES.map(({ id, ...fav }) => (
        <Card key={id} className="cursor-pointer transition-colors hover:bg-accent/50">
          <CardContent className="flex items-center justify-between gap-3 p-4">
            <div className="flex flex-col gap-1">
              <span className="font-medium">{fav.parkingLotName}</span>
              <span className="text-xs text-muted-foreground">
                기본 {fav.baseDuration}분 {fav.baseFee.toLocaleString()}원 · 추가 {fav.unitDuration}
                분 {fav.unitFee.toLocaleString()}원
                {fav.maxDailyFee ? ` · 최대 ${fav.maxDailyFee.toLocaleString()}원` : ''}
              </span>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-11 shrink-0"
              onClick={() => onSelect(fav)}
            >
              선택
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
