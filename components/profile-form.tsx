'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useRouter } from 'next/navigation'
import type { Profile, UpdateProfileDto } from '@/lib/types/profile.types'

interface ProfileFormProps {
  profile: Profile
  userId: string
}

export function ProfileForm({ profile, userId }: ProfileFormProps) {
  const [formData, setFormData] = useState<UpdateProfileDto>({
    username: profile.username,
    full_name: profile.full_name,
    avatar_url: profile.avatar_url,
    website: profile.website,
    bio: profile.bio,
  })
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const supabase = createClient()
      const { error: updateError } = await supabase
        .from('profiles')
        .update(formData)
        .eq('id', userId)

      if (updateError) throw new Error(updateError.message)

      setSuccessMessage('프로필이 성공적으로 저장되었습니다.')
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : '오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필 수정</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <div className='grid gap-2'>
            <Label htmlFor='username'>사용자명</Label>
            <Input
              id='username'
              value={formData.username ?? ''}
              onChange={(e) => setFormData({ ...formData, username: e.target.value || null })}
              placeholder='영문, 숫자, 언더스코어 (3~20자)'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='full_name'>이름</Label>
            <Input
              id='full_name'
              value={formData.full_name ?? ''}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value || null })}
              placeholder='홍길동'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='website'>웹사이트</Label>
            <Input
              id='website'
              type='url'
              value={formData.website ?? ''}
              onChange={(e) => setFormData({ ...formData, website: e.target.value || null })}
              placeholder='https://example.com'
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='bio'>소개</Label>
            <Input
              id='bio'
              value={formData.bio ?? ''}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value || null })}
              placeholder='자기소개를 입력하세요'
            />
          </div>
          {error && <p className='text-sm text-destructive'>{error}</p>}
          {successMessage && <p className='text-sm text-green-600'>{successMessage}</p>}
          <Button type='submit' disabled={isLoading}>
            {isLoading ? '저장 중...' : '저장'}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
