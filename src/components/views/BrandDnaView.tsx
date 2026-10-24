"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";
import { BladeShell } from "@/components/BladeShell";
import { useOlarStore } from "@/hooks/useOlarStore";
import type { BrandProfile } from "@/types/olar";

export function BrandDnaView() {
  const { activeBrand, updateBrand, t } = useOlarStore();
  const [form, setForm] = useState<BrandProfile>(activeBrand);

  useEffect(() => {
    setForm(activeBrand);
  }, [activeBrand]);

  const set = <K extends keyof BrandProfile>(key: K, value: BrandProfile[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  const save = () => {
    const forbidden = Array.isArray(form.forbiddenWords)
      ? form.forbiddenWords
      : String(form.forbiddenWords)
          .split(",")
          .map((w) => w.trim())
          .filter(Boolean);
    updateBrand({ ...form, forbiddenWords: forbidden });
  };

  return (
    <BladeShell title={t("הגדרות מותג ו-DNA", "Brand settings & DNA")}>
      <div className="olar-card mx-auto max-w-3xl p-5 md:p-6">
        <p className="mb-5 text-base font-medium text-slate-900">
          {t(
            "שמירה מעדכנת מיד את כל האפליקציה ונשמרת ב-localStorage. טלפון, כתובת ולינק יתווספו אוטומטית לפוטר של פוסטים.",
            "Saving updates the whole app immediately. Phone, address and link are auto-appended to post footers."
          )}
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={t("שם העסק", "Business name")}
            value={form.name}
            onChange={(v) => set("name", v)}
          />
          <Field
            label={t("תחום / קטגוריה", "Industry / category")}
            value={form.industry}
            onChange={(v) => set("industry", v)}
            hint={t(
              "לדוגמה: מוסך ופחחות רכב, נדל״ן, קולינריה",
              "e.g. auto body shop, real estate, culinary"
            )}
          />
          <Field
            label={t("טלפון ליצירת קשר / וואטסאפ", "Phone / WhatsApp")}
            value={form.phone}
            onChange={(v) => set("phone", v)}
            dir="ltr"
          />
          <Field
            label={t("אימייל העסק", "Business email")}
            value={form.email}
            onChange={(v) => set("email", v)}
            dir="ltr"
          />
          <Field
            label={t("כתובת פיזית / עיר", "Physical address / city")}
            value={form.address}
            onChange={(v) => set("address", v)}
            className="md:col-span-2"
          />
          <Field
            label={t("אתר אינטרנט / לינק לתיאום", "Website / booking link")}
            value={form.website}
            onChange={(v) => set("website", v)}
            className="md:col-span-2"
            dir="ltr"
          />
          <Field
            label={t("קהל יעד", "Target audience")}
            value={form.audience}
            onChange={(v) => set("audience", v)}
            className="md:col-span-2"
            multiline
          />
          <Field
            label={t("טון דיבור", "Brand tone")}
            value={form.tone}
            onChange={(v) => set("tone", v)}
            className="md:col-span-2"
          />
          <Field
            label={t("הצעת ליבה", "Core offer")}
            value={form.offer}
            onChange={(v) => set("offer", v)}
            className="md:col-span-2"
            multiline
          />
          <Field
            label={t("מחירון / מחירים מאושרים", "Price list / approved prices")}
            value={form.priceList}
            onChange={(v) => set("priceList", v)}
            className="md:col-span-2"
            multiline
            hint={t(
              "השאירו ריק אם אין — שומר הסף יחסום מחירים מומצאים",
              "Leave empty if none — Guardian blocks invented prices"
            )}
          />
          <Field
            label={t("מילים אסורות (מופרדות בפסיק)", "Forbidden words (comma-separated)")}
            value={form.forbiddenWords.join(", ")}
            onChange={(v) =>
              set(
                "forbiddenWords",
                v
                  .split(",")
                  .map((w) => w.trim())
                  .filter(Boolean)
              )
            }
            className="md:col-span-2"
          />
          <Field
            label={t("מונוגרמה ללוגו", "Logo monogram")}
            value={form.logoMonogram}
            onChange={(v) => set("logoMonogram", v.slice(0, 2))}
          />
        </div>

        <button type="button" onClick={save} className="olar-btn-accent mt-6 inline-flex items-center gap-2">
          <Save className="h-5 w-5" />
          {t("שמור DNA מותג", "Save brand DNA")}
        </button>
      </div>
    </BladeShell>
  );
}

function Field({
  label,
  value,
  onChange,
  multiline,
  className = "",
  hint,
  dir,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  className?: string;
  hint?: string;
  dir?: "ltr" | "rtl";
}) {
  return (
    <label className={`block text-base ${className}`}>
      <span className="mb-1.5 block font-bold text-slate-900">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          dir={dir}
          className="olar-input"
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          dir={dir}
          className="olar-input"
        />
      )}
      {hint && <span className="mt-1 block text-sm font-medium text-slate-700">{hint}</span>}
    </label>
  );
}
