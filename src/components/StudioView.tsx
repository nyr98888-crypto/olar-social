"use client";

import { useEffect, useMemo, useState } from "react";
import {
  CalendarPlus,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  ExternalLink,
  ImageIcon,
  Loader2,
  Mic,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { useOlarStore } from "@/hooks/useOlarStore";
import { SocialLogo } from "@/components/icons/SocialLogos";
import { ProgressOverlay } from "@/components/ProgressOverlay";
import { useVoiceConcierge } from "@/hooks/useVoiceConcierge";
import type { NetworkId } from "@/types/olar";
import { NETWORK_META, PLATFORM_BRAND } from "@/types/olar";

const TRIGGERS = [
  {
    id: "value",
    he: "פוסט תדמית וערך",
    en: "Authority & value post",
    promptHe: "צור פוסט תדמית וערך שמחזק אמון",
    promptEn: "Create an authority and value post",
  },
  {
    id: "reels",
    he: "תסריט רילס / טיקטוק ויראלי",
    en: "Viral Reels / TikTok script",
    promptHe: "כתוב תסריט רילס ויראלי עם הוק חזק",
    promptEn: "Write a viral reel script with a strong hook",
  },
  {
    id: "sale",
    he: "קמפיין מכירה / מבצע בזק",
    en: "Flash sale campaign",
    promptHe: "בנה קמפיין מכירה קצר וממוקד",
    promptEn: "Build a short focused sales campaign",
  },
  {
    id: "weekly",
    he: "תוכנית תוכן שבועית",
    en: "Weekly content plan",
    promptHe: "תכנן שבוע תוכן מלא למותג",
    promptEn: "Plan a full weekly content calendar",
  },
] as const;

const PLATFORM_ORDER: NetworkId[] = [
  "instagram",
  "facebook",
  "tiktok",
  "youtube",
  "x",
  "pinterest",
  "linkedin",
  "threads",
  "google",
  "whatsapp",
  "telegram",
];

function aspectClass(ratio: string): string {
  if (ratio === "9:16") return "aspect-[9/16] max-h-[520px]";
  if (ratio === "2:3") return "aspect-[2/3] max-h-[480px]";
  if (ratio === "16:9") return "aspect-video";
  return "aspect-square max-h-[420px]";
}

function formatTime(iso?: string, locale?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString(locale === "he" ? "he-IL" : "en-US", {
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    day: "numeric",
    month: "short",
  });
}

export function StudioView() {
  const store = useOlarStore();
  const {
    activeBrand,
    locale,
    t,
    briefing,
    briefingCollapsed,
    toggleBriefing,
    operatingMode,
    aiEngineMode,
    setAiEngineMode,
    approveAllHybrid,
    selectedNetworkId,
    setSelectedNetwork,
    networks,
    posts,
    currentDraft,
    isLoading,
    loadingStatus,
    lastAiError,
    clearAiError,
    imageLoading,
    runCampaign,
    setDraftField,
    setDraftHashtags,
    swapDraftImage,
    saveDraft,
    pushToast,
    setCurrentDraft,
  } = store;

  const [prompt, setPrompt] = useState("");
  const [imgReady, setImgReady] = useState(false);
  const network = networks.find((n) => n.id === selectedNetworkId)!;
  const voice = useVoiceConcierge(locale);

  useEffect(() => {
    setImgReady(false);
  }, [currentDraft?.imageUrl]);

  const dailyPosts = useMemo(
    () =>
      posts
        .filter((p) => p.status === "queued")
        .sort((a, b) => (a.scheduledAt || "").localeCompare(b.scheduledAt || ""))
        .slice(0, 6),
    [posts]
  );

  const onSend = async (text?: string, type?: string) => {
    const value = (text ?? prompt).trim();
    if (!value) return;
    setImgReady(false);
    await runCampaign(value, type);
    if (!text) setPrompt("");
  };

  const copyPrivate = async () => {
    if (!currentDraft) return;
    const payload = [
      currentDraft.headline,
      currentDraft.body,
      currentDraft.hashtags.join(" "),
    ]
      .filter(Boolean)
      .join("\n\n");
    await navigator.clipboard.writeText(payload);
    pushToast(t("הטקסט הועתק", "Caption copied"));
  };

  const downloadMedia = async () => {
    if (!currentDraft?.imageUrl) return;
    try {
      const res = await fetch(currentDraft.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeBrand.name}-${selectedNetworkId}.jpg`;
      a.click();
      URL.revokeObjectURL(url);
      pushToast(t("המדיה ירדה", "Media downloaded"));
    } catch {
      window.open(currentDraft.imageUrl, "_blank");
      pushToast(t("נפתח חלון הורדה", "Opened download"), "info");
    }
  };

  const openApp = () => {
    const url = network.profileUrl || network.deepLink;
    window.open(url, "_blank");
    pushToast(t("נפתחת האפליקציה", "Opening app"), "info");
  };

  const quickPublish = () => {
    if (network.accountType === "business" && network.connected) {
      const when = new Date();
      when.setHours(when.getHours() + 1);
      saveDraft("scheduled", when.toISOString());
      pushToast(t("פורסם לתור העסקי", "Queued for business publish"));
    } else {
      void copyPrivate();
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-5 md:px-6 md:py-6">
      {lastAiError && (
        <div
          className="flex items-start gap-3 rounded-xl border-2 border-red-400 bg-red-50 px-4 py-3 text-base font-medium text-red-900"
          role="alert"
        >
          <p className="flex-1">
            <span className="font-extrabold">{t("שגיאת OpenRouter:", "OpenRouter error:")}</span>{" "}
            {lastAiError}
          </p>
          <button type="button" onClick={clearAiError} className="shrink-0 p-1" aria-label="dismiss">
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Daily Agent */}
      <section className="olar-card overflow-hidden">
        <button
          type="button"
          onClick={toggleBriefing}
          className="flex w-full items-center justify-between gap-3 px-4 py-4 text-start hover:bg-slate-50"
        >
          <div className="flex min-w-0 items-center gap-2">
            <Sparkles className="h-5 w-5 shrink-0 text-terracotta" />
            <p className="truncate text-base font-bold text-slate-900">
              {locale === "he" ? briefing.summaryHe : briefing.summaryEn}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {(operatingMode === "hybrid" || operatingMode === "auto") &&
              dailyPosts.length > 0 && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    approveAllHybrid();
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.stopPropagation();
                      approveAllHybrid();
                    }
                  }}
                  className="olar-btn-accent px-4 py-2 text-sm"
                >
                  {t("אשר הכל", "Approve all")}
                </span>
              )}
            {briefingCollapsed ? (
              <ChevronDown className="h-5 w-5 text-slate-700" />
            ) : (
              <ChevronUp className="h-5 w-5 text-slate-700" />
            )}
          </div>
        </button>

        {!briefingCollapsed && (
          <div className="space-y-4 border-t-2 border-slate-300 px-4 py-4">
            <div className="grid gap-2 md:grid-cols-3">
              <p className="text-base font-medium text-slate-900">
                {locale === "he" ? briefing.topInsightHe : briefing.topInsightEn}
              </p>
              <p className="text-base font-medium text-slate-900">
                {t("משימה יומית", "Daily mission")}:{" "}
                {locale === "he" ? briefing.dailyMissionHe : briefing.dailyMissionEn}
              </p>
              <p className="text-base font-bold text-slate-900">
                {t("מוכן לאישור", "Ready to approve")}: {dailyPosts.length}
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              {dailyPosts.length === 0 && (
                <p className="text-base font-medium text-slate-700 md:col-span-3">
                  {t("אין פוסטים ממתינים בתור", "No posts waiting in queue")}
                </p>
              )}
              {dailyPosts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setCurrentDraft(p);
                    setSelectedNetwork(p.networkId);
                  }}
                  className="olar-card p-3 text-start transition hover:border-terracotta hover:shadow-md"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-bold text-white"
                      style={{
                        background: PLATFORM_BRAND[p.networkId].bg,
                        color: PLATFORM_BRAND[p.networkId].color,
                      }}
                    >
                      {locale === "he"
                        ? NETWORK_META[p.networkId].nameHe
                        : NETWORK_META[p.networkId].name}
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {formatTime(p.scheduledAt, locale)}
                    </span>
                  </div>
                  <p className="olar-card-title line-clamp-2">{p.headline}</p>
                  <p className="mt-1 line-clamp-3 text-sm font-medium text-slate-800">
                    {p.body}
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="order-1 space-y-4 lg:order-2">
          <div>
            <h2 className="olar-section-title">
              {t(
                `מה שולפים היום עבור ${activeBrand.name}?`,
                `What are we pulling today for ${activeBrand.name}?`
              )}
            </h2>
            <p className="mt-1 text-base font-medium text-slate-800">
              {t(
                "בחרו טריגר מהיר או כתבו בקשה חופשית — התוכן נבנה לפי DNA המותג",
                "Pick a quick trigger or free prompt — content uses Brand DNA"
              )}
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {TRIGGERS.map((tr) => (
              <button
                key={tr.id}
                type="button"
                disabled={isLoading}
                onClick={() =>
                  onSend(locale === "he" ? tr.promptHe : tr.promptEn, tr.id)
                }
                className="olar-card px-4 py-3 text-start text-base font-bold text-slate-900 transition hover:border-terracotta hover:shadow-md disabled:opacity-60"
              >
                {locale === "he" ? tr.he : tr.en}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 rounded-xl border-2 border-slate-300 bg-white p-1.5">
            <button
              type="button"
              onClick={() => setAiEngineMode("free")}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                aiEngineMode === "free"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t("מצב מנוע: חינם (Free Tier) ⚡", "Engine: Free Tier ⚡")}
            </button>
            <button
              type="button"
              onClick={() => setAiEngineMode("pro")}
              className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold transition ${
                aiEngineMode === "pro"
                  ? "bg-orange-600 text-white shadow-sm"
                  : "text-slate-900 hover:bg-slate-50"
              }`}
            >
              {t("מצב מנוע: משימות כבדות (Pro) 🔥", "Engine: Heavy (Pro) 🔥")}
            </button>
          </div>

          <div className="olar-card p-3">
            <div className="flex gap-2">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={3}
                placeholder={t(
                  "לדוגמה: צבע ופחחות לרכב…",
                  "e.g. bodywork and paint…"
                )}
                className="olar-input min-h-[88px] flex-1 resize-none"
              />
              <button
                type="button"
                onClick={() =>
                  voice.toggleListening((text) => {
                    setPrompt((prev) => (prev ? `${prev} ${text}` : text));
                  })
                }
                className={`inline-flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-xl border-2 shadow-md ${
                  voice.listening
                    ? "animate-pulse border-red-500 bg-red-50 text-red-700"
                    : "border-slate-300 bg-white text-slate-900"
                }`}
                title={t("🎙️ דבר אל מאיה", "🎙️ Talk to Maya")}
              >
                <Mic className="h-5 w-5" />
              </button>
              <button
                type="button"
                disabled={isLoading || !prompt.trim()}
                onClick={() => onSend()}
                className="inline-flex h-12 w-12 shrink-0 items-center justify-center self-end rounded-xl bg-terracotta text-white shadow-md disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
            {voice.listening && (
              <p className="mt-2 rounded-lg border-2 border-red-300 bg-red-50 px-3 py-2 text-sm font-bold text-red-900">
                {t("מאיה מקשיבה לך... דבר כעת", "Maya is listening… speak now")}
                {voice.liveTranscript ? ` — ${voice.liveTranscript}` : ""}
              </p>
            )}
            {isLoading && (
              <p className="mt-2 text-sm font-bold text-terracotta">{loadingStatus}</p>
            )}
          </div>
        </section>

        <section className="order-2 space-y-3 lg:order-1">
          <div className="flex flex-wrap gap-2">
            {PLATFORM_ORDER.map((id) => {
              const meta = NETWORK_META[id];
              const active = selectedNetworkId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedNetwork(id)}
                  className={`inline-flex items-center gap-2 rounded-2xl border-2 bg-white px-2.5 py-2 text-sm font-bold text-slate-900 shadow-sm transition ${
                    active
                      ? "scale-[1.03] border-slate-900 ring-2 ring-terracotta/30"
                      : "border-slate-300 hover:border-terracotta"
                  }`}
                >
                  <SocialLogo network={id} size={28} />
                  <span className="hidden sm:inline">
                    {locale === "he" ? meta.nameHe : meta.name}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="olar-card relative p-4">
            <ProgressOverlay />
            {!currentDraft ? (
              <div className="flex min-h-[320px] flex-col items-center justify-center gap-3 text-center">
                <ImageIcon className="h-10 w-10 text-slate-700" />
                <p className="text-base font-bold text-slate-900">
                  {t(
                    "התצוגה החיה תופיע כאן אחרי שליפה",
                    "Live preview appears here after generation"
                  )}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div
                  className={`relative mx-auto w-full overflow-hidden rounded-xl bg-slate-200 ${aspectClass(currentDraft.aspectRatio)}`}
                >
                  {(imageLoading || !imgReady) && (
                    <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-slate-100/90">
                      <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
                      <p className="text-sm font-bold text-slate-900">
                        {t("מייצרים תמונה דינמית…", "Generating dynamic image…")}
                      </p>
                    </div>
                  )}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    key={currentDraft.imageUrl}
                    src={currentDraft.imageUrl}
                    alt={currentDraft.imagePromptEn || ""}
                    className="h-full w-full object-cover"
                    onLoad={() => setImgReady(true)}
                    onError={() => setImgReady(true)}
                  />
                  {(currentDraft.aspectRatio === "9:16" ||
                    selectedNetworkId === "tiktok" ||
                    selectedNetworkId === "youtube") && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-white">
                      <p className="text-xs font-bold uppercase tracking-wide opacity-90">
                        Hook
                      </p>
                      <p className="text-base font-bold">{currentDraft.hook}</p>
                      {currentDraft.script && (
                        <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm font-medium opacity-95">
                          {currentDraft.script}
                        </p>
                      )}
                    </div>
                  )}
                  {selectedNetworkId === "pinterest" && currentDraft.pinTitle && (
                    <div className="absolute inset-x-0 bottom-0 bg-white/95 p-3">
                      <p className="text-sm font-bold text-slate-700">Pin title</p>
                      <input
                        value={currentDraft.pinTitle}
                        onChange={(e) => setDraftField("pinTitle", e.target.value)}
                        className="w-full bg-transparent text-base font-bold text-slate-900 outline-none"
                      />
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setImgReady(false);
                    swapDraftImage();
                  }}
                  className="text-base font-bold text-terracotta hover:underline"
                >
                  {t("החלף תמונה", "Swap image")}
                </button>

                <input
                  value={currentDraft.headline}
                  onChange={(e) => setDraftField("headline", e.target.value)}
                  className="olar-input font-bold"
                />
                <textarea
                  value={currentDraft.body}
                  onChange={(e) => setDraftField("body", e.target.value)}
                  rows={6}
                  className="olar-input resize-y"
                />
                <input
                  value={currentDraft.hashtags.join(" ")}
                  onChange={(e) =>
                    setDraftHashtags(
                      e.target.value
                        .split(/\s+/)
                        .map((x) => x.trim())
                        .filter(Boolean)
                    )
                  }
                  className="olar-input text-sm"
                />

                {network.accountType === "private" && (
                  <div className="flex flex-wrap gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-3">
                    <p className="w-full text-sm font-bold text-slate-900">
                      {t(
                        "שליפה מהירה לחשבון פרטי",
                        "Private account express assist"
                      )}
                    </p>
                    <button
                      type="button"
                      onClick={copyPrivate}
                      className="inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-bold"
                    >
                      <Copy className="h-4 w-4" />
                      {t("העתק טקסט מותאם", "Copy caption")}
                    </button>
                    <button
                      type="button"
                      onClick={downloadMedia}
                      className="inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-bold"
                    >
                      <Download className="h-4 w-4" />
                      {t("הורד מדיה מותאמת", "Download media")}
                    </button>
                    <button
                      type="button"
                      onClick={openApp}
                      className="inline-flex items-center gap-1.5 rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-bold"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {t("פתח אפליקציה לפרסום", "Open app to post")}
                    </button>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-2 border-t-2 border-slate-300 pt-3">
                  <button
                    type="button"
                    onClick={() => saveDraft("draft")}
                    className="rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-bold"
                  >
                    {t("שמירה כטיוטה", "Save draft")}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const when = new Date();
                      when.setDate(when.getDate() + 1);
                      when.setHours(10, 0, 0, 0);
                      saveDraft("scheduled", when.toISOString());
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border-2 border-slate-300 bg-white px-4 py-2 text-sm font-bold"
                  >
                    <CalendarPlus className="h-4 w-4" />
                    {t("תזמון ליומן", "Schedule")}
                  </button>
                  <button
                    type="button"
                    onClick={quickPublish}
                    className="olar-btn-accent px-4 py-2 text-sm"
                  >
                    {t(
                      "פרסום מהיר (עסקי / פרטי)",
                      "Quick publish (biz / private)"
                    )}
                  </button>
                  <span
                    className={`ms-auto inline-flex max-w-full items-center gap-1.5 rounded-full border-2 px-3 py-1.5 text-xs font-bold ${
                      currentDraft.source === "live"
                        ? "border-emerald-400 bg-emerald-50 text-emerald-900"
                        : "border-slate-300 bg-slate-100 text-slate-800"
                    }`}
                    title={currentDraft.modelUsed || undefined}
                  >
                    <span
                      className={`h-2 w-2 shrink-0 rounded-full ${
                        currentDraft.source === "live"
                          ? "bg-emerald-500"
                          : "bg-slate-500"
                      }`}
                    />
                    <span className="truncate">
                      {currentDraft.source === "live" && currentDraft.modelUsed
                        ? t(
                            `נוצר ע״י: ${currentDraft.modelUsed}`,
                            `Created by: ${currentDraft.modelUsed}`
                          )
                        : currentDraft.source === "live"
                          ? t("נוצר ע״י AI חי", "Created by live AI")
                          : t("טיוטת מערכת מקומית", "Local system draft")}
                    </span>
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
