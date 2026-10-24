"use client";

import {
  CheckCheck,
  Copy,
  ExternalLink,
  Palette,
  Send,
  Sparkles,
} from "lucide-react";
import { useState } from "react";
import { useOlarStore } from "@/hooks/useOlarStore";

export function MobileCompanion() {
  const {
    activeBrand,
    briefing,
    agentTasks,
    approveTask,
    approveAllHybrid,
    operatingMode,
    networks,
    currentDraft,
    posts,
    t,
    locale,
    pushToast,
    runCampaign,
    setActiveBlade,
    isLoading,
  } = useOlarStore();

  const [prompt, setPrompt] = useState("");
  const connected = networks.filter((n) => n.connected).length;
  const queued = posts.filter((p) => p.status === "queued").length;
  const scheduled = posts.filter((p) => p.status === "scheduled").length;

  const copyDraft = async () => {
    if (!currentDraft) {
      pushToast(t("אין טיוטה להעתקה", "No draft to copy"), "info");
      return;
    }
    const text = [currentDraft.headline, currentDraft.body, currentDraft.hashtags.join(" ")]
      .filter(Boolean)
      .join("\n\n");
    await navigator.clipboard.writeText(text);
    pushToast(t("הועתק ללוח", "Copied to clipboard"));
  };

  const openPrivate = () => {
    const net = networks.find((n) => n.id === (currentDraft?.networkId ?? "instagram"));
    if (net) window.open(net.deepLink, "_blank");
  };

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-4">
      <section className="rounded-2xl border border-stone-border bg-white p-4">
        <div className="flex items-start gap-2">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-charcoal">
              {t("מנהל בדרכים", "On-the-go manager")}
            </p>
            <p className="mt-1 text-xs leading-relaxed text-charcoal/65">
              {locale === "he" ? briefing.summaryHe : briefing.summaryEn}
            </p>
          </div>
        </div>
        {operatingMode === "hybrid" && queued > 0 && (
          <button
            type="button"
            onClick={approveAllHybrid}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-terracotta py-2.5 text-sm font-medium text-white"
          >
            <CheckCheck className="h-4 w-4" />
            {t("אשר הכל", "Approve all")}
          </button>
        )}
      </section>

      <section className="grid grid-cols-3 gap-2">
        {[
          { label: t("מחוברות", "Connected"), value: connected },
          { label: t("בתור", "Queued"), value: queued },
          { label: t("מתוזמנים", "Scheduled"), value: scheduled },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-stone-border bg-white px-2 py-3 text-center"
          >
            <p className="text-lg font-semibold text-charcoal">{s.value}</p>
            <p className="text-[10px] text-charcoal/50">{s.label}</p>
          </div>
        ))}
      </section>

      <section className="rounded-2xl border border-stone-border bg-white p-4">
        <h2 className="font-display text-lg font-semibold">
          {t(
            `מה שולפים עבור ${activeBrand.name}?`,
            `Pull for ${activeBrand.name}?`
          )}
        </h2>
        <div className="mt-3 flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={t("בקשה קצרה…", "Short prompt…")}
            className="flex-1 rounded-xl border border-stone-border bg-porcelain px-3 py-2 text-sm outline-none"
          />
          <button
            type="button"
            disabled={isLoading || !prompt.trim()}
            onClick={() => {
              void runCampaign(prompt);
              setPrompt("");
            }}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-terracotta text-white disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={copyDraft}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-border bg-white px-3 py-3 text-xs font-medium"
        >
          <Copy className="h-3.5 w-3.5 text-terracotta" />
          {t("העתק לפרטי", "Copy private")}
        </button>
        <button
          type="button"
          onClick={openPrivate}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-border bg-white px-3 py-3 text-xs font-medium"
        >
          <ExternalLink className="h-3.5 w-3.5 text-terracotta" />
          {t("שתף / פתח אפליקציה", "Share / open app")}
        </button>
        <button
          type="button"
          onClick={() => setActiveBlade("calendar")}
          className="rounded-2xl border border-stone-border bg-white px-3 py-3 text-xs font-medium"
        >
          {t("יומן מהיר", "Quick calendar")}
        </button>
        <button
          type="button"
          onClick={() => setActiveBlade("creative")}
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-border bg-white px-3 py-3 text-xs font-medium"
        >
          <Palette className="h-3.5 w-3.5 text-terracotta" />
          {t("קריאייטיב", "Creative")}
        </button>
      </section>

      <section className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-charcoal/45">
          {t("משימות לאישור", "Tasks to approve")}
        </h3>
        {agentTasks.filter((x) => !x.completed).length === 0 && (
          <p className="rounded-xl border border-dashed border-stone-border px-3 py-4 text-center text-xs text-charcoal/45">
            {t("אין משימות ממתינות", "No pending tasks")}
          </p>
        )}
        {agentTasks
          .filter((x) => !x.completed)
          .map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => approveTask(task.id)}
              className="flex w-full items-center justify-between rounded-2xl border border-stone-border bg-white px-4 py-3 text-start"
            >
              <span className="text-sm">
                {locale === "he" ? task.titleHe : task.titleEn}
              </span>
              <span className="rounded-lg bg-terracotta/10 px-2 py-1 text-[11px] text-terracotta">
                {t("אשר", "OK")}
              </span>
            </button>
          ))}
      </section>

      {currentDraft && (
        <section className="rounded-2xl border border-stone-border bg-white p-4">
          <p className="text-[11px] text-charcoal/45">{t("טיוטה חיה", "Live draft")}</p>
          <p className="mt-1 text-sm font-semibold">{currentDraft.headline}</p>
          <p className="mt-1 line-clamp-3 text-xs text-charcoal/65">{currentDraft.body}</p>
        </section>
      )}
    </div>
  );
}
