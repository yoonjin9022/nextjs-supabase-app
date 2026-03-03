'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useState, useTransition } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { z } from 'zod'

import { deleteFavoriteAction, updateFavoriteAction } from '@/app/protected/parking/actions'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ParkingLot } from '@/lib/types/parking.types'

// max_daily_fee: 선택 필드 — 빈 입력은 register의 setValueAs로 undefined 처리
const updateFavoriteSchema = z.object({
  name: z.string().min(1, '이름을 입력해주세요').max(100, '100자 이하로 입력해주세요'),
  base_duration: z
    .number({ message: '기본요금 시간을 입력해주세요' })
    .int()
    .min(1, '1분 이상이어야 합니다'),
  base_fee: z.number({ message: '기본요금을 입력해주세요' }).min(0, '0원 이상이어야 합니다'),
  unit_duration: z
    .number({ message: '추가 단위시간을 입력해주세요' })
    .int()
    .min(1, '1분 이상이어야 합니다'),
  unit_fee: z.number({ message: '추가 단위요금을 입력해주세요' }).min(0, '0원 이상이어야 합니다'),
  max_daily_fee: z.number().nonnegative('0원 이상이어야 합니다').optional(),
})

type UpdateFavoriteFormValues = z.infer<typeof updateFavoriteSchema>

interface FavoriteCardProps {
  lot: ParkingLot
}

// 즐겨찾기 카드 Client Component
// 일반 모드: 요금 체계 표시 + 수정/삭제 버튼
// 수정 모드: React Hook Form 기반 인라인 수정 폼
export function FavoriteCard({ lot }: FavoriteCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateFavoriteFormValues>({
    resolver: zodResolver(updateFavoriteSchema),
    defaultValues: {
      name: lot.name,
      base_duration: lot.base_duration,
      base_fee: lot.base_fee,
      unit_duration: lot.unit_duration,
      unit_fee: lot.unit_fee,
      max_daily_fee: lot.max_daily_fee ?? undefined,
    },
  })

  // 수정 저장 핸들러
  const handleUpdate = handleSubmit((data: UpdateFavoriteFormValues) => {
    setErrorMsg(null)
    startTransition(async () => {
      const fd = new FormData()
      fd.append('name', data.name)
      fd.append('base_duration', String(data.base_duration))
      fd.append('base_fee', String(data.base_fee))
      fd.append('unit_duration', String(data.unit_duration))
      fd.append('unit_fee', String(data.unit_fee))
      if (data.max_daily_fee !== undefined) {
        fd.append('max_daily_fee', String(data.max_daily_fee))
      }

      const result = await updateFavoriteAction(lot.id, fd)
      if (!result.success) {
        const msg = result.error ?? '수정에 실패했습니다.'
        setErrorMsg(msg)
        toast.error(msg)
      } else {
        setIsEditing(false)
        toast.success('즐겨찾기가 수정되었습니다.')
      }
    })
  })

  // 수정 취소 핸들러
  const handleCancelEdit = () => {
    reset({
      name: lot.name,
      base_duration: lot.base_duration,
      base_fee: lot.base_fee,
      unit_duration: lot.unit_duration,
      unit_fee: lot.unit_fee,
      max_daily_fee: lot.max_daily_fee ?? undefined,
    })
    setErrorMsg(null)
    setIsEditing(false)
  }

  // 삭제 실행 핸들러 (AlertDialog 확인 후 호출)
  const handleDeleteConfirm = () => {
    setErrorMsg(null)
    startTransition(async () => {
      const result = await deleteFavoriteAction(lot.id)
      if (!result.success) {
        const msg = result.error ?? '삭제에 실패했습니다.'
        setErrorMsg(msg)
        toast.error(msg)
      } else {
        toast.success('즐겨찾기가 삭제되었습니다.')
      }
    })
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        {isEditing ? (
          /* 수정 모드: 인라인 폼 */
          <form onSubmit={handleUpdate} className="flex flex-col gap-4">
            {/* 이름 */}
            <div className="grid gap-1.5">
              <Label htmlFor={`name-${lot.id}`}>주차장 이름</Label>
              <Input
                id={`name-${lot.id}`}
                placeholder="예: 강남구 공영주차장"
                {...register('name')}
              />
              {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
            </div>

            {/* 기본요금 구간 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor={`base_duration-${lot.id}`}>기본요금 시간 (분)</Label>
                <Input
                  id={`base_duration-${lot.id}`}
                  type="number"
                  {...register('base_duration', { valueAsNumber: true })}
                />
                {errors.base_duration && (
                  <p className="text-destructive text-xs">{errors.base_duration.message}</p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`base_fee-${lot.id}`}>기본요금 (원)</Label>
                <Input
                  id={`base_fee-${lot.id}`}
                  type="number"
                  {...register('base_fee', { valueAsNumber: true })}
                />
                {errors.base_fee && (
                  <p className="text-destructive text-xs">{errors.base_fee.message}</p>
                )}
              </div>
            </div>

            {/* 추가요금 구간 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor={`unit_duration-${lot.id}`}>추가 단위시간 (분)</Label>
                <Input
                  id={`unit_duration-${lot.id}`}
                  type="number"
                  {...register('unit_duration', { valueAsNumber: true })}
                />
                {errors.unit_duration && (
                  <p className="text-destructive text-xs">{errors.unit_duration.message}</p>
                )}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor={`unit_fee-${lot.id}`}>추가 단위요금 (원)</Label>
                <Input
                  id={`unit_fee-${lot.id}`}
                  type="number"
                  {...register('unit_fee', { valueAsNumber: true })}
                />
                {errors.unit_fee && (
                  <p className="text-destructive text-xs">{errors.unit_fee.message}</p>
                )}
              </div>
            </div>

            {/* 일 최대요금 */}
            <div className="grid gap-1.5">
              <Label htmlFor={`max_daily_fee-${lot.id}`}>일 최대요금 (원, 선택)</Label>
              <Input
                id={`max_daily_fee-${lot.id}`}
                type="number"
                placeholder="없음"
                {...register('max_daily_fee', {
                  setValueAs: (v) =>
                    v === '' || v === null || isNaN(Number(v)) ? undefined : Number(v),
                })}
              />
              {errors.max_daily_fee && (
                <p className="text-destructive text-xs">{errors.max_daily_fee.message}</p>
              )}
            </div>

            {/* 인라인 에러 메시지 */}
            {errorMsg && <p className="text-destructive text-sm">{errorMsg}</p>}

            {/* 저장/취소 버튼 */}
            <div className="flex gap-2">
              <Button type="submit" className="h-10 flex-1 text-sm" disabled={isPending}>
                {isPending ? '저장 중...' : '저장'}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-10 flex-1 text-sm"
                onClick={handleCancelEdit}
                disabled={isPending}
              >
                취소
              </Button>
            </div>
          </form>
        ) : (
          /* 일반 모드: 요금 체계 표시 */
          <>
            {/* 이름 + 액션 버튼 */}
            <div className="flex items-start justify-between gap-2">
              <span className="font-semibold">{lot.name}</span>
              <div className="flex shrink-0 gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2 text-xs"
                  onClick={() => setIsEditing(true)}
                  disabled={isPending}
                >
                  수정
                </Button>

                {/* 삭제 확인 AlertDialog */}
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive h-8 px-2 text-xs"
                      disabled={isPending}
                    >
                      {isPending ? '삭제 중...' : '삭제'}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>즐겨찾기 삭제</AlertDialogTitle>
                      <AlertDialogDescription>
                        &ldquo;{lot.name}&rdquo;을(를) 삭제하시겠습니까? 이 작업은 되돌릴 수
                        없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={handleDeleteConfirm}
                      >
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            {/* 요금 체계 요약 */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
              <div className="text-muted-foreground flex justify-between">
                <span>기본요금</span>
                <span>
                  {lot.base_duration}분 / {lot.base_fee.toLocaleString()}원
                </span>
              </div>
              <div className="text-muted-foreground flex justify-between">
                <span>추가요금</span>
                <span>
                  {lot.unit_duration}분 / {lot.unit_fee.toLocaleString()}원
                </span>
              </div>
              {/* max_daily_fee === 0도 정상 표시되도록 !== null 체크 */}
              {lot.max_daily_fee !== null && (
                <div className="text-muted-foreground flex justify-between">
                  <span>일 최대</span>
                  <span>{lot.max_daily_fee.toLocaleString()}원</span>
                </div>
              )}
            </div>

            {/* 인라인 에러 메시지 */}
            {errorMsg && <p className="text-destructive text-sm">{errorMsg}</p>}
          </>
        )}
      </CardContent>
    </Card>
  )
}
