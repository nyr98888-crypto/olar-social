"use client";

import {
  createContext,
  createElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_BRAND,
  DEFAULT_USER,
  buildProgressSteps,
  createDefaultNetworks,
  type AgentTask,
  type BladeId,
  type BrandProfile,
  type CampaignPost,
  type DailyBriefing,
  type Locale,
  type NetworkId,
  type OperatingMode,
  type AiEngineMode,
  type OlarState,
  type SocialNetwork,
  type ToastMessage,
  type AccountType,
  type UserAccount,
} from "@/types/olar";
import {
  buildDailyAgentSeedPosts,
  generateCampaign,
  generateDailyBriefing,
  refreshImage,
} from "@/services/smartRouter";

const STORAGE_KEY = "olar-social-v1";

function todayBriefing(brand: BrandProfile, postsReady = 3): DailyBriefing {
  const today = new Date().toISOString().slice(0, 10);
  return {
    date: today,
    summaryHe: `סוכן יומי: ${postsReady} פוסטים מוכנים לאישור • רילס מוביל מאתמול • משימה יומית: קמפיין ל-${brand.name}`,
    summaryEn: `Daily agent: ${postsReady} posts ready • mission: campaign for ${brand.name}`,
    postsReady,
    topInsightHe: "רילס קצרים עם הוק ב-3 שניות מובילים אתמול.",
    topInsightEn: "Short reels with a 3s hook led yesterday.",
    dailyMissionHe: `קמפיין יומי עבור ${brand.name}`,
    dailyMissionEn: `Daily campaign for ${brand.name}`,
    taskIds: ["task_1", "task_2", "task_3"],
  };
}

function defaultTasks(brand: BrandProfile, postIds: string[]): AgentTask[] {
  return [
    {
      id: "task_1",
      titleHe: "פוסט ערך מוכן",
      titleEn: "Value post ready",
      descriptionHe: `טיוטת ערך עבור ${brand.name}`,
      descriptionEn: `Value draft for ${brand.name}`,
      completed: false,
      relatedPostIds: postIds[0] ? [postIds[0]] : [],
    },
    {
      id: "task_2",
      titleHe: "רילס להוקים",
      titleEn: "Hook reel",
      descriptionHe: "תסריט רילס 20 שניות",
      descriptionEn: "20s reel script",
      completed: false,
      relatedPostIds: postIds[1] ? [postIds[1]] : [],
    },
    {
      id: "task_3",
      titleHe: "קמפיין סופ״ש",
      titleEn: "Weekend campaign",
      descriptionHe: "מבצע/CTA לסוף השבוע",
      descriptionEn: "Weekend offer/CTA",
      completed: false,
      relatedPostIds: postIds[2] ? [postIds[2]] : [],
    },
  ];
}

function buildInitialState(): OlarState {
  const brand = { ...DEFAULT_BRAND };
  const seeds = buildDailyAgentSeedPosts(brand, "he");
  return {
    activeBrand: brand,
    networks: createDefaultNetworks(),
    operatingMode: "hybrid",
    aiEngineMode: "free",
    locale: "he",
    posts: seeds,
    briefing: todayBriefing(brand, seeds.length),
    agentTasks: defaultTasks(
      brand,
      seeds.map((p) => p.id)
    ),
    activeBlade: "studio",
    selectedNetworkId: "instagram",
    currentDraft: null,
    isLoading: false,
    loadingStatus: "",
    progressStep: 0,
    progressPercent: 0,
    progressSteps: buildProgressSteps(brand.name),
    lastAiError: null,
    toasts: [],
    briefingCollapsed: false,
    calendarHighlightIds: [],
    imageLoading: false,
    user: { ...DEFAULT_USER },
    mayaOpen: false,
    ttsEnabled: false,
  };
}

function normalizeBrand(raw: Partial<BrandProfile> | undefined): BrandProfile {
  return {
    ...DEFAULT_BRAND,
    ...raw,
    phone: raw?.phone ?? "",
    email: raw?.email ?? "",
    address: raw?.address ?? "",
    website: raw?.website ?? "",
    forbiddenWords: raw?.forbiddenWords ?? DEFAULT_BRAND.forbiddenWords,
  };
}

function loadState(): OlarState {
  if (typeof window === "undefined") return buildInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return buildInitialState();
    const parsed = JSON.parse(raw) as Partial<OlarState>;
    const base = buildInitialState();
    const brand = normalizeBrand(parsed.activeBrand);
    let posts = parsed.posts ?? [];
    const dailyQueued = posts.filter((p) => p.dailyAgent && p.status === "queued");
    if (dailyQueued.length < 3) {
      const seeds = buildDailyAgentSeedPosts(brand, parsed.locale ?? "he");
      const keep = posts.filter((p) => !(p.dailyAgent && p.status === "queued"));
      posts = [...seeds, ...keep];
    }
    return {
      ...base,
      ...parsed,
      activeBrand: brand,
      networks: parsed.networks?.length ? parsed.networks : base.networks,
      posts,
      agentTasks:
        parsed.agentTasks?.length &&
        parsed.agentTasks.some((t) => t.relatedPostIds.length)
          ? parsed.agentTasks
          : defaultTasks(
              brand,
              posts.filter((p) => p.dailyAgent && p.status === "queued").map((p) => p.id)
            ),
      briefing: {
        ...todayBriefing(
          brand,
          posts.filter((p) => p.status === "queued").length
        ),
        ...parsed.briefing,
        postsReady: posts.filter((p) => p.status === "queued").length,
      },
      toasts: [],
      isLoading: false,
      loadingStatus: "",
      lastAiError: null,
      currentDraft: parsed.currentDraft ?? null,
      calendarHighlightIds: [],
      imageLoading: false,
      briefingCollapsed: parsed.briefingCollapsed ?? false,
      aiEngineMode: parsed.aiEngineMode === "pro" ? "pro" : "free",
      progressStep: 0,
      progressPercent: 0,
      progressSteps: buildProgressSteps(brand.name),
      user: parsed.user
        ? { ...DEFAULT_USER, ...parsed.user }
        : { ...DEFAULT_USER },
      mayaOpen: false,
      ttsEnabled: parsed.ttsEnabled ?? false,
    };
  } catch {
    return buildInitialState();
  }
}

type PersistSlice = Pick<
  OlarState,
  | "activeBrand"
  | "networks"
  | "operatingMode"
  | "aiEngineMode"
  | "locale"
  | "posts"
  | "briefing"
  | "agentTasks"
  | "selectedNetworkId"
  | "currentDraft"
  | "briefingCollapsed"
  | "activeBlade"
  | "user"
  | "ttsEnabled"
>;

export interface OlarStoreApi extends OlarState {
  t: (he: string, en: string) => string;
  setLocale: (locale: Locale) => void;
  setOperatingMode: (mode: OperatingMode) => void;
  setAiEngineMode: (mode: AiEngineMode) => void;
  setMayaOpen: (open: boolean) => void;
  setTtsEnabled: (on: boolean) => void;
  loginUser: (account: Partial<UserAccount> & { name: string }) => void;
  logoutUser: () => void;
  setActiveBlade: (blade: BladeId) => void;
  setSelectedNetwork: (id: NetworkId) => void;
  setBrandName: (name: string) => void;
  patchBrand: (patch: Partial<BrandProfile>) => void;
  updateBrand: (patch: Partial<BrandProfile>) => void;
  toggleBriefing: () => void;
  pushToast: (text: string, type?: ToastMessage["type"]) => void;
  dismissToast: (id: string) => void;
  clearAiError: () => void;
  connectNetwork: (id: NetworkId, connected: boolean) => void;
  setNetworkAccountType: (id: NetworkId, accountType: AccountType) => void;
  updateNetwork: (id: NetworkId, patch: Partial<SocialNetwork>) => void;
  updateNetworkStats: (id: NetworkId, stats: Partial<SocialNetwork["stats"]>) => void;
  setDraftField: (
    field: keyof Pick<
      CampaignPost,
      "headline" | "body" | "hook" | "script" | "pinTitle"
    >,
    value: string
  ) => void;
  setDraftHashtags: (hashtags: string[]) => void;
  swapDraftImage: () => void;
  runCampaign: (prompt: string, campaignType?: string) => Promise<void>;
  saveDraft: (status?: CampaignPost["status"], scheduledAt?: string) => void;
  approveAllHybrid: () => void;
  approveTask: (taskId: string) => void;
  deletePost: (postId: string) => void;
  movePost: (postId: string, scheduledAt: string) => void;
  addPostAt: (scheduledAt: string, networkId?: NetworkId) => void;
  refreshBriefing: () => Promise<void>;
  setCurrentDraft: (post: CampaignPost | null) => void;
  clearCalendarHighlights: () => void;
}

const OlarContext = createContext<OlarStoreApi | null>(null);

export function OlarProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<OlarState>(buildInitialState);
  const hydrated = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    setState(loadState());
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    const slice: PersistSlice = {
      activeBrand: state.activeBrand,
      networks: state.networks,
      operatingMode: state.operatingMode,
      aiEngineMode: state.aiEngineMode,
      locale: state.locale,
      posts: state.posts,
      briefing: state.briefing,
      agentTasks: state.agentTasks,
      selectedNetworkId: state.selectedNetworkId,
      currentDraft: state.currentDraft,
      briefingCollapsed: state.briefingCollapsed,
      activeBlade: state.activeBlade,
      user: state.user,
      ttsEnabled: state.ttsEnabled,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(slice));
  }, [state]);

  const pushToast = useCallback((text: string, type: ToastMessage["type"] = "success") => {
    const id = `toast_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    setState((s) => ({ ...s, toasts: [...s.toasts, { id, text, type }] }));
    setTimeout(() => {
      setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 3200);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setState((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }));
  }, []);

  const t = useCallback(
    (he: string, en: string) => (state.locale === "he" ? he : en),
    [state.locale]
  );

  const api = useMemo<OlarStoreApi>(() => {
    return {
      ...state,
      t,
      pushToast,
      dismissToast,
      clearAiError: () => setState((s) => ({ ...s, lastAiError: null })),
      clearCalendarHighlights: () =>
        setState((s) => ({ ...s, calendarHighlightIds: [] })),
      setLocale: (locale) => setState((s) => ({ ...s, locale })),
      setOperatingMode: (operatingMode) => setState((s) => ({ ...s, operatingMode })),
      setAiEngineMode: (aiEngineMode) => setState((s) => ({ ...s, aiEngineMode })),
      setMayaOpen: (mayaOpen) => setState((s) => ({ ...s, mayaOpen })),
      setTtsEnabled: (ttsEnabled) => setState((s) => ({ ...s, ttsEnabled })),
      loginUser: (account) => {
        setState((s) => ({
          ...s,
          user: {
            ...s.user,
            ...account,
            loggedIn: true,
            plan: account.plan ?? "pro",
          },
        }));
        pushToast(
          stateRef.current.locale === "he"
            ? `ברוך השב, ${account.name}! כל הרשתות והקמפיינים שלך מסונכרנים.`
            : `Welcome back, ${account.name}! Networks & campaigns synced.`,
          "success"
        );
      },
      logoutUser: () => {
        setState((s) => ({
          ...s,
          user: { ...DEFAULT_USER },
        }));
        pushToast(
          stateRef.current.locale === "he" ? "התנתקת בהצלחה" : "Logged out",
          "info"
        );
      },
      setActiveBlade: (activeBlade) => setState((s) => ({ ...s, activeBlade })),
      setSelectedNetwork: (selectedNetworkId) => {
        setState((s) => {
          const next = { ...s, selectedNetworkId };
          if (s.currentDraft) {
            const meta = s.networks.find((n) => n.id === selectedNetworkId);
            next.currentDraft = {
              ...s.currentDraft,
              networkId: selectedNetworkId,
              format: meta?.formats[0] ?? s.currentDraft.format,
              aspectRatio: meta?.defaultAspect ?? s.currentDraft.aspectRatio,
            };
          }
          return next;
        });
      },
      setBrandName: (name) => {
        setState((s) => ({
          ...s,
          activeBrand: { ...s.activeBrand, name },
        }));
      },
      patchBrand: (patch) => {
        setState((s) => ({
          ...s,
          activeBrand: { ...s.activeBrand, ...patch },
        }));
      },
      updateBrand: (patch) => {
        setState((s) => ({
          ...s,
          activeBrand: { ...s.activeBrand, ...patch },
        }));
        pushToast(
          stateRef.current.locale === "he" ? "DNA המותג נשמר" : "Brand DNA saved",
          "success"
        );
      },
      toggleBriefing: () =>
        setState((s) => ({ ...s, briefingCollapsed: !s.briefingCollapsed })),
      connectNetwork: (id, connected) => {
        setState((s) => ({
          ...s,
          networks: s.networks.map((n) => (n.id === id ? { ...n, connected } : n)),
        }));
        pushToast(
          connected
            ? stateRef.current.locale === "he"
              ? "הרשת חוברה"
              : "Network connected"
            : stateRef.current.locale === "he"
              ? "הרשת נותקה"
              : "Network disconnected"
        );
      },
      setNetworkAccountType: (id, accountType) => {
        setState((s) => ({
          ...s,
          networks: s.networks.map((n) => (n.id === id ? { ...n, accountType } : n)),
        }));
      },
      updateNetwork: (id, patch) => {
        setState((s) => ({
          ...s,
          networks: s.networks.map((n) => (n.id === id ? { ...n, ...patch } : n)),
        }));
      },
      updateNetworkStats: (id, stats) => {
        setState((s) => ({
          ...s,
          networks: s.networks.map((n) =>
            n.id === id ? { ...n, stats: { ...n.stats, ...stats } } : n
          ),
        }));
      },
      setDraftField: (field, value) => {
        setState((s) => {
          if (!s.currentDraft) return s;
          return { ...s, currentDraft: { ...s.currentDraft, [field]: value } };
        });
      },
      setDraftHashtags: (hashtags) => {
        setState((s) => {
          if (!s.currentDraft) return s;
          return { ...s, currentDraft: { ...s.currentDraft, hashtags } };
        });
      },
      swapDraftImage: () => {
        setState((s) => {
          if (!s.currentDraft) return s;
          const prompt =
            s.currentDraft.imagePromptEn ||
            `${s.activeBrand.industry} ${s.currentDraft.headline}`;
          return {
            ...s,
            imageLoading: true,
            currentDraft: {
              ...s.currentDraft,
              imagePromptEn: prompt,
              imageUrl: refreshImage(s.activeBrand, s.currentDraft.headline, prompt),
            },
          };
        });
        setTimeout(() => setState((s) => ({ ...s, imageLoading: false })), 1200);
      },
      runCampaign: async (prompt, campaignType) => {
        const snapshot = stateRef.current;
        const steps = buildProgressSteps(snapshot.activeBrand.name);
        const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

        const setProgress = (step: number, percent: number, status: string) => {
          setState((s) => ({
            ...s,
            isLoading: true,
            imageLoading: step >= 3,
            lastAiError: null,
            progressStep: step,
            progressPercent: percent,
            progressSteps: steps,
            loadingStatus: status,
          }));
        };

        setProgress(
          0,
          8,
          snapshot.locale === "he"
            ? steps[0].labelHe
            : steps[0].labelEn
        );
        await sleep(350);
        setProgress(1, 28, snapshot.locale === "he" ? steps[1].labelHe : steps[1].labelEn);

        try {
          const multi =
            snapshot.operatingMode !== "manual"
              ? snapshot.networks.filter((n) => n.connected).map((n) => n.id)
              : [snapshot.selectedNetworkId];

          const resultPromise = generateCampaign({
            brand: snapshot.activeBrand,
            prompt,
            networkId: snapshot.selectedNetworkId,
            locale: snapshot.locale,
            campaignType,
            networks: multi.length ? multi : [snapshot.selectedNetworkId],
            engine: snapshot.aiEngineMode ?? "free",
          });

          // Advance UI while network call runs
          await sleep(400);
          setProgress(2, 55, snapshot.locale === "he" ? steps[2].labelHe : steps[2].labelEn);

          const result = await resultPromise;

          setProgress(3, 82, snapshot.locale === "he" ? steps[3].labelHe : steps[3].labelEn);
          await sleep(450);

          const posts = result.posts;
          const primary =
            posts.find((p) => p.networkId === snapshot.selectedNetworkId) ?? posts[0];

          setState((s) => {
            let nextPosts = [...s.posts];
            let nextTasks = s.agentTasks;

            if (s.operatingMode === "auto") {
              const scheduled = posts.map((p, i) => {
                const when = new Date();
                when.setHours(10 + i, 0, 0, 0);
                if (when.getTime() < Date.now()) when.setDate(when.getDate() + 1);
                return {
                  ...p,
                  status: "scheduled" as const,
                  scheduledAt: when.toISOString(),
                  approved: true,
                };
              });
              nextPosts = [...scheduled, ...nextPosts];
            } else if (s.operatingMode === "hybrid") {
              const queued = posts.map((p) => ({
                ...p,
                status: "queued" as const,
                approved: false,
              }));
              nextPosts = [...queued, ...nextPosts];
              nextTasks = [
                {
                  id: `task_${Date.now()}`,
                  titleHe: `קמפיין חדש לאישור (${queued.length})`,
                  titleEn: `New campaign to approve (${queued.length})`,
                  descriptionHe: prompt.slice(0, 80),
                  descriptionEn: prompt.slice(0, 80),
                  completed: false,
                  relatedPostIds: queued.map((p) => p.id),
                },
                ...nextTasks,
              ];
            }

            return {
              ...s,
              posts: nextPosts,
              agentTasks: nextTasks,
              currentDraft: primary,
              selectedNetworkId: primary.networkId,
              isLoading: false,
              imageLoading: false,
              loadingStatus: "",
              progressStep: 3,
              progressPercent: 100,
              lastAiError: result.error,
              briefing: {
                ...s.briefing,
                postsReady: nextPosts.filter((p) => p.status === "queued").length,
              },
            };
          });

          if (result.usedLiveAi) {
            pushToast(
              snapshot.locale === "he" ? "נוצר עם AI חי" : "Created with live AI",
              "success"
            );
          } else {
            pushToast(
              snapshot.locale === "he"
                ? "נוצרה טיוטה מקומית (ראה שגיאת API)"
                : "Local draft created (see API error)",
              "info"
            );
          }
        } catch (e) {
          const msg = e instanceof Error ? e.message : "Unknown generation error";
          setState((s) => ({
            ...s,
            isLoading: false,
            imageLoading: false,
            loadingStatus: "",
            progressPercent: 0,
            lastAiError: msg,
          }));
          pushToast(
            snapshot.locale === "he" ? "שגיאה ביצירה" : "Generation failed",
            "error"
          );
        }
      },
      saveDraft: (status = "draft", scheduledAt) => {
        setState((s) => {
          if (!s.currentDraft) return s;
          const saved: CampaignPost = {
            ...s.currentDraft,
            status,
            scheduledAt: scheduledAt ?? s.currentDraft.scheduledAt,
            approved: status === "scheduled" || status === "published",
          };
          const exists = s.posts.some((p) => p.id === saved.id);
          return {
            ...s,
            currentDraft: saved,
            posts: exists
              ? s.posts.map((p) => (p.id === saved.id ? saved : p))
              : [saved, ...s.posts],
          };
        });
        pushToast(
          status === "scheduled"
            ? stateRef.current.locale === "he"
              ? "תוזמן ליומן"
              : "Scheduled"
            : stateRef.current.locale === "he"
              ? "נשמר כטיוטה"
              : "Saved as draft"
        );
      },
      approveAllHybrid: () => {
        let highlightIds: string[] = [];
        setState((s) => {
          const toSchedule = s.posts.filter((p) => p.status === "queued");
          highlightIds = toSchedule.map((p) => p.id);
          const updated = s.posts.map((p, idx) => {
            if (p.status !== "queued") return p;
            const when = p.scheduledAt ? new Date(p.scheduledAt) : new Date();
            if (!p.scheduledAt) {
              when.setHours(10 + (idx % 8), 0, 0, 0);
              if (when.getTime() < Date.now()) when.setDate(when.getDate() + 1);
            }
            return {
              ...p,
              status: "scheduled" as const,
              approved: true,
              scheduledAt: when.toISOString(),
            };
          });
          return {
            ...s,
            posts: updated,
            agentTasks: s.agentTasks.map((task) => ({ ...task, completed: true })),
            activeBlade: "calendar",
            calendarHighlightIds: highlightIds,
            briefingCollapsed: false,
            briefing: {
              ...s.briefing,
              postsReady: 0,
              summaryHe: `סוכן יומי: ${highlightIds.length} פוסטים אושרו ותוזמנו ל-${s.activeBrand.name}`,
              summaryEn: `Daily agent: ${highlightIds.length} posts approved & scheduled for ${s.activeBrand.name}`,
            },
          };
        });
        pushToast(
          stateRef.current.locale === "he"
            ? `${highlightIds.length || 3} פוסטים נוספו ליומן`
            : `${highlightIds.length || 3} posts added to calendar`
        );
      },
      approveTask: (taskId) => {
        setState((s) => {
          const task = s.agentTasks.find((x) => x.id === taskId);
          if (!task) return s;
          const ids = new Set(task.relatedPostIds);
          const updated = s.posts.map((p) => {
            const match =
              ids.has(p.id) ||
              (task.relatedPostIds.length === 0 && p.status === "queued");
            if (!match || p.status !== "queued") return p;
            const when = new Date();
            when.setDate(when.getDate() + 1);
            when.setHours(10, 0, 0, 0);
            return {
              ...p,
              status: "scheduled" as const,
              approved: true,
              scheduledAt: p.scheduledAt ?? when.toISOString(),
            };
          });
          return {
            ...s,
            agentTasks: s.agentTasks.map((x) =>
              x.id === taskId ? { ...x, completed: true } : x
            ),
            posts: updated,
            activeBlade: "calendar",
            calendarHighlightIds: Array.from(ids),
          };
        });
        pushToast(
          stateRef.current.locale === "he" ? "המשימה אושרה" : "Task approved"
        );
      },
      deletePost: (postId) => {
        setState((s) => ({
          ...s,
          posts: s.posts.filter((p) => p.id !== postId),
          currentDraft: s.currentDraft?.id === postId ? null : s.currentDraft,
        }));
        pushToast(
          stateRef.current.locale === "he" ? "הפוסט נמחק" : "Post deleted"
        );
      },
      movePost: (postId, scheduledAt) => {
        setState((s) => ({
          ...s,
          posts: s.posts.map((p) =>
            p.id === postId ? { ...p, scheduledAt, status: "scheduled" } : p
          ),
        }));
      },
      addPostAt: (scheduledAt, networkId) => {
        setState((s) => {
          const nid = networkId ?? s.selectedNetworkId;
          const meta = s.networks.find((n) => n.id === nid)!;
          const imagePromptEn = `${s.activeBrand.industry} ${s.activeBrand.name} professional photo`;
          const post: CampaignPost = {
            id: `post_${Date.now()}`,
            networkId: nid,
            format: meta.formats[0],
            aspectRatio: meta.defaultAspect,
            headline:
              s.locale === "he"
                ? `פוסט חדש · ${s.activeBrand.name}`
                : `New post · ${s.activeBrand.name}`,
            body: s.activeBrand.offer,
            hashtags: [`#${s.activeBrand.name.replace(/\s/g, "")}`],
            imagePromptEn,
            imageUrl: refreshImage(s.activeBrand, s.activeBrand.industry, imagePromptEn),
            status: "scheduled",
            scheduledAt,
            createdAt: new Date().toISOString(),
            approved: true,
            source: "local",
          };
          return { ...s, posts: [post, ...s.posts], currentDraft: post };
        });
        pushToast(
          stateRef.current.locale === "he" ? "נוסף ליומן" : "Added to calendar"
        );
      },
      refreshBriefing: async () => {
        const snap = stateRef.current;
        const briefing = await generateDailyBriefing(
          snap.activeBrand,
          snap.posts.filter((p) => p.status === "queued").length,
          snap.locale
        );
        setState((s) => ({ ...s, briefing }));
      },
      setCurrentDraft: (post) => setState((s) => ({ ...s, currentDraft: post })),
    };
  }, [state, t, pushToast, dismissToast]);

  return createElement(OlarContext.Provider, { value: api }, children);
}

export function useOlarStore(): OlarStoreApi {
  const ctx = useContext(OlarContext);
  if (!ctx) throw new Error("useOlarStore must be used within OlarProvider");
  return ctx;
}
