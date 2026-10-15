"use client";
import { useState } from "react";
import { experiences, type Category } from "@/lib/experiences";
import { type Locale, textFor } from "@/lib/site-config";
import { ExperienceCard } from "./experience-card";

export function ExperienceExplorer({ locale }: { locale: Locale }) {
  const [category, setCategory] = useState<Category | "all">("all");
  const filtered = experiences.filter((experience) => category === "all" || experience.category === category);
  const options: [Category | "all", string][] = [["all", textFor(locale, "All experiences", "Todas")], ["city", textFor(locale, "In the city", "En la ciudad")], ["day-trip", textFor(locale, "Beyond Barcelona", "Fuera de Barcelona")], ["concierge", "Concierge"]];
  return <><div className="filter-bar" aria-label={textFor(locale, "Filter experiences", "Filtrar experiencias")}>{options.map(([key, label]) => <button key={key} aria-pressed={category === key} className={category === key ? "filter active" : "filter"} onClick={() => setCategory(key)}>{label}</button>)}<span className="result-count" aria-live="polite">{filtered.length} {textFor(locale, "experiences", "experiencias")}</span></div><div className="experience-grid">{filtered.map((experience, index) => <ExperienceCard key={experience.slug} experience={experience} locale={locale} index={index} />)}</div></>;
}
