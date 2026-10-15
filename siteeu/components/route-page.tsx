import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { HomePage, ExperiencesPage, ExperiencePage, PlanPage, NotesPage, NotePage, LegalPage } from "@/components/site-pages";
import { findExperience } from "@/lib/experiences";
import { travelNotes } from "@/lib/travel-notes";
import { type Locale } from "@/lib/site-config";
import { GuidePage } from "./guide-page";
import { travelGuides } from "@/lib/travel-guides";
import { publicPaths, canonicalUrl, languageAlternates, pageDetails, structuredData } from "@/lib/seo";
type Props = { params: Promise<{segments?:string[]}>; };

export const dynamicParams = false;
export function generateStaticParams() {
 const paths = publicPaths.map(path => path.split("/").filter(Boolean));
 return paths.flatMap(parts=>[{segments:parts},{segments:["es",...parts]}]);
}

function resolve(segments:string[] = []) { const locale:Locale=segments[0]==="es"?"es":"en";const parts=locale==="es"?segments.slice(1):segments;return {locale,parts,path:`/${parts.join("/")}`}; }
export async function generateMetadata({params}:Props):Promise<Metadata> {
  const {locale,path}=resolve((await params).segments);
  if (!publicPaths.includes(path)) notFound();
  const {title,description,image,imageAlt,guide,note}=pageDetails(path,locale);
  const canonical=canonicalUrl(path,locale);
  return {title,description,alternates:{canonical,languages:languageAlternates(path)},openGraph:{title,description,url:canonical,type:guide||note?"article":"website",locale:locale==="es"?"es_ES":"en_GB",alternateLocale:locale==="es"?["en_GB"]:["es_ES"],images:[{url:image,alt:imageAlt}]},twitter:{card:"summary_large_image",title,description,images:[image]}};
}
export default async function SitePage({params}:Props) {
  const {locale,parts,path}=resolve((await params).segments);
  let page:React.ReactNode;
  if(parts.length===0)page=<HomePage locale={locale}/>;
  else if(path==="/experiences")page=<ExperiencesPage locale={locale}/>;
  else if(parts[0]==="experiences"&&parts.length===2){const experience=findExperience(parts[1]);if(!experience)notFound();page=<ExperiencePage experience={experience} locale={locale}/>;}
  else if(path==="/plan-your-trip")page=<PlanPage locale={locale} defaults={{}}/>;
  else if(path==="/travel-notes")page=<NotesPage locale={locale}/>;
  else if(parts[0]==="travel-notes"&&parts.length===2){const note=travelNotes.find((item)=>item.slug===parts[1]);if(!note)notFound();page=<NotePage note={note} locale={locale}/>;}
  else if(path==="/privacy"||path==="/booking-terms"||path==="/legal")page=<LegalPage type={path.slice(1) as "privacy"|"booking-terms"|"legal"} locale={locale}/>;
  else {const guide=travelGuides.find(item=>path===`/${item.slug}`);if(!guide)notFound();page=<GuidePage guide={guide} locale={locale}/>;}
  return <>{page}<script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify(structuredData(path,locale)).replaceAll("<","\\u003c")}}/></>;
}
