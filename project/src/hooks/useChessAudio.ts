import { useRef, useCallback } from 'react';

interface ChessAudioHook {
  playMoveSound: () => void;
  playCaptureSound: () => void;
  playCheckSound: () => void;
  playGameEndSound: () => void;
  speakMessage: (message: string, gender: 'male' | 'female') => void;
  stopSpeaking: () => void;
}

export const useChessAudio = (): ChessAudioHook => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const speechSynthesisRef = useRef<SpeechSynthesisUtterance | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const createTone = useCallback((frequency: number, duration: number, volume: number = 0.1) => {
    const audioContext = initAudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
    oscillator.type = 'sine';

    gainNode.gain.setValueAtTime(0, audioContext.currentTime);
    gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + duration);
  }, [initAudioContext]);

  const playMoveSound = useCallback(() => {
    // Chess.com style move sound - two quick tones
    createTone(800, 0.1, 0.15);
    setTimeout(() => createTone(600, 0.1, 0.1), 50);
  }, [createTone]);

  const playCaptureSound = useCallback(() => {
    // Capture sound - sharper, more aggressive
    createTone(1200, 0.15, 0.2);
    setTimeout(() => createTone(400, 0.1, 0.15), 80);
  }, [createTone]);

  const playCheckSound = useCallback(() => {
    // Check sound - warning tone
    createTone(1000, 0.2, 0.25);
    setTimeout(() => createTone(1200, 0.15, 0.2), 100);
    setTimeout(() => createTone(1000, 0.1, 0.15), 200);
  }, [createTone]);

  const playGameEndSound = useCallback(() => {
    // Game end sound - triumphant or dramatic
    createTone(523, 0.3, 0.2); // C
    setTimeout(() => createTone(659, 0.3, 0.2), 150); // E
    setTimeout(() => createTone(784, 0.5, 0.25), 300); // G
  }, [createTone]);

  const speakMessage = useCallback((message: string, gender: 'male' | 'female') => {
    if ('speechSynthesis' in window) {
      // Stop any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(message);
      
      // Configure voice based on gender
      const voices = window.speechSynthesis.getVoices();
      
      if (gender === 'male') {
        // Find a male voice or use default with lower pitch
        const maleVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('male') ||
          voice.name.toLowerCase().includes('david') ||
          voice.name.toLowerCase().includes('mark') ||
          voice.name.toLowerCase().includes('alex')
        );
        
        if (maleVoice) {
          utterance.voice = maleVoice;
        }
        
        utterance.pitch = 0.8; // Lower pitch for male
        utterance.rate = 1.1; // Slightly faster for trash talk
        utterance.volume = 0.8;
      } else {
        // Find a female voice or use default with higher pitch
        const femaleVoice = voices.find(voice => 
          voice.name.toLowerCase().includes('female') ||
          voice.name.toLowerCase().includes('samantha') ||
          voice.name.toLowerCase().includes('victoria') ||
          voice.name.toLowerCase().includes('karen') ||
          voice.name.toLowerCase().includes('susan')
        );
        
        if (femaleVoice) {
          utterance.voice = femaleVoice;
        }
        
        utterance.pitch = 1.2; // Higher pitch for female
        utterance.rate = 0.9; // Slightly slower for sweet tone
        utterance.volume = 0.7;
      }

      speechSynthesisRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, []);

  return {
    playMoveSound,
    playCaptureSound,
    playCheckSound,
    playGameEndSound,
    speakMessage,
    stopSpeaking
  };
};