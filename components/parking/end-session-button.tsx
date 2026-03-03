'use client'

import { useTransition } from 'react'

import { Button } from '@/components/ui/button'

interface EndSessionButtonProps {
  // 서버 액션: 출차 처리 후 결과 페이지로 redirect
  onEndSession: () => Promise<void>
  variant?: 'default' | 'outline'
  className?: string
  children?: React.ReactNode
}

// 출차 버튼 컴포넌트 (서버 액션 연동)
// useTransition으로 pending 상태를 관리하여 중복 클릭을 방지합니다.
export function EndSessionButton({
  onEndSession,
  variant = 'default',
  className,
  children,
}: EndSessionButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleClick = () => {
    startTransition(async () => {
      await onEndSession()
    })
  }

  return (
    <Button variant={variant} className={className} onClick={handleClick} disabled={isPending}>
      {isPending ? '출차 처리 중...' : (children ?? '출차하기')}
    </Button>
  )
}
