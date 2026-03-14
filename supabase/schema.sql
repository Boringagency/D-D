-- D&D 5e Character Tracker Schema

-- Enable RLS
create extension if not exists "uuid-ossp";

-- Characters table
create table if not exists public.characters (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  class text not null,
  subclass text,
  race text not null,
  level integer not null default 1 check (level between 1 and 20),
  background text,
  alignment text,
  -- HP
  max_hp integer not null default 10 check (max_hp > 0),
  current_hp integer not null default 10,
  temp_hp integer not null default 0 check (temp_hp >= 0),
  -- Stats
  armor_class integer not null default 10,
  initiative integer not null default 0,
  speed integer not null default 30,
  proficiency_bonus integer not null default 2,
  -- Death saves
  death_save_successes integer not null default 0 check (death_save_successes between 0 and 3),
  death_save_failures integer not null default 0 check (death_save_failures between 0 and 3),
  -- Hit dice
  hit_dice_total integer not null default 1,
  hit_dice_current integer not null default 1,
  hit_dice_type text not null default 'd8',
  -- Notes
  notes text default '',
  -- Timestamps
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Spell slots table
create table if not exists public.spell_slots (
  id uuid default uuid_generate_v4() primary key,
  character_id uuid references public.characters(id) on delete cascade not null,
  slot_level integer not null check (slot_level between 1 and 9),
  max_slots integer not null default 0 check (max_slots >= 0),
  used_slots integer not null default 0 check (used_slots >= 0),
  unique(character_id, slot_level)
);

-- Inventory items table
create table if not exists public.inventory_items (
  id uuid default uuid_generate_v4() primary key,
  character_id uuid references public.characters(id) on delete cascade not null,
  name text not null,
  quantity integer not null default 1 check (quantity >= 0),
  weight numeric(10,2) default 0,
  equipped boolean not null default false,
  notes text default '',
  created_at timestamptz default now() not null
);

-- Currency table
create table if not exists public.currency (
  id uuid default uuid_generate_v4() primary key,
  character_id uuid references public.characters(id) on delete cascade not null unique,
  copper integer not null default 0 check (copper >= 0),
  silver integer not null default 0 check (silver >= 0),
  electrum integer not null default 0 check (electrum >= 0),
  gold integer not null default 0 check (gold >= 0),
  platinum integer not null default 0 check (platinum >= 0)
);

-- Conditions/status effects
create table if not exists public.conditions (
  id uuid default uuid_generate_v4() primary key,
  character_id uuid references public.characters(id) on delete cascade not null,
  name text not null,
  created_at timestamptz default now() not null
);

-- RLS Policies
alter table public.characters enable row level security;
alter table public.spell_slots enable row level security;
alter table public.inventory_items enable row level security;
alter table public.currency enable row level security;
alter table public.conditions enable row level security;

-- Characters policies
create policy "Users can view own characters" on public.characters
  for select using (auth.uid() = user_id);
create policy "Users can insert own characters" on public.characters
  for insert with check (auth.uid() = user_id);
create policy "Users can update own characters" on public.characters
  for update using (auth.uid() = user_id);
create policy "Users can delete own characters" on public.characters
  for delete using (auth.uid() = user_id);

-- Spell slots policies
create policy "Users can manage own spell slots" on public.spell_slots
  for all using (
    character_id in (select id from public.characters where user_id = auth.uid())
  );

-- Inventory policies
create policy "Users can manage own inventory" on public.inventory_items
  for all using (
    character_id in (select id from public.characters where user_id = auth.uid())
  );

-- Currency policies
create policy "Users can manage own currency" on public.currency
  for all using (
    character_id in (select id from public.characters where user_id = auth.uid())
  );

-- Conditions policies
create policy "Users can manage own conditions" on public.conditions
  for all using (
    character_id in (select id from public.characters where user_id = auth.uid())
  );

-- Updated at trigger
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger characters_updated_at
  before update on public.characters
  for each row execute procedure public.handle_updated_at();
