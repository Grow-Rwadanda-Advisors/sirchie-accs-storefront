# Footer Block

## Overview

Site footer decorated from the `/footer` document in da.live (Figma 159:826): brand
paragraphs, link columns, a sign-up column and a legal row.

## Integration

### Block Configuration

The footer document has two sections.

| Section | Content |
|---------|---------|
| 1 | Brand paragraphs (logo link, then the contact line), then one heading per column with its list. A column containing a bold link becomes the sign-up column |
| 2 | Copyright paragraph, then a list of legal links |

<!-- ### URL Parameters

No URL parameters affect this block. -->

<!-- ### Local Storage

No localStorage keys are used by this block. -->

<!-- ### Events

No events are listened to or emitted. -->

## Behavior Patterns

### Page Context Detection
- Columns sit side by side on desktop and stack on phones.

<!-- ### User Interaction Flows

Links only. -->

### Error Handling
- **Missing section**: the footer renders what the document provides.
