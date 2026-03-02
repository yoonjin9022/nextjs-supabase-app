'use client'

import { LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export function LogoutButton() {
  const router = useRouter()

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  return (
    <Button
      variant="outline"
      className="text-destructive hover:text-destructive w-full"
      onClick={logout}
    >
      <LogOut className="h-4 w-4" />
      로그아웃
    </Button>
  )
}
