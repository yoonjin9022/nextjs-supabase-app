import { findProfileById, updateProfile } from '@/lib/repositories/profile.repository'
import type {
  Profile,
  ProfileResult,
  UpdateNicknameDto,
  UpdateProfileDto,
} from '@/lib/types/profile.types'

// 프로필 조회 서비스
export async function getProfile(userId: string): Promise<ProfileResult<Profile>> {
  try {
    const data = await findProfileById(userId)
    if (!data) {
      return { data: null, error: '프로필을 찾을 수 없습니다.' }
    }
    return { data, error: null }
  } catch (err) {
    console.error('[ProfileService] getProfile 오류:', err)
    return { data: null, error: '프로필 조회 중 오류가 발생했습니다.' }
  }
}

// 닉네임 수정 서비스 (비즈니스 유효성 검증 포함)
export async function editNickname(
  userId: string,
  dto: UpdateNicknameDto
): Promise<ProfileResult<Profile>> {
  try {
    // 닉네임 유효성: 2~30자, 한글/영문/숫자/언더스코어 허용
    const nicknameRegex = /^[\w\uAC00-\uD7A3]{2,30}$/u
    if (!nicknameRegex.test(dto.nickname.trim())) {
      return {
        data: null,
        error: '닉네임은 2~30자의 한글, 영문, 숫자만 사용 가능합니다.',
      }
    }

    const data = await updateProfile(userId, { nickname: dto.nickname.trim() })
    if (!data) {
      return { data: null, error: '닉네임 수정에 실패했습니다.' }
    }
    return { data, error: null }
  } catch (err) {
    console.error('[ProfileService] editNickname 오류:', err)
    return { data: null, error: '닉네임 수정 중 오류가 발생했습니다.' }
  }
}

// 프로필 수정 서비스 (비즈니스 유효성 검증 포함)
export async function editProfile(
  userId: string,
  dto: UpdateProfileDto
): Promise<ProfileResult<Profile>> {
  try {
    // username 유효성: 영문/숫자/언더스코어, 3~20자
    if (dto.username !== undefined && dto.username !== null && dto.username !== '') {
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
      if (!usernameRegex.test(dto.username)) {
        return {
          data: null,
          error: 'username은 영문, 숫자, 언더스코어만 사용 가능하며 3~20자여야 합니다.',
        }
      }
    }

    // website URL 유효성
    if (dto.website) {
      try {
        new URL(dto.website)
      } catch {
        return { data: null, error: '올바른 URL 형식이 아닙니다. (예: https://example.com)' }
      }
    }

    const data = await updateProfile(userId, dto)
    if (!data) {
      return { data: null, error: '프로필 수정에 실패했습니다.' }
    }
    return { data, error: null }
  } catch (err) {
    console.error('[ProfileService] editProfile 오류:', err)
    return { data: null, error: '프로필 수정 중 오류가 발생했습니다.' }
  }
}
