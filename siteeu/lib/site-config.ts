/**
 * LAUNCH REMINDER: Verify business details and workflows before promotion.
 * See LAUNCH_CHECKLIST.md. Never put API keys or admin addresses in this file.
 */
export const siteConfig = {
  name: "Ayubowan Barcelona",
  url: "https://ayubowanbarcelona.es",
  publicLaunchReady: true, // Owner approved public indexing on 15 October 2026.
  googleAnalyticsMeasurementId: process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID ?? "", // Public G- ID; see DEPLOYMENT.md. Empty disables Analytics.
  contactEmail: "hola@ayubowanbarcelona.es", // Mailbox created; send/receive testing is still required.
  contactEmailVerified: false,
  whatsappNumber: "34611211754", // Owner-supplied international digits; test the chat destination.
  hostName: "Ashan Karunathilake",
  operatorName: "TIPSTOTRIP TECHNOLOGIES S.L.",
  registrationNumber: "ESB88703806", // Owner-supplied tax identifier; confirm applicable tourism registrations separately.
  businessAddress: "Carrer De Brutau 202, Planta 1 Puerta 1, Barcelona, Spain",
  pricesAreProvisional: true,
} as const;

export type Locale = "en" | "es";
export function textFor(locale: Locale, en: string, es: string): string {
  return locale === "es" ? es : en;
}
export function localPath(path: string, locale: Locale): string {
  return locale === "es" ? `/es${path === "/" ? "" : path}` : path;
}

export function whatsappUrl(message: string): string | null {
  return /^\d{10,15}$/.test(siteConfig.whatsappNumber)
    ? `https://wa.me/${siteConfig.whatsappNumber}?text=${encodeURIComponent(message)}`
    : null;
}
