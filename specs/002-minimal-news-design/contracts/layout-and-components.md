# Layout and component contract

**Feature**: 002-minimal-news-design  
**Purpose**: Define layout structure and component responsibilities so implementations meet FR-001–FR-009 and SC-001–SC-005.

---

## 1. Public layout

- **Nav**: Present on all public pages; uses design tokens for typography and spacing. On viewports &lt; `--breakpoint-md`, nav may stack or collapse; no horizontal scroll.
- **Main**: Wraps page content; provides horizontal padding (e.g. `--space-md` or `--space-lg`); max width optional (`--content-width`).

**Acceptance**: Same nav and main structure on homepage, news list, blog list, and article pages; typography and spacing consistent (SC-003).

---

## 2. Homepage

- **Lead block**: Exactly one primary item (e.g. latest or featured). Visually dominant (e.g. larger title, more spacing). Uses `--text-size-lead` and spacing tokens.
- **Secondary list**: Items after the lead; list or grid; each item can use `ArticleCard` or equivalent. Clear separation from lead (e.g. `--space-lg`).
- **Empty state**: When no content, show a single minimal message (e.g. “No articles yet”) in the content area; same layout shell and tokens (FR-008).

**Acceptance**: User can identify the main headline/lead within 3 seconds (SC-001); no competing heroes (FR-002).

---

## 3. List page (news / blog)

- **Title**: Optional page title (e.g. “News”, “Blog”) using heading token.
- **List**: Sequence of cards (e.g. `ArticleCard`); consistent spacing (e.g. `--space-md` between cards).
- **Empty state**: Clear message when no items; layout unchanged (FR-008).

**Acceptance**: Sections/content types distinguishable (spec acceptance scenario 2 for US2); consistent with homepage typography and colours (SC-003).

---

## 4. Article page

- **Article container**: Wraps title, metadata, body, comments area. Body width constrained by `--content-read-max`, centred; padding from spacing tokens.
- **Body text**: Uses `--text-size-body`, `--line-height-body`; no horizontal scroll (FR-006, SC-002).
- **Long titles**: Truncate or wrap without breaking layout or overlapping (edge case in spec).

**Acceptance**: Article body is dominant visual area (FR-001); readable at a glance (SC-002).

---

## 5. Components

| Component     | Responsibility | Contract |
|---------------|----------------|----------|
| **ArticleCard** | One item in a list | Uses tokens for title, spacing, border; optional “lead” variant for homepage lead block. |
| **ArticleDetail** | Article body wrapper | Applies `--content-read-max`, body typography tokens, vertical rhythm. |
| **Shared UI** (Button, Card, Input, etc.) | Actions and forms | Restyled to use colour and spacing tokens; no new behaviour required for 002. |

---

## 6. Responsive

- **&lt; breakpoint**: Single column; nav compact/stacked; lead and list stack; article body full-width with horizontal padding.
- **≥ breakpoint**: Optional multi-column for list or sidebar; article body still max `--content-read-max`.

**Acceptance**: No overlapping content or unreadable text from 320px to large desktop (SC-005).
