# Promo Card Block

## Overview

Homepage promotion card (Figma 159:790): a content cell with an optional badge, heading,
text or list, rule and bold-link call to action, plus an optional image cell. The
**Spotlight** variant centres the heading and bolds only its bold words
(`**PRODUCT** OF THE MONTH`). Four cards in one section with Section Metadata
**Style: promotions** form Figma's 550 + 702 / 702 + 550 grid from 1200px.

## Integration

### Block Configuration

Content is authored as one row.

| Row cell | Content | Required | Notes |
|----------|---------|----------|-------|
| 1 | Optional picture-only paragraph (badge), heading, text/list/rule, `**bold link**` (CTA) | Yes | The bold link gets the chevron button style |
| 2 | Image | No | Omit for a text-only card |

Variants: `promo-card (spotlight)`.

<!-- ### URL Parameters

No URL parameters affect this block. -->

<!-- ### Local Storage

No localStorage keys are used by this block. -->

<!-- ### Events

No events are listened to or emitted. -->

## Behavior Patterns

### Page Context Detection
- **Section style `promotions`**: cards take the alternating two-column widths; elsewhere they stack at full width.

### User Interaction Flows
1. **Call to action**: the bold link is the only interactive element.

### Error Handling
- **Missing cells**: the card renders the cells it has.
