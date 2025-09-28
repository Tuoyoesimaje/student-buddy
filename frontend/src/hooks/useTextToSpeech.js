import { useState, useEffect, useRef } from 'react';

const useTextToSpeech = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [speechSettings, setSpeechSettings] = useState(() => {
    try {
      const json = localStorage.getItem('tts.speechSettings');
      return json ? JSON.parse(json) : { rate: 1.0, pitch: 1.0, volume: 1.0 };
    } catch (e) {
      return { rate: 1.0, pitch: 1.0, volume: 1.0 };
    }
  });
  const utteranceRef = useRef(null);
  const queueRef = useRef([]);

  // Enhanced voice loading and selection
  useEffect(() => {
    if ('speechSynthesis' in window) {
      const loadVoices = () => {
        const availableVoices = window.speechSynthesis.getVoices();
        setVoices(availableVoices);

        // Try to restore persisted voice selection first
        try {
          const persistedName = localStorage.getItem('tts.selectedVoiceName');
          if (persistedName) {
            const restored = availableVoices.find(v => v.name === persistedName);
            if (restored) {
              setSelectedVoice(restored);
              console.info('Restored persisted TTS voice:', restored.name);
              return;
            }
          }
        } catch (e) {}

        if (availableVoices.length > 0 && !selectedVoice) {
          // Score voices to pick the best candidate. Prefer voices with:
          // - names containing Neural, WaveNet, Wavenet, Neural2, Premium
          // - provider hints: Google, Microsoft, Amazon, Apple
          // - language starting with en (prefer en-US)
          const scoreVoice = (v) => {
            let score = 0;
            const name = (v.name || '').toLowerCase();
            const lang = (v.lang || '').toLowerCase();

            if (lang.startsWith('en-us')) score += 30;
            else if (lang.startsWith('en')) score += 20;

            if (name.includes('neural') || name.includes('wavenet') || name.includes('wave')) score += 40;
            if (name.includes('google')) score += 25;
            if (name.includes('microsoft')) score += 20;
            if (name.includes('amazon') || name.includes('polly')) score += 15;
            if (name.includes('samantha') || name.includes('alex') || name.includes('victoria')) score += 10;
            if (v.default) score += 5;

            // Prefer non-localService voices slightly (often cloud-backed, higher quality)
            try {
              if (v.localService === false) score += 3;
            } catch (e) {}

            return score;
          };

          let best = availableVoices[0];
          let bestScore = -Infinity;
          for (const v of availableVoices) {
            const s = scoreVoice(v);
            if (s > bestScore) {
              bestScore = s;
              best = v;
            }
          }

          setSelectedVoice(best);
          try { localStorage.setItem('tts.selectedVoiceName', best.name); } catch (e) {}
          console.info('Selected TTS voice:', best?.name, best?.lang, 'score=', bestScore);
        }
      };

      // Initial load
      loadVoices();

      // Listen for voice changes (important for Chrome)
      window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

      // Force voice loading in Chrome
      if (window.speechSynthesis.getVoices().length === 0) {
        window.speechSynthesis.speak(new SpeechSynthesisUtterance(''));
      }

      return () => {
        window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      };
    }
  }, [selectedVoice]);

  const speak = (text) => {
    if (!('speechSynthesis' in window) || !window.SpeechSynthesisUtterance) {
      console.error('Web Speech API or SpeechSynthesisUtterance is not supported.');
      return;
    }

    // Cancel any ongoing speech
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      queueRef.current = [];
    }

    // Clean and prepare text
    const cleanText = text
      .replace(/\s+/g, ' ') // Replace multiple spaces with single space
      .replace(/[^\w\s.,!?;:()-]/g, '') // Remove special characters that might cause issues
      .trim();

    if (!cleanText) return;

  const MAX_CHUNK_LENGTH = 300; // Larger chunks produce more natural prosody in Edge

    const speakChunk = (chunk, chunkIndex, totalChunks) => {
      const utterance = new SpeechSynthesisUtterance(chunk);
      utteranceRef.current = utterance;

      // Use selected voice or fallback and set utterance.lang when possible
      if (selectedVoice) {
        utterance.voice = selectedVoice;
        try { utterance.lang = selectedVoice.lang || utterance.lang; } catch (e) {}
      }

      // Enhanced voice settings for more natural speech
      utterance.rate = speechSettings.rate; // Slightly slower for clarity
      utterance.pitch = speechSettings.pitch; // Natural pitch
      utterance.volume = speechSettings.volume;

      // Add natural pauses
      if (chunk.endsWith('.') || chunk.endsWith('!') || chunk.endsWith('?')) {
        utterance.rate = speechSettings.rate * 0.95; // Slightly slower for sentence endings
      }

      utterance.onstart = () => {
        if (chunkIndex === 0) {
          setIsSpeaking(true);
        }
      };

      utterance.onend = () => {
        // Process next chunk in queue
        queueRef.current.shift();
        if (queueRef.current.length > 0) {
          const nextChunk = queueRef.current[0];
          setTimeout(() => speakChunk(nextChunk.text, nextChunk.index, totalChunks), 100);
        } else {
          setIsSpeaking(false);
        }
      };

      utterance.onerror = (event) => {
        console.error('SpeechSynthesisUtterance error:', event.error);
        // Try to skip this chunk and continue
        queueRef.current.shift();
        if (queueRef.current.length > 0) {
          const nextChunk = queueRef.current[0];
          setTimeout(() => speakChunk(nextChunk.text, nextChunk.index, totalChunks), 200);
        } else {
          setIsSpeaking(false);
        }
      };

      try {
        window.speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Error speaking utterance:', error);
        queueRef.current = [];
        setIsSpeaking(false);
      }
    };

    const trySpeak = (fullText) => {
      if (!selectedVoice && voices.length === 0) {
        console.warn('No voices available. Trying again in 500ms...');
        setTimeout(() => trySpeak(fullText), 500);
        return;
      }

      // Smart text chunking for better speech flow
      const chunks = [];

      // First, split by sentences
      const sentences = fullText.match(/[^.!?]+[.!?]+/g) || [fullText];
      let currentChunk = '';

      for (const sentence of sentences) {
        const trimmedSentence = sentence.trim();

        // If adding this sentence would exceed the limit, save current chunk and start new one
        if (currentChunk && (currentChunk + ' ' + trimmedSentence).length > MAX_CHUNK_LENGTH) {
          chunks.push(currentChunk.trim());
          currentChunk = trimmedSentence;
        } else {
          currentChunk = currentChunk ? currentChunk + ' ' + trimmedSentence : trimmedSentence;
        }
      }

      // Add the last chunk
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim());
      }

      // If we still have chunks that are too long, split them further
      const finalChunks = [];
      for (const chunk of chunks) {
        if (chunk.length <= MAX_CHUNK_LENGTH) {
          finalChunks.push(chunk);
        } else {
          // Split long chunks by commas or natural breaks
          const subChunks = chunk.match(/.{1,160}(?:\s|$)/g) || [chunk];
          finalChunks.push(...subChunks.map(c => c.trim()).filter(c => c));
        }
      }

      // Queue all chunks
      queueRef.current = finalChunks.map((text, index) => ({ text, index }));

      // Start speaking the first chunk
      if (queueRef.current.length > 0) {
        const firstChunk = queueRef.current[0];
        speakChunk(firstChunk.text, firstChunk.index, finalChunks.length);
      }
    };

    trySpeak(cleanText);
  };

  const cancel = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      queueRef.current = [];
      setIsSpeaking(false);
    }
  };

  const pause = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
    }
  };

  const resume = () => {
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }
  };

  const updateSettings = (newSettings) => {
    setSpeechSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try { localStorage.setItem('tts.speechSettings', JSON.stringify(updated)); } catch (e) {}
      return updated;
    });
  };

  const changeVoice = (voiceName) => {
    const voice = voices.find(v => v.name === voiceName);
    if (voice) {
      setSelectedVoice(voice);
      try { localStorage.setItem('tts.selectedVoiceName', voice.name); } catch (e) {}
    }
  };

  const clearPersistedVoice = () => {
    try { localStorage.removeItem('tts.selectedVoiceName'); } catch (e) {}
    setSelectedVoice(null);
  };

  return {
    speak,
    cancel,
    pause,
    resume,
    isSpeaking,
    voices,
    selectedVoice,
    speechSettings,
    updateSettings,
    changeVoice
  , clearPersistedVoice
  };
};

export default useTextToSpeech;