# Trust Strip Block

## Overview

Navy band with a heading line and a row of figures (Figma 136:489), e.g. "3,000+ SKUs in
Catalog", used under the homepage hero.

## Integration

### Block Configuration

Content is authored as rows.

| Row | Content | Required |
|-----|---------|----------|
| 1 | Heading line, one cell | Yes |
| 2+ | Value cell, label cell | At least one |

<!-- ### URL Parameters

No URL parameters affect this block. -->

<!-- ### Local Storage

No localStorage keys are used by this block. -->

<!-- ### Events

No events are listened to or emitted. -->

## Behavior Patterns

### Page Context Detection
- Figures sit in one row on desktop and wrap on phones.

<!-- ### User Interaction Flows

The block is static. -->

### Error Handling
- **Row with one cell after the heading**: shown as a value without a label.
