import { redirect } from 'next/navigation'

import { LogoutButton } from '@/components/logout-button'
import { ProfileForm } from '@/components/profile-form'
import { getProfile } from '@/lib/services/profile.service'
import { createClient } from '@/lib/supabase/server'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data, error: authError } = await supabase.auth.getClaims()

  if (authError || !data?.claims) {
    redirect('/auth/login')
  }

  const userId = data.claims.sub
  const { data: profile, error } = await getProfile(userId)

  if (error || !profile) {
    return (
      <div className="flex w-full flex-1 flex-col gap-8">
        <h1 className="text-2xl font-bold">프로필 설정</h1>
        <p className="text-destructive text-sm">{error ?? '프로필을 불러올 수 없습니다.'}</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-1 flex-col gap-8">
      <h1 className="text-2xl font-bold">프로필 설정</h1>
      <ProfileForm profile={profile} />
      <div className="border-t pt-6">
        <LogoutButton />
      </div>
    </div>
  )
}
