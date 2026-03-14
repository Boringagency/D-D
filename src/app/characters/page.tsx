import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Character } from '@/types/database'
import SignOutButton from '@/components/SignOutButton'

function hpColor(current: number, max: number) {
  const pct = current / max
  if (pct <= 0) return 'text-[#ff4444]'
  if (pct <= 0.25) return 'text-[#ff6b6b] low-hp'
  if (pct <= 0.5) return 'text-[#ffaa44]'
  return 'text-[#4adf4a]'
}

function hpBarWidth(current: number, max: number) {
  return `${Math.max(0, Math.min(100, (current / max) * 100))}%`
}

function hpBarColor(current: number, max: number) {
  const pct = current / max
  if (pct <= 0) return 'bg-[#ff4444]'
  if (pct <= 0.25) return 'bg-[#ff6b6b]'
  if (pct <= 0.5) return 'bg-[#ffaa44]'
  return 'bg-[#4adf4a]'
}

export default async function CharactersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const { data: characters } = await supabase
    .from('characters')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0d0d1a]/95 backdrop-blur border-b border-[#2a2a4a] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚔️</span>
            <h1 className="font-bold text-[#c8a82c]">D&D Tracker</h1>
          </div>
          <SignOutButton />
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Page title + new character */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#e8e0d0]">My Characters</h2>
          <Link
            href="/characters/new"
            className="bg-[#c8a82c] hover:bg-[#a08020] text-[#0d0d1a] font-bold px-4 py-2 rounded-xl text-sm transition-colors flex items-center gap-1.5"
          >
            <span className="text-base">+</span> New
          </Link>
        </div>

        {/* Character list */}
        {!characters || characters.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🐉</div>
            <h3 className="text-xl font-bold text-[#c8a82c] mb-2">No Characters Yet</h3>
            <p className="text-[#a09080] text-sm mb-6">Begin your adventure by creating your first character.</p>
            <Link
              href="/characters/new"
              className="bg-[#c8a82c] hover:bg-[#a08020] text-[#0d0d1a] font-bold px-6 py-3 rounded-xl transition-colors inline-block"
            >
              Create Character
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {characters.map((char: Character) => (
              <Link key={char.id} href={`/characters/${char.id}`}>
                <div className="bg-[#1a1a2e] border border-[#2a2a4a] hover:border-[#c8a82c]/40 rounded-2xl p-4 transition-all active:scale-[0.98]">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-bold text-[#e8e0d0] text-lg leading-tight">{char.name}</h3>
                      <p className="text-[#a09080] text-sm">
                        Level {char.level} {char.race} {char.class}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className={`text-lg font-bold ${hpColor(char.current_hp, char.max_hp)}`}>
                        {char.current_hp}/{char.max_hp}
                      </div>
                      <div className="text-[#a09080] text-xs">HP</div>
                    </div>
                  </div>

                  {/* HP Bar */}
                  <div className="h-1.5 bg-[#0d0d1a] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${hpBarColor(char.current_hp, char.max_hp)}`}
                      style={{ width: hpBarWidth(char.current_hp, char.max_hp) }}
                    />
                  </div>

                  <div className="flex gap-3 mt-3 text-xs text-[#7a7a9a]">
                    <span>AC {char.armor_class}</span>
                    <span>•</span>
                    <span>Init {char.initiative >= 0 ? '+' : ''}{char.initiative}</span>
                    <span>•</span>
                    <span>Speed {char.speed}ft</span>
                    {char.temp_hp > 0 && (
                      <>
                        <span>•</span>
                        <span className="text-[#4a8adf]">+{char.temp_hp} THP</span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
