import { redirect } from 'next/navigation'

import { MonthFilterTabs } from '@/components/parking/month-filter-tabs'
import { MonthlyStats } from '@/components/parking/monthly-stats'
import { SessionList } from '@/components/parking/session-list'
import { getSessionsByMonth } from '@/lib/services/parking-session.service'
import { createClient } from '@/lib/supabase/server'

// 주차 기록 페이지 (Server Component, Next.js 15 async searchParams)
export default async function HistoryPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string; month?: string }>
}) {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  // 미인증 사용자 리다이렉트
  if (!userId) {
    redirect('/auth/login')
  }

  // URL 파라미터로 연/월 결정 (기본값: 현재 달)
  const { year: yearParam, month: monthParam } = await searchParams
  const now = new Date()
  const rawYear = yearParam ? parseInt(yearParam, 10) : now.getFullYear()
  const rawMonth = monthParam ? parseInt(monthParam, 10) : now.getMonth() + 1
  // 비정상 값(NaN, 범위 초과) 방어: 현재 달로 폴백
  const selectedYear =
    Number.isInteger(rawYear) && rawYear >= 2020 && rawYear <= 2100 ? rawYear : now.getFullYear()
  const selectedMonth =
    Number.isInteger(rawMonth) && rawMonth >= 1 && rawMonth <= 12 ? rawMonth : now.getMonth() + 1

  // 해당 월의 세션 목록 조회
  const { data: sessions } = await getSessionsByMonth(userId, selectedYear, selectedMonth)
  const sessionList = sessions ?? []

  // 서버에서 통계 계산
  const totalFee = sessionList.reduce((sum, sess) => sum + (sess.total_fee ?? 0), 0)
  const sessionCount = sessionList.length
  const averageFee = sessionCount > 0 ? Math.round(totalFee / sessionCount) : 0

  return (
    <div className="flex w-full flex-col gap-6 pb-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-xl font-bold">주차 기록</h1>
        <p className="text-muted-foreground text-sm">월별 주차 기록과 통계를 확인하세요</p>
      </div>

      {/* 월 필터 탭 (최근 6개월) */}
      <MonthFilterTabs selectedYear={selectedYear} selectedMonth={selectedMonth} />

      {/* 선택된 월 표시 */}
      <p className="text-sm font-medium">
        {selectedYear}년 {selectedMonth}월 통계
      </p>

      {/* 월별 통계 카드 */}
      <MonthlyStats totalFee={totalFee} sessionCount={sessionCount} averageFee={averageFee} />

      {/* 세션 목록 */}
      <div className="flex flex-col gap-3">
        <h2 className="text-muted-foreground text-sm font-medium">세션 목록</h2>
        <SessionList sessions={sessionList} />
      </div>
    </div>
  )
}
