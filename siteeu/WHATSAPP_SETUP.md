# WhatsApp integration for Ayubowan Barcelona

The website's chat links are configured with the owner-supplied number **`+34 611 211 754`** (14 October 2026). Confirm that a traveller's message reaches the intended business account. Cloud API message reporting is still unconfigured.

## Start with a chat link

The floating WhatsApp logo and fixed tooltip are live on the English and Spanish public pages, including mobile (verified 14 October 2026). The icon shakes every five seconds; the tooltip and touch target remain still. The deployed archive is `ayubowan-siteeu-whatsapp-20261014.zip`. Follow the **Deploying the floating WhatsApp CTA** section in [DEPLOYMENT.md](./DEPLOYMENT.md) for future releases; extract the archive at the domain level, outside `public_html`.

Set `whatsappNumber` in `lib/site-config.ts` to your verified WhatsApp number in international format, using digits only (country code included; no `+`, spaces, or punctuation). Rebuild and deploy. Existing contact and footer links will then open WhatsApp with a prefilled travel enquiry. Visitors must send the message themselves.

[Official WhatsApp click-to-chat guide](https://faq.whatsapp.com/5913398998672934).

## Count messages received in the owner studio

The current studio tracks website form enquiries only. A chat-link click does not reveal whether the visitor sent a message. Website analytics can count button clicks; actual incoming message counts require WhatsApp Business Platform / Cloud API and inbound message webhooks.

1. Prepare your Meta business portfolio, developer app, WhatsApp Business Account, and a phone number eligible for Cloud API onboarding. Confirm current Meta requirements and whether your existing Business App number supports coexistence before migrating it.
2. Add a public HTTPS webhook endpoint to the Site.eu PHP backend. Complete Meta's verification challenge and subscribe the business account/app to the `messages` webhook field.
3. Validate every POST signature using the Meta app secret, restrict events to your configured account/phone number, and save inbound messages in private SQLite storage. Keep app secrets/tokens outside `public_html`.
4. Deduplicate by WhatsApp message ID so retried notifications count once. Count inbound `messages` events separately from outbound delivery/read `statuses` events.
5. Extend the authenticated `/studio/` with received-message totals, unique contacts, daily/monthly filters, and an inbox. Replying from the studio needs the separate outbound messaging API and compliance with Meta's current reply/template rules.
6. Test with a real incoming message and a replayed webhook: the received count must increase exactly once. Define a retention policy and update the privacy notice before storing message contents.

Recommended metrics: received messages, unique contacts, new conversations, website chat-button clicks, and bookings from WhatsApp. Define how a conversation is counted (for example, a distinct sender within a calendar day). A prefilled website reference can help identify website-origin enquiries if the traveller sends it unchanged; ordinary chat links do not provide dependable source attribution for every message.

[Meta's WhatsApp webhook reference](https://www.postman.com/meta/whatsapp-business-platform/folder/tduohwq/webhook-payload-reference) describes incoming message event payloads. Use the current Cloud API documentation rather than installing the archived Meta Node.js SDK. This website can receive HTTPS webhooks in PHP on the existing Site.eu host; a separate Node.js server is unnecessary.

No WhatsApp API credentials, webhook, message store, analytics counter, or inbox integration have been configured in this release. The chat link becomes available after a real number is added; message reporting is a separate implementation and onboarding task.
