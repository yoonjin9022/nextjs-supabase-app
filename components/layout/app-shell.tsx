import { BottomNav } from '@/components/layout/bottom-nav'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { hasEnvVars } from '@/lib/utils'

interface AppShellProps {
  children: React.ReactNode
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="bg-background min-h-screen">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[430px] flex-col">
        {/* 개발 환경 전용 상단 유틸리티 바 */}
        {!hasEnvVars && (
          <div className="flex items-center justify-center border-b px-4 py-2 text-xs">
            <span className="text-destructive">환경 변수가 설정되지 않았습니다</span>
          </div>
        )}

        {/* 스크롤 가능한 콘텐츠 영역 (pb-20: 하단 탭 높이 확보) */}
        <main className="flex-1 px-4 pt-6 pb-20">{children}</main>

        {/* 하단 고정 UI */}
        <div className="fixed right-0 bottom-0 z-40 flex items-center gap-2 p-2">
          <ThemeSwitcher />
        </div>

        {/* 하단 탭 네비게이션 */}
        <BottomNav />
      </div>
    </div>
  )
}
