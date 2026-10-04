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
