"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import { useOlarStore } from "@/hooks/useOlarStore";

export function ToastStack() {
  const { toasts, dismissToast } = useOlarStore();
  if (!toasts.length) return null;

  return (
    <div className="pointer-events-none fixed bottom-24 left-1/2 z-[100] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2 md:bottom-8 md:left-auto md:right-6 md:translate-x-0">
      {toasts.map((toast) => {
        const Icon =
          toast.type === "error" ? XCircle : toast.type === "info" ? Info : CheckCircle2;
        const tone =
          toast.type === "error"
            ? "border-red-200 bg-white text-red-700"
            : toast.type === "info"
              ? "border-stone-border bg-white text-charcoal"
              : "border-terracotta/30 bg-white text-charcoal";
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-black/5 ${tone}`}
            role="status"
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
            <p className="flex-1 text-sm leading-snug">{toast.text}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              className="rounded-md p-0.5 text-charcoal/40 hover:text-charcoal"
              aria-label="dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
