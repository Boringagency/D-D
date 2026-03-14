'use client'

import { useState } from 'react'
import { Currency } from '@/types/database'

interface Props {
  currency: Currency
  onUpdate: (updates: Partial<Currency>) => Promise<void>
}

const COINS = [
  { key: 'platinum' as const, label: 'PP', color: 'text-[#e0e0ff]', bg: 'bg-[#4a4aaa]/20', border: 'border-[#4a4aaa]/40', symbol: '🔵' },
  { key: 'gold' as const, label: 'GP', color: 'text-[#c8a82c]', bg: 'bg-[#8a6a0a]/20', border: 'border-[#8a6a0a]/40', symbol: '🟡' },
  { key: 'electrum' as const, label: 'EP', color: 'text-[#8affaa]', bg: 'bg-[#0a8a4a]/20', border: 'border-[#0a8a4a]/40', symbol: '🟢' },
  { key: 'silver' as const, label: 'SP', color: 'text-[#c0c0c0]', bg: 'bg-[#6a6a6a]/20', border: 'border-[#6a6a6a]/40', symbol: '⚪' },
  { key: 'copper' as const, label: 'CP', color: 'text-[#d08050]', bg: 'bg-[#8a4a0a]/20', border: 'border-[#8a4a0a]/40', symbol: '🟤' },
]

export default function CurrencySection({ currency, onUpdate }: Props) {
  const [editing, setEditing] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')

  function startEdit(key: string, current: number) {
    setEditing(key)
    setEditValue(String(current))
  }

  function commitEdit(key: keyof Currency) {
    const val = parseInt(editValue)
    if (!isNaN(val) && val >= 0) {
      onUpdate({ [key]: val })
    }
    setEditing(null)
  }

  function adjust(key: keyof Currency, delta: number) {
    const current = currency[key] as number
    const newVal = Math.max(0, current + delta)
    onUpdate({ [key]: newVal })
  }

  // Total in GP
  const totalGP = (
    currency.platinum * 10 +
    currency.gold +
    currency.electrum * 0.5 +
    currency.silver * 0.1 +
    currency.copper * 0.01
  ).toFixed(2)

  return (
    <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-bold text-[#a09080] uppercase tracking-wider">💰 Currency</h3>
        <span className="text-xs text-[#7a7a9a]">{totalGP} GP total</span>
      </div>

      <div className="space-y-2">
        {COINS.map(coin => (
          <div key={coin.key} className={`flex items-center gap-3 ${coin.bg} border ${coin.border} rounded-xl px-3 py-2`}>
            <span className="text-base flex-shrink-0">{coin.symbol}</span>
            <span className={`text-xs font-bold w-7 flex-shrink-0 ${coin.color}`}>{coin.label}</span>
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => adjust(coin.key, -10)}
                className="w-7 h-7 rounded-lg bg-[#0d0d1a]/60 text-[#a09080] hover:text-[#e8e0d0] text-xs transition-colors"
              >
                -10
              </button>
              <button
                onClick={() => adjust(coin.key, -1)}
                className="w-6 h-6 rounded-lg bg-[#0d0d1a]/60 text-[#a09080] hover:text-[#e8e0d0] text-sm transition-colors"
              >
                −
              </button>
            </div>

            {editing === coin.key ? (
              <input
                type="number"
                min={0}
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                onBlur={() => commitEdit(coin.key)}
                onKeyDown={e => { if (e.key === 'Enter') commitEdit(coin.key) }}
                className="flex-1 bg-[#0d0d1a] border border-[#c8a82c] rounded-lg px-2 py-1 text-sm text-[#e8e0d0] text-center focus:outline-none font-mono"
                autoFocus
              />
            ) : (
              <button
                onClick={() => startEdit(coin.key, currency[coin.key] as number)}
                className={`flex-1 text-center font-mono font-bold text-sm ${coin.color} hover:opacity-80 transition-opacity`}
              >
                {currency[coin.key]}
              </button>
            )}

            <div className="flex items-center gap-1.5 flex-shrink-0">
              <button
                onClick={() => adjust(coin.key, 1)}
                className="w-6 h-6 rounded-lg bg-[#0d0d1a]/60 text-[#a09080] hover:text-[#e8e0d0] text-sm transition-colors"
              >
                +
              </button>
              <button
                onClick={() => adjust(coin.key, 10)}
                className="w-7 h-7 rounded-lg bg-[#0d0d1a]/60 text-[#a09080] hover:text-[#e8e0d0] text-xs transition-colors"
              >
                +10
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
