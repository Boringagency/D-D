'use client'

import { useState } from 'react'
import { Character } from '@/types/database'
import {
  ABILITIES,
  SKILLS,
  Ability,
  abilityModifier,
  formatModifier,
  saveBonus,
  skillBonus,
  skillLevel,
  passivePerception,
  cycleSkill,
  toggleSave,
} from '@/lib/dnd'

interface Props {
  character: Character
  onUpdate: (updates: Partial<Character>) => Promise<void>
}

export default function AbilityScoresSection({ character, onUpdate }: Props) {
  const [editing, setEditing] = useState<Ability | null>(null)
  const [scoreInput, setScoreInput] = useState('')

  function startEdit(ability: Ability) {
    setEditing(ability)
    setScoreInput(String(character[ability]))
  }

  function saveScore() {
    if (!editing) return
    const value = parseInt(scoreInput)
    if (!isNaN(value)) {
      onUpdate({ [editing]: Math.max(1, Math.min(30, value)) })
    }
    setEditing(null)
  }

  const saves = character.saving_throw_proficiencies ?? []

  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-4 space-y-4">
      <div>
        <h3 className="text-xs font-bold text-[#a09080] uppercase tracking-wider mb-3">Ability Scores</h3>
        <div className="grid grid-cols-3 gap-3">
          {ABILITIES.map(a => (
            <button
              key={a.key}
              onClick={() => startEdit(a.key)}
              className="bg-[#0d0d1a] rounded-xl p-2.5 text-center hover:ring-1 hover:ring-[#c8a82c]/50 transition-all"
            >
              <div className="text-[#7a7a9a] text-xs">{a.short}</div>
              <div className="text-[#c8a82c] font-bold text-xl">{formatModifier(abilityModifier(character[a.key]))}</div>
              <div className="text-[#a09080] text-xs font-mono">{character[a.key]}</div>
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-xs font-bold text-[#a09080] uppercase tracking-wider mb-2">Saving Throws</h3>
        <div className="grid grid-cols-2 gap-x-4">
          {ABILITIES.map(a => (
            <button
              key={a.key}
              onClick={() => onUpdate({ saving_throw_proficiencies: toggleSave(saves, a.key) })}
              className="flex items-center gap-2 py-1 text-sm text-left"
            >
              <ProfDot level={saves.includes(a.key) ? 'proficient' : 'none'} />
              <span className="w-8 font-mono text-[#c8a82c]">{formatModifier(saveBonus(character, a.key))}</span>
              <span className="text-[#e8e0d0]">{a.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-2">
          <h3 className="text-xs font-bold text-[#a09080] uppercase tracking-wider">Skills</h3>
          <span className="text-[#5a5a7a] text-xs">tap: none → prof → expertise</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
          {SKILLS.map(s => (
            <button
              key={s.name}
              onClick={() => onUpdate(cycleSkill(character, s.name))}
              className="flex items-center gap-2 py-1 text-sm text-left"
            >
              <ProfDot level={skillLevel(character, s.name)} />
              <span className="w-8 font-mono text-[#c8a82c]">{formatModifier(skillBonus(character, s.name))}</span>
              <span className="text-[#e8e0d0]">{s.name}</span>
              <span className="text-[#5a5a7a] text-xs">
                ({ABILITIES.find(a => a.key === s.ability)?.short})
              </span>
            </button>
          ))}
        </div>
        <div className="mt-3 bg-[#0d0d1a] rounded-xl px-3 py-2 flex items-center justify-between">
          <span className="text-[#7a7a9a] text-xs">Passive Perception</span>
          <span className="text-[#c8a82c] font-bold">{passivePerception(character)}</span>
        </div>
      </div>

      {editing && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-2xl p-6 w-full max-w-xs">
            <h3 className="font-bold text-[#e8e0d0] text-center mb-4">
              {ABILITIES.find(a => a.key === editing)?.label}
            </h3>
            <input
              type="number"
              min={1}
              max={30}
              autoFocus
              value={scoreInput}
              onChange={e => setScoreInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && saveScore()}
              className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-center text-2xl font-bold text-[#e8e0d0] focus:outline-none focus:border-[#c8a82c] mb-2"
            />
            <div className="text-center text-sm text-[#a09080] mb-4">
              Modifier: {formatModifier(abilityModifier(parseInt(scoreInput) || 10))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setEditing(null)}
                className="flex-1 py-2.5 rounded-xl border border-[#3a3a5a] text-[#a09080] text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveScore}
                className="flex-1 py-2.5 rounded-xl bg-[#c8a82c] hover:bg-[#a08020] text-[#0d0d1a] font-bold text-sm transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfDot({ level }: { level: 'none' | 'proficient' | 'expertise' }) {
  if (level === 'expertise') {
    return (
      <span className="w-3 h-3 rounded-full bg-[#c8a82c] ring-2 ring-[#c8a82c]/40 ring-offset-1 ring-offset-[#1a1a2e] flex-shrink-0" />
    )
  }
  return (
    <span
      className={`w-3 h-3 rounded-full border flex-shrink-0 ${
        level === 'proficient' ? 'bg-[#c8a82c] border-[#c8a82c]' : 'border-[#5a5a7a]'
      }`}
    />
  )
}
