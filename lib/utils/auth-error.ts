// Supabase 인증 에러 메시지를 한국어로 변환
export function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) {
    return '이메일 또는 비밀번호가 올바르지 않습니다'
  }
  if (message.includes('Email not confirmed')) {
    return '이메일 인증이 완료되지 않았습니다. 받은 편지함을 확인해주세요'
  }
  if (message.includes('User already registered')) {
    return '이미 가입된 이메일입니다'
  }
  if (message.includes('Password should be at least')) {
    return '비밀번호는 6자 이상이어야 합니다'
  }
  if (message.includes('Unable to validate email address')) {
    return '유효하지 않은 이메일 형식입니다'
  }
  if (message.includes('Too many requests') || message.includes('rate limit')) {
    return '너무 많은 시도가 있었습니다. 잠시 후 다시 시도해주세요'
  }
  if (message.includes('Network') || message.includes('fetch')) {
    return '네트워크 오류가 발생했습니다. 연결 상태를 확인해주세요'
  }
  // 이미 한국어이거나 알 수 없는 에러는 그대로 반환
  return message
}
