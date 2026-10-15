"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, ArrowUpRight, CheckCircle2, CreditCard, LoaderCircle, LockKeyhole, MessageCircle, RefreshCw } from "lucide-react";
import { Brand } from "./brand";
import { localPath, siteConfig, textFor, type Locale } from "@/lib/site-config";

type Quote = {id:string;inquiry_id:string;title:string;provider_name:string;provider_contact:string;itinerary:string;terms:string;amount_cents:number;currency:string;status:string;expires_at:number;travel_date:string;guests:number;paid_at:string|null;refunded_cents:number;refund_pending_cents:number;refund_problem:number;seller:string;paymentsReady:boolean;expired:boolean};
export function PaymentPage({locale}:{locale:Locale}) {
  const t=(en:string,es:string)=>textFor(locale,en,es);
  const [token,setToken]=useState("");
  const [quote,setQuote]=useState<Quote|null>(null);
  const [loading,setLoading]=useState(true);
  const [busy,setBusy]=useState(false);
  const [accepted,setAccepted]=useState(false);
  const [error,setError]=useState("");
  const load=useCallback(async(value:string)=>{
    setLoading(true);setError("");
    try {
      if(!/^[a-f0-9]{64}$/.test(value)) throw new Error(locale==="es"?"Abre el enlace privado completo que te envió Ayubowan.":"Open the complete private quote link sent to you by Ayubowan.");
      const response=await fetch("/api/payments/quote",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token:value}),cache:"no-store"});
      const data=await response.json();
      if(!response.ok) throw new Error(locale==="es"?"No podemos consultar el presupuesto. Revisa el enlace o contacta con Ayubowan.":data.error||"We could not load your quote. Please try again.");
      setQuote(data.quote);
    }catch(failure){setError(failure instanceof Error?failure.message:"Please try again.");}
    finally{setLoading(false);}
  },[locale]);
  useEffect(()=>{
    const value=window.location.hash.slice(1);setToken(value);void load(value);
    // The private token stays in the fragment, outside request URLs/referrer logs.
  },[load]);
  async function pay(event:React.FormEvent) {
    event.preventDefault();setBusy(true);setError("");
    try {
      const response=await fetch("/api/payments/checkout",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({token,accepted})});
      const data=await response.json();
      if(!response.ok) throw new Error(locale==="es"?"No se ha iniciado el pago. Actualiza el presupuesto o contacta con Ayubowan.":data.error||"We could not open checkout. Please try again.");
      if(data.paid){await load(token);return;}
      const url=new URL(data.url);
      if(url.protocol!=="https:"||url.hostname!=="checkout.stripe.com") throw new Error("Invalid checkout destination.");
      window.location.assign(url.href);
    }catch(failure){setError(failure instanceof Error?failure.message:"Please try again.");}
    finally{setBusy(false);}
  }
  const money=(value:number)=>new Intl.NumberFormat(locale==="es"?"es-ES":"en-IE",{style:"currency",currency:"EUR"}).format(value/100);
  const paid=quote&&["paid","partially_refunded","refunded","disputed"].includes(quote.status);
  const payable=quote?.status==="open"&&!quote.expired&&quote.paymentsReady;
  return <main className="payment-page">
    <header className="studio-header"><a href={localPath("/",locale)} aria-label="Ayubowan Barcelona"><Brand/></a><a href={`${locale==="en"?"/es/payment/":"/payment/"}#${token}`} hrefLang={locale==="en"?"es":"en"}>{locale==="en"?"Español":"English"}</a></header>
    <div className="payment-intro"><span className="eyebrow"><LockKeyhole size={15}/>{t("YOUR PRIVATE BOOKING QUOTE","TU PRESUPUESTO PRIVADO")}</span><h1>{paid?t("Your Barcelona plans.","Tus planes en Barcelona."):t("One step closer", "Un paso más cerca")}<br/><em>{paid?t("All in one place.","Todo en un lugar."):t("to your Barcelona.","de tu Barcelona.")}</em></h1><p>{t("A clear itinerary. A familiar welcome. Review your agreed booking before continuing to secure payment.","Una ruta clara y una cálida bienvenida. Revisa tu reserva antes de continuar al pago seguro.")}</p></div>
    {loading?<p className="loading-state" role="status"><LoaderCircle className="spinner" size={20}/>{t("Checking your quote and payment…","Consultando el presupuesto y el pago…")}</p>:quote?<div className="payment-grid">
      <article className="payment-details"><span className="eyebrow">{quote.id}</span><h2>{quote.title}</h2><div className="lead-meta"><span>{quote.travel_date}</span><span>{quote.guests} {t("travellers","viajeros")}</span></div>
        <section><h3>{t("Your booking with us","Tu reserva con nosotros")}</h3><p>{t("Seller and payment recipient:","Vendedor y receptor del pago:")} <strong>{quote.seller}</strong> ({siteConfig.name}).</p><p>{t("Your experience is delivered by:","La experiencia la presta:")} <strong>{quote.provider_name}</strong></p><p>{quote.provider_contact}</p></section>
        <section><h3>{t("Your itinerary & inclusions","Ruta y servicios incluidos")}</h3><p className="quote-written">{quote.itinerary}</p></section>
        <section><h3>{t("Your booking & cancellation terms","Condiciones de reserva y cancelación")}</h3><p className="quote-written">{quote.terms}</p></section>
        <p className="small-note">{t("Keep this private link and a copy of your quote. Enquiry reference:","Conserva este enlace privado y una copia del presupuesto. Referencia:")} {quote.inquiry_id}. <a href={localPath("/booking-terms",locale)} target="_blank" rel="noreferrer">{t("General booking terms","Condiciones generales")}</a></p>
      </article>
      <aside className="payment-summary"><span className="eyebrow">{t("YOUR AGREED TOTAL","TU PRECIO TOTAL ACORDADO")}</span><strong className="payment-total">{money(quote.amount_cents)}</strong><p>{t("Full booking price in EUR, including the taxes and fees stated in your quote.","Precio total en EUR, incluidos los impuestos y cargos indicados en el presupuesto.")}</p>
        {paid?<div className="payment-status" role="status"><CheckCircle2 size={28}/><h2>{quote.status==="refunded"?t("Payment refunded","Pago reembolsado"):quote.status==="partially_refunded"?t("Partial refund recorded","Reembolso parcial registrado"):quote.status==="disputed"?t("Payment under review","Pago en revisión"):t("Payment received","Pago recibido")}</h2><p>{quote.status==="paid"?t("Your agreed booking is confirmed. Keep your quote reference and Stripe receipt; contact us for any arrangements or changes.","Tu reserva acordada está confirmada. Conserva la referencia y el recibo de Stripe; contacta para cualquier detalle o cambio."):t("Contact Ayubowan for the current booking arrangements. Refunds may take time to appear with your bank.","Contacta con Ayubowan sobre el estado de la reserva. El reembolso puede tardar en aparecer en tu banco.")}</p>{quote.refunded_cents>0&&<p>{t("Refund recorded:","Reembolso registrado:")} {money(quote.refunded_cents)}</p>}</div>:quote.status==="cancelled"||quote.expired?<div className="payment-status"><h2>{t("Let’s refresh your plans.","Actualicemos tus planes.")}</h2><p>{t("This quote has expired or was cancelled. Ask Ayubowan for an updated quote before paying.","El presupuesto ha caducado o se ha cancelado. Pide uno actualizado antes de pagar.")}</p></div>:<form onSubmit={pay}><p className="small-note">{t("Quote valid until","Presupuesto válido hasta")} {new Date(quote.expires_at*1000).toLocaleString(locale==="es"?"es-ES":"en-GB",{timeZone:"Europe/Madrid"})} ({t("Barcelona time","hora de Barcelona")}).</p><label className="consent"><input type="checkbox" required checked={accepted} onChange={event=>setAccepted(event.target.checked)}/><span>{t("I accept this itinerary, provider, full price and the booking, cancellation and refund terms shown here. I understand that this payment confirms my booking with TIPSTOTRIP TECHNOLOGIES S.L.","Acepto la ruta, el proveedor, el precio total y las condiciones de reserva, cancelación y reembolso aquí indicadas. Entiendo que el pago confirma mi reserva con TIPSTOTRIP TECHNOLOGIES S.L.")}</span></label><button className="button button-dark" disabled={!payable||!accepted||busy}>{busy?<LoaderCircle className="spinner" size={18}/>:<CreditCard size={19}/>} {busy?t("Opening secure checkout…","Abriendo el pago seguro…"):t("Pay securely with Stripe","Pagar de forma segura con Stripe")}<ArrowUpRight size={17}/></button>{!quote.paymentsReady&&<p role="status">{t("Online payment is temporarily unavailable. Contact Ayubowan before paying.","El pago online no está disponible temporalmente. Contacta con Ayubowan.")}</p>}<p className="small-note"><LockKeyhole size={13}/>{t("Card details are entered on Stripe’s secure page.","Los datos de tarjeta se introducen en la página segura de Stripe.")} <a href={localPath("/privacy",locale)} target="_blank" rel="noreferrer">{t("Privacy","Privacidad")}</a></p></form>}
        {quote.refund_pending_cents>0&&<p role="status">{t("Refund processing:","Reembolso en trámite:")} {money(quote.refund_pending_cents)}. {t("Contact Ayubowan for the booking status and timing.","Contacta con Ayubowan sobre la reserva y los plazos.")}</p>}
        {quote.refund_problem>0&&<p role="status">{t("A refund needs attention. Please contact Ayubowan; a failed or cancelled refund has not been counted as money returned.","Un reembolso requiere atención. Contacta con Ayubowan; un reembolso fallido o cancelado no se cuenta como dinero devuelto.")}</p>}
        <div className="payment-help"><a className="text-link" href={`https://wa.me/${siteConfig.whatsappNumber}`} target="_blank" rel="noreferrer"><MessageCircle size={17}/>{t("Ask us about your booking","Consulta sobre tu reserva")}</a><button className="text-link" onClick={()=>void load(token)} disabled={loading||busy}><RefreshCw size={15}/>{t("Refresh payment status","Actualizar estado del pago")}</button></div>
      </aside>
    </div>:null}
    {error&&<div className="payment-error"><p className="form-error" role="alert">{error}</p><button className="button button-outline" onClick={()=>void load(token)} disabled={loading}>{t("Try again","Volver a intentar")}</button></div>}
    <footer className="payment-footer"><a href={localPath("/",locale)}><ArrowLeft size={14}/>{t("Back to Ayubowan Barcelona","Volver a Ayubowan Barcelona")}</a><span>{siteConfig.operatorName} · {siteConfig.registrationNumber}</span></footer>
  </main>;
}
