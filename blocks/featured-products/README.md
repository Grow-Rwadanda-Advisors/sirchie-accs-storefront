# Featured Products Block

## Overview

Section header with a rule and a grid of product cards from the catalog (Figma 125:516).
Cards come from the product discovery drop-in, so they match the category and search
pages. The Related Products block reuses this block for its cards.

## Integration

### Block Configuration

| Configuration Key | Type | Default | Description | Required | Side Effects |
|-------------------|------|---------|-------------|----------|--------------|
| `title` | string | `Featured Products` | Section heading | No | |
| `subtitle` | string | `''` | Line under the heading | No | Hidden when empty |
| `count` | number | `8` | Number of products to show | No | |
| `category` | string | `''` | Category url path to draw products from | No | Adds a `categoryPath` filter |
| `phrase` | string | `''` | Search phrase | No | |

<!-- ### URL Parameters

No URL parameters affect this block. -->

<!-- ### Local Storage

No localStorage keys are used by this block. -->

### Events

#### Event Listeners
- Product discovery `search/result` events, through the drop-in's `SearchResults` container, render the cards.

<!-- #### Event Emitters

No events are emitted by this block. -->

## Behavior Patterns

### Page Context Detection
- Products with options, and gift cards, link to the product page instead of adding to the cart.
- Out-of-stock products show a disabled Add to Cart.

### User Interaction Flows
1. **Add to Cart**: adds one unit; the mini cart opens.
2. **Card click**: image and name open the product page.

### Error Handling
- **Search failure**: the block gets the `featured-products--error` class and stays empty.
