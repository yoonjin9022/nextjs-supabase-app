'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

interface MonthFilterTabsProps {
  selectedYear: number
  selectedMonth: number
}

// 최근 6개월 목록 생성 (현재 달 포함, 최신 달이 오른쪽)
function getRecentMonths(): { year: number; month: number }[] {
  const now = new Date()
  const months = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({ year: d.getFullYear(), month: d.getMonth() + 1 })
  }
  return months
}

// 버튼 텍스트: 같은 해면 'M월', 다른 해면 'YYYY년 M월'
function getMonthLabel(year: number, month: number, currentYear: number): string {
  if (year === currentYear) {
    return `${month}월`
  }
  return `${year}년 ${month}월`
}

export function MonthFilterTabs({ selectedYear, selectedMonth }: MonthFilterTabsProps) {
  const router = useRouter()
  const currentYear = new Date().getFullYear()
  const months = getRecentMonths()

  const handleMonthClick = (year: number, month: number) => {
    router.push(`/protected/parking/history?year=${year}&month=${month}`)
  }

  return (
    // 가로 스크롤 가능한 월 필터 탭
    <div className="flex gap-2 overflow-x-auto pb-2">
      {months.map(({ year, month }) => {
        const isSelected = year === selectedYear && month === selectedMonth
        return (
          <Button
            key={`${year}-${month}`}
            variant={isSelected ? 'default' : 'outline'}
            className="h-9 shrink-0"
            onClick={() => handleMonthClick(year, month)}
          >
            {getMonthLabel(year, month, currentYear)}
          </Button>
        )
      })}
    </div>
  )
}
