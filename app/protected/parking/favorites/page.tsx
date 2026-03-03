import Link from 'next/link'
import { redirect } from 'next/navigation'

import { FavoriteCard } from '@/components/parking/favorite-card'
import { Button } from '@/components/ui/button'
import { getParkingLots } from '@/lib/services/parking-lot.service'
import { createClient } from '@/lib/supabase/server'

// 즐겨찾기 관리 페이지 (Server Component)
export default async function FavoritesPage() {
  const supabase = await createClient()
  const { data: claimsData } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (!userId) {
    redirect('/auth/login')
  }

  // DB에서 즐겨찾기 목록 조회
  const { data: favorites } = await getParkingLots(userId)
  const isEmpty = !favorites || favorites.length === 0

  return (
    <div className="flex w-full flex-col gap-6 pb-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">즐겨찾기</h1>
          <p className="text-muted-foreground text-sm">자주 가는 주차장 요금 체계를 저장하세요</p>
        </div>
        <Link href="/protected/parking/session/new">
          <Button className="h-10">+ 추가</Button>
        </Link>
      </div>

      {isEmpty ? (
        /* 빈 상태 */
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-12">
          <p className="text-muted-foreground text-center text-sm">저장된 즐겨찾기가 없습니다</p>
          <Link href="/protected/parking/session/new">
            <Button variant="outline" className="h-11">
              즐겨찾기 추가
            </Button>
          </Link>
        </div>
      ) : (
        /* 즐겨찾기 목록 - FavoriteCard로 수정/삭제 UI 제공 */
        <div className="flex flex-col gap-3">
          {favorites.map((lot) => (
            <FavoriteCard key={lot.id} lot={lot} />
          ))}
        </div>
      )}
    </div>
  )
}
