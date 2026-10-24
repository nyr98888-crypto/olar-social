"use client";

import { Loader2 } from "lucide-react";
import { useOlarStore } from "@/hooks/useOlarStore";

export function ProgressOverlay() {
  const { isLoading, progressStep, progressPercent, progressSteps, t, locale } =
    useOlarStore();

  if (!isLoading) return null;

  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-slate-900/55 p-4 backdrop-blur-[2px]">
      <div className="olar-card w-full max-w-md border-2 border-slate-900 p-5 shadow-2xl">
        <div className="mb-3 flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-terracotta" />
          <p className="text-lg font-extrabold text-slate-900">
            {t("מאיה עובדת ברקע…", "Maya is working…")}
          </p>
        </div>

        <div className="mb-4 h-3 overflow-hidden rounded-full border-2 border-slate-300 bg-slate-100">
          <div
            className="h-full rounded-full bg-terracotta transition-all duration-500"
            style={{ width: `${Math.min(100, Math.max(4, progressPercent))}%` }}
          />
        </div>
        <p className="mb-3 text-sm font-bold text-slate-800">
          {progressPercent}% · {locale === "he" ? "התקדמות" : "Progress"}
        </p>

        <ol className="space-y-2">
          {progressSteps.map((step, idx) => {
            const active = idx === progressStep;
            const done = idx < progressStep;
            return (
              <li
                key={step.id}
                className={`rounded-xl border-2 px-3 py-2 text-sm font-bold transition ${
                  active
                    ? "border-terracotta bg-orange-50 text-slate-900"
                    : done
                      ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                      : "border-slate-200 bg-slate-50 text-slate-600"
                }`}
              >
                <span className="me-2">{done ? "✓" : active ? "●" : "○"}</span>
                {locale === "he" ? step.labelHe : step.labelEn}
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}

export function HeaderActivityPill() {
  const { isLoading, progressPercent, progressStep, progressSteps, t, locale } =
    useOlarStore();
  if (!isLoading) return null;
  const step = progressSteps[progressStep];
  return (
    <span className="inline-flex max-w-[220px] items-center gap-1.5 truncate rounded-full border-2 border-terracotta bg-orange-50 px-2.5 py-1 text-[11px] font-bold text-slate-900">
      <Loader2 className="h-3.5 w-3.5 shrink-0 animate-spin text-terracotta" />
      <span className="truncate">
        {progressPercent}% ·{" "}
        {step
          ? locale === "he"
            ? step.labelHe.slice(0, 28)
            : step.labelEn.slice(0, 28)
          : t("רץ ברקע", "Running")}
      </span>
    </span>
  );
}
