-- Ability scores, saving throw & skill proficiencies
-- Run this once in the Supabase SQL editor for databases created before this migration.

alter table public.characters
  add column if not exists strength integer not null default 10 check (strength between 1 and 30),
  add column if not exists dexterity integer not null default 10 check (dexterity between 1 and 30),
  add column if not exists constitution integer not null default 10 check (constitution between 1 and 30),
  add column if not exists intelligence integer not null default 10 check (intelligence between 1 and 30),
  add column if not exists wisdom integer not null default 10 check (wisdom between 1 and 30),
  add column if not exists charisma integer not null default 10 check (charisma between 1 and 30),
  add column if not exists saving_throw_proficiencies text[] not null default '{}',
  add column if not exists skill_proficiencies text[] not null default '{}',
  add column if not exists skill_expertise text[] not null default '{}';
