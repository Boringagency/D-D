'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setMessage(null)

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError(error.message)
      } else {
        router.push('/characters')
        router.refresh()
      }
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) {
        setError(error.message)
      } else {
        setMessage('Check your email to confirm your account, then log in.')
        setMode('login')
      }
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0d0d1a]">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_#1a1a3e_0%,_#0d0d1a_70%)]" />
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-[#c8a82c]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-[#8b1a1a]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-sm">
        {/* Logo/Title */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">⚔️</div>
          <h1 className="text-3xl font-bold text-[#c8a82c] tracking-wide">
            D&D Tracker
          </h1>
          <p className="text-[#a09080] mt-1 text-sm">5th Edition Character Manager</p>
        </div>

        {/* Card */}
        <div className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-2xl p-6 shadow-2xl">
          {/* Tabs */}
          <div className="flex mb-6 bg-[#0d0d1a] rounded-xl p-1">
            <button
              onClick={() => { setMode('login'); setError(null); setMessage(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'login'
                  ? 'bg-[#c8a82c] text-[#0d0d1a]'
                  : 'text-[#a09080] hover:text-[#e8e0d0]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setMode('signup'); setError(null); setMessage(null) }}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === 'signup'
                  ? 'bg-[#c8a82c] text-[#0d0d1a]'
                  : 'text-[#a09080] hover:text-[#e8e0d0]'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#a09080] mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-4 py-3 text-sm text-[#e8e0d0] placeholder-[#5a5a7a] focus:outline-none focus:border-[#c8a82c] transition-colors"
                placeholder="adventurer@realm.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#a09080] mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-4 py-3 text-sm text-[#e8e0d0] placeholder-[#5a5a7a] focus:outline-none focus:border-[#c8a82c] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <div className="bg-[#8b1a1a]/20 border border-[#8b1a1a]/40 rounded-xl p-3 text-sm text-[#ff6b6b]">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-[#1a8b3a]/20 border border-[#1a8b3a]/40 rounded-xl p-3 text-sm text-[#6bff9e]">
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#c8a82c] hover:bg-[#a08020] disabled:opacity-50 disabled:cursor-not-allowed text-[#0d0d1a] font-bold py-3 rounded-xl transition-colors text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="inline-block w-4 h-4 border-2 border-[#0d0d1a]/30 border-t-[#0d0d1a] rounded-full animate-spin" />
                  {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                mode === 'login' ? 'Enter the Realm' : 'Begin Your Journey'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-[#5a5a7a] text-xs mt-6">
          Your characters await, adventurer.
        </p>
      </div>
    </div>
  )
}
