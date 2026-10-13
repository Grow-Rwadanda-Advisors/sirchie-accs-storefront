# Related Products Block

## Overview

Product page section under the description (Figma 347:1348) listing the products linked
to the viewed product in Commerce. It reuses the Featured Products block for the header
and cards, so the three product card surfaces stay identical.

## Integration

### Block Configuration

| Configuration Key | Type | Default | Description | Required | Side Effects |
|-------------------|------|---------|-------------|----------|--------------|
| `title` | string | `Featured Products` | Section heading, normally "Related Products" | No | |
| `link type` | string | `related` | `related`, `upsell` or `crosssell` | No | Chooses which Commerce product links are shown |

<!-- ### URL Parameters

The product SKU comes from the page URL (`/products/<url-key>/<sku>`) through `getProductSku()`, not from a query parameter. -->

<!-- ### Local Storage

No localStorage keys are used by this block. -->

<!-- ### Events

No events are listened to or emitted directly; the cards render through the Featured Products block. -->

## Behavior Patterns

### Page Context Detection
- **Product with links**: cards for the linked SKUs.
- **Product without links, or not a product page**: the block removes itself; the rest of the section stays.

### User Interaction Flows
1. Same as Featured Products: Add to Cart, or open the product page.

### Error Handling
- **Catalog query failure**: treated as "no links"; the block removes itself.
