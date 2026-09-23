-- =========================================================================
-- FR-01: Scenario Browser
-- Adds the scenario-based learning catalog described in the FR-01 Tech
-- Requirement doc: categories, scenarios (versioned), personas, and
-- per-user scenario progress — plus the backend "API" surface, implemented
-- as SECURITY DEFINER RPC functions rather than a separate REST service,
-- consistent with this project's Supabase-first architecture (see
-- src/lib/supabase.ts and the existing services/*).
--
-- Why RPC functions instead of plain table SELECTs:
--   FR-01 §42 "The API must not trust client-provided premium status" and
--   §43 "The backend must never accept userId from the mobile client as the
--   authoritative identity." Every function below reads auth.uid() from the
--   database session (set by the user's JWT) — it is never passed in as a
--   parameter — and computes `isUnlocked` server-side from the user's
--   subscription state. The client can only ever receive the *result* of
--   that computation, never influence it.
-- =========================================================================

-- =========================================================================
-- ENUMS
-- =========================================================================
create type scenario_level as enum (
  'BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'UPPER_INTERMEDIATE', 'ADVANCED'
);
create type scenario_progress_status as enum ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED');
create type scenario_status as enum ('draft', 'published', 'archived');

-- =========================================================================
-- ENTITLEMENTS
-- FR-01 §42: access must be derived from (user + subscription/entitlement +
-- scenario), never from client state. This is intentionally minimal (a
-- single active-subscription flag) — a real billing integration (Stripe/
-- RevenueCat webhooks writing to this table) is a follow-up, but the shape
-- already supports it: swap the column for a joined `subscriptions` table
-- without touching any RPC signature below.
-- =========================================================================
alter table profiles add column if not exists is_premium_subscriber boolean not null default false;

-- =========================================================================
-- TABLES
-- =========================================================================

-- Categories are backend-driven (FR-01 §14) — the content team can add
-- "Dating", "Indian Weddings", etc. via SQL/admin tooling without a mobile
-- release. Never hard-code category names in the React Native app.
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  icon text,
  display_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- A scenario is a stable, linkable entity; its editable content lives in
-- scenario_versions (FR-01 §27: "Use versioning because published content
-- may change later."). The browser only ever reads the current published
-- version.
create table scenarios (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  status scenario_status not null default 'draft',
  current_version_id uuid, -- FK added after scenario_versions exists
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table scenario_versions (
  id uuid primary key default uuid_generate_v4(),
  scenario_id uuid not null references scenarios(id) on delete cascade,
  version_number integer not null default 1,
  title text not null,
  description text not null,
  level scenario_level not null,
  duration_minutes integer not null default 5,
  thumbnail_url text,
  is_premium boolean not null default false,
  -- Scenario Detail fields (FR-01 §23) — deliberately just metadata/counts,
  -- never the actual lesson content (video/audio/exercises/transcript):
  -- FR-01 §18 "The Scenario Browser should NOT download complete learning
  -- content." Full interaction/phrase/cultural-note records belong to a
  -- future Scenario Player feature and its own tables.
  objectives text[] not null default '{}',
  interaction_count integer not null default 0,
  phrase_count integer not null default 0,
  cultural_note_count integer not null default 0,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  unique (scenario_id, version_number)
);

alter table scenarios
  add constraint scenarios_current_version_fk
  foreign key (current_version_id) references scenario_versions(id) on delete set null;

-- Many-to-many: a scenario can belong to multiple categories (FR-01 §29).
create table scenario_categories (
  scenario_id uuid not null references scenarios(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  primary key (scenario_id, category_id)
);

-- Personas power recommendations (FR-01 §15, §25): e.g. "my partner is
-- Indian", "I travel to India for work", etc., picked during onboarding.
create table personas (
  id uuid primary key default uuid_generate_v4(),
  slug text not null unique,
  name text not null,
  description text,
  created_at timestamptz not null default now()
);

create table scenario_personas (
  scenario_id uuid not null references scenarios(id) on delete cascade,
  persona_id uuid not null references personas(id) on delete cascade,
  relevance integer not null default 1, -- higher = stronger match for that persona
  primary key (scenario_id, persona_id)
);

-- Track which persona(s) a user selected during onboarding — feeds
-- get_recommended_scenarios(). Kept separate from `profiles` so a user can
-- have more than one persona/goal over time.
create table user_personas (
  user_id uuid not null references profiles(id) on delete cascade,
  persona_id uuid not null references personas(id) on delete cascade,
  selected_at timestamptz not null default now(),
  primary key (user_id, persona_id)
);

-- Per-user progress on a scenario (FR-01 §30).
create table user_scenario_progress (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id) on delete cascade,
  scenario_id uuid not null references scenarios(id) on delete cascade,
  status scenario_progress_status not null default 'NOT_STARTED',
  completed_interactions integer not null default 0,
  total_interactions integer not null default 0,
  percentage numeric(5, 2) not null default 0,
  last_interaction_id text,
  started_at timestamptz,
  last_accessed_at timestamptz not null default now(),
  completed_at timestamptz,
  unique (user_id, scenario_id)
);

-- =========================================================================
-- INDEXES
-- =========================================================================
create index idx_scenario_versions_scenario on scenario_versions(scenario_id);
create index idx_scenario_versions_published on scenario_versions(scenario_id, published_at desc);
create index idx_scenarios_status on scenarios(status);
create index idx_scenario_categories_category on scenario_categories(category_id);
create index idx_scenario_categories_scenario on scenario_categories(scenario_id);
create index idx_scenario_personas_persona on scenario_personas(persona_id);
create index idx_user_personas_user on user_personas(user_id);
create index idx_user_scenario_progress_user on user_scenario_progress(user_id);
create index idx_user_scenario_progress_scenario on user_scenario_progress(user_id, scenario_id);
-- Full text search across title/description (FR-01 §12 "For V1, search
-- should cover: Scenario title, Scenario description, Category name").
create index idx_scenario_versions_search on scenario_versions
  using gin (to_tsvector('english', title || ' ' || description));

-- =========================================================================
-- ROW LEVEL SECURITY
-- =========================================================================
alter table categories enable row level security;
alter table scenarios enable row level security;
alter table scenario_versions enable row level security;
alter table scenario_categories enable row level security;
alter table personas enable row level security;
alter table scenario_personas enable row level security;
alter table user_personas enable row level security;
alter table user_scenario_progress enable row level security;

-- Content tables: readable by any authenticated user, never writable from
-- the client (same pattern as courses/stories/vocabulary in 0001_init.sql).
-- Note this exposes `is_premium` on scenario_versions — that's intentional
-- and safe (FR-01 §10 State 4 shows the 🔒 badge to everyone); what must
-- never be client-derived is `isUnlocked`, which only the RPC functions
-- below compute, from server-side entitlement state.
create policy "categories_read_all" on categories for select using (auth.role() = 'authenticated' and is_active);
create policy "scenarios_read_all" on scenarios for select using (auth.role() = 'authenticated' and status = 'published');
create policy "scenario_versions_read_all" on scenario_versions for select using (auth.role() = 'authenticated');
create policy "scenario_categories_read_all" on scenario_categories for select using (auth.role() = 'authenticated');
create policy "personas_read_all" on personas for select using (auth.role() = 'authenticated');
create policy "scenario_personas_read_all" on scenario_personas for select using (auth.role() = 'authenticated');

create policy "user_personas_all_own" on user_personas for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "user_scenario_progress_all_own" on user_scenario_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- =========================================================================
-- HELPER: does the current user have an unlocked entitlement for a scenario?
-- Centralizing this means every RPC below applies the exact same rule.
-- =========================================================================
create or replace function public.scenario_is_unlocked(p_is_premium boolean, p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case
    when not p_is_premium then true
    when p_user_id is null then false
    else coalesce((select is_premium_subscriber from profiles where id = p_user_id), false)
  end;
$$;

-- =========================================================================
-- API-01 — GET /api/v1/scenario-categories  ==>  get_scenario_categories()
-- =========================================================================
create or replace function public.get_scenario_categories()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'items', coalesce(jsonb_agg(
      jsonb_build_object(
        'id', c.id,
        'name', c.name,
        'slug', c.slug,
        'icon', c.icon,
        'scenarioCount', (
          select count(*) from scenario_categories sc
          join scenarios s on s.id = sc.scenario_id and s.status = 'published'
          where sc.category_id = c.id
        )
      ) order by c.display_order, c.name
    ), '[]'::jsonb)
  )
  from categories c
  where c.is_active;
$$;

-- =========================================================================
-- Shared row -> ScenarioSummary jsonb builder, used by browse/recommended/
-- search so the three endpoints stay byte-for-byte consistent (FR-01 §22
-- "Use the same ScenarioSummary structure as the browse API.").
-- =========================================================================
create or replace function public._scenario_summary_json(
  p_scenario_id uuid,
  p_title text,
  p_slug text,
  p_description text,
  p_thumbnail_url text,
  p_level scenario_level,
  p_duration_minutes integer,
  p_is_premium boolean,
  p_user_id uuid
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_categories jsonb;
  v_progress jsonb;
begin
  select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)), '[]'::jsonb)
  into v_categories
  from scenario_categories sc
  join categories c on c.id = sc.category_id
  where sc.scenario_id = p_scenario_id;

  if p_user_id is not null then
    select jsonb_build_object(
      'status', usp.status,
      'completedInteractions', usp.completed_interactions,
      'totalInteractions', usp.total_interactions,
      'percentage', usp.percentage,
      'lastInteractionId', usp.last_interaction_id
    )
    into v_progress
    from user_scenario_progress usp
    where usp.user_id = p_user_id and usp.scenario_id = p_scenario_id;
  end if;

  return jsonb_build_object(
    'id', p_scenario_id,
    'title', p_title,
    'slug', p_slug,
    'description', p_description,
    'thumbnailUrl', p_thumbnail_url,
    'level', p_level,
    'durationMinutes', p_duration_minutes,
    'categories', v_categories,
    'isPremium', p_is_premium,
    'isUnlocked', scenario_is_unlocked(p_is_premium, p_user_id),
    'progress', v_progress
  );
end;
$$;

-- =========================================================================
-- API-02 — GET /api/v1/scenarios  ==>  browse_scenarios(...)
-- =========================================================================
create or replace function public.browse_scenarios(
  p_category text default null,
  p_level scenario_level default null,
  p_max_duration integer default null,
  p_is_premium boolean default null,
  p_page integer default 1,
  p_page_size integer default 20
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_offset integer := greatest(p_page - 1, 0) * greatest(p_page_size, 1);
  v_total integer;
  v_items jsonb;
begin
  with matching as (
    select s.id, sv.title, sv.description, sv.thumbnail_url, sv.level,
           sv.duration_minutes, sv.is_premium, s.slug, sv.published_at
    from scenarios s
    join scenario_versions sv on sv.id = s.current_version_id
    where s.status = 'published'
      and (p_level is null or sv.level = p_level)
      and (p_max_duration is null or sv.duration_minutes <= p_max_duration)
      and (p_is_premium is null or sv.is_premium = p_is_premium)
      and (
        p_category is null or exists (
          select 1 from scenario_categories sc
          join categories c on c.id = sc.category_id
          where sc.scenario_id = s.id and c.slug = p_category
        )
      )
  )
  select count(*) into v_total from matching;

  with matching as (
    select s.id, sv.title, sv.description, sv.thumbnail_url, sv.level,
           sv.duration_minutes, sv.is_premium, s.slug, sv.published_at
    from scenarios s
    join scenario_versions sv on sv.id = s.current_version_id
    where s.status = 'published'
      and (p_level is null or sv.level = p_level)
      and (p_max_duration is null or sv.duration_minutes <= p_max_duration)
      and (p_is_premium is null or sv.is_premium = p_is_premium)
      and (
        p_category is null or exists (
          select 1 from scenario_categories sc
          join categories c on c.id = sc.category_id
          where sc.scenario_id = s.id and c.slug = p_category
        )
      )
    order by published_at desc nulls last
    limit greatest(p_page_size, 1) offset v_offset
  )
  select coalesce(jsonb_agg(
    _scenario_summary_json(id, title, slug, description, thumbnail_url, level, duration_minutes, is_premium, v_user_id)
  ), '[]'::jsonb)
  into v_items
  from matching;

  return jsonb_build_object(
    'items', v_items,
    'pagination', jsonb_build_object(
      'page', p_page,
      'pageSize', p_page_size,
      'totalItems', v_total,
      'hasNextPage', (v_offset + p_page_size) < v_total
    )
  );
end;
$$;

-- =========================================================================
-- API-03 — GET /api/v1/scenarios/recommended  ==>  get_recommended_scenarios(...)
-- Recommendation is explicitly NOT required to be AI-powered in V1
-- (FR-01 §15). This ranks by: persona match > matching the user's stored
-- level > most recently published, then falls back to recency for users
-- with no persona/level yet — always deterministic and explainable.
-- =========================================================================
create or replace function public.get_recommended_scenarios(p_limit integer default 10)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_user_level scenario_level;
  v_items jsonb;
begin
  select case level
    when 'beginner' then 'BEGINNER'::scenario_level
    when 'intermediate' then 'INTERMEDIATE'::scenario_level
    when 'advanced' then 'ADVANCED'::scenario_level
    else null
  end into v_user_level
  from profiles where id = v_user_id;

  with ranked as (
    select
      s.id, sv.title, sv.description, sv.thumbnail_url, sv.level,
      sv.duration_minutes, sv.is_premium, s.slug, sv.published_at,
      coalesce((
        select max(sp.relevance) from scenario_personas sp
        join user_personas up on up.persona_id = sp.persona_id
        where sp.scenario_id = s.id and up.user_id = v_user_id
      ), 0) as persona_score,
      (v_user_level is not null and sv.level = v_user_level) as level_match,
      case
        when v_user_id is not null and (
          select max(sp.relevance) from scenario_personas sp
          join user_personas up on up.persona_id = sp.persona_id
          where sp.scenario_id = s.id and up.user_id = v_user_id
        ) is not null then 'Based on your learning goal'
        when v_user_level is not null and sv.level = v_user_level then 'Matches your level'
        else 'Popular with new learners'
      end as reason
    from scenarios s
    join scenario_versions sv on sv.id = s.current_version_id
    where s.status = 'published'
    order by persona_score desc, level_match desc, sv.published_at desc nulls last
    limit greatest(p_limit, 1)
  )
  select coalesce(jsonb_agg(
    _scenario_summary_json(id, title, slug, description, thumbnail_url, level, duration_minutes, is_premium, v_user_id)
    || jsonb_build_object('reason', reason)
  ), '[]'::jsonb)
  into v_items
  from ranked;

  return jsonb_build_object('items', v_items);
end;
$$;

-- =========================================================================
-- API-04 — GET /api/v1/scenarios/search  ==>  search_scenarios(...)
-- V1 scope (FR-01 §12): title, description, category name only.
-- =========================================================================
create or replace function public.search_scenarios(
  p_query text,
  p_page integer default 1,
  p_page_size integer default 20
)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_offset integer := greatest(p_page - 1, 0) * greatest(p_page_size, 1);
  v_total integer;
  v_items jsonb;
  v_like text := '%' || coalesce(trim(p_query), '') || '%';
begin
  with matching as (
    select distinct s.id, sv.title, sv.description, sv.thumbnail_url, sv.level,
           sv.duration_minutes, sv.is_premium, s.slug, sv.published_at
    from scenarios s
    join scenario_versions sv on sv.id = s.current_version_id
    left join scenario_categories sc on sc.scenario_id = s.id
    left join categories c on c.id = sc.category_id
    where s.status = 'published'
      and trim(coalesce(p_query, '')) <> ''
      and (
        sv.title ilike v_like
        or sv.description ilike v_like
        or c.name ilike v_like
      )
  )
  select count(*) into v_total from matching;

  with matching as (
    select distinct s.id, sv.title, sv.description, sv.thumbnail_url, sv.level,
           sv.duration_minutes, sv.is_premium, s.slug, sv.published_at
    from scenarios s
    join scenario_versions sv on sv.id = s.current_version_id
    left join scenario_categories sc on sc.scenario_id = s.id
    left join categories c on c.id = sc.category_id
    where s.status = 'published'
      and trim(coalesce(p_query, '')) <> ''
      and (
        sv.title ilike v_like
        or sv.description ilike v_like
        or c.name ilike v_like
      )
    order by published_at desc nulls last
    limit greatest(p_page_size, 1) offset v_offset
  )
  select coalesce(jsonb_agg(
    _scenario_summary_json(id, title, slug, description, thumbnail_url, level, duration_minutes, is_premium, v_user_id)
  ), '[]'::jsonb)
  into v_items
  from matching;

  return jsonb_build_object(
    'items', v_items,
    'pagination', jsonb_build_object(
      'page', p_page,
      'pageSize', p_page_size,
      'totalItems', v_total,
      'hasNextPage', (v_offset + p_page_size) < v_total
    )
  );
end;
$$;

-- =========================================================================
-- API-05 — GET /api/v1/scenarios/{id}  ==>  get_scenario_detail(...)
-- =========================================================================
create or replace function public.get_scenario_detail(p_scenario_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_row record;
  v_categories jsonb;
  v_progress jsonb;
begin
  select s.id, s.slug, sv.title, sv.description, sv.level, sv.duration_minutes,
         sv.thumbnail_url, sv.is_premium, sv.objectives, sv.interaction_count,
         sv.phrase_count, sv.cultural_note_count
  into v_row
  from scenarios s
  join scenario_versions sv on sv.id = s.current_version_id
  where s.id = p_scenario_id and s.status = 'published';

  if not found then
    return jsonb_build_object('error', jsonb_build_object('code', 'SCENARIO_NOT_FOUND', 'message', 'Scenario not found'));
  end if;

  select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'name', c.name, 'slug', c.slug)), '[]'::jsonb)
  into v_categories
  from scenario_categories sc join categories c on c.id = sc.category_id
  where sc.scenario_id = p_scenario_id;

  if v_user_id is not null then
    select jsonb_build_object(
      'status', usp.status,
      'percentage', usp.percentage,
      'lastInteractionId', usp.last_interaction_id
    )
    into v_progress
    from user_scenario_progress usp
    where usp.user_id = v_user_id and usp.scenario_id = p_scenario_id;
  end if;

  return jsonb_build_object(
    'id', v_row.id,
    'title', v_row.title,
    'slug', v_row.slug,
    'description', v_row.description,
    'level', v_row.level,
    'durationMinutes', v_row.duration_minutes,
    'thumbnailUrl', v_row.thumbnail_url,
    'categories', v_categories,
    'objectives', to_jsonb(v_row.objectives),
    'stats', jsonb_build_object(
      'interactionCount', v_row.interaction_count,
      'phraseCount', v_row.phrase_count,
      'culturalNoteCount', v_row.cultural_note_count
    ),
    'access', jsonb_build_object(
      'isPremium', v_row.is_premium,
      'isUnlocked', scenario_is_unlocked(v_row.is_premium, v_user_id)
    ),
    'progress', v_progress
  );
end;
$$;

-- =========================================================================
-- API-06 — POST /api/v1/scenarios/{id}/start  ==>  start_scenario(...)
-- Requires auth (FR-01 §43) and re-checks access server-side even though
-- the UI should already prevent unauthorized taps (FR-01 §42).
-- =========================================================================
create or replace function public.start_scenario(p_scenario_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_is_premium boolean;
  v_total_interactions integer;
  v_status scenario_status;
  v_now timestamptz := now();
  v_resume text;
begin
  if v_user_id is null then
    return jsonb_build_object('error', jsonb_build_object('code', 'NOT_AUTHENTICATED', 'message', 'Sign in required'));
  end if;

  select s.status, sv.is_premium, sv.interaction_count
  into v_status, v_is_premium, v_total_interactions
  from scenarios s join scenario_versions sv on sv.id = s.current_version_id
  where s.id = p_scenario_id;

  if not found or v_status <> 'published' then
    return jsonb_build_object('error', jsonb_build_object('code', 'SCENARIO_NOT_FOUND', 'message', 'Scenario not found'));
  end if;

  if not scenario_is_unlocked(v_is_premium, v_user_id) then
    return jsonb_build_object('error', jsonb_build_object('code', 'NOT_AUTHORIZED', 'message', 'Premium subscription required'));
  end if;

  insert into user_scenario_progress (
    user_id, scenario_id, status, total_interactions, started_at, last_accessed_at
  ) values (
    v_user_id, p_scenario_id, 'IN_PROGRESS', v_total_interactions, v_now, v_now
  )
  on conflict (user_id, scenario_id) do update
    set status = case when user_scenario_progress.status = 'COMPLETED' then 'COMPLETED' else 'IN_PROGRESS' end,
        last_accessed_at = v_now,
        started_at = coalesce(user_scenario_progress.started_at, v_now)
  returning coalesce(last_interaction_id, 'int_001'), status into v_resume, v_status;

  return jsonb_build_object(
    'scenarioId', p_scenario_id,
    'status', v_status,
    'startedAt', v_now,
    'resumeInteractionId', v_resume
  );
end;
$$;

-- =========================================================================
-- Grants: RPCs are callable by any authenticated (or anon, for the public
-- browse/search/category endpoints) client; base tables stay governed by
-- the RLS policies above.
-- =========================================================================
grant execute on function public.scenario_is_unlocked(boolean, uuid) to anon, authenticated;
grant execute on function public.get_scenario_categories() to anon, authenticated;
grant execute on function public.browse_scenarios(text, scenario_level, integer, boolean, integer, integer) to anon, authenticated;
grant execute on function public.get_recommended_scenarios(integer) to authenticated;
grant execute on function public.search_scenarios(text, integer, integer) to anon, authenticated;
grant execute on function public.get_scenario_detail(uuid) to anon, authenticated;
grant execute on function public.start_scenario(uuid) to authenticated;
