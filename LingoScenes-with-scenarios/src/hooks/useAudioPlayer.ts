import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { useAppStore } from '@/store/appStore';

export type AudioState = 'idle' | 'loading' | 'playing' | 'paused' | 'error';

interface UseAudioPlayerOptions {
  id: string; // unique id for this audio instance (e.g. scene id) — used to enforce single playback app-wide
  onFinish?: () => void;
}

/**
 * Wraps expo-av's Audio.Sound with:
 *  - single-instance-at-a-time enforcement across the whole app
 *  - automatic cleanup on unmount / screen blur
 *  - playback-speed control
 *  - loading / error states for the UI
 */
export function useAudioPlayer(url: string | null | undefined, { id, onFinish }: UseAudioPlayerOptions) {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [state, setState] = useState<AudioState>('idle');
  const [positionMillis, setPositionMillis] = useState(0);
  const [durationMillis, setDurationMillis] = useState(0);
  const playbackSpeed = useAppStore((s) => s.playbackSpeed);
  const currentlyPlayingId = useAppStore((s) => s.currentlyPlayingId);
  const setCurrentlyPlayingId = useAppStore((s) => s.setCurrentlyPlayingId);

  const unload = useCallback(async () => {
    if (soundRef.current) {
      try {
        await soundRef.current.unloadAsync();
      } catch {
        // already unloaded — safe to ignore
      }
      soundRef.current = null;
    }
  }, []);

  // If some other player claims the "currently playing" slot, pause this one.
  useEffect(() => {
    if (currentlyPlayingId !== id && state === 'playing') {
      soundRef.current?.pauseAsync();
      setState('paused');
    }
  }, [currentlyPlayingId, id, state]);

  useEffect(() => {
    return () => {
      unload();
    };
  }, [unload, url]);

  const onStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        if (status.error) setState('error');
        return;
      }
      setPositionMillis(status.positionMillis);
      setDurationMillis(status.durationMillis ?? 0);
      if (status.didJustFinish) {
        setState('idle');
        setCurrentlyPlayingId(null);
        onFinish?.();
      }
    },
    [onFinish, setCurrentlyPlayingId]
  );

  const load = useCallback(async () => {
    if (!url) return;
    setState('loading');
    try {
      await unload();
      const { sound } = await Audio.Sound.createAsync(
        { uri: url },
        { shouldPlay: false, rate: playbackSpeed, shouldCorrectPitch: true },
        onStatusUpdate
      );
      soundRef.current = sound;
      setState('paused');
    } catch (err) {
      console.warn('[useAudioPlayer] failed to load audio', err);
      setState('error');
    }
  }, [url, playbackSpeed, unload, onStatusUpdate]);

  const play = useCallback(async () => {
    if (!soundRef.current) {
      await load();
    }
    try {
      setCurrentlyPlayingId(id);
      await soundRef.current?.setRateAsync(playbackSpeed, true);
      await soundRef.current?.playAsync();
      setState('playing');
    } catch (err) {
      console.warn('[useAudioPlayer] failed to play', err);
      setState('error');
    }
  }, [id, load, playbackSpeed, setCurrentlyPlayingId]);

  const pause = useCallback(async () => {
    await soundRef.current?.pauseAsync();
    setState('paused');
  }, []);

  const replay = useCallback(async () => {
    await soundRef.current?.setPositionAsync(0);
    await play();
  }, [play]);

  const seekTo = useCallback(async (millis: number) => {
    await soundRef.current?.setPositionAsync(millis);
  }, []);

  return {
    state,
    isPlaying: state === 'playing',
    positionMillis,
    durationMillis,
    load,
    play,
    pause,
    replay,
    seekTo,
    unload,
  };
}
