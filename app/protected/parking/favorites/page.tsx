import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { MOCK_FAVORITES } from '@/lib/mocks/parking.mocks'

export default function FavoritesPage() {
  const isEmpty = MOCK_FAVORITES.length === 0

  return (
    <div className="flex w-full flex-col gap-6 pb-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">즐겨찾기</h1>
          <p className="text-sm text-muted-foreground">자주 가는 주차장 요금 체계를 저장하세요</p>
        </div>
        <Link href="/protected/parking/session/new">
          <Button className="h-10">+ 추가</Button>
        </Link>
      </div>

      {isEmpty ? (
        /* 빈 상태 */
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed p-12">
          <p className="text-center text-sm text-muted-foreground">저장된 즐겨찾기가 없습니다</p>
          <Link href="/protected/parking/session/new">
            <Button variant="outline" className="h-11">
              즐겨찾기 추가
            </Button>
          </Link>
        </div>
      ) : (
        /* 즐겨찾기 목록 */
        <div className="flex flex-col gap-3">
          {MOCK_FAVORITES.map((fav) => (
            <Card key={fav.id}>
              <CardContent className="flex flex-col gap-3 p-4">
                {/* 이름 + 액션 버튼 */}
                <div className="flex items-start justify-between gap-2">
                  <span className="font-semibold">{fav.parkingLotName}</span>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" disabled>
                      수정
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 px-2 text-xs text-destructive hover:text-destructive"
                      disabled
                    >
                      삭제
                    </Button>
                  </div>
                </div>

                {/* 요금 체계 요약 */}
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>기본요금</span>
                    <span>
                      {fav.baseDuration}분 / {fav.baseFee.toLocaleString()}원
                    </span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>추가요금</span>
                    <span>
                      {fav.unitDuration}분 / {fav.unitFee.toLocaleString()}원
                    </span>
                  </div>
                  {fav.maxDailyFee && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>일 최대</span>
                      <span>{fav.maxDailyFee.toLocaleString()}원</span>
                    </div>
                  )}
                </div>

                {/* 이 주차장으로 시작 버튼 */}
                <Link href="/protected/parking/session/mock-session-1">
                  <Button variant="outline" className="h-10 w-full text-sm">
                    이 요금체계로 시작
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
