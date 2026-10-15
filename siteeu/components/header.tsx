"use client";
import { useEffect, useRef, useState } from "react";
import { ArrowUpRight, Globe2, Menu, X } from "lucide-react";
import { Brand } from "./brand";
import { type Locale, localPath, textFor } from "@/lib/site-config";

export function Header({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setOpen(false); button.current?.focus(); }
    };
    const onPointer = (event: PointerEvent) => {
      if (!panel.current?.contains(event.target as Node) && !button.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("pointerdown", onPointer); };
  }, [open]);
  const switchLocale = () => {
    const url = new URL(window.location.href);
    url.pathname = locale === "es" ? url.pathname.replace(/^\/es(?=\/|$)/, "") || "/" : `/es${url.pathname === "/" ? "" : url.pathname}`;
    window.location.assign(url.toString());
  };
  const nav = [
    ["/experiences", textFor(locale, "Our experiences", "Experiencias")],
    ["/#our-story", textFor(locale, "The Ayubowan way", "Nuestra esencia")],
    ["/travel-notes", textFor(locale, "Travel notes", "Notas de viaje")],
  ];
  return <header className="site-header">
    <a className="brand-link" href={localPath("/", locale)} aria-label="Ayubowan Barcelona home"><Brand /></a>
    <nav className="desktop-nav" aria-label={textFor(locale, "Main navigation", "Navegación principal")}>{nav.map(([href, label]) => <a key={href} href={localPath(href, locale)}>{label}</a>)}</nav>
    <div className="header-actions"><button className="language-button" onClick={switchLocale} aria-label={locale === "en" ? "Cambiar a español" : "Switch to English"}><Globe2 size={16} /><span>{locale === "en" ? "EN" : "ES"}</span></button>
      <a className="button button-dark header-cta" href={localPath("/plan-your-trip", locale)}>{textFor(locale, "Let’s plan your trip", "Planea tu viaje")}<ArrowUpRight size={17} /></a>
      <button ref={button} className="menu-toggle" aria-expanded={open} aria-controls="mobile-navigation" aria-label={textFor(locale, open ? "Close navigation" : "Open navigation", open ? "Cerrar menú" : "Abrir menú")} onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</button>
    </div>
    {open && <div ref={panel} id="mobile-navigation" className="mobile-nav"><nav aria-label={textFor(locale, "Mobile navigation", "Navegación móvil")}>{nav.map(([href, label]) => <a key={href} href={localPath(href, locale)} onClick={() => setOpen(false)}>{label}<ArrowUpRight size={18} /></a>)}<a href={localPath("/plan-your-trip", locale)} className="button button-dark">{textFor(locale, "Let’s plan your trip", "Planea tu viaje")}<ArrowUpRight size={18} /></a></nav></div>}
  </header>;
}
