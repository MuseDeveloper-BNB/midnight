# Implementation Plan: Enhanced Member Profile

**Branch**: `003-member-profile-enhancements` | **Date**: 2025-01-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/003-member-profile-enhancements/spec.md`

## Summary

Extend the member profile with: (1) editable profile data (name, email) with validation; (2) a unified "My comments" section listing all of the member's comments with links to source articles, newest first, paginated; (3) save/unsave for news and blog articles with a "Saved" list on the profile; (4) a clear, responsive profile layout consistent with the existing design system. **Production-ready, clean design** (spec clarifications): loading states for profile fetch, form submit, save/unsave, and paginated lists (FR-011); WCAG 2.1 Level AA for profile, ProfileForm, CommentsHistory, SavedList, SaveButton (FR-012); rate limiting for profile update and save/unsave (FR-013); explicit error message and optional retry on save/unsave failure (FR-014); no layout shift, consistent spacing, no redundant primary actions (FR-015). Reuse Next.js + Prisma + NextAuth stack; add `SavedItem` join entity, profile/saved services, Server Actions, and UI components. All access control remains role-based (MEMBER+).

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20.x LTS  
**Primary Dependencies**: Next.js 14+ (App Router), React 18+, Prisma ORM, NextAuth.js v5 (Auth.js), Zod  
**Storage**: PostgreSQL (Prisma) — add `SavedItem`; User, Comment, Content unchanged  
**Testing**: Jest, React Testing Library, Playwright, Supertest (extend existing suites)  
**Target Platform**: Web (modern browsers, responsive)  
**Project Type**: Web application (full-stack Next.js)  
**Performance Goals**: Profile page load &lt; 3 s (SC-004); list endpoints paginated  
**Constraints**: Profile updates and save/unsave via Server Actions; CSRF, validation, sanitization; rate limiting per user; loading and error UX per FR-011, FR-014  
**Scale/Scope**: 50+ saved items per member (SC-003); pagination for comments and saved lists

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Clean, Readable, and Maintainable Code
- Reuse existing patterns (services, actions, components)
- Clear module boundaries for profile and saved-item logic

### ✅ Principle II: Separation of Concerns (NON-NEGOTIABLE)
- **Profile**: services/actions for profile update and comments history; UI in components
- **Saved**: dedicated service/actions for save/unsave and saved list; no business logic in UI

### ✅ Principle III: Role-Based Access Control (NON-NEGOTIABLE)
- Centralized permissions; extend MEMBER with `edit:own:profile`, `read:own:comments`, `save:content`
- All profile/saved actions enforce MEMBER+ and ownership where applicable

### ✅ Principle IV: Predictable Behavior Over Clever Solutions
- Standard Server Actions and Prisma queries; explicit permission checks
- Pagination for comments/saved; loading and error handling per spec

### ✅ Principle V: Data Integrity Over Speed
- Transactions for profile update (e.g. email uniqueness check + update)
- Unique constraint on (userId, contentId) for SavedItem; soft deletes for comments unchanged

### ✅ Principle VI: Content Validation and Sanitization (NON-NEGOTIABLE)
- Zod schemas for profile update (name, email format, uniqueness)
- No new rich-text input; comment display reuses existing sanitization

### ✅ Principle VII: Audit Visibility for Editors and Admins
- No new moderation/audit entities; profile edits are self-service
- Existing ModerationLog unchanged

### ✅ Principle VIII: Testable Business Logic (NON-NEGOTIABLE)
- Profile and saved-item logic in services; unit tests for validation and persistence
- Integration tests for profile update, comments history, save/unsave, list saved; a11y and loading/error scenarios as needed

### ✅ Principle IX: Acceptance Criteria Before Features
- Spec user stories have acceptance scenarios; tests map to them

### ✅ Principle X: Future Scalability Considerations
- Indexes on `SavedItem(userId)`, `SavedItem(userId, contentId)`; pagination; rate limiting supports abuse prevention

## Project Structure

### Documentation (this feature)

```text
specs/003-member-profile-enhancements/
├── plan.md
├── research.md
├── data-model.md
├── quickstart.md
├── contracts/
│   ├── api-profile.md
│   └── api-saved.md
└── tasks.md             # Phase 2 — /speckit.tasks
```

### Source Code (repository root)

Existing layout from 001; additions for this feature:

```text
app/
├── (member)/
│   └── profile/
│       └── page.tsx     # Redesign: profile form, My comments, Saved; loading, a11y, no layout shift
├── (public)/
│   ├── news/[slug]/
│   │   └── page.tsx     # Add Save/Unsave control (loading, error+retry, a11y)
│   └── blog/[slug]/
│       └── page.tsx     # Add Save/Unsave control

src/
├── lib/
│   └── permissions.ts   # Extend MEMBER: edit:own:profile, read:own:comments, save:content
├── services/
│   ├── profile/
│   │   └── profile.service.ts   # updateProfile, getCommentsByUserId (paginated)
│   └── saved/
│       └── saved.service.ts     # save, unsave, list saved, isSaved
├── actions/
│   ├── profile/
│   │   └── update-profile.action.ts   # rate-limited
│   └── saved/
│       ├── save.action.ts       # rate-limited; error+retry UX
│       ├── unsave.action.ts
│       └── list-saved.action.ts (or inline in profile page)
└── utils/
    └── validation.ts    # profileUpdateSchema; rate-limit helpers as needed

components/
├── profile/
│   ├── ProfileForm.tsx    # loading, a11y, WCAG 2.1 AA
│   ├── CommentsHistory.tsx
│   └── SavedList.tsx
└── content/
    └── SaveButton.tsx    # loading, error+retry, a11y

prisma/
├── schema.prisma        # Add SavedItem model
└── migrations/
```

**Structure Decision**: Same single Next.js app as 001. New `profile` and `saved` modules; profile page is the single place for profile data, comments history, and saved list. Loading, a11y, rate limiting, and error recovery implemented in actions/components per FR-011–FR-015.

## Complexity Tracking

No constitution violations. No entries.
