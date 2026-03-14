'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Character, SpellSlot, InventoryItem, Currency, Condition } from '@/types/database'
import HPSection from './tracker/HPSection'
import SpellSlotsSection from './tracker/SpellSlotsSection'
import InventorySection from './tracker/InventorySection'
import CurrencySection from './tracker/CurrencySection'
import ConditionsSection from './tracker/ConditionsSection'
import RestButtons from './tracker/RestButtons'

type Tab = 'combat' | 'spells' | 'inventory' | 'notes'

interface Props {
  character: Character
  spellSlots: SpellSlot[]
  inventoryItems: InventoryItem[]
  currency: Currency
  conditions: Condition[]
}

export default function CharacterTracker({
  character: initialCharacter,
  spellSlots: initialSlots,
  inventoryItems: initialInventory,
  currency: initialCurrency,
  conditions: initialConditions,
}: Props) {
  const [character, setCharacter] = useState(initialCharacter)
  const [spellSlots, setSpellSlots] = useState(initialSlots)
  const [inventory, setInventory] = useState(initialInventory)
  const [currency, setCurrency] = useState(initialCurrency)
  const [conditions, setConditions] = useState(initialConditions)
  const [activeTab, setActiveTab] = useState<Tab>('combat')
  const [saving, setSaving] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const supabase = createClient()
  const router = useRouter()

  const hpPct = character.max_hp > 0 ? character.current_hp / character.max_hp : 0
  const isLowHp = hpPct <= 0.25 && character.current_hp > 0
  const isDead = character.current_hp <= 0

  async function updateCharacter(updates: Partial<Character>) {
    setCharacter(prev => ({ ...prev, ...updates }))
    setSaving(true)
    await supabase.from('characters').update(updates).eq('id', character.id)
    setSaving(false)
  }

  async function updateSpellSlot(slotId: string, updates: Partial<SpellSlot>) {
    setSpellSlots(prev => prev.map(s => s.id === slotId ? { ...s, ...updates } : s))
    await supabase.from('spell_slots').update(updates).eq('id', slotId)
  }

  async function addInventoryItem(item: Omit<InventoryItem, 'id' | 'created_at'>) {
    const { data } = await supabase.from('inventory_items').insert(item).select().single()
    if (data) setInventory(prev => [...prev, data])
  }

  async function updateInventoryItem(itemId: string, updates: Partial<InventoryItem>) {
    setInventory(prev => prev.map(i => i.id === itemId ? { ...i, ...updates } : i))
    await supabase.from('inventory_items').update(updates).eq('id', itemId)
  }

  async function deleteInventoryItem(itemId: string) {
    setInventory(prev => prev.filter(i => i.id !== itemId))
    await supabase.from('inventory_items').delete().eq('id', itemId)
  }

  async function updateCurrency(updates: Partial<Currency>) {
    setCurrency(prev => ({ ...prev, ...updates }))
    await supabase.from('currency').update(updates).eq('character_id', character.id)
  }

  async function addCondition(name: string) {
    const { data } = await supabase
      .from('conditions')
      .insert({ character_id: character.id, name })
      .select()
      .single()
    if (data) setConditions(prev => [...prev, data])
  }

  async function removeCondition(id: string) {
    setConditions(prev => prev.filter(c => c.id !== id))
    await supabase.from('conditions').delete().eq('id', id)
  }

  const handleShortRest = useCallback(async (hpGained: number) => {
    const updates: Partial<Character> = {}
    if (hpGained > 0) {
      updates.current_hp = Math.min(character.max_hp, character.current_hp + hpGained)
    }

    // Recover warlock spell slots on short rest
    const slotUpdates: { id: string }[] = []
    if (character.class === 'Warlock') {
      spellSlots.forEach(slot => {
        if (slot.used_slots > 0) slotUpdates.push({ id: slot.id })
      })
    }

    if (Object.keys(updates).length > 0) await updateCharacter(updates)
    for (const su of slotUpdates) {
      await updateSpellSlot(su.id, { used_slots: 0 })
    }
    if (slotUpdates.length > 0) {
      setSpellSlots(prev => prev.map(s =>
        slotUpdates.find(u => u.id === s.id) ? { ...s, used_slots: 0 } : s
      ))
    }
  }, [character, spellSlots])

  const handleLongRest = useCallback(async () => {
    // Long rest: full HP, all spell slots, all hit dice (up to half max back)
    const newHp = character.max_hp
    const newHitDice = Math.min(
      character.hit_dice_total,
      character.hit_dice_current + Math.max(1, Math.floor(character.hit_dice_total / 2))
    )

    await updateCharacter({
      current_hp: newHp,
      temp_hp: 0,
      hit_dice_current: newHitDice,
      death_save_successes: 0,
      death_save_failures: 0,
    })

    // Recover all spell slots
    const slotUpdates: { id: string; used_slots: number }[] = []
    spellSlots.forEach(slot => {
      if (slot.used_slots > 0) {
        slotUpdates.push({ id: slot.id, used_slots: 0 })
      }
    })
    for (const su of slotUpdates) {
      await updateSpellSlot(su.id, { used_slots: 0 })
    }
    setSpellSlots(prev => prev.map(s => ({ ...s, used_slots: 0 })))
    setCharacter(prev => ({
      ...prev,
      current_hp: newHp,
      temp_hp: 0,
      hit_dice_current: newHitDice,
      death_save_successes: 0,
      death_save_failures: 0,
    }))
  }, [character, spellSlots])

  async function deleteCharacter() {
    await supabase.from('characters').delete().eq('id', character.id)
    router.push('/characters')
  }

  const hasSpells = spellSlots.length > 0
  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: 'combat', label: 'Combat', icon: '⚔️' },
    ...(hasSpells ? [{ key: 'spells' as Tab, label: 'Spells', icon: '✨' }] : []),
    { key: 'inventory', label: 'Inventory', icon: '🎒' },
    { key: 'notes', label: 'Notes', icon: '📝' },
  ]

  return (
    <div className="min-h-screen bg-[#0d0d1a]">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0d0d1a]/95 backdrop-blur border-b border-[#2a2a4a]">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <Link href="/characters" className="text-[#a09080] hover:text-[#e8e0d0] flex-shrink-0 transition-colors">
              ←
            </Link>
            <div className="min-w-0">
              <h1 className="font-bold text-[#e8e0d0] truncate">{character.name}</h1>
              <p className="text-xs text-[#a09080] truncate">
                Lvl {character.level} {character.race} {character.class}
                {character.subclass ? ` (${character.subclass})` : ''}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {saving && <span className="text-xs text-[#7a7a9a] animate-pulse">Saving…</span>}
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="text-[#7a7a9a] hover:text-[#ff6b6b] text-xs px-2 py-1 rounded-lg transition-colors"
            >
              🗑️
            </button>
          </div>
        </div>

        {/* HP bar in header */}
        <div className="max-w-2xl mx-auto px-4 pb-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-[#1a1a2e] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  isDead ? 'bg-[#ff4444]' :
                  isLowHp ? 'bg-[#ff6b6b]' :
                  hpPct <= 0.5 ? 'bg-[#ffaa44]' : 'bg-[#4adf4a]'
                } ${isLowHp ? 'low-hp' : ''}`}
                style={{ width: `${Math.max(0, Math.min(100, hpPct * 100))}%` }}
              />
            </div>
            <span className={`text-xs font-mono font-bold ${
              isDead ? 'text-[#ff4444]' :
              isLowHp ? 'text-[#ff6b6b]' :
              hpPct <= 0.5 ? 'text-[#ffaa44]' : 'text-[#4adf4a]'
            }`}>
              {character.current_hp}/{character.max_hp}
              {character.temp_hp > 0 && <span className="text-[#6ab0ff]"> +{character.temp_hp}</span>}
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto flex border-t border-[#2a2a4a]">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
                activeTab === tab.key
                  ? 'text-[#c8a82c] border-b-2 border-[#c8a82c]'
                  : 'text-[#7a7a9a] hover:text-[#a09080]'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-4 space-y-4">
        {activeTab === 'combat' && (
          <>
            <HPSection character={character} onUpdate={updateCharacter} />
            <ConditionsSection conditions={conditions} onAdd={addCondition} onRemove={removeCondition} />
            <RestButtons
              character={character}
              onShortRest={handleShortRest}
              onLongRest={handleLongRest}
            />
            {/* Combat stats quick view */}
            <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-4">
              <h3 className="text-xs font-bold text-[#a09080] uppercase tracking-wider mb-3">Combat Stats</h3>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'AC', value: character.armor_class },
                  { label: 'Initiative', value: (character.initiative >= 0 ? '+' : '') + character.initiative },
                  { label: 'Speed', value: `${character.speed}ft` },
                  { label: 'Prof. Bonus', value: `+${character.proficiency_bonus}` },
                  { label: 'Hit Dice', value: `${character.hit_dice_current}/${character.hit_dice_total}${character.hit_dice_type}` },
                ].map(stat => (
                  <div key={stat.label} className="bg-[#0d0d1a] rounded-xl p-2.5 text-center">
                    <div className="text-[#c8a82c] font-bold text-base">{stat.value}</div>
                    <div className="text-[#7a7a9a] text-xs mt-0.5">{stat.label}</div>
                  </div>
                ))}

                {/* Death saves */}
                <div className="bg-[#0d0d1a] rounded-xl p-2.5">
                  <div className="text-[#7a7a9a] text-xs mb-1 text-center">Death Saves</div>
                  <div className="flex justify-center gap-1 mb-1">
                    {[0,1,2].map(i => (
                      <button
                        key={i}
                        onClick={() => updateCharacter({
                          death_save_successes: character.death_save_successes === i + 1 ? i : i + 1
                        })}
                        className={`w-4 h-4 rounded-full border transition-colors ${
                          i < character.death_save_successes
                            ? 'bg-[#4adf4a] border-[#4adf4a]'
                            : 'border-[#4adf4a]/40'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex justify-center gap-1">
                    {[0,1,2].map(i => (
                      <button
                        key={i}
                        onClick={() => updateCharacter({
                          death_save_failures: character.death_save_failures === i + 1 ? i : i + 1
                        })}
                        className={`w-4 h-4 rounded-full border transition-colors ${
                          i < character.death_save_failures
                            ? 'bg-[#ff4444] border-[#ff4444]'
                            : 'border-[#ff4444]/40'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'spells' && (
          <SpellSlotsSection spellSlots={spellSlots} onUpdate={updateSpellSlot} />
        )}

        {activeTab === 'inventory' && (
          <>
            <CurrencySection currency={currency} onUpdate={updateCurrency} />
            <InventorySection
              characterId={character.id}
              items={inventory}
              onAdd={addInventoryItem}
              onUpdate={updateInventoryItem}
              onDelete={deleteInventoryItem}
            />
          </>
        )}

        {activeTab === 'notes' && (
          <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-4">
            <h3 className="text-xs font-bold text-[#a09080] uppercase tracking-wider mb-3">📝 Notes</h3>
            <textarea
              value={character.notes || ''}
              onChange={e => setCharacter(prev => ({ ...prev, notes: e.target.value }))}
              onBlur={() => updateCharacter({ notes: character.notes })}
              placeholder="Character notes, backstory, quest logs..."
              rows={12}
              className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2.5 text-sm text-[#e8e0d0] placeholder-[#5a5a7a] focus:outline-none focus:border-[#c8a82c] resize-none"
            />
          </div>
        )}
      </main>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1a1a2e] border border-[#3a3a5a] rounded-2xl p-6 w-full max-w-xs">
            <h3 className="font-bold text-[#e8e0d0] mb-2">Delete Character?</h3>
            <p className="text-[#a09080] text-sm mb-4">
              &ldquo;{character.name}&rdquo; will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#3a3a5a] text-[#a09080] hover:text-[#e8e0d0] text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={deleteCharacter}
                className="flex-1 py-2.5 rounded-xl bg-[#8b1a1a] hover:bg-[#6b0f0f] text-white text-sm font-bold transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
