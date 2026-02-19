# Tasks: Minimal news design

**Input**: Design documents from `/specs/002-minimal-news-design/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md  
**Target**: **Production-ready** application — all phases are required; no MVP-only scope.

**Tests**: Not required by spec; optional E2E/snapshot tasks listed in Polish phase.

**Organization**: Tasks grouped by user story so each story can be implemented and verified independently.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story (US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared infrastructure)

**Purpose**: Verify existing structure; no new packages or backend.

- [x] T001 Verify project structure: app/globals.css, app/(public)/layout.tsx, app/(public)/page.tsx, components/content/ArticleCard.tsx, components/content/ArticleDetail.tsx exist per plan.md

---

## Phase 2: Foundational (Design tokens – blocking)

**Purpose**: Single source of truth for colours, typography, spacing, layout. All user stories depend on this.

**Checkpoint**: Tokens defined and body base styles applied; story work can begin.

- [x] T002 Define design tokens in app/globals.css under :root per specs/002-minimal-news-design/contracts/design-tokens.md (colours, typography, spacing, layout)
- [x] T003 Apply base body typography in app/globals.css using tokens (font-family, font-size, line-height)

---

## Phase 3: User Story 1 – Read-focused, uncluttered layout (Priority: P1)

**Goal**: Primary content is the main focus; article body is dominant on content pages; minimal chrome.

**Independent Test**: Open homepage and an article page; confirm headlines/article list are the main focus and article body has comfortable reading width with no horizontal scroll.

- [x] T004 [US1] Update app/(public)/layout.tsx: apply tokens to nav and main (padding from --space-*, optional max-width: var(--content-width)), keep semantic \<nav\> and \<main\>
- [x] T005 [US1] Update app/(public)/page.tsx so primary content (headlines, article list or lead) is main visual focus; non-essential UI does not dominate
- [x] T006 [US1] Update app/(public)/news/[slug]/page.tsx and app/(public)/blog/[slug]/page.tsx so article body is dominant and uses comfortable reading width (max-width from tokens)
- [x] T007 [US1] Update components/content/ArticleDetail.tsx to use --content-read-max and body typography tokens for article body

**Checkpoint**: US1 complete; homepage and article pages content-focused and readable.

---

## Phase 4: User Story 2 – Clear visual hierarchy (Priority: P2)

**Goal**: One clear lead item on homepage; secondary content ordered; news vs blog distinguishable.

**Independent Test**: On homepage, confirm one primary (lead) item is emphasized and secondary items are clearly ordered; on news/blog lists, sections are distinguishable.

- [x] T008 [US2] Implement one lead block on homepage in app/(public)/page.tsx (one emphasized item: larger title, extra spacing via tokens)
- [x] T009 [US2] Render secondary items below lead in app/(public)/page.tsx using ArticleCard with consistent gap (e.g. var(--space-md))
- [x] T010 [US2] In app/(public)/news/page.tsx and app/(public)/blog/page.tsx add page title and structure so news and blog sections are distinguishable
- [x] T011 [US2] Add optional lead variant to components/content/ArticleCard.tsx (larger title, more padding) for use as homepage lead block

**Checkpoint**: US2 complete; hierarchy and sections clear.

---

## Phase 5: User Story 3 – Trustworthy, consistent presentation (Priority: P3)

**Goal**: Consistent typography and colours site-wide; empty states; shared UI uses tokens.

**Independent Test**: Visit homepage, one list page, one article page; verify same visual language; trigger empty state and confirm clean minimal message.

- [x] T012 [P] [US3] Apply consistent typography (heading levels, body size) across app/(public)/page.tsx, app/(public)/news/page.tsx, app/(public)/blog/page.tsx, and article pages using design tokens
- [x] T013 [P] [US3] Apply consistent colour scheme (text, background, accent, links) across app/(public) pages and ensure sufficient contrast in app/globals.css and layout/components
- [x] T014 [US3] Add empty state to app/(public)/page.tsx when no content: minimal message, same layout shell, no broken UI
- [x] T015 [US3] Add empty state to app/(public)/news/page.tsx and app/(public)/blog/page.tsx when list is empty (minimal message, same layout)
- [x] T016 [US3] Restyle components/ui (Button, Card, Input, ErrorMessage, Modal) in components/ui/ to use design tokens for colour and spacing

**Checkpoint**: US3 complete; consistent, professional look and empty states in place.

---

## Phase 6: Polish & cross-cutting

**Purpose**: Responsive behaviour, edge cases, quickstart validation.

- [x] T017 Make nav responsive in app/(public)/layout.tsx: at or below --breakpoint-md ensure nav stacks or collapses without horizontal scroll
- [x] T018 Ensure long titles and long article body do not break layout in app/(public)/news/[slug]/page.tsx, app/(public)/blog/[slug]/page.tsx and components/content/ArticleCard.tsx (wrap or truncate; no horizontal scroll)
- [x] T019 Run quickstart verification: SC-001 (lead visible quickly), SC-002 (article readable), SC-003 (consistency), SC-005 (responsive 320px–desktop), FR-008 (empty states)

---

## Phase 7: Production readiness

**Purpose**: Accessibility, no placeholders, and final sign-off so the feature is deployable to production.

- [x] T020 Verify accessibility: focus visible on interactive elements (links, nav) using design token; text/background contrast meets WCAG AA in app/globals.css and all public pages
- [x] T021 Remove any placeholder content or TODO comments from public UI in app/(public)/ and components/content/
- [x] T022 Production sign-off: confirm all success criteria (SC-001–SC-005) and empty states (FR-008) hold; no broken layout at 320px, 768px, and desktop; LCP/main content visible within 3s

---

## Dependencies & execution order

### Phase dependencies

- **Phase 1 (Setup)**: None – start immediately.
- **Phase 2 (Foundational)**: Depends on Phase 1 – BLOCKS all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 3 (homepage lead + secondary build on US1 layout).
- **Phase 5 (US3)**: Depends on Phase 2; can overlap with US2 (different pages/components). Best done after US2 so all pages exist for consistency pass.
- **Phase 6 (Polish)**: Depends on Phases 3–5.
- **Phase 7 (Production readiness)**: Depends on Phase 6; must complete before release.

### User story order

- **US1 (P1)**: After Foundational only – no dependency on US2/US3.
- **US2 (P2)**: After US1 (homepage structure from US1).
- **US3 (P3)**: After US1; can follow or parallel with US2 for consistency across existing pages.

### Parallel opportunities

- **Phase 2**: T002 then T003 (same file).
- **Phase 5**: T012 and T013 can run in parallel (typography vs colour across files); T014 and T015 can run in parallel (homepage vs news/blog empty states).

---

## Parallel example: User Story 3

```text
# Typography and colour in parallel:
T012: Apply consistent typography across app/(public)/ pages
T013: Apply consistent colour scheme across app/(public) and components

# Empty states in parallel (after T012/T013 if reusing classes):
T014: Empty state on app/(public)/page.tsx
T015: Empty state on app/(public)/news/page.tsx and app/(public)/blog/page.tsx
```

---

## Implementation strategy

### Production-ready delivery (all phases required)

1. Phase 1: Setup  
2. Phase 2: Foundational (tokens)  
3. Phase 3: US1 (read-focused layout, article reading width)  
4. Phase 4: US2 (lead block, hierarchy, news vs blog sections)  
5. Phase 5: US3 (consistent typography/colour, empty states, shared UI tokens)  
6. Phase 6: Polish (responsive nav, long content edge cases, quickstart verification)  
7. Phase 7: Production readiness (accessibility, no placeholders, sign-off)  

**Release gate**: All tasks T001–T022 must be complete; no partial or MVP-only scope for production deploy.

### Task count summary

| Phase              | Tasks  | Story |
|--------------------|--------|--------|
| Setup              | 1      | –      |
| Foundational       | 2      | –      |
| US1                | 4      | P1     |
| US2                | 4      | P2     |
| US3                | 5      | P3     |
| Polish             | 3      | –      |
| Production readiness | 3   | –      |
| **Total**          | **22** |         |

**Production scope**: All phases 1–7 (T001–T022).

**Format validation**: All tasks use `- [ ]`, task ID (T001–T022), [P] where parallel, [USn] in story phases, and include file paths or exact locations.
