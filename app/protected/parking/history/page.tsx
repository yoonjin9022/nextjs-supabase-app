'use client'

import { useState } from 'react'

import { MonthlyStats } from '@/components/parking/monthly-stats'
import { SessionList } from '@/components/parking/session-list'
import { Button } from '@/components/ui/button'

function getMonthLabel(date: Date): string {
  return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
}

export default function HistoryPage() {
  const now = new Date()
  const [selectedMonth, setSelectedMonth] = useState<Date>(now)

  const prevMonth = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1)
  const isCurrentMonth =
    selectedMonth.getFullYear() === now.getFullYear() && selectedMonth.getMonth() === now.getMonth()

  const handlePrevMonth = () => {
    setSelectedMonth(prevMonth)
  }

  const handleCurrentMonth = () => {
    setSelectedMonth(new Date(now.getFullYear(), now.getMonth(), 1))
  }

  return (
    <div className="flex w-full flex-col gap-6 pb-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold">주차 기록</h1>
        <p className="text-sm text-muted-foreground">월별 주차 기록과 통계를 확인하세요</p>
      </div>

      {/* 월 선택 필터 */}
      <div className="flex items-center gap-2">
        <Button
          variant={!isCurrentMonth ? 'default' : 'outline'}
          className="h-11"
          onClick={handlePrevMonth}
        >
          {getMonthLabel(prevMonth)}
        </Button>
        <Button
          variant={isCurrentMonth ? 'default' : 'outline'}
          className="h-11"
          onClick={handleCurrentMonth}
        >
          {getMonthLabel(new Date(now.getFullYear(), now.getMonth(), 1))}
        </Button>
      </div>

      {/* 현재 선택된 월 표시 */}
      <p className="text-sm font-medium">{getMonthLabel(selectedMonth)} 통계</p>

      {/* 월별 통계 */}
      <MonthlyStats />

      {/* 세션 목록 */}
      <div className="flex flex-col gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">세션 목록</h2>
        <SessionList />
      </div>
    </div>
  )
}
