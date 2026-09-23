import AsyncStorage from '@react-native-async-storage/async-storage';

// Generic, tiny local cache on top of AsyncStorage. Used wherever a screen
// needs to keep showing the last-known-good data when the network is
// unavailable (FR-01 §34 Offline/Cache Requirements, §36 Error State: "If
// cached data exists, show the cached content instead of replacing the
// screen with an error.").
//
// This is intentionally simple (JSON + a timestamp, no eviction policy) —
// it is a resilience layer on top of TanStack Query's in-memory cache, not
// a replacement for a full offline-write-queue (see README §13, which
// documents that as a deliberate follow-up for this codebase).

const PREFIX = '@lingoscenes/cache/';

interface CacheEnvelope<T> {
  cachedAt: number;
  value: T;
}

export const localCache = {
  async set<T>(key: string, value: T): Promise<void> {
    try {
      const envelope: CacheEnvelope<T> = { cachedAt: Date.now(), value };
      await AsyncStorage.setItem(PREFIX + key, JSON.stringify(envelope));
    } catch (err) {
      console.warn('[localCache.set]', key, err);
    }
  },

  /** Returns the cached value regardless of age, or null if never cached / unreadable. */
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const envelope = JSON.parse(raw) as CacheEnvelope<T>;
      return envelope.value;
    } catch (err) {
      console.warn('[localCache.get]', key, err);
      return null;
    }
  },

  /** Returns the cached value only if it's newer than `maxAgeMs`. */
  async getFresh<T>(key: string, maxAgeMs: number): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(PREFIX + key);
      if (!raw) return null;
      const envelope = JSON.parse(raw) as CacheEnvelope<T>;
      if (Date.now() - envelope.cachedAt > maxAgeMs) return null;
      return envelope.value;
    } catch (err) {
      console.warn('[localCache.getFresh]', key, err);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(PREFIX + key);
    } catch (err) {
      console.warn('[localCache.remove]', key, err);
    }
  },
};
