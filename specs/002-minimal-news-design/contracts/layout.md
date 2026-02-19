# Layout contract (pages and components)

**Feature**: 002-minimal-news-design  
**Scope**: Public pages and shared content components.

---

## Public layout (shell)

- **Nav**: Present at top; uses design tokens for typography and spacing. On small viewports it MUST remain usable (e.g. stacked or compact menu). Links: Home, News, Blog (and auth links if shown).
- **Main**: Wraps all public page content; full-width container with optional max-width and horizontal padding from tokens. Semantic `<main>`.

---

## Homepage

- **Lead block**: Exactly one primary item (featured article). MUST be visually dominant (e.g. larger title, more spacing). Uses `--text-lead` (or equivalent); uses spacing tokens.
- **Secondary list**: All other items below the lead; list or grid. Each item MUST use the same component (e.g. ArticleCard) and tokens. Order: consistent (e.g. by date).
- **Empty state**: When there are no items, show a single minimal message (e.g. “No articles yet”) inside the same main container; no broken or empty layout.

---

## List pages (e.g. /news, /blog)

- **Title**: Optional page/section heading using token hierarchy.
- **List**: Items rendered with the same card component and tokens. Layout MAY switch from single column to multi-column at `--breakpoint-md`.
- **Empty state**: When there are no items, show a clear minimal message; layout shell unchanged.

---

## Article page (e.g. /news/[slug], /blog/[slug])

- **Title**: Article headline; uses heading token (e.g. `--text-lead` or `--text-h2`).
- **Body container**: Wrapper with `max-width: var(--content-read-max)` (or equivalent token). Centred. Vertical rhythm from spacing tokens.
- **Metadata**: Author/date optional; typography `--text-small`, `--color-text-muted`.
- **Comments**: Same shell and tokens; no change to comment behaviour, only styling.

---

## ArticleCard (list item)

- **Default**: Title, optional excerpt/date; uses `--text-h3` (or card title token), spacing tokens. Clickable area to article.
- **Lead variant** (optional): When used as homepage lead, MAY accept a “lead” prop or class for larger title and extra spacing; still uses tokens.

---

## ArticleDetail (article body wrapper)

- **Width**: Constrained by `--content-read-max`.
- **Padding**: Horizontal and vertical from spacing tokens.
- **Inner content**: Body HTML styled with `--text-body`, `--line-height-body`; no horizontal overflow.

---

## Verification

- Acceptance tests MAY assert: presence of one lead on homepage; max-width on article body; empty state message when list is empty; nav visible and responsive at small viewport.
