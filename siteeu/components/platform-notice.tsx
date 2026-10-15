import { ArrowUpRight, HeartHandshake } from "lucide-react";
import { localPath, textFor, type Locale } from "@/lib/site-config";

export function PlatformNotice({ locale }: { locale: Locale }) {
  const t = (en: string, es: string) => textFor(locale, en, es);
  return <section className="container platform-notice" aria-label={t("How booking works", "Cómo funciona la reserva")}>
    <HeartHandshake size={27} aria-hidden="true"/>
    <div><h2>{t("A personal connection. A clear way to book.", "Una conexión personal. Una reserva clara.")}</h2>
      <p>{t("Ayubowan Barcelona is an online booking and referral platform connecting travellers with independent guides and experience providers. TIPSTOTRIP TECHNOLOGIES S.L. sells your agreed booking and receives payment; your named independent provider delivers the experience.", "Ayubowan Barcelona es una plataforma online de reservas y contactos que conecta a viajeros con guías y proveedores de experiencias independientes. TIPSTOTRIP TECHNOLOGIES S.L. vende la reserva acordada y recibe el pago; el proveedor independiente identificado presta la experiencia.")}</p>
      <p>{t("Before you pay, we confirm the provider, itinerary, full price and payment and cancellation terms in writing. Sending an enquiry is free and does not confirm a booking.", "Antes de pagar, confirmamos por escrito el proveedor, la ruta, el precio total y las condiciones de pago y cancelación. Enviar una solicitud es gratuito y no confirma una reserva.")}</p>
    </div>
    <a className="text-link" href={localPath("/booking-terms", locale)}>{t("How booking works", "Cómo reservar")}<ArrowUpRight size={17}/></a>
  </section>;
}
