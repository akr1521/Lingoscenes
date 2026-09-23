-- Themed, ordered vocabulary curriculum. Content remains read-only to clients.

create table vocabulary_lessons (
  id uuid primary key default uuid_generate_v4(),
  language text not null,
  title text not null,
  description text not null,
  icon text not null default '📚',
  order_index integer not null check (order_index between 1 and 20),
  created_at timestamptz not null default now(),
  unique (language, order_index)
);

create table vocabulary_lesson_words (
  lesson_id uuid not null references vocabulary_lessons(id) on delete cascade,
  vocabulary_id uuid not null references vocabulary(id) on delete cascade,
  order_index integer not null default 0,
  primary key (lesson_id, vocabulary_id)
);

create table user_vocabulary_lesson_progress (
  user_id uuid not null references profiles(id) on delete cascade,
  lesson_id uuid not null references vocabulary_lessons(id) on delete cascade,
  completed_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

create index idx_vocabulary_lessons_language_order on vocabulary_lessons(language, order_index);
create index idx_vocabulary_lesson_words_lesson on vocabulary_lesson_words(lesson_id, order_index);

alter table vocabulary_lessons enable row level security;
alter table vocabulary_lesson_words enable row level security;
alter table user_vocabulary_lesson_progress enable row level security;

create policy "vocabulary_lessons_read_all" on vocabulary_lessons
  for select using (auth.role() = 'authenticated');

create policy "vocabulary_lesson_words_read_all" on vocabulary_lesson_words
  for select using (auth.role() = 'authenticated');

create policy "user_vocabulary_lesson_progress_all_own" on user_vocabulary_lesson_progress
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
