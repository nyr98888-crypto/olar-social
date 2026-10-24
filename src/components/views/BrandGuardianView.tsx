"use client";

import { useMemo, useState } from "react";
import { ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import { BladeShell } from "@/components/BladeShell";
import { useOlarStore } from "@/hooks/useOlarStore";
import { auditContent, auditPost } from "@/services/contentAuditor";

export function BrandGuardianView() {
  const { activeBrand, currentDraft, posts, locale, t } = useOlarStore();
  const [sample, setSample] = useState(
    currentDraft
      ? `${currentDraft.headline}\n\n${currentDraft.body}\n\n${currentDraft.hashtags.join(" ")}`
      : ""
  );

  const live = useMemo(
    () => auditContent(sample || " ", activeBrand),
    [sample, activeBrand]
  );

  const history = useMemo(
    () =>
      posts.slice(0, 8).map((p) => ({
        post: p,
        audit: auditPost(p, activeBrand),
      })),
    [posts, activeBrand]
  );

  const scoreColor =
    live.score >= 80
      ? "text-emerald-600"
      : live.score >= 60
        ? "text-amber-600"
        : "text-red-600";

  return (
    <BladeShell title={t("שומר סף וחוקי מותג", "Brand Guardian & rules")}>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-stone-border bg-white p-5">
            <label className="text-sm font-medium text-charcoal">
              {t("בדיקה חיה של טקסט", "Live text audit")}
            </label>
            <textarea
              value={sample}
              onChange={(e) => setSample(e.target.value)}
              rows={10}
              className="mt-2 w-full resize-y rounded-xl border border-stone-border bg-porcelain px-3 py-2 text-sm outline-none focus:border-terracotta/40"
              placeholder={t("הדביקו טקסט לבדיקה…", "Paste text to audit…")}
            />
          </div>

          <div className="rounded-2xl border border-stone-border bg-white p-5">
            <h3 className="mb-3 font-semibold">{t("יומן ציות", "Compliance log")}</h3>
            <ul className="space-y-2">
              {live.issues.length === 0 && (
                <li className="flex items-center gap-2 text-sm text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  {t("אין ממצאים — התוכן נקי", "No findings — content is clean")}
                </li>
              )}
              {live.issues.map((issue, i) => (
                <li
                  key={`${issue.code}-${i}`}
                  className="flex items-start gap-2 rounded-xl border border-stone-border bg-porcelain px-3 py-2 text-sm"
                >
                  <AlertTriangle
                    className={`mt-0.5 h-4 w-4 shrink-0 ${
                      issue.severity === "error"
                        ? "text-red-500"
                        : issue.severity === "warning"
                          ? "text-amber-500"
                          : "text-charcoal/40"
                    }`}
                  />
                  <div>
                    <p className="font-medium text-charcoal">
                      {locale === "he" ? issue.messageHe : issue.messageEn}
                    </p>
                    <p className="text-[11px] text-charcoal/45">{issue.code}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-stone-border bg-white p-5">
            <h3 className="mb-3 font-semibold">
              {t("ביקורת פוסטים אחרונים", "Recent posts audit")}
            </h3>
            <div className="space-y-2">
              {history.length === 0 && (
                <p className="text-sm text-charcoal/50">
                  {t("אין פוסטים עדיין", "No posts yet")}
                </p>
              )}
              {history.map(({ post, audit }) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between gap-3 rounded-xl border border-stone-border px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{post.headline}</p>
                    <p className="text-[11px] text-charcoal/45">{post.networkId}</p>
                  </div>
                  <span
                    className={`text-sm font-semibold ${
                      audit.score >= 80
                        ? "text-emerald-600"
                        : audit.score >= 60
                          ? "text-amber-600"
                          : "text-red-600"
                    }`}
                  >
                    {audit.score}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-stone-border bg-white p-5 text-center">
            <ShieldCheck className="mx-auto h-8 w-8 text-terracotta" />
            <p className="mt-2 text-xs text-charcoal/50">
              {t("ציון ביקורת חי", "Live audit score")}
            </p>
            <p className={`mt-1 font-display text-5xl font-semibold ${scoreColor}`}>
              {live.score}
              <span className="text-2xl">%</span>
            </p>
            <p className="mt-2 text-sm text-charcoal/60">
              {live.passed
                ? t("עבר שומר סף", "Passed guardian")
                : t("דורש תיקון", "Needs fixes")}
            </p>
          </div>

          <div className="rounded-2xl border border-stone-border bg-white p-4 text-sm">
            <Row
              ok={!live.priceHallucination}
              label={t("בדיקת מחירים מדומים", "Price hallucination check")}
            />
            <Row
              ok={live.hebrewNatural}
              label={t("עברית טבעית", "Hebrew naturalness")}
            />
            <Row
              ok={live.forbiddenHits.length === 0}
              label={t("מילים אסורות", "Forbidden words")}
            />
          </div>

          <div className="rounded-2xl border border-stone-border bg-porcelain p-4 text-xs text-charcoal/65">
            <p className="font-medium text-charcoal">{activeBrand.name}</p>
            <p className="mt-1">{activeBrand.tone}</p>
            <p className="mt-2">
              {t("אסורים", "Forbidden")}:{" "}
              {activeBrand.forbiddenWords.join(", ") || "—"}
            </p>
          </div>
        </aside>
      </div>
    </BladeShell>
  );
}

function Row({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between border-b border-stone-border py-2 last:border-0">
      <span>{label}</span>
      <span className={ok ? "text-emerald-600" : "text-red-500"}>
        {ok ? "✓" : "✕"}
      </span>
    </div>
  );
}
