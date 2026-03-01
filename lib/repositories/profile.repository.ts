import { createClient } from '@/lib/supabase/server'
import type { Profile, UpdateProfileDto } from '@/lib/types/profile.types'

// 프로필 ID로 단건 조회
export async function findProfileById(userId: string): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('[ProfileRepository] findProfileById 오류:', error)
    return null
  }
  return data
}

// 프로필 수정
export async function updateProfile(
  userId: string,
  dto: UpdateProfileDto
): Promise<Profile | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .update(dto)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('[ProfileRepository] updateProfile 오류:', error)
    return null
  }
  return data
}
