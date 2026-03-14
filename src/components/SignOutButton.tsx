'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SignOutButton() {
  const supabase = createClient()
  const router = useRouter()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/auth')
    router.refresh()
  }

  return (
    <button
      onClick={signOut}
      className="text-[#a09080] hover:text-[#e8e0d0] text-sm px-3 py-1.5 rounded-lg border border-[#2a2a4a] hover:border-[#4a4a6a] transition-colors"
    >
      Sign Out
    </button>
  )
}
