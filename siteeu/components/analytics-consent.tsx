"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { localPath, type Locale, siteConfig, textFor } from "@/lib/site-config";
import {
  ANALYTICS_CONSENT_KEY, disableAnalytics, enableAnalytics, readAnalyticsConsent,
  refreshAnalyticsConsent, saveAnalyticsConsent, trackAnalyticsEvent, validMeasurementId,
} from "@/lib/analytics";

export function AnalyticsConsent({ locale }: { locale: Locale }) {
  const id = siteConfig.googleAnalyticsMeasurementId;
  const configured = validMeasurementId(id);
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [choice, setChoice] = useState<boolean | null>(null);
  const t = (en: string, es: string) => textFor(locale, en, es);

  useEffect(() => {
    if (!configured) return;
    const saved = readAnalyticsConsent();
    setChoice(saved?.analytics ?? null);
    setOpen(saved === null);
    if (saved?.analytics) enableAnalytics(id);
    else disableAnalytics();
  }, [configured, id, pathname]);

  useEffect(() => {
    if (!configured) return;
    const clicks = (event: MouseEvent) => {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (link && new URL(link.href, window.location.origin).hostname === "wa.me") {
        trackAnalyticsEvent("whatsapp_click", locale);
      }
    };
    const changedInAnotherTab = (event: StorageEvent) => {
      if (event.key !== ANALYTICS_CONSENT_KEY && event.key !== null) return;
      refreshAnalyticsConsent();
      const saved = readAnalyticsConsent();
      setChoice(saved?.analytics ?? null);
      setOpen(saved === null);
      if (saved?.analytics) enableAnalytics(id);
      else if (disableAnalytics()) window.location.reload();
    };
    document.addEventListener("click", clicks);
    window.addEventListener("storage", changedInAnotherTab);
    return () => {
      document.removeEventListener("click", clicks);
      window.removeEventListener("storage", changedInAnotherTab);
    };
  }, [configured, id, locale]);

  function choose(analytics: boolean) {
    saveAnalyticsConsent(analytics);
    setChoice(analytics);
    setOpen(false);
    if (analytics) enableAnalytics(id);
    // Reload after withdrawal to unload Google's already-running library.
    else if (disableAnalytics()) window.location.reload();
  }

  if (!configured) return null;
  return <>
    <button type="button" className="cookie-settings-button" aria-expanded={open} aria-controls="analytics-consent" onClick={() => setOpen(!open)}>
      {t("Cookie settings", "Ajustes de cookies")}
    </button>
    {open && <section id="analytics-consent" className="cookie-consent" aria-labelledby="analytics-consent-title" role="region">
      <span className="eyebrow">{t("A LITTLE CHOICE, ALWAYS YOURS", "UNA ELECCIÓN SIEMPRE TUYA")}</span>
      <h2 id="analytics-consent-title">{t("Your privacy. Your choice.", "Tu privacidad. Tu elección.")}</h2>
      <p>{t("With your permission, we use Google Analytics cookies to understand visits and improve your experience. You can decline and still use every feature. Change your choice anytime in Cookie settings.", "Con tu permiso, usamos cookies de Google Analytics para conocer las visitas y mejorar tu experiencia. Puedes rechazarlas y usar todas las funciones. Cambia tu elección cuando quieras en Ajustes de cookies.")}</p>
      <a className="cookie-privacy-link" href={localPath("/privacy", locale)}>{t("Read our privacy notice", "Lee nuestra política de privacidad")}</a>
      {choice !== null && <p className="cookie-choice-status">{choice ? t("Your current choice: analytics allowed.", "Tu elección actual: analítica permitida.") : t("Your current choice: analytics declined.", "Tu elección actual: analítica rechazada.")}</p>}
      {choice === true && <p className="cookie-choice-status">{t("Rejecting analytics will reload this page. Finish any unsent enquiry first.", "Rechazar la analítica recargará esta página. Termina antes cualquier solicitud sin enviar.")}</p>}
      <div className="cookie-consent-actions">
        <button type="button" onClick={() => choose(false)}>{t("Reject analytics", "Rechazar analítica")}</button>
        <button type="button" onClick={() => choose(true)}>{t("Accept analytics", "Aceptar analítica")}</button>
      </div>
    </section>}
  </>;
}
