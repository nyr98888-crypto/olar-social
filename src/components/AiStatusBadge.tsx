"use client";

import { useEffect, useRef, useState } from "react";
import { KeyRound, Loader2, X } from "lucide-react";
import { useOlarStore } from "@/hooks/useOlarStore";
import {
  AI_KEY_CHANGED_EVENT,
  clearOpenRouterKey,
  hasOpenRouterKey,
  pingOpenRouter,
  resolveOpenRouterKey,
  saveOpenRouterKey,
} from "@/services/smartRouter";

export function AiStatusBadge() {
  const { t, pushToast, locale } = useOlarStore();
  const [live, setLive] = useState(false);
  const [open, setOpen] = useState(false);
  const [keyInput, setKeyInput] = useState("");
  const [testing, setTesting] = useState(false);
  const [testMsg, setTestMsg] = useState<string | null>(null);
  const popRef = useRef<HTMLDivElement>(null);

  const refresh = () => {
    setLive(hasOpenRouterKey());
  };

  useEffect(() => {
    refresh();
    const onChange = () => refresh();
    window.addEventListener(AI_KEY_CHANGED_EVENT, onChange);
    return () => window.removeEventListener(AI_KEY_CHANGED_EVENT, onChange);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (popRef.current && !popRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  const saveAndTest = async () => {
    const trimmed = keyInput.trim();
    if (!trimmed) {
      setTestMsg(t("הדביקו מפתח sk-or-v1-…", "Paste an sk-or-v1-… key"));
      return;
    }
    setTesting(true);
    setTestMsg(null);
    saveOpenRouterKey(trimmed);
    const result = await pingOpenRouter(trimmed);
    setTesting(false);
    if (result.ok) {
      setLive(true);
      setTestMsg(
        t(`מחובר · ${result.model}`, `Connected · ${result.model}`)
      );
      pushToast(t("AI חי מחובר ל-OpenRouter", "Live AI connected to OpenRouter"));
      setOpen(false);
    } else {
      setLive(hasOpenRouterKey());
      const errMap: Record<string, [string, string]> = {
        unauthorized: ["מפתח לא תקין", "Invalid API key"],
        missing_key: ["חסר מפתח", "Missing key"],
        unreachable: ["לא ניתן להגיע ל-OpenRouter", "OpenRouter unreachable"],
      };
      const pair = errMap[result.error] ?? ["בדיקה נכשלה", "Ping failed"];
      setTestMsg(locale === "he" ? pair[0] : pair[1]);
      pushToast(locale === "he" ? pair[0] : pair[1], "error");
    }
  };

  return (
    <div className="relative" ref={popRef}>
      <button
        type="button"
        onClick={() => {
          setOpen((v) => !v);
          setKeyInput(resolveOpenRouterKey());
          setTestMsg(null);
        }}
        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium transition ${
          live
            ? "border-emerald-200 bg-emerald-50 text-emerald-800"
            : "border-amber-200 bg-amber-50 text-amber-900"
        }`}
      >
        <span
          className={`h-1.5 w-1.5 shrink-0 rounded-full ${
            live ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        <span className="hidden sm:inline">
          {live
            ? t("AI חי (OpenRouter מחובר)", "AI live (OpenRouter connected)")
            : t("מצב הדגמה (חבר מפתח AI)", "Demo mode (connect AI key)")}
        </span>
        <span className="sm:hidden">
          {live ? t("AI חי", "AI live") : t("הדגמה", "Demo")}
        </span>
      </button>

      {open && (
        <div className="absolute top-full z-50 mt-2 w-[min(92vw,340px)] rounded-2xl border border-stone-border bg-white p-4 shadow-xl end-0">
          <div className="mb-3 flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-terracotta" />
              <p className="text-sm font-semibold text-charcoal">
                {t("מפתח OpenRouter", "OpenRouter API key")}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md p-0.5 text-charcoal/40 hover:text-charcoal"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mb-2 text-[11px] leading-relaxed text-charcoal/55">
            {t(
              "המפתח נשמר ב-localStorage ומשמש מיד — גם אם .env.local לא נטען.",
              "Saved in localStorage and used immediately — even if .env.local did not load."
            )}
          </p>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="sk-or-v1-…"
            dir="ltr"
            className="w-full rounded-xl border border-stone-border bg-porcelain px-3 py-2 text-left text-xs outline-none focus:border-terracotta/40"
            autoComplete="off"
            spellCheck={false}
          />
          {testMsg && (
            <p className="mt-2 text-[11px] text-charcoal/70">{testMsg}</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={testing}
              onClick={() => void saveAndTest()}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-terracotta px-3 py-2 text-xs font-medium text-white disabled:opacity-60"
            >
              {testing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {t("שמור ובדוק חיבור", "Save & test connection")}
            </button>
            {live && (
              <button
                type="button"
                onClick={() => {
                  clearOpenRouterKey();
                  setKeyInput("");
                  setLive(false);
                  setTestMsg(null);
                  pushToast(t("המפתח הוסר", "Key removed"), "info");
                }}
                className="rounded-xl border border-stone-border px-3 py-2 text-xs"
              >
                {t("נקה", "Clear")}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
