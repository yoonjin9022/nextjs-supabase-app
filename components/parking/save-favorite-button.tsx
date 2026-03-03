'use client'

import { Check } from 'lucide-react'
import { useState, useTransition } from 'react'

import { saveFavoriteFromSessionAction } from '@/app/protected/parking/actions'
import { Button } from '@/components/ui/button'

interface SaveFavoriteButtonProps {
  sessionId: string
}

// 출차 결과 페이지에서 즐겨찾기 저장 버튼 Client Component
// 세션의 요금 체계를 즐겨찾기로 저장합니다.
export function SaveFavoriteButton({ sessionId }: SaveFavoriteButtonProps) {
  const [isPending, startTransition] = useTransition()
  const [isSaved, setIsSaved] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleSave = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const result = await saveFavoriteFromSessionAction(sessionId)
      if (result.success) {
        setIsSaved(true)
      } else {
        setErrorMsg(result.error ?? '즐겨찾기 저장에 실패했습니다.')
      }
    })
  }

  return (
    <div className="flex flex-col gap-2">
      <Button
        variant="outline"
        className="h-11 w-full"
        onClick={handleSave}
        disabled={isPending || isSaved}
      >
        {isSaved ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            즐겨찾기 저장됨
          </>
        ) : isPending ? (
          '저장 중...'
        ) : (
          '즐겨찾기 저장'
        )}
      </Button>
      {errorMsg && <p className="text-destructive text-center text-sm">{errorMsg}</p>}
    </div>
  )
}
