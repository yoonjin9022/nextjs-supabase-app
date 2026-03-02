'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// 선택 숫자 필드: NaN(빈 입력) → undefined 변환
const optionalPositiveNumber = z
  .number()
  .nonnegative()
  .or(z.nan())
  .transform((v) => (isNaN(v) ? undefined : v))
  .optional()

const feeStructureSchema = z.object({
  baseDuration: z.number({ error: '기본요금 시간을 입력해주세요' }).min(1, '1분 이상이어야 합니다'),
  baseFee: z.number({ error: '기본요금을 입력해주세요' }).min(0, '0원 이상이어야 합니다'),
  unitDuration: z.number({ error: '추가 단위시간을 입력해주세요' }).min(1, '1분 이상이어야 합니다'),
  unitFee: z.number({ error: '추가 단위요금을 입력해주세요' }).min(0, '0원 이상이어야 합니다'),
  maxDailyFee: optionalPositiveNumber,
  parkingLotName: z.string().optional(),
  budget: optionalPositiveNumber,
})

type FeeStructureFormValues = z.output<typeof feeStructureSchema>

// 외부에서 폼 필드를 채울 때 사용하는 타입
export interface FeeFormFillData {
  parkingLotName?: string
  baseDuration: number
  baseFee: number
  unitDuration: number
  unitFee: number
  maxDailyFee?: number
  budget?: number
}

interface FeeStructureFormProps {
  initialValues?: FeeFormFillData
}

export function FeeStructureForm({ initialValues }: FeeStructureFormProps) {
  const router = useRouter()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FeeStructureFormValues>({
    resolver: zodResolver(feeStructureSchema) as never,
    defaultValues: {
      baseDuration: 30,
      baseFee: 1000,
      unitDuration: 10,
      unitFee: 500,
    },
  })

  // 외부 값 주입 시 폼 리셋
  useEffect(() => {
    if (initialValues) {
      reset(initialValues as FeeStructureFormValues)
    }
  }, [initialValues, reset])

  const onSubmit = (data: FeeStructureFormValues) => {
    // 요금 체계 데이터를 searchParams로 인코딩하여 계산기 페이지로 전달
    const params = new URLSearchParams({
      baseDuration: String(data.baseDuration),
      baseFee: String(data.baseFee),
      unitDuration: String(data.unitDuration),
      unitFee: String(data.unitFee),
      entryAt: String(Date.now()),
      ...(data.parkingLotName && { name: data.parkingLotName }),
      ...(data.maxDailyFee !== undefined && { maxDailyFee: String(data.maxDailyFee) }),
      ...(data.budget !== undefined && { budget: String(data.budget) }),
    })
    // MVP: 목업 세션 ID 사용 (실제 구현 시 DB에 세션 생성 후 실제 ID 사용)
    router.push('/protected/parking/session/mock-session-1?' + params.toString())
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>요금 체계 입력</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
          {/* 주차장 이름 */}
          <div className="grid gap-1.5">
            <Label htmlFor="parkingLotName">주차장 이름 (선택)</Label>
            <Input
              id="parkingLotName"
              placeholder="예: 강남구 공영주차장"
              {...register('parkingLotName')}
            />
          </div>

          {/* 기본요금 구간 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="baseDuration">기본요금 시간 (분)</Label>
              <Input
                id="baseDuration"
                type="number"
                placeholder="30"
                {...register('baseDuration', { valueAsNumber: true })}
              />
              {errors.baseDuration && (
                <p className="text-sm text-destructive">{errors.baseDuration.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="baseFee">기본요금 (원)</Label>
              <Input
                id="baseFee"
                type="number"
                placeholder="1000"
                {...register('baseFee', { valueAsNumber: true })}
              />
              {errors.baseFee && (
                <p className="text-sm text-destructive">{errors.baseFee.message}</p>
              )}
            </div>
          </div>

          {/* 추가요금 구간 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="unitDuration">추가 단위시간 (분)</Label>
              <Input
                id="unitDuration"
                type="number"
                placeholder="10"
                {...register('unitDuration', { valueAsNumber: true })}
              />
              {errors.unitDuration && (
                <p className="text-sm text-destructive">{errors.unitDuration.message}</p>
              )}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="unitFee">추가 단위요금 (원)</Label>
              <Input
                id="unitFee"
                type="number"
                placeholder="500"
                {...register('unitFee', { valueAsNumber: true })}
              />
              {errors.unitFee && (
                <p className="text-sm text-destructive">{errors.unitFee.message}</p>
              )}
            </div>
          </div>

          {/* 일최대요금 */}
          <div className="grid gap-1.5">
            <Label htmlFor="maxDailyFee">일 최대요금 (원, 선택)</Label>
            <Input
              id="maxDailyFee"
              type="number"
              placeholder="10000"
              {...register('maxDailyFee', { valueAsNumber: true })}
            />
            {errors.maxDailyFee && (
              <p className="text-sm text-destructive">{errors.maxDailyFee.message}</p>
            )}
          </div>

          {/* 예산 */}
          <div className="grid gap-1.5">
            <Label htmlFor="budget">예산 (원, 선택)</Label>
            <Input
              id="budget"
              type="number"
              placeholder="5000"
              {...register('budget', { valueAsNumber: true })}
            />
            {errors.budget && <p className="text-sm text-destructive">{errors.budget.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting} className="h-11 w-full">
            {isSubmitting ? '시작 중...' : '주차 시작'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
