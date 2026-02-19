# Technology Research: Enhanced Member Profile

**Feature**: Enhanced Member Profile  
**Date**: 2025-01-28  
**Status**: Complete

## Overview

This feature extends the existing news application with profile editing, comments history, and saved content. The stack (Next.js, Prisma, NextAuth, Zod) is fixed; no NEEDS CLARIFICATION. Research covers storage for saved items, profile-update patterns, pagination, and design-token alignment.

## Research Tasks and Decisions

### 1. Saved-Items Storage

**Decision**: Add a `SavedItem` join table (user–content) with `userId`, `contentId`, and `createdAt`. Enforce uniqueness on `(userId, contentId)`.

**Rationale**:
- Simple many-to-many between User and Content; supports “is this article saved?” and “list my saved” efficiently.
- Unique constraint prevents duplicate saves and simplifies upsert/remove logic.
- `createdAt` supports “saved at” and ordering (newest first).

**Alternatives Considered**:
- **JSON array on User**: Harder to query, index, and paginate; brittle for large lists.
- **Separate “bookmarks” service/store**: Unnecessary; same DB, clear module boundary via `saved.service` and Prisma.

**Constitution**: ✅ Data integrity (constraints, explicit model); indexes for list + uniqueness checks.

---

### 2. Profile Update Patterns

**Decision**: Single Server Action `updateProfileAction` that validates input (Zod), checks email uniqueness when email changes, then updates User (name, email). Use a single transaction where appropriate (e.g. uniqueness check + update).

**Rationale**:
- Matches existing action-based mutations; no new API style.
- Validation and uniqueness failures return clear errors to the form.
- Session refresh after update: rely on NextAuth session strategy (JWT); profile page refetch or redirect is sufficient to show updated data (spec SC-001).

**Alternatives Considered**:
- **Dedicated PATCH /api/profile**: Adds REST surface; Server Actions already used for mutations.
- **Optimistic UI only**: Kept optional; spec emphasizes “see updated information” after save, not strict real-time sync.

**Constitution**: ✅ Validation (Zod); RBAC (MEMBER+); separation of concerns (action → service → Prisma).

---

### 3. Pagination for Comments and Saved Lists

**Decision**: Cursor- or offset-based pagination for “My comments” and “Saved” lists. Default page size on the order of 10–20 items; configurable via plan/tasks.

**Rationale**:
- Spec requires pagination or “load more” for large lists (edge cases, SC-004).
- Offset pagination is simpler and sufficient for profile-scale lists; cursor can be added later if needed.
- Keeps profile page load bounded; no infinite scroll required.

**Alternatives Considered**:
- **Fetch all**: Rejected for members with many comments/saved items.
- **Infinite scroll**: Not required by spec; can be added later if needed.

**Constitution**: ✅ Predictable behavior; scalability (Principle X).

---

### 4. Design-Token and Layout Alignment

**Decision**: Reuse existing design system (002-minimal-news-design): tokens for typography, spacing, and layout. Profile sections (profile form, My comments, Saved) use the same tokens and responsive patterns as the rest of the site.

**Rationale**:
- Spec FR-008, FR-009, SC-005 require consistency and responsive layout.
- 002 already defines tokens and layout; profile extends them rather than introducing new systems.

**Alternatives Considered**:
- **New profile-specific theme**: Would contradict “consistent with the rest of the site.”
- **Inline-only styles**: Rejected; use shared tokens and classes.

**Constitution**: ✅ No new tech; aligns with existing design docs.

---

### 5. Handling Unavailable Content (Saved / Commented)

**Decision**: When listing saved items or comment context, omit content that is unpublished/deleted or mark as “Article no longer available” with optional “Remove from saved.” Comments history only shows comments whose source content still exists and is published; otherwise omit or mark unavailable.

**Rationale**:
- Spec FR-010 and edge cases require graceful handling of missing content.
- Omit-or-mark keeps the profile usable and avoids broken links.

**Alternatives Considered**:
- **Strict 404 on missing content**: Degrades profile UX; spec asks for graceful handling.
- **Keep saved reference to deleted content**: Display-only unavailable plus remove-from-saved satisfies spec.

**Constitution**: ✅ Data integrity (no orphan writes); predictable UX.

---

### 6. Loading States (FR-011)

**Decision**: Require loading indicators for profile fetch, profile update submit, save/unsave actions, and paginated loading of comments or saved lists. Use spinner, skeleton, or disabled controls as appropriate per context.

**Rationale**: Spec clarification: users must receive clear feedback during async operations; no unexplained blank content or unresponsive buttons. Supports production-ready, clean design and testable acceptance criteria.

**Alternatives Considered**: No explicit loading (rejected); loading only on submit (insufficient for fetch and pagination).

**Constitution**: ✅ Predictable behavior; separation of concerns (UI state vs. business logic).

---

### 7. Accessibility (FR-012)

**Decision**: Profile page, ProfileForm, CommentsHistory, SavedList, and SaveButton MUST meet WCAG 2.1 Level AA. Ensure keyboard navigation, focus management, sufficient labels, and contrast.

**Rationale**: Spec clarification for production-ready profile; testable via keyboard-only use and automated a11y checks (e.g. axe-core).

**Alternatives Considered**: Level A only (lower bar); no explicit a11y (conflicts with production-ready design).

**Constitution**: ✅ No new tech; leverages existing design tokens for contrast/spacing where applicable.

---

### 8. Rate Limiting (FR-013)

**Decision**: Rate-limit profile update and save/unsave per user with reasonable limits. Return a clear, non-blocking message when exceeded.

**Rationale**: Spec clarification to prevent abuse; implement via app-level rate-limit utility (e.g. per-user counters).

**Alternatives Considered**: No rate limiting (rejected for production); database-only throttling (app-level sufficient).

**Constitution**: ✅ Predictable behavior; security-conscious without changing data model.

---

### 9. Save/Unsave Error Recovery (FR-014)

**Decision**: On network or server failure during save/unsave, show an explicit error message and an optional retry. Do not fail silently.

**Rationale**: Spec clarification; implement in SaveButton and profile unsave control via action error handling and local UI state.

**Alternatives Considered**: Silent failure (rejected); retry-only without message (message required).

**Constitution**: ✅ Predictable UX; validation and error handling remain testable.

---

### 10. Clean Design—Testable Criteria (FR-015)

**Decision**: No layout shift during initial load or pagination; consistent spacing and section hierarchy; no redundant primary actions. Use reserved space (skeleton) or stable layout to avoid CLS.

**Rationale**: Spec clarification makes "clean" testable; aligns with existing 002 design tokens.

**Alternatives Considered**: Leave "clean" vague (rejected); strict CLS numeric target (can be added in implementation).

**Constitution**: ✅ Reuse of design system; no new dependencies.

---

## Summary

| Topic | Decision |
|-------|----------|
| Saved storage | `SavedItem` join table; unique `(userId, contentId)` |
| Profile updates | `updateProfileAction`; Zod; email uniqueness; transactional where needed |
| Pagination | Offset (or cursor) for comments and saved; default ~10–20 per page |
| Design | Reuse 002 design tokens and responsive layout |
| Unavailable content | Omit or "unavailable" + remove-from-saved; same for comment source links |
| Loading (FR-011) | Spinner/skeleton/disabled for fetch, submit, save/unsave, pagination |
| Accessibility (FR-012) | WCAG 2.1 Level AA for profile, form, lists, SaveButton |
| Rate limiting (FR-013) | Per-user limits for profile update and save/unsave; clear message when exceeded |
| Error recovery (FR-014) | Explicit error + optional retry for save/unsave; no silent failure |
| Clean design (FR-015) | No layout shift; consistent spacing/hierarchy; no redundant primary actions |

All decisions respect the constitution. No additional dependencies required.
