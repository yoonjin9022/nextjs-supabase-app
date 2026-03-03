// profiles 테이블 행 타입 (DB 스키마와 1:1 대응)
export interface Profile {
  id: string
  nickname: string | null
  username: string | null
  full_name: string | null
  avatar_url: string | null
  website: string | null
  bio: string | null
  created_at: string
  updated_at: string
}

// 프로필 수정 요청 DTO (id, created_at, updated_at 제외)
export interface UpdateProfileDto {
  nickname?: string | null
  username?: string | null
  full_name?: string | null
  avatar_url?: string | null
  website?: string | null
  bio?: string | null
}

// 닉네임 전용 수정 DTO
export interface UpdateNicknameDto {
  nickname: string
}

// 서비스/리포지토리 공통 응답 타입
export interface ProfileResult<T> {
  data: T | null
  error: string | null
}
