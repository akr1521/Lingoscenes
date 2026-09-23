# LingoScenes

A story-based language-learning mobile app built with React Native, Expo, TypeScript, and Supabase. Inspired by the interaction model of Seedlang's Stories experience (tap-to-translate transcripts, scene-by-scene audio, in-context exercises) — with entirely original branding, UI, and content.

---

## 1. Project overview

Users pick a language and level, work through short audio-driven dialogue "stories," tap any word for an instant translation and can save it to a personal vocabulary list, then complete a mixed-format exercise set per story. Progress, streaks, vocabulary status, and exercise history all persist in Supabase per-user, protected by Row Level Security.

## 2. Technology stack

- React Native 0.74 + Expo SDK 51
- TypeScript (strict mode)
- Expo Router (file-based navigation)
- Supabase: Postgres, Auth, Storage, Row Level Security
- TanStack Query for server-state caching
- Zustand for local/client UI state
- expo-av for audio playback
- react-native-reanimated + gesture-handler for animation

## 3. Folder structure

```
app/                      Expo Router routes (screens)
  (auth)/                 login, register, forgot-password
  (onboarding)/           language -> level -> goals
  (tabs)/                 home, learn, stories, practice, vocabulary, progress, profile
  story/[id].tsx           story player (scenes, audio, transcript)
  scenario/[id].tsx        scenario detail (FR-01 Scenario Browser)
  scenario-category/[slug].tsx  scenarios filtered by one category
  scenario-player/[id].tsx      landing screen after "Start"/"Continue" (see §16)
  exercise/[id].tsx        exercise session for a story
  settings/index.tsx        app settings
src/
  components/             reusable UI (Button, Card, exercise types, WordPopover, ...)
  features/
    scenarios/             FR-01 Scenario Browser feature module (self-contained)
      types/                ScenarioSummary/ScenarioDetail/etc. models
      services/scenarioApi.ts   thin wrapper around the Supabase RPC "API" (see §16)
      hooks/                useScenarios, useRecommendedScenarios, useScenarioCategories, useScenario, useScenarioSearch
      components/           ScenarioCard, FeaturedScenarioCard, CategoryChip, filters, search, skeletons, badges
      screens/              ScenarioBrowserScreen, ScenarioCategoryScreen, ScenarioDetailScreen
      utils/                pure helpers (card state/CTA logic), unit-tested
  services/               Supabase query wrappers (auth, story, vocabulary, progress, exercise)
  store/                  Zustand stores (auth, app/UI state)
  hooks/                  useAuth listener, useAudioPlayer
  lib/                    supabase client, analytics.ts, localCache.ts (offline cache fallback)
  theme/                  design tokens (colors, spacing, typography)
  types/database.ts        TypeScript types mirroring the SQL schema
  constants/               static option lists (languages, levels, goals)
supabase/
  migrations/0001_init.sql   original schema + RLS policies (stories/vocab/exercises)
  migrations/0002_scenarios.sql  Scenario Browser schema, RLS, and RPC "API" (FR-01)
  seed.sql                  original demo content (10 stories, vocab, exercises)
  seed_scenarios.sql        9 example scenarios + categories + personas (FR-01)
```

## 4. Installation

Requirements: Node.js 18+, npm, and either Xcode (iOS) or Android Studio (Android), or just the Expo Go app on a physical device for quick testing.

```bash
npm install
```

## 5. Supabase setup

1. Create a project at https://supabase.com.
2. In **Project Settings → API**, copy the **Project URL** and **anon public key**.
3. Copy `.env.example` to `.env` and fill them in:
   ```bash
   cp .env.example .env
   ```
4. In the Supabase SQL editor, run the migrations **in order**:
   - `supabase/migrations/0001_init.sql` — core schema (stories, vocab, exercises).
   - `supabase/migrations/0002_scenarios.sql` — Scenario Browser schema, RLS, and RPC functions (FR-01).
   - `supabase/migrations/0003_vocabulary_lessons.sql` — themed vocabulary lessons, lesson-word membership, and completion progress.
5. Run the seed data in order: `supabase/seed.sql`, `supabase/seed_scenarios.sql`, then `supabase/seed_vocabulary_lessons.sql`.
6. Create a **public** Storage bucket named `media` (Storage → New bucket → Public) and upload:
   - `thumbnails/*.jpg` — story cover images referenced in `seed.sql`
   - `audio/*.mp3` — scene, exercise, and vocabulary-pronunciation audio referenced in `seed.sql`
   - Then replace `https://YOUR_PROJECT.supabase.co` in `seed.sql` with your actual project URL before running it, or update the rows afterward.

   **Note on media assets:** the seed data includes real Storage paths but no bundled audio/image files (recording original voice lines and illustrations is outside what this generator can produce). The app will run and every screen is fully functional against empty/broken media URLs (loading and error states are handled gracefully — see `useAudioPlayer`'s `error` state and `StoryCard`'s thumbnail fallback), but you'll want to add your own short MP3 clips (or use a TTS API) and thumbnail images for the full experience.

### Optional: Supabase CLI

```bash
npm install -g supabase
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push                                  # applies migrations/
supabase db execute -f supabase/seed.sql          # applies seed data
```

## 6. Environment variables

`.env` (never commit this):
```
EXPO_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
```
Only the anon key ships in the client — it's safe by design because every table is protected by RLS. Never put your `service_role` key in the app or in any file that gets bundled.

## 7. Running locally

```bash
npx expo start
```
Then press `i` for iOS simulator, `a` for Android emulator, or scan the QR code with Expo Go on a physical device.

## 8. Android setup

- Install Android Studio, set up an AVD (Android Virtual Device) via Device Manager.
- `npx expo start --android` (with the emulator running), or scan the QR code with Expo Go on a physical Android device.

## 9. iOS setup

- macOS + Xcode required for the simulator.
- `npx expo start --ios`, or scan the QR code with the Expo Go app / Camera app on a physical iPhone.

## 10. Production builds (EAS)

```bash
npm install -g eas-cli
eas login
eas build:configure
eas build --platform android
eas build --platform ios
```
You'll need an Apple Developer account for iOS and a Google Play Console account for Android distribution. See https://docs.expo.dev/build/introduction/ for store submission steps.

## 11. Database schema

See `supabase/migrations/0001_init.sql`. Tables: `profiles`, `courses`, `stories`, `story_scenes`, `vocabulary`, `user_vocabulary`, `exercises`, `user_progress`, `exercise_attempts`, `learning_sessions`. All user-owned tables have RLS policies restricting access to `auth.uid() = user_id`; content tables (`courses`, `stories`, `story_scenes`, `vocabulary`, `exercises`) are read-only from the client and meant to be managed via the Supabase dashboard/SQL editor or an internal admin script — never hardcoded into the app.

A trigger (`handle_new_user`) auto-creates a `profiles` row whenever someone signs up, so onboarding can update it directly.

See `supabase/migrations/0002_scenarios.sql` for the Scenario Browser (FR-01) schema: `categories`, `scenarios`, `scenario_versions` (versioned content — a scenario always points at its `current_version_id`), `scenario_categories`, `personas`, `scenario_personas`, `user_personas`, and `user_scenario_progress`.

Vocabulary lessons live in `vocabulary_lessons` and `vocabulary_lesson_words`, with per-user completion in `user_vocabulary_lesson_progress`. `seed_vocabulary_lessons.sql` initializes the 20 themed German lessons and maps the sample vocabulary into applicable lessons.

## 12. Adding your own content

Because content lives entirely in Supabase, you can add new stories/scenes/vocabulary/exercises with SQL inserts (see `seed.sql` for the pattern) or build a small internal admin tool later — no app code changes needed. The same is true for scenarios — see `seed_scenarios.sql` for the insert pattern (a `scenarios` row + its first `scenario_versions` row + `scenario_categories`/`scenario_personas` links).

## 13. The Scenario Browser (FR-01)

The "Learn" tab implements the Scenario Browser feature described in `Tech_Requirement_doc.docx`. Because this codebase is Supabase-first rather than a separate REST server, the six API endpoints in that doc (`GET /scenario-categories`, `GET /scenarios`, `GET /scenarios/recommended`, `GET /scenarios/search`, `GET /scenarios/{id}`, `POST /scenarios/{id}/start`) are implemented as Postgres `SECURITY DEFINER` RPC functions in `0002_scenarios.sql`, called through `src/features/scenarios/services/scenarioApi.ts`. Every function reads the caller's identity from `auth.uid()` inside the database session — never from a client-supplied parameter — and computes `isUnlocked` from `profiles.is_premium_subscriber` server-side, so the client can never spoof access to a premium scenario.

**What's fully built and working:**
- Scenario Browser screen: search, category + difficulty filters, "Recommended for you" rail, paginated list, all 4 card states (not started / in progress / completed / premium-locked), loading skeletons, error state with retry, offline cache fallback.
- Scenario Detail screen: objectives, stats, access/lock state, progress, Start/Continue/Practice Again.
- Scenario Category screen (tapping a category chip or a deep link).
- Full analytics event funnel (`learn_screen_viewed` through `scenario_start_clicked`) via `src/lib/analytics.ts` (logs to console for now — swap in a real provider via `setAnalyticsHandler` with no call-site changes).

**Deliberately out of scope for FR-01** (per the doc's own §38, "only needs to implement navigation up to Scenario Detail and Start"):
- The scene-by-scene **Scenario Player** (dialogue, audio, exercises) — `app/scenario-player/[id].tsx` is a real, working landing screen after "Start" so the flow never dead-ends, but it's a placeholder for a future feature with its own content tables.
- A real **subscription/paywall purchase flow** — tapping "Unlock with Premium" on a locked scenario shows a placeholder alert at the exact seam where IAP/Stripe would be wired in. `profiles.is_premium_subscriber` is a real, RLS-respecting boolean today; flipping it (e.g. via a webhook) immediately unlocks premium scenarios for that user with no other code changes.

## 14. Running tests

```bash
npm test
```

Jest (via `jest-expo`) covers the Scenario Browser feature: pure card-state/CTA logic (`utils/scenarioCardState.ts`), the `scenarioApi` service against a mocked Supabase client (covering the "backend must not trust client premium status" contract from the doc), and a component test of `ScenarioCard` across all 4 states. `npm run typecheck` and `npm run lint` are also wired up and pass clean.

## 15. Known simplifications (documented, not hidden)

- **Pronunciation/"repeat after me" exercises** reuse the listening UI (play + multiple choice) rather than recording and scoring the user's own voice — real pronunciation scoring needs a speech-recognition backend, which is out of scope for a self-contained starter. The exercise type and UI slot are wired up so you can swap in `expo-av` recording + a speech API later without touching other screens.
- **Push notification delivery** for the daily reminder toggle in Settings is a local UI state; wiring it to `expo-notifications` + a scheduling backend is a follow-up (the toggle and daily-goal fields are already persisted so the backend has what it needs).
- **Offline queueing**: TanStack Query's caching gives you resilience to brief network blips and retry-on-reconnect out of the box; a full offline write queue (e.g. via `@tanstack/query-persist-client` + a mutation queue) is intentionally left as a documented next step rather than an unverified implementation.

None of the core flows (auth, stories, audio, tap-to-translate, exercises, vocabulary, progress, profile/settings, scenario browsing/detail/start) are stubbed — they all read and write real Supabase data.

## 16. Troubleshooting

- **"Missing EXPO_PUBLIC_SUPABASE_URL" warning**: you haven't created `.env` from `.env.example`, or you started Expo before creating it (restart `expo start` after editing `.env`).
- **Login says "Invalid credentials" right after registering**: check your Supabase Auth settings — if "Confirm email" is enabled, you must click the confirmation link before logging in.
- **Stories tab is empty**: make sure `seed.sql` ran successfully and that your profile's `learning_language` (set during onboarding) matches a `courses.language` value (`de` in the seed data).
- **Learn tab is empty**: make sure both `0002_scenarios.sql` and `seed_scenarios.sql` ran, in that order, after `0001_init.sql`.
- **Every scenario looks locked even for a subscriber**: `is_premium_subscriber` on `profiles` defaults to `false` — set it to `true` for your test user (`update profiles set is_premium_subscriber = true where id = '<your-user-id>';`) until a real billing webhook is wired up.
- **Audio won't play**: confirm the `media` Storage bucket is public and the file actually exists at the referenced path; `useAudioPlayer` will surface an `error` state rather than crash.
- **Metro/bundler cache issues**: `npx expo start -c` to clear cache.
- **iOS build fails on M1/M2 Macs**: ensure Rosetta and the latest Xcode Command Line Tools are installed.

## 17. Testing the full flow

Register → confirm email → Login → Onboarding (language → level → goal) → Home → Stories → open a story → play/replay audio, tap words, save vocabulary → finish story → Exercises → completion screen → Learn tab → search/filter scenarios, view Recommended, open a free scenario's detail, tap Start → land on the (placeholder) Scenario Player → back to Learn → open a premium scenario as a free user (confirm detail is viewable, CTA reads "Unlock with Premium") → Progress tab shows updated stats → Profile → Settings → Logout → Login again → progress, vocabulary, and scenario progress are still there.
