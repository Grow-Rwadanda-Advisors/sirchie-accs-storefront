# Sirchie storefront — provisioning and setup

How this repo becomes a live Edge Delivery Services storefront wired to Sirchie's
Adobe Commerce as a Cloud Service (ACCS) backend. Written September 2026.

## The three consoles, and which one owns what

These get confused constantly. They are separate products.

| Console | URL | Owns |
|---|---|---|
| Commerce Cloud Manager | Commerce section of experience.adobe.com | The ACCS instances. Source of the GraphQL endpoint and store codes. |
| AEM Cloud Manager | my.cloudmanager.adobe.com | AEM as a Cloud Service programs — author/publish/dispatcher, AEM Assets. Optionally registers an Edge Delivery *site* for domain and CDN config. |
| GitHub + DA.live | github.com, da.live | The storefront itself. Code in GitHub, content in Document Authoring. |

The storefront code repository is **not** provisioned by Adobe and does not appear
in either Cloud Manager. You create it. The AEM Cloud Manager program with its
stage and prod environments is for AEM Assets and AEM Sites — it is not where this
code lives.

## Official references (confirmed with the Adobe onboarding team, Sept 2026)

- Storefront boilerplate: <https://github.com/hlxsites/aem-boilerplate-commerce>
  — the repo this working tree was cloned from. Same source, no divergence.
- Create-storefront procedure:
  <https://experienceleague.adobe.com/en/tools/commerce-storefront/get-started/create-storefront/>
- ACCS storefront summary: <https://experienceleague.adobe.com/en/docs/commerce/cloud-service/storefront>
- Site Creator: <https://da.live/app/adobe-commerce/storefront-tools/tools/site-creator/site-creator>
- Config generator: <https://da.live/app/adobe-commerce/storefront-tools/tools/config-generator/config-generator>

Two gaps between the Adobe procedure and this repo:

- The Adobe page says `npm install` then `npm start`. That skips a step here:
  `.npmrc` sets `ignore-scripts=true`, so drop-in assets are not copied until you run
  `npm run install:dropins`. Without it the commerce blocks load nothing.
- For ACCS the Adobe page says to skip the PaaS storefront install checklist
  (Compatibility Package, Services Connector). Adobe manages those services on ACCS.

## Setup sequence

Design work does not wait on any of this. Blocks and tokens are built in this working
tree against the demo backend; the steps below attach the repo, content and backend
afterwards, and the existing work is transplanted into the new repo unchanged.

1. **Create the GitHub repo** from the boilerplate template:
   <https://github.com/hlxsites/aem-boilerplate-commerce> → *Use this template*.
   Lowercase name, hyphens only. Do not include all branches.
2. **Install the AEM Code Sync app** on that repo:
   <https://github.com/apps/aem-code-sync> → *Configure* → *Only select repositories*.
   This is what makes a git push publish.
3. **Run Site Creator** in Document Authoring (the Adobe page orders this after the
   config generator; either order works):
   <https://da.live/app/adobe-commerce/storefront-tools/tools/site-creator/site-creator>
   Choose **Use existing repository**, give the GitHub owner and the repo name, and
   paste the ACCS GraphQL endpoint. It seeds starter content into DA.live and wires
   the site config.
4. **Generate `config.json`** with the config generator:
   <https://da.live/app/adobe-commerce/storefront-tools/tools/config-generator/config-generator>
   Select the ACCS backend type. Save the result as `config.json` at the repo root
   and push it. `config.template.json` in this repo shows the expected shape.
5. **Push this working tree** into the new repo, then set remotes:
   `origin` = the Sirchie repo, `upstream` = hlxsites/aem-boilerplate-commerce.

## ACCS config differs from PaaS

ACCS uses a **single** `commerce-endpoint` for both catalog and core operations —
PaaS needed a separate `commerce-core-endpoint`. ACCS also does **not** need
`x-api-key` or `Magento-Environment-Id`; those are PaaS-only. The store, store view
and website codes still come from the Commerce admin.

`scripts/commerce.js` fetches `/config.json` from the site root at runtime and
caches it in sessionStorage for two hours. Until a local `config.json` exists,
`aem up` proxies the boilerplate demo config and the storefront runs on Adobe's
demo backend — which is the correct state for design work.

## Local development

```bash
npm install
npm run install:dropins   # .npmrc sets ignore-scripts=true, so postinstall never runs
npx aem up --no-open      # http://localhost:3000
```

`aem up` resolves the proxied content site from the git `origin` remote, so local
dev follows whichever repo `origin` points at.

## Open decisions

- Which GitHub organization owns the repo — affects handover to Sirchie at the end.
- Whether to register the Edge Delivery site in AEM Cloud Manager. Not needed to
  build or preview; it matters at launch for the sirchie.com domain and CDN
  configuration, and requires an unused Edge Delivery Services license on the
  program plus Business Owner role.

## Page routing

Product links are `/products/<url-key>/<sku>`, built by `getProductLink()` in
`scripts/commerce.js`. They only work when the site config maps that folder to the
`/products/default` template page. Site Creator does not set this; it was done by hand on
11 Oct 2026 as below.

### Now: folder mapping (design phase)

The mapping is set through the aem.live config service at `admin.hlx.page`. It is
separate from da.live: da.live's `config` sheet only controls who can edit content.

**Who can do it.** The config-service admin is the GitHub account that installed the AEM
Code Sync app, identified by its email. Here that is `havugapac@gmail.com`. Signing in
with the work Adobe ID (`pacifique@growrwanda.com`) gave 403 on every config call until that
address was added as admin. Both are admins now.

**Steps (Chrome, no token copying):**

1. Open `https://admin.hlx.page/logout`, then
   `https://admin.hlx.page/auth/google?selectAccount=true` and pick an admin account
   (`/auth/adobe?selectAccount=true` for an Adobe ID).
2. Open `https://admin.hlx.page/profile` and check the `email` field.
3. On that tab: Cmd+Option+I → **Console** → type `allow pasting`, Enter.
4. Paste and run:

   ```js
   fetch('/config/grow-rwadanda-advisors/sites/sirchie-accs-storefront/folders.json', {
     method: 'POST',
     headers: { 'content-type': 'application/json' },
     body: JSON.stringify({ '/products/': '/products/default' }),
   }).then(r => r.text()).then(console.log)
   ```

   Expected output: `{"/products/":"/products/default"}`. The POST replaces the whole
   object, so include every mapping you want to keep.
   - 401: not signed in; redo step 1.
   - 403: this account is not a config-service admin; sign in with one that is, or have
     an admin add you (next section).
   - Other 4xx: ask the Adobe contact to enable folder mapping for the site.
5. Test `https://main--sirchie-accs-storefront--grow-rwadanda-advisors.aem.page/products/test-product/test-product`.
   Preview and live both pick it up at once; no code change or da.live publish is needed.

**Adding an admin** (same Console, signed in as an existing admin):

```js
fetch('/config/grow-rwadanda-advisors/sites/sirchie-accs-storefront/access/admin.json', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ role: { admin: ['havugapac@gmail.com', 'pacifique@growrwanda.com'] } }),
}).then(r => r.text()).then(console.log)
```

Always use the `admin` role. Giving only `config` removes the default rights from
everyone else and breaks Preview/Publish in da.live ("Not authorized to preview").

**Why not the `auth_token` cookie or curl.** The cookie works as
`Authorization: token <value>`, but it is very long and the DevTools cookie table
truncates it, which produced 401s. For scripts and CI, create an API key instead:
`POST …/sites/sirchie-accs-storefront/apiKeys.json` with
`{"description":"…","roles":["publish"]}`; the key is shown once.

### Later: Prerender (App Builder phase, before go-live)

Adobe flags folder mapping as legacy and it gives crawlers no product HTML. Switch when
the real catalog is in ACCS, product URLs are final and the App Builder workspace exists
for the other integrations (Sage, FedEx, Paya).

1. Create Stage and Production App Builder workspaces; Developer role in the Adobe
   Developer Console.
2. Clone Adobe's `aem-commerce-prerender`, run its setup wizard with the site name, locale
   and product URL format, plus an admin API key (valid one year; calendar the renewal).
3. `npm run deploy`, then enable scheduled sync in its management UI.
4. In this repo, change `product-details` to read the SKU from `<meta name="sku">`.
5. Verify product and category pages, then clear the mapping: same `folders.json` call
   with body `{}`.
6. Known limits: category pages refresh about every 15 min; ~10k products per category.

Folder mapping first lets the design be finished now; moving to Prerender later changes
one block, not the design.
