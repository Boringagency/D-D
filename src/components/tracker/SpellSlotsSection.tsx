'use client'

import { SpellSlot } from '@/types/database'

interface Props {
  spellSlots: SpellSlot[]
  onUpdate: (slotId: string, updates: Partial<SpellSlot>) => Promise<void>
}

const SLOT_COLORS = [
  'bg-[#4a1a8a] border-[#6a3aaa] text-[#c09aff]',  // L1
  'bg-[#1a4a8a] border-[#3a6aaa] text-[#6ab0ff]',  // L2
  'bg-[#1a8a8a] border-[#3aaaaa] text-[#6affff]',  // L3
  'bg-[#1a8a4a] border-[#3aaa6a] text-[#6affa0]',  // L4
  'bg-[#8a8a1a] border-[#aaaa3a] text-[#ffff6a]',  // L5
  'bg-[#8a4a1a] border-[#aa6a3a] text-[#ffa06a]',  // L6
  'bg-[#8a1a1a] border-[#aa3a3a] text-[#ff6a6a]',  // L7
  'bg-[#6a1a8a] border-[#8a3aaa] text-[#df6aff]',  // L8
  'bg-[#1a1a8a] border-[#3a3aaa] text-[#6a6aff]',  // L9
]

const ORDINALS = ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th']

export default function SpellSlotsSection({ spellSlots, onUpdate }: Props) {
  if (spellSlots.length === 0) {
    return (
      <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-8 text-center">
        <div className="text-4xl mb-3">🧙</div>
        <p className="text-[#a09080] text-sm">This character has no spell slots.</p>
      </div>
    )
  }

  function useSlot(slot: SpellSlot) {
    if (slot.used_slots < slot.max_slots) {
      onUpdate(slot.id, { used_slots: slot.used_slots + 1 })
    }
  }

  function recoverSlot(slot: SpellSlot) {
    if (slot.used_slots > 0) {
      onUpdate(slot.id, { used_slots: slot.used_slots - 1 })
    }
  }

  const available = spellSlots.reduce((sum, s) => sum + (s.max_slots - s.used_slots), 0)
  const total = spellSlots.reduce((sum, s) => sum + s.max_slots, 0)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#a09080]">✨ Spell Slots</h3>
        <span className="text-xs text-[#7a7a9a]">{available}/{total} available</span>
      </div>

      {spellSlots.map(slot => {
        const colorClass = SLOT_COLORS[slot.slot_level - 1] || SLOT_COLORS[0]
        const available = slot.max_slots - slot.used_slots

        return (
          <div key={slot.id} className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-lg border ${colorClass}`}>
                  {ORDINALS[slot.slot_level - 1]}
                </span>
                <span className="text-sm text-[#e8e0d0]">Level Slots</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#7a7a9a]">{available}/{slot.max_slots}</span>
                <button
                  onClick={() => recoverSlot(slot)}
                  disabled={slot.used_slots === 0}
                  className="w-7 h-7 rounded-lg bg-[#1a8b3a]/30 hover:bg-[#1a8b3a]/60 disabled:opacity-30 text-[#4adf4a] text-sm transition-colors"
                >
                  +
                </button>
                <button
                  onClick={() => useSlot(slot)}
                  disabled={available === 0}
                  className="w-7 h-7 rounded-lg bg-[#8b1a1a]/30 hover:bg-[#8b1a1a]/60 disabled:opacity-30 text-[#ff6b6b] text-sm transition-colors"
                >
                  −
                </button>
              </div>
            </div>

            {/* Slot pips */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: slot.max_slots }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    const isUsed = i >= available
                    if (isUsed) {
                      onUpdate(slot.id, { used_slots: slot.used_slots - 1 })
                    } else {
                      onUpdate(slot.id, { used_slots: slot.used_slots + 1 })
                    }
                  }}
                  className={`w-10 h-10 rounded-xl border-2 transition-all active:scale-95 font-bold text-sm ${
                    i < available
                      ? `${colorClass} opacity-100`
                      : 'bg-[#0d0d1a] border-[#3a3a5a] text-[#3a3a5a]'
                  }`}
                  title={i < available ? 'Click to use' : 'Click to recover'}
                >
                  {i < available ? '◆' : '◇'}
                </button>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
