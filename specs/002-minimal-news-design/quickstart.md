# Quickstart: Implementing minimal news design

**Feature**: 002-minimal-news-design  
**Audience**: Developer implementing the design  
**Prerequisites**: Codebase from 001-news-website; no backend or API changes.

---

## 1. Define design tokens

- Open `app/globals.css`.
- Add CSS custom properties (see [contracts/design-tokens.md](./contracts/design-tokens.md)) under `:root`:
  - Colours: `--color-text`, `--color-bg`, `--color-accent`, `--color-border`, etc.
  - Typography: `--font-sans`, `--font-serif`, `--text-size-lead`, `--text-size-body`, `--line-height-body`, etc.
  - Spacing: `--space-xs` through `--space-xl`.
  - Layout: `--content-read-max`, `--content-width`, `--breakpoint-md`.
- Set `font-family` and base `font-size` on `body` using these tokens.
- Ensure sufficient contrast (e.g. WCAG AA) for text and interactive elements.

---

## 2. Public layout

- In `app/(public)/layout.tsx`:
  - Apply tokens to the nav (spacing, typography); keep structure semantic (`<nav>`, `<main>`).
  - Add horizontal padding to `main` (e.g. `var(--space-md)` or `var(--space-lg)`).
  - Optionally cap main width with `max-width: var(--content-width)` and centre.
- Make nav responsive: at or below `--breakpoint-md`, ensure it stacks or collapses so there is no horizontal scroll.

---

## 3. Homepage

- In `app/(public)/page.tsx`:
  - Fetch or pass one “lead” item and a list of secondary items (existing data flow).
  - Render one **lead block** (larger title, optional excerpt; use `--text-size-lead` and extra spacing).
  - Below, render secondary items using `ArticleCard` (or equivalent) with consistent gap (e.g. `var(--space-md)`).
  - When there are no items, render a single empty-state message in the same layout; do not leave a blank or broken-looking area.

---

## 4. List pages (news, blog)

- In `app/(public)/news/page.tsx` and `app/(public)/blog/page.tsx`:
  - Optional page title using heading token.
  - List of `ArticleCard` components with spacing from tokens.
  - Empty state when the list is empty (same pattern as homepage).

---

## 5. Article page

- In `app/(public)/news/[slug]/page.tsx` and `app/(public)/blog/[slug]/page.tsx`:
  - Wrap the article body in a container that has `max-width: var(--content-read-max)` and is centred.
  - Apply `--text-size-body` and `--line-height-body` to the body text.
  - Use spacing tokens for gaps between title, metadata, body, and comments.
  - Ensure long titles wrap or truncate without breaking the layout.

---

## 6. Shared components

- **ArticleCard**: Use colour, typography, and spacing tokens; add an optional “lead” variant (e.g. larger title, more padding) for the homepage lead block.
- **ArticleDetail**: Use `--content-read-max` and body typography tokens; consistent vertical spacing.
- **Button, Card, Input, etc.**: Restyle with tokens (colour, spacing, typography) so the whole site feels consistent.

---

## 7. Verify

- **SC-001**: Load homepage; confirm main headline/lead is obvious within a few seconds.
- **SC-002**: Open an article; confirm body is readable (line length, spacing) and no horizontal scroll.
- **SC-003**: Check homepage, one list page, one article page for consistent typography and colours.
- **SC-005**: Resize from ~320px to desktop; confirm no overlapping content or unreadable text.
- **FR-008**: Clear content or use empty DB; confirm empty states show a clear message and layout is intact.

---

## Optional: tests

- E2E (Playwright): Assert presence of lead block on homepage; assert article body has expected max-width or class.
- Snapshot or layout tests: Optional for key layouts to guard against accidental style regressions.

For a detailed task list, run `/speckit.tasks` to generate `tasks.md`.
