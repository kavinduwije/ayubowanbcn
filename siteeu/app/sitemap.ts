export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { type Locale } from "@/lib/site-config";
import { canonicalUrl, languageAlternates, publicPaths } from "@/lib/seo";
import { travelGuides, guidesReviewedAt } from "@/lib/travel-guides";
export default function sitemap():MetadataRoute.Sitemap {
  return publicPaths.flatMap((path)=>(["en","es"] as Locale[]).map((locale)=>({url:canonicalUrl(path,locale),...(travelGuides.some(guide=>path===`/${guide.slug}`)?{lastModified:guidesReviewedAt}:{}),alternates:{languages:languageAlternates(path)}})));
}
