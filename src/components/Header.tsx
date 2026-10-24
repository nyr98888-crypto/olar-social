"use client";

import { useEffect, useRef, useState } from "react";
import { Hand, Languages, Sparkles, Volume2 } from "lucide-react";
import { useOlarStore } from "@/hooks/useOlarStore";
import { AiStatusBadge } from "@/components/AiStatusBadge";
import { HeaderActivityPill } from "@/components/ProgressOverlay";
import { AuthModal, AuthPill } from "@/components/AuthModal";
import type { OperatingMode } from "@/types/olar";

const MODES: { id: OperatingMode; he: string; en: string }[] = [
  { id: "manual", he: "ידני", en: "Manual" },
  { id: "hybrid", he: "היברידי", en: "Hybrid Co-Pilot" },
  { id: "auto", he: "אוטומטי מלא", en: "Full Auto" },
];

export function Header() {
  const {
    activeBrand,
    operatingMode,
    locale,
    setBrandName,
    setOperatingMode,
    setLocale,
    setMayaOpen,
    ttsEnabled,
    setTtsEnabled,
    briefing,
    t,
  } = useOlarStore();

  const [localName, setLocalName] = useState(activeBrand.name);
  const [authOpen, setAuthOpen] = useState(false);
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setLocalName(activeBrand.name);
  }, [activeBrand.name]);

  const speakBriefing = () => {
    if (typeof window === "undefined" || !window.speechSynthesis) return;
    setTtsEnabled(true);
    window.speechSynthesis.cancel();
    const text =
      locale === "he" ? briefing.summaryHe : briefing.summaryEn;
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = locale === "he" ? "he-IL" : "en-US";
    window.speechSynthesis.speak(utter);
  };

  return (
    <>
      <header className="sticky top-0 z-40 border-b-2 border-slate-300 bg-porcelain/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-3 md:flex-row md:items-center md:gap-4 md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-terracotta text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-extrabold tracking-tight text-slate-900 md:text-xl">
                {t("אולר הסושיאל", "Olar Social")}
              </h1>
              <p className="truncate text-[11px] font-medium text-slate-700 md:text-xs">
                {t(
                  "המולטי-טול שלך לסושיאל • בשליפה אחת",
                  "Your social multi-tool • one pull"
                )}
              </p>
            </div>
          </div>

          <div className="flex flex-1 justify-center">
            <label className="w-full max-w-xs">
              <span className="sr-only">{t("שם מותג", "Brand name")}</span>
              <input
                value={localName}
                onFocus={() => {
                  focused.current = true;
                }}
                onBlur={() => {
                  focused.current = false;
                  setBrandName(localName.trim() || activeBrand.name);
                }}
                onChange={(e) => {
                  const v = e.target.value;
                  setLocalName(v);
                  setBrandName(v);
                }}
                className="w-full rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-center text-sm font-bold text-slate-900 outline-none transition focus:border-terracotta focus:ring-2 focus:ring-terracotta/15"
                placeholder={t("שם המותג", "Brand name")}
                dir={locale === "he" ? "rtl" : "ltr"}
              />
            </label>
          </div>

          <div className="flex flex-1 flex-wrap items-center justify-end gap-2">
            <HeaderActivityPill />
            <AuthPill onOpen={() => setAuthOpen(true)} />
            <AiStatusBadge />

            <button
              type="button"
              onClick={() => setMayaOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-900 hover:border-terracotta"
            >
              <Hand className="h-3.5 w-3.5 text-terracotta" />
              {t("👋 עוזרת אישית", "👋 Personal assistant")}
            </button>

            <button
              type="button"
              onClick={() => {
                setTtsEnabled(!ttsEnabled);
                if (!ttsEnabled) speakBriefing();
                else window.speechSynthesis?.cancel();
              }}
              className={`inline-flex items-center gap-1.5 rounded-xl border-2 px-2.5 py-1.5 text-[11px] font-bold ${
                ttsEnabled
                  ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                  : "border-slate-300 bg-white text-slate-900"
              }`}
            >
              <Volume2 className="h-3.5 w-3.5" />
              {t("🔊 הקראה קולית", "🔊 Voice readout")}
            </button>

            <div className="flex rounded-xl border-2 border-slate-300 bg-white p-1">
              {MODES.map((mode) => (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setOperatingMode(mode.id)}
                  className={`rounded-lg px-2.5 py-1.5 text-[11px] font-bold transition md:text-xs ${
                    operatingMode === mode.id
                      ? "bg-terracotta text-white"
                      : "text-slate-800 hover:bg-porcelain"
                  }`}
                >
                  {locale === "he" ? mode.he : mode.en}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setLocale(locale === "he" ? "en" : "he")}
              className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-900 hover:border-terracotta"
            >
              <Languages className="h-3.5 w-3.5 text-terracotta" />
              {locale === "he" ? "English" : "עברית"}
            </button>
          </div>
        </div>
      </header>
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
}
