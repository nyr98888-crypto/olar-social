"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Locale } from "@/types/olar";

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionEventLike = {
  resultIndex: number;
  results: ArrayLike<{
    isFinal: boolean;
    0: { transcript: string };
  }>;
};

function getRecognitionCtor():
  | (new () => SpeechRecognitionLike)
  | null {
  if (typeof window === "undefined") return null;
  const w = window as Window & {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function useVoiceConcierge(locale: Locale) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalRef = useRef<(text: string) => void>(() => undefined);

  useEffect(() => {
    setSupported(!!getRecognitionCtor());
    return () => {
      recognitionRef.current?.abort();
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, []);

  const unlockAudioAndMic = useCallback(async (): Promise<boolean> => {
    try {
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
      }
      if (typeof window !== "undefined" && window.speechSynthesis) {
        // Unlock TTS on user gesture
        const utter = new SpeechSynthesisUtterance(" ");
        utter.volume = 0;
        window.speechSynthesis.speak(utter);
        window.speechSynthesis.cancel();
      }
      setAudioUnlocked(true);
      setTtsEnabled(true);
      return true;
    } catch {
      setAudioUnlocked(false);
      return false;
    }
  }, []);

  const speak = useCallback(
    (text: string, forceLang?: Locale) => {
      if (typeof window === "undefined" || !window.speechSynthesis) return;
      if (!ttsEnabled && !forceLang) return;
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      const lang = forceLang ?? locale;
      utter.lang = lang === "he" ? "he-IL" : "en-US";
      utter.rate = 1.02;
      utter.pitch = 1.05;
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) =>
        lang === "he"
          ? v.lang.startsWith("he")
          : v.lang.startsWith("en")
      );
      if (match) utter.voice = match;
      window.speechSynthesis.speak(utter);
    },
    [locale, ttsEnabled]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setListening(false);
  }, []);

  const startListening = useCallback(
    (onFinal: (text: string) => void) => {
      const Ctor = getRecognitionCtor();
      if (!Ctor) return false;
      onFinalRef.current = onFinal;
      recognitionRef.current?.abort();
      const rec = new Ctor();
      rec.lang = locale === "he" ? "he-IL" : "en-US";
      rec.continuous = true;
      rec.interimResults = true;
      setLiveTranscript("");
      rec.onresult = (event) => {
        let interim = "";
        let finalChunk = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const piece = event.results[i][0].transcript;
          if (event.results[i].isFinal) finalChunk += piece;
          else interim += piece;
        }
        setLiveTranscript((prev) => (finalChunk ? `${prev} ${finalChunk}`.trim() : interim || prev));
        if (finalChunk.trim()) {
          onFinalRef.current(finalChunk.trim());
        }
      };
      rec.onerror = () => setListening(false);
      rec.onend = () => setListening(false);
      recognitionRef.current = rec;
      try {
        rec.start();
        setListening(true);
        return true;
      } catch {
        setListening(false);
        return false;
      }
    },
    [locale]
  );

  const toggleListening = useCallback(
    (onFinal: (text: string) => void) => {
      if (listening) {
        stopListening();
        return;
      }
      void unlockAudioAndMic().then(() => startListening(onFinal));
    },
    [listening, startListening, stopListening, unlockAudioAndMic]
  );

  return {
    listening,
    supported,
    ttsEnabled,
    setTtsEnabled,
    audioUnlocked,
    liveTranscript,
    unlockAudioAndMic,
    speak,
    startListening,
    stopListening,
    toggleListening,
  };
}
