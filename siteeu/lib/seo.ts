import { experiences } from "./experiences.ts";
import { faqs, travelNotes } from "./travel-notes.ts";
import { guidesReviewedAt, travelGuides } from "./travel-guides.ts";
import { localPath, siteConfig, textFor, type Locale } from "./site-config.ts";

export const publicPaths = ["/", "/experiences", "/plan-your-trip", "/travel-notes", "/privacy", "/booking-terms", "/legal", ...experiences.map(x => `/experiences/${x.slug}`), ...travelNotes.map(x => `/travel-notes/${x.slug}`), ...travelGuides.map(x => `/${x.slug}`)];
export function canonicalUrl(path: string, locale: Locale = "en") {
  return `${siteConfig.url}${localPath(path.replace(/\/$/, "") || "/", locale).replace(/\/?$/, "/")}`;
}
export function languageAlternates(path: string) {
  return { en: canonicalUrl(path), es: canonicalUrl(path, "es"), "x-default": canonicalUrl(path) };
}

const sectionCopy: Record<string, { en: [string, string]; es: [string, string] }> = {
  "/": {
    en: ["Barcelona Experiences & Independent Sri Lankan Hosts", "Connect with independent Barcelona guides through Ayubowan. Request private experiences and Sinhala, Tamil, English or Spanish hosts, subject to availability."],
    es: ["Barcelona con anfitriones independientes de Sri Lanka", "Conecta con guías independientes en Barcelona a través de Ayubowan. Solicita experiencias privadas y anfitriones en tu idioma, según disponibilidad."],
  },
  "/experiences": {
    en: ["Private Barcelona & Catalonia Experiences", "Find your private Barcelona experience: Gaudí, the Gothic Quarter, Barça, nightlife, Montserrat, Costa Brava, airport welcomes and dining assistance."],
    es: ["Experiencias privadas en Barcelona y Cataluña", "Elige tu experiencia privada: Gaudí, Barrio Gótico, Barça, vida nocturna, Montserrat, Costa Brava, bienvenida en el aeropuerto y ayuda gastronómica."],
  },
  "/plan-your-trip": {
    en: ["Plan Your Personal Barcelona Trip", "Request a personal Barcelona itinerary. Share your dates, group, language and interests to find an independent provider, with a written quote before payment."],
    es: ["Planea tu viaje personal a Barcelona", "Solicita una ruta personal por Barcelona. Indica fechas, grupo, idioma e intereses para encontrar un proveedor independiente, con presupuesto por escrito antes de pagar."],
  },
  "/travel-notes": {
    en: ["Barcelona Travel Guides & Local Notes", "Practical Barcelona guides for Sri Lankan travellers, familiar food, first days in the city and slower local discoveries from Ayubowan Barcelona."],
    es: ["Guías y consejos locales de Barcelona", "Guías de Barcelona para viajeros de Sri Lanka, sabores familiares, primeros días en la ciudad y descubrimientos tranquilos de Ayubowan Barcelona."],
  },
  "/privacy": {
    en: ["Privacy Notice", "How Ayubowan Barcelona handles travel enquiries, personal data, optional Google Analytics, cookie choices and your privacy requests."],
    es: ["Privacidad", "Cómo Ayubowan Barcelona trata solicitudes de viaje, datos personales, Google Analytics opcional, preferencias de cookies y peticiones de privacidad."],
  },
  "/booking-terms": {
    en: ["Booking Terms", "Read how Ayubowan Barcelona enquiries, written quotes, confirmations, inclusions, payments and cancellation arrangements work before booking."],
    es: ["Condiciones de reserva", "Consulta cómo funcionan las solicitudes, presupuestos, confirmaciones, servicios, pagos y cancelaciones de Ayubowan Barcelona antes de reservar."],
  },
  "/legal": {
    en: ["Legal Notice", "Operator and contact information for Ayubowan Barcelona, an online booking and referral platform operated by TIPSTOTRIP TECHNOLOGIES S.L."],
    es: ["Aviso legal", "Información del operador y contacto de Ayubowan Barcelona, plataforma online de reservas y contactos de TIPSTOTRIP TECHNOLOGIES S.L."],
  },
};

export function pageDetails(path: string, locale: Locale) {
  const experience = experiences.find(x => path === `/experiences/${x.slug}`);
  const note = travelNotes.find(x => path === `/travel-notes/${x.slug}`);
  const guide = travelGuides.find(x => path === `/${x.slug}`);
  const [sectionTitle, sectionDescription] = sectionCopy[path]?.[locale] ?? sectionCopy["/"][locale];
  return {
    title: experience?.[locale].title ?? note?.title[locale] ?? guide?.title[locale] ?? sectionTitle,
    description: experience?.[locale].description ?? note?.description[locale] ?? guide?.description[locale] ?? sectionDescription,
    image: experience?.image ?? note?.image ?? guide?.image ?? "/images/barcelona.webp",
    imageAlt: experience?.imageAlt ?? note?.alt ?? guide?.imageAlt[locale] ?? textFor(locale, "Barcelona and Sagrada Família", "Barcelona y la Sagrada Família"),
    experience, note, guide,
  };
}

export function structuredData(path: string, locale: Locale) {
  const { title, description, image, experience, note, guide } = pageDetails(path, locale);
  const url = canonicalUrl(path, locale);
  const organizationId = `${siteConfig.url}/#organization`;
  const websiteId = `${siteConfig.url}/#website`;
  const pageId = `${url}#webpage`;
  const graph: Record<string, unknown>[] = [
    { "@type": "Organization", "@id": organizationId, name: siteConfig.name, legalName: siteConfig.operatorName, url: `${siteConfig.url}/`, description: "Online booking and referral platform connecting travellers with independent guides and experience providers in Barcelona and Catalonia. Ayubowan collects payment; independent providers deliver the experiences.", telephone: `+${siteConfig.whatsappNumber}`, areaServed: [{ "@type": "City", name: "Barcelona" }, { "@type": "AdministrativeArea", name: "Catalonia" }], contactPoint: { "@type": "ContactPoint", contactType: "Travel enquiries", telephone: `+${siteConfig.whatsappNumber}`, url: canonicalUrl("/plan-your-trip"), availableLanguage: ["English", "Spanish", "Sinhala", "Tamil"] } },
    { "@type": "WebSite", "@id": websiteId, name: siteConfig.name, url: `${siteConfig.url}/`, inLanguage: ["en", "es"], publisher: { "@id": organizationId } },
    { "@type": "WebPage", "@id": pageId, url, name: title, description, inLanguage: locale, isPartOf: { "@id": websiteId }, about: { "@id": organizationId }, primaryImageOfPage: { "@type": "ImageObject", url: `${siteConfig.url}${image}` } },
  ];
  if (path !== "/") {
    const crumbs = [{ name: textFor(locale, "Home", "Inicio"), item: canonicalUrl("/", locale) }];
    if (experience) crumbs.push({ name: textFor(locale, "Experiences", "Experiencias"), item: canonicalUrl("/experiences", locale) });
    else if (guide || note) crumbs.push({ name: textFor(locale, "Travel notes", "Notas de viaje"), item: canonicalUrl("/travel-notes", locale) });
    crumbs.push({ name: title, item: url });
    graph.push({ "@type": "BreadcrumbList", "@id": `${url}#breadcrumbs`, itemListElement: crumbs.map((crumb, i) => ({ "@type": "ListItem", position: i + 1, ...crumb })) });
    graph[2].breadcrumb = { "@id": `${url}#breadcrumbs` };
  }
  if (experience) {
    graph.push({ "@type": "TouristTrip", "@id": `${url}#experience`, name: title, description, image: `${siteConfig.url}${image}`, url, touristType: "Private groups", mainEntityOfPage: { "@id": pageId } });
    graph[2].mainEntity = { "@id": `${url}#experience` };
  }
  if (guide || note) {
    graph.push({ "@type": "Article", "@id": `${url}#article`, headline: title, description, image: `${siteConfig.url}${image}`, url, inLanguage: locale, author: { "@id": organizationId }, publisher: { "@id": organizationId }, mainEntityOfPage: { "@id": pageId }, ...(guide ? { datePublished: guidesReviewedAt, dateModified: guidesReviewedAt, citation: guide.sources.map(source => source.url) } : {}) });
    graph[2].mainEntity = { "@id": `${url}#article` };
  }
  const questions = guide?.faqs.map(faq => [faq.question[locale], faq.answer[locale]]) ?? (["/", "/experiences"].includes(path) ? faqs.map(faq => faq[locale]) : []);
  if (questions.length) {
    graph.push({ "@type": "FAQPage", "@id": `${url}#faq`, inLanguage: locale, isPartOf: { "@id": pageId }, mainEntity: questions.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })) });
    graph[2].hasPart = { "@id": `${url}#faq` };
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
