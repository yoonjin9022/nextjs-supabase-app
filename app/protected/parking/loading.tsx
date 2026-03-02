import { Skeleton } from '@/components/ui/skeleton'

export default function ParkingHubLoading() {
  return (
    <div className="flex w-full flex-col gap-6">
      {/* 헤더 */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-48" />
      </div>

      {/* 진행 중 세션 카드 */}
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-24" />
        <div className="flex flex-col gap-3 rounded-xl border p-4">
          <div className="flex items-start justify-between">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-5 w-36" />
              <Skeleton className="h-3.5 w-24" />
            </div>
            <Skeleton className="h-7 w-20" />
          </div>
          <Skeleton className="h-11 w-full" />
        </div>
      </div>

      {/* 빠른 메뉴 버튼 2개 */}
      <div className="grid grid-cols-2 gap-3">
        <Skeleton className="h-11 w-full" />
        <Skeleton className="h-11 w-full" />
      </div>

      {/* 최근 기록 미리보기 */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex flex-col gap-2">
          {[1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <div className="flex flex-col gap-1.5">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-4 w-14" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
