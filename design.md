---
version: alpha
name: Streamtime Analysis
description: An analysis of Streamtime's design language — a maximalist, hand-crafted collage system built to feel human, warm, and playful. A bespoke hand-lettered wordmark, torn-paper/fabric-textured sunbursts and squiggles, chunky stadium-pill buttons, and a saturated rotating accent palette (marigold yellow, hot pink, lime, periwinkle blue) sit over a warm cream canvas that alternates with full-bleed near-black panels. Where a minimal system reserves color for scarcity, Streamtime spends it everywhere — color and texture ARE the brand, not an accent on top of it.

colors:
  ink: "#18130F"
  ink-soft: "#2B241E"
  panel-dark: "#211C17"
  canvas: "#FAF6ED"
  canvas-warm: "#EDE1C7"
  text-muted: "#6E6153"
  text-faint: "#A79C8C"
  text-on-dark: "#F5EFE4"
  text-on-dark-muted: "#B7ACA0"
  accent-yellow: "#F2C230"
  accent-pink: "#F23DAE"
  accent-lime: "#CBDA2E"
  accent-blue: "#6478E0"
  stone: "#C7B79C"
  stone-dark: "#A2907A"
  charcoal-shape: "#3B332C"
  white: "#FFFFFF"
  black: "#000000"
  hairline: "#E4DBCB"

typography:
  heading-1:
    fontFamily: Basis Grotesque
    fontSize: 56px
    fontWeight: 800
    lineHeight: 1.05
    letterSpacing: 0
  heading-2:
    fontFamily: Basis Grotesque
    fontSize: 40px
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: 0
  heading-3:
    fontFamily: Basis Grotesque
    fontSize: 28px
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: 0
  heading-4:
    fontFamily: Basis Grotesque
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: 0
  title:
    fontFamily: Basis Grotesque
    fontSize: 18px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0
  body-lg:
    fontFamily: Basis Grotesque
    fontSize: 20px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body:
    fontFamily: Basis Grotesque
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: 0
  body-sm:
    fontFamily: Basis Grotesque
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: 0
  link:
    fontFamily: Basis Grotesque
    fontSize: 15px
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: 0
  label:
    fontFamily: Basis Grotesque
    fontSize: 12px
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: 0.02em
  caption:
    fontFamily: Basis Grotesque
    fontSize: 12px
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: 0

rounded:
  none: 0px
  sm: 12px
  md: 20px
  lg: 32px
  full: 9999px

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 40px
  xxl: 64px
  section: 96px
  section-lg: 140px

textures:
  paper-grain: Subtle fiber/grain overlay applied to flat decorative-shape fills and some photo treatments. Reserved for illustrative elements — never applied to functional UI chrome (buttons, cards, inputs stay flat and clean so the texture reads as a deliberate, special material).

components:
  nav-pill-dark:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.link}"
    rounded: "{rounded.full}"

  nav-pill-accent:
    backgroundColor: "{colors.accent-yellow}"
    textColor: "{colors.ink}"
    typography: "{typography.link}"
    rounded: "{rounded.full}"

  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.link}"

  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.canvas}"
    typography: "{typography.link}"
    rounded: "{rounded.full}"
    padding: "{spacing.sm} {spacing.xl}"

  brandmark-monogram:
    textColor: "{colors.ink}"
    description: "Condensed 'sT' lockup used in the nav — a compact cousin of the hero wordmark, not a scaled-down version of it."

  hero-wordmark:
    textColor: "{colors.black}"
    description: "Bespoke hand-lettered logotype asset ('STREAMTIME!'). Irregular baseline, thick uneven marker-brush strokes, scaled full-bleed edge-to-edge across the hero. Treated as a one-off illustration, not a reusable type style."

  decorative-shape:
    fillColor: "rotates across {colors.accent-yellow}, {colors.accent-pink}, {colors.accent-lime}, {colors.accent-blue}, {colors.stone}, {colors.charcoal-shape}"
    texture: "{textures.paper-grain}"
    rounded: "{rounded.none}"
    description: "Sunbursts, triangles, circles, squiggles, and capsule/bandage shapes cut from textured flat color. Scattered as brand punctuation around the wordmark and layered into photography."

  quote-panel:
    backgroundColor: "{colors.panel-dark}"
    textColor: "{colors.text-on-dark}"
    typography: "{typography.body-lg}"
    emphasisStyle: underline

  product-screenshot-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    borderColor: "{colors.hairline}"

  feature-row:
    headingTypography: "{typography.title}"
    bodyTypography: "{typography.body-sm}"
    textColor: "{colors.ink}"
    bodyColor: "{colors.text-muted}"

  cta-banner:
    backgroundColor: "{colors.accent-pink}"
    textColor: "{colors.ink}"
    typography: "{typography.heading-1}"

  photo-card:
    rounded: "{rounded.md}"
    captionTypography: "{typography.link}"
    captionColor: "{colors.ink}"

  testimonial-card:
    backgroundColor: "rotates across {colors.stone}, {colors.white}, {colors.accent-yellow}, {colors.accent-lime}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    quoteTypography: "{typography.body}"
    nameTypography: "{typography.title}"
    roleColor: "{colors.text-muted}"
    layout: "staggered, alternating left/right horizontal offset down the page"

  logo-bar:
    backgroundColor: "{colors.panel-dark}"
    headingTypography: "{typography.heading-3}"
    headingColor: "{colors.text-on-dark}"
    logoColor: "{colors.text-on-dark-muted}"

  blog-card:
    rounded: "{rounded.md}"
    imageTreatment: "duotone / grayscale + single accent-color overlay, rotates per card"
    titleTypography: "{typography.body-sm}"
    titleWeight: 700
    authorColor: "{colors.text-muted}"

  footer:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.ink}"
    linkColor: "{colors.text-muted}"
    columnHeadingTypography: "{typography.label}"
    bodyTypography: "{typography.body-sm}"

  # ─── Examples (illustrative) — kit-mirror surfaces referencing brand primitives ───
  ex-pricing-tier:
    description: "Default tier card. Re-uses testimonial-card chrome with brand stone surface."
    backgroundColor: "{colors.stone}"
    textColor: "{colors.ink}"
    borderColor: "{colors.hairline}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  ex-pricing-tier-featured:
    description: "Featured tier — polarity-flipped panel-dark surface, matching the quote-panel and logo-bar treatment."
    backgroundColor: "{colors.panel-dark}"
    textColor: "{colors.text-on-dark}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  ex-product-selector:
    description: "Feature-summary card — re-purposed for SaaS / B2B verticals (NOT a literal product gallery)."
    backgroundColor: "{colors.accent-yellow}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  ex-cart-drawer:
    description: "Subscription / line-item summary — re-purposed for SaaS / B2B (not a literal cart)."
    backgroundColor: "{colors.white}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
    item-divider: "{colors.hairline}"
  ex-app-shell-row:
    description: "Sidebar nav row inside an App Shell example. Active state uses accent-pink as the indicator."
    backgroundColor: "{colors.canvas}"
    activeIndicator: "{colors.accent-pink}"
    rounded: "{rounded.sm}"
    padding: "{spacing.xs} {spacing.md}"
  ex-data-table-cell:
    description: "Default data-table th + td chrome. Header uses bold label typography; body uses body-sm."
    headerBackground: "{colors.canvas-warm}"
    headerTypography: "{typography.label}"
    bodyTypography: "{typography.body-sm}"
    cellPadding: "{spacing.sm} {spacing.md}"
    rowBorder: "{colors.hairline}"
  ex-auth-form-card:
    description: "Sign-in / sign-up card. Re-uses testimonial-card chrome on a warm canvas fill."
    backgroundColor: "{colors.canvas-warm}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  ex-modal-card:
    description: "Modal dialog surface — same chrome as product-screenshot-card with a soft lift shadow."
    backgroundColor: "{colors.white}"
    rounded: "{rounded.lg}"
    padding: "{spacing.lg}"
  ex-empty-state-card:
    description: "Empty-state illustration frame — a natural home for a scattered decorative-shape cluster."
    backgroundColor: "{colors.canvas-warm}"
    rounded: "{rounded.md}"
    padding: "{spacing.xxl}"
    captionTypography: "{typography.body}"
  ex-toast:
    description: "Toast notification surface — accent-lime fill, testimonial-card shape."
    backgroundColor: "{colors.accent-lime}"
    rounded: "{rounded.md}"
    padding: "{spacing.sm} {spacing.md}"
    typography: "{typography.body-sm}"

---

## Overview

Streamtime is a project-management tool for creative businesses, and its marketing site reads like a designer's collage board rather than a software product page. Where a system like Mobbin's disappears behind its content, Streamtime's chrome *is* the content: a giant bespoke hand-lettered wordmark (`hero-wordmark`), a scatter of torn-paper sunbursts and squiggles (`decorative-shape`), and a rotating four-color accent palette that appears on nearly every scroll-stop rather than being rationed.

The page is built as a stack of alternating full-bleed "acts": a light cream hero, a near-black collage panel (`quote-panel`), a light product-screenshot section, a flat pink `cta-banner`, a light photo section, a warm beige testimonial field, a near-black `logo-bar`, and a light footer. Each panel swap is a hard color cut, not a gradient — the rhythm itself communicates section boundaries in place of dividers or cards-on-cards.

Texture is the other signature move: the decorative shapes (stars, triangles, circles, capsules) are rendered with a visible paper/fabric grain (`{textures.paper-grain}`), giving flat vector color a handmade, cut-and-pasted feel. That texture is deliberately absent from functional chrome — buttons, screenshot frames, and cards stay clean and flat — so it reads as illustration, not a global filter.

**Key Characteristics:**
- A bespoke, hand-lettered display wordmark (`hero-wordmark`) used once, at enormous scale, and never as a body typeface
- Paper/fabric-textured decorative shapes (`decorative-shape`) — sunbursts, triangles, squiggles, capsules — scattered as brand punctuation, not confined to a hero
- A rotating four-color accent palette (`{colors.accent-yellow}`, `{colors.accent-pink}`, `{colors.accent-lime}`, `{colors.accent-blue}`) spent generously, the opposite of a single-scarce-accent system
- Full-bleed panel alternation between warm cream (`{colors.canvas}`) and near-black (`{colors.panel-dark}`) as the primary structural device
- Chunky stadium-pill buttons (`{rounded.full}`) in flat ink or a single bright accent, no gradients or outlines on primary CTAs
- Staggered, alternating-offset testimonial cards (`testimonial-card`) in rotating solid colors instead of a uniform grid
- Grayscale or duotone photography treatment that keeps imported photos inside the brand's color logic rather than running full-color

## Colors

Source page: marketing homepage.

### Ink & Panel
- **Ink** (`{colors.ink}` — #18130F): Primary text color and the fill for the wordmark, monogram, and dark button chrome. A warm near-black, not a pure #000.
- **Panel Dark** (`{colors.panel-dark}` — #211C17): The full-bleed dark background used for the "productive wellbeing" collage section and the brand logo bar — Streamtime's polarity-flip surface, playing the same structural role a dark footer plays in more minimal systems, but used mid-page as a section, not just at the close.

### Accent Palette
- **Marigold Yellow** (`{colors.accent-yellow}` — #F2C230): The "Book a demo" nav pill and one recurring testimonial-card fill.
- **Hot Pink** (`{colors.accent-pink}` — #F23DAE): The flat full-bleed CTA banner background ("Ready to work well?") — the single boldest color move on the page.
- **Lime** (`{colors.accent-lime}` — #CBDA2E): A testimonial-card fill and a recurring decorative-shape color.
- **Periwinkle Blue** (`{colors.accent-blue}` — #6478E0): Used almost exclusively inside decorative shapes (the capsule/"bandage" form in the dark panel), rarely as a surface fill.
- Unlike a single reserved accent, these four rotate freely across shapes, cards, and photo treatments — abundance, not scarcity, is the signal.

### Surface
- **Canvas** (`{colors.canvas}` — #FAF6ED): Default light background — hero, product screenshots, photo section, footer.
- **Canvas Warm** (`{colors.canvas-warm}` — #EDE1C7): The deeper beige field behind the staggered testimonials, one step warmer than canvas to help the colorful cards float.
- **Stone** (`{colors.stone}` — #C7B79C): A muted taupe used for one testimonial-card fill and several decorative shapes — the palette's "neutral" that still carries warmth and texture rather than reading as gray.
- **Hairline** (`{colors.hairline}` — #E4DBCB): Faint dividers and screenshot-card borders on light backgrounds.

### Text
- **Ink** / **Ink Soft** (`{colors.ink}` / `{colors.ink-soft}`): Headings and body copy on light surfaces.
- **Muted** (`{colors.text-muted}` — #6E6153): Secondary copy — feature blurbs, testimonial roles, footer links.
- **Faint** (`{colors.text-faint}` — #A79C8C): Tertiary/fine print.
- **On Dark** / **On Dark Muted** (`{colors.text-on-dark}` / `{colors.text-on-dark-muted}`): Text and logo treatments inside `panel-dark` sections.

### Semantic
- No dedicated success/warning/error palette appears on marketing surfaces; the accent palette itself carries all emphasis, with pink reserved for the highest-stakes commercial moment (the CTA banner).

## Typography

### Font Family

A geometric grotesk with rounded terminals and notably heavy weights at large sizes — headings render chunky and confident (`heading-1` at 800), while body copy sits at a comfortable regular weight. Presumed family: **Basis Grotesque** or a close relative (General Sans, Aeonik, and Neue Montreal are reasonable substitutes if the exact face is unavailable — match the 400/700/800 weight positions and keep tight line-heights on display sizes).

This system is entirely separate from the **hero wordmark**, which is not a typeface at all but a single hand-lettered logotype asset (see below) — the two never mix on the same line of text.

### Hierarchy

| Token | Size | Weight | Line Height | Use |
|---|---|---|---|---|
| `{typography.heading-1}` | 56px | 800 | 1.05 | CTA banner headline ("Ready to work well?") |
| `{typography.heading-2}` | 40px | 800 | 1.1 | Major section headings |
| `{typography.heading-3}` | 28px | 700 | 1.2 | "Streamtime every step of the way", "Who's already using Streamtime?" |
| `{typography.heading-4}` | 20px | 700 | 1.25 | Sub-headings, card headlines |
| `{typography.title}` | 18px | 700 | 1.3 | Testimonial names, photo-card captions |
| `{typography.body-lg}` | 20px | 400 | 1.5 | Hero tagline, dark-panel pull quote |
| `{typography.body}` | 16px | 400 | 1.5 | Testimonial quotes, general paragraphs |
| `{typography.body-sm}` | 14px | 400 | 1.45 | Footer links, feature blurbs, blog captions |
| `{typography.link}` | 15px | 600 | 1.4 | Nav links, button labels |
| `{typography.label}` | 12px | 700 | 1.3 | Small caps-style tags ("TODAY"), footer column headers |
| `{typography.caption}` | 12px | 500 | 1.3 | Timezone clock list, fine print |

### Principles
- **Weight does the shouting, not size alone.** An 800-weight headline next to 400-weight body copy at a smaller size creates contrast without needing more than one type family.
- **Casual punctuation.** Headlines mix a bare statement ("A way better way of working"), a colon-led list ("Balance your workflow: plan, track, collaborate, thrive"), and a genuine question mark ("Ready to work well?") — no enforced terminal-period rule.
- **Underline as emphasis, not just as link.** Inside the dark pull-quote, "productive wellbeing" is underlined mid-sentence to land the brand's core message, functioning more like a highlighter than a hyperlink.
- **Long, generous line lengths on quotes.** Pull-quote and testimonial text run wide (constrained more by section width than by a narrow reading column), keeping the tone conversational rather than editorial.

### Note on the Wordmark

The "STREAMTIME!" hero lockup is a bespoke hand-lettered/brush asset — thick, deliberately uneven marker strokes, an irregular baseline, and a stylized closing mark. It should be treated as a locked illustration (SVG/image), never rebuilt in a system font; the small `brandmark-monogram` ("sT") used in the nav is a separate, simplified mark, not a scaled-down crop of the hero wordmark.

## Layout

### Spacing System
- **Base unit**: 8px.
- **Tokens**: `{spacing.xxs}` 4px · `{spacing.xs}` 8px · `{spacing.sm}` 12px · `{spacing.md}` 16px · `{spacing.lg}` 24px · `{spacing.xl}` 40px · `{spacing.xxl}` 64px · `{spacing.section}` 96px · `{spacing.section-lg}` 140px
- Buttons are fixed-height pills padded `{spacing.sm} {spacing.xl}`; the generous horizontal padding (wider than a typical pill) is part of the chunky, tactile feel.

### Grid & Container
- Content rides a centered column for text-led moments (hero, CTA banner) and opens to full-bleed for color panels and photo/logo strips.
- The product-screenshot section runs two large mockups side by side; the photo section below the CTA runs a clean 3-up grid (Agencies / In-house Teams / Architects); the blog/resources section closes on a 4-up card grid.
- Testimonials break the grid deliberately: cards vary in width and alternate left/right horizontal offset down the page rather than aligning to a column.

### Rhythm: Color Blocking as Structure
Instead of whitespace alone separating sections, Streamtime alternates hard-edged full-bleed color panels — cream, near-black, cream, hot pink, cream, warm beige, near-black, cream — as its primary rhythm device. Each panel transition is an instant color cut with no gradient or border, so scrolling the page feels like flipping through colored paper stock. Within a panel, `{spacing.section}`–`{spacing.section-lg}` of internal padding keeps content from touching the color-cut edges.

### Responsive Strategy

#### Breakpoints (estimated)
| Name | Width | Key Changes |
|---|---|---|
| xl | 1280px | Default desktop grid; hero wordmark spans full container width |
| lg | 1024px | Screenshot mockups stack; photo 3-up holds |
| md | 768px | Photo grid and blog grid drop to 2-up; testimonial stagger reduces offset |
| sm | 640px | Single-column throughout; hero wordmark scales down and may wrap |
| xs | 480px | Nav collapses to logomark + single CTA pill; footer columns stack fully |

#### Touch Targets
- All pill buttons and nav CTAs are fixed-height stadium shapes, comfortably touch-friendly.
- The large decorative shapes are non-interactive illustration only — no touch targets are embedded in them.

#### Collapsing Strategy
- The staggered testimonial layout collapses to a single centered column on narrow viewports, losing the alternating offset but keeping the rotating card colors.
- The two-mockup product-screenshot section stacks vertically rather than scaling both mockups down side by side, keeping UI details legible.
- The dark collage panel's three-column layout (photo / photo / quote / photo) stacks to one column, with decorative shapes repositioned rather than dropped, since they carry brand personality.

#### Photography & Imagery Treatment
- Team/office photography in the 3-up "Designed for creative businesses" section runs full color with `{rounded.md}` corners.
- Testimonial avatars are small circles with a colored emoji/reaction-style icon rather than a plain headshot in most cards.
- Blog/resource card imagery is processed in duotone or grayscale-plus-single-accent (a pink-tinted hand photo, a yellow-tinted illustration, a blue-tinted paper texture), keeping every photo inside the four-color accent system.

## Elevation & Depth

| Level | Treatment | Use |
|---|---|---|
| 0 | Flat on `{colors.canvas}` or `{colors.panel-dark}` | Default — most of every section |
| 1 | Solid accent or stone fill, no border | `testimonial-card`, `nav-pill-accent` |
| 2 | Soft lift shadow | Floating `testimonial-card`s and `product-screenshot-card`s that need to visually separate from a busy background |
| Inverse | `{colors.panel-dark}` fill, `{colors.text-on-dark}` text | `quote-panel`, `logo-bar` |

Depth here comes from color contrast and overlap, not a shadow system. Decorative shapes stack directly on top of photography and on top of each other (a circle behind a triangle behind a squiggle) to imply layering, and the staggered testimonial cards use their alternating horizontal offset — not elevation — to create visual movement down the page. The one consistent shadow use is a soft lift under floating cards that sit directly on a busy or textured background, purely for legibility.

### Decorative Depth
- **Paper-cutout layering** — every `decorative-shape` looks physically layered, like cut paper or fabric pinned to a board, reinforced by the grain texture and by shapes partially overlapping photography.
- **Staggered stagger** — the testimonial section's alternating left/right card placement is the page's main "depth" device outside the collage panel, giving a flat beige field a sense of scattered, human arrangement.
- **Full-bleed color as a stage** — the near-black panels function like a stage backdrop, making the textured shapes and light-colored photography inside them pop forward.

## Shapes

### Border Radius Scale

| Token | Value | Use |
|---|---|---|
| `{rounded.none}` | 0px | Decorative shapes (custom cut paths), full-bleed marquee/photo strips |
| `{rounded.sm}` | 12px | Small chips, app-shell rows |
| `{rounded.md}` | 20px | Photo cards, testimonial cards, blog cards |
| `{rounded.lg}` | 32px | Product-screenshot mockup containers |
| `{rounded.full}` | 9999px | Every button, every pill |

### Decorative Shape Language
- **Sunbursts** — jagged, scribble-edged star/flower shapes in yellow, stone, and white; the most repeated motif, echoing a hand-drawn asterisk.
- **Triangles & circles** — simple geometric primitives in solid textured color, used as connective tissue between photos and text.
- **Squiggles / zigzags** — a hand-drawn wavy line, usually white, layered over a solid shape for extra energy.
- **Capsules ("bandage" shapes)** — elongated stadium forms (blue, pink) that echo the button pill radius but at illustration scale.
- All decorative shapes carry `{textures.paper-grain}` — a visible fiber/grain finish that distinguishes them from the flat, clean fills used on functional UI.

### Photography & Imagery Geometry
- Team and office photography sits in `{rounded.md}` frames, full color, no texture overlay.
- Curator/testimonial avatars are small `{rounded.full}` circles, occasionally paired with a colored reaction icon instead of a logo badge.
- Blog card imagery is duotone/grayscale-plus-accent inside `{rounded.md}` frames, keeping photography inside the brand's four-color logic even when the source photo wasn't shot on-brand.

## Components

### Buttons

**`nav-pill-dark`** — "Menu"
- Fill `{colors.ink}`, label `{colors.canvas}` in `{typography.link}`, `{rounded.full}`

**`nav-pill-accent`** — "Book a demo"
- Fill `{colors.accent-yellow}`, label `{colors.ink}`, `{rounded.full}` — the one accent-filled nav element, marking it as the primary commercial action

**`nav-link`** — "Log in", "Sign up" (top nav)
- Text-only, `{colors.ink}`, `{typography.link}`, no fill or border

**`button-primary`** — "Sign up" (CTA banner)
- Fill `{colors.ink}`, label `{colors.canvas}`, `{rounded.full}`, generous horizontal padding — sits confidently on the hot-pink banner by staying pure black-on-white rather than trying to compete in color

### Panels & Banners

**`quote-panel`** — the dark collage section
- `{colors.panel-dark}` fill, `{colors.text-on-dark}` text in `{typography.body-lg}`, houses photography and `decorative-shape`s alongside a left-aligned pull quote with an underlined closing phrase

**`cta-banner`** — "Ready to work well?"
- Full-bleed `{colors.accent-pink}` fill, `{colors.ink}` headline in `{typography.heading-1}`, paired with a single `button-primary`

**`logo-bar`** — "Who's already using Streamtime?"
- Full-bleed `{colors.panel-dark}` fill, centered `{typography.heading-3}` heading in `{colors.text-on-dark}`, followed by a row of partner wordmarks in a muted light tone

### Cards & Containers

**`product-screenshot-card`**
- `{colors.white}` fill, `{rounded.lg}` corners, thin `{colors.hairline}` border; frames an embedded product UI (kanban board, budget dashboard) at near-native scale rather than a cropped thumbnail

**`testimonial-card`**
- Fill rotates across `{colors.stone}`, `{colors.white}`, `{colors.accent-yellow}`, `{colors.accent-lime}`; `{rounded.md}` corners; quote in `{typography.body}`, name in `{typography.title}`, role in `{colors.text-muted}` `{typography.caption}`
- Staggered alternating left/right placement down a `{colors.canvas-warm}` field — no two adjacent cards share a color or alignment

**`photo-card`**
- `{rounded.md}` image, single-line `{typography.link}` caption below (e.g. "Agencies", "Architects") — no overlay text on the photo itself

**`blog-card`**
- `{rounded.md}` duotone/grayscale image, bold `{typography.body-sm}` title, author byline in `{colors.text-muted}`

### Navigation

**`brandmark-monogram`** — Top Nav (Desktop & Mobile)
- Compact "sT" mark, left-aligned, paired with `nav-pill-dark` ("Menu") immediately beside it; utility links and CTAs sit right-aligned

### Signature Components

**`hero-wordmark`** — the full-bleed "STREAMTIME!" hand-lettered logotype anchoring the hero, surrounded by a loose row of `decorative-shape`s at its base

**`decorative-shape`** — the recurring sunburst/triangle/circle/squiggle/capsule vocabulary, textured and rotated across the accent palette, used as connective punctuation throughout the page rather than confined to one hero moment

**`feature-row`** — the short label-plus-blurb row under the product screenshots ("Manage schedules, track time...", "Report on work in progress...") — no icons, just `{typography.title}` micro-headings over `{typography.body-sm}` copy

### Examples (illustrative)

> Kit-mirror demonstration surfaces. Each `ex-*` entry references brand-native primitives via token syntax so downstream consumers re-skin the same 10 surfaces consistently; none carries invented literal values.

**`ex-pricing-tier`** — Default tier card. Re-uses testimonial-card chrome with brand stone surface.
- Properties: `backgroundColor`, `textColor`, `borderColor`, `rounded`, `padding`

**`ex-pricing-tier-featured`** — Featured tier — polarity-flipped panel-dark surface, matching the quote-panel and logo-bar treatment.
- Properties: `backgroundColor`, `textColor`, `rounded`, `padding`

**`ex-product-selector`** — Feature-summary card — re-purposed for SaaS / B2B verticals (NOT a literal product gallery).
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-cart-drawer`** — Subscription / line-item summary — re-purposed for SaaS / B2B (not a literal cart).
- Properties: `backgroundColor`, `rounded`, `padding`, `item-divider`

**`ex-app-shell-row`** — Sidebar nav row inside an App Shell example. Active state uses accent-pink as the indicator.
- Properties: `backgroundColor`, `activeIndicator`, `rounded`, `padding`

**`ex-data-table-cell`** — Default data-table th + td chrome. Header uses bold label typography; body uses body-sm.
- Properties: `headerBackground`, `headerTypography`, `bodyTypography`, `cellPadding`, `rowBorder`

**`ex-auth-form-card`** — Sign-in / sign-up card. Re-uses testimonial-card chrome on a warm canvas fill.
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-modal-card`** — Modal dialog surface — same chrome as product-screenshot-card with a soft lift shadow.
- Properties: `backgroundColor`, `rounded`, `padding`

**`ex-empty-state-card`** — Empty-state illustration frame — a natural home for a scattered decorative-shape cluster.
- Properties: `backgroundColor`, `rounded`, `padding`, `captionTypography`

**`ex-toast`** — Toast notification surface — accent-lime fill, testimonial-card shape.
- Properties: `backgroundColor`, `rounded`, `padding`, `typography`

## Do's and Don'ts

### Do
- Let full-bleed color panels — not cards or dividers — carry the primary section rhythm.
- Reserve the hand-lettered `hero-wordmark` for the brand moment only; never set running text in it.
- Rotate the four-color accent palette freely across cards, shapes, and photo treatments rather than rationing it to one hue.
- Apply `{textures.paper-grain}` to decorative illustration only, keeping buttons, inputs, and cards flat and clean.
- Stagger repeating card sets (testimonials) with alternating offset and rotating fill colors instead of a uniform grid.
- Keep every button a `{rounded.full}` stadium pill with generous horizontal padding.
- Process imported photography (blog imagery especially) into duotone or grayscale-plus-accent so it stays inside the brand's color logic.
- Use `{colors.panel-dark}` as a structural "dark act," not just a footer — it can appear mid-page.

### Don't
- Don't rebuild the hero wordmark in a system font — it's a locked illustration asset, not a type style.
- Don't apply paper-grain texture to functional UI chrome; it will muddy legibility and dilute its specialness.
- Don't confine the decorative shapes to the hero — let them recur as connective tissue across sections.
- Don't align repeating testimonial/quote cards to a rigid grid; the alternating stagger is a deliberate signature, not an oversight.
- Don't mix more than one bold accent fill within a single small component (e.g., an accent-pink card with an accent-blue button) — one accent per surface.
- Don't square off pill geometry at small sizes; badges and buttons stay stadium-shaped even when compact.
- Don't let full-color, un-treated photography appear next to the duotone blog imagery — pick one treatment per section and hold it.
- Don't add soft shadows everywhere; reserve lift shadows for cards that genuinely need to separate from a busy or textured background.