"use client";

import { useState } from "react";
import { LogIn, LogOut, UserRound, X } from "lucide-react";
import { useOlarStore } from "@/hooks/useOlarStore";

export function AuthModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { user, loginUser, logoutUser, t, locale } = useOlarStore();
  const [name, setName] = useState(user.name || "");
  const [email, setEmail] = useState(user.email || "");
  const [phone, setPhone] = useState(user.phone || "");
  const [password, setPassword] = useState("");

  if (!open) return null;

  const submit = () => {
    const display = name.trim() || email.split("@")[0] || "User";
    loginUser({
      name: display,
      email: email.trim(),
      phone: phone.trim(),
      plan: "pro",
      loggedIn: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[85] flex items-center justify-center bg-slate-900/55 p-4">
      <div className="olar-card w-full max-w-md border-2 border-slate-900 p-5 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-extrabold text-slate-900">
            {user.loggedIn
              ? t("חשבון משתמש", "User account")
              : t("התחברות משתמש רשום", "Registered user login")}
          </h3>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {user.loggedIn ? (
          <div className="space-y-4">
            <p className="text-base font-bold text-slate-900">
              {t(
                `מחובר: ${user.name} (מסלול ${user.plan === "pro" ? "Pro" : "Free"})`,
                `Signed in: ${user.name} (${user.plan === "pro" ? "Pro" : "Free"} plan)`
              )}
            </p>
            <p className="text-sm font-medium text-slate-700">
              {user.email || user.phone || "—"}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setName("");
                  setEmail("");
                  setPhone("");
                  logoutUser();
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 py-2.5 text-sm font-bold"
              >
                <LogOut className="h-4 w-4" />
                {t("התנתק / החלף עסק", "Log out / switch business")}
              </button>
              <button type="button" onClick={onClose} className="olar-btn-primary flex-1">
                {t("סגור", "Close")}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-900">
              {t("שם מלא", "Full name")}
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="olar-input mt-1"
                placeholder={locale === "he" ? "ישראל ישראלי" : "Jane Doe"}
              />
            </label>
            <label className="block text-sm font-bold text-slate-900">
              {t("אימייל", "Email")}
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                dir="ltr"
                className="olar-input mt-1"
                placeholder="you@business.com"
              />
            </label>
            <label className="block text-sm font-bold text-slate-900">
              {t("טלפון", "Phone")}
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                dir="ltr"
                className="olar-input mt-1"
                placeholder="05X-XXXXXXX"
              />
            </label>
            <label className="block text-sm font-bold text-slate-900">
              {t("סיסמה", "Password")}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                dir="ltr"
                className="olar-input mt-1"
                placeholder="••••••••"
              />
            </label>
            <button
              type="button"
              onClick={() => {
                loginUser({
                  name: name.trim() || "Google User",
                  email: email.trim() || "user@gmail.com",
                  phone: phone.trim(),
                  plan: "pro",
                });
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-300 py-2.5 text-sm font-bold hover:bg-slate-50"
            >
              <UserRound className="h-4 w-4" />
              {t("התחברות Google בלחיצה אחת (סימולציה)", "1-Click Google Sign-In (simulated)")}
            </button>
            <button
              type="button"
              onClick={submit}
              className="olar-btn-accent flex w-full items-center justify-center gap-2"
            >
              <LogIn className="h-4 w-4" />
              {t("התחבר ושחזר סביבת עבודה", "Sign in & restore workspace")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AuthPill({ onOpen }: { onOpen: () => void }) {
  const { user, t } = useOlarStore();
  return (
    <button
      type="button"
      onClick={onOpen}
      className="inline-flex max-w-[220px] items-center gap-1.5 truncate rounded-xl border-2 border-slate-300 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-900 hover:border-terracotta"
    >
      <UserRound className="h-3.5 w-3.5 shrink-0 text-terracotta" />
      <span className="truncate">
        {user.loggedIn
          ? t(
              `👤 מחובר: ${user.name} (מסלול Pro)`,
              `👤 Signed in: ${user.name} (Pro)`
            )
          : t("התחברות משתמש רשום", "Registered user login")}
      </span>
    </button>
  );
}
