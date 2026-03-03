'use client'

import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateNicknameAction } from '@/lib/actions/profile.actions'
import type { Profile } from '@/lib/types/profile.types'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [nickname, setNickname] = useState(profile.nickname ?? '')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleCancel = () => {
    setNickname(profile.nickname ?? '')
    setError(null)
    setIsEditing(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    const result = await updateNicknameAction(nickname)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
      return
    }

    setIsEditing(false)
    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>프로필</CardTitle>
      </CardHeader>
      <CardContent>
        {!isEditing ? (
          <div className="flex flex-col gap-4">
            <div className="grid gap-1">
              <Label className="text-muted-foreground text-sm">닉네임</Label>
              <p className="text-base font-medium">{profile.nickname ?? '닉네임을 설정해주세요'}</p>
            </div>
            <Button type="button" variant="outline" onClick={() => setIsEditing(true)}>
              편집
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="grid gap-2">
              <Label htmlFor="nickname">닉네임</Label>
              <Input
                id="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="2~30자 (한글/영문/숫자)"
                maxLength={30}
                autoFocus
              />
              <p className="text-muted-foreground text-xs">
                한글, 영문, 숫자 2~30자로 입력해주세요
              </p>
            </div>
            {error && <p className="text-destructive text-sm">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? '저장 중...' : '저장'}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel} disabled={isLoading}>
                취소
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  )
}
