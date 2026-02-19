# Research: Minimal news design

**Feature**: 002-minimal-news-design  
**Purpose**: Resolve design approach and document decisions for an attractive, minimalist news layout.

---

## 1. Minimalist news layout and hierarchy

**Decision**: Use a single clear lead block on the homepage (one featured article: larger title, optional excerpt, image placeholder), followed by a list or grid of secondary items. No competing heroes; sidebar optional and minimal or omitted for smallest viewports.

**Rationale**: News readers expect “most important first.” One lead reduces cognitive load and supports SC-001 (identify main headline quickly). Multiple heroes dilute hierarchy and conflict with “minimalist” and “uncluttered” (FR-001, FR-002).

**Alternatives considered**:  
- Multiple featured carousels: rejected (noisier, heavier).  
- No lead, flat list only: rejected (weaker hierarchy, less “news” feel).  
- Masonry only: optional for blog; not chosen as default for homepage to keep implementation predictable.

---

## 2. Typography for readability

**Decision**:  
- **Body**: Serif or high-quality sans-serif; size in the 16–20px range (1rem–1.25rem) on a readable line length (45–75 characters per line, ~65ch max-width for article body).  
- **Headings**: Clear scale (e.g. one h1 for lead, h2 for section titles, h3 for card titles); consistent font family across headings.  
- **Line height**: ~1.5 for body, slightly tighter for large headings.

**Rationale**: Matches FR-004 (consistent typography) and FR-006 (comfortable reading). Common readability guidelines (e.g. WCAG, Bringhurst) support these ranges for long-form text.

**Alternatives considered**:  
- Very small base font: rejected (hurts readability).  
- Decorative/display-only fonts for body: rejected (prioritize readability over novelty).

---

## 3. Colour and contrast

**Decision**:  
- Limited palette: one main text colour, one background, one accent (e.g. links, key buttons).  
- Sufficient contrast for text (at least WCAG AA: 4.5:1 for normal text, 3:1 for large text).  
- Neutral background (e.g. off-white or very light grey) for article body to reduce glare; optional dark header/footer for contrast.

**Rationale**: Supports FR-005 (consistent colour, readability) and FR-007 (professional, coherent). Small palette keeps the design minimalist and on-brand.

**Alternatives considered**:  
- Dark mode only: deferred; can be added later using same tokens.  
- Many accent colours: rejected (breaks minimalism and consistency).

---

## 4. Spacing and rhythm

**Decision**:  
- Use a small spacing scale (e.g. 4px base: 8, 16, 24, 32, 48px) and apply it consistently for gaps between sections, cards, and inline spacing.  
- Generous whitespace around main content; compact but clear nav.

**Rationale**: Consistent spacing (FR-004, FR-007) and “minimal set of UI elements” (FR-003). A scale avoids arbitrary values and keeps the layout rhythmic.

**Alternatives considered**:  
- No scale (ad hoc padding/margin): rejected (harder to keep consistent).  
- Very tight spacing everywhere: rejected (reduces readability and “calm” feel).

---

## 5. Responsive behaviour

**Decision**:  
- Mobile-first: single column; nav can collapse to a compact menu or stack.  
- Lead block stacks full-width; secondary items in one column on small screens.  
- From ~768px (or similar): optional two-column for secondary list or sidebar.  
- Article body: max-width (e.g. 65ch) centred on all viewports; horizontal padding so no horizontal scroll.

**Rationale**: FR-009 and SC-005 (usable from 320px to desktop); hierarchy preserved by order and emphasis rather than only by columns.

**Alternatives considered**:  
- Desktop-only design: rejected (spec requires responsive).  
- Many breakpoints: start with one main breakpoint (~768px), add more only if needed.

---

## 6. Empty states

**Decision**:  
- Dedicated empty state for lists (e.g. “No articles yet” or “No news at the moment”) with minimal styling (same typography and spacing as the rest of the page).  
- No broken layouts: same shell (header, main, footer) with a simple message in the content area.

**Rationale**: FR-008 (clear minimal empty state; layout does not appear broken).

**Alternatives considered**:  
- Hiding the section entirely: rejected (empty area can look like a bug).  
- Decorative illustrations: optional; not required for minimal scope.

---

## 7. Implementation approach (CSS)

**Decision**:  
- **Design tokens**: CSS custom properties in `globals.css` for colours, font sizes, spacing, and max-widths.  
- **Layout**: Semantic HTML + utility or component-level classes; flexbox/grid for structure.  
- **No new framework**: Use existing stack (Next.js + current CSS approach). No mandatory Tailwind/CSS-in-JS unless already in project; prefer plain CSS or existing approach to avoid scope creep.

**Rationale**: Single source of truth for tokens supports consistency (FR-004, FR-005, FR-007) and future theming. Aligns with plan (presentation-only, no new backend).

**Alternatives considered**:  
- Tailwind: acceptable if already adopted; not mandated.  
- CSS-in-JS with runtime theme: adds dependency and complexity; deferred unless required.

---

## Summary

| Topic               | Decision summary                                                    |
|---------------------|---------------------------------------------------------------------|
| Hierarchy           | One lead block, then ordered secondary content; no competing heroes |
| Typography          | Readable body (16–20px, ~65ch), clear heading scale, line height ~1.5 |
| Colour              | Limited palette; WCAG AA contrast; neutral background for reading   |
| Spacing             | Small scale (e.g. 4px base); consistent application                 |
| Responsive          | Mobile-first; one main breakpoint; article max-width on all sizes   |
| Empty states        | Explicit minimal message in content area; same shell                |
| CSS                 | Tokens in globals.css; flexbox/grid; no new framework required      |
