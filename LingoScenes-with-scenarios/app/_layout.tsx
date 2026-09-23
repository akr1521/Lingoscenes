import 'react-native-gesture-handler';
import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Audio } from 'expo-av';
import { useAuthListener } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { colors } from '@/theme';
import { LoadingState } from '@/components/LoadingState';

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function isPublicUnauthedRoute(segments: string[]) {
  const root = segments[0];
  return !root || root === 'index' || root === '(auth)';
}

/**
 * Redirects based on auth + onboarding state:
 *  - no session: landing + auth screens are public; everything else -> landing
 *  - session but onboarding not completed -> (onboarding)
 *  - session + onboarding done -> app tabs (and off landing/auth)
 */
function useRouteGuard() {
  const { session, profile, isInitializing } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isInitializing) return;

    const group = segments[0];
    const inAuthGroup = group === '(auth)';
    const inOnboardingGroup = group === '(onboarding)';
    const onLanding = !group || group === 'index';

    if (!session) {
      if (!isPublicUnauthedRoute(segments)) {
        router.replace('/');
      }
      return;
    }

    const onboardingDone = profile?.onboarding_completed ?? false;

    if (!onboardingDone && !inOnboardingGroup) {
      router.replace('/(onboarding)/language');
      return;
    }

    if (onboardingDone && (inAuthGroup || inOnboardingGroup || onLanding)) {
      router.replace('/(tabs)/home');
    }
  }, [session, profile, isInitializing, segments, router]);
}

function RootNavigator() {
  const isInitializing = useAuthStore((s) => s.isInitializing);
  useAuthListener();
  useRouteGuard();

  if (isInitializing) {
    return <LoadingState label="Getting things ready…" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.navy } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(onboarding)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="foundations/index" options={{ presentation: 'card' }} />
      <Stack.Screen name="foundations/alphabet" options={{ presentation: 'card' }} />
      <Stack.Screen name="foundations/phrases" options={{ presentation: 'card' }} />
      <Stack.Screen name="story/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="exercise/[id]" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="scenario-category/[slug]" options={{ presentation: 'card' }} />
      <Stack.Screen name="scenario/[id]" options={{ presentation: 'card' }} />
      <Stack.Screen name="scenario-player/[id]" options={{ presentation: 'fullScreenModal' }} />
      <Stack.Screen name="settings/index" options={{ presentation: 'modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    }).catch(() => {});
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <StatusBar style="light" />
        <RootNavigator />
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
