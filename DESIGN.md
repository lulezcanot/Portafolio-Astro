---
name: Portafolio Luis Lezcano Tirado
description: Despacho, el banco de empaque de una tienda online. Campo naranja de cinta, etiqueta de cartón troquelado, tinta térmica y una caja 3D que se pliega, se etiqueta y se sella.
colors:
  tape: "#ff5a1f"
  tape-deep: "#e8430b"
  board: "#f3f2ec"
  board-dim: "#d9d7cd"
  ink: "#111111"
  ink-soft: "#2a2927"
  film: "#2f5bff"
  film-light: "#8aa4ff"
  error: "#a3200c"
  error-border: "#b3260f"
  error-wash: "#fff4f0"
typography:
  display:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(3rem, 1.5rem + 6.4vw, 6rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(2.6rem, 1.6rem + 4.2vw, 5rem)"
    fontWeight: 900
    lineHeight: 0.88
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Big Shoulders Display, Arial Narrow, sans-serif"
    fontSize: "clamp(1.25rem, 1.1rem + 0.7vw, 1.65rem)"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "0.01em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.96rem + 0.2vw, 1.125rem)"
    fontWeight: 500
    lineHeight: 1.55
  label:
    fontFamily: "B612 Mono, ui-monospace, monospace"
    fontSize: "clamp(0.78rem, 0.74rem + 0.18vw, 0.875rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "0.02em"
rounded:
  none: "0"
  dot: "50%"
spacing:
  gutter: "clamp(1.25rem, 4vw, 3.5rem)"
  xs: "0.4rem"
  sm: "0.8rem"
  md: "1.6rem"
  lg: "2.4rem"
  section: "clamp(4.5rem, 9vw, 7rem)"
components:
  tape-button:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.board}"
    typography: "{typography.title}"
    rounded: "{rounded.none}"
    padding: "1rem 1.6rem 1.35rem"
  tape-button-hover:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
  nav-cv-cell:
    backgroundColor: "{colors.tape}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "0.6rem 1rem"
  nav-cv-cell-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.board}"
  ticket:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
  ticket-bar:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.board}"
    typography: "{typography.label}"
    padding: "0.5rem 1rem"
  chip-stack:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.2rem 0.55rem"
  field-input:
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "0.7rem 0.8rem"
  status-badge:
    backgroundColor: "{colors.board}"
    textColor: "{colors.ink}"
    typography: "{typography.label}"
    padding: "0.45rem 0.8rem"
---

# Design System: Portafolio Luis Lezcano Tirado

## Overview

**Creative North Star: "Despacho"**

The site is the packing bench of an online store. A tape-orange field is the committed ground; die-cut board labels, thermal-ink type and a single pallet-film blue sit on it as the objects of the bench. A persistent WebGL box (Three.js, orthographic) lies flat, folds, closes and seals as the visitor scrolls, driven by the `[data-box]` slots in each section. Everything else is label, ticket, barcode and perforation: the page reads as a shipment being prepared.

The system is flat, hard-edged and ruled. Depth comes from 2-4px ink borders, black bars on white cards, and a dark perforated seam, never from rounding or glass. Density is generous at display scale (one huge condensed word per section) and tight at data scale (mono label rows, dashed field rules). The system rejects the dark neon developer portfolio and the glass card.

**Key Characteristics:**
- Tape orange is the ground of hero, casos and contacto; ink is the ground of Stack; board is only ever an object on the ground.
- Zero border radius everywhere except the status dot and the browser scrollbar thumb.
- Condensed uppercase display + proportional grotesque body + mono for label data only.
- Sections meet at scalloped perforations (the seam), the upper color biting into the lower.
- Sticky pinned ticket stack for casos on large screens with motion; a plain list otherwise.
- All shipping covers and project stamps are provisional authored material, meant to be replaced by real screenshots.

## Colors

A two-field palette: loud tape orange and thermal black, with off-white board as the only light object and one cold blue held back for state.

### Primary
- **Packing Tape Orange** (`tape`): page ground in hero, casos and contacto; the CV nav cell; the active nav underline; marquee text on ink; the stripe on tape buttons; focus-field underline. Text on it is always ink.
- **Tape Deep** (`tape-deep`): caret color and radio focus ring only. Never a fill.

### Secondary
- **Pallet-Film Blue** (`film`): status dot, external links (`Código`), success lines in the form log, and the blue strip on the poster box. Used on board, never as a field. `film-light` exists for ink grounds and is not yet used by the build.

### Neutral
- **Die-Cut Board** (`board`): ticket and slip surfaces, nav bar, status badge, text on ink. 
- **Board Dim** (`board-dim`): defined for shaded faces; light use.
- **Thermal Ink** (`ink`): all text on tape and board, every border, bar and rule, the Stack section ground, selection background.
- **Ink Soft** (`ink-soft`): disabled/in-progress submit button only.
- **Error trio** (`error`, `error-border`, `error-wash`): invalid field border, wash and message text. Authored in the form only.

### Named Rules
**The Committed Field Rule.** Orange is a ground, not an accent. Sections are either orange, ink or board; do not sprinkle orange chips on a white page.
**The Cold Blue Rule.** Film blue appears only for state and links on board. If blue is the loudest thing on a screen, it is wrong.
**The Ink-On-Tape Rule.** Text on orange is ink, never white; white-on-orange fails contrast.

## Typography

**Display Font:** Big Shoulders Display (800, 900; fallback Arial Narrow, sans-serif)
**Body Font:** Archivo (400, 500, 700; fallback system-ui, sans-serif)
**Label/Mono Font:** B612 Mono (400, 700; fallback ui-monospace)

**Character:** A condensed shipping-crate grotesque shouting section names, a plain readable body, and a cockpit-legible mono that behaves like thermal-printer output. Fonts load through the Astro Fonts API (fontsource) into `--font-display`, `--font-body`, `--font-label`.

### Hierarchy
- **Display** (900, `--step-4`, clamp 3rem to 6rem, line-height 0.88-0.92): hero name, section titles Casos and Hablemos, marquee. Uppercase, balanced wrap.
- **Headline** (900, `--step-3`, clamp 2.6rem to 5rem, 0.88): section title Stack and the pinned Casos title on desktop.
- **Title** (800-900, `--step-1` to `--step-2`, line-height 1): hero facts column, ticket index, group names, recipient line; ticket titles scale to clamp 2.2rem to 3.8rem at 0.9. Buttons use display face at 1.55-1.65rem, 900.
- **Body** (500, `--step-0` 1rem to 1.125rem, 1.55): summaries and prose; ticket summaries cap at 52ch, `--measure` is 62ch.
- **Label** (B612 Mono 400, `--step--1`, +0.02em, uppercase, tabular slashed-zero): `.data` class; ticket bars, field names, stack chips, status. Bars and badges use 700 with 0.1em tracking.

### Named Rules
**The Data-Only Mono Rule.** B612 Mono carries measurements, codes, field labels and chips. Never prose, never headings.
**The One Display Face Rule.** Every heading is Big Shoulders uppercase; sizes come from the `--step-*` scale, not ad hoc.

## Layout

A 82rem centered column inside a fluid gutter (`clamp(1.25rem, 4vw, 3.5rem)`). Hero is a 7fr/5fr grid (copy left, box slot right); casos is 4fr/8fr (title, index and box left, tickets right); contacto is 5fr/7fr (channels left, slip right). Section padding runs clamp(4.5rem, 9vw, 7rem); the hero is `min-height: 100svh`. The hero name is a ruled table: three 4px ink rows (name left, role / stack / city right), the row height equals 0.92 of the display step.

Breakpoints observed: 900px (hero, casos, contacto and stack collapse to one column; box moves above hero copy), 820px (nav links become a Menú toggle and sheet), 560px (stack single column, slip bar sheds its second cell), and 600px height (pinned casos is disabled below it). Pinned casos requires width >= 901px, height >= 600px and no reduced motion; section height is `100svh + (n-1) * 70svh`, tickets stack absolutely and are replaced by scroll. Otherwise tickets flow as a plain list, the index and box slots are hidden and mobile ticket stamps are dropped.

Spacing is rule-driven: gaps of 0.4 / 0.8 / 1.6 / 2.4rem, borders of 2px (fields, chips), 3px (rows, tickets), 4px (hero table, marquee).

## Elevation & Depth

Flat by default; depth is built from ink borders and hard color blocks. The only shadows are soft, low-contrast drop grounds under floating paper: the nav (`0 6px 18px -8px rgb(17 17 17 / 0.45)`), tickets (`0 18px 34px -22px rgb(17 17 17 / 0.7)`) and the contact slip (`0 22px 40px -26px rgb(17 17 17 / 0.8)`). No hard offset shadows, no glow except the status dot's pulse ring in film blue. The persistent box canvas is the one true depth object.

### Named Rules
**The Paper On Bench Rule.** A shadow only says "this paper lies on the bench": long, negative-spread, bottom-weighted. Never colored, never offset-block.

## Shapes

Square. Radius is 0 on every button, card, chip, field and bar; the single circle is the status dot. Shape comes from borders, perforation and clipping. The seam is a row of 24px scallops (radial-gradient circles, 8.5px radius) biting the next section. The button signature is a 0.4rem diagonal-stripe tape band (135deg, tape and ink, 4px each) on the bottom edge. Ticket headers and the slip header are solid ink bars; row separators are solid (index, channels) or dashed (ticket fields, seen index entries).

## Components

### Buttons
- **Shape:** square, ink fill, board text, display face 900 uppercase (1.55-1.65rem), padding `1rem 1.6rem 1.35rem` with the tape stripe on the bottom edge.
- **Hover (pointer devices only):** inverts to board with ink text and a 3px inset ink outline; the arrow nudges 4px. **Active:** scale 0.97 at 120ms. **Disabled/progress:** `ink-soft`.
- **Text link:** bold underlined inherit color (`Escríbeme`).
- **Go link (ticket):** small ink block, hover tape fill with ink text; external link `Código` in film blue.

### Tickets (casos)
- Board surface, 3px ink border, square, soft paper shadow. Header bar `Bulto n/N` and year in mono on ink. Body: display title (whole-card link), summary beside a ProjectMark stamp, a three-field dl with dashed rules (Remitente, Rol, Contenido), mono stack chips. Foot: barcode with LLT code and the go link.
- **Print behavior:** the active ticket body reveals in 16 steps over 780ms (`steps(16)`), like a thermal printer. Seen tickets in the index stay at 0.72 opacity with a dashed rule (a stub); active index entry is ink with a 0.55rem shift.

### Navigation
- Fixed floating strip, centered, 60rem max, board background with a 2px ink border. Left: LLT ink mark plus name. Middle: four to five text links with a tape underline that scales in on hover and for the current section (`aria-current`). Right: a tape-orange CV cell (mono, 0.1em) that inverts on hover. At 820px the links fold into a Menú toggle opening a clip-path sheet of display-face rows; the last row (Descargar CV) is ink.

### Chips
- Mono bold, 2px ink border (board border on ink ground), no fill, no radius. Used for stack and skill groups; radio options in the contact form use the same chip, filled ink when checked.

### Inputs / Fields
- Mono label above (0.7 opacity), transparent 2px ink box, 0 radius. **Focus:** white fill and an inset 5px tape underline. **Error:** `error-border` border, `error-wash` fill, message in `error` bold. Form feedback prints as mono lines revealed in 12 steps (`steps(12)`); success lines are film blue, errors are `error`.

### Contact slip
- Board paper with an ink header bar (`Despacho de mensaje`, destination city), a recipient line in display face, and the tape-stripe submit button next to a barcode. Channel rows are 3px-ruled, flip to ink on hover with an inline shift.

### Hero name table
- Three ruled rows: name lines left, role / stack / city right, built as a repeating ink rule at row height. Lines reveal with a 760ms upward slide, 70ms stagger.

### Barcode and ProjectMark
- Barcodes are seeded black bars with a mono code; ProjectMark stamps are provisional authored marks and should be swapped for real project screenshots.

### Persistent box
- Fixed WebGL canvas. Slots carry `data-fold`, `data-close`, `data-seal`, `data-ry`, `data-size`; an SVG poster of the folded box shows as the no-WebGL fallback and fades out when `data-scene="ready"`.

### Motion
- `--ease-out` cubic-bezier(.23, 1, .32, 1) for everything; no ease-in on UI. `--dur-press` 120ms, `--dur-ui` 200ms, `--dur-reveal` 560ms; reveals rise 18px with a 60ms stagger. View transitions between pages are 260ms. Reduced motion shows content immediately, stops the marquee and print animations and drops the pinned stack.

## Do's and Don'ts

### Do:
- **Do** put ink text on tape orange and board; invert (board on ink) for the Stack section.
- **Do** keep every surface square and bounded by a 2-4px ink rule.
- **Do** use Big Shoulders uppercase for every heading, mono only for data labels and chips.
- **Do** end a section with the perforated seam coloring the section above into the one below (`--seam` set to the upper color).
- **Do** gate hover effects behind `(hover: hover) and (pointer: fine)` and give every press `scale(0.97)` at 120ms.
- **Do** keep content readable without WebGL and with reduced motion.
- **Do** print status the way a label printer would: stepped line reveals, not toast or alert components.

### Don't:
- **Don't** use dark-mode neon, glass cards, gradient text or rounded corners.
- **Don't** use film blue as a background field or for headings.
- **Don't** use offset hard shadows or colored glows; the only shadow is the soft paper-on-bench drop.
- **Don't** put white or board text on tape orange.
- **Don't** set prose or headings in the mono face.
- **Don't** treat the current provisional ProjectMark stamps and covers as final art.
