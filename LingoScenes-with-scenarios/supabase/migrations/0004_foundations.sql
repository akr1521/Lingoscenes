-- Foundations: core alphabet/pronunciation + essential survival phrases.
-- Content tables are read-only to clients, same pattern as vocabulary_lessons.

create table alphabet_characters (
  id uuid primary key default uuid_generate_v4(),
  language text not null,
  character text not null,
  romanization text,
  pronunciation_guide text not null,
  example_word text,
  example_translation text,
  audio_url text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table survival_phrases (
  id uuid primary key default uuid_generate_v4(),
  language text not null,
  category text not null,
  phrase text not null,
  translation text not null,
  pronunciation text,
  audio_url text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table user_foundations_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  language text not null,
  alphabet_completed_at timestamptz,
  phrases_completed_at timestamptz,
  primary key (user_id, language)
);

create index idx_alphabet_characters_language_order on alphabet_characters(language, order_index);
create index idx_survival_phrases_language_category_order on survival_phrases(language, category, order_index);

alter table alphabet_characters enable row level security;
alter table survival_phrases enable row level security;
alter table user_foundations_progress enable row level security;

create policy "alphabet_characters_read_all" on alphabet_characters
  for select using (auth.role() = 'authenticated');

create policy "survival_phrases_read_all" on survival_phrases
  for select using (auth.role() = 'authenticated');

create policy "user_foundations_progress_all_own" on user_foundations_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
