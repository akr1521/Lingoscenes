import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

export type PronunciationRecorderState = 'idle' | 'recording' | 'recorded' | 'error';

export function usePronunciationRecorder() {
  const recordingRef = useRef<Audio.Recording | null>(null);
  const recordingUriRef = useRef<string | null>(null);
  const playbackRef = useRef<Audio.Sound | null>(null);
  const [state, setState] = useState<PronunciationRecorderState>('idle');
  const [error, setError] = useState<string | null>(null);

  const unloadPlayback = useCallback(async () => {
    if (playbackRef.current) {
      await playbackRef.current.unloadAsync();
      playbackRef.current = null;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      const permission = await Audio.requestPermissionsAsync();
      if (!permission.granted) {
        setError('Microphone access is needed to record your pronunciation.');
        setState('error');
        return;
      }

      await unloadPlayback();
      recordingUriRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setError(null);
      setState('recording');
    } catch (cause) {
      console.warn('[usePronunciationRecorder] failed to start recording', cause);
      setError('Unable to start the microphone. Please try again.');
      setState('error');
    }
  }, [unloadPlayback]);

  const stopRecording = useCallback(async () => {
    const recording = recordingRef.current;
    if (!recording) return;

    try {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      recordingRef.current = null;
      recordingUriRef.current = uri;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false, playsInSilentModeIOS: true });
      setState(uri ? 'recorded' : 'idle');
    } catch (cause) {
      console.warn('[usePronunciationRecorder] failed to stop recording', cause);
      setError('Your recording could not be saved. Please record it again.');
      setState('error');
    }
  }, []);

  const playRecording = useCallback(async () => {
    const uri = recordingUriRef.current;
    if (!uri) {
      setError('Record your pronunciation before playing it back.');
      return;
    }

    try {
      await unloadPlayback();
      const { sound } = await Audio.Sound.createAsync({ uri }, { shouldPlay: true });
      playbackRef.current = sound;
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          unloadPlayback().catch((cause) => console.warn('[usePronunciationRecorder] failed to unload recording', cause));
        }
      });
    } catch (cause) {
      console.warn('[usePronunciationRecorder] failed to play recording', cause);
      setError('Unable to play your recording. Please try again.');
    }
  }, [unloadPlayback]);

  const reset = useCallback(async () => {
    await unloadPlayback();
    recordingRef.current = null;
    recordingUriRef.current = null;
    setError(null);
    setState('idle');
  }, [unloadPlayback]);

  useEffect(() => {
    return () => {
      if (recordingRef.current) {
        recordingRef.current.stopAndUnloadAsync().catch(() => {});
      }
      unloadPlayback().catch(() => {});
    };
  }, [unloadPlayback]);

  return { state, error, startRecording, stopRecording, playRecording, reset };
}
