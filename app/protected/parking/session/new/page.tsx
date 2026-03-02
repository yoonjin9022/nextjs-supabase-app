'use client'

import { useState } from 'react'

import { FavoriteSelector } from '@/components/parking/favorite-selector'
import type { FeeFormFillData } from '@/components/parking/fee-structure-form'
import { FeeStructureForm } from '@/components/parking/fee-structure-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function NewParkingSessionPage() {
  const [selectedFavorite, setSelectedFavorite] = useState<FeeFormFillData | undefined>()

  const handleFavoriteSelect = (data: FeeFormFillData) => {
    setSelectedFavorite(data)
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <div>
        <h1 className="text-xl font-bold">주차 시작</h1>
        <p className="text-sm text-muted-foreground">요금 체계를 입력하면 계산기가 시작됩니다</p>
      </div>

      <Tabs defaultValue="direct">
        <TabsList className="w-full">
          <TabsTrigger value="favorites" className="flex-1">
            즐겨찾기에서 선택
          </TabsTrigger>
          <TabsTrigger value="direct" className="flex-1">
            직접 입력
          </TabsTrigger>
        </TabsList>

        {/* 즐겨찾기 탭 */}
        <TabsContent value="favorites" className="mt-4">
          <FavoriteSelector onSelect={handleFavoriteSelect} />
          {selectedFavorite && (
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/5 px-4 py-3">
              <p className="text-sm font-medium text-primary">
                ✓ {selectedFavorite.parkingLotName} 선택됨
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                직접 입력 탭에서 세부 내용을 확인하고 시작하세요
              </p>
            </div>
          )}
        </TabsContent>

        {/* 직접 입력 탭 */}
        <TabsContent value="direct" className="mt-4">
          <FeeStructureForm initialValues={selectedFavorite} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
