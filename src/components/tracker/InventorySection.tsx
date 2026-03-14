'use client'

import { useState } from 'react'
import { InventoryItem } from '@/types/database'

interface Props {
  characterId: string
  items: InventoryItem[]
  onAdd: (item: Omit<InventoryItem, 'id' | 'created_at'>) => Promise<void>
  onUpdate: (id: string, updates: Partial<InventoryItem>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export default function InventorySection({ characterId, items, onAdd, onUpdate, onDelete }: Props) {
  const [showAdd, setShowAdd] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, weight: 0, notes: '' })
  const [expandedId, setExpandedId] = useState<string | null>(null)

  async function handleAdd() {
    if (!newItem.name.trim()) return
    await onAdd({
      character_id: characterId,
      name: newItem.name.trim(),
      quantity: newItem.quantity,
      weight: newItem.weight,
      equipped: false,
      notes: newItem.notes,
    })
    setNewItem({ name: '', quantity: 1, weight: 0, notes: '' })
    setShowAdd(false)
  }

  const totalWeight = items.reduce((sum, i) => sum + (i.weight * i.quantity), 0)
  const equipped = items.filter(i => i.equipped)
  const unequipped = items.filter(i => !i.equipped)

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#a09080]">🎒 Inventory</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#7a7a9a]">{totalWeight.toFixed(1)} lb</span>
          <button
            onClick={() => setShowAdd(!showAdd)}
            className="text-xs bg-[#c8a82c]/20 hover:bg-[#c8a82c]/40 border border-[#c8a82c]/40 text-[#c8a82c] px-2.5 py-1 rounded-lg transition-colors"
          >
            + Add
          </button>
        </div>
      </div>

      {/* Add item form */}
      {showAdd && (
        <div className="bg-[#1a1a2e] border border-[#c8a82c]/30 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-[#c8a82c] mb-3">Add Item</h4>
          <div className="space-y-2">
            <input
              type="text"
              value={newItem.name}
              onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Item name *"
              className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2 text-sm text-[#e8e0d0] placeholder-[#5a5a7a] focus:outline-none focus:border-[#c8a82c]"
              autoFocus
            />
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs text-[#7a7a9a] mb-1">Qty</label>
                <input
                  type="number"
                  min={0}
                  value={newItem.quantity}
                  onChange={e => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                  className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2 text-sm text-[#e8e0d0] focus:outline-none focus:border-[#c8a82c]"
                />
              </div>
              <div className="flex-1">
                <label className="block text-xs text-[#7a7a9a] mb-1">Weight (lb)</label>
                <input
                  type="number"
                  min={0}
                  step={0.1}
                  value={newItem.weight}
                  onChange={e => setNewItem(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                  className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2 text-sm text-[#e8e0d0] focus:outline-none focus:border-[#c8a82c]"
                />
              </div>
            </div>
            <input
              type="text"
              value={newItem.notes}
              onChange={e => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Notes (optional)"
              className="w-full bg-[#0d0d1a] border border-[#3a3a5a] rounded-xl px-3 py-2 text-sm text-[#e8e0d0] placeholder-[#5a5a7a] focus:outline-none focus:border-[#c8a82c]"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowAdd(false)}
                className="flex-1 py-2 rounded-xl border border-[#3a3a5a] text-[#a09080] text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="flex-1 py-2 rounded-xl bg-[#c8a82c] hover:bg-[#a08020] text-[#0d0d1a] text-sm font-bold transition-colors"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {items.length === 0 && !showAdd && (
        <div className="bg-[#1a1a2e] border border-[#2a2a4a] rounded-2xl p-8 text-center">
          <div className="text-4xl mb-3">🎒</div>
          <p className="text-[#a09080] text-sm">Your inventory is empty.</p>
        </div>
      )}

      {/* Equipped items */}
      {equipped.length > 0 && (
        <div>
          <div className="text-xs text-[#7a7a9a] mb-2 flex items-center gap-1">
            <span>⚔️</span> Equipped ({equipped.length})
          </div>
          <div className="space-y-2">
            {equipped.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                expanded={expandedId === item.id}
                onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unequipped items */}
      {unequipped.length > 0 && (
        <div>
          {equipped.length > 0 && (
            <div className="text-xs text-[#7a7a9a] mb-2 flex items-center gap-1">
              <span>📦</span> Pack ({unequipped.length})
            </div>
          )}
          <div className="space-y-2">
            {unequipped.map(item => (
              <ItemRow
                key={item.id}
                item={item}
                expanded={expandedId === item.id}
                onToggleExpand={() => setExpandedId(expandedId === item.id ? null : item.id)}
                onUpdate={onUpdate}
                onDelete={onDelete}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function ItemRow({
  item,
  expanded,
  onToggleExpand,
  onUpdate,
  onDelete,
}: {
  item: InventoryItem
  expanded: boolean
  onToggleExpand: () => void
  onUpdate: (id: string, updates: Partial<InventoryItem>) => Promise<void>
  onDelete: (id: string) => Promise<void>
}) {
  return (
    <div className={`bg-[#1a1a2e] border rounded-xl overflow-hidden transition-colors ${
      item.equipped ? 'border-[#c8a82c]/30' : 'border-[#2a2a4a]'
    }`}>
      <div
        className="flex items-center gap-3 px-3 py-2.5 cursor-pointer"
        onClick={onToggleExpand}
      >
        <button
          onClick={e => { e.stopPropagation(); onUpdate(item.id, { equipped: !item.equipped }) }}
          className={`w-6 h-6 rounded-md border flex-shrink-0 flex items-center justify-center text-xs transition-colors ${
            item.equipped
              ? 'bg-[#c8a82c] border-[#c8a82c] text-[#0d0d1a]'
              : 'border-[#4a4a6a] text-transparent'
          }`}
          title="Toggle equipped"
        >
          ✓
        </button>
        <span className="flex-1 text-sm text-[#e8e0d0] truncate">{item.name}</span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={e => { e.stopPropagation(); onUpdate(item.id, { quantity: Math.max(0, item.quantity - 1) }) }}
            className="w-6 h-6 rounded bg-[#2a2a4a] text-[#a09080] hover:text-[#e8e0d0] text-sm transition-colors"
          >
            −
          </button>
          <span className="text-sm text-[#e8e0d0] w-6 text-center font-mono">{item.quantity}</span>
          <button
            onClick={e => { e.stopPropagation(); onUpdate(item.id, { quantity: item.quantity + 1 }) }}
            className="w-6 h-6 rounded bg-[#2a2a4a] text-[#a09080] hover:text-[#e8e0d0] text-sm transition-colors"
          >
            +
          </button>
        </div>
        <span className="text-[#7a7a9a] text-xs flex-shrink-0">{expanded ? '▲' : '▼'}</span>
      </div>

      {expanded && (
        <div className="px-3 pb-3 pt-0 border-t border-[#2a2a4a] mt-0">
          <div className="flex items-center gap-2 mt-2.5 text-xs text-[#7a7a9a]">
            {item.weight > 0 && <span>{(item.weight * item.quantity).toFixed(1)} lb total</span>}
            {item.notes && <span className="text-[#a09080]">• {item.notes}</span>}
          </div>
          <button
            onClick={() => onDelete(item.id)}
            className="mt-2.5 text-xs text-[#7a7a9a] hover:text-[#ff6b6b] transition-colors"
          >
            🗑️ Remove
          </button>
        </div>
      )}
    </div>
  )
}
