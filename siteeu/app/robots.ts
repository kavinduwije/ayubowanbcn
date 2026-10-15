export const dynamic = "force-static";
import type { MetadataRoute } from "next";
import { siteConfig } from "@/lib/site-config";
export default function robots():MetadataRoute.Robots {return {rules:siteConfig.publicLaunchReady?{userAgent:"*",allow:"/",disallow:["/studio","/api/"]}:{userAgent:"*",disallow:"/"},sitemap:`${siteConfig.url}/sitemap.xml`};}
