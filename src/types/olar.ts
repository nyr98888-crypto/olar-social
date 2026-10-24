export type Locale = "he" | "en";

export type OperatingMode = "manual" | "hybrid" | "auto";

/** Free-tier waterfall vs paid/pro heavy lifting */
export type AiEngineMode = "free" | "pro";

export type NetworkId =
  | "instagram"
  | "facebook"
  | "tiktok"
  | "youtube"
  | "x"
  | "pinterest"
  | "linkedin"
  | "threads"
  | "google"
  | "whatsapp"
  | "telegram";

export type AccountType = "business" | "private";

export type ContentFormat =
  | "feed"
  | "reels"
  | "stories"
  | "page"
  | "group"
  | "shorts"
  | "community"
  | "thread"
  | "pin"
  | "article"
  | "carousel"
  | "offer"
  | "broadcast";

export type AspectRatio = "1:1" | "9:16" | "2:3" | "16:9";

export type BladeId =
  | "studio"
  | "networks"
  | "creative"
  | "guardian"
  | "calendar"
  | "dna";

export type PostStatus = "draft" | "queued" | "scheduled" | "published" | "failed";

export interface BrandProfile {
  name: string;
  industry: string;
  phone: string;
  email: string;
  address: string;
  website: string;
  audience: string;
  tone: string;
  offer: string;
  priceList: string;
  forbiddenWords: string[];
  logoMonogram: string;
  borderColor: string;
  bgTone: string;
}

export interface NetworkStats {
  reach: number;
  engagementRate: number;
  followerGrowth: number;
  topFormat: string;
  reelsViews: number;
}

export interface SocialNetwork {
  id: NetworkId;
  name: string;
  nameHe: string;
  connected: boolean;
  accountType: AccountType;
  formats: ContentFormat[];
  defaultAspect: AspectRatio;
  deepLink: string;
  stats: NetworkStats;
  pageUrl?: string;
  businessId?: string;
  accessToken?: string;
  profileUrl?: string;
  defaultHashtags?: string[];
  autoPublish?: boolean;
}

export type ContentSource = "live" | "local";

export interface CampaignPost {
  id: string;
  networkId: NetworkId;
  format: ContentFormat;
  aspectRatio: AspectRatio;
  headline: string;
  body: string;
  hashtags: string[];
  hook?: string;
  script?: string;
  pinTitle?: string;
  imageUrl: string;
  imagePromptEn?: string;
  status: PostStatus;
  scheduledAt?: string;
  createdAt: string;
  approved?: boolean;
  source?: ContentSource;
  modelUsed?: string;
  dailyAgent?: boolean;
}

export interface DailyBriefing {
  date: string;
  summaryHe: string;
  summaryEn: string;
  postsReady: number;
  topInsightHe: string;
  topInsightEn: string;
  dailyMissionHe: string;
  dailyMissionEn: string;
  taskIds: string[];
}

export interface AgentTask {
  id: string;
  titleHe: string;
  titleEn: string;
  descriptionHe: string;
  descriptionEn: string;
  completed: boolean;
  relatedPostIds: string[];
}

export interface ToastMessage {
  id: string;
  text: string;
  type: "success" | "info" | "error";
}

export interface ProgressStepDef {
  id: string;
  labelHe: string;
  labelEn: string;
}

export interface UserAccount {
  name: string;
  email: string;
  phone: string;
  plan: "free" | "pro";
  loggedIn: boolean;
}

export interface OlarState {
  activeBrand: BrandProfile;
  networks: SocialNetwork[];
  operatingMode: OperatingMode;
  aiEngineMode: AiEngineMode;
  locale: Locale;
  posts: CampaignPost[];
  briefing: DailyBriefing;
  agentTasks: AgentTask[];
  activeBlade: BladeId;
  selectedNetworkId: NetworkId;
  currentDraft: CampaignPost | null;
  isLoading: boolean;
  loadingStatus: string;
  progressStep: number;
  progressPercent: number;
  progressSteps: ProgressStepDef[];
  lastAiError: string | null;
  toasts: ToastMessage[];
  briefingCollapsed: boolean;
  calendarHighlightIds: string[];
  imageLoading: boolean;
  user: UserAccount;
  mayaOpen: boolean;
  ttsEnabled: boolean;
}

export const DEFAULT_USER: UserAccount = {
  name: "",
  email: "",
  phone: "",
  plan: "pro",
  loggedIn: false,
};

export function buildProgressSteps(brandName: string): ProgressStepDef[] {
  return [
    {
      id: "dna",
      labelHe: `🧠 טוען את הגדרות ה-DNA של ${brandName}...`,
      labelEn: `🧠 Loading Brand DNA for ${brandName}...`,
    },
    {
      id: "write",
      labelHe: "✍️ מנסח קמפיין מותאם אישית ומודל שפה...",
      labelEn: "✍️ Drafting personalized campaign with language model...",
    },
    {
      id: "guard",
      labelHe: "🛡️ שומר הסף מאמת נתונים, מחירים וטון דיבור...",
      labelEn: "🛡️ Brand Guardian verifying data, prices & tone...",
    },
    {
      id: "media",
      labelHe: "🎨 מפיק מדיה ויזואלית תואמת...",
      labelEn: "🎨 Producing matching visual media...",
    },
  ];
}

export const NETWORK_META: Record<
  NetworkId,
  Pick<SocialNetwork, "name" | "nameHe" | "formats" | "defaultAspect" | "deepLink">
> = {
  instagram: {
    name: "Instagram",
    nameHe: "אינסטגרם",
    formats: ["feed", "reels", "stories"],
    defaultAspect: "1:1",
    deepLink: "https://www.instagram.com/",
  },
  facebook: {
    name: "Facebook",
    nameHe: "פייסבוק",
    formats: ["page", "reels", "group"],
    defaultAspect: "1:1",
    deepLink: "https://www.facebook.com/",
  },
  tiktok: {
    name: "TikTok",
    nameHe: "טיקטוק",
    formats: ["reels"],
    defaultAspect: "9:16",
    deepLink: "https://www.tiktok.com/upload",
  },
  youtube: {
    name: "YouTube",
    nameHe: "יוטיוב",
    formats: ["shorts", "community"],
    defaultAspect: "9:16",
    deepLink: "https://studio.youtube.com/",
  },
  x: {
    name: "X",
    nameHe: "X",
    formats: ["feed", "thread"],
    defaultAspect: "1:1",
    deepLink: "https://x.com/compose/post",
  },
  pinterest: {
    name: "Pinterest",
    nameHe: "פינטרסט",
    formats: ["pin"],
    defaultAspect: "2:3",
    deepLink: "https://www.pinterest.com/pin-builder/",
  },
  linkedin: {
    name: "LinkedIn",
    nameHe: "לינקדאין",
    formats: ["article", "carousel"],
    defaultAspect: "1:1",
    deepLink: "https://www.linkedin.com/feed/",
  },
  threads: {
    name: "Threads",
    nameHe: "ת׳רדס",
    formats: ["feed"],
    defaultAspect: "1:1",
    deepLink: "https://www.threads.net/",
  },
  google: {
    name: "Google Business",
    nameHe: "גוגל לעסק",
    formats: ["offer"],
    defaultAspect: "1:1",
    deepLink: "https://business.google.com/",
  },
  whatsapp: {
    name: "WhatsApp Business",
    nameHe: "וואטסאפ עסקי",
    formats: ["broadcast"],
    defaultAspect: "1:1",
    deepLink: "https://wa.me/",
  },
  telegram: {
    name: "Telegram",
    nameHe: "טלגרם",
    formats: ["broadcast"],
    defaultAspect: "1:1",
    deepLink: "https://t.me/",
  },
};

export const PLATFORM_BRAND: Record<
  NetworkId,
  { bg: string; color: string; label: string }
> = {
  instagram: {
    bg: "linear-gradient(135deg,#f58529,#dd2a7b,#8134af)",
    color: "#fff",
    label: "IG",
  },
  facebook: { bg: "#1877F2", color: "#fff", label: "FB" },
  tiktok: { bg: "#010101", color: "#25F4EE", label: "TT" },
  youtube: { bg: "#FF0000", color: "#fff", label: "YT" },
  x: { bg: "#000000", color: "#fff", label: "X" },
  pinterest: { bg: "#E60023", color: "#fff", label: "Pin" },
  linkedin: { bg: "#0A66C2", color: "#fff", label: "in" },
  threads: { bg: "#101010", color: "#fff", label: "Th" },
  google: { bg: "#4285F4", color: "#fff", label: "G" },
  whatsapp: { bg: "#25D366", color: "#fff", label: "WA" },
  telegram: { bg: "#229ED9", color: "#fff", label: "TG" },
};

export const DEFAULT_BRAND: BrandProfile = {
  name: "המותג שלי",
  industry: "שירותים מקומיים",
  phone: "",
  email: "",
  address: "",
  website: "",
  audience: "קהל ישראלי בגילאי 25–45 שמחפש ערך ואיכות",
  tone: "חם, מקצועי, ישיר ולא מתחכם",
  offer: "שירותים מקצועיים עם יחס אישי",
  priceList: "",
  forbiddenWords: ["הכי זול", "מבצע סופי", "חינם לגמרי"],
  logoMonogram: "א",
  borderColor: "#C96442",
  bgTone: "#F5EDE8",
};

export function createDefaultNetworks(): SocialNetwork[] {
  const ids = Object.keys(NETWORK_META) as NetworkId[];
  return ids.map((id, index) => {
    const meta = NETWORK_META[id];
    return {
      id,
      ...meta,
      connected: index < 3,
      accountType: index === 0 ? "business" : "private",
      autoPublish: false,
      defaultHashtags: [],
      stats: {
        reach: 1200 + index * 340,
        engagementRate: 2.4 + index * 0.35,
        followerGrowth: 1.1 + index * 0.2,
        topFormat: meta.formats[0],
        reelsViews: 800 + index * 520,
      },
    };
  });
}
