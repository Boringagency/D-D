'use client'

import { useState } from 'react'
import { Condition } from '@/types/database'

const COMMON_CONDITIONS = [
  'Blinded', 'Charmed', 'Deafened', 'Exhaustion', 'Frightened',
  'Grappled', 'Incapacitated', 'Invisible', 'Paralyzed', 'Petrified',
  'Poisoned', 'Prone', 'Restrained', 'Stunned', 'Unconscious',
  'Concentration', 'Raging', 'Blessed', 'Hasted', 'Inspired',
]

interface Props {
  conditions: Condition[]
  onAdd: (name: string) => Promise<void>
  onRemove: (id: string) => Promise<void>
}

export default function ConditionsSection({ conditions, onAdd, onRemove }: Props) {
  const [showPicker, setShowPicker] = useState(false)
  const [custom, setCustom] = useState('')

  async function addCustom() {
    if (!custom.trim()) return
    await onAdd(custom.trim())
    setCustom('')
  }

  async function toggleCondition(name: string) {
    const existing = conditions.find(c => c.name === name)
    if (existing) {
      await onRemove(existing.id)
    } else {
      await onAdd(name)
    }
  }

  if (conditions.length === 0 && !showPicker) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={() => setShowPicker(true)}
          className="text-xs text-[#7a7a9a] hover:text-[#a09080] border border-[#2a2a4a] hover:border-[#4a4a6a] rounded-lg px-3 py-1.5 transition-colors"
        >
          + Add Condition
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-[#a09080] uppercase tracking-wider">🎯 Conditions</h3>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-xs text-[#7a7a9a] hover:text-[#a09080] transition-colors"
        >
          {showPicker ? 'Done' : '+ Add'}
        </button>
      </div>

      {/* Active conditions */}
      {conditions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {conditions.map(cond => (
            <button
              key={cond.id}
              onClick={() => onRemove(cond.id)}
              className="flex items-center gap-1 bg-[#8b1a1a]/30 border border-[#8b1a1a]/50 text-[#ff9a9a] text-xs px-2.5 py-1 rounded-lg hover:bg-[#8b1a1a]/50 transition-colors"
              title="Click to remove"
            >
              {cond.name} ×
            </button>
          ))}
        </div>
      )}

      {/* Condition picker */}
      {showPicker && (
        <div>
          <div className="flex flex-wrap gap-1.5 mb-3">
            {COMMON_CONDITIONS.map(name => {
              const active = conditions.some(c => c.name === name)
              return (
                <button
                  key={name}
                  onClick={() => toggleCondition(name)}
                  className={`text-xs px-2 py-1 rounded-lg border transition-colors ${
                    active
                      ? 'bg-[#8b1a1a]/30 border-[#8b1a1a]/50 text-[#ff9a9a]'
                      : 'border-[#3a3a5a] text-[#7a7a9a] hover:border-[#5a5a7a] hover:text-[#a09080]'
                  }`}
                >
                  {name}
                </button>
              )
            })}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={custom}
              onChange={e => setCustom(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustom()}
              placeholder="Custom condition..."
              className="flex-1 bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2 text-xs text-[#e8e0d0] placeholder-[#5a5a7a] focus:outline-none focus:border-[#c8a82c]"
            />
            <button
              onClick={addCustom}
              className="px-3 py-2 bg-[#c8a82c]/20 border border-[#c8a82c]/40 text-[#c8a82c] text-xs rounded-xl transition-colors"
            >
              Add
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
