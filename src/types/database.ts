export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      characters: {
        Row: Character
        Insert: CharacterInsert
        Update: CharacterUpdate
      }
      spell_slots: {
        Row: SpellSlot
        Insert: SpellSlotInsert
        Update: SpellSlotUpdate
      }
      inventory_items: {
        Row: InventoryItem
        Insert: InventoryItemInsert
        Update: InventoryItemUpdate
      }
      currency: {
        Row: Currency
        Insert: CurrencyInsert
        Update: CurrencyUpdate
      }
      conditions: {
        Row: Condition
        Insert: ConditionInsert
        Update: ConditionUpdate
      }
    }
  }
}

export interface Character {
  id: string
  user_id: string
  name: string
  class: string
  subclass: string | null
  race: string
  level: number
  background: string | null
  alignment: string | null
  max_hp: number
  current_hp: number
  temp_hp: number
  armor_class: number
  initiative: number
  speed: number
  proficiency_bonus: number
  death_save_successes: number
  death_save_failures: number
  hit_dice_total: number
  hit_dice_current: number
  hit_dice_type: string
  notes: string
  created_at: string
  updated_at: string
}

export type CharacterInsert = Omit<Character, 'id' | 'created_at' | 'updated_at'>
export type CharacterUpdate = Partial<CharacterInsert>

export interface SpellSlot {
  id: string
  character_id: string
  slot_level: number
  max_slots: number
  used_slots: number
}

export type SpellSlotInsert = Omit<SpellSlot, 'id'>
export type SpellSlotUpdate = Partial<SpellSlotInsert>

export interface InventoryItem {
  id: string
  character_id: string
  name: string
  quantity: number
  weight: number
  equipped: boolean
  notes: string
  created_at: string
}

export type InventoryItemInsert = Omit<InventoryItem, 'id' | 'created_at'>
export type InventoryItemUpdate = Partial<InventoryItemInsert>

export interface Currency {
  id: string
  character_id: string
  copper: number
  silver: number
  electrum: number
  gold: number
  platinum: number
}

export type CurrencyInsert = Omit<Currency, 'id'>
export type CurrencyUpdate = Partial<CurrencyInsert>

export interface Condition {
  id: string
  character_id: string
  name: string
  created_at: string
}

export type ConditionInsert = Omit<Condition, 'id' | 'created_at'>
export type ConditionUpdate = Partial<ConditionInsert>

export interface CharacterWithRelations extends Character {
  spell_slots: SpellSlot[]
  inventory_items: InventoryItem[]
  currency: Currency | null
  conditions: Condition[]
}
