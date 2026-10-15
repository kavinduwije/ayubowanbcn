import type { Metadata, Viewport } from "next";
import { siteConfig } from "@/lib/site-config";
import "@/app/globals.css";

export const viewport: Viewport = { themeColor: "#8d153a" };

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: "Ayubowan Barcelona | Experiences & Independent Local Hosts", template: "%s | Ayubowan Barcelona" },
  description: "Connect with independent Barcelona guides and experience providers through Ayubowan. Request Sinhala, Tamil, English or Spanish hosts, subject to availability.",
  robots: { index: siteConfig.publicLaunchReady, follow: siteConfig.publicLaunchReady, ...(siteConfig.publicLaunchReady ? { googleBot: { index: true, follow: true, "max-image-preview": "large" as const } } : {}) },
  openGraph: { type: "website", siteName: siteConfig.name, images: [{ url: "/images/barcelona.webp", width: 2000, height: 1333, alt: "Barcelona and Sagrada Família" }] },
  twitter: { card: "summary_large_image" },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default async function RootLayout({
  children, locale = "en",
}: Readonly<{
  children: React.ReactNode;
  locale?: "en" | "es";
}>) {
  return (
    <html lang={locale}>
      <head><link rel="preload" href="/fonts/dm-sans.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/><link rel="preload" href="/fonts/instrument-serif.woff2" as="font" type="font/woff2" crossOrigin="anonymous"/></head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
