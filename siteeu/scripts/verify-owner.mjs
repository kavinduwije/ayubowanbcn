import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const origin='https://ayubowanbarcelona.es';
const settings=await readFile(new URL('../.env.owner',import.meta.url),'utf8');
const password=settings.split('\n').find(line=>line.startsWith('OWNER_STUDIO_PASSWORD='))?.slice('OWNER_STUDIO_PASSWORD='.length).trim();
assert.ok(password,'Missing local owner password');
let cookie,csrf;
const session=await fetch(`${origin}/api/studio/session`);
assert.equal(session.status,200);
const state=await session.json();assert.equal(state.configured,true);
cookie=session.headers.get('set-cookie').split(';')[0];csrf=state.csrf;
const login=await fetch(`${origin}/api/studio/session`,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json',Cookie:cookie,'X-CSRF-Token':csrf},body:JSON.stringify({password})});
assert.equal(login.status,200,'Owner login failed');
cookie=login.headers.get('set-cookie').split(';')[0];csrf=(await login.json()).csrf;
try {
  const inbox=await fetch(`${origin}/api/studio/inquiries`,{headers:{Cookie:cookie}});
  assert.equal(inbox.status,200);assert.ok(Array.isArray((await inbox.json()).inquiries));
  console.log('PASS production owner configuration, sign-in, and protected inbox access');
  const quoteResponse=await fetch(`${origin}/api/studio/quotes`,{headers:{Cookie:cookie}});
  assert.equal(quoteResponse.status,200);const quotes=await quoteResponse.json();
  assert.ok(Array.isArray(quotes.quotes));assert.equal(quotes.paymentsReady,true);assert.equal(quotes.mode,'live');
  assert.doesNotMatch(JSON.stringify(quotes),/(?:sk|rk)_(?:test|live)_|whsec_/);
  console.log('PASS protected quote management, live Stripe configuration and no exposed credentials');
} finally {
  const logout=await fetch(`${origin}/api/studio/session`,{method:'DELETE',headers:{Origin:origin,Cookie:cookie,'X-CSRF-Token':csrf}});
  assert.equal(logout.status,200);
  assert.equal((await fetch(`${origin}/api/studio/inquiries`,{headers:{Cookie:cookie}})).status,403);
  console.log('PASS sign-out removes owner access');
}
