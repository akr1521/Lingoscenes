import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

// Note: we deliberately do NOT pass the generated `Database` type as a generic
// here. Supabase-js's generic typing requires a full Database shape (Row +
// Insert + Update + Relationships for every table) to type query builders
// correctly; a hand-maintained partial version produces `never` types on
// insert/update calls that are worse than no typing at all. Instead, each
// service function in src/services/* casts query results to the row types
// in src/types/database.ts at the boundary, which gives the same safety
// where it matters (call sites) without fighting the generic.
//
// To get fully generated, 100%-accurate types instead, run:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts
// and re-add `createClient<Database>(...)` once that file matches the
// generic shape supabase-js expects.

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY. ' +
      'Copy .env.example to .env and fill in your project credentials.'
  );
}

export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '', {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
