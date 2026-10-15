import assert from 'node:assert/strict';
const origin='https://ayubowanbarcelona.es';
for(const path of ['/payment/','/es/payment/']){
  const r=await fetch(origin+path);assert.equal(r.status,200,path);
  assert.match(r.headers.get('x-robots-tag')||'',/noindex/);
  assert.match(r.headers.get('cache-control')||'',/no-store/);
  assert.equal(r.headers.get('referrer-policy'),'no-referrer');
  const html=await r.text();assert.match(html,/presupuesto|booking quote/);
  assert.doesNotMatch(html,/(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}/);
}
console.log('PASS English/Spanish private payment pages, noindex, no-store and no-referrer');
const post=(path,body,requestOrigin=origin)=>fetch(origin+path,{method:'POST',headers:{Origin:requestOrigin,'Content-Type':'application/json'},body:JSON.stringify(body)});
assert.equal((await fetch(origin+'/api/studio/quotes')).status,403);
assert.equal((await fetch(origin+'/api/payments/quote')).status,405);
assert.equal((await post('/api/payments/quote',{token:'0'.repeat(64)})).status,404);
assert.equal((await post('/api/payments/checkout',{token:'0'.repeat(64),accepted:true},'https://example.invalid')).status,403);
assert.equal((await post('/api/payments/webhook',{id:'evt_unsigned'})).status,400);
console.log('PASS deployed payment routes, owner authorization, origin checks and webhook signature rejection');
for(const path of ['/ayubowan-private/stripe.php','/ayubowan-private/ayubowan-stripe-private-20261015.zip','/api/payments.php','/api/core.php']){
  const r=await fetch(origin+path);assert.ok([403,404].includes(r.status),path);
  assert.doesNotMatch(await r.text(),/(?:sk|rk)_(?:live|test)_[A-Za-z0-9]{20,}|whsec_[A-Za-z0-9]{20,}|<\?php/);
}
console.log('PASS private Stripe configuration and PHP helper files are inaccessible');
console.log('No production enquiry, quote, charge or refund was created by these checks.');
