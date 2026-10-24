"use client";

import { useEffect, useState } from "react";
import { Mic, Volume2, X } from "lucide-react";
import { useOlarStore } from "@/hooks/useOlarStore";
import { useVoiceConcierge } from "@/hooks/useVoiceConcierge";

const SKIP_KEY = "olar_maya_skip_welcome";

export function MayaWelcomeModal() {
  const {
    mayaOpen,
    setMayaOpen,
    locale,
    t,
    activeBrand,
    setActiveBlade,
    setSelectedNetwork,
    runCampaign,
    setTtsEnabled,
  } = useOlarStore();

  const voice = useVoiceConcierge(locale);
  const [skipNext, setSkipNext] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const skip =
      typeof window !== "undefined" && localStorage.getItem(SKIP_KEY) === "1";
    if (!skip) setMayaOpen(true);
  }, [setMayaOpen]);

  if (!mounted || !mayaOpen) return null;

  const close = () => {
    if (skipNext) localStorage.setItem(SKIP_KEY, "1");
    setMayaOpen(false);
    voice.stopListening();
  };

  const enableAudio = async () => {
    const ok = await voice.unlockAudioAndMic();
    setTtsEnabled(true);
    voice.setTtsEnabled(true);
    if (ok) {
      voice.speak(
        locale === "he"
          ? `שלום! אני מאיה, מנהלת הסושיאל שלך ב-אולר הסושיאל. בוא נרים היום משהו חזק עבור ${activeBrand.name}.`
          : `Hi! I'm Maya, your social manager at Olar Social. Let's build something strong for ${activeBrand.name} today.`,
        locale
      );
    }
  };

  const intents = [
    {
      id: "sale",
      emoji: "🚀",
      he: "קמפיין מכירה / מבצע חדש",
      en: "New sale / promo campaign",
      run: async () => {
        close();
        setActiveBlade("studio");
        await runCampaign(
          locale === "he"
            ? `קמפיין מכירה חדש עבור ${activeBrand.name}`
            : `New sales campaign for ${activeBrand.name}`,
          "sale"
        );
      },
    },
    {
      id: "reels",
      emoji: "🎬",
      he: "תסריט לסרטון רילס / טיקטוק",
      en: "Reels / TikTok video script",
      run: async () => {
        close();
        setActiveBlade("studio");
        setSelectedNetwork("tiktok");
        await runCampaign(
          locale === "he"
            ? `תסריט רילס ויראלי 9:16 עבור ${activeBrand.name}`
            : `Viral 9:16 reel script for ${activeBrand.name}`,
          "reels"
        );
      },
    },
    {
      id: "networks",
      emoji: "🔗",
      he: "חיבור הרשתות החברתיות שלי",
      en: "Connect my social networks",
      run: async () => {
        close();
        setActiveBlade("networks");
      },
    },
    {
      id: "calendar",
      emoji: "📅",
      he: "תכנון יומן פוסטים שבועי אוטומטי",
      en: "Auto weekly post calendar",
      run: async () => {
        close();
        setActiveBlade("studio");
        await runCampaign(
          locale === "he"
            ? `תוכנית תוכן שבועית מלאה עבור ${activeBrand.name}`
            : `Full weekly content plan for ${activeBrand.name}`,
          "weekly"
        );
        setActiveBlade("calendar");
      },
    },
  ] as const;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-900/60 p-4">
      <div className="olar-card max-h-[92vh] w-full max-w-lg overflow-y-auto border-2 border-slate-900 p-5 shadow-2xl md:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-terracotta text-2xl text-white shadow-md">
              👋
            </div>
            <div>
              <h2 className="text-xl font-extrabold leading-snug text-slate-900">
                {t(
                  "שלום! אני מאיה, מנהלת הסושיאל שלך ב-אולר הסושיאל 👋",
                  "Hi! I'm Maya, your social manager at Olar Social 👋"
                )}
              </h2>
            </div>
          </div>
          <button type="button" onClick={close} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-base font-bold text-slate-800">
          {t(
            "אין צורך להסתבך עם תפריטים. מה אנחנו מרימים היום עבור העסק שלך?",
            "No need to dig through menus. What are we launching today for your business?"
          )}
        </p>

        <button
          type="button"
          onClick={() => void enableAudio()}
          className="mb-3 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-900 bg-slate-900 px-4 py-3 text-base font-bold text-white shadow-md hover:bg-slate-800"
        >
          <Volume2 className="h-5 w-5" />
          {t("🔊 הפעל שמע ודיבור (מומלץ)", "🔊 Enable audio & speech (recommended)")}
        </button>

        <button
          type="button"
          onClick={() =>
            voice.toggleListening((text) => {
              voice.speak(
                locale === "he" ? `שמעתי: ${text}` : `Heard: ${text}`,
                locale
              );
            })
          }
          className={`mb-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 text-base font-bold ${
            voice.listening
              ? "animate-pulse border-red-500 bg-red-50 text-red-900"
              : "border-slate-300 bg-white text-slate-900"
          }`}
        >
          <Mic className={`h-5 w-5 ${voice.listening ? "text-red-600" : ""}`} />
          {voice.listening
            ? t("מאיה מקשיבה לך... דבר כעת", "Maya is listening… speak now")
            : t("🎙️ דבר אל מאיה", "🎙️ Talk to Maya")}
        </button>
        {voice.listening && voice.liveTranscript && (
          <p className="mb-3 rounded-lg border-2 border-red-200 bg-red-50 px-3 py-2 text-sm font-bold text-slate-900">
            {voice.liveTranscript}
          </p>
        )}

        <div className="grid gap-2 sm:grid-cols-2">
          {intents.map((intent) => (
            <button
              key={intent.id}
              type="button"
              onClick={() => void intent.run()}
              className="olar-card px-4 py-4 text-start text-base font-extrabold text-slate-900 transition hover:border-terracotta hover:shadow-md"
            >
              <span className="mb-1 block text-2xl">{intent.emoji}</span>
              {locale === "he" ? intent.he : intent.en}
            </button>
          ))}
        </div>

        <label className="mt-5 flex items-center gap-2 text-sm font-bold text-slate-900">
          <input
            type="checkbox"
            checked={skipNext}
            onChange={(e) => setSkipNext(e.target.checked)}
            className="h-4 w-4"
          />
          {t("אל תציג שוב בכניסה הבאה", "Don't show again on next visit")}
        </label>
      </div>
    </div>
  );
}
