'use server'

import { revalidatePath } from 'next/cache'

import { editNickname } from '@/lib/services/profile.service'
import { createClient } from '@/lib/supabase/server'
import type { ProfileResult } from '@/lib/types/profile.types'

// 닉네임 업데이트 서버 액션
export async function updateNicknameAction(
  nickname: string
): Promise<ProfileResult<{ nickname: string | null }>> {
  try {
    const supabase = await createClient()
    const { data, error: authError } = await supabase.auth.getClaims()

    if (authError || !data?.claims) {
      return { data: null, error: '인증이 필요합니다.' }
    }

    const userId = data.claims.sub
    const result = await editNickname(userId, { nickname })

    if (result.error) {
      return { data: null, error: result.error }
    }

    revalidatePath('/protected/profile')
    revalidatePath('/protected')

    return { data: { nickname: result.data?.nickname ?? null }, error: null }
  } catch (err) {
    console.error('[ProfileAction] updateNicknameAction 오류:', err)
    return { data: null, error: '서버 오류가 발생했습니다.' }
  }
}
