'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useRef } from 'react'
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
  // 서버 액션: 정의된 경우 DB에 세션을 저장하고 redirect
  // 미정의 시에는 목업 모드로 동작 (개발/테스트용)
  formAction?: (formData: FormData) => Promise<void>
}

export function FeeStructureForm({ initialValues, formAction }: FeeStructureFormProps) {
  // 숨겨진 input들의 값을 제어하기 위한 ref
  const formRef = useRef<HTMLFormElement>(null)

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

  // 서버 액션 연동 시: 클라이언트 유효성 검증 후 FormData를 서버 액션에 전달
  const handleServerAction = async (data: FeeStructureFormValues) => {
    if (!formAction) return

    const fd = new FormData()
    fd.append('baseDuration', String(data.baseDuration))
    fd.append('baseFee', String(data.baseFee))
    fd.append('unitDuration', String(data.unitDuration))
    fd.append('unitFee', String(data.unitFee))
    fd.append('enteredAt', String(Date.now()))
    if (data.parkingLotName) fd.append('parkingLotName', data.parkingLotName)
    if (data.maxDailyFee !== undefined) fd.append('maxDailyFee', String(data.maxDailyFee))
    if (data.budget !== undefined) fd.append('budget', String(data.budget))

    await formAction(fd)
  }

  const onSubmit = (data: FeeStructureFormValues) => {
    if (formAction) {
      return handleServerAction(data)
    }
    // formAction이 없는 경우: 개발/테스트용 목업 모드 (아무 동작 없음)
    console.warn('[FeeStructureForm] formAction이 제공되지 않았습니다.')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>요금 체계 입력</CardTitle>
      </CardHeader>
      <CardContent>
        <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
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
                <p className="text-destructive text-sm">{errors.baseDuration.message}</p>
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
                <p className="text-destructive text-sm">{errors.baseFee.message}</p>
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
                <p className="text-destructive text-sm">{errors.unitDuration.message}</p>
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
                <p className="text-destructive text-sm">{errors.unitFee.message}</p>
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
              <p className="text-destructive text-sm">{errors.maxDailyFee.message}</p>
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
            {errors.budget && <p className="text-destructive text-sm">{errors.budget.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting} className="h-11 w-full">
            {isSubmitting ? '시작 중...' : '주차 시작'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
