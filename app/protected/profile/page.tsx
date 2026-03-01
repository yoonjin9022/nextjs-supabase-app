import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/services/profile.service'
import { ProfileForm } from '@/components/profile-form'

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
      <div className='flex-1 w-full flex flex-col gap-8 max-w-2xl'>
        <h1 className='font-bold text-2xl'>프로필 설정</h1>
        <p className='text-sm text-destructive'>{error ?? '프로필을 불러올 수 없습니다.'}</p>
      </div>
    )
  }

  return (
    <div className='flex-1 w-full flex flex-col gap-8 max-w-2xl'>
      <h1 className='font-bold text-2xl'>프로필 설정</h1>
      <ProfileForm profile={profile} userId={userId} />
    </div>
  )
}
