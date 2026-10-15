import { ArrowUpRight, Clock3, Users } from "lucide-react";
import type { Experience } from "@/lib/experiences";
import { type Locale, localPath, textFor } from "@/lib/site-config";
export function ExperienceCard({ experience, locale, index = 0 }: { experience: Experience; locale: Locale; index?: number }) {
  const copy = experience[locale];
  return <article className="experience-card">
    <a className="card-image" href={localPath(`/experiences/${experience.slug}`, locale)} tabIndex={-1} aria-hidden="true"><img src={experience.image} alt={experience.imageAlt} width="720" height="540" loading="lazy" /><span className="image-tag">{copy.eyebrow}</span><span className="card-number">0{index + 1}</span></a>
    <div className="card-details"><div className="card-meta"><span><Clock3 size={13} />{experience.hours} {textFor(locale, experience.hours === 1 ? "hour" : "hours", experience.hours === 1 ? "hora" : "horas")}</span><span><Users size={13} />{textFor(locale, "Just your group", "Solo tu grupo")}</span></div><h3><a href={localPath(`/experiences/${experience.slug}`, locale)}>{copy.title}</a></h3><p>{copy.description}</p><div className="card-bottom"><span className={experience.price === null ? "card-quote" : undefined}>{experience.price === null ? <strong>{textFor(locale, "Request a quote", "Solicitar presupuesto")}</strong> : <>{textFor(locale, "Estimate from", "Estimación desde")} <strong>€{experience.price}</strong></>}<small>{textFor(locale, " / private group", " / grupo privado")}</small></span><a className="circle-link" href={localPath(`/experiences/${experience.slug}`, locale)} aria-label={`${textFor(locale, "Explore", "Descubre")} ${copy.title}`}><ArrowUpRight size={20} /></a></div></div>
  </article>;
}
