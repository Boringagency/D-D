'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CLASSES = [
  'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid',
  'Fighter', 'Monk', 'Paladin', 'Ranger', 'Rogue',
  'Sorcerer', 'Warlock', 'Wizard'
]

const HIT_DICE: Record<string, string> = {
  Artificer: 'd8', Barbarian: 'd12', Bard: 'd8', Cleric: 'd8',
  Druid: 'd8', Fighter: 'd10', Monk: 'd8', Paladin: 'd10',
  Ranger: 'd10', Rogue: 'd8', Sorcerer: 'd6', Warlock: 'd8', Wizard: 'd6'
}

const RACES = [
  'Dragonborn', 'Dwarf', 'Elf', 'Gnome', 'Half-Elf',
  'Half-Orc', 'Halfling', 'Human', 'Tiefling', 'Other'
]

const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
]

const PROFICIENCY_BONUS = [2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6, 6, 6, 6]

// Default spell slots by class and level
const SPELL_SLOT_TABLE: Record<string, number[][]> = {
  Wizard: [
    [2,0,0,0,0,0,0,0,0],
    [3,0,0,0,0,0,0,0,0],
    [4,2,0,0,0,0,0,0,0],
    [4,3,0,0,0,0,0,0,0],
    [4,3,2,0,0,0,0,0,0],
    [4,3,3,0,0,0,0,0,0],
    [4,3,3,1,0,0,0,0,0],
    [4,3,3,2,0,0,0,0,0],
    [4,3,3,3,1,0,0,0,0],
    [4,3,3,3,2,0,0,0,0],
    [4,3,3,3,2,1,0,0,0],
    [4,3,3,3,2,1,0,0,0],
    [4,3,3,3,2,1,1,0,0],
    [4,3,3,3,2,1,1,0,0],
    [4,3,3,3,2,1,1,1,0],
    [4,3,3,3,2,1,1,1,0],
    [4,3,3,3,2,1,1,1,1],
    [4,3,3,3,3,1,1,1,1],
    [4,3,3,3,3,2,1,1,1],
    [4,3,3,3,3,2,2,1,1],
  ],
  Sorcerer: [],
  Bard: [],
  Druid: [],
  Cleric: [],
}
// Fill in same table for full casters
;['Sorcerer', 'Bard', 'Druid', 'Cleric'].forEach(c => {
  SPELL_SLOT_TABLE[c] = SPELL_SLOT_TABLE['Wizard']
})

const HALF_CASTER_TABLE: number[][] = [
  [0,0,0,0,0,0,0,0,0],
  [2,0,0,0,0,0,0,0,0],
  [3,0,0,0,0,0,0,0,0],
  [3,0,0,0,0,0,0,0,0],
  [4,2,0,0,0,0,0,0,0],
  [4,2,0,0,0,0,0,0,0],
  [4,3,0,0,0,0,0,0,0],
  [4,3,0,0,0,0,0,0,0],
  [4,3,2,0,0,0,0,0,0],
  [4,3,2,0,0,0,0,0,0],
  [4,3,3,0,0,0,0,0,0],
  [4,3,3,0,0,0,0,0,0],
  [4,3,3,1,0,0,0,0,0],
  [4,3,3,1,0,0,0,0,0],
  [4,3,3,2,0,0,0,0,0],
  [4,3,3,2,0,0,0,0,0],
  [4,3,3,3,1,0,0,0,0],
  [4,3,3,3,1,0,0,0,0],
  [4,3,3,3,2,0,0,0,0],
  [4,3,3,3,2,0,0,0,0],
]
;['Paladin', 'Ranger', 'Artificer'].forEach(c => {
  SPELL_SLOT_TABLE[c] = HALF_CASTER_TABLE
})

const WARLOCK_TABLE: number[][] = Array.from({ length: 20 }, (_, i) => {
  const lvl = i + 1
  const slots = lvl >= 17 ? 4 : lvl >= 11 ? 3 : lvl >= 2 ? 2 : 1
  const slotLvl = lvl >= 9 ? 5 : lvl >= 7 ? 4 : lvl >= 5 ? 3 : lvl >= 3 ? 2 : 1
  const result = [0,0,0,0,0,0,0,0,0]
  result[slotLvl - 1] = slots
  return result
})
SPELL_SLOT_TABLE['Warlock'] = WARLOCK_TABLE

function getSpellSlots(cls: string, level: number): number[] {
  const table = SPELL_SLOT_TABLE[cls]
  if (!table || !table[level - 1]) return []
  return table[level - 1]
}

export default function NewCharacterPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    class: 'Fighter',
    subclass: '',
    race: 'Human',
    level: 1,
    background: '',
    alignment: 'True Neutral',
    max_hp: 10,
    current_hp: 10,
    armor_class: 10,
    initiative: 0,
    speed: 30,
    proficiency_bonus: 2,
    notes: '',
  })

  function update(field: string, value: string | number) {
    setForm(prev => {
      const next = { ...prev, [field]: value }
      if (field === 'max_hp') {
        next.current_hp = value as number
      }
      if (field === 'level') {
        next.proficiency_bonus = PROFICIENCY_BONUS[(value as number) - 1]
      }
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/auth'); return }

    const level = form.level
    const hitDiceType = HIT_DICE[form.class] || 'd8'
    const profBonus = PROFICIENCY_BONUS[level - 1]

    const { data: character, error: charError } = await supabase
      .from('characters')
      .insert({
        user_id: user.id,
        name: form.name,
        class: form.class,
        subclass: form.subclass || null,
        race: form.race,
        level,
        background: form.background || null,
        alignment: form.alignment || null,
        max_hp: form.max_hp,
        current_hp: form.current_hp,
        temp_hp: 0,
        armor_class: form.armor_class,
        initiative: form.initiative,
        speed: form.speed,
        proficiency_bonus: profBonus,
        hit_dice_total: level,
        hit_dice_current: level,
        hit_dice_type: hitDiceType,
        notes: form.notes,
        death_save_successes: 0,
        death_save_failures: 0,
      })
      .select()
      .single()

    if (charError || !character) {
      setError(charError?.message || 'Failed to create character')
      setLoading(false)
      return
    }

    // Insert spell slots
    const slots = getSpellSlots(form.class, level)
    const slotInserts = slots
      .map((max, i) => ({ character_id: character.id, slot_level: i + 1, max_slots: max, used_slots: 0 }))
      .filter(s => s.max_slots > 0)

    if (slotInserts.length > 0) {
      await supabase.from('spell_slots').insert(slotInserts)
    }

    // Insert currency
    await supabase.from('currency').insert({
      character_id: character.id,
      copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0
    })

    router.push(`/characters/${character.id}`)
  }

  const spellSlots = getSpellSlots(form.class, form.level)
  const hasSpells = spellSlots.some(s => s > 0)

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      <header className="sticky top-0 z-10 bg-[#0d0d1a]/95 backdrop-blur border-b border-[#2a2a4a] px-4 py-3">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/characters" className="text-[#a09080] hover:text-[#e8e0d0] transition-colors">
            ← Back
          </Link>
          <h1 className="font-bold text-[#c8a82c]">New Character</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <section className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-4">
            <h2 className="font-bold text-[#c8a82c] mb-4 flex items-center gap-2">
              <span>📜</span> Basic Info
            </h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-[#a09080] mb-1">Character Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => update('name', e.target.value)}
                  required
                  placeholder="Aragorn Strider"
                  className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] placeholder-[#5a5a7a] focus:outline-none focus:border-[#c8a82c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#a09080] mb-1">Class *</label>
                  <select
                    value={form.class}
                    onChange={e => update('class', e.target.value)}
                    className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] focus:outline-none focus:border-[#c8a82c]"
                  >
                    {CLASSES.map(c => <option key={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-[#a09080] mb-1">Race *</label>
                  <select
                    value={form.race}
                    onChange={e => update('race', e.target.value)}
                    className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] focus:outline-none focus:border-[#c8a82c]"
                  >
                    {RACES.map(r => <option key={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#a09080] mb-1">Level</label>
                  <input
                    type="number"
                    min={1} max={20}
                    value={form.level}
                    onChange={e => update('level', parseInt(e.target.value) || 1)}
                    className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] focus:outline-none focus:border-[#c8a82c]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#a09080] mb-1">Subclass</label>
                  <input
                    type="text"
                    value={form.subclass}
                    onChange={e => update('subclass', e.target.value)}
                    placeholder="e.g. Champion"
                    className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] placeholder-[#5a5a7a] focus:outline-none focus:border-[#c8a82c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#a09080] mb-1">Background</label>
                  <input
                    type="text"
                    value={form.background}
                    onChange={e => update('background', e.target.value)}
                    placeholder="e.g. Soldier"
                    className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] placeholder-[#5a5a7a] focus:outline-none focus:border-[#c8a82c]"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#a09080] mb-1">Alignment</label>
                  <select
                    value={form.alignment}
                    onChange={e => update('alignment', e.target.value)}
                    className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] focus:outline-none focus:border-[#c8a82c]"
                  >
                    {ALIGNMENTS.map(a => <option key={a}>{a}</option>)}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Combat Stats */}
          <section className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-4">
            <h2 className="font-bold text-[#c8a82c] mb-4 flex items-center gap-2">
              <span>⚔️</span> Combat Stats
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#a09080] mb-1">Max HP *</label>
                <input
                  type="number"
                  min={1}
                  value={form.max_hp}
                  onChange={e => update('max_hp', parseInt(e.target.value) || 1)}
                  className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] focus:outline-none focus:border-[#c8a82c]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#a09080] mb-1">Armor Class</label>
                <input
                  type="number"
                  min={1}
                  value={form.armor_class}
                  onChange={e => update('armor_class', parseInt(e.target.value) || 10)}
                  className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] focus:outline-none focus:border-[#c8a82c]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#a09080] mb-1">Initiative</label>
                <input
                  type="number"
                  value={form.initiative}
                  onChange={e => update('initiative', parseInt(e.target.value) || 0)}
                  className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] focus:outline-none focus:border-[#c8a82c]"
                />
              </div>
              <div>
                <label className="block text-xs text-[#a09080] mb-1">Speed (ft)</label>
                <input
                  type="number"
                  min={0}
                  value={form.speed}
                  onChange={e => update('speed', parseInt(e.target.value) || 30)}
                  className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] focus:outline-none focus:border-[#c8a82c]"
                />
              </div>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-[#7a7a9a]">
              <span>Hit Die: <span className="text-[#c8a82c] font-mono">{HIT_DICE[form.class]}</span></span>
              <span>•</span>
              <span>Prof. Bonus: <span className="text-[#c8a82c]">+{PROFICIENCY_BONUS[form.level - 1]}</span></span>
            </div>

            {hasSpells && (
              <div className="mt-3 p-3 bg-[#0d0d1a] rounded-xl">
                <div className="text-xs text-[#a09080] mb-2">Spell slots at level {form.level}:</div>
                <div className="flex flex-wrap gap-2">
                  {spellSlots.map((count, i) => count > 0 && (
                    <span key={i} className="text-xs bg-[#1a4a8a]/40 border border-[#1a4a8a]/60 rounded-lg px-2 py-1 text-[#6ab0ff]">
                      L{i+1}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </section>

          {/* Notes */}
          <section className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-4">
            <h2 className="font-bold text-[#c8a82c] mb-3 flex items-center gap-2">
              <span>📝</span> Notes
            </h2>
            <textarea
              value={form.notes}
              onChange={e => update('notes', e.target.value)}
              placeholder="Character backstory, traits, or notes..."
              rows={3}
              className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] placeholder-[#5a5a7a] focus:outline-none focus:border-[#c8a82c] resize-none"
            />
          </section>

          {error && (
            <div className="bg-[#8b1a1a]/20 border border-[#8b1a1a]/40 rounded-xl p-3 text-sm text-[#ff6b6b]">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c8a82c] hover:bg-[#a08020] disabled:opacity-50 text-[#0d0d1a] font-bold py-3.5 rounded-xl transition-colors"
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-[#0d0d1a]/30 border-t-[#0d0d1a] rounded-full animate-spin" />
                Creating...
              </span>
            ) : 'Create Character'}
          </button>
        </form>
      </main>
    </div>
  )
}
