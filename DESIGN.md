# Job Board Client Design System

## 1. Atmosphere & Identity

Job Board Client should feel like a focused hiring operations desk: organized, quick to scan, and reliable under repeated daily use. The signature is grounded contrast: warm paper surfaces, dark ink text, and green action states that signal progress without using blue.

## 2. Color

### Palette

| Role | Token | Light | Dark | Usage |
| --- | --- | --- | --- | --- |
| Surface/primary | --surface-primary | #F7F4EC | #17130F | Page background |
| Surface/secondary | --surface-secondary | #FFFAF0 | #211C17 | Secondary bands |
| Surface/elevated | --surface-elevated | #FFFFFF | #2A241D | Cards, tabs, panels |
| Surface/inverse | --surface-inverse | #14120F | #F7F4EC | High-contrast badges |
| Text/primary | --text-primary | #17130F | #F7F4EC | Headings and body |
| Text/secondary | --text-secondary | #5E584F | #C9BDAA | Supporting text |
| Text/tertiary | --text-tertiary | #857C70 | #AFA390 | Muted metadata |
| Border/default | --border-default | #DDD4C4 | #3B332A | Cards and dividers |
| Border/strong | --border-strong | #BBA98F | #6D5B48 | Active outlines |
| Accent/primary | --accent-primary | #2F7D52 | #65B87F | Primary actions, focus |
| Accent/hover | --accent-hover | #256342 | #7DCC96 | Action hover |
| Accent/warm | --accent-warm | #D9A441 | #F1C363 | Warnings, highlights |
| Accent/coral | --accent-coral | #C8643F | #EF8B67 | Attention and review |
| Status/success | --status-success | #2F7D52 | #65B87F | Success states |
| Status/warning | --status-warning | #A66A1F | #F1C363 | Cautions |
| Status/error | --status-error | #B94434 | #EF8B67 | Errors, destructive |

### Rules

- Blue and blue-adjacent accents are excluded from this system.
- Green is reserved for progress, primary actions, and focus.
- Warm yellow and coral are semantic support colors, not decoration.
- New colors must be added here before use.

## 3. Typography

### Scale

| Level | Size | Weight | Line Height | Tracking | Usage |
| --- | --- | --- | --- | --- | --- |
| Display | clamp(44px, 6vw, 90px) | 900 | 1 | 0 | First viewport title |
| H1 | 48px | 850 | 1.1 | 0 | Page titles |
| H2 | clamp(32px, 4vw, 54px) | 850 | 1.05 | 0 | Section headers |
| H3 | 20px | 800 | 1.35 | 0 | Card and panel titles |
| Body/lg | 18px | 400 | 1.7 | 0 | Hero and lead copy |
| Body | 16px | 400 | 1.6 | 0 | Default text |
| Body/sm | 14px | 500 | 1.5 | 0 | Metadata |
| Caption | 12px | 700 | 1.4 | 0 | Badges and labels |

### Font Stack

- Primary: Aptos, Segoe UI, system-ui, -apple-system, BlinkMacSystemFont, sans-serif
- Mono: ui-monospace, Consolas, monospace

### Rules

- Use the system sans stack until brand typography is selected.
- Body text never drops below 14px.
- Letter spacing stays at 0.

## 4. Spacing & Layout

### Base Unit

All spacing derives from 4px.

| Token | Value | Usage |
| --- | --- | --- |
| --space-1 | 4px | Icon-to-label |
| --space-2 | 8px | Tight inline groups |
| --space-3 | 12px | Compact card internals |
| --space-4 | 16px | Default gaps |
| --space-5 | 20px | Form and panel padding |
| --space-6 | 24px | Standard card padding |
| --space-8 | 32px | Large panel padding |
| --space-12 | 48px | Section rhythm |
| --space-18 | 72px | Desktop section padding |

### Grid

- Max content width: Bootstrap `.container`
- Layout system: Bootstrap grid with custom section spacing
- Breakpoints: Bootstrap defaults

### Rules

- Use Bootstrap grid for page layout and React Bootstrap components for controls.
- Fixed-format UI elements use stable dimensions or grid tracks.
- Do not nest cards inside cards.

## 5. Components

### App Shell

- Structure: sticky `Navbar`, semantic `main`, section bands.
- States: nav links expose hover and focus color.
- Accessibility: Bootstrap navbar toggle uses `aria-controls`.

### Module Card

- Structure: icon block, title, description, status badge.
- Variants: public, employer, candidate, admin.
- Spacing: 14px internal gap, 270px minimum body height.
- Accessibility: icons are decorative with `aria-hidden`.

### Workspace Tabs

- Structure: Bootstrap `Tabs` with one card panel per role.
- States: active tab uses green text and elevated surface.
- Accessibility: Bootstrap manages tab semantics.

## 6. Motion & Interaction

### Timing

| Type | Duration | Easing | Usage |
| --- | --- | --- | --- |
| Micro | 120ms | ease-out | Button and link hover |
| Standard | 220ms | ease-in-out | Tab and card state changes |

### Rules

- Animate only transform, opacity, or color.
- Every interactive element must have hover and focus states.
- Respect reduced-motion in future animated components.

## 7. Depth & Surface

### Strategy

Mixed tonal-shift plus restrained borders.

| Level | Value | Usage |
| --- | --- | --- |
| Border/default | 1px solid var(--border-default) | Cards, tabs, dividers |
| Shadow/panel | 0 16px 40px rgba(55, 43, 28, 0.12) | Hero metric panel only |

### Rules

- Cards use 8px radius maximum.
- Shadows are rare and warm-tinted.
- Section bands provide depth before extra borders.
