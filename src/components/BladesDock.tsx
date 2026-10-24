"use client";

import {
  CalendarDays,
  Dna,
  Palette,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { useOlarStore } from "@/hooks/useOlarStore";
import { SocialLogoRow } from "@/components/icons/SocialLogos";
import type { BladeId } from "@/types/olar";

const BLADES: {
  id: Exclude<BladeId, "studio">;
  icon: typeof Radio;
  he: string;
  en: string;
}[] = [
  {
    id: "networks",
    icon: Radio,
    he: "רשתות, חיבורים וסטטיסטיקה",
    en: "Networks & Stats",
  },
  {
    id: "creative",
    icon: Palette,
    he: "סטודיו קריאייטיב ותמונת פרופיל",
    en: "Creative Studio",
  },
  {
    id: "guardian",
    icon: ShieldCheck,
    he: "שומר סף וחוקי מותג",
    en: "Brand Guardian",
  },
  {
    id: "calendar",
    icon: CalendarDays,
    he: "יומן שידורים וסוכן יומי",
    en: "Calendar & Agent",
  },
  {
    id: "dna",
    icon: Dna,
    he: "הגדרות מותג ו-DNA",
    en: "Brand DNA",
  },
];

export function BladesDock() {
  const { setActiveBlade, locale, activeBlade } = useOlarStore();

  return (
    <nav className="hidden border-t border-stone-border bg-white/90 backdrop-blur md:block">
      <div className="mx-auto grid max-w-7xl grid-cols-5 gap-3 px-6 py-4">
        {BLADES.map((blade) => {
          const Icon = blade.icon;
          const active = activeBlade === blade.id;
          return (
            <button
              key={blade.id}
              type="button"
              onClick={() => setActiveBlade(blade.id)}
              className={`group flex flex-col items-start gap-2 rounded-2xl border px-4 py-3 text-start transition ${
                active
                  ? "border-terracotta/40 bg-terracotta/5 shadow-sm"
                  : "border-stone-border bg-porcelain hover:border-terracotta/30 hover:bg-white"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? "text-terracotta" : "text-slate-500 group-hover:text-terracotta"}`}
              />
              <span className="text-xs font-bold leading-snug text-slate-900">
                {locale === "he" ? blade.he : blade.en}
              </span>
              {blade.id === "networks" && (
                <div className="mt-1 w-full">
                  <SocialLogoRow size={16} />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export function MobileNav() {
  const { setActiveBlade, activeBlade, locale, t } = useOlarStore();
  const items: { id: BladeId; labelHe: string; labelEn: string; icon: typeof Radio }[] = [
    { id: "studio", labelHe: "סטודיו", labelEn: "Studio", icon: Radio },
    { id: "networks", labelHe: "רשתות", labelEn: "Nets", icon: Radio },
    { id: "calendar", labelHe: "יומן", labelEn: "Cal", icon: CalendarDays },
    { id: "guardian", labelHe: "שומר", labelEn: "Guard", icon: ShieldCheck },
    { id: "dna", labelHe: "DNA", labelEn: "DNA", icon: Dna },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-stone-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <div className="mx-auto flex max-w-lg items-stretch justify-between px-2 py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const active = activeBlade === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveBlade(item.id)}
              className={`flex flex-1 flex-col items-center gap-0.5 rounded-xl px-1 py-2 text-[10px] ${
                active ? "text-terracotta" : "text-charcoal/50"
              }`}
            >
              <Icon className="h-4 w-4" />
              {locale === "he" ? item.labelHe : item.labelEn}
            </button>
          );
        })}
      </div>
      <p className="sr-only">{t("ניווט מובייל", "Mobile navigation")}</p>
    </nav>
  );
}
