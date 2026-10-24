"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { BladeShell } from "@/components/BladeShell";
import { useOlarStore } from "@/hooks/useOlarStore";
import { NETWORK_META } from "@/types/olar";
import { SocialLogo } from "@/components/icons/SocialLogos";

function startOfWeek(d: Date): Date {
  const x = new Date(d);
  const day = (x.getDay() + 6) % 7; // Monday-first
  x.setDate(x.getDate() - day);
  x.setHours(0, 0, 0, 0);
  return x;
}

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDay(d: Date, locale: string): string {
  return d.toLocaleDateString(locale === "he" ? "he-IL" : "en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function CalendarQueueView() {
  const {
    posts,
    locale,
    t,
    deletePost,
    movePost,
    addPostAt,
    setCurrentDraft,
    setActiveBlade,
    agentTasks,
    approveTask,
    operatingMode,
    calendarHighlightIds,
    clearCalendarHighlights,
  } = useOlarStore();

  const [anchor, setAnchor] = useState(() => startOfWeek(new Date()));
  const [view, setView] = useState<"week" | "month">("week");

  useEffect(() => {
    if (!calendarHighlightIds.length) return;
    const highlighted = posts.find(
      (p) => calendarHighlightIds.includes(p.id) && p.scheduledAt
    );
    if (highlighted?.scheduledAt) {
      setAnchor(startOfWeek(new Date(highlighted.scheduledAt)));
    }
    const timer = setTimeout(() => clearCalendarHighlights(), 8000);
    return () => clearTimeout(timer);
  }, [calendarHighlightIds, posts, clearCalendarHighlights]);

  const days = useMemo(() => {
    const count = view === "week" ? 7 : 35;
    return Array.from({ length: count }, (_, i) => {
      const d = new Date(anchor);
      d.setDate(anchor.getDate() + i);
      return d;
    });
  }, [anchor, view]);

  const scheduled = posts.filter((p) => p.scheduledAt || p.status === "queued");

  return (
    <BladeShell title={t("יומן שידורים וסוכן יומי", "Broadcast calendar & daily agent")}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              const d = new Date(anchor);
              d.setDate(d.getDate() - (view === "week" ? 7 : 28));
              setAnchor(startOfWeek(d));
            }}
            className="rounded-lg border border-stone-border bg-white p-2"
          >
            <ChevronRight className="h-4 w-4 rtl:hidden" />
            <ChevronLeft className="hidden h-4 w-4 rtl:block" />
          </button>
          <button
            type="button"
            onClick={() => setAnchor(startOfWeek(new Date()))}
            className="rounded-lg border border-stone-border bg-white px-3 py-2 text-xs"
          >
            {t("היום", "Today")}
          </button>
          <button
            type="button"
            onClick={() => {
              const d = new Date(anchor);
              d.setDate(d.getDate() + (view === "week" ? 7 : 28));
              setAnchor(startOfWeek(d));
            }}
            className="rounded-lg border border-stone-border bg-white p-2"
          >
            <ChevronLeft className="h-4 w-4 rtl:hidden" />
            <ChevronRight className="hidden h-4 w-4 rtl:block" />
          </button>
        </div>
        <div className="flex rounded-xl border border-stone-border bg-white p-1">
          <button
            type="button"
            onClick={() => setView("week")}
            className={`rounded-lg px-3 py-1.5 text-xs ${
              view === "week" ? "bg-terracotta text-white" : ""
            }`}
          >
            {t("שבועי", "Week")}
          </button>
          <button
            type="button"
            onClick={() => setView("month")}
            className={`rounded-lg px-3 py-1.5 text-xs ${
              view === "month" ? "bg-terracotta text-white" : ""
            }`}
          >
            {t("חודשי", "Month")}
          </button>
        </div>
      </div>

      {operatingMode !== "manual" && (
        <div className="mb-5 rounded-2xl border border-stone-border bg-white p-4">
          <h3 className="mb-2 text-sm font-semibold">
            {t("משימות סוכן יומי", "Daily agent tasks")}
          </h3>
          <div className="flex flex-wrap gap-2">
            {agentTasks.map((task) => (
              <button
                key={task.id}
                type="button"
                disabled={task.completed}
                onClick={() => approveTask(task.id)}
                className={`rounded-xl border px-3 py-2 text-start text-xs ${
                  task.completed
                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : "border-stone-border hover:border-terracotta/40"
                }`}
              >
                {locale === "he" ? task.titleHe : task.titleEn}
                {!task.completed && (
                  <span className="mt-1 block text-terracotta">
                    {t("אשר בלחיצה", "Tap to approve")}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      <div
        className={`grid gap-2 ${
          view === "week" ? "md:grid-cols-7" : "grid-cols-2 sm:grid-cols-4 md:grid-cols-7"
        }`}
      >
        {days.map((day) => {
          const dayPosts = scheduled.filter((p) => {
            const raw = p.scheduledAt ?? p.createdAt;
            return sameDay(new Date(raw), day);
          });
          const isToday = sameDay(day, new Date());
          return (
            <div
              key={day.toISOString()}
              className={`min-h-[140px] rounded-2xl border bg-white p-2 ${
                isToday ? "border-terracotta/50" : "border-stone-border"
              }`}
            >
              <div className="mb-2 flex items-center justify-between gap-1">
                <p className="text-[11px] font-medium text-charcoal/70">
                  {formatDay(day, locale)}
                </p>
                <button
                  type="button"
                  onClick={() => {
                    const at = new Date(day);
                    at.setHours(10, 0, 0, 0);
                    addPostAt(at.toISOString());
                  }}
                  className="rounded-md p-1 text-charcoal/40 hover:bg-porcelain hover:text-terracotta"
                  title={t("הוסף", "Add")}
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
              <div className="space-y-1.5">
                {dayPosts.map((p) => (
                  <div
                    key={p.id}
                    className={`rounded-lg border-2 p-1.5 ${
                      calendarHighlightIds.includes(p.id)
                        ? "border-terracotta bg-orange-50 ring-2 ring-terracotta/40"
                        : "border-slate-300 bg-slate-50"
                    }`}
                  >
                    <button
                      type="button"
                      className="w-full text-start"
                      onClick={() => {
                        setCurrentDraft(p);
                        setActiveBlade("studio");
                      }}
                    >
                      <span className="inline-flex items-center gap-1 rounded bg-white px-1 text-[9px] font-bold text-slate-900">
                        <SocialLogo network={p.networkId} size={14} />
                        {locale === "he"
                          ? NETWORK_META[p.networkId].nameHe
                          : NETWORK_META[p.networkId].name}
                      </span>
                      <p className="mt-0.5 line-clamp-2 text-[10px] font-medium leading-snug">
                        {p.headline}
                      </p>
                      <p className="text-[9px] text-charcoal/45">{p.status}</p>
                    </button>
                    <div className="mt-1 flex gap-1">
                      <select
                        className="flex-1 rounded border border-stone-border bg-white text-[9px]"
                        value=""
                        onChange={(e) => {
                          if (!e.target.value) return;
                          const target = days[Number(e.target.value)];
                          if (!target) return;
                          const at = new Date(target);
                          at.setHours(10, 0, 0, 0);
                          movePost(p.id, at.toISOString());
                        }}
                      >
                        <option value="">{t("העבר", "Move")}</option>
                        {days.map((d, idx) => (
                          <option key={d.toISOString()} value={idx}>
                            {formatDay(d, locale)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => deletePost(p.id)}
                        className="rounded border border-stone-border bg-white p-1 text-red-500"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </BladeShell>
  );
}
