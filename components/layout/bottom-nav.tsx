'use client'

import { ClipboardList, Home, ParkingSquare, User } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/protected', label: '홈', icon: Home, exact: true },
  { href: '/protected/parking', label: '주차', icon: ParkingSquare, exact: false },
  { href: '/protected/parking/history', label: '기록', icon: ClipboardList, exact: false },
  { href: '/protected/profile', label: '프로필', icon: User, exact: false },
] as const

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string, exact: boolean) => {
    if (exact) return pathname === href
    // 기록 탭은 주차 탭보다 먼저 매칭되어야 하므로 정확한 prefix 체크
    if (href === '/protected/parking/history') {
      return pathname.startsWith('/protected/parking/history')
    }
    if (href === '/protected/parking') {
      return (
        pathname.startsWith('/protected/parking') &&
        !pathname.startsWith('/protected/parking/history')
      )
    }
    return pathname.startsWith(href)
  }

  return (
    <nav
      aria-label="메인 내비게이션"
      className="bg-background/95 supports-[backdrop-filter]:bg-background/80 fixed bottom-0 left-1/2 z-50 flex h-16 w-full max-w-[430px] -translate-x-1/2 items-center border-t backdrop-blur"
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = isActive(href, exact)
        return (
          <Link
            key={href}
            href={href}
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 text-xs transition-colors',
              active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon
              className={cn('h-5 w-5', active && 'stroke-[2.5px]')}
              strokeWidth={active ? 2.5 : 1.8}
            />
            <span className={cn('font-medium', active && 'font-semibold')}>{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
