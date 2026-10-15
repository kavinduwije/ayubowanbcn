import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { publicPaths, canonicalUrl } from '../lib/seo.ts';
import { siteConfig } from '../lib/site-config.ts';

const origin = siteConfig.url;
const locales = ['en', 'es'];
const pages = [];
const decode = text => text.replaceAll('&amp;', '&').replaceAll('&quot;', '"').replaceAll('&#x27;', "'").replaceAll('&#39;', "'").replaceAll('&lt;', '<').replaceAll('&gt;', '>');
for (const path of publicPaths) for (const locale of locales) {
  const url = canonicalUrl(path, locale);
  const html = await readFile(`out${new URL(url).pathname}index.html`, 'utf8');
  pages.push({ path, locale, url, html });
}
const titles = new Set(), descriptions = new Set();
for (const { url, locale, html } of pages) {
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const description = html.match(/<meta name="description" content="([^"]*)"/ )?.[1];
  assert.ok(title && description, `Missing title or description: ${url}`);
  assert.ok(!titles.has(title), `Duplicate title: ${url}`); titles.add(title);
  assert.ok(!descriptions.has(description), `Duplicate description: ${url}`); descriptions.add(description);
  assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, `One H1 required: ${url}`);
  assert.ok(html.includes(`<html lang="${locale}"`), url);
  assert.ok(html.includes(`<link rel="canonical" href="${url}"`), `Canonical must match final URL: ${url}`);
  for (const language of locales) assert.ok(html.includes(`hrefLang="${language}" href="${canonicalUrl(pages.find(p => p.url === url).path, language)}"`), `Missing reciprocal hreflang: ${url}`);
  const robots = html.match(/<meta name="robots" content="([^"]+)"/)?.[1];
  assert.ok(robots, url);
  assert.equal(robots.includes('noindex'), !siteConfig.publicLaunchReady, `Unexpected indexing state: ${url}`);
}
console.log(`PASS ${pages.length} rendered pages: unique metadata, one H1, locale, final canonicals, hreflang and indexing`);

for (const { url, html } of pages) {
  const schemas = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
  assert.equal(schemas.length, 1, url);
  const graph = schemas[0]['@graph'];
  const organization = graph?.find(node => node['@type'] === 'Organization');
  assert.ok(organization, url);
  assert.match(organization.description, /online booking and referral platform/i);
  assert.ok(!graph.some(node => ['LocalBusiness', 'TravelAgency', 'Restaurant'].includes(node['@type'])), `Online platform must not claim a local storefront: ${url}`);
  for (const trip of graph.filter(node => node['@type'] === 'TouristTrip')) {
    assert.equal(trip.provider, undefined, `Do not name the platform as a tour provider before an independent provider is confirmed: ${url}`);
  }
  assert.ok(graph.some(node => node['@type'] === 'WebPage' && node.url === url), url);
  const ids = new Set(graph.map(node => node['@id']));
  const checkReferences = value => {
    if (!value || typeof value !== 'object') return;
    if (value['@id']) assert.ok(ids.has(value['@id']), `Dangling entity reference ${value['@id']}`);
    for (const child of Object.values(value)) if (typeof child === 'object') checkReferences(child);
  };
  checkReferences(graph);
  assert.doesNotMatch(JSON.stringify(graph), /"(?:aggregateRating|review|offers)":|"@type":"Restaurant"/);
  const visible = decode(html.replace(/<script\b[^>]*>.*?<\/script>/gs, '').replace(/<[^>]+>/g, ''));
  for (const faq of graph.filter(node => node['@type'] === 'FAQPage')) for (const question of faq.mainEntity) {
    assert.ok(visible.includes(question.name), `FAQ question not in rendered content: ${url}`);
    assert.ok(visible.includes(question.acceptedAnswer.text), `FAQ answer not in rendered content: ${url}`);
  }
}
console.log('PASS structured data parses, entity references resolve and FAQs match rendered content');

const sitemap = await readFile('out/sitemap.xml', 'utf8');
const sitemapUrls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => decode(match[1]));
assert.deepEqual(sitemapUrls.sort(), pages.map(page => page.url).sort());
assert.doesNotMatch(sitemap, /\/studio|\/api\/|chatgpt\.site/);
const robots = await readFile('out/robots.txt', 'utf8');
assert.equal(/^Disallow: \/$/m.test(robots), !siteConfig.publicLaunchReady);
assert.match(robots, /Disallow: \/studio/);
assert.match(await readFile('out/studio/index.html', 'utf8'), /name="robots" content="noindex, nofollow"/);
console.log('PASS complete canonical sitemap, crawl rules and private studio noindex');

for (const { url, html } of pages) {
  for (const [, href] of html.matchAll(/<a\b[^>]*href="(\/[^"#?]*)[^" ]*"/g)) {
    if (href.startsWith('/api/') || /\.[a-z0-9]+$/i.test(href)) continue;
    const path = decode(href).replace(/\/?$/, '/');
    await access(`out${path}index.html`).catch(() => assert.fail(`Broken internal link ${href} on ${url}`));
  }
}
console.log('PASS all rendered internal page links resolve in the static export');
console.log('SEO export audit passed. Google indexing and rankings are assessed separately in Search Console.');
