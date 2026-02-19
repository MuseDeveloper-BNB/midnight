# Implementation Plan: Minimal news design

**Branch**: `002-minimal-news-design` | **Date**: 2025-01-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-minimal-news-design/spec.md`

## Summary

Apply an attractive, minimalist visual design to the existing Midnight News site so that primary content is the main focus, hierarchy is clear (lead + secondary), and typography, colour, and spacing are consistent and appropriate for a news product. **Deliverable is production-ready**: all user stories (P1–P3), polish, and production-readiness checks (accessibility, no placeholders, sign-off) must be complete before release—no MVP-only scope. Implementation is limited to presentation layer (styles, layout, and shared UI components) without changing business logic, APIs, or data model. Decisions are documented in research.md; visual system and layout rules are captured in data-model.md and contracts.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20.x LTS (same as 001-news-website)  
**Primary Dependencies**: Next.js 14+ (App Router), React 18+, existing Prisma/NextAuth stack; CSS (globals + module/utility as chosen)  
**Storage**: N/A for this feature (no schema or API changes)  
**Testing**: Existing Jest, React Testing Library, Playwright; add visual/layout assertions where needed for acceptance criteria  
**Target Platform**: Web (modern browsers); responsive from ~320px to large desktop  
**Project Type**: Web application (extend existing Next.js app)  
**Performance Goals**: No regression in LCP; main headline/lead visible within 3s (SC-001)  
**Constraints**: Presentation-only changes; no new backend; separation of concerns (styles/layout in UI layer)  
**Scale/Scope**: Public pages (homepage, news list, blog list, article view); auth/admin may reuse design system later

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Clean, Readable, and Maintainable Code
- Design implementation uses a single source of truth for tokens (e.g. CSS variables or shared theme) and clear naming for layout/semantic classes.

### ✅ Principle II: Separation of Concerns (NON-NEGOTIABLE)
- All changes are in presentation layer: `app/globals.css`, layout components, and shared UI/components. No business logic, services, or API changes.

### ✅ Principle III: Role-Based Access Control (NON-NEGOTIABLE)
- No change; permission checks and role-based UI remain as implemented in 001. Design only affects how allowed content is presented.

### ✅ Principle IV: Predictable Behavior Over Clever Solutions
- Layout and styling use standard CSS (flexbox/grid, media queries); no non-standard or fragile hacks.

### ✅ Principle V: Data Integrity Over Speed
- N/A (no data layer changes).

### ✅ Principle VI: Content Validation and Sanitization (NON-NEGOTIABLE)
- No change; existing validation and sanitization remain. Styling must not introduce XSS (e.g. no unsanitized HTML in styles).

### ✅ Principle VII: Audit Visibility for Editors and Admins
- No change.

### ✅ Principle VIII: Testable Business Logic (NON-NEGOTIABLE)
- No new business logic. Layout/visual acceptance can be covered by E2E or snapshot tests where valuable.

### ✅ Principle IX: Acceptance Criteria Before Features
- Spec defines acceptance scenarios and success criteria; implementation tasks will map to them.

### ✅ Principle X: Future Scalability Considerations
- Design tokens and component structure allow consistent extension to auth/admin UIs and new page types.

### Security & Permissions, Content Moderation, Non-Goals
- No changes to security, permissions, or moderation. Non-goals unchanged.

## Project Structure

### Documentation (this feature)

```text
specs/002-minimal-news-design/
├── plan.md              # This file
├── research.md          # Phase 0: design decisions and rationale
├── data-model.md        # Phase 1: visual system / design tokens (no DB)
├── quickstart.md        # Phase 1: implementation steps
├── contracts/           # Phase 1: design contracts (tokens, layout, components)
└── tasks.md             # Phase 2: created by /speckit.tasks
```

### Source Code (repository root)

No new top-level directories. Changes are confined to:

```text
app/
├── globals.css                    # Design tokens (variables), base typography, layout defaults
├── layout.tsx                     # Root layout (optional wrapper for theme)
└── (public)/
    ├── layout.tsx                 # Nav + main structure; semantic layout classes
    ├── page.tsx                   # Homepage: lead + secondary hierarchy
    ├── news/
    │   ├── page.tsx               # News list layout
    │   └── [slug]/page.tsx        # Article layout, reading width
    └── blog/
        ├── page.tsx               # Blog list layout
        └── [slug]/page.tsx        # Article layout

components/
├── ui/                            # Shared primitives (Button, Card, Input, etc.) – restyle to tokens
└── content/
    ├── ArticleCard.tsx            # Card layout for lists; optional lead variant
    └── ArticleDetail.tsx          # Article body container (max-width, spacing)
```

**Structure Decision**: Same as 001-news-website. This feature only updates existing `app/` and `components/` with new styles and layout structure; no new backend or services.

## Complexity Tracking

No constitution violations. This section is empty.
