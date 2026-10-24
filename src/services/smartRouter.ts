import type {
  AiEngineMode,
  BrandProfile,
  CampaignPost,
  ContentFormat,
  DailyBriefing,
  Locale,
  NetworkId,
  AspectRatio,
} from "@/types/olar";
import { NETWORK_META } from "@/types/olar";
import { auditContent } from "@/services/contentAuditor";

export const OPENROUTER_KEY_STORAGE = "olar_openrouter_key";
export const AI_KEY_CHANGED_EVENT = "olar-ai-key-changed";

/** Free/routine cascade — try next on 404 / 429 / 5xx before local fallback. */
export const FREE_MODELS_WATERFALL = [
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemini-2.0-flash-exp:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "google/gemini-2.0-flash-001", // ultra-low-cost safety net
] as const;

/** Pro heavy-lifting cascade for multi-network / guardian-grade jobs. */
export const PRO_MODELS_WATERFALL = [
  "openai/gpt-4o-mini",
  "google/gemini-2.0-flash-001",
  "anthropic/claude-3.5-sonnet",
  ...FREE_MODELS_WATERFALL,
] as const;

function modelsForEngine(engine: AiEngineMode): readonly string[] {
  return engine === "pro" ? PRO_MODELS_WATERFALL : FREE_MODELS_WATERFALL;
}

export function resolveOpenRouterKey(): string {
  if (typeof window !== "undefined") {
    const fromStorage = localStorage.getItem(OPENROUTER_KEY_STORAGE)?.trim();
    if (fromStorage) return fromStorage;
  }
  return (
    process.env.NEXT_PUBLIC_OPENROUTER_API_KEY?.trim() ||
    process.env.OPENROUTER_API_KEY?.trim() ||
    ""
  );
}

export function hasOpenRouterKey(): boolean {
  return resolveOpenRouterKey().length > 0;
}

export function saveOpenRouterKey(key: string): void {
  if (typeof window === "undefined") return;
  const trimmed = key.trim();
  if (trimmed) localStorage.setItem(OPENROUTER_KEY_STORAGE, trimmed);
  else localStorage.removeItem(OPENROUTER_KEY_STORAGE);
  window.dispatchEvent(new Event(AI_KEY_CHANGED_EVENT));
}

export function clearOpenRouterKey(): void {
  saveOpenRouterKey("");
}

export type PingResult =
  | { ok: true; model: string }
  | { ok: false; error: string };

export async function pingOpenRouter(keyOverride?: string): Promise<PingResult> {
  const apiKey = (keyOverride ?? resolveOpenRouterKey()).trim();
  if (!apiKey) return { ok: false, error: "missing_key" };

  const cascade = FREE_MODELS_WATERFALL;
  const errors: string[] = [];

  for (let i = 0; i < cascade.length; i++) {
    const model = cascade[i];
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": typeof window !== "undefined" ? window.location.origin : "https://olar-social.local",
          "X-Title": "Olar Social",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "ping" }],
          max_tokens: 1,
        }),
      });
      if (res.status === 401 || res.status === 403) {
        return { ok: false, error: `HTTP ${res.status}: unauthorized / invalid key` };
      }
      if (res.status === 404 || res.status === 429 || res.status >= 500) {
        errors.push(`${model} → HTTP ${res.status}`);
        continue;
      }
      if (!res.ok) {
        const errText = await res.text().catch(() => "");
        errors.push(`${model} → HTTP ${res.status}: ${errText.slice(0, 120)}`);
        continue;
      }
      const data = await res.json();
      if (data?.choices?.[0] || data?.id) return { ok: true, model };
      errors.push(`${model} → empty`);
    } catch (e) {
      errors.push(`${model} → ${e instanceof Error ? e.message : "network error"}`);
    }
  }
  return { ok: false, error: errors.join(" | ") || "unreachable" };
}

function uid(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function contactFooter(brand: BrandProfile, locale: Locale): string {
  const lines: string[] = [];
  if (brand.phone) {
    lines.push(locale === "he" ? `📞 ${brand.phone}` : `📞 ${brand.phone}`);
  }
  if (brand.address) {
    lines.push(locale === "he" ? `📍 ${brand.address}` : `📍 ${brand.address}`);
  }
  if (brand.website) {
    lines.push(locale === "he" ? `🔗 ${brand.website}` : `🔗 ${brand.website}`);
  }
  if (brand.email) {
    lines.push(`✉️ ${brand.email}`);
  }
  return lines.length ? `\n\n${lines.join("\n")}` : "";
}

function defaultImagePrompt(brand: BrandProfile, topic: string): string {
  const industry = brand.industry || "local business";
  const name = brand.name || "business";
  const focus = topic || brand.offer || industry;
  return `Photorealistic professional photo of ${industry} business "${name}", scene about ${focus}, Israeli business atmosphere, bright natural lighting, high detail, no text overlay, no watermark`;
}

export function pollinationsUrl(
  englishVisualPrompt: string,
  opts?: { width?: number; height?: number; seed?: number }
): string {
  const seed = opts?.seed ?? Math.floor(Math.random() * 1_000_000);
  const w = opts?.width ?? 1080;
  const h = opts?.height ?? 1080;
  const prompt = encodeURIComponent(englishVisualPrompt.trim() || "professional business photography");
  return `https://image.pollinations.ai/prompt/${prompt}?width=${w}&height=${h}&nologo=true&seed=${seed}`;
}

function aspectFor(networkId: NetworkId, format?: ContentFormat): AspectRatio {
  if (format === "reels" || format === "stories" || format === "shorts") return "9:16";
  if (format === "pin") return "2:3";
  if (networkId === "tiktok" || networkId === "youtube") return "9:16";
  if (networkId === "pinterest") return "2:3";
  return NETWORK_META[networkId].defaultAspect;
}

function imageSizeFor(aspect: AspectRatio): { width: number; height: number } {
  if (aspect === "9:16") return { width: 1080, height: 1920 };
  if (aspect === "2:3") return { width: 1000, height: 1500 };
  if (aspect === "16:9") return { width: 1920, height: 1080 };
  return { width: 1080, height: 1080 };
}

function hashtagsFor(brand: BrandProfile, locale: Locale): string[] {
  const base =
    locale === "he"
      ? ["שיווק", brand.industry, brand.name, "ישראל"]
      : ["marketing", brand.industry, brand.name, "israel"];
  return base
    .filter(Boolean)
    .slice(0, 6)
    .map((t) => `#${String(t).replace(/[^a-zA-Z0-9\u0590-\u05FF]/g, "")}`);
}

function appendFooter(body: string, brand: BrandProfile, locale: Locale): string {
  const footer = contactFooter(brand, locale);
  if (!footer) return body;
  if (brand.phone && body.includes(brand.phone)) return body;
  return `${body.trim()}${footer}`;
}

/** Context-aware local draft — used only when API is unavailable. */
function fallbackCampaign(
  brand: BrandProfile,
  prompt: string,
  networkId: NetworkId,
  locale: Locale,
  campaignType?: string
): CampaignPost {
  const format = NETWORK_META[networkId].formats[0];
  const aspect = aspectFor(networkId, format);
  const topic = prompt || campaignType || brand.offer;
  const name = brand.name || (locale === "he" ? "העסק" : "Business");
  const imagePromptEn = defaultImagePrompt(brand, topic);
  const size = imageSizeFor(aspect);

  const headline =
    locale === "he"
      ? `${name} · ${topic}`.slice(0, 60)
      : `${name} · ${topic}`.slice(0, 60);

  const bodyHe = [
    `לקוחות של ${name} יודעים למה ${brand.industry} זה לא רק מקצוע — זה אמון.`,
    ``,
    `היום אנחנו מדברים על: ${topic}.`,
    brand.offer ? `\n${brand.offer}` : "",
    brand.priceList ? `\nמחירון מותג:\n${brand.priceList}` : "",
    ``,
    `רוצים לשמוע עוד? דברו איתנו.`,
  ]
    .filter((l) => l !== undefined)
    .join("\n");

  const bodyEn = [
    `Clients of ${name} know why ${brand.industry} is about trust.`,
    ``,
    `Today's focus: ${topic}.`,
    brand.offer ? `\n${brand.offer}` : "",
    ``,
    `Ready to talk? Reach out.`,
  ].join("\n");

  return {
    id: uid("post"),
    networkId,
    format,
    aspectRatio: aspect,
    headline,
    body: appendFooter(locale === "he" ? bodyHe : bodyEn, brand, locale),
    hashtags: hashtagsFor(brand, locale),
    hook:
      locale === "he"
        ? `עצרו — אם אתם מחפשים ${topic} ב-${brand.industry}, זה בשבילכם.`
        : `Stop — if you need ${topic} in ${brand.industry}, this is for you.`,
    script:
      locale === "he"
        ? `הוק 3ש · ערך על ${topic} · CTA ליצירת קשר`
        : `3s hook · value on ${topic} · CTA`,
    pinTitle: networkId === "pinterest" ? headline : undefined,
    imagePromptEn,
    imageUrl: pollinationsUrl(imagePromptEn, { ...size }),
    status: "draft",
    createdAt: new Date().toISOString(),
    approved: false,
    source: "local",
  };
}

type AiCallResult = { content: string; model: string };
type AiCallFailure = { error: string };

function shouldRetryModel(status: number): boolean {
  return status === 404 || status === 429 || status >= 500 || status === 402;
}

async function callOpenRouter(
  system: string,
  user: string,
  engine: AiEngineMode = "free"
): Promise<AiCallResult | AiCallFailure> {
  const apiKey = resolveOpenRouterKey();
  if (!apiKey) {
    return {
      error:
        "No OpenRouter API key (paste in header badge or set NEXT_PUBLIC_OPENROUTER_API_KEY)",
    };
  }

  const cascade = modelsForEngine(engine);
  const errors: string[] = [];

  for (const model of cascade) {
    try {
      const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            typeof window !== "undefined"
              ? window.location.origin
              : "https://olar-social.local",
          "X-Title": "Olar Social",
        },
        body: JSON.stringify({
          model,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user },
          ],
          temperature: 0.75,
          max_tokens: 2500,
        }),
      });

      if (!res.ok) {
        let detail = res.statusText;
        try {
          const errJson = await res.json();
          detail =
            errJson?.error?.message ||
            errJson?.message ||
            JSON.stringify(errJson).slice(0, 200);
        } catch {
          detail = (await res.text().catch(() => detail)).slice(0, 200);
        }
        errors.push(`${model} → HTTP ${res.status}: ${detail}`);
        if (res.status === 401 || res.status === 403) {
          return { error: `HTTP ${res.status}: ${detail}` };
        }
        // 404 / 429 / 5xx / 402 → try next model in waterfall
        if (shouldRetryModel(res.status)) continue;
        continue;
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (typeof content === "string" && content.trim()) {
        return { content: content.trim(), model };
      }
      errors.push(`${model} → empty response`);
    } catch (e) {
      errors.push(`${model} → ${e instanceof Error ? e.message : "fetch failed"}`);
    }
  }

  return {
    error:
      errors.join(" | ") ||
      `All ${engine} waterfall models failed (${cascade.length} tried)`,
  };
}

/** Strip markdown fences and extract JSON — free models love ```json wrappers. */
export function stripMarkdownFences(raw: string): string {
  return raw
    .replace(/```json\s*/gi, "")
    .replace(/```\s*/g, "")
    .trim();
}

function parseJsonLoose<T>(raw: string): T | null {
  const cleaned = stripMarkdownFences(raw);

  const attempts = [cleaned, raw];
  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt) as T;
    } catch {
      /* try slice */
    }
    try {
      const start = attempt.indexOf("{");
      const end = attempt.lastIndexOf("}");
      if (start !== -1 && end > start) {
        return JSON.parse(attempt.slice(start, end + 1)) as T;
      }
    } catch {
      /* next */
    }
    try {
      const arrStart = attempt.indexOf("[");
      const arrEnd = attempt.lastIndexOf("]");
      if (arrStart !== -1 && arrEnd > arrStart) {
        const arr = JSON.parse(attempt.slice(arrStart, arrEnd + 1));
        if (Array.isArray(arr)) return { posts: arr } as T;
      }
    } catch {
      /* next */
    }
  }
  return null;
}

/** Last-resort salvage: keep live AI prose instead of discarding for a static template. */
function salvagePlainTextPosts(
  raw: string,
  targets: NetworkId[],
  brand: BrandProfile,
  prompt: string,
  locale: Locale,
  model: string
): CampaignPost[] | null {
  const cleaned = stripMarkdownFences(raw).trim();
  if (cleaned.length < 40) return null;

  const paragraphs = cleaned
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter((p) => p && !p.startsWith("{") && !p.startsWith("["));

  const body =
    paragraphs.length > 1
      ? paragraphs.slice(1).join("\n\n")
      : cleaned;
  const headline =
    paragraphs[0]?.replace(/^#+\s*/, "").slice(0, 80) ||
    `${brand.name} · ${prompt}`.slice(0, 60);

  if (body.length < 30) return null;

  return targets.map((networkId) => {
    const format = NETWORK_META[networkId].formats[0];
    const aspect = aspectFor(networkId, format);
    const size = imageSizeFor(aspect);
    const imagePromptEn = defaultImagePrompt(brand, prompt);
    return {
      id: uid("post"),
      networkId,
      format,
      aspectRatio: aspect,
      headline,
      body: appendFooter(body, brand, locale),
      hashtags: hashtagsFor(brand, locale),
      hook: headline,
      imagePromptEn,
      imageUrl: pollinationsUrl(imagePromptEn, { ...size }),
      status: "draft" as const,
      createdAt: new Date().toISOString(),
      approved: false,
      source: "live" as const,
      modelUsed: model,
    };
  });
}

function buildSystemPrompt(brand: BrandProfile, locale: Locale): string {
  const lang = locale === "he" ? "Hebrew (natural Israeli Hebrew, not translated-sounding)" : "English";
  return `You are Olar Social — an expert Israeli social-media copywriter and creative director.
Write rich, persuasive, industry-specific marketing posts in ${lang}.

BRAND DNA (use every relevant field):
- Business name: ${brand.name}
- Industry/category: ${brand.industry}
- Phone / WhatsApp: ${brand.phone || "(none)"}
- Email: ${brand.email || "(none)"}
- Physical address / city: ${brand.address || "(none)"}
- Website / booking link: ${brand.website || "(none)"}
- Audience: ${brand.audience}
- Tone: ${brand.tone}
- Core offer: ${brand.offer}
- Approved price list ONLY (never invent other prices): ${brand.priceList || "(no prices — do not invent numbers)"}
- Forbidden words (never use): ${brand.forbiddenWords.join(", ") || "none"}

RULES:
1. Tailor the post to THIS exact business and the user prompt (e.g. if brand is a garage and prompt is bodywork/paint — write authentic auto body-shop copy).
2. Strong hook, clear benefits, authentic local voice, CTA.
3. When phone/address/website exist, end the body with a contact footer including them.
4. Always include imagePromptEn: a detailed ENGLISH visual description for photorealistic image generation matching the business scene.
5. Return JSON ONLY — no markdown outside JSON.`;
}

export interface GenerateCampaignResult {
  posts: CampaignPost[];
  error: string | null;
  usedLiveAi: boolean;
}

export async function generateCampaign(params: {
  brand: BrandProfile;
  prompt: string;
  networkId: NetworkId;
  locale: Locale;
  campaignType?: string;
  networks?: NetworkId[];
  engine?: AiEngineMode;
}): Promise<GenerateCampaignResult> {
  const engine = params.engine ?? "free";
  const targets = params.networks?.length ? params.networks : [params.networkId];
  const system = buildSystemPrompt(params.brand, params.locale);
  const user = `User prompt / topic: "${params.prompt}"
Campaign type: ${params.campaignType ?? "value"}
Target networks: ${targets.join(", ")}
Engine: ${engine}

Return JSON exactly in this shape (raw JSON only — do NOT wrap in markdown fences):
{
  "posts": [
    {
      "networkId": "instagram",
      "headline": "...",
      "body": "...",
      "hashtags": ["#a","#b"],
      "hook": "...",
      "script": "...",
      "pinTitle": "...",
      "imagePromptEn": "Professional modern auto body shop garage in Israel, car painting and bodywork, bright studio lighting, photorealistic"
    }
  ]
}
Create one post object per target network. Make each network-native (Reels/TikTok = vertical script energy; X = punchy; LinkedIn = professional; etc).`;

  const ai = await callOpenRouter(system, user, engine);

  if ("error" in ai) {
    return {
      posts: targets.map((networkId) =>
        fallbackCampaign(params.brand, params.prompt, networkId, params.locale, params.campaignType)
      ),
      error: ai.error,
      usedLiveAi: false,
    };
  }

  const parsed = parseJsonLoose<{
    posts: Array<{
      networkId: NetworkId;
      headline: string;
      body: string;
      hashtags?: string[];
      hook?: string;
      script?: string;
      pinTitle?: string;
      imagePromptEn?: string;
    }>;
  }>(ai.content);

  if (!parsed?.posts?.length) {
    const salvaged = salvagePlainTextPosts(
      ai.content,
      targets,
      params.brand,
      params.prompt,
      params.locale,
      ai.model
    );
    if (salvaged?.length) {
      return { posts: salvaged, error: null, usedLiveAi: true };
    }
    return {
      posts: targets.map((networkId) =>
        fallbackCampaign(params.brand, params.prompt, networkId, params.locale, params.campaignType)
      ),
      error: `AI JSON parse failed after fence-strip. Model=${ai.model}. Preview: ${stripMarkdownFences(ai.content).slice(0, 180)}`,
      usedLiveAi: false,
    };
  }

  const posts = parsed.posts.map((p) => {
    const networkId = targets.includes(p.networkId) ? p.networkId : targets[0];
    const format = NETWORK_META[networkId].formats[0];
    const aspect = aspectFor(networkId, format);
    const size = imageSizeFor(aspect);
    const imagePromptEn =
      p.imagePromptEn?.trim() || defaultImagePrompt(params.brand, params.prompt);
    const body = appendFooter(p.body, params.brand, params.locale);

    const draft: CampaignPost = {
      id: uid("post"),
      networkId,
      format,
      aspectRatio: aspect,
      headline: p.headline,
      body,
      hashtags: p.hashtags?.length ? p.hashtags : hashtagsFor(params.brand, params.locale),
      hook: p.hook,
      script: p.script,
      pinTitle: p.pinTitle,
      imagePromptEn,
      imageUrl: pollinationsUrl(imagePromptEn, { ...size }),
      status: "draft",
      createdAt: new Date().toISOString(),
      approved: false,
      source: "live",
      modelUsed: ai.model,
    };

    const audit = auditContent(`${draft.headline}\n${draft.body}`, params.brand);
    if (!audit.passed && audit.priceHallucination) {
      // Strip invented prices by regenerating local body with brand DNA only
      const safe = fallbackCampaign(
        params.brand,
        params.prompt,
        networkId,
        params.locale,
        params.campaignType
      );
      return {
        ...safe,
        source: "live" as const,
        modelUsed: ai.model,
        headline: p.headline,
        imagePromptEn,
        imageUrl: pollinationsUrl(imagePromptEn, { ...size }),
      };
    }
    return draft;
  });

  return { posts, error: null, usedLiveAi: true };
}

export function buildDailyAgentSeedPosts(brand: BrandProfile, locale: Locale): CampaignPost[] {
  const topics =
    locale === "he"
      ? [
          { prompt: `פוסט ערך על ${brand.industry}`, network: "instagram" as NetworkId, hour: 10 },
          { prompt: `רילס קצר על ${brand.offer || brand.industry}`, network: "tiktok" as NetworkId, hour: 14 },
          { prompt: `קריאה לפעולה לסוף השבוע — ${brand.name}`, network: "facebook" as NetworkId, hour: 18 },
        ]
      : [
          { prompt: `Value post about ${brand.industry}`, network: "instagram" as NetworkId, hour: 10 },
          { prompt: `Short reel about ${brand.offer || brand.industry}`, network: "tiktok" as NetworkId, hour: 14 },
          { prompt: `Weekend CTA for ${brand.name}`, network: "facebook" as NetworkId, hour: 18 },
        ];

  return topics.map((t, i) => {
    const post = fallbackCampaign(brand, t.prompt, t.network, locale, i === 1 ? "reels" : i === 2 ? "sale" : "value");
    const when = new Date();
    when.setHours(t.hour, 0, 0, 0);
    if (when.getTime() < Date.now()) when.setDate(when.getDate() + 1);
    return {
      ...post,
      status: "queued" as const,
      scheduledAt: when.toISOString(),
      dailyAgent: true,
      approved: false,
    };
  });
}

export async function generateDailyBriefing(
  brand: BrandProfile,
  postsReady: number,
  locale: Locale
): Promise<DailyBriefing> {
  const today = new Date().toISOString().slice(0, 10);
  const system = buildSystemPrompt(brand, locale);
  const user = `Write a short daily agent briefing JSON for ${brand.name}.
postsReady=${postsReady}
Return: {"summaryHe":"...","summaryEn":"...","topInsightHe":"...","topInsightEn":"...","dailyMissionHe":"...","dailyMissionEn":"..."}`;

  const ai = await callOpenRouter(system, user, "free");
  if (!("error" in ai)) {
    const parsed = parseJsonLoose<{
      summaryHe: string;
      summaryEn: string;
      topInsightHe: string;
      topInsightEn: string;
      dailyMissionHe: string;
      dailyMissionEn: string;
    }>(ai.content);
    if (parsed?.summaryHe) {
      return {
        date: today,
        ...parsed,
        postsReady,
        taskIds: [],
      };
    }
  }

  return {
    date: today,
    summaryHe: `סוכן יומי: ${postsReady} פוסטים מוכנים לאישור • משימה: קמפיין ל-${brand.name}`,
    summaryEn: `Daily agent: ${postsReady} posts ready • mission: campaign for ${brand.name}`,
    postsReady,
    topInsightHe: `${brand.industry} מגיב לערך קצר + פרטי קשר ברורים.`,
    topInsightEn: `${brand.industry} responds to short value + clear contact.`,
    dailyMissionHe: `קמפיין יומי עבור ${brand.name}`,
    dailyMissionEn: `Daily campaign for ${brand.name}`,
    taskIds: [],
  };
}

export async function generateHashtags(
  brand: BrandProfile,
  topic: string,
  locale: Locale
): Promise<string[]> {
  const ai = await callOpenRouter(
    "Return JSON only: {\"hashtags\":[\"#a\"]} — no markdown fences.",
    `Hashtags for ${brand.name} / ${brand.industry} / ${topic} locale=${locale}`,
    "free"
  );
  if (!("error" in ai)) {
    const parsed = parseJsonLoose<{ hashtags: string[] }>(ai.content);
    if (parsed?.hashtags?.length) return parsed.hashtags.slice(0, 10);
  }
  return hashtagsFor(brand, locale);
}

export function refreshImage(brand: BrandProfile, topic: string, imagePromptEn?: string): string {
  const prompt = imagePromptEn || defaultImagePrompt(brand, topic);
  return pollinationsUrl(prompt);
}
