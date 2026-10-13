# Hero Carousel Block

## Overview

Homepage hero slider (Figma 200:2108). Each authored row is one slide: an image beside a
badge, eyebrow, heading, body text and a bold-link call to action. With two or more slides
the block adds dots and a 6-second autoplay. The **Dark** variant is the Resource Center
banner (Figma 467:1719): navy card, uppercase white title, yellow call to action.

## Integration

### Block Configuration

Content is authored as rows, not key/value pairs.

| Row cell | Content | Required | Notes |
|----------|---------|----------|-------|
| 1 | One image, or two images (desktop first, then mobile) | Yes | Two images become one art-directed picture; the curved edge is drawn in CSS, so upload plain rectangles |
| 2 | Picture-only paragraph (badge), text paragraph (eyebrow), heading, body text, `**bold link**` (CTA) | Yes | Any of the parts may be omitted |

Variants: `hero-carousel (dark)`.

<!-- ### URL Parameters

No URL parameters affect this block. -->

<!-- ### Local Storage

No localStorage keys are used by this block. -->

<!-- ### Events

No events are listened to or emitted. -->

## Behavior Patterns

### Page Context Detection
- **Single slide**: no dots and no autoplay.
- **Two or more slides**: dots and autoplay; the first slide's image loads eagerly as the LCP element.

### User Interaction Flows
1. **Browse slides**: click a dot, or wait for autoplay. Autoplay pauses on hover, keyboard focus, a hidden tab and for users who prefer reduced motion.

### Error Handling
- **Missing image or text**: the slide renders with whatever parts exist; nothing is thrown.
