import assert from 'node:assert/strict';
import { estimatePlan } from '../lib/booking.ts';
import { experiences } from '../lib/experiences.ts';
import { publicPaths, canonicalUrl } from '../lib/seo.ts';
import { siteConfig } from '../lib/site-config.ts';
const origin='https://ayubowanbarcelona.es';
const qa=process.env.AYUBOWAN_QA_URL;
let passed=0;
async function check(name,fn) {await fn();console.log(`PASS ${name}`);passed++;}
const api=(endpoint)=>qa ? `${qa}?endpoint=${encodeURIComponent(endpoint)}` : `${origin}/api/${endpoint}`;
const data=()=>({name:'QA Test Traveler',email:'qa-test@example.invalid',phone:'',date:'2100-01-01',guests:2,language:'Sinhala',vehicle:'walking',experiences:['barcelona-gaudi'],message:'Synthetic hosting verification, not a real booking.',consent:true,locale:'en',website:'',requestId:crypto.randomUUID()});
const post=(payload,headers={},method='POST',endpoint='inquiries')=>fetch(api(endpoint),{method,headers:{Origin:origin,'Content-Type':'application/json',...headers},body:JSON.stringify(payload)});
if (!process.argv.includes('--qa-only')) {
await check('homepage has pre-rendered content, the real domain, and security headers',async()=>{
 const r=await fetch(origin);assert.equal(r.status,200);const html=await r.text();
 assert.match(html,/<html lang="en"/);assert.match(html,/A city to explore/);assert.match(html,/rel="canonical" href="https:\/\/ayubowanbarcelona.es\//);
 assert.doesNotMatch(html,/chatgpt.site|SITEDOTEU|Cloudflare provides/);assert.equal(r.headers.get('x-content-type-options'),'nosniff');
 assert.match(r.headers.get('content-security-policy'),/frame-ancestors 'none'/);
});
await check('English and Spanish tour, article, policy, and planner routes work',async()=>{
 await Promise.all(publicPaths.flatMap(path=>['en','es'].map(async locale=>{const url=canonicalUrl(path,locale);const r=await fetch(url);assert.equal(r.status,200,url);const html=await r.text();assert.match(html,locale==='es'?/<html lang="es"/:/<html lang="en"/);assert.ok(html.includes(`<link rel="canonical" href="${url}"`),url);const robots=html.match(/<meta name="robots" content="([^"]*)"/)?.[1];assert.ok(robots,url);assert.equal(robots.includes('noindex'),!siteConfig.publicLaunchReady,url);}))); 
});
await check('unknown tours return 404; robots and sitemap use the real domain',async()=>{
 assert.equal((await fetch(origin+'/experiences/not-a-tour/')).status,404);
 const robots=await (await fetch(origin+'/robots.txt')).text();assert.equal(/^Disallow: \/$/m.test(robots),!siteConfig.publicLaunchReady);assert.match(robots,/Disallow: \/studio/);
 const xml=await (await fetch(origin+'/sitemap.xml')).text();assert.match(xml,/ayubowanbarcelona.es/);assert.doesNotMatch(xml,/chatgpt.site/);
});
await check('HTTP and www redirect to the canonical HTTPS domain',async()=>{
 for(const url of ['http://ayubowanbarcelona.es/','https://www.ayubowanbarcelona.es/']) {const r=await fetch(url,{redirect:'manual'});assert.ok([301,308].includes(r.status));assert.equal(r.headers.get('location'),'https://ayubowanbarcelona.es/');}
});
await check('private files, provider credentials, and owner enquiries are inaccessible',async()=>{
 assert.equal((await fetch(origin+'/api/studio/inquiries')).status,403);
 for(const path of ['/.env','/ayubowan-private/enquiries.sqlite','/api/router.php','/ayubowan-private/rate-salt']) {const r=await fetch(origin+path);assert.ok([403,404].includes(r.status),path);}
});
}
if (!qa) {console.log(`${passed} read-only production checks passed. Write tests require an isolated QA URL.`);process.exit(0);}
await check('cross-origin, missing origin, and unsupported content types are rejected',async()=>{
 assert.equal((await post(data(),{Origin:'https://example.com'})).status,403);
 assert.equal((await fetch(api('inquiries'),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data())})).status,403);
 assert.equal((await post(data(),{'Content-Type':'text/plain'})).status,415);
});
await check('invalid details, dates, capacity, duplicate tours, forged prices, and spam are rejected',async()=>{
 const changes=[{consent:false},{date:'2100-02-30'},{date:'2000-01-01'},{guests:2.5},{vehicle:'sedan',guests:4},{vehicle:'van',guests:8},{experiences:['unknown']},{experiences:['barcelona-gaudi','barcelona-gaudi']},{estimateEur:1},{website:'spam.invalid'},{message:'x'.repeat(20000)},{email:'invalid'}];
 for(const change of changes) assert.equal((await post({...data(),...change})).status,400,JSON.stringify(Object.keys(change)));
});
let reference,receiptPayload;
let quoteReference;
await check('quote-only and mixed selections are saved without a numeric price',async()=>{
 const payload={...data(),experiences:['camp-nou-barca','gothic-quarter','barcelona-nightlife','barcelona-gaudi']};
 const response=await post(payload);assert.equal(response.status,201);quoteReference=(await response.json()).reference;
});
await check('an enquiry is persisted and a retry returns the same reference',async()=>{
 receiptPayload={...data(),guests:4,vehicle:'van',experiences:['barcelona-gaudi','montserrat']};
 const first=await post(receiptPayload);assert.equal(first.status,201);reference=(await first.json()).reference;assert.match(reference,/^AYB-[A-F0-9]{12}$/);
 const retry=await post(receiptPayload);assert.equal(retry.status,200);assert.equal((await retry.json()).reference,reference);
});
await check('concurrent retries resolve to a single saved enquiry',async()=>{
 const payload=data();const replies=await Promise.all([post(payload),post(payload)]);const refs=[];
 for(const r of replies) {assert.ok([200,201].includes(r.status));refs.push((await r.json()).reference);}assert.equal(new Set(refs).size,1);
});
let cookie,csrf;
await check('owner sessions reject bad CSRF, sign in, and expose only authenticated leads',async()=>{
 const session=await fetch(api('studio/session'));const details=await session.json();assert.equal(details.configured,true);csrf=details.csrf;cookie=session.headers.get('set-cookie').split(';')[0];
 assert.equal((await post({password:'temporary-qa-only-password'},{Cookie:cookie,'X-CSRF-Token':'wrong'},'POST','studio/session')).status,403);
 const login=await post({password:'temporary-qa-only-password'},{Cookie:cookie,'X-CSRF-Token':csrf},'POST','studio/session');assert.equal(login.status,200);
 cookie=login.headers.get('set-cookie').split(';')[0];csrf=(await login.json()).csrf;
 const r=await fetch(api('studio/inquiries'),{headers:{Cookie:cookie}});assert.equal(r.status,200);
 const leads=(await r.json()).inquiries;
 const lead=leads.find(x=>x.id===reference);assert.ok(lead);assert.equal(lead.estimate_eur,estimatePlan(receiptPayload).total);assert.equal(lead.notification_status,'not_configured');
 const quote=leads.find(x=>x.id===quoteReference);assert.ok(quote);assert.equal(quote.estimate_eur,-1);
});
await check('owner updates require CSRF and persist the new status',async()=>{
 assert.equal((await post({id:reference,status:'contacted'},{Cookie:cookie},'PATCH','studio/inquiries')).status,403);
 const r=await post({id:reference,status:'contacted'},{Cookie:cookie,'X-CSRF-Token':csrf},'PATCH','studio/inquiries');assert.equal(r.status,200);
 const leads=await (await fetch(api('studio/inquiries'),{headers:{Cookie:cookie}})).json();assert.equal(leads.inquiries.find(x=>x.id===reference).status,'contacted');
});
await check('abusive requests are limited without trusting spoofed IP headers',async()=>{
 let blocked=false;for(let i=0;i<7;i++){const r=await post(data(),{'X-Forwarded-For':`203.0.113.${i+1}`,'CF-Connecting-IP':`203.0.113.${i+1}`});if(r.status===429){assert.ok(Number(r.headers.get('retry-after'))>0);blocked=true;break;}assert.equal(r.status,201);}assert.equal(blocked,true);
});
await check('sign out invalidates owner access',async()=>{
 const r=await fetch(api('studio/session'),{method:'DELETE',headers:{Origin:origin,Cookie:cookie,'X-CSRF-Token':csrf}});assert.equal(r.status,200);
 assert.equal((await fetch(api('studio/inquiries'),{headers:{Cookie:cookie}})).status,403);
});
console.log(`${passed} hosting checks passed. Synthetic enquiries were saved only in isolated QA storage.`);
