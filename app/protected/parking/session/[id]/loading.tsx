import { Skeleton } from '@/components/ui/skeleton'

export default function ParkingSessionLoading() {
  return (
    <div className="flex w-full flex-col gap-4 pb-8">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-6 w-28" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-11 w-20" />
      </div>

      {/* 요금 카운터 */}
      <div className="flex flex-col items-center gap-4 rounded-xl border p-6">
        <div className="flex flex-col items-center gap-1.5">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-36" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-3.5 w-28" />
          <Skeleton className="h-7 w-20" />
        </div>
        <Skeleton className="h-3.5 w-40" />
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>

      {/* 예산 바 */}
      <div className="flex flex-col gap-2 rounded-xl border p-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-28" />
        </div>
        <Skeleton className="h-3 w-full" />
        <Skeleton className="ml-auto h-3.5 w-16" />
      </div>

      {/* 타이밍 카드 4개 */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-28" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2 rounded-xl border p-4">
              <Skeleton className="h-4 w-10" />
              <Skeleton className="h-7 w-20" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* 출차 버튼 */}
      <Skeleton className="h-12 w-full" />
    </div>
  )
}
