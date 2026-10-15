import { ArrowUpRight } from "lucide-react";
import { travelGuides } from "@/lib/travel-guides";
import { localPath, textFor, type Locale } from "@/lib/site-config";

export function GuideCards({ locale }: { locale: Locale }) {
  return <section className="container section guide-discovery" aria-labelledby="guide-discovery-title">
    <div className="section-heading"><div><span className="eyebrow">{textFor(locale, "A LITTLE CLOSER TO HOME", "UN POCO MÁS CERCA DE CASA")}</span><h2 id="guide-discovery-title">{textFor(locale, "Barcelona, with a", "Barcelona, con un")} <em>{textFor(locale, "familiar welcome.", "recibimiento familiar.")}</em></h2></div><p className="heading-side">{textFor(locale, "Practical starting points for Sri Lankan travellers, visiting family and anyone looking for familiar flavours.", "Ideas prácticas para viajeros de Sri Lanka, visitas familiares y quienes buscan sabores conocidos.")}</p></div>
    <div className="guide-card-grid">{travelGuides.map(guide => <article className="guide-card" key={guide.slug}>
      <img src={guide.image} alt={guide.imageAlt[locale]} width="700" height="500" loading="lazy"/>
      <div><span className="eyebrow">{textFor(locale, "THE LOCAL GUIDE", "LA GUÍA LOCAL")}</span><h3><a href={localPath(`/${guide.slug}/`, locale)}>{guide.title[locale]}</a></h3><p>{guide.description[locale]}</p><a className="text-link" href={localPath(`/${guide.slug}/`, locale)}>{textFor(locale, "Read the guide", "Leer la guía")}<ArrowUpRight size={17}/></a></div>
    </article>)}</div>
  </section>;
}
