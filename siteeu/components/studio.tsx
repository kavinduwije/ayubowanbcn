"use client";
import { useCallback, useEffect, useState } from "react";
import { ArrowUpRight, LoaderCircle, RefreshCw } from "lucide-react";
import { QuoteManager, type PaymentQuote } from "./quote-manager";
type Lead = {id:string;name:string;email:string;phone:string;travel_date:string;guests:number;language:string;vehicle:string;experiences:string;message:string;estimate_eur:number;status:string;notification_status:string;created_at:string};
export function Studio({csrf}:{csrf:string}) {
  const [leads,setLeads]=useState<Lead[]>([]);const [quotes,setQuotes]=useState<PaymentQuote[]>([]);
  const [ready,setReady]=useState(false);const [mode,setMode]=useState("test");
  const [loading,setLoading]=useState(true);const [error,setError]=useState("");const [saving,setSaving]=useState<string|null>(null);
  const refreshQuotes=useCallback(async()=>{
    const response=await fetch("/api/studio/quotes",{cache:"no-store"});
    if(!response.ok)throw new Error("Could not load payment quotes. Please refresh.");
    const data=await response.json();setQuotes(data.quotes);setReady(data.paymentsReady);setMode(data.mode);
  },[]);
  const refresh=useCallback(async()=>{
    setLoading(true);setError("");try{
      const [response]=await Promise.all([fetch("/api/studio/inquiries",{cache:"no-store"}),refreshQuotes()]);
      if(!response.ok)throw new Error("Could not load enquiries.");
      const data=await response.json();setLeads(data.inquiries);
    }catch(failure){setError(failure instanceof Error?failure.message:"Could not load enquiries.");}finally{setLoading(false);}
  },[refreshQuotes]);
  useEffect(()=>{void refresh();},[refresh]);
  async function update(id:string,status:string){
    setSaving(id);setError("");try{
      const response=await fetch("/api/studio/inquiries",{method:"PATCH",headers:{"Content-Type":"application/json","X-CSRF-Token":csrf},body:JSON.stringify({id,status})});
      if(!response.ok)throw new Error("Could not update this enquiry.");
      setLeads(current=>current.map(item=>item.id===id?{...item,status}:item));
    }catch(failure){setError(failure instanceof Error?failure.message:"Could not update this enquiry.");}finally{setSaving(null);}
  }
  return <section className="studio"><div className="section-heading"><div><span className="eyebrow">BUSINESS STUDIO</span><h1>Your traveler enquiries.</h1><p>Latest 100 requests. Agree the itinerary, provider and price, then issue a private payment quote.</p></div><button className="button button-outline" onClick={()=>void refresh()} disabled={loading}><RefreshCw size={16}/>Refresh</button></div>{error&&<p role="alert" className="form-error">{error}</p>}{loading?<p className="loading-state"><LoaderCircle className="spinner" size={20}/>Loading enquiries…</p>:leads.length===0?<div className="empty-state"><h2>Good journeys begin with a hello.</h2><p>Your saved traveler enquiries will appear here.</p></div>:<div className="lead-list">{leads.map(lead=><article key={lead.id} className="lead-card"><div className="lead-header"><div><span className="eyebrow">{lead.id}</span><h2>{lead.name}</h2></div><label>Status<select value={lead.status} disabled={saving===lead.id} onChange={event=>void update(lead.id,event.target.value)}>{["new","contacted","confirmed","closed"].map(status=><option value={status} key={status}>{status}</option>)}</select></label></div><div className="lead-meta"><span>{lead.travel_date}</span><span>{lead.guests} travelers</span><span>{lead.language}</span><span>{lead.vehicle}</span><span>{lead.estimate_eur<0?"Request a quote":`€${lead.estimate_eur} estimate`}</span></div><p>{JSON.parse(lead.experiences).join(" · ")}</p>{lead.message&&<p className="lead-message">{lead.message}</p>}<div className="lead-contact"><a href={`mailto:${lead.email}`}>{lead.email}<ArrowUpRight size={15}/></a>{lead.phone&&<span>{lead.phone}</span>}<small>Email notification: {lead.notification_status.replaceAll("_"," ")} · {new Date(lead.created_at).toLocaleString()}</small></div><QuoteManager inquiryId={lead.id} csrf={csrf} quotes={quotes.filter(q=>q.inquiry_id===lead.id)} ready={ready&&lead.status!=="closed"} mode={mode} onChange={refreshQuotes}/></article>)}</div>}</section>;
}
