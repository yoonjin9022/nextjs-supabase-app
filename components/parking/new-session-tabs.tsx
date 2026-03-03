'use client'

import { Check } from 'lucide-react'
import { useState } from 'react'

import { FavoriteSelector } from '@/components/parking/favorite-selector'
import type { FeeFormFillData } from '@/components/parking/fee-structure-form'
import { FeeStructureForm } from '@/components/parking/fee-structure-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { ParkingLot } from '@/lib/types/parking.types'

interface NewSessionTabsProps {
  // 서버 액션: FeeStructureForm에 전달하여 DB 세션 생성 처리
  formAction: (formData: FormData) => Promise<void>
  // DB에서 조회한 즐겨찾기 목록
  favorites: ParkingLot[]
}

// 세션 시작 페이지의 탭 UI를 담당하는 Client Component
// 즐겨찾기 선택 상태(selectedFavorite)를 관리하고 FeeStructureForm에 초기값으로 전달합니다.
// 즐겨찾기 선택 시 자동으로 직접 입력 탭으로 전환됩니다.
export function NewSessionTabs({ formAction, favorites }: NewSessionTabsProps) {
  const [selectedFavorite, setSelectedFavorite] = useState<FeeFormFillData | undefined>()
  const [activeTab, setActiveTab] = useState('direct')

  const handleFavoriteSelect = (data: FeeFormFillData) => {
    setSelectedFavorite(data)
    // 즐겨찾기 선택 후 직접 입력 탭으로 자동 전환
    setActiveTab('direct')
  }

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
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
        <FavoriteSelector favorites={favorites} onSelect={handleFavoriteSelect} />
      </TabsContent>

      {/* 직접 입력 탭 */}
      <TabsContent value="direct" className="mt-4 flex flex-col gap-4">
        {/* 즐겨찾기에서 불러온 경우 안내 배지 표시 */}
        {selectedFavorite && (
          <div className="border-primary/30 bg-primary/5 flex items-center gap-2 rounded-lg border px-4 py-3">
            <Check className="text-primary h-4 w-4 shrink-0" />
            <p className="text-primary text-sm font-medium">
              {selectedFavorite.parkingLotName} 불러옴
            </p>
          </div>
        )}
        <FeeStructureForm initialValues={selectedFavorite} formAction={formAction} />
      </TabsContent>
    </Tabs>
  )
}
