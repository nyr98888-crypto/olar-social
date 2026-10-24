"use client";

import { useMemo, useState } from "react";
import {
  Activity,
  Building2,
  Copy,
  Eye,
  ExternalLink,
  Film,
  Link2,
  Link2Off,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { BladeShell } from "@/components/BladeShell";
import { useOlarStore } from "@/hooks/useOlarStore";
import type { NetworkId, SocialNetwork } from "@/types/olar";
import { NETWORK_META, PLATFORM_BRAND } from "@/types/olar";
import { SocialLogo } from "@/components/icons/SocialLogos";

type StatFilter = "all" | "connected" | "business" | "private";

export function NetworksHubView() {
  const {
    networks,
    locale,
    t,
    connectNetwork,
    setNetworkAccountType,
    updateNetwork,
    pushToast,
    currentDraft,
  } = useOlarStore();
  const [filter, setFilter] = useState<StatFilter>("all");
  const [portalFor, setPortalFor] = useState<NetworkId | null>(null);
  const [portalTab, setPortalTab] = useState<"business" | "private">("business");

  const filtered = useMemo(() => {
    return networks.filter((n) => {
      if (filter === "connected") return n.connected;
      if (filter === "business") return n.accountType === "business";
      if (filter === "private") return n.accountType === "private";
      return true;
    });
  }, [networks, filter]);

  const totals = useMemo(() => {
    const list = networks.filter((n) => n.connected);
    const reach = list.reduce((a, n) => a + n.stats.reach, 0);
    const eng =
      list.reduce((a, n) => a + n.stats.engagementRate, 0) / (list.length || 1);
    const growth =
      list.reduce((a, n) => a + n.stats.followerGrowth, 0) / (list.length || 1);
    const reels = list.reduce((a, n) => a + n.stats.reelsViews, 0);
    const top = [...list].sort(
      (a, b) => b.stats.engagementRate - a.stats.engagementRate
    )[0];
    return { reach, eng, growth, reels, topFormat: top?.stats.topFormat ?? "—" };
  }, [networks]);

  const openPortal = (id: NetworkId, tab: "business" | "private") => {
    setPortalTab(tab);
    setNetworkAccountType(id, tab === "business" ? "business" : "private");
    setPortalFor(id);
  };

  const activeNet = portalFor
    ? networks.find((n) => n.id === portalFor) ?? null
    : null;

  return (
    <BladeShell title={t("רשתות, חיבורים וסטטיסטיקה", "Networks, connections & stats")}>
      <div className="mb-6 flex flex-wrap gap-2">
        {(
          [
            ["all", "הכל", "All"],
            ["connected", "מחוברות", "Connected"],
            ["business", "עסקי", "Business"],
            ["private", "פרטי", "Private"],
          ] as const
        ).map(([id, he, en]) => (
          <button
            key={id}
            type="button"
            onClick={() => setFilter(id)}
            className={`rounded-full border-2 px-4 py-2 text-sm font-bold ${
              filter === id
                ? "border-slate-900 bg-slate-900 text-white"
                : "border-slate-300 bg-white text-slate-900"
            }`}
          >
            {locale === "he" ? he : en}
          </button>
        ))}
      </div>

      <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {[
          { icon: Eye, label: t("חשיפה", "Reach"), value: totals.reach.toLocaleString() },
          {
            icon: Activity,
            label: t("מעורבות", "Engagement"),
            value: `${totals.eng.toFixed(1)}%`,
          },
          {
            icon: TrendingUp,
            label: t("צמיחת עוקבים", "Follower growth"),
            value: `+${totals.growth.toFixed(1)}%`,
          },
          {
            icon: Users,
            label: t("פורמט מוביל", "Top format"),
            value: String(totals.topFormat),
          },
          {
            icon: Film,
            label: t("צפיות רילס/שורטס", "Reels/Shorts views"),
            value: totals.reels.toLocaleString(),
          },
        ].map((card) => (
          <div key={card.label} className="olar-card p-4">
            <card.icon className="mb-2 h-5 w-5 text-terracotta" />
            <p className="text-sm font-bold text-slate-700">{card.label}</p>
            <p className="mt-1 text-lg font-extrabold text-slate-900">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {filtered.map((n) => {
          return (
            <article key={n.id} className="olar-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <SocialLogo network={n.id} size={40} />
                  <div>
                    <h3 className="olar-card-title">
                      {locale === "he" ? n.nameHe : n.name}
                    </h3>
                    <p className="mt-0.5 text-sm font-medium text-slate-700">
                      {n.formats.join(" · ")} · {n.defaultAspect}
                    </p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                    n.connected
                      ? "bg-emerald-100 text-emerald-900"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {n.connected ? t("מחובר", "Connected") : t("מנותק", "Off")}
                </span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => openPortal(n.id, "business")}
                  className={`inline-flex items-center gap-1 rounded-lg border-2 px-3 py-2 text-sm font-bold ${
                    n.accountType === "business"
                      ? "border-terracotta bg-terracotta/10 text-terracotta"
                      : "border-slate-300 text-slate-900"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  {t("חשבון עסקי (אוטומטי)", "Business (auto)")}
                </button>
                <button
                  type="button"
                  onClick={() => openPortal(n.id, "private")}
                  className={`rounded-lg border-2 px-3 py-2 text-sm font-bold ${
                    n.accountType === "private"
                      ? "border-terracotta bg-terracotta/10 text-terracotta"
                      : "border-slate-300 text-slate-900"
                  }`}
                >
                  {t("חשבון פרטי (שליפה מהירה)", "Private (express)")}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm font-medium text-slate-800">
                <div className="rounded-lg border-2 border-slate-200 bg-slate-50 py-2">
                  <p className="font-extrabold text-slate-900">{n.stats.reach}</p>
                  <p>{t("חשיפה", "Reach")}</p>
                </div>
                <div className="rounded-lg border-2 border-slate-200 bg-slate-50 py-2">
                  <p className="font-extrabold text-slate-900">
                    {n.stats.engagementRate}%
                  </p>
                  <p>ER</p>
                </div>
                <div className="rounded-lg border-2 border-slate-200 bg-slate-50 py-2">
                  <p className="font-extrabold text-slate-900">{n.stats.reelsViews}</p>
                  <p>{t("רילס", "Reels")}</p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                {n.connected ? (
                  <button
                    type="button"
                    onClick={() => connectNetwork(n.id, false)}
                    className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl border-2 border-slate-300 px-3 py-2.5 text-sm font-bold"
                  >
                    <Link2Off className="h-4 w-4" />
                    {t("נתק", "Disconnect")}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      openPortal(
                        n.id,
                        n.accountType === "business" ? "business" : "private"
                      )
                    }
                    className="olar-btn-accent inline-flex flex-1 items-center justify-center gap-1.5"
                  >
                    <Link2 className="h-4 w-4" />
                    {t("התחבר", "Connect")}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {activeNet && portalFor && (
        <ConnectionPortal
          network={activeNet}
          tab={portalTab}
          onTab={setPortalTab}
          onClose={() => setPortalFor(null)}
          onSave={(patch) => {
            updateNetwork(portalFor, patch);
            connectNetwork(portalFor, true);
            setPortalFor(null);
            pushToast(t("החיבור נשמר", "Connection saved"));
          }}
          onCopy={async () => {
            const text = currentDraft
              ? [
                  currentDraft.headline,
                  currentDraft.body,
                  [...(activeNet.defaultHashtags || []), ...currentDraft.hashtags].join(
                    " "
                  ),
                ].join("\n\n")
              : (activeNet.defaultHashtags || []).join(" ");
            await navigator.clipboard.writeText(text);
            pushToast(t("הטקסט הועתק", "Copied"));
          }}
          onLaunch={() => {
            const url =
              portalTab === "private"
                ? activeNet.profileUrl || activeNet.deepLink
                : activeNet.pageUrl || activeNet.deepLink;
            window.open(url || NETWORK_META[activeNet.id].deepLink, "_blank");
          }}
          t={t}
          locale={locale}
        />
      )}
    </BladeShell>
  );
}

function ConnectionPortal({
  network,
  tab,
  onTab,
  onClose,
  onSave,
  onCopy,
  onLaunch,
  t,
  locale,
}: {
  network: SocialNetwork;
  tab: "business" | "private";
  onTab: (t: "business" | "private") => void;
  onClose: () => void;
  onSave: (patch: Partial<SocialNetwork>) => void;
  onCopy: () => void;
  onLaunch: () => void;
  t: (he: string, en: string) => string;
  locale: string;
}) {
  const [pageUrl, setPageUrl] = useState(network.pageUrl || "");
  const [businessId, setBusinessId] = useState(network.businessId || "");
  const [accessToken, setAccessToken] = useState(network.accessToken || "");
  const [autoPublish, setAutoPublish] = useState(network.autoPublish ?? false);
  const [profileUrl, setProfileUrl] = useState(network.profileUrl || "");
  const [hashtags, setHashtags] = useState(
    (network.defaultHashtags || []).join(" ")
  );
  const brand = PLATFORM_BRAND[network.id];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
      <div className="olar-card max-h-[90vh] w-full max-w-lg overflow-y-auto p-5 shadow-2xl">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <span
              className="flex h-11 w-11 items-center justify-center rounded-xl text-sm font-extrabold"
              style={{ background: brand.bg, color: brand.color }}
            >
              {brand.label}
            </span>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">
                {t("פורטל חיבור ופרסום", "Connection & publishing portal")}
              </h3>
              <p className="text-sm font-bold text-slate-700">
                {locale === "he" ? network.nameHe : network.name}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-4 flex rounded-xl border-2 border-slate-300 p-1">
          <button
            type="button"
            onClick={() => onTab("business")}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold ${
              tab === "business" ? "bg-slate-900 text-white" : "text-slate-900"
            }`}
          >
            {t("חיבור חשבון עסקי", "Business API / OAuth")}
          </button>
          <button
            type="button"
            onClick={() => onTab("private")}
            className={`flex-1 rounded-lg px-3 py-2.5 text-sm font-bold ${
              tab === "private" ? "bg-slate-900 text-white" : "text-slate-900"
            }`}
          >
            {t("גשר לחשבון פרטי", "Private account bridge")}
          </button>
        </div>

        {tab === "business" ? (
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-900">
              {t("כתובת עמוד / חשבון", "Page / account URL")}
              <input
                value={pageUrl}
                onChange={(e) => setPageUrl(e.target.value)}
                dir="ltr"
                className="olar-input mt-1"
                placeholder="https://…"
              />
            </label>
            <label className="block text-sm font-bold text-slate-900">
              {t("מזהה עסקי (Business ID)", "Business ID")}
              <input
                value={businessId}
                onChange={(e) => setBusinessId(e.target.value)}
                dir="ltr"
                className="olar-input mt-1"
              />
            </label>
            <label className="block text-sm font-bold text-slate-900">
              {t("Access Token", "Access Token")}
              <input
                type="password"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                dir="ltr"
                className="olar-input mt-1"
              />
            </label>
            <label className="flex items-center gap-2 text-base font-bold text-slate-900">
              <input
                type="checkbox"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="h-4 w-4"
              />
              {t("פרסום אוטומטי ישיר", "Direct auto-publish")}
            </label>
            <button
              type="button"
              onClick={() => {
                // Simulated OAuth window
                window.open(
                  network.deepLink,
                  "olar-oauth",
                  "width=520,height=640"
                );
              }}
              className="w-full rounded-xl border-2 border-slate-300 py-2.5 text-sm font-bold hover:bg-slate-50"
            >
              {t("התחברות OAuth מדומה (חלון)", "Simulated OAuth login window")}
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-900">
              {t("כתובת פרופיל אישי", "Personal profile URL")}
              <input
                value={profileUrl}
                onChange={(e) => setProfileUrl(e.target.value)}
                dir="ltr"
                className="olar-input mt-1"
                placeholder="instagram.com/your_handle"
              />
            </label>
            <label className="block text-sm font-bold text-slate-900">
              {t("האשטגים ברירת מחדל לרשת", "Default hashtags for network")}
              <input
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                className="olar-input mt-1"
                placeholder="#garage #herzliya"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={onCopy}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 py-2.5 text-sm font-bold"
              >
                <Copy className="h-4 w-4" />
                {t("העתק פוסט מפורמט", "Copy formatted post")}
              </button>
              <button
                type="button"
                onClick={onLaunch}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-slate-300 py-2.5 text-sm font-bold"
              >
                <ExternalLink className="h-4 w-4" />
                {t("פתח את הפלטפורמה", "Launch platform")}
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border-2 border-slate-300 py-2.5 text-base font-bold"
          >
            {t("ביטול", "Cancel")}
          </button>
          <button
            type="button"
            onClick={() =>
              onSave({
                accountType: tab,
                connected: true,
                pageUrl,
                businessId,
                accessToken,
                autoPublish,
                profileUrl,
                defaultHashtags: hashtags
                  .split(/\s+/)
                  .map((x) => x.trim())
                  .filter(Boolean),
              })
            }
            className="olar-btn-accent flex-1"
          >
            {t("שמור וחבר", "Save & connect")}
          </button>
        </div>
      </div>
    </div>
  );
}
