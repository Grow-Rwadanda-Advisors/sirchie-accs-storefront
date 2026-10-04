# Sirchie storefront — project context

Read `AGENTS.md` first: it carries the Edge Delivery Services / Adobe Commerce
boilerplate rules (vanilla JS, no build step, block conventions, lint before commit).
Everything below is Sirchie-specific context layered on top of it.

## What this project is

Frontend for the sirchie.com migration from Adobe Commerce Cloud PaaS (Magento 2.4.5-p17
on Upsun) to Adobe Commerce as a Cloud Service (ACCS). This repo is the EDS storefront.
Custom PHP modules from the old site do NOT carry over — they are rebuilt here as EDS
blocks, or outside this repo as App Builder apps.

Status (Sept 2026): ACCS Commerce instances are provisioned. This repo still runs against
the Adobe demo backend (`aemshop.net`) because no `config.json` exists at the root yet —
`scripts/commerce.js` fetches `/config.json` at runtime, and `aem up` proxies the demo one
until a local file shadows it. Pointing at Sirchie's ACCS backend is that one file, not a
code change. See `SIRCHIE-SETUP.md` for provisioning, the console-vs-console map, and the
ACCS config shape.

## Local development

```bash
npm install
npm run install:dropins   # required — .npmrc sets ignore-scripts=true, so postinstall never runs
npx aem up --no-open      # http://localhost:3000
```

`aem up` resolves the proxied content site from the git `origin` remote. While `origin`
still points at `hlxsites/aem-boilerplate-commerce`, local dev proxies the boilerplate
demo site. Once this code lives in the Sirchie repo with its own content source, it
proxies Sirchie content instead.

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

## Header and nav authoring contract

The header is decorated from the `/nav` document in da.live. Its sections are read
by position:

1. **brand** — a link to `/`. The Sirchie logo ships with the code; an authored image
   overrides it.
2. **sections** — the category list. A top-level item with a nested list becomes a
   mega menu (three columns); without one it is a plain link.
3. **tools** — leave empty. Search, cart and sign-in are injected by code.
4. **utility** — top bar. A list of links, then paragraphs. A paragraph holding only a
   single link (e.g. "Request an Account") moves right, beside Sign In, and hides once
   the customer is signed in. Other paragraphs (the contact line) stay left.
5. **cta** — buttons. `**bold link**` renders as the filled primary button,
   `*italic link*` as the outlined one.

If utility is absent the header falls back to boilerplate behaviour (sign-in icon in
tools), so the boilerplate demo nav still renders.

Locally, `nav.plain.html` at the repo root mocks that document and `aem up` serves it
in place of the proxied nav. It is in both `.gitignore` and `.hlxignore` and must never
ship — a committed copy would shadow the authored nav in production.

The search placeholder text comes from the `Global.Search` placeholder in da.live, not
from code.

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
- **Footer** (`/footer` document, `159:826`). Section 1: brand paragraphs (logo link, then
  the contact line), then one heading per column; a column containing a bold link becomes the
  sign-up column. Section 2: the copyright paragraph, then a list of legal links.

The chevron call-to-action (`button-chevron` in `styles/styles.css`, Figma "Hero Button")
is shared: blocks add the class to authored buttons. Its angled end and slash are one masked
pseudo-element in `--button-chevron-color`, so variants change only that colour.

Section Metadata `Style` values are turned into classes on the section by the delivery
pipeline, not by client JavaScript — this `aem.js` has no section-metadata handling.

Featured Products (`125:516`) is not built yet: the cards need live catalog data (price vs.
Request Information from the call-for-price attribute), so it belongs with the commerce
product card work.

## Local drafts and mocks

`npx aem up --no-open --html-folder drafts --html-mount /` serves `drafts/index.html` as the
homepage at `/`; any path without a draft falls through to the proxied demo site, so catalog
pages keep working. Keep drafts as full `.html` documents with `<!DOCTYPE html>` and a copy of
`head.html` (re-copy when it changes). Do not use `.plain.html` drafts: the dev server wraps
them without a doctype, the page renders in quirks mode, and percentage heights break in ways
production never shows. Section Metadata is written in drafts as the class the pipeline
would render. `drafts/`, `nav.plain.html` and `footer.plain.html` are gitignored and
hlxignored; media in `drafts/media` are Figma exports standing in for authored content.

## Pulling from Figma

The Figma MCP connected to this chat may be a View seat (6 read calls a month). The terminal
Claude Code has its own Figma connection (`claude mcp`, user scope). Design context can be
pulled through it non-interactively and captured verbatim with
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
| Request for Information forms | `Sirchie_RequestForInformation` | several variants |
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
