-- LingoScenes database schema
-- Run this in the Supabase SQL editor, or via `supabase db push` / migrations.

create extension if not exists "uuid-ossp";

-- =========================================================================
-- ENUMS
-- =========================================================================
create type difficulty_level as enum ('beginner', 'intermediate', 'advanced');
create type exercise_type as enum (
  'multiple_choice', 'translation', 'listening', 'vocabulary',
  'fill_blank', 'word_order', 'pronunciation'
);
create type vocab_status as enum ('new', 'learning', 'reviewing', 'learned');

-- =========================================================================
-- TABLES
-- =========================================================================

create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  native_language text,
  learning_language text,
  level difficulty_level,
  daily_goal_minutes integer not null default 10,
  streak_count integer not null default 0,
  last_activity_date date,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now()
);

create table courses (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  language text not null,
  description text,
  level difficulty_level not null,
  created_at timestamptz not null default now()
);

create table stories (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid not null references courses(id) on delete cascade,
  title text not null,
  description text,
  difficulty difficulty_level not null,
  topic text,
  thumbnail_url text,
  duration_minutes integer not null default 5,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

create table story_scenes (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  order_index integer not null default 0,
  character text not null,
  dialogue text not null,
  translation text not null,
  audio_url text,
  video_url text,
  created_at timestamptz not null default now()
);

create table vocabulary (
  id uuid primary key default uuid_generate_v4(),
  word text not null,
  translation text not null,
  pronunciation text,
  part_of_speech text,
  example_sentence text,
  audio_url text,
  language text not null,
  created_at timestamptz not null default now()
);

create table user_vocabulary (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  vocabulary_id uuid not null references vocabulary(id) on delete cascade,
  status vocab_status not null default 'new',
  review_count integer not null default 0,
  last_reviewed_at timestamptz,
  next_review_at timestamptz default now(),
  created_at timestamptz not null default now(),
  unique (user_id, vocabulary_id)
);

create table exercises (
  id uuid primary key default uuid_generate_v4(),
  story_id uuid not null references stories(id) on delete cascade,
  scene_id uuid references story_scenes(id) on delete set null,
  type exercise_type not null,
  question text not null,
  answer text not null,
  options text[],
  explanation text,
  audio_url text,
  order_index integer not null default 0
);

create table user_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  story_id uuid not null references stories(id) on delete cascade,
  scene_id uuid references story_scenes(id) on delete cascade,
  completion_percentage integer not null default 0 check (completion_percentage between 0 and 100),
  completed boolean not null default false,
  last_position integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, story_id, scene_id)
);

create table exercise_attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  exercise_id uuid not null references exercises(id) on delete cascade,
  answer text not null,
  correct boolean not null,
  created_at timestamptz not null default now()
);

create table learning_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_seconds integer
);

-- =========================================================================
-- INDEXES
-- =========================================================================
create index idx_stories_course on stories(course_id);
create index idx_stories_difficulty on stories(difficulty);
create index idx_scenes_story on story_scenes(story_id, order_index);
create index idx_exercises_story on exercises(story_id, order_index);
create index idx_user_vocab_user on user_vocabulary(user_id);
create index idx_user_vocab_next_review on user_vocabulary(user_id, next_review_at);
create index idx_user_progress_user on user_progress(user_id);
create index idx_user_progress_story on user_progress(user_id, story_id);
create index idx_exercise_attempts_user on exercise_attempts(user_id);
create index idx_learning_sessions_user on learning_sessions(user_id, started_at);
create index idx_vocabulary_word_lang on vocabulary(lower(word), language);

-- =========================================================================
-- TRIGGER: auto-create a profile row when a new auth user signs up
-- =========================================================================
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================
alter table profiles enable row level security;
alter table courses enable row level security;
alter table stories enable row level security;
alter table story_scenes enable row level security;
alter table vocabulary enable row level security;
alter table user_vocabulary enable row level security;
alter table exercises enable row level security;
alter table user_progress enable row level security;
alter table exercise_attempts enable row level security;
alter table learning_sessions enable row level security;

-- Profiles: users can only see/edit their own profile.
create policy "profiles_select_own" on profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on profiles for update using (auth.uid() = id);
create policy "profiles_insert_own" on profiles for insert with check (auth.uid() = id);

-- Public content (courses, stories, scenes, vocabulary, exercises) is
-- readable by any authenticated user, but never writable from the client.
create policy "courses_read_all" on courses for select using (auth.role() = 'authenticated');
create policy "stories_read_all" on stories for select using (auth.role() = 'authenticated');
create policy "scenes_read_all" on story_scenes for select using (auth.role() = 'authenticated');
create policy "vocabulary_read_all" on vocabulary for select using (auth.role() = 'authenticated');
create policy "exercises_read_all" on exercises for select using (auth.role() = 'authenticated');

-- User-owned data: strict per-user isolation on all operations.
create policy "user_vocab_all_own" on user_vocabulary for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_progress_all_own" on user_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "exercise_attempts_all_own" on exercise_attempts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "learning_sessions_all_own" on learning_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Note: course/story/scene/vocabulary/exercise content is intended to be
-- managed via the Supabase dashboard, SQL editor, or a service-role admin
-- script — never from the client app, which only ever has the anon key.
