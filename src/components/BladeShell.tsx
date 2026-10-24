"use client";

import { ArrowRight } from "lucide-react";
import { useOlarStore } from "@/hooks/useOlarStore";

export function BladeShell({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  const { setActiveBlade, t, locale } = useOlarStore();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 md:px-6">
      <div className="sticky top-[4.5rem] z-30 mb-6 flex flex-wrap items-center justify-between gap-3 bg-porcelain/95 py-2 backdrop-blur">
        <h2 className="olar-section-title order-2 w-full md:order-1 md:w-auto">
          {title}
        </h2>
        <button
          type="button"
          onClick={() => setActiveBlade("studio")}
          className={`olar-btn-primary order-1 inline-flex items-center gap-2 ${
            locale === "he" ? "md:order-2 md:ms-auto" : "md:order-2 md:ms-auto"
          }`}
        >
          <ArrowRight className="h-5 w-5 rotate-180 rtl:rotate-0" />
          {t("← חזרה לסטודיו הראשי", "← Back to main studio")}
        </button>
      </div>
      {children}
    </div>
  );
}
