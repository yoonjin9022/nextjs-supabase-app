import { GitCompare, ParkingSquare, Timer, Wallet } from 'lucide-react'
import Link from 'next/link'

import { ThemeSwitcher } from '@/components/theme-switcher'
import { Button } from '@/components/ui/button'

const FEATURES = [
  {
    icon: Timer,
    title: '실시간 요금 계산',
    desc: '입차 시각부터 현재 요금을 1초마다 추적합니다',
  },
  {
    icon: GitCompare,
    title: '출차 타이밍 비교',
    desc: '지금/+5분/+10분/+30분 요금을 한눈에 비교합니다',
  },
  {
    icon: Wallet,
    title: '예산 관리',
    desc: '예산 설정 후 소진율을 실시간으로 확인합니다',
  },
]

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen max-w-[430px] flex-col px-6">
        {/* 상단 유틸리티 바 */}
        <div className="flex justify-end py-3">
          <ThemeSwitcher />
        </div>

        {/* 히어로 + 기능 카드 + CTA */}
        <div className="flex flex-1 flex-col items-center justify-center gap-10 py-8">
          {/* 앱 아이콘 + 타이틀 */}
          <div className="flex flex-col items-center gap-3">
            <ParkingSquare className="h-14 w-14 text-primary" strokeWidth={1.5} />
            <h1 className="text-3xl font-bold tracking-tight">ParkingMeter</h1>
            <p className="text-center text-muted-foreground">지금 나가면 얼마?</p>
          </div>

          {/* 핵심 기능 3가지 */}
          <div className="flex w-full flex-col gap-3">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-center gap-4 rounded-xl border bg-card p-4">
                <Icon className="h-6 w-6 shrink-0 text-primary" strokeWidth={1.8} />
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-semibold">{title}</span>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </div>
              </div>
            ))}
          </div>

          {/* CTA 버튼 */}
          <div className="flex w-full flex-col gap-3">
            <Button asChild size="lg" className="h-12 text-base">
              <Link href="/auth/sign-up">시작하기 (무료)</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 text-base">
              <Link href="/auth/login">로그인</Link>
            </Button>
          </div>
        </div>

        {/* 푸터 */}
        <div className="py-6 text-center text-xs text-muted-foreground">
          ParkingMeter · 스마트 주차 도우미
        </div>
      </div>
    </main>
  )
}
