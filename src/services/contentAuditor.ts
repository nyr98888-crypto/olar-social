import type { BrandProfile, CampaignPost } from "@/types/olar";

export interface AuditIssue {
  severity: "error" | "warning" | "info";
  code: string;
  messageHe: string;
  messageEn: string;
}

export interface AuditResult {
  score: number;
  issues: AuditIssue[];
  passed: boolean;
  priceHallucination: boolean;
  hebrewNatural: boolean;
  forbiddenHits: string[];
}

const HEBREW_RATIO_MIN = 0.35;

function extractPrices(text: string): string[] {
  const matches = text.match(/(?:₪\s?\d[\d,.]*)|(?:\d[\d,.]*\s?₪)|(?:\d+\s?שקל)/g);
  return matches ?? [];
}

function extractBrandPrices(brand: BrandProfile): string[] {
  const raw = `${brand.priceList} ${brand.offer}`;
  return extractPrices(raw);
}

function hebrewCharRatio(text: string): number {
  const letters = text.replace(/\s+/g, "");
  if (!letters.length) return 1;
  const hebrew = (letters.match(/[\u0590-\u05FF]/g) || []).join("").length;
  return hebrew / letters.length;
}

function looksNaturalHebrew(text: string): boolean {
  if (!text.trim()) return true;
  const ratio = hebrewCharRatio(text);
  if (ratio < HEBREW_RATIO_MIN) return true; // English content ok
  const awkward = [
    /מאוד מאוד מאוד/,
    /best best/,
    /לחץ כאן עכשיו!!!+/,
    /קנה עכשיו!!!+/,
  ];
  return !awkward.some((re) => re.test(text));
}

export function auditContent(
  text: string,
  brand: BrandProfile,
  options?: { allowEmptyPrices?: boolean }
): AuditResult {
  const issues: AuditIssue[] = [];
  const forbiddenHits = brand.forbiddenWords
    .filter((w) => w.trim())
    .filter((w) => text.toLowerCase().includes(w.toLowerCase()));

  if (forbiddenHits.length) {
    issues.push({
      severity: "error",
      code: "forbidden_words",
      messageHe: `מילים אסורות: ${forbiddenHits.join(", ")}`,
      messageEn: `Forbidden words: ${forbiddenHits.join(", ")}`,
    });
  }

  const foundPrices = extractPrices(text);
  const brandPrices = extractBrandPrices(brand);
  let priceHallucination = false;

  if (foundPrices.length && brandPrices.length) {
    const normalizedBrand = brandPrices.map((p) => p.replace(/\s/g, ""));
    for (const price of foundPrices) {
      const normalized = price.replace(/\s/g, "");
      if (!normalizedBrand.some((bp) => bp.includes(normalized.replace("₪", "")) || normalized.includes(bp.replace("₪", "")))) {
        // Allow if any numeric overlap with brand list digits
        const digits = normalized.replace(/[^\d]/g, "");
        const brandHas = brandPrices.some((bp) => bp.replace(/[^\d]/g, "") === digits);
        if (!brandHas) {
          priceHallucination = true;
        }
      }
    }
  } else if (foundPrices.length && !brandPrices.length && !options?.allowEmptyPrices) {
    priceHallucination = true;
  }

  if (priceHallucination) {
    issues.push({
      severity: "error",
      code: "price_hallucination",
      messageHe: "זוהו מחירים שלא מופיעים ב-DNA המותג",
      messageEn: "Prices found that are not in Brand DNA",
    });
  }

  const hebrewNatural = looksNaturalHebrew(text);
  if (!hebrewNatural) {
    issues.push({
      severity: "warning",
      code: "hebrew_naturalness",
      messageHe: "העברית נשמעת מאולצת או רועשת מדי",
      messageEn: "Hebrew sounds forced or overly noisy",
    });
  }

  if (text.length < 20) {
    issues.push({
      severity: "warning",
      code: "too_short",
      messageHe: "התוכן קצר מדי לפרסום איכותי",
      messageEn: "Content is too short for quality publishing",
    });
  }

  if (!brand.name.trim()) {
    issues.push({
      severity: "info",
      code: "missing_brand",
      messageHe: "שם מותג ריק — מומלץ לעדכן DNA",
      messageEn: "Empty brand name — update DNA",
    });
  }

  let score = 100;
  for (const issue of issues) {
    if (issue.severity === "error") score -= 25;
    else if (issue.severity === "warning") score -= 12;
    else score -= 4;
  }
  score = Math.max(0, Math.min(100, score));

  return {
    score,
    issues,
    passed: score >= 70 && !priceHallucination && forbiddenHits.length === 0,
    priceHallucination,
    hebrewNatural,
    forbiddenHits,
  };
}

export function auditPost(post: CampaignPost, brand: BrandProfile): AuditResult {
  const combined = [
    post.headline,
    post.body,
    post.hook ?? "",
    post.script ?? "",
    post.pinTitle ?? "",
    post.hashtags.join(" "),
  ].join("\n");
  return auditContent(combined, brand);
}
