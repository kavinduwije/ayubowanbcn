import assert from 'node:assert/strict';
import {execFileSync,spawn} from 'node:child_process';
import {mkdtempSync,writeFileSync,rmSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
const php=process.env.PHP_BINARY||'/opt/homebrew/opt/php@8.2/bin/php';
for(const file of ['php/core.php','php/router.php','php/payments.php','php/page.php']) execFileSync(php,['-l',file],{stdio:'pipe'});
process.stdout.write(execFileSync(php,['tests/payments.php'],{encoding:'utf8'}));
const privatePath=mkdtempSync(join(tmpdir(),'ayubowan-payment-tests-'));
const hash=execFileSync(php,['-r',"echo password_hash('local-test-only',PASSWORD_DEFAULT);"],{encoding:'utf8'});
writeFileSync(join(privatePath,'config.php'),`<?php return ['owner_password_hash'=>'${hash}'];`,{mode:0o600});
writeFileSync(join(privatePath,'stripe.php'),"<?php return ['enabled'=>true,'seller'=>'TIPSTOTRIP TECHNOLOGIES S.L.','secret_key'=>'sk_test_fixture','webhook_secret'=>'whsec_fixture'];",{mode:0o600});
const port=18372;const origin=`http://127.0.0.1:${port}`;
const server=spawn(php,['-S',`127.0.0.1:${port}`,'tests/php-local-router.php'],{env:{...process.env,AYUBOWAN_TEST_PRIVATE_PATH:privatePath},stdio:['ignore','ignore','pipe']});
let logs='';server.stderr.on('data',chunk=>{logs+=chunk;});
const request=(path,method='POST',body={},extra={})=>fetch(origin+path,{method,headers:{Origin:origin,'Content-Type':'application/json',...extra},...(method==='GET'?{}:{body:JSON.stringify(body)})});
let checks=0;async function check(name,run){await run();checks++;console.log(`PASS ${name}`);}
try {
  let connected=false;
  for(let i=0;i<50;i++){try{const r=await request('/api/studio/session','GET');if(r.status===200){connected=true;break;}}catch{}await new Promise(r=>setTimeout(r,50));}
  assert.ok(connected,'Local PHP server did not start.');
  await check('unauthenticated quote management, cross-origin checkout and unsigned webhooks fail closed',async()=>{
    assert.equal((await request('/api/studio/quotes','GET')).status,403);
    assert.equal((await request('/api/payments/checkout','POST',{token:'a'.repeat(64),accepted:true},{Origin:'https://evil.invalid'})).status,403);
    assert.equal((await request('/api/payments/webhook','POST',{id:'evt_fake'})).status,400);
    assert.equal((await request('/api/payments/quote','POST',{token:'a'.repeat(64)})).status,404);
  });
  const payload={name:'Local payment test',email:'qa@example.invalid',phone:'',date:'2100-01-01',guests:2,language:'English',vehicle:'walking',experiences:['barcelona-gaudi'],message:'Isolated local test only',consent:true,locale:'en',website:'',requestId:crypto.randomUUID()};
  // The production-generated catalog is needed by the enquiry endpoint.
  let reference;
  await check('existing enquiry persistence still works with payment tables',async()=>{
    const r=await request('/api/inquiries','POST',payload);assert.equal(r.status,201);reference=(await r.json()).reference;
    assert.equal((await request('/api/inquiries','POST',payload)).status,200);
  });
  let r=await request('/api/studio/session','GET');let cookie=r.headers.get('set-cookie').split(';')[0];let csrf=(await r.json()).csrf;
  r=await request('/api/studio/session','POST',{password:'local-test-only'},{Cookie:cookie,'X-CSRF-Token':csrf});assert.equal(r.status,200);cookie=r.headers.get('set-cookie').split(';')[0];csrf=(await r.json()).csrf;
  const owner={Cookie:cookie,'X-CSRF-Token':csrf};let quoteId,token;
  const quote={inquiryId:reference,title:'Local agreed booking',providerName:'Example guide',providerContact:'guide@example.invalid',amount:'180.25',itinerary:'Three hours walking in Barcelona. Full EUR total includes applicable taxes and fees.',terms:'Synthetic terms for local testing only. Not a real offer or booking.',validDays:3,confirmed:true};
  await check('quote creation requires owner CSRF and rejects forged or incomplete fields',async()=>{
    assert.equal((await request('/api/studio/quotes','POST',quote,{Cookie:cookie})).status,403);
    assert.equal((await request('/api/studio/quotes','POST',{...quote,confirmed:false},owner)).status,400);
    assert.equal((await request('/api/studio/quotes','POST',{...quote,amount:'0.01'},owner)).status,400);
    r=await request('/api/studio/quotes','POST',quote,owner);assert.equal(r.status,201);const data=await r.json();quoteId=data.id;token=new URL(data.payment_url).hash.slice(1);assert.match(token,/^[a-f0-9]{64}$/);
    assert.equal((await request('/api/studio/quotes','POST',quote,owner)).status,409);
    assert.equal((await request('/api/studio/inquiries','PATCH',{id:reference,status:'closed'},owner)).status,409);
  });
  await check('private quote reads expose agreed details without traveller email or card fields; checkout requires acceptance',async()=>{
    r=await request('/api/payments/quote','POST',{token});assert.equal(r.status,200);const body=await r.json();assert.equal(body.quote.amount_cents,18025);assert.equal(body.quote.provider_name,'Example guide');assert.doesNotMatch(JSON.stringify(body),/qa@example|sk_test|whsec|request_id/);
    assert.equal((await request('/api/payments/checkout','POST',{token,accepted:false})).status,400);
    assert.equal((await request('/api/payments/checkout','POST',{token,accepted:true,amount:1})).status,400);
  });
  await check('owner can revoke an unstarted quote and its private link becomes non-payable',async()=>{
    assert.equal((await request('/api/studio/quotes','DELETE',{id:quoteId},owner)).status,200);
    const body=await (await request('/api/payments/quote','POST',{token})).json();assert.equal(body.quote.status,'cancelled');
    assert.equal((await request('/api/payments/checkout','POST',{token,accepted:true})).status,409);
    assert.equal((await request('/api/studio/session','DELETE',{},owner)).status,200);
    assert.equal((await request('/api/studio/quotes','GET',{},owner)).status,403);
  });
  console.log(`${checks} local HTTP payment groups passed. No Stripe network call or real enquiry was made.`);
} finally {server.kill();rmSync(privatePath,{recursive:true,force:true});}
