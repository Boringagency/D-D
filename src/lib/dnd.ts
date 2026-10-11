import { Character } from '@/types/database'

export type Ability = 'strength' | 'dexterity' | 'constitution' | 'intelligence' | 'wisdom' | 'charisma'

export const ABILITIES: { key: Ability; short: string; label: string }[] = [
  { key: 'strength', short: 'STR', label: 'Strength' },
  { key: 'dexterity', short: 'DEX', label: 'Dexterity' },
  { key: 'constitution', short: 'CON', label: 'Constitution' },
  { key: 'intelligence', short: 'INT', label: 'Intelligence' },
  { key: 'wisdom', short: 'WIS', label: 'Wisdom' },
  { key: 'charisma', short: 'CHA', label: 'Charisma' },
]

export const SKILLS: { name: string; ability: Ability }[] = [
  { name: 'Acrobatics', ability: 'dexterity' },
  { name: 'Animal Handling', ability: 'wisdom' },
  { name: 'Arcana', ability: 'intelligence' },
  { name: 'Athletics', ability: 'strength' },
  { name: 'Deception', ability: 'charisma' },
  { name: 'History', ability: 'intelligence' },
  { name: 'Insight', ability: 'wisdom' },
  { name: 'Intimidation', ability: 'charisma' },
  { name: 'Investigation', ability: 'intelligence' },
  { name: 'Medicine', ability: 'wisdom' },
  { name: 'Nature', ability: 'intelligence' },
  { name: 'Perception', ability: 'wisdom' },
  { name: 'Performance', ability: 'charisma' },
  { name: 'Persuasion', ability: 'charisma' },
  { name: 'Religion', ability: 'intelligence' },
  { name: 'Sleight of Hand', ability: 'dexterity' },
  { name: 'Stealth', ability: 'dexterity' },
  { name: 'Survival', ability: 'wisdom' },
]

export const CLASS_SAVING_THROWS: Record<string, Ability[]> = {
  Artificer: ['constitution', 'intelligence'],
  Barbarian: ['strength', 'constitution'],
  Bard: ['dexterity', 'charisma'],
  Cleric: ['wisdom', 'charisma'],
  Druid: ['intelligence', 'wisdom'],
  Fighter: ['strength', 'constitution'],
  Monk: ['strength', 'dexterity'],
  Paladin: ['wisdom', 'charisma'],
  Ranger: ['strength', 'dexterity'],
  Rogue: ['dexterity', 'intelligence'],
  Sorcerer: ['constitution', 'charisma'],
  Warlock: ['wisdom', 'charisma'],
  Wizard: ['intelligence', 'wisdom'],
}

export type SkillLevel = 'none' | 'proficient' | 'expertise'

type ProficiencySource = Pick<
  Character,
  Ability | 'proficiency_bonus' | 'saving_throw_proficiencies' | 'skill_proficiencies' | 'skill_expertise'
>

export function abilityModifier(score: number): number {
  return Math.floor((score - 10) / 2)
}

export function formatModifier(n: number): string {
  return n >= 0 ? `+${n}` : `${n}`
}

export function saveBonus(c: ProficiencySource, ability: Ability): number {
  const prof = (c.saving_throw_proficiencies ?? []).includes(ability) ? c.proficiency_bonus : 0
  return abilityModifier(c[ability]) + prof
}

export function skillLevel(
  c: Pick<Character, 'skill_proficiencies' | 'skill_expertise'>,
  skill: string
): SkillLevel {
  if ((c.skill_expertise ?? []).includes(skill)) return 'expertise'
  if ((c.skill_proficiencies ?? []).includes(skill)) return 'proficient'
  return 'none'
}

export function skillBonus(c: ProficiencySource, skill: string): number {
  const ability = SKILLS.find(s => s.name === skill)?.ability ?? 'strength'
  const level = skillLevel(c, skill)
  const multiplier = level === 'expertise' ? 2 : level === 'proficient' ? 1 : 0
  return abilityModifier(c[ability]) + c.proficiency_bonus * multiplier
}

export function passivePerception(c: ProficiencySource): number {
  return 10 + skillBonus(c, 'Perception')
}

// Cycles none → proficient → expertise → none, returning the new arrays.
export function cycleSkill(
  c: Pick<Character, 'skill_proficiencies' | 'skill_expertise'>,
  skill: string
): Pick<Character, 'skill_proficiencies' | 'skill_expertise'> {
  const profs = (c.skill_proficiencies ?? []).filter(s => s !== skill)
  const experts = (c.skill_expertise ?? []).filter(s => s !== skill)
  const current = skillLevel(c, skill)
  if (current === 'none') profs.push(skill)
  if (current === 'proficient') experts.push(skill)
  return { skill_proficiencies: profs, skill_expertise: experts }
}

export function toggleSave(saves: string[], ability: Ability): string[] {
  return saves.includes(ability) ? saves.filter(s => s !== ability) : [...saves, ability]
}
