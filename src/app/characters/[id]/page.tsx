import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import CharacterTracker from '@/components/CharacterTracker'

export default async function CharacterPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth')

  const [characterResult, slotsResult, inventoryResult, currencyResult, conditionsResult] = await Promise.all([
    supabase.from('characters').select('*').eq('id', id).eq('user_id', user.id).single(),
    supabase.from('spell_slots').select('*').eq('character_id', id).order('slot_level'),
    supabase.from('inventory_items').select('*').eq('character_id', id).order('created_at'),
    supabase.from('currency').select('*').eq('character_id', id).single(),
    supabase.from('conditions').select('*').eq('character_id', id).order('created_at'),
  ])

  if (!characterResult.data) notFound()

  // Ensure currency row exists
  let currency = currencyResult.data
  if (!currency) {
    const { data } = await supabase
      .from('currency')
      .insert({ character_id: id, copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 })
      .select()
      .single()
    currency = data
  }

  return (
    <CharacterTracker
      character={characterResult.data}
      spellSlots={slotsResult.data || []}
      inventoryItems={inventoryResult.data || []}
      currency={currency || { id: '', character_id: id, copper: 0, silver: 0, electrum: 0, gold: 0, platinum: 0 }}
      conditions={conditionsResult.data || []}
    />
  )
}
