# Sirchie storefront — project context

@AGENTS.md

`AGENTS.md` carries the Edge Delivery Services / Adobe Commerce boilerplate rules (vanilla
JS, no build step, block conventions, lint before commit). Everything below is
Sirchie-specific context layered on top of it. Where the two differ, this file wins.

## What this project is

Frontend for the sirchie.com migration from Adobe Commerce Cloud PaaS (Magento 2.4.5-p17
on Upsun) to Adobe Commerce as a Cloud Service (ACCS). This repo is the EDS storefront.
Custom PHP modules from the old site do NOT carry over — they are rebuilt here as EDS
blocks, or outside this repo as App Builder apps.

Status (Oct 2026): the site is registered and live-capable.

| | |
|---|---|
| Code | `github.com/Grow-Rwadanda-Advisors/sirchie-accs-storefront`, branch `main` |
| Content | da.live, `/grow-rwadanda-advisors/sirchie-accs-storefront` |
| Preview | `https://main--sirchie-accs-storefront--grow-rwadanda-advisors.aem.page/` |
| Live | `https://main--sirchie-accs-storefront--grow-rwadanda-advisors.aem.live/` |
| Branch preview | `https://<branch>--sirchie-accs-storefront--grow-rwadanda-advisors.aem.page/` |
| Backend | ACCS sandbox, set in `config.json` (single `commerce-endpoint`, no API key) |

`SIRCHIE-SETUP.md` has the provisioning history and the console-vs-console map.
`../sirchie-storefront` is the retired first repo (boilerplate v10, never registered);
do not copy files from it — its work is already merged here.

## Working rules

- **Never push, merge to `main`, or publish da.live content without the user's go-ahead
  in that moment.** Commit locally, then stop and ask. Branch previews need a push too,
  so ask before those as well.
- Commits: user is the sole author; no co-author trailers; one short imperative subject
  line, no body unless a decision needs recording.
- Code comments: short, plain, about what the code does. Never narrate how the code was
  produced, the conversation, or alternatives considered.
- Chat replies: brief and direct, tables/lists over prose, but keep every point the user
  needs to act on.
- Verify before claiming done: `npm run lint`, then render the page (see *Checking a
  page*). Report what was and was not checked.

## Code vs content — what a push changes

| Change | Lives in | Takes effect |
|---|---|---|
| Blocks, `styles/`, `scripts/`, `icons/`, `fonts/`, `head.html`, `404.html`, `config.json`, `placeholders/*.json`, `component-*.json` | git | On push, on that branch's URL; on `main` for preview and live. No da.live action. |
| Pages: `index`, `nav`, `footer`, every other page, images in `media/` | da.live | Only after **Preview** (→ `.aem.page`) and **Publish** (→ `.aem.live`) of that page |
| `drafts/`, `nav.plain.html`, `footer.plain.html` | local only (gitignored, hlxignored) | Never |

Consequences:
- A page document is uploaded or edited in da.live **once**; later design changes are
  code only. Re-upload a page only when its block layout (rows/columns) must change.
- Changing a block's layout breaks every page that uses it. Prefer making the code accept
  both the old and new layouts; otherwise list the pages to re-author.
- Never commit page content (`*.plain.html`) to the repo — a committed `nav.plain.html`
  would shadow the authored nav for every visitor.
- `.aem.page` shows previewed content; `.aem.live` shows published content. Review on
  `.aem.page`. Cached assets are the usual reason a fresh push "does not show": hard
  refresh or a private window first.
- da.live drops empty sections and table cells when it saves a document. Blocks must
  tolerate that (the header already does for the empty tools section).

## Local development

```bash
npm install
npm run install:dropins   # required — .npmrc sets ignore-scripts=true, so postinstall never runs
npx aem up --no-open      # http://localhost:3000, real da.live content + local code
```

Default workflow: develop against the real previewed da.live pages. Do not keep local
copies of pages. For a throwaway experiment, create a page under `/drafts/` in da.live
and preview it (never publish it); `drafts/` locally plus
`npx aem up --no-open --html-folder drafts --html-mount /` is the fallback when da.live
is unavailable. Local `.plain.html` drafts render in quirks mode; keep drafts as full
documents with a doctype and a copy of `head.html`.

Page content and block markup can be inspected with `curl <url>.plain.html`.

## Checking a page

Headless Chrome is available (`/Applications/Google Chrome.app`, `playwright-core` in the
scratchpad). Render the preview URL at 375, 768, 1024 and 1440 px wide, capture a full-page
screenshot, and collect console errors and failed requests before reporting a page as done.
Any `header.js`/block change can be tested against the real nav by routing that file to the
local copy in the headless session.

## Where the design lives

Figma is the source of truth for visuals. Design intent maps into this repo in a fixed order:

1. `styles/styles.css` `:root` — colour, type, spacing, radius, shadow tokens.
   The drop-in tokens (`--color-brand-*`, `--color-neutral-*`, `--spacing-*`,
   `--shape-*`, `--type-*`) are what re-skin the commerce drop-ins. Change tokens
   before touching drop-in markup.
2. `blocks/<block>/<block>.css` — per-block styling.
3. `blocks/<block>/<block>.js` — only when behaviour, not appearance, differs.

Do not restructure the commerce drop-ins (PDP, cart, checkout, account). They are
style-only surfaces; structural change there is custom dev with real cost.

Figma file: `enhVms6w5cfDF7sTj7jS1u`. Key nodes: desktop Homepage `5:3536`, Header
`212:2400`, Megamenu `52:3947`, Product page `257:781`, mobile `355:2383`. The
connected Figma account is a View seat with a capped MCP call budget — spend calls
on `get_design_context` for the node being built, not on exploration. Exported
assets can be wrong: an icon instance swapped in Figma may export as its base
component (the header cart exported as a chevron-circle). Check exports against
the render before committing them.

Icons from Figma live in `icons/sirchie/` and are applied as CSS masks so colour
follows the design, not the export. The design system's icon set is Ionicons.

## Pages and where their design comes from

Site Creator seeded these pages in da.live; each holds one drop-in block. They are styled
through tokens and block CSS only.

| Page(s) | Block(s) | Design source |
|---|---|---|
| `/` | hero-carousel, trust-strip, promo-card, featured-products | Figma — done |
| `/nav`, `/footer` | header, footer | Figma — done |
| `/products/<url-key>/<sku>` via `/products/default` | product-details, product-recommendations | Figma `257:781` — styled; routing still 404 (see below) |
| `/apparel` and other categories, `/search` | product-list-page, product-recommendations | No Figma. Style from tokens; current sirchie.com for structure |
| `/cart`, mini cart | commerce-cart, commerce-mini-cart | No Figma; tokens + current site |
| `/checkout`, `/checkout/success` (page missing) | commerce-checkout, commerce-checkout-success | No Figma; tokens |
| `/customer/login`, `/customer/create`, `/customer/forgotpassword` | commerce-login, commerce-create-account, commerce-forgot-password | No Figma; tokens |
| `/customer/account`, `/customer/orders`, `/customer/order-details`, `/customer/address` (page missing), `/wishlist` | commerce-account-*, commerce-orders-list, commerce-addresses, commerce-wishlist | No Figma; tokens |
| `/order-status`, `/order-details`, `/return-details` | commerce-order-status, commerce-order-*, commerce-returns-* | No Figma; tokens |

"Page missing" = the route exists in `scripts/commerce.js` but no da.live page was seeded;
author it (one block table) before styling. Pages that need a new block (forms, training
dates, resource center — see *Blocks to build*) need a Figma design first; flag them to
the design team rather than inventing layouts.

Drop-in text (labels, errors) comes from `placeholders/*.json` in the repo; site-wide
placeholders such as `Global.Search` come from da.live.

## Product page routing

`getProductLink()` builds `/products/<url-key>/<sku>`; a folder mapping in the site config
(`/products/` → `/products/default`) serves those URLs from the PDP template. Set on
11 Oct 2026; how to change it is in `SIRCHIE-SETUP.md`. Before go-live, replace it with
AEM Commerce Prerender (App Builder): `product-details` then reads the SKU from
`<meta name="sku">`, and the mapping is cleared.

## Header and nav authoring contract

The header is decorated from the `/nav` document in da.live. Its sections are read
by position:

1. **brand** — a link to `/`. The Sirchie logo ships with the code; an authored image
   overrides it.
2. **sections** — the category list. A top-level item with a nested list becomes a
   mega menu (three columns); without one it is a plain link.
3. **tools** — leave empty. Search, cart and sign-in are injected by code. da.live drops
   empty sections, so a four-section nav is read as brand, sections, utility, cta.
4. **utility** — top bar. A list of links, then paragraphs. A paragraph holding only a
   single link (e.g. "Request an Account") moves right, beside Sign In, and hides once
   the customer is signed in. Other paragraphs (the contact line) stay left.
5. **cta** — buttons. `**bold link**` renders as the filled primary button,
   `*italic link*` as the outlined one.

If utility is absent the header falls back to boilerplate behaviour (sign-in icon in
tools), so the boilerplate demo nav still renders.

Menu and footer URLs are still placeholders (`/apparel` everywhere); fixing them is a
da.live edit, not code.

## Homepage blocks and their authoring contracts

Built from Figma Homepage `5:3536`. Figma's mobile frame (`355:2383`) gave section sizes
but not inner layouts, so mobile arrangements are interpolated and should be checked with
the designer.

- **Hero Carousel** (`blocks/hero-carousel`, Figma `200:2108`). One row per slide: cell 1
  the image, cell 2 the content — a picture-only paragraph (badge), a text paragraph
  (eyebrow), a heading, body text, and a **bold link** (CTA). The image cell may hold two
  images — desktop then mobile — which become one art-directed picture; the curved photo edge
  is drawn in CSS, so upload plain rectangular photos. Dots and 6s autoplay appear
  with two or more slides; autoplay pauses on hover, focus, hidden tab and reduced motion.
  The first slide's image loads eagerly as the LCP element.
  Variant **Hero Carousel (Dark)** is the Resource Center CTA (`467:1719`): navy card,
  uppercase white title, yellow 73px CTA, contained image.
- **Trust Strip** (`blocks/trust-strip`, `136:489`). Row 1: the heading line. Each further
  row: value | label.
- **Promo Card** (`blocks/promo-card`, cards in `159:790`). One row: content cell (optional
  picture-only badge before the heading, heading, text/list/rule, bold-link CTA) | optional
  image cell. Variant **Promo Card (Spotlight)** centres the heading and makes only its bold
  words bold (`**PRODUCT** OF THE MONTH`). Put the four cards in one section with Section
  Metadata **Style: promotions** to get Figma's 550 + 702 / 702 + 550 grid (from 1200px).
- **Featured Products** (`blocks/featured-products`, `125:516`). Key/value rows: Title,
  Subtitle, Count. Cards come from the catalog (price or Request Information from the
  call-for-price attribute).
- **Footer** (`/footer` document, `159:826`). Section 1: brand paragraphs (logo link, then
  the contact line), then one heading per column; a column containing a bold link becomes the
  sign-up column. Section 2: the copyright paragraph, then a list of legal links.

The chevron call-to-action (`button-chevron` in `styles/styles.css`, Figma "Hero Button")
is shared: blocks add the class to authored buttons. Its angled end and slash are one masked
pseudo-element in `--button-chevron-color`, so variants change only that colour.

Section Metadata `Style` values are turned into classes on the section by the delivery
pipeline, not by client JavaScript — this `aem.js` has no section-metadata handling.

## Responsiveness

- Mobile first; `min-width` queries at 600, 900 and 1200 px only.
- Check every page at 375, 768, 1024 and 1440 px before calling it done; no horizontal
  scroll at any width, tap targets ≥ 44 px, text never clipped.
- Images: authored images get `width`/`height` and a responsive `<picture>`; never
  stretch an image with CSS alone.
- Mega menu, mini cart and search must work by keyboard and on touch.

## Performance

Target PageSpeed Insights 100 on the branch preview before a PR (`AGENTS.md` step 3).
- Only the first section's assets load eagerly; the hero's first image is the LCP element
  and stays `loading="eager"`, everything else lazy.
- No layout shift: reserve space for images, fonts (`fonts.css` with `font-display`),
  and drop-in containers before they render.
- Keep `styles.css` to what is needed above the fold; the rest goes in `lazy-styles.css`.
- No new runtime dependencies; no third-party scripts outside `delayed.js`.
- Committed images and icons are optimised (SVG cleaned, raster ≤ 200 KB).

## Pulling from Figma

The Figma MCP is configured at user level (`claude mcp`, user scope), so it is available
in any project directory. Design context can be pulled non-interactively with
`claude -p "<call get_design_context …>" --allowedTools mcp__figma__get_design_context
--output-format stream-json --verbose`, then parsed from the tool_result. Asset URLs expire
after 7 days — download them immediately.

## Blocks to build (rebuilt from old Sirchie PHP modules)

| Block | Replaces | Notes |
|---|---|---|
| Call for Price | `Sirchie_CallForPrice` | product attribute drives price/cart hiding |
| Product Restrictions | `Sirchie_ProductRestrictions` | law-enforcement gating, attribute + geo |
| Hazmat indicator | `Sirchie_HazMatShipping` | display only; surcharge logic is App Builder |
| International RFQ | `Sirchie_GeoIp` + `Sirchie_InternationalQuote` | CDN country header, not a GeoIP DB |
| Request for Information forms | `Sirchie_RequestForInformation` | several variants; must be admin-configurable (client decision, Sept 22) |
| Request a Meeting form | new scope | |
| Training course date selector | `Sirchie_EventCalendar` + `Sirchie_Training` | highest complexity |
| Resource center | `Sirchie_ResourceCenter` | |
| Geo-based price/cart hiding | `Sirchie_GeoIp` | pairs with restrictions |

Old module source, when pulled from SSH, lives at `../reference/sirchie-modules/`
(gitignored). Read it for behaviour, do not port PHP patterns into JS.

## Out of scope for this repo

- Order push to Sage 100 (ROI nSync), FedEx handling/hazmat/negotiable rates, Paya
  payments, custom email flows — all App Builder, separate project.
- Product media — served from AEM Assets, not committed here.
- Migration reference docs — `../docs/`, gitignored, never push them.
