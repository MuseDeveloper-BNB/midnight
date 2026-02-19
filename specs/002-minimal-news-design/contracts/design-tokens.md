# Design tokens contract

**Feature**: 002-minimal-news-design  
**Consumer**: All public pages and shared UI components  
**Implementation**: CSS custom properties in `app/globals.css` (or equivalent single source)

---

## Colours

| Token             | Purpose              | Requirement                    |
|-------------------|----------------------|--------------------------------|
| `--color-text`    | Primary body text    | Sufficient contrast on background (WCAG AA) |
| `--color-text-muted` | Secondary text   | Same or lower contrast than primary |
| `--color-bg`      | Page background      | Neutral (e.g. off-white, light grey) |
| `--color-bg-elevated` | Cards, nav background | Distinct from page bg if used |
| `--color-accent`  | Links, primary buttons | Clearly distinct; contrast OK for interaction |
| `--color-border`  | Dividers, card borders | Subtle; consistent use |

---

## Typography

| Token               | Purpose           | Requirement                    |
|---------------------|-------------------|--------------------------------|
| `--font-sans`       | UI, optional body | Readable sans-serif stack      |
| `--font-serif`      | Optional body/headings | Readable serif stack      |
| `--text-size-lead`  | Lead headline     | Largest; one level only        |
| `--text-size-h2`    | Section titles    | Smaller than lead              |
| `--text-size-h3`    | Card/list titles  | Smaller than h2                |
| `--text-size-body`  | Article body      | 16–20px equivalent (1rem–1.25rem) |
| `--text-size-small` | Metadata, captions| Smaller than body              |
| `--line-height-body`| Article body      | ~1.5                           |
| `--line-height-heading` | Headings    | Slightly tighter than body     |

---

## Spacing

| Token        | Suggested | Purpose                    |
|--------------|-----------|----------------------------|
| `--space-xs` | 8px       | Tight inline gaps          |
| `--space-sm` | 16px      | In-section spacing         |
| `--space-md` | 24px      | Between blocks             |
| `--space-lg` | 32px      | Section separation         |
| `--space-xl` | 48px      | Major sections             |

Use a single scale consistently; avoid ad-hoc values that break rhythm.

---

## Layout

| Token                 | Suggested | Purpose                    |
|-----------------------|-----------|----------------------------|
| `--content-read-max`  | 65ch      | Max width of article body  |
| `--content-width`     | 1200px or 90vw | Max width of main content area |
| `--breakpoint-md`     | 768px     | Breakpoint for responsive  |

---

## Usage rules

- All public pages MUST use these tokens for colour, typography, and spacing where applicable.
- New components MUST NOT introduce hardcoded colours or font sizes that conflict with the token set.
- Optional: document actual hex/rem values in `globals.css` or a single theme file so the contract is the single source of truth.
