# Data model: Minimal news design (visual system)

**Feature**: 002-minimal-news-design  
**Note**: This feature does not change the database or API. The “model” here describes the **visual system** (design tokens and layout structure) that the UI must follow.

---

## 1. Design tokens (single source of truth)

Tokens are implemented as CSS custom properties (e.g. in `app/globals.css`) and used across layouts and components.

| Token group   | Purpose                          | Example tokens (names illustrative) |
|---------------|----------------------------------|-------------------------------------|
| **Colour**    | Text, background, accent, borders| `--color-text`, `--color-bg`, `--color-accent`, `--color-border` |
| **Typography**| Font families, sizes, weights    | `--font-sans`, `--font-serif`, `--text-body`, `--text-lead`, `--text-card-title`, `--line-height-body` |
| **Spacing**   | Gaps and padding                 | `--space-xs` … `--space-xl` (e.g. 8, 16, 24, 32, 48px) |
| **Layout**    | Widths and breakpoints           | `--content-read-max` (e.g. 65ch), `--breakpoint-md` (e.g. 768px) |

**Validation**: All public pages and shared UI components use these tokens for colour, type, and spacing; no hardcoded colours or ad-hoc font sizes that conflict with the system.

---

## 2. Page layout entities (structure, not storage)

| Layout / area   | Responsibility                                  | Key rules |
|-----------------|--------------------------------------------------|-----------|
| **Root layout** | Global wrapper; optional theme/skip-link         | Minimal; no visual chrome beyond what children need |
| **Public layout** | Nav + `<main>`; semantic landmark              | Nav: compact, consistent spacing; main: full-width container |
| **Homepage**    | Lead block + secondary list                      | One lead (emphasized); then list/grid of items; empty state if no content |
| **List page**   | News or blog list                                | Optional lead or title; then list of cards; empty state |
| **Article page**| Title + body + metadata + comments shell         | Body in constrained width (`--content-read-max`); comfortable vertical rhythm |

---

## 3. Component layout roles

| Component       | Role in visual system                            | Constraints |
|-----------------|---------------------------------------------------|-------------|
| **ArticleCard** | Single item in a list                             | Uses spacing tokens; optional “lead” variant (larger title, more spacing) |
| **ArticleDetail** | Wrapper for article body                         | Max-width from tokens; consistent padding |
| **Nav**         | Site navigation                                   | Uses spacing and typography tokens; accessible and responsive |
| **Empty state** | Message when no items                             | Same typography and spacing as page; no broken layout |

---

## 4. State and responsiveness

- **Viewport**: Layout adapts at a defined breakpoint (e.g. `--breakpoint-md`). Below: single column, stacked nav if needed. Above: optional multi-column or sidebar.
- **Content states**: “Has content” vs “Empty”; both use the same layout shell and tokens; empty shows a clear message (FR-008).
- **Focus/accessibility**: Focus visible using the design system accent (or a dedicated focus token) so style stays consistent.

No persistent “state” is stored; this document describes how the UI should look and behave across viewports and content states.
