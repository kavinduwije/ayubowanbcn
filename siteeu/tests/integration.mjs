import assert from "node:assert/strict";

const origin = process.env.TEST_BASE_URL || "http://127.0.0.1:5173";
if (!/^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin)) {
  throw new Error("This integration suite only writes to an explicitly local preview.");
}
let passed = 0;
async function check(name, run) {
  await run();
  passed++;
  console.log(`PASS ${name}`);
}
async function expectStatus(response, expected) {
  // Consume responses so the HTTP pool can safely reuse each connection.
  const body = await response.text();
  assert.equal(response.status, expected, body.slice(0, 300));
}
const data = () => ({
  name: "Website QA traveler", email: "website-qa@example.com", phone: "",
  date: "2027-12-01", guests: 2, language: "English", vehicle: "walking",
  experiences: ["barcelona-gaudi"], message: "LOCAL QA ONLY — no real booking",
  consent: true, locale: "en", website: "", requestId: crypto.randomUUID(),
});
const runNetwork = crypto.randomUUID().replaceAll("-", "").slice(0, 12).match(/.{4}/g).join(":");
const testIp = (id) => `2001:db8:${runNetwork}::${id}`;
const post = (payload, headers = {}) => fetch(`${origin}/api/inquiries`, {
  method: "POST",
  headers: { "Content-Type": "application/json", Origin: origin, "cf-connecting-ip": testIp(70), ...headers },
  body: JSON.stringify(payload),
});

await check("homepage is server-rendered with a real title and canonical URL", async () => {
  const response = await fetch(origin);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /A city to explore/);
  assert.match(html, /<title>Private Tours/);
  assert.match(html, /rel="canonical"/);
  assert.match(html, /application\/ld\+json/);
  assert.doesNotMatch(html, /codex-preview|cdn.tailwindcss/);
  assert.equal(response.headers.get("x-content-type-options"), "nosniff");
});
await check("Spanish pages have Spanish HTML language and copy", async () => {
  const response = await fetch(`${origin}/es`);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /<html lang="es"/);
});
await check("all tour, article, policy, and planner pages resolve", async () => {
  const paths = ["/experiences", "/experiences/barcelona-gaudi", "/experiences/montserrat", "/experiences/costa-brava", "/experiences/food-and-old-town", "/experiences/airport-welcome", "/experiences/shopping-and-concierge", "/travel-notes", "/travel-notes/a-gentler-barcelona", "/travel-notes/your-first-days", "/travel-notes/dining-your-way", "/privacy", "/booking-terms", "/legal", "/plan-your-trip", "/es/experiences/montserrat", "/es/plan-your-trip"];
  await Promise.all(paths.map(async (path) => expectStatus(await fetch(origin + path), 200)));
});
await check("unknown experience returns a real 404", async () => {
  await expectStatus(await fetch(`${origin}/experiences/not-a-tour`), 404);
});
await check("sitemap and launch-time robots settings are served", async () => {
  const robots = await fetch(`${origin}/robots.txt`);
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /Disallow: \//);
  const sitemap = await fetch(`${origin}/sitemap.xml`);
  assert.equal(sitemap.status, 200);
  const xml = await sitemap.text();
  assert.match(xml, /sitemap|urlset/);
  assert.match(xml, /experiences\/montserrat/);
  assert.match(xml, /\/es\/experiences/);
});
await check("public API cannot read the protected enquiries studio", async () => {
  await expectStatus(await fetch(`${origin}/api/studio/inquiries`), 403);
});
await check("cross-origin submission is rejected", async () => {
  await expectStatus(await post(data(), { Origin: "https://example.com" }), 403);
});
await check("invalid traveller data and forged prices are rejected", async () => {
  for (const payload of [{ ...data(), consent: false }, { ...data(), date: "2027-02-30" }, { ...data(), estimateEur: 1 }, { ...data(), website: "spam.example" }]) {
    await expectStatus(await post(payload), 400);
  }
});
await check("enquiry is persisted and retries return the same receipt", async () => {
  const payload = data();
  const first = await post(payload);
  assert.equal(first.status, 201);
  const receipt = await first.json();
  assert.match(receipt.reference, /^AYB-[A-F0-9]{12}$/);
  const retry = await post(payload);
  assert.equal(retry.status, 200);
  assert.equal((await retry.json()).reference, receipt.reference);
});
await check("concurrent retries save exactly one enquiry reference", async () => {
  const payload = data();
  const replies = await Promise.all([post(payload, { "cf-connecting-ip": testIp(71) }), post(payload, { "cf-connecting-ip": testIp(71) })]);
  const references = [];
  for (const response of replies) {
    assert.ok([200, 201].includes(response.status));
    references.push((await response.json()).reference);
  }
  assert.equal(new Set(references).size, 1);
});
await check("request size and request content type are bounded", async () => {
  const wrongType = await fetch(`${origin}/api/inquiries`, {
    method: "POST", headers: { Origin: origin, "Content-Type": "text/plain" }, body: "test",
  });
  await expectStatus(wrongType, 415);
  await expectStatus(await post({ ...data(), message: "x".repeat(20000) }), 400);
});
await check("abusive repeat submissions are limited", async () => {
  for (let i = 0; i < 6; i++) {
    const response = await post(data(), { "cf-connecting-ip": testIp(72) });
    if (i === 5) assert.ok(Number(response.headers.get("retry-after")) > 0);
    await expectStatus(response, i < 5 ? 201 : 429);
  }
});
console.log(`\n${passed} integration checks passed. Test enquiries remain in the local database only.`);
