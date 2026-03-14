'use client'

import { useState } from 'react'
import { Character } from '@/types/database'

interface Props {
  character: Character
  onShortRest: (hpGained: number) => Promise<void>
  onLongRest: () => Promise<void>
}

export default function RestButtons({ character, onShortRest, onLongRest }: Props) {
  const [loading, setLoading] = useState<'short' | 'long' | null>(null)
  const [showLongConfirm, setShowLongConfirm] = useState(false)
  const [showHitDice, setShowHitDice] = useState(false)

  async function handleShortRest() {
    setShowHitDice(true)
  }

  async function handleLongRest() {
    setLoading('long')
    await onLongRest()
    setLoading(null)
    setShowLongConfirm(false)
  }

  return (
    <>
      <div className="flex gap-3">
        <button
          onClick={handleShortRest}
          disabled={loading !== null}
          className="flex-1 bg-[#2a4a2a]/60 hover:bg-[#2a4a2a]/90 border border-[#4a6a4a]/60 text-[#8adf8a] font-bold py-3 rounded-xl transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2"
        >
          <span>🌙</span>
          <span>Short Rest</span>
        </button>
        <button
          onClick={() => setShowLongConfirm(true)}
          disabled={loading !== null}
          className="flex-1 bg-[#2a2a6a]/60 hover:bg-[#2a2a6a]/90 border border-[#4a4a8a]/60 text-[#8a8adf] font-bold py-3 rounded-xl transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2"
        >
          <span>⭐</span>
          <span>Long Rest</span>
        </button>
      </div>

      {/* Short rest - hit dice dialog */}
      {showHitDice && (
        <HitDiceDialog
          character={character}
          onClose={() => setShowHitDice(false)}
          onRest={async (hpGained, diceUsed) => {
            setLoading('short')
            setShowHitDice(false)
            await onShortRest(hpGained)
            setLoading(null)
          }}
        />
      )}

      {/* Long rest confirm */}
      {showLongConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-2xl p-6 w-full max-w-xs">
            <div className="text-3xl text-center mb-3">⭐</div>
            <h3 className="font-bold text-[#e8e0d0] text-center mb-2">Long Rest</h3>
            <div className="text-[#a09080] text-sm text-center mb-4 space-y-1">
              <p>This will restore:</p>
              <p className="text-[#4adf4a]">• Full HP ({character.max_hp})</p>
              <p className="text-[#6ab0ff]">• All spell slots</p>
              <p className="text-[#c8a82c]">• Hit dice (up to half max)</p>
              <p className="text-[#a09080]">• Clear death saves</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLongConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#3a3a5a] text-[#a09080] text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleLongRest}
                disabled={loading === 'long'}
                className="flex-1 py-2.5 rounded-xl bg-[#2a2a6a] hover:bg-[#3a3a8a] text-[#8a8adf] font-bold text-sm transition-colors"
              >
                {loading === 'long' ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-3 h-3 border-2 border-[#8a8adf]/30 border-t-[#8a8adf] rounded-full animate-spin" />
                    Resting...
                  </span>
                ) : 'Rest'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

function HitDiceDialog({
  character,
  onClose,
  onRest,
}: {
  character: Character
  onClose: () => void
  onRest: (hpGained: number, diceUsed: number) => Promise<void>
}) {
  const [diceUsed, setDiceUsed] = useState(0)
  const [rolledHp, setRolledHp] = useState(0)
  const [rolling, setRolling] = useState(false)

  const diceMax = parseInt(character.hit_dice_type.slice(1)) || 8
  const available = character.hit_dice_current

  function rollDie() {
    return Math.floor(Math.random() * diceMax) + 1
  }

  function addDie() {
    if (diceUsed >= available) return
    const roll = rollDie()
    setDiceUsed(prev => prev + 1)
    setRolledHp(prev => prev + roll)
    setRolling(true)
    setTimeout(() => setRolling(false), 300)
  }

  async function confirm() {
    await onRest(rolledHp, diceUsed)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-2xl p-6 w-full max-w-xs">
        <div className="text-3xl text-center mb-3">🌙</div>
        <h3 className="font-bold text-[#e8e0d0] text-center mb-1">Short Rest</h3>
        <p className="text-[#a09080] text-xs text-center mb-4">
          Spend hit dice to recover HP
        </p>

        <div className="bg-[#0d0d1a] rounded-xl p-4 mb-4 text-center">
          <div className="text-3xl font-bold text-[#c8a82c] font-mono">+{rolledHp}</div>
          <div className="text-xs text-[#7a7a9a] mt-1">HP to recover</div>
          <div className="text-xs text-[#a09080] mt-2">
            {diceUsed}/{available} {character.hit_dice_type} used
          </div>
        </div>

        <button
          onClick={addDie}
          disabled={diceUsed >= available}
          className={`w-full py-3 rounded-xl font-bold text-sm mb-3 transition-all ${
            diceUsed < available
              ? 'bg-[#2a4a2a]/60 hover:bg-[#2a4a2a]/90 border border-[#4a6a4a]/60 text-[#8adf8a] active:scale-[0.98]'
              : 'bg-[#2a2a3a] text-[#5a5a7a] cursor-not-allowed'
          } ${rolling ? 'scale-105' : ''}`}
        >
          🎲 Roll {character.hit_dice_type}
          {diceUsed < available ? ` (${available - diceUsed} left)` : ' (none left)'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-[#3a3a5a] text-[#a09080] text-sm transition-colors"
          >
            Skip
          </button>
          <button
            onClick={confirm}
            className="flex-1 py-2.5 rounded-xl bg-[#2a4a2a] hover:bg-[#3a6a3a] text-[#8adf8a] font-bold text-sm transition-colors"
          >
            Done (+{rolledHp} HP)
          </button>
        </div>
      </div>
    </div>
  )
}
