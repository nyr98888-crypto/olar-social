"use client";

import { useRef, useState } from "react";
import { Download, Sparkles, Zap } from "lucide-react";
import { BladeShell } from "@/components/BladeShell";
import { useOlarStore } from "@/hooks/useOlarStore";
import type { AspectRatio } from "@/types/olar";

const RATIOS: { id: AspectRatio; labelHe: string; labelEn: string; cls: string }[] = [
  { id: "1:1", labelHe: "פיד 1:1", labelEn: "Feed 1:1", cls: "aspect-square" },
  { id: "9:16", labelHe: "רילס 9:16", labelEn: "Reels 9:16", cls: "aspect-[9/16]" },
  { id: "2:3", labelHe: "פינטרסט 2:3", labelEn: "Pin 2:3", cls: "aspect-[2/3]" },
  { id: "16:9", labelHe: "יוטיוב 16:9", labelEn: "YouTube 16:9", cls: "aspect-video" },
];

export function CreativeStudioView() {
  const { activeBrand, patchBrand, locale, t, runCampaign, pushToast } =
    useOlarStore();
  const [ratio, setRatio] = useState<AspectRatio>("1:1");
  const [shape, setShape] = useState<"circle" | "square">("circle");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const downloadAvatar = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const size = 512;
    canvas.width = size;
    canvas.height = size;

    ctx.fillStyle = activeBrand.bgTone || "#F5EDE8";
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillRect(0, 0, size, size);
    }

    ctx.strokeStyle = activeBrand.borderColor || "#C96442";
    ctx.lineWidth = 28;
    if (shape === "circle") {
      ctx.beginPath();
      ctx.arc(size / 2, size / 2, size / 2 - 14, 0, Math.PI * 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(14, 14, size - 28, size - 28);
    }

    ctx.fillStyle = "#141413";
    ctx.font = "bold 180px Heebo, Arial, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(
      (activeBrand.logoMonogram || activeBrand.name.charAt(0) || "א").slice(0, 2),
      size / 2,
      size / 2 + 10
    );

    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `${activeBrand.name}-avatar-${shape}.png`;
    a.click();
    pushToast(t("תמונת הפרופיל ירדה", "Profile picture downloaded"));
  };

  const previewPrompt = `Photorealistic ${activeBrand.industry} brand visual for ${activeBrand.name}, professional marketing photo, bright lighting`;
  const previewUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(previewPrompt)}?width=1080&height=1080&nologo=true&seed=42`;

  const exportRatio = async () => {
    try {
      const res = await fetch(previewUrl);
      const blob = await res.blob();
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${activeBrand.name}-${ratio.replace(":", "x")}.jpg`;
      a.click();
      pushToast(t(`יוצא בפורמט ${ratio}`, `Exported as ${ratio}`));
    } catch {
      pushToast(t("לא ניתן להוריד כרגע", "Download unavailable"), "error");
    }
  };

  return (
    <BladeShell title={t("סטודיו קריאייטיב ותמונת פרופיל", "Creative studio & profile")}>
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-stone-border bg-white p-5">
          <h3 className="font-display text-lg font-semibold">
            {t("תמונת פרופיל ואווטאר", "Profile picture & avatar")}
          </h3>
          <p className="mt-1 text-sm text-charcoal/55">
            {t(
              "עיגול או ריבוע עם טבעת מותג ומונוגרמה",
              "Circle or square with brand ring and monogram"
            )}
          </p>

          <div className="mt-5 flex flex-col items-center gap-4">
            <div
              className={`flex h-40 w-40 items-center justify-center border-[6px] text-5xl font-bold text-charcoal ${
                shape === "circle" ? "rounded-full" : "rounded-2xl"
              }`}
              style={{
                background: activeBrand.bgTone,
                borderColor: activeBrand.borderColor,
              }}
            >
              {(activeBrand.logoMonogram || activeBrand.name.charAt(0)).slice(0, 2)}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShape("circle")}
                className={`rounded-lg border px-3 py-1.5 text-xs ${
                  shape === "circle" ? "border-terracotta text-terracotta" : "border-stone-border"
                }`}
              >
                {t("עיגול", "Circle")}
              </button>
              <button
                type="button"
                onClick={() => setShape("square")}
                className={`rounded-lg border px-3 py-1.5 text-xs ${
                  shape === "square" ? "border-terracotta text-terracotta" : "border-stone-border"
                }`}
              >
                {t("ריבוע", "Square")}
              </button>
            </div>

            <div className="grid w-full gap-2 sm:grid-cols-3">
              <label className="text-xs">
                {t("מונוגרמה", "Monogram")}
                <input
                  value={activeBrand.logoMonogram}
                  onChange={(e) =>
                    patchBrand({ logoMonogram: e.target.value.slice(0, 2) })
                  }
                  className="mt-1 w-full rounded-lg border border-stone-border px-2 py-1.5"
                />
              </label>
              <label className="text-xs">
                {t("צבע טבעת", "Ring color")}
                <input
                  type="color"
                  value={activeBrand.borderColor}
                  onChange={(e) => patchBrand({ borderColor: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-stone-border"
                />
              </label>
              <label className="text-xs">
                {t("רקע", "Background")}
                <input
                  type="color"
                  value={activeBrand.bgTone}
                  onChange={(e) => patchBrand({ bgTone: e.target.value })}
                  className="mt-1 h-9 w-full rounded-lg border border-stone-border"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={downloadAvatar}
              className="inline-flex items-center gap-2 rounded-xl bg-terracotta px-4 py-2 text-sm text-white"
            >
              <Download className="h-4 w-4" />
              {t("הורד לכל הרשתות", "Download for all networks")}
            </button>
            <canvas ref={canvasRef} className="hidden" />
          </div>
        </section>

        <section className="space-y-6">
          <div className="rounded-2xl border border-stone-border bg-white p-5">
            <h3 className="font-display text-lg font-semibold">
              {t("משנה פורמטים לקמפיין", "Campaign format resizer")}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {RATIOS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setRatio(r.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs ${
                    ratio === r.id
                      ? "border-terracotta bg-terracotta text-white"
                      : "border-stone-border"
                  }`}
                >
                  {locale === "he" ? r.labelHe : r.labelEn}
                </button>
              ))}
            </div>
            <div className="mt-4 flex justify-center rounded-xl bg-porcelain p-4">
              <div
                className={`w-full max-w-[220px] overflow-hidden rounded-lg bg-charcoal/10 ${
                  RATIOS.find((r) => r.id === ratio)?.cls
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <button
              type="button"
              onClick={exportRatio}
              className="mt-3 inline-flex items-center gap-2 rounded-xl border border-stone-border px-3 py-2 text-xs"
            >
              <Download className="h-3.5 w-3.5" />
              {t("ייצוא ויזואל", "Export visual")}
            </button>
          </div>

          <div className="rounded-2xl border border-stone-border bg-white p-5">
            <h3 className="mb-1 flex items-center gap-2 font-display text-lg font-semibold">
              <Zap className="h-5 w-5 text-terracotta" />
              {t("בונה קמפיין בזק ל-3 ימים", "3-day flash campaign builder")}
            </h3>
            <p className="text-sm text-charcoal/55">
              {t(
                "מכירת בזק, השקת מוצר או בליץ חגים — בלחיצה אחת",
                "Flash sale, product launch, or holiday blitz — one click"
              )}
            </p>
            <div className="mt-4 grid gap-2 sm:grid-cols-3">
              {[
                {
                  he: "מכירת בזק 3 ימים",
                  en: "3-day flash sale",
                  prompt: "קמפיין מכירת בזק ל-3 ימים",
                },
                {
                  he: "השקת מוצר",
                  en: "Product launch",
                  prompt: "קמפיין השקת מוצר קצר",
                },
                {
                  he: "בליץ חגים",
                  en: "Holiday blitz",
                  prompt: "בליץ תוכן לחגים",
                },
              ].map((item) => (
                <button
                  key={item.en}
                  type="button"
                  onClick={() => runCampaign(item.prompt, "sale")}
                  className="rounded-xl border border-stone-border bg-porcelain px-3 py-3 text-start text-xs font-medium hover:border-terracotta/40"
                >
                  <Sparkles className="mb-1 h-3.5 w-3.5 text-terracotta" />
                  {locale === "he" ? item.he : item.en}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </BladeShell>
  );
}
