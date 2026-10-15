import { siteConfig } from "./site-config.ts";

export const ANALYTICS_CONSENT_KEY = "ayubowan.analytics-consent.v1";
export const CONSENT_MAX_AGE = 180 * 24 * 60 * 60 * 1000;
type Consent = { version: 1; analytics: boolean; updatedAt: number };
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    [key: `ga-disable-${string}`]: boolean | undefined;
  }
}
let memoryConsent: Consent | null = null;
let storageUnavailable = false;
let activeId = "";
let lastPage = "";

export function validMeasurementId(value: string): boolean {
  return /^G-[A-Z0-9]{6,20}$/.test(value);
}

export function parseAnalyticsConsent(raw: string | null, now = Date.now()): Consent | null {
  try {
    const value = JSON.parse(raw ?? "null");
    if (value?.version === 1 && typeof value.analytics === "boolean" &&
      typeof value.updatedAt === "number" && value.updatedAt <= now &&
      now - value.updatedAt < CONSENT_MAX_AGE) return value;
  } catch { /* Invalid preferences require a fresh choice. */ }
  return null;
}

export function readAnalyticsConsent(): Consent | null {
  if (typeof window === "undefined") return null;
  const temporary = () => parseAnalyticsConsent(JSON.stringify(memoryConsent));
  if (storageUnavailable) return temporary();
  try {
    return parseAnalyticsConsent(window.localStorage.getItem(ANALYTICS_CONSENT_KEY));
  } catch { return temporary(); }
}

export function saveAnalyticsConsent(analytics: boolean): void {
  memoryConsent = { version: 1, analytics, updatedAt: Date.now() };
  try { window.localStorage.setItem(ANALYTICS_CONSENT_KEY, JSON.stringify(memoryConsent)); storageUnavailable = false; }
  catch { storageUnavailable = true; }
}

export function refreshAnalyticsConsent(): void { memoryConsent = null; storageUnavailable = false; }

export function publicAnalyticsPath(path: string): boolean {
  return !/^\/(?:es\/)?(?:studio|api|payment)(?:\/|$)/.test(path);
}

export function analyticsPageUrl(href: string): string {
  try { const url = new URL(href); return `${url.origin}${url.pathname}`; }
  catch { return ""; }
}

function pageFields() {
  // Never send planner query strings, URL fragments, or external referrer paths.
  let referrer = "";
  try {
    const url = new URL(document.referrer);
    referrer = url.origin === window.location.origin ? analyticsPageUrl(url.href) : url.origin;
  } catch { /* Direct visit. */ }
  return { page_location: analyticsPageUrl(window.location.href), page_referrer: referrer, page_title: document.title };
}

function mayTrack(): boolean {
  return typeof window !== "undefined" && Boolean(activeId) &&
    readAnalyticsConsent()?.analytics === true && publicAnalyticsPath(window.location.pathname);
}

export function trackAnalyticsPageView(): void {
  if (!mayTrack() || lastPage === window.location.pathname) return;
  lastPage = window.location.pathname;
  const target = window;
  target.gtag?.("set", pageFields());
  target.gtag?.("event", "page_view", { ...pageFields(), send_to: activeId });
}

export function enableAnalytics(id = siteConfig.googleAnalyticsMeasurementId): void {
  if (!validMeasurementId(id) || typeof window === "undefined" ||
    readAnalyticsConsent()?.analytics !== true || !publicAnalyticsPath(window.location.pathname)) return;
  if (activeId === id) { trackAnalyticsPageView(); return; }
  const target = window;
  activeId = id;
  target[`ga-disable-${id}`] = false;
  target.dataLayer ??= [];
  target.gtag ??= function () { target.dataLayer!.push(arguments); };
  target.gtag("consent", "default", {
    analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
  });
  target.gtag("consent", "update", { analytics_storage: "granted" });
  target.gtag("js", new Date());
  target.gtag("config", id, {
    ...pageFields(), send_page_view: false, allow_google_signals: false,
    allow_ad_personalization_signals: false, cookie_expires: CONSENT_MAX_AGE / 1000,
    debug_mode: ["localhost", "127.0.0.1"].includes(window.location.hostname),
  });
  const script = document.createElement("script");
  script.id = "ayubowan-google-analytics";
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);
  trackAnalyticsPageView();
}

export function trackAnalyticsEvent(name: "whatsapp_click" | "generate_lead", locale: "en" | "es"): void {
  if (!mayTrack()) return;
  // The only event dimension is the page language. No contact, quote, or booking data.
  window.gtag?.("event", name, { ...pageFields(), send_to: activeId, language: locale });
}

export function disableAnalytics(): boolean {
  const wasActive = Boolean(activeId);
  if (typeof window === "undefined") return false;
  if (activeId) window[`ga-disable-${activeId}`] = true;
  document.getElementById("ayubowan-google-analytics")?.remove();
  activeId = "";
  lastPage = "";
  const hostParts = window.location.hostname.split(".");
  const domains = ["", ...hostParts.map((_, i) => hostParts.slice(i).join("."))];
  for (const cookie of document.cookie.split(";")) {
    const name = cookie.split("=")[0].trim();
    if (!/^_ga(?:_|$)/.test(name)) continue;
    for (const domain of domains) {
      for (const prefix of domain ? ["", "."] : [""]) {
        document.cookie = `${name}=; Max-Age=0; path=/;${domain ? ` domain=${prefix}${domain};` : ""} SameSite=Lax`;
      }
    }
  }
  return wasActive;
}
