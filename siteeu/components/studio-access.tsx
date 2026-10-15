"use client";
import { useEffect, useState } from "react";
import { Studio } from "./studio";

export function StudioAccess() {
  const [state, setState] = useState<"loading"|"disabled"|"login"|"ready">("loading");
  const [csrf, setCsrf] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void fetch("/api/studio/session", {cache:"no-store"}).then(async response => {
      const data = await response.json() as {csrf?:string;authenticated?:boolean;configured?:boolean;error?:string};
      setCsrf(data.csrf || "");
      setState(data.authenticated ? "ready" : data.configured ? "login" : "disabled");
    }).catch(() => {setError("Could not connect to your studio. Please refresh."); setState("disabled");});
  }, []);
  async function signIn(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/studio/session", {method:"POST",headers:{"Content-Type":"application/json","X-CSRF-Token":csrf},body:JSON.stringify({password})});
      const data = await response.json() as {csrf?:string;authenticated?:boolean;configured?:boolean;error?:string};
      if (!response.ok) throw new Error(data.error || "Could not sign in.");
      setPassword(""); setCsrf(data.csrf || ""); setState("ready");
    } catch (failure) {setError(failure instanceof Error ? failure.message : "Could not sign in.");}
    finally {setBusy(false);}
  }
  async function signOut() {
    const response = await fetch("/api/studio/session", {method:"DELETE",headers:{"X-CSRF-Token":csrf}});
    if (response.ok) {setState("login"); window.location.reload();}
  }
  if (state === "ready") return <><div className="container" style={{paddingTop:"2rem"}}><button className="button button-outline" onClick={signOut}>Sign out</button></div><Studio csrf={csrf}/></>;
  return <section className="studio-access"><span className="eyebrow">OWNER ACCESS</span><h1>Your business studio.</h1>{state === "loading" ? <p>Connecting to your studio…</p> : state === "disabled" ? <p>Owner access is not configured yet. Set an owner password in the private hosting configuration to enable this studio. Enquiries remain protected on your Site.eu account.</p> : <form onSubmit={signIn}><label htmlFor="owner-password">Owner password</label><input id="owner-password" type="password" autoComplete="current-password" value={password} onChange={event=>setPassword(event.target.value)} required className="studio-password"/><button className="button button-dark" disabled={busy}>{busy?"Signing in…":"Sign in to your studio"}</button></form>}{error&&<p role="alert" className="form-error">{error}</p>}</section>;
}
