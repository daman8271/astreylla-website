# Shopify App Store Guidelines (Scraped Notes)

Date compiled: 2026-04-29 (Asia/Kolkata)

This file is a consolidated, developer-facing checklist of Shopify App Store requirements and review expectations, compiled from official Shopify documentation. Shopify can change requirements at any time; treat these as “current best-known requirements” and re-check the canonical sources before submission.

## Canonical Sources (Official)

- App Store requirements: https://shopify.dev/docs/apps/launch/shopify-app-store/app-store-requirements
- Best practices (incl. performance): https://shopify.dev/docs/apps/launch/shopify-app-store/best-practices
- Review process: https://shopify.dev/apps/launch/app-store-review/review-process
- Submit app for review: https://shopify.dev/apps/launch/app-store-review/submit-app-for-review
- Pass app review (common failure reasons): https://shopify.dev/apps/launch/app-store-review/pass-app-review
- Privacy law compliance (overview): https://shopify.dev/docs/apps/build/compliance/privacy-law-compliance
- GDPR / mandatory compliance webhooks: https://shopify.dev/apps/store/security/gdpr-webhooks
- Webhook delivery (HTTPS + retries + timeouts): https://shopify.dev/docs/apps/build/webhooks/subscribe/https
- Protected customer data: https://shopify.dev/docs/apps/launch/protected-customer-data
- Privacy requirements (privacy policy expectations): https://shopify.dev/apps/launch/privacy-requirements
- Billing overview: https://shopify.dev/docs/apps/launch/billing
- Managed pricing: https://shopify.dev/docs/apps/launch/billing/managed-pricing
- Session tokens: https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens
- Session tokens (setup/verification): https://shopify.dev/docs/apps/build/authentication-authorization/session-tokens/set-up-session-tokens
- Iframe protection / `frame-ancestors` CSP: https://shopify.dev/docs/apps/build/security/set-up-iframe-protection
- API versioning (stable vs release candidate vs unstable): https://shopify.dev/docs/api/usage/versioning
- Partner Program Agreement: https://www.shopify.com/partners/terms
- Acceptable Use Policy: https://www.shopify.com/legal/aup
- Shopify API License and Terms of Use: https://www.shopify.com/legal/api-terms
- Shopify trademark guidelines: https://www.shopify.com/legal/trademarks

## 1) Eligibility, Truthfulness, and Prohibited Behavior

- Your app must comply with the Shopify Partner Program Agreement (PPA) and Shopify’s Acceptable Use Policy (AUP).
- Your app and App Store listing must use factual, non-misleading claims. Avoid unsubstantiated superlatives, guarantees, or deceptive UI patterns.
- Prohibited behaviors called out by Shopify include (non-exhaustive):
  - Bypassing Shopify checkout or payment processing for App Store apps.
  - Manipulating or fabricating reviews, sales notifications, or other “trust” signals.
  - Enabling theme downloading (themes must be installed via Shopify Theme Store).
  - Off-platform billing for App Store distributed apps (unless Shopify explicitly notifies you otherwise).

## 2) Embedded App Requirements (Admin)

- Embedded apps must work in browsers where third-party cookies are restricted (including Chrome incognito).
- For embedded apps, Shopify requires session token–based authentication (JWTs issued by Shopify and sent to your backend).
- Use Shopify App Bridge / embedded best practices; avoid relying on browser cookies/localStorage for identity.

## 3) Installation and OAuth Flow Requirements

- Installation should be initiated from Shopify-owned surfaces (avoid flows that require merchants to manually type their store URL).
- OAuth should happen immediately (before the merchant can use the app UI).
- Post-OAuth redirect should land the merchant into the app’s embedded admin UI.
- Reinstall should require OAuth again (do not “install once forever” based on old tokens/sessions).

## 4) Security Baselines (App Store Review Relevant)

### TLS / HTTPS

- Serve over HTTPS with a valid TLS/SSL certificate and no certificate errors.

### Session Tokens (JWT)

- Retrieve session tokens via App Bridge and send them to your backend in `Authorization: Bearer <token>`.
- Backend must verify token signature (HS256 with your app’s client secret), and validate claims (including expiry and shop domain).
- Session tokens are short-lived (Shopify documents ~1 minute); fetch per request and handle rotation.

### Iframe Protection (Clickjacking)

- Shopify expects correct CSP `frame-ancestors` for embedded admin apps.
- `frame-ancestors` is typically dynamic per shop and should include both the shop admin and `https://admin.shopify.com` as appropriate.
- Incorrect/missing headers can block review.

### Webhooks: Verification + Reliability

- Verify the `X-Shopify-Hmac-SHA256` header for Shopify webhooks using the raw request body.
- Use a timing-safe compare to avoid timing attacks.
- Shopify treats any non-2xx (including redirects) as “not received”.
- Shopify webhooks have strict timeouts (Shopify documents a short connection timeout and ~5s request timeout) and will retry on failures; repeated failures may lead to subscription deletion.

### Least-Privilege OAuth Scopes

- Request the minimum scopes required for core functionality.
- Be prepared to justify sensitive scopes (Shopify may reject unnecessary scopes).
- Where available, prefer optional scopes rather than forcing broad scopes on install.

### API Versioning (Stable vs Release Candidate)

- Shopify uses date-based quarterly API versions (for example `2026-04`, `2026-07`).
- Shopify’s docs recommend using the latest **stable** version in production.
- Shopify docs describe **release candidate** versions as “not recommended for production” because they may include backwards-incompatible changes.

### Storefront-Exposed Surfaces

If your app includes storefront scripts/widgets/extensions:

- Treat all inputs as untrusted (theme settings, query params, remote API responses).
- Avoid DOM XSS sinks (`innerHTML`, `insertAdjacentHTML`, untrusted attribute construction).
- Avoid collecting/storing personal data unless it’s essential; document and secure what you do collect.
- Performance matters: avoid large JS/CSS, avoid long tasks, and avoid significant Lighthouse score regressions (Shopify references a “no more than ~10 point” drop heuristic for storefront-impacting apps).

## 5) Privacy, Compliance, and Customer Data

### Mandatory Compliance (GDPR-style) Webhooks

Shopify requires App Store apps to implement and subscribe to mandatory compliance webhooks:

- `customers/data_request`
- `customers/redact`
- `shop/redact` (Shopify notes it can be sent ~48 hours after uninstall)

Expected behaviors:

- Accept JSON `POST` webhooks.
- Return `2xx` promptly to acknowledge receipt.
- If webhook HMAC is invalid, return `401 Unauthorized`.
- Complete requested actions within Shopify’s stated timelines (Shopify documents “within 30 days” unless retention is legally required).

### Protected Customer Data

If your app uses protected customer data (as defined by Shopify):

- Request access through the Partner Dashboard when required.
- Implement data minimization, clear purpose limitation, secure storage, retention limits, and transparency requirements.

### Privacy Policy

- Shopify expects you to provide a privacy policy and link it from your App Store listing.
- Your privacy policy should accurately describe what data you collect, why, how long you retain it, and how merchants/customers can exercise rights.

## 6) Billing Requirements

- App Store distributed apps must use Shopify billing (Managed Pricing or Billing API) rather than off-platform billing, unless Shopify explicitly informs you otherwise.
- Billing flows should be testable and stable (including test charges where applicable).
- Plan upgrades/downgrades should work without manual intervention.
- Handle uninstall/reinstall billing re-approval correctly.

## 7) App Store Listing Requirements (Non-Code, Still Review Blockers)

- App name and icon must be consistent across the Partner Dashboard and listing.
- Pricing must be accurate and presented only in the intended pricing sections (don’t place pricing inside screenshots or icons).
- Listing content must be truthful and disclose dependencies/requirements (for example: “requires Online Store”, supported languages, region limitations).
- Screenshots and media should show real UI and not include fake reviews/testimonials.

## 8) Submission Requirements (Operational)

Shopify’s review submission commonly expects:

- A demo screencast showing installation/onboarding and primary workflows (English or English subtitles).
- Clear testing instructions.
- Valid test credentials that grant full access to features (kept up to date).
- A support channel and support email.
- An emergency developer contact.
- Allowlisting Shopify’s app submission emails is recommended by Shopify for timely communication.

## 9) Ongoing Quality Checks

- Shopify runs ongoing quality checks post-approval; requirements can change and you may be asked to update the app to remain listed.
