import assert from "node:assert/strict";
import { test } from "node:test";

// Exercise the real browser integration with a local document/storage fixture.
// No Google requests or production enquiries are created by these tests.
async function fixture(run, href = "https://ayubowanbarcelona.es/plan-your-trip/?email=private@example.com#personal") {
  const previous = { window: globalThis.window, document: globalThis.document };
  const storage = new Map();
  const scripts = [];
  const expired = [];
  const cookies = "_ga=visitor; _ga_TESTING001=session; owner_session=necessary";
  globalThis.window = { location: new URL(href), localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  } };
  globalThis.document = {
    referrer: "https://www.google.com/search?q=private+search",
    title: "Plan Your Personal Barcelona Trip | Ayubowan Barcelona",
    head: { appendChild: script => scripts.push(script) },
    createElement: () => ({ remove() { this.removed = true; } }),
    getElementById: id => scripts.find(script => script.id === id && !script.removed),
    get cookie() { return cookies; },
    set cookie(value) { expired.push(value); },
  };
  try {
    const analytics = await import(`../lib/analytics.ts?fixture=${crypto.randomUUID()}`);
    await run({ analytics, storage, scripts, expired, events: () =>
      (window.dataLayer ?? []).map(entry => Array.from(entry)) });
  } finally {
    if (previous.window === undefined) delete globalThis.window; else globalThis.window = previous.window;
    if (previous.document === undefined) delete globalThis.document; else globalThis.document = previous.document;
  }
}

test("analytics accepts GA4 IDs and requires a current explicit consent choice", async () => {
  await fixture(({ analytics: a }) => {
    assert.equal(a.validMeasurementId("G-TESTING001"), true);
    for (const invalid of ["", "UA-12345", "G-<script>", "G-short"]) assert.equal(a.validMeasurementId(invalid), false);
    for (const raw of [null, "broken", "{}", JSON.stringify({ version: 2, analytics: true, updatedAt: Date.now() }),
      JSON.stringify({ version: 1, analytics: "true", updatedAt: Date.now() }),
      JSON.stringify({ version: 1, analytics: true, updatedAt: Date.now() - a.CONSENT_MAX_AGE }),
      JSON.stringify({ version: 1, analytics: true, updatedAt: Date.now() + 10000 })]) {
      assert.equal(a.parseAnalyticsConsent(raw), null);
    }
    for (const choice of [true, false]) {
      const raw = JSON.stringify({ version: 1, analytics: choice, updatedAt: Date.now() });
      assert.equal(a.parseAnalyticsConsent(raw).analytics, choice);
    }
  });
});

test("missing, rejected, expired and invalid configuration never load Google", async () => {
  await fixture(({ analytics: a, scripts, events, storage }) => {
    a.enableAnalytics("G-TESTING001");
    a.trackAnalyticsEvent("whatsapp_click", "en");
    a.saveAnalyticsConsent(false);
    a.enableAnalytics("G-TESTING001");
    storage.set(a.ANALYTICS_CONSENT_KEY, JSON.stringify({ version: 1, analytics: true, updatedAt: 1 }));
    a.enableAnalytics("G-TESTING001");
    a.saveAnalyticsConsent(true);
    a.enableAnalytics("invalid");
    assert.equal(scripts.length, 0);
    assert.equal(events().length, 0);
  });
});

test("acceptance loads once, keeps advertising denied and sends one sanitised page view", async () => {
  await fixture(({ analytics: a, scripts, events }) => {
    a.saveAnalyticsConsent(true);
    a.enableAnalytics("G-TESTING001");
    a.enableAnalytics("G-TESTING001");
    a.trackAnalyticsPageView();
    assert.equal(scripts.length, 1);
    assert.equal(scripts[0].src, "https://www.googletagmanager.com/gtag/js?id=G-TESTING001");
    const calls = events();
    assert.deepEqual(calls.find(x => x[0] === "consent" && x[1] === "default")[2], {
      analytics_storage: "denied", ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied",
    });
    assert.deepEqual(calls.find(x => x[0] === "consent" && x[1] === "update")[2], { analytics_storage: "granted" });
    const config = calls.find(x => x[0] === "config")[2];
    assert.equal(config.send_page_view, false);
    assert.equal(config.allow_google_signals, false);
    assert.equal(config.allow_ad_personalization_signals, false);
    const views = calls.filter(x => x[0] === "event" && x[1] === "page_view");
    assert.equal(views.length, 1);
    assert.equal(views[0][2].page_location, "https://ayubowanbarcelona.es/plan-your-trip/");
    assert.equal(views[0][2].page_referrer, "https://www.google.com");
    assert.doesNotMatch(JSON.stringify(calls), /private@example|private\+search|#personal/);
  });
});

test("page changes are counted once and WhatsApp/lead events carry no enquiry data", async () => {
  await fixture(({ analytics: a, events }) => {
    a.saveAnalyticsConsent(true);
    a.enableAnalytics("G-TESTING001");
    window.location = new URL("https://ayubowanbarcelona.es/es/experiences/?name=secret");
    a.trackAnalyticsPageView(); a.trackAnalyticsPageView();
    a.trackAnalyticsEvent("whatsapp_click", "es");
    a.trackAnalyticsEvent("generate_lead", "es");
    const calls = events().filter(x => x[0] === "event");
    assert.equal(calls.filter(x => x[1] === "page_view").length, 2);
    for (const name of ["whatsapp_click", "generate_lead"]) {
      const event = calls.find(x => x[1] === name)[2];
      assert.deepEqual(Object.keys(event).sort(), ["language", "page_location", "page_referrer", "page_title", "send_to"]);
      assert.equal(event.language, "es");
      assert.doesNotMatch(JSON.stringify(event), /secret|name=|reference|email/);
    }
  });
});

test("withdrawal blocks events, disables the tag and removes only analytics cookies", async () => {
  await fixture(({ analytics: a, scripts, expired, events }) => {
    a.saveAnalyticsConsent(true); a.enableAnalytics("G-TESTING001");
    const count = events().length;
    a.saveAnalyticsConsent(false);
    a.trackAnalyticsEvent("generate_lead", "en");
    assert.equal(a.disableAnalytics(), true);
    a.trackAnalyticsPageView(); a.trackAnalyticsEvent("whatsapp_click", "en");
    assert.equal(events().length, count);
    assert.equal(window["ga-disable-G-TESTING001"], true);
    assert.equal(scripts[0].removed, true);
    assert.ok(expired.some(x => x.startsWith("_ga=")));
    assert.ok(expired.some(x => x.startsWith("_ga_TESTING001=")));
    assert.ok(expired.every(x => !x.startsWith("owner_session=")));
    assert.equal(a.readAnalyticsConsent().analytics, false);
  });
});

test("private owner/API/payment pages are never measured, including after public navigation", async () => {
  for (const path of ["/studio/", "/api/studio/inquiries", "/es/studio/", "/payment/", "/es/payment/"]) {
    await fixture(({ analytics: a, scripts, events }) => {
      a.saveAnalyticsConsent(true); a.enableAnalytics("G-TESTING001");
      a.trackAnalyticsEvent("generate_lead", "en");
      assert.equal(scripts.length, 0); assert.equal(events().length, 0);
    }, `https://ayubowanbarcelona.es${path}`);
  }
  await fixture(({ analytics: a, events }) => {
    a.saveAnalyticsConsent(true); a.enableAnalytics("G-TESTING001");
    const count = events().length;
    window.location = new URL("https://ayubowanbarcelona.es/studio/");
    a.trackAnalyticsPageView(); a.trackAnalyticsEvent("generate_lead", "en");
    assert.equal(events().length, count);
  });
});

test("blocked preference storage allows an explicit choice for this page only", async () => {
  await fixture(({ analytics: a, scripts }) => {
    window.localStorage = { getItem() { throw new Error("blocked"); }, setItem() { throw new Error("blocked"); } };
    a.enableAnalytics("G-TESTING001"); assert.equal(scripts.length, 0);
    a.saveAnalyticsConsent(true); a.enableAnalytics("G-TESTING001"); assert.equal(scripts.length, 1);
    a.refreshAnalyticsConsent(); assert.equal(a.readAnalyticsConsent(), null);
  });
});
