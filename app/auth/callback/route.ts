import { redirect } from 'next/navigation'
import { type NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/protected'

  if (code) {
    const supabase = await createClient()

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      redirect(next)
    } else {
      redirect(`/auth/error?error=${error.message}`)
    }
  }

  redirect(`${origin}/auth/error?error=인증 코드가 없습니다`)
}
