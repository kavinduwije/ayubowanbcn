# Ayubowan Barcelona on Site.eu

The website is deployed at **https://ayubowanbarcelona.es/** using your existing Site.eu Basic plan. The editable source for this deployment is this `siteeu/` directory. The earlier `website/` directory is the separate ChatGPT Sites version; its old DNS instructions do not apply to this deployment.

## Hosting and application

- Site.eu server: `da044.site.eu`; DirectAdmin: https://da044.site.eu:2222.
- Domain directory: `/domains/ayubowanbarcelona.es` in File Manager.
- Public files: `public_html/`. Site.eu also exposes these through the HTTPS document root.
- Application: Next.js static export, React, TypeScript, locally hosted fonts/images, English and Spanish pages, and the Sri Lankan flag palette.
- Booking backend: PHP 8.2 and PDO SQLite on Site.eu. Node.js is needed on the developer's computer to build, and does not need to run on the hosting account.
- Private records: `/domains/ayubowanbarcelona.es/ayubowan-private/enquiries.sqlite`, outside the web document root. This folder also holds the rate-limit salt, owner sessions, and optional configuration.
- Stripe hosted Checkout collects the full EUR amount of a confirmed owner-issued quote. Sending an enquiry does not confirm a booking. TIPSTOTRIP TECHNOLOGIES S.L. is the seller and pays independent providers separately.

Your existing Basic subscription covers this website hosting. This deployment does not require a ChatGPT Sites hosting subscription or a separate database service. Normal Site.eu hosting/domain renewals still apply.

## Updating the website

**Latest release — Stripe agreed booking payments, 15 October 2026:** [`ayubowan-siteeu-stripe-20261015.zip`](./ayubowan-siteeu-stripe-20261015.zip) installs English/Spanish private quote pages, owner quote management and a PHP Stripe integration. The owner confirmed that **TIPSTOTRIP TECHNOLOGIES S.L. sells each booking, receives payment and pays the independent provider**. Payments are direct charges on its Stripe account; provider payments are manual. This is not a Stripe Connect payout integration. Public estimates remain provisional and cannot be submitted as payable prices.

The live account `acct_1UQpF14rzkKoJlnm` has charges and payouts enabled. The production restricted key is stored only in `/domains/ayubowanbarcelona.es/ayubowan-private/stripe.php` with permissions `0600`; the surrounding private folder is `0700`. Existing owner/mail configuration and enquiry records were preserved. The separate credential archive is stored inside that private folder, never in `public_html`. Public ZIP SHA-256: `c8dc01fba177f1608dc97597eb32d362a5e686a770e71ec70a92119cff0a5f67`. Rollback archive: `/domains/ayubowanbarcelona.es/public-before-stripe-20261015.zip`.

The signed production webhook is `https://ayubowanbarcelona.es/api/payments/webhook`, endpoint `we_1UQr4k4rzkKoJlnmoNlyXPDV`, using Stripe API `2025-09-30.clover`. It receives Checkout completion/failure/expiry, refunds and dispute-created events. It verifies raw-body signatures and retrieves current Stripe records, handles duplicates and event reordering, and tracks pending/failed refunds separately from succeeded refunds. Disputes require operator review in Stripe; this release flags newly disputed bookings and does not automate dispute responses or resolution.

Validation: production build/TypeScript; 19 booking/Analytics tests; 12 PHP payment groups; five isolated local HTTP payment groups; four SEO groups covering all 42 public pages; desktop and 390px Spanish mobile payment/studio checks. Using `AYUBCNSTRIPTEST`, an isolated local quote completed a real Stripe sandbox Checkout after a declined-card attempt, then a EUR 50 partial refund and EUR 130.25 remaining refund. Signed Stripe notifications returned HTTP 200 and updated the quote to paid, partially refunded and fully refunded. A second unpaid sandbox Checkout was expired by the studio cancellation action. No live charge or refund was made. A clearly labelled EUR 1 live validation Checkout was created and immediately expired without payment to verify restricted-key permissions; it was never sent to a traveller. Receipt email delivery, a real customer booking, provider payouts and operator agreements remain operational checks.

Post-deployment verification passed: five production hosting groups, three payment-route/header/private-file groups, and owner sign-in/protected live quote management/sign-out. Stripe delivered the genuine unpaid validation session's expiry event `evt_1UQr5b4rzkKoJlnmyI6lT5wE` to the live webhook; its pending webhook count cleared to zero after the new routing became active. This verified live signed delivery without creating a production customer booking or moving money.

To take a booking payment:

1. Open [the owner studio](https://ayubowanbarcelona.es/studio/) and sign in with the existing owner password. Review the traveller's enquiry and confirm availability directly with the independent provider.
2. Expand **Create an agreed booking quote (live payments)**. Enter the booking title, full EUR total including applicable taxes/fees, named provider and business contact, itinerary/inclusions and price breakdown, plus your reviewed payment/cancellation/refund/no-show terms. Full payment is collected now; there is no deposit or instalment feature. Confirm the acknowledgement and create the quote.
3. Copy the private traveller link and send it to that traveller through your normal conversation. Creating a quote does not send email or WhatsApp. Keep the link private; anyone with it can view the quote's itinerary/provider details. Traveller contact details are not returned by the public quote endpoint.
4. The traveller reviews the offer, accepts its terms and selects **Pay securely with Stripe**. Stripe collects card details on its hosted page. The server uses the stored quote amount and verifies payment with Stripe; a redirect alone never confirms a booking. Paid status also marks the enquiry confirmed. Stripe receives the enquiry email for the payment receipt; issue any required tax invoice through the operator's normal process.
5. Refresh the studio to see the result. Use **View payment / manage refund in Stripe** for a full or partial refund under the agreed policy. Signed notifications update the recorded refund. Pending, failed or cancelled refunds require follow-up; monitor Stripe's notices and contact the traveller. Manage disputes in Stripe. Pay the independent provider separately under your agreement and record the payout/reconciliation outside this application.
6. To change an unpaid offer, choose **Cancel unpaid quote** first. Its open Stripe Checkout is expired before the link is disabled. Create a replacement quote with the corrected terms. An enquiry with an open quote cannot be closed until that quote is cancelled. Paid quotes cannot be edited or cancelled in place; handle the refund and any revised booking deliberately. Expired quotes must also be cancelled before replacement.

For future production deployments, run `npm test`, `npm run build`, `npm run test:seo` and `npm run test:payments` from `siteeu/` (PHP 8.2+ with cURL, mbstring and PDO SQLite is needed for the last command; set `PHP_BINARY` if necessary). Back up `public_html`, upload the generated public ZIP to the domain directory and **extract to `/domains/ayubowanbarcelona.es/`**, preserving `ayubowan-private/`. Do not upload `.env` or extract a credential archive into the public folder. Routine rebuilds need no Stripe secret because checkout is server-side. After deploying, run `npm run test:hosting`, `npm run test:payments:hosting` and `node scripts/verify-owner.mjs`. Site.eu cached the earlier API rewrite rules after this extraction; saving the verified `.htaccess` unchanged in File Manager was followed by successful new-route activation.

If rotating credentials, replace only private `stripe.php` using `php/stripe.example.php` as the template. Use the live account's key and the signing secret of the exact production webhook, never the CLI/sandbox signing secret. Preserve owner `config.php`, SQLite records and sessions. The restricted key needs Checkout Sessions create/read/expire, PaymentIntent/Charge/Refund read and the webhook-management permissions used for setup. Watch failed webhook deliveries in Stripe Workbench and retry after fixing any outage. Public payment pages are noindex/no-store/no-referrer and excluded from Analytics and the sitemap.

**Previous release — platform role and booking clarity, 15 October 2026:** [`ayubowan-siteeu-platform-20261015.zip`](./ayubowan-siteeu-platform-20261015.zip) is deployed at https://ayubowanbarcelona.es/. The owner clarified that **Ayubowan collects payment online and independent guides/providers deliver the experiences**. English/Spanish home, experience, planning, guide and footer copy now explain this model. A responsive booking explanation appears before the experience catalogue and enquiry form. Metadata and Organization data describe the online platform; TouristTrip data no longer incorrectly names Ayubowan as the tour provider. Privacy copy requires permission before sharing contact details with a proposed provider. Booking/legal notices identify payment collection and require the named provider, contracting roles, complete price and applicable terms before payment. They remain drafts pending the operator's legal review. The website enquiry form has no checkout; no payment processor was added or verified.

All 19 booking/Analytics tests, production build/TypeScript, four SEO audit groups covering all 42 public pages (including platform/schema assertions), five live hosting groups and production owner sign-in/inbox/sign-out passed. An additional live audit verified the platform explanation and corrected schema across all 42 public pages. Desktop and 390px Spanish mobile checks passed, including planner progression to contact details without submitting an enquiry. Public indexing, GA4 consent, WhatsApp and all nine experiences are preserved. The release ZIP is 5,074,580 bytes; SHA-256: `31ea6a3314a22f60c892c7d7d154be40afc93ae1ffbb4441d81c805133864dcf`.

Rollback backup: `/domains/ayubowanbarcelona.es/public-before-platform-20261015.zip`, outside `public_html`. The release archive was uploaded and extracted at `/domains/ayubowanbarcelona.es/` (trailing slash); the host confirmed successful extraction. Existing private records/configuration were preserved. Google Business video verification was exited using Verify Later; the profile is still not publicly visible and was not deleted or marked closed. Google's homepage live test at 02:08 local time still reports **Blocked by robots.txt**, while current public crawl rules allow access. Sitemap status remains **Couldn't fetch**, and the new property's robots report is unavailable. Indexing requests therefore remain pending; do not report them as completed.

**Previous release — SEO and answer-focused guides, 15 October 2026:** [`ayubowan-siteeu-seo-20261015.zip`](./ayubowan-siteeu-seo-20261015.zip) is deployed at https://ayubowanbarcelona.es/. With the owner's explicit approval, `publicLaunchReady` is now `true`: public pages allow indexing, and robots.txt permits crawling while excluding `/studio` and `/api/`. The release adds English/Spanish traveller and food guides, unique metadata and canonicals for all 42 public pages, language alternates, connected structured data, internal links and an updated sitemap. See [SEO_RESEARCH.md](./SEO_RESEARCH.md) for sources and content limitations. It preserves all nine experiences, WhatsApp, the arrival image, headline and consent-based GA4.

All 19 booking/Analytics tests, the production build with TypeScript, four SEO audit groups covering every rendered public page, all five production hosting check groups covering 42 pages, and production owner sign-in/inbox/sign-out passed. Desktop and 390px mobile guide layouts and image loading were checked. No production enquiry was submitted. The release ZIP is 5,000,018 bytes; SHA-256: `ac8310488a3511fb4d01563d1627c14c6d4a1dba2d84bc8647b9119a7ab59729`.

Rollback backup: `/domains/ayubowanbarcelona.es/public-before-seo-20261015.zip`, outside `public_html`. The dated release ZIP is also stored in that domain directory. Private records, credentials and settings were preserved. Search Console domain ownership is verified using a new DNS TXT record; existing website/mail records were preserved. Sitemap submission was accepted, but Google's first fetch reports an error and its initial live homepage test still reports a robots.txt block. Current public robots.txt and sitemap responses return HTTP 200 and the XML contains 42 valid entries. Google may still be using its previous robots copy; indexing requests remain pending until its live test passes. See the Search Console follow-up below.

**Previous release — Analytics and headline, 15 October 2026:** [`ayubowan-siteeu-analytics-20261015.zip`](./ayubowan-siteeu-analytics-20261015.zip) was deployed before the SEO release. It includes the English two-line headline “A city to explore.” / “A Host to welcome you home”, GA4 `G-210T1MNEKE`, English/Spanish consent controls, privacy copy and the PHP Content Security Policy required for Analytics. The public ID is configured in the local, Git-ignored `.env.local` and compiled into the static build. This full release includes all nine experiences, the distinct airport-arrival image and the floating WhatsApp CTA.

All 19 booking/Analytics tests, the production build with TypeScript, all five hosting check groups covering 38 public pages, and production owner sign-in/inbox/sign-out passed. Live checks verified no Google tag before a choice or after remembered rejection, tag loading after acceptance, and no Google requests after withdrawal and reload. Google's tag returned HTTP 200 and measurement requests returned HTTP 204. The owner's **Ayubowan Barcelona** GA4 Realtime report showed one test visitor, three `page_view` events and one `whatsapp_click`; no test enquiry was submitted to production. Spanish consent controls and their spacing above WhatsApp were checked at 390px width. Enhanced measurement was switched off in the matching Web stream. Property retention/processing and the operator's privacy review remain checklist items.

Rollback backup: `/domains/ayubowanbarcelona.es/public-before-analytics-20261015.zip`, outside `public_html`. The dated release ZIP is also stored in that domain directory. Private records, credentials and settings were preserved. Archive SHA-256: `9dc42bb56b2556772f8098dfc5939745aa8f9ade6e3a86d7324fa872290e595c`.

Use Node.js 22.13 or later. From this directory:

```sh
npm ci
npm test
npm run build
npm run test:seo
```

The build creates `ayubowan-siteeu.zip`, containing **only** `public_html/`. It excludes your API key, private configuration, owner password, databases, and test environment.

**Arrival-image release, 14 October 2026:** [`ayubowan-siteeu-arrival-image-20261014.zip`](./ayubowan-siteeu-arrival-image-20261014.zip) is deployed. “A familiar face on arrival” now uses a licensed photo of travellers with luggage at Barcelona–El Prat Airport, distinct from the Gothic street photo used by “A day made around you.” The arrival image is shared by the experience card, detail page and planner in English and Spanish, with cropping that keeps travellers and luggage visible on mobile. The build, TypeScript, live desktop/390px mobile checks and all five production hosting check groups passed. This full release includes all nine experiences and the WhatsApp CTA. Image credit is recorded in [ASSETS.md](./ASSETS.md). The preceding `ayubowan-siteeu-experiences-20261014.zip` remains available outside the public root for rollback; private records and settings were preserved.

**Experiences release, 14 October 2026:** [`ayubowan-siteeu-experiences-20261014.zip`](./ayubowan-siteeu-experiences-20261014.zip) was deployed. It adds Camp Nou / Barça Museum / Store (about 3 hours), the Gothic Quarter (about 3 hours), and Barcelona nightlife (about 4 hours), with licensed local images, detailed English/Spanish itineraries, homepage cards and planner choices. All three show **Request a quote / Solicitar presupuesto**. A plan containing any of them requests a quote for the whole group instead of showing a partial numeric estimate. The existing six starting prices remain unchanged. Research, official planning links and image credits are recorded in [EXPERIENCE_RESEARCH.md](./EXPERIENCE_RESEARCH.md) and [ASSETS.md](./ASSETS.md).

Build, TypeScript, 12 booking tests, nine isolated PHP workflow checks, all five production check groups covering 38 English/Spanish pages, production owner access, and desktop/mobile visual checks passed. The rollback archive is `/domains/ayubowanbarcelona.es/public-before-experiences-20261014.zip.zip` (DirectAdmin appended its own extension). Production private records and settings were preserved. The temporary QA service, its separate private database and its archive were moved outside the public root to `/domains/ayubowanbarcelona.es/experiences-deployment-recovery-20261014/` after testing. The release ZIP remains in the domain directory. Use the latest Stripe release above for repeat uploads; this archive predates the arrival image, headline, Analytics and indexing changes.

**Configuration release, 14 October 2026:** `ayubowan-siteeu-config-20261014.zip` was uploaded and extracted in the domain directory. The guide name, operator details, NIF/CIF, business address, and WhatsApp chat link were verified on the live English and Spanish pages. Build, TypeScript, 10 booking tests, all five production hosting check groups, homepage JS/CSS assets, and production owner access checks passed. The public rollback archive is `/domains/ayubowanbarcelona.es/public-before-config-20261014.zip`; private configuration and enquiry data were preserved. Email contact verification and public launch indexing remain pending.

1. Sign in to Site.eu, select the domain, open **Web hosting**, and choose **Automatic login** to DirectAdmin.
2. Open File Manager at `/domains/ayubowanbarcelona.es`.
3. Back up the current `public_html` before a release. Keep backups outside `public_html`. DirectAdmin adds the selected archive extension automatically, so omit `.zip` from its **Name** field.
4. Upload the release ZIP to the **domain directory**, and extract to `/domains/ayubowanbarcelona.es/` with the trailing slash. The archive already contains `public_html`, so extracting inside `public_html` would create the wrong nested directory. Overwrite the public release files when prompted. Uploading a ZIP alone does not update the website.
5. Preserve `ayubowan-private` and its contents. Ordinary release archives never replace business records or credentials.
6. Check the homepage, a Spanish page, a tour, and the planner. Run `npm run test:hosting` for the read-only production checks.

Site.eu says its LiteSpeed server can take up to **15 minutes** to apply `.htaccess` changes. See [Site.eu's explanation](https://site.eu/support/article/why-htaccess-changes-take-time-in-litespeed-90). During a release, avoid changing the routing file repeatedly while waiting for propagation.

On 14 October 2026, archive extraction did not apply the new rules within that window. Saving the existing domain settings unchanged and then saving the deployed `.htaccess` unchanged through File Manager was followed by successful activation. Verify the live headers and routing rather than assuming extraction has applied the server configuration.

The `.htaccess` file uses rewrite rules for canonical HTTPS redirects, booking API routing, and private-file protection. The server ignores Apache `Header`/`Require` directives in `.htaccess`, so generated HTML passes through a small PHP handler that applies security headers and serves only the build’s fixed page allowlist. Images, fonts, CSS, JavaScript, and Next.js navigation payloads remain static. Check the live result after any change.

## Deploying the floating WhatsApp CTA

**Deployed and verified, 14 October 2026:** the floating CTA is live on the production domain. The initial manual extraction created `public_html/public_html`, leaving the outer website unchanged. Extracting the same archive to `/domains/ayubowanbarcelona.es/` updated the correct files. Desktop and 390px mobile English/Spanish views, the WhatsApp destination, the five-second icon animation with a stationary tooltip/button, public CSS, all five production hosting check groups, and owner sign-in/inbox/sign-out passed. The misplaced nested folder, uploaded release ZIP, and owner's `backup.zip` were preserved outside the website in `/domains/ayubowanbarcelona.es/whatsapp-deployment-recovery-20261014/`; private application data was preserved.

The new CTA sits at the bottom-right of the English and Spanish public pages on desktop and mobile. Its tooltip says **WhatsApp**, with **Let's chat / Hablemos** beneath it. Only the logo shakes for about 0.7 seconds every five seconds, starting five seconds after loading; the tooltip, pointer, and circular touch target stay still. Reduced-motion preferences disable the animation. Mobile layout includes safe-area spacing and extra footer space so legal links remain accessible. The owner studio does not show the visitor CTA.

Local verification passed: production build, TypeScript, 10 booking tests, 32 public pages with one floating CTA each, desktop and 390px/320px mobile layouts, correct English/Spanish WhatsApp URLs, keyboard focus, and measured logo movement with a stationary tooltip and button.

1. Use the latest ready archive [`ayubowan-siteeu-stripe-20261015.zip`](./ayubowan-siteeu-stripe-20261015.zip), which includes the WhatsApp CTA, all nine experiences, the updated arrival image, revised headline, consent-based Analytics and SEO release. To rebuild a future release, run from `siteeu/`:

   ```sh
   npm test
   npm run build
   npm run test:seo
   ```

   A fresh build produces `ayubowan-siteeu.zip`. The dated Stripe ZIP is a copy of the verified build for the latest release. The production build includes TypeScript checks.

2. Sign in at **Site.eu**, open **Basic plan → Web hosting → Log in automatically**, then choose **System Info & Files → File Manager** in DirectAdmin.
3. Open `/domains/ayubowanbarcelona.es`. Select the existing `public_html` folder, choose **Archive**, and enter a fresh backup name without `.zip`. Save it in the same domain directory, outside the public document root.
4. Choose **Upload**, select `ayubowan-siteeu-platform-20261015.zip` (or your freshly built `ayubowan-siteeu.zip`), click **Start upload**, wait for **100% / uploaded successfully**, and choose **Done**.
5. Select the uploaded ZIP and choose **Extract**. Set **Extract to** `/domains/ayubowanbarcelona.es/` (include the trailing slash), select all archive contents, and confirm extraction. You can also use the folder selector to choose **domains → ayubowanbarcelona.es**, stopping before `public_html`. Overwrite existing public release files if prompted. Extract at the domain level: the ZIP already contains `public_html/`. The final homepage must be `/domains/ayubowanbarcelona.es/public_html/index.html`, with no additional `public_html` folder inside it. Uploading the ZIP alone does not deploy its contents. Preserve the existing `ayubowan-private/` folder; this public release contains no owner credentials or enquiry records.
6. Hard-refresh the homepage and a Spanish page on desktop and mobile. Confirm that the listing has nine experiences and that the three new detail pages show their images, itineraries and quote labels. Open each in the planner and combine it with an existing experience: the group total must remain **Request a quote / Solicitar presupuesto**. Check that the bottom-right CTA is visible, wait at least six seconds to see its first shake, and confirm that the label and pointer stay still. Open the CTA and confirm the WhatsApp destination is **+34 611 211 754**. Scroll to the footer and check that the legal links can still be tapped.
7. Run the post-deployment checks from `siteeu/`:

   ```sh
   npm run test:hosting
   node --experimental-strip-types scripts/verify-owner.mjs
   ```

   The owner check signs in, reads the protected inbox, and signs out. It uses the existing local `.env.owner` file. Once checks pass, mark the floating CTA deployment complete in `LAUNCH_CHECKLIST.md`.

The icon comes from [Bootstrap Icons](https://icons.getbootstrap.com/icons/whatsapp/); its MIT license is included in `public/licenses/bootstrap-icons.txt`. The deployment does not require additional npm dependencies, WhatsApp API credentials, or changes to DNS or private settings.

## Owner studio

Open https://ayubowanbarcelona.es/studio/ to review the latest 100 enquiries, change their status, and see email notification status. Older enquiries remain in the private database.

First-time owner access has been prepared in `ayubowan-owner-config.zip`, containing only `ayubowan-private/config.php` with a bcrypt password hash. The actual password is stored locally in **`.env.owner`**, with restricted file permissions, and is excluded from Git and public release archives. Keep it in your password manager. The Site.eu account password and API key are separate credentials.

**Activated and verified on 14 October 2026:** owner sign-in, protected inbox access, and sign-out passed on the production domain. The password is saved locally in `.env.owner`.

**First-time activation procedure:** extract `ayubowan-owner-config.zip` in `/domains/ayubowanbarcelona.es`, outside `public_html`. The owner must complete this credential activation. Before activation, `/studio` stays disabled and the enquiry API denies owner access. After activation, check folder permissions `0700` and configuration file permissions `0600`.

**Do not extract the owner archive during routine updates:** it could overwrite later notification settings or a changed owner password. Store only a PHP `password_hash` result in `owner_password_hash`, never the plain password. Change the private configuration to rotate owner access; sessions using an older hash lose access.

Owner login uses a Secure/HttpOnly/SameSite cookie, CSRF protection, login rate limits, and session expiry. Sign out after use on a shared computer.

## Email with Site.eu

Your Basic account includes **10 email accounts**. On 14 October 2026 the dashboard showed the owner-created **`hola@ayubowanbarcelona.es`** mailbox. It remains hidden as a website contact link until send/receive testing is complete.

1. In the Site.eu dashboard, select `ayubowanbarcelona.es` and open **Email**.
2. Use the existing `hola` mailbox. If creating additional mailboxes, choose **Create new email address** and set your own strong mailbox password.
3. Use the dashboard's webmail and mail-client settings. Create mailboxes in **Site.eu's dashboard**, rather than DirectAdmin: [Site.eu email documentation](https://site.eu/support/article/can-i-create-email-addresses-in-directadmin-23).
4. Send and receive a message with an external address. Confirm replies work before changing `contactEmailVerified` to `true` in `lib/site-config.ts` and rebuilding.

Website DNS already points to Site.eu. Preserve the existing MX, SPF, DKIM, and DMARC records: they handle email delivery. There is no need to replace these with ChatGPT hosting records.

**Booking notifications are currently unconfigured.** Enquiries are saved in SQLite independently of notification delivery. Check the studio regularly until alerts are configured. The optional Resend integration needs `resend_api_key`, `booking_email`, and a verified `email_from` in the private `config.php`; receiving mail through Site.eu and sending alerts through Resend are separate services. A mailbox alone does not enable website notifications.

## Backups and retention

Back up both the public release and the entire private application folder. Confirm which automated backups your hosting account provides and test a restore. For SQLite, use the SQLite backup API or an SQLite-aware tool; copying only `enquiries.sqlite` while writes are active may omit data in its WAL files. Keep encrypted backups outside public web storage.

Agree a retention period for traveller data and implement deletion/export using an authenticated database maintenance process. The studio's 100-row view is not a retention rule. Do not upload database snapshots, private settings, `.env` files, or credentials into the public site.

## Before promotion

Follow [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md). The owner approved enabling indexing in the 15 October SEO release. Remaining undocumented operational checks stay open; starting prices remain indicative. Confirm language availability, transport/tickets and each final quote before accepting a booking. Search Console must still process the updated crawl rules and sitemap.

## Verification and temporary files

The isolated hosting test package uses its own private database and no email service. It tests validation, server-side pricing, persisted enquiries, retries, concurrent submissions, owner sessions, CSRF, status updates, rate limiting, and logout. Production read-only checks cover English/Spanish routes, HTTPS redirects, headers, 404s, indexing controls, and private-file protection.

Never leave a QA archive, its extracted QA service directories, or the runtime probe in the public document root after testing. Keep them in recovery storage outside the website. The QA source is kept locally for future verification; it is excluded from ordinary release archives. The isolated PHP wrapper must be called directly at its `index.php?endpoint=...` URL because ordinary directory URLs pass through the static page handler.

**Verified on 14 October 2026:** all five production check groups passed, including 32 English/Spanish page requests, canonical HTTPS redirects, security headers, 404 responses, and protected files/endpoints. Production owner sign-in and sign-out also passed. The temporary QA folders, runtime probe, and QA archive were moved to Site.eu's recoverable Trash with owner approval; the public test URLs now return 404.

## WhatsApp

See [WHATSAPP_SETUP.md](./WHATSAPP_SETUP.md). Chat links use the owner-supplied number `+34 611 211 754`; confirm the destination with a real received message. The studio currently tracks website form enquiries; WhatsApp received-message totals need Meta Cloud API onboarding and a separate signed webhook integration. Button clicks alone cannot count messages received.

## Google Analytics and Google Search setup

**Live and verified on 15 October 2026:** GA4 `G-210T1MNEKE` uses the owner's Ayubowan Barcelona property (`559069100`) and Web stream (`16131241952`). Enhanced measurement is off. Consent, page views and WhatsApp clicks were verified in production and Realtime. The instructions below are retained for future configuration; a second property or tag is unnecessary. No Google tag or consent banner loads when the ID is empty or malformed.

### Create your Google Analytics property

1. Open [Google Analytics](https://analytics.google.com/) with the Google account that should own the business reports. Create an Analytics account if needed, then create a property named **Ayubowan Barcelona**, using Spain's time zone and EUR currency. Complete the business details and review Google's terms yourself.
2. Choose a **Web** data stream. Enter `https://ayubowanbarcelona.es` and the stream name **Ayubowan Barcelona website**.
3. Turn **Enhanced measurement off** for this stream. The website sends its own page views, WhatsApp clicks and successful enquiry events. Turning automatic measurement off avoids duplicate page views and automatic collection of form interactions or full outbound links. Keep Google Signals, user-provided data collection, advertising personalisation and Google Ads linking disabled for this implementation. Review the property's data retention and processing settings as part of the launch review.
4. Copy the **Measurement ID** beginning with `G-` from **Admin → Data collection and modification → Data streams → your Web stream**. It is public configuration, not a password, numeric property ID, Google API key or Tag Manager container ID. See [Google's Measurement ID instructions](https://support.google.com/analytics/answer/12270356?hl=en).
5. Send that ID to the developer, or create `siteeu/.env.local` and add the single line `NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=G-YOURREALID`. Use your actual ID, not this example. `.env.local` is excluded from Git and release archives. `.env.example` documents the setting. `lib/site-config.ts` reads this public variable. Restart a running preview after changing it; a production release must be rebuilt with it. Changing a setting on Site.eu after uploading an already-built ZIP cannot change the browser's compiled ID.

Do not paste Google's additional tag snippet into the header or add a second Tag Manager container; the implementation already loads the tag after consent. See [Google's account/property setup](https://support.google.com/analytics/answer/9304153?hl=en).

### What the integration measures

- **page_view**: one per public page visit, including English and Spanish. Query strings and fragments are excluded; external referrers contain only the origin. UTM parameters are therefore not retained by this implementation.
- **whatsapp_click**: a click on a website WhatsApp link, including the floating CTA. This is not a count of messages or confirmed bookings. Link destinations and message contents are not sent.
- **generate_lead**: emitted only after the enquiry API confirms that it saved the request. Names, email addresses, phone numbers, messages, travel details, prices and enquiry references are not event dimensions. After it first appears in Analytics, mark this event as a **key event**.

Collection requires a valid ID and an explicit **Accept analytics** choice. Before acceptance or after rejection the Google script is not loaded, following [Google's basic consent mode](https://developers.google.com/tag-platform/security/guides/consent?consentmode=basic). Accept and reject have equal visual prominence; a **Cookie settings / Ajustes de cookies** button in the footer reopens preferences. Choices expire after 180 days. Withdrawal disables collection, removes accessible `_ga` cookies, and reloads the page to unload Google's library; it does not delete historical Google data. Preference changes propagate to other open tabs of the same origin. If browser storage is blocked, a choice lasts only for that page. Advertising consent stays denied and Google Signals is disabled in the tag. The owner studio and API paths are excluded.

English/Spanish privacy copy describes this processing. The operator still needs to finish its privacy review and confirm Google's property settings and processing arrangements before promotion. Reference: [AEPD guide on cookies](https://www.aepd.es/guides/guide-on-use-of-cookies.pdf). This implementation and its tests do not certify the operator's legal compliance.

`php/page.php` permits the Analytics script and measurement endpoints in the site's Content Security Policy, using [Google's non-advertising CSP guidance](https://developers.google.com/tag-platform/security/guides/csp). This PHP change must be deployed along with the static build; uploading HTML alone leaves the old production policy blocking Analytics.

### Test and deploy Analytics

1. After adding your real ID, run `npm test` and `npm run build` from `siteeu/`. Build includes TypeScript checks. For local UI review run `npm run dev` and open the URL printed in Terminal. Localhost events use Google's debug mode; use a separate development property if you want to keep tests out of production reports.
2. In a fresh private browser session, use DevTools' Network tab to filter `googletagmanager` and `google-analytics`: there should be no Google tag or measurement requests before a choice, or after **Reject analytics**. The site and planner should remain usable. Reload and confirm rejection is remembered. Check the consent card and WhatsApp CTA at mobile width.
3. Open **Cookie settings**, accept analytics and navigate to another public page. With blockers disabled for this test, confirm `gtag/js` and measurement requests load, then check **Reports → Realtime** or **Admin → DebugView** in Analytics. A test WhatsApp click should produce `whatsapp_click`; do not treat it as a received message. Test `generate_lead` only with an agreed test enquiry or an isolated QA backend. Confirm no form values or URL queries appear in the event payloads.
4. Reopen settings and reject analytics. The page reloads, accessible Analytics cookies are removed, and no Google requests should appear on subsequent loads. Complete any unsent form before withdrawing consent. Check English/Spanish preferences and their persistence across navigation.
5. Back up production, upload the newly built `ayubowan-siteeu.zip` to `/domains/ayubowanbarcelona.es/`, and extract there with the trailing slash, preserving `ayubowan-private/`. Follow the deployment steps above. The dated arrival-image ZIP predates Analytics and the revised headline.
6. Run `npm run test:hosting`, verify the new PHP CSP and repeat the consent/Realtime checks on production. A first script request alone does not prove that Google received an event. The 15 October release passed these production checks; see the release record above.

Seven analytics tests cover consent/expiry, no loading before consent or after rejection, sanitised URLs, duplicate prevention, event fields, private-page exclusion, withdrawal/cookie removal and blocked storage. All Google requests are stubbed in these tests; no real events or production enquiries are generated. On 15 October 2026 all 19 booking/analytics tests, TypeScript and the production build passed. Local browser checks confirmed the English desktop/mobile banner, Spanish controls, remembered rejection, footer reopening, mobile spacing and no Google script before consent or after rejection. The normal preview and production build now use the owner-supplied `G-210T1MNEKE`, with no test Measurement ID. Live acceptance and withdrawal checks passed, and Google's Realtime report displayed the production test page views and WhatsApp click. The unit tests remain isolated from Google. An actual saved-enquiry event still needs verification with an agreed test or real enquiry.

### Search Console and indexing follow-up

The 15 October SEO release enables indexing on all 42 public pages. `/studio` retains noindex and the API/private files remain protected. [Google does not guarantee indexing](https://developers.google.com/search/docs/essentials/technical).

The **Domain** property `ayubowanbarcelona.es` is verified in the owner's Google account. Its apex Site.eu DNS TXT verification record must remain in place. Existing A, AAAA, MX, SPF, DKIM and DMARC records were preserved. DNS verification is independent of the consent-gated Analytics tag.

Submitted sitemap: https://ayubowanbarcelona.es/sitemap.xml. The submission confirmation was successful, but the initial report says **Couldn't fetch / General HTTP error**, with zero discovered pages. The live homepage tests at 01:41 and 02:08 local time on 15 October and traveller-guide test at 01:48 report **Blocked by robots.txt**; request indexing is disabled in those live views. Current public responses independently return HTTP 200 for both files over IPv4 and IPv6, robots allows `/`, and the sitemap parses as valid XML with all 42 canonical entries. A cached previous robots file is a possible cause, not a confirmed diagnosis. The new property's Settings → robots.txt report currently says **No robots.txt file** and its Open report button is disabled.

**15 October afternoon recheck:** the homepage's Google index view now says **URL is on Google / Page is indexed**, with the warning **Indexed, though blocked by robots.txt**. This does not confirm that Google has crawled the current content or indexed the other 41 pages. The fresh smartphone live test at **15:00:55 local time** still fails with **Blocked by robots.txt**, and its Request indexing button remains disabled. The robots report is still unavailable and the sitemap still says Couldn't fetch. A fresh Googlebot-labelled public request returned HTTP 200 and the expected crawl-allowing plain-text robots file, without an explicit Cache-Control header. This public request is not proof of access from Google's actual crawler network. No indexing request was queued during this recheck.

1. Recheck Search Console after Google refreshes its crawl data (allow roughly a day before another routine check; this is not a promised refresh deadline). In **Settings → robots.txt → Open report**, inspect Google's fetched content when that report becomes available. If it still contains the previous root `Disallow: /`, use the file's **More → Request a recrawl**. Google's [robots.txt report instructions](https://support.google.com/webmasters/answer/6062598?hl=en-EN) explain this action; it was unavailable in the new property during deployment.
2. Inspect the homepage, run **Test live URL**, and confirm crawl/index access. Only then use **Request indexing**. Repeat for the two new guide URLs and their Spanish versions, and important experience pages within Google's quota. Do not report a queued request as an indexed page.
3. Recheck Sitemaps. If the fetch error persists after crawl access passes, resubmit the same canonical sitemap URL and check the error detail. Google retries fetches; there is no need to create duplicate sitemap files or repeatedly submit during a cache delay. See [Google's sitemap report guidance](https://support.google.com/webmasters/answer/7451001?hl=en).
4. Monitor **Page indexing** and **Performance** for discovered/indexed pages, queries, impressions, clicks and landing pages. Analytics measures consenting visitors and does not control indexing.

Google [normally caches robots.txt for up to 24 hours](https://developers.google.com/crawling/docs/robots-txt/robots-txt-spec), and can keep a cached copy longer if it cannot refresh it. The crawl-allowing production file was updated around 02:04 local time on 15 October; make the next routine check on **16 October after 03:00 Europe/Madrid**, without treating that time as a guaranteed fix. Keep the current file and private-route exclusions; another identical rebuild does not invalidate Google's cache. If the live test still fails after that check, ask Site.eu to inspect access/error logs, bot/WAF rules, redirects and DNS/IPv4/IPv6 responses for Google's actual requests to `/robots.txt`, `/sitemap.xml` and `/`. Include the exact failing live-test timestamp and origin `https://ayubowanbarcelona.es`. Ask them to verify Google crawler IPs rather than trusting a user-agent string, identify the response served to Google, and correct any host-side blocking or stale response. Do not disable the entire firewall or expose private paths.

### Payment readiness follow-up

Stripe agreed-quote Checkout is connected in the latest release described above. Indexing and Google Search Console remain separate from payment readiness. The technical checkout, sandbox payment/refund flow and live configuration checks do not establish that the operator's commercial/legal obligations or provider agreements have been completed.

1. Confirm the named provider, availability, itinerary, inclusions/exclusions, full total including any tax or fee, and reviewed payment/cancellation/refund/no-show terms before creating a live quote. TIPSTOTRIP TECHNOLOGIES S.L. is the owner-confirmed seller and receipt/payment recipient; the independent provider delivers the activity and is paid manually by the seller.
2. Use enquiry → confirmed provider and written quote → traveller acceptance → Stripe hosted Checkout → verified paid booking. Never charge an indicative planning estimate or collect card details in the enquiry form or WhatsApp.
3. Check Stripe receipts and issue the required invoice through the operator's normal process. Reconcile Stripe payouts and the independent provider's payment; this app records payments/refunds but does not transfer funds to guides, calculate VAT or generate tax invoices.
4. Monitor [Stripe webhook deliveries](https://docs.stripe.com/webhooks) and Dashboard notices. Check pending/failed refunds and disputes, contact the traveller when needed and retry failed deliveries after an outage. Refund requests are made in Stripe Dashboard under the agreed terms; [refund status can change after initiation](https://docs.stripe.com/refunds).
5. Have the operator's adviser review provider/customer contracts, tax treatment, retention and refund/cancellation rules. Verify a real customer receipt, support/reply workflow, payout and provider reconciliation before marking the remaining operational checklist items complete.

### Published search content and local visibility

- [Barcelona for Sri Lankan Travellers](https://ayubowanbarcelona.es/barcelona-for-sri-lankans/) and its Spanish version cover local hosting, language availability by arrangement, airport planning, a three-day outline and relevant experiences.
- [Sri Lankan food and restaurant search guide](https://ayubowanbarcelona.es/sri-lankan-restaurants-barcelona/) and its Spanish version include official venue addresses/menu links, cited sources, a visible review date and a licensed, clearly illustrative Sri Lankan food photograph. No dedicated Sri Lankan restaurant could be verified with a current official Barcelona address/menu; the two listed alternatives are explicitly Indian. Ayubowan is described as an online booking/referral platform connecting travellers with independent providers.
- Both guides have concise answers, visible FAQs, article data and internal links from the homepage, Travel Notes and footer. Normal SEO applies to [Google's AI features](https://developers.google.com/search/docs/appearance/ai-features); no special AI file or schema can guarantee an AI citation.
- **Business-model correction, 15 October 2026:** the owner clarified that Ayubowan is an **online booking/referral platform only** and does not itself provide in-person tours/hosting. Google's [eligibility rules](https://support.google.com/business/answer/13763036?hl=en) exclude online-only businesses and lead-generation businesses. Stop Business Profile verification for this model; submitting a video does not change eligibility. Google [automatically selects verification methods](https://support.google.com/business/answer/7107242?hl=en); there is no website setting that removes its video requirement. The earlier unverified service-area profile was created based on the initial in-person-service answer. It was not deleted or marked permanently closed. The previous request for a private verification address is no longer needed for this model.
- The platform release above aligns public copy, metadata, structured data and booking/legal responsibilities with the clarified model. The owner confirmed that Ayubowan collects online payments and independent providers deliver experiences. A named provider and full written terms must be supplied for each confirmed offer; no unverified guide is listed as a confirmed supplier. The later Stripe release adds private agreed-quote Checkout while the public form continues to save enquiries without charging an estimate. Real receipt delivery, refunds/support operations, provider payments and agreements still require operator verification. Before sharing a traveller’s contact details with a proposed provider, identify that provider and obtain permission; use only minimum non-identifying trip information for initial availability discussions.
- Continue organic visibility through accurate useful content and relevant community/partner links. Add genuine, permissioned provider/activity photographs and customer feedback when available. No reviews or external outreach were fabricated or sent; Business Profile verification is not part of this online-only platform workflow.
