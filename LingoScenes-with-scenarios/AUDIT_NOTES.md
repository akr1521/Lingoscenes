# Bug Audit — LingoScenes (Seedlang-style app)

This project was audited end-to-end before delivery. Summary of what was checked and found:

## Verification performed
- `npm install` — installs cleanly (1330 packages, Expo SDK 51 / RN 0.74).
- `npx tsc --noEmit` — **0 TypeScript errors** (project uses `strict: true`).
- `npx eslint . --ext .ts,.tsx` — **0 lint errors**.
- `npx expo export --platform android` — **bundles successfully** (1285 modules, no missing imports/exports, no broken module resolution).
- `npx expo-doctor` — 14/17 checks pass; the 3 that fail are network-only checks (comparing against Expo's remote version-compatibility service), not something this sandbox can reach — not a project defect.
- Manually read every screen (`app/**`), every component, every service, every store, the Zustand stores, the Supabase client setup, and the SQL schema/RLS policies/seed data, tracing data flow from Supabase → services → screens.

## Bug found and fixed
**Exercise state leaking between questions** (`app/exercise/[id].tsx`)

The exercise session renders `ExerciseMultipleChoice` / `ExerciseFillBlank` / `ExerciseWordOrder` / `ExerciseListening` via a switch statement with no `key` prop. Since these are stateful components (they track `selected`, `revealed`, `chosen`, `available`, etc. locally), whenever two consecutive questions were of the **same type** — very common in a real course, e.g. two `multiple_choice` questions in a row — React would reuse the same component instance instead of remounting it. The result: the next question would render with the *previous* question's selection still highlighted, its options already disabled, or (for word-order) its already-placed word chips carried over.

**Fix:** added `key={exercise.id}` to each exercise component. This forces React to unmount/remount the component whenever the exercise changes, guaranteeing every question starts from a clean state — regardless of whether the type repeats. Re-verified with `tsc`, `eslint`, and a full `expo export` after the change; all still pass.

## Notes (not bugs, by design — see README §13 "Known simplifications")
- Seed data (`supabase/seed.sql`) uses placeholder `https://YOUR_PROJECT.supabase.co/...` audio/thumbnail URLs — this is intentional (no bundled binary media was ever included); every screen already degrades gracefully (loading/error states, thumbnail fallback) when media is missing or a project URL hasn't been swapped in yet. See README §5 for how to point it at your own Supabase Storage bucket.
- Pronunciation exercises reuse the listening UI rather than doing on-device speech scoring (documented, deliberate scope decision).
- Local push-notification toggle isn't wired to a real scheduler yet (documented, deliberate scope decision).

## Result
No other functional, type-safety, or build-breaking issues were found. The app compiles, type-checks, lints, and bundles cleanly, and every core flow (auth → onboarding → stories → tap-to-translate → exercises → vocabulary/spaced-repetition → progress → settings) reads/writes real Supabase data with no stubs.
