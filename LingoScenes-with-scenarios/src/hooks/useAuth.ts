import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { authService } from '@/services/authService';

/**
 * Mounted once at the app root. Restores any persisted session on launch,
 * subscribes to auth state changes (login/logout/token refresh/expiry), and
 * keeps the profile row in sync with the store.
 */
export function useAuthListener() {
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setInitializing = useAuthStore((s) => s.setInitializing);

  useEffect(() => {
    let mounted = true;

    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        if (session?.user) {
          const profile = await authService.ensureProfile(session.user.id, session.user.email ?? '');
          if (mounted) setProfile(profile);
        }
      })
      .catch(() => {
        if (mounted) setSession(null);
      })
      .finally(() => {
        if (mounted) setInitializing(false);
      });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;
      setSession(session);
      if (session?.user) {
        const profile =
          event === 'SIGNED_IN' || event === 'USER_UPDATED'
            ? await authService.ensureProfile(session.user.id, session.user.email ?? '')
            : await authService.getProfile(session.user.id);
        if (mounted) setProfile(profile);
      } else {
        setProfile(null);
      }
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [setSession, setProfile, setInitializing]);
}
