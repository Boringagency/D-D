'use client'

import { useState } from 'react'
import { Character } from '@/types/database'

interface Props {
  character: Character
  onUpdate: (updates: Partial<Character>) => Promise<void>
}

export default function HPSection({ character, onUpdate }: Props) {
  const [hpInput, setHpInput] = useState('')
  const [tempInput, setTempInput] = useState('')
  const [mode, setMode] = useState<'damage' | 'heal'>('damage')

  function applyHP() {
    const amount = parseInt(hpInput)
    if (!amount || amount <= 0) return

    let newHp = character.current_hp
    let newTemp = character.temp_hp

    if (mode === 'damage') {
      // Damage hits temp HP first
      let remaining = amount
      if (newTemp > 0) {
        const tempUsed = Math.min(remaining, newTemp)
        newTemp -= tempUsed
        remaining -= tempUsed
      }
      newHp = Math.max(0, newHp - remaining)
    } else {
      newHp = Math.min(character.max_hp, newHp + amount)
    }

    onUpdate({ current_hp: newHp, temp_hp: newTemp })
    setHpInput('')
  }

  function applyTempHP() {
    const amount = parseInt(tempInput)
    if (!amount || amount < 0) return
    // Temp HP doesn't stack - take the higher value
    onUpdate({ temp_hp: Math.max(character.temp_hp, amount) })
    setTempInput('')
  }

  function setMaxHP() {
    onUpdate({ current_hp: character.max_hp })
  }

  function adjustHP(delta: number) {
    if (delta < 0) {
      // Damage
      let remaining = Math.abs(delta)
      let newTemp = character.temp_hp
      if (newTemp > 0) {
        const used = Math.min(remaining, newTemp)
        newTemp -= used
        remaining -= used
      }
      const newHp = Math.max(0, character.current_hp - remaining)
      onUpdate({ current_hp: newHp, temp_hp: newTemp })
    } else {
      // Heal
      onUpdate({ current_hp: Math.min(character.max_hp, character.current_hp + delta) })
    }
  }

  const hpPct = character.max_hp > 0 ? character.current_hp / character.max_hp : 0
  const isDead = character.current_hp <= 0
  const isLowHp = hpPct <= 0.25 && !isDead

  const barColor = isDead ? 'bg-[#ff4444]' :
    isLowHp ? 'bg-[#ff6b6b]' :
    hpPct <= 0.5 ? 'bg-[#ffaa44]' : 'bg-[#4adf4a]'

  const textColor = isDead ? 'text-[#ff4444]' :
    isLowHp ? 'text-[#ff6b6b]' :
    hpPct <= 0.5 ? 'text-[#ffaa44]' : 'text-[#4adf4a]'

  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-4">
      <h3 className="text-xs font-bold text-[#a09080] uppercase tracking-wider mb-3">❤️ Hit Points</h3>

      {/* Big HP display */}
      <div className="text-center mb-4">
        <div className={`text-5xl font-bold font-mono ${textColor} ${isLowHp ? 'low-hp' : ''}`}>
          {character.current_hp}
        </div>
        <div className="text-[#a09080] text-sm">/ {character.max_hp} max</div>
        {character.temp_hp > 0 && (
          <div className="text-[#6ab0ff] text-sm mt-0.5">+{character.temp_hp} temporary</div>
        )}
        {isDead && (
          <div className="text-[#ff4444] text-xs font-bold mt-1 animate-pulse">⚠️ UNCONSCIOUS</div>
        )}
      </div>

      {/* HP Bar */}
      <div className="h-3 bg-[#0d0d1a] rounded-full overflow-hidden mb-4">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${Math.max(0, Math.min(100, hpPct * 100))}%` }}
        />
      </div>

      {/* Quick +/- buttons */}
      <div className="flex justify-center gap-2 mb-4">
        {[-10, -5, -1, +1, +5, +10].map(delta => (
          <button
            key={delta}
            onClick={() => adjustHP(delta)}
            className={`w-10 h-10 rounded-xl text-sm font-bold transition-all active:scale-95 ${
              delta < 0
                ? 'bg-[#8b1a1a]/30 hover:bg-[#8b1a1a]/60 text-[#ff6b6b] border border-[#8b1a1a]/40'
                : 'bg-[#1a8b3a]/30 hover:bg-[#1a8b3a]/60 text-[#4adf4a] border border-[#1a8b3a]/40'
            }`}
          >
            {delta > 0 ? `+${delta}` : delta}
          </button>
        ))}
      </div>

      {/* Damage/Heal input */}
      <div className="flex gap-2 mb-3">
        <div className="flex bg-[#0d0d1a] rounded-xl overflow-hidden flex-shrink-0">
          <button
            onClick={() => setMode('damage')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              mode === 'damage' ? 'bg-[#8b1a1a] text-white' : 'text-[#a09080]'
            }`}
          >
            Damage
          </button>
          <button
            onClick={() => setMode('heal')}
            className={`px-3 py-2 text-xs font-medium transition-colors ${
              mode === 'heal' ? 'bg-[#1a8b3a] text-white' : 'text-[#a09080]'
            }`}
          >
            Heal
          </button>
        </div>
        <input
          type="number"
          min={0}
          value={hpInput}
          onChange={e => setHpInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyHP()}
          placeholder="Amount"
          className="flex-1 bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2 text-sm text-[#e8e0d0] placeholder-[#5a5a7a] focus:outline-none focus:border-[#c8a82c]"
        />
        <button
          onClick={applyHP}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-colors ${
            mode === 'damage'
              ? 'bg-[#8b1a1a] hover:bg-[#6b0f0f] text-white'
              : 'bg-[#1a8b3a] hover:bg-[#0f6b2a] text-white'
          }`}
        >
          Apply
        </button>
      </div>

      {/* Temp HP */}
      <div className="flex gap-2">
        <input
          type="number"
          min={0}
          value={tempInput}
          onChange={e => setTempInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && applyTempHP()}
          placeholder="Temp HP"
          className="flex-1 bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2 text-sm text-[#e8e0d0] placeholder-[#5a5a7a] focus:outline-none focus:border-[#4a8adf]"
        />
        <button
          onClick={applyTempHP}
          className="px-3 py-2 bg-[#1a4a8a]/40 hover:bg-[#1a4a8a]/70 border border-[#1a4a8a]/60 text-[#6ab0ff] rounded-xl text-xs font-medium transition-colors"
        >
          Set Temp
        </button>
        <button
          onClick={setMaxHP}
          className="px-3 py-2 bg-[#2a2a4a] hover:bg-[#3a3a5a] text-[#a09080] rounded-xl text-xs font-medium transition-colors"
        >
          Full HP
        </button>
      </div>
    </div>
  )
}
