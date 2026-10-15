# Search and answer-focused release · 15 October 2026

**Subsequent owner clarification, 15 October 2026:** Ayubowan is an **online booking/referral platform only**; independent guides provide the in-person service. The service-area Business Profile workflow below is historical and must not be continued for this business model. Google's [eligibility rules](https://support.google.com/business/answer/13763036?hl=en) exclude online-only and lead-generation businesses. Website search indexing remains a separate process. The subsequent `ayubowan-siteeu-platform-20261015.zip` release aligns English/Spanish public copy, metadata, schema and privacy/booking/legal notices with the platform role. The owner confirmed that Ayubowan collects online payment and an independent provider delivers the experience. TouristTrip data no longer claims Ayubowan as the provider. Actual provider identity and contractual terms must be confirmed in each written offer before payment. The website still has an enquiry form and no integrated checkout or connected payment processor; none was added in this release.

The owner explicitly approved enabling indexing on 15 October 2026 after being asked about the launch checks. `publicLaunchReady` is now true. This is an owner launch decision; it does not turn remaining undocumented operational checks into independently tested facts. Starting prices remain indicative, and the three new experiences retain “Request a quote”. GA4 `G-210T1MNEKE` was already deployed and verified in the preceding release.

## Published guides

- `/barcelona-for-sri-lankans/` and `/es/barcelona-for-sri-lankans/`: visitor-focused hosting/language information, arrival planning, a suggested three-day outline, food guidance, FAQs, related experiences, enquiry CTA, sources and visible review date. Avoids unsupported population statistics, community affiliations, qualifications or consular claims.
- `/sri-lankan-restaurants-barcelona/` and `/es/sri-lankan-restaurants-barcelona/`: transparent food-search guide. Research could not establish a dedicated Sri Lankan restaurant with both a current official menu and Barcelona address. Two **Indian alternatives** are labelled by their actual advertised cuisine. Their official addresses and menus are linked; no personal visit, endorsement, partnership, certification, rating or Sri Lankan dish availability is invented.

## Primary sources reviewed

- [Aena: airport metro and terminal connections](https://www.aena.es/en/josep-tarradellas-barcelona-el-prat/getting-there/underground.html): L9 Sud, free inter-terminal shuttle. No current fares or journey-time guarantees copied.
- [TMB: T-casual](https://www.tmb.cat/en/barcelona-fares-metro-bus/t-casual): not valid at Aeroport T1/T2 metro stations. Visitors are directed to current ticket conditions.
- [Papadam official menu](https://papadam.es/menu/) and [homepage](https://papadam.es/): Indian cuisine and published Ronda de Sant Pau 11 address. An older search snippet/local directory mentioned Sri Lankan cuisine, but the current official menu describes Indian food. No Sri Lankan special is asserted. The website also has inconsistent marketing wording (“Soho”), so opening hours, prices and venue quality claims are deliberately not reproduced.
- [Saravanaa Bhavan Barcelona](https://saravanaabhavan.es/) and its [official PDF menu](https://saravanaabhavan.es/wp-content/uploads/2026/09/56437763_1.pdf): La Rambla 122; Indian vegetarian food, dosa/idli. Dietary requirements must be confirmed directly; vegetarian does not mean every dish is vegan or allergen-free.
- [Ceylon Affairs](https://gimiwick.wixsite.com/ceylonaffairs): insufficient current Barcelona address/menu information to list as a verified restaurant.
- `mount-lavinia.com` could not be accessed; third-party catering/social listings alone did not establish a current walk-in restaurant address and official menu. Not listed as a verified venue.
- [Unsplash photograph and licence](https://unsplash.com/photos/a-plate-of-rice-and-various-south-asian-dishes-_WQ1qARALg4): actual Sri Lankan rice/curry in Mirissa, credited and visibly labelled as illustrative. See `ASSETS.md`.

## Technical implementation

42 public English/Spanish pages share a single route inventory. Each has a unique title/description, final trailing-slash canonical, reciprocal EN/ES/x-default alternates, Open Graph/Twitter metadata and server-rendered content. Sitemap entries match those canonical URLs; real review dates are used only for the newly researched guides. Private studio/API routes are excluded and studio retains noindex.

JSON-LD connects Organization, WebSite and WebPage entities with stable IDs. Applicable pages add breadcrumbs, Article, TouristTrip and FAQPage data. FAQ text comes from the exact rendered answers. The organization describes an online booking/referral platform, with no LocalBusiness/TravelAgency/Restaurant type, fake reviews, offers or fabricated storefront address. Experience schema does not identify the platform as the independent tour provider. No automatic current date is added to old articles. JSON-LD escapes `<` before inclusion in HTML.

Both guides are linked from the homepage, Travel Notes and footer, and link to each other and relevant experiences. They work as static HTML without client-side JavaScript.

## Current Google guidance

- [Technical requirements](https://developers.google.com/search/docs/essentials/technical): crawl access, successful pages and indexable content are prerequisites, not a guarantee of indexing.
- [AI features and websites](https://developers.google.com/search/docs/appearance/ai-features) and [AI optimisation guide](https://developers.google.com/search/docs/fundamentals/ai-optimization-guide): normal SEO and helpful, accessible content apply. Google requires no special AI schema or `llms.txt`; these do not guarantee selection by answer engines.
- [Search documentation updates](https://developers.google.com/search/updates): FAQ rich results were retired in May 2026. FAQPage is descriptive Schema.org data here; no Google FAQ enhancement is promised.
- [Business eligibility guidelines](https://support.google.com/business/answer/13763036?hl=en): Business Profile eligibility depends on in-person customer contact; online-only and lead-generation businesses are excluded. The owner subsequently confirmed this is an online-only booking/referral platform, so profile verification is not applicable to the clarified model.
- [Ownership verification](https://support.google.com/webmasters/answer/9008080?hl=en): DNS TXT verification avoids depending on the consent-gated Analytics script.

## Validation and maintenance

Run `npm test`, `npm run build`, `npm run test:seo`, then `npm run test:hosting` after deployment. The SEO audit checks all rendered metadata, sitemap coverage, crawl controls, schema references, visible FAQ matching and internal page links. Check Search Console live URL tests for actual Googlebot access after deployment.

Review the food guide when a venue changes or a new Sri Lankan option can be verified, and at least monthly while actively promoting it. Add venue photographs only with permission or a suitable licence. Change the visible and structured review date only after actually reviewing the content. Do not publish community links, contact others or request reviews on the owner's behalf without instructions.

Search rankings, AI citations, genuine reviews and third-party community links cannot be completed by a code deployment. Monitor Search Console Performance and Page indexing after Google processes the site; retain the verification DNS record.

## Production and Google account results

Deployed `ayubowan-siteeu-seo-20261015.zip` on 15 October 2026, after saving `/domains/ayubowanbarcelona.es/public-before-seo-20261015.zip` outside the public root. Release SHA-256: `ac8310488a3511fb4d01563d1627c14c6d4a1dba2d84bc8647b9119a7ab59729`. Private data/configuration were preserved. The 19 booking/Analytics tests, production build/TypeScript, four SEO artifact audit groups, five production hosting groups across 42 pages, and owner sign-in/inbox/sign-out all passed. Desktop and 390px guide layouts/images were checked.

The Search Console Domain property `ayubowanbarcelona.es` is now DNS-verified in the owner's account. Only the supplied apex Google TXT record was added at Site.eu; the existing 11 records, including website and mail DNS, were preserved. Public DNS verification succeeded. Retain the TXT record.

Sitemap submission was accepted, but the initial report shows **Couldn't fetch / General HTTP error** with zero discovered pages. Google's homepage live test at 01:41 and traveller-guide live test at 01:48 local time report **Blocked by robots.txt**. Independent current requests over IPv4 and IPv6, including Google's crawler user agents, return HTTP 200 for robots and sitemap, robots allows `/`, and the XML parses with 42 entries. A cached pre-release robots copy is a plausible explanation, not yet confirmed: the newly added property's robots report says **No robots.txt file**, with Open report disabled. No indexing request was successfully queued. The exact recrawl/retest steps are recorded in `DEPLOYMENT.md`; do not equate submitted sitemap, crawl eligibility, indexing and ranking.

Based on the owner's initial in-person-contact answer, a Google Business Profile named **Ayubowan Barcelona**, category **Tour operator**, was created as a **service-area** business for **Barcelona, Spain**, with no public storefront address. Website, public phone `+34 611 211 754`, WhatsApp URL, description, private tours, city tours and airport welcome/arrival assistance were saved. Hours were skipped because unconfirmed; no stock image was represented as the actual business, no paid advertising/trial was activated, and unrelated profiles in the account were not edited. Google confirmed **Your business is not visible to customers** until verification. The owner has since clarified that the business is an **online booking/referral platform only**. This supersedes the earlier setup assumption: do not continue video/address verification for an ineligible online-only platform. The profile remains unverified; no profile deletion or permanent-closure action was performed. The previous request for a private verification address is no longer needed.


## Platform release verification

The 15 October platform release passed all 19 tests, build/TypeScript, 42-page SEO/schema audit, five live hosting groups and production owner access. An extra live schema/role audit covered all 42 pages. Desktop and 390px Spanish mobile disclosure/planner checks passed without a production enquiry. Release hash and rollback location are in `DEPLOYMENT.md`. Business Profile video verification was exited; the profile remains unverified/not publicly visible. The fresh homepage live crawl test at 02:08 local still reported a robots block and the sitemap still said Couldn't fetch. Google's robots report was unavailable, so a recrawl could not be requested there; no successful indexing request is claimed.

Model and disclosure sources checked on 15 October 2026: [Google Business eligibility](https://support.google.com/business/answer/13763036?hl=en), [Google Search technical requirements](https://developers.google.com/search/docs/essentials/technical), and [EU consumer shopping information](https://europa.eu/youreurope/citizens/consumers/shopping/shopping-consumer-rights/index_en.htm). These support accurate role/pre-payment information; they do not replace review of the operator's actual contractual, tax, tourism or privacy obligations.
