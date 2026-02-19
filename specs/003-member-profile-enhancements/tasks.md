# Tasks: Enhanced Member Profile

**Input**: Design documents from `/specs/003-member-profile-enhancements/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**CONSTITUTION (Principle VIII)**: Permission logic and content validation have test coverage. Business logic in profile and saved services has unit tests. Integration tests cover profile update, comments history, and save/unsave flows.

**Production-ready, clean design (FR-011–FR-015)**: Loading states, WCAG 2.1 AA, rate limiting, error+retry for save/unsave, no layout shift. Tasks below reflect these where applicable.

**Organization**: Tasks are grouped by user story for independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: User story (US1–US4)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Feature-specific setup; project already exists (001).

- [x] T001 Verify feature branch `003-member-profile-enhancements` and that `npm install` and `npx prisma generate` succeed from repo root (see `specs/003-member-profile-enhancements/quickstart.md`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Schema, permissions, and validation that all user stories depend on.

**No user story work until this phase is complete.**

- [x] T002 Add `SavedItem` model and User/Content relations to `prisma/schema.prisma` per data-model.md; run `npx prisma migrate dev --name add_saved_item` and `npx prisma generate`
- [x] T003 Extend MEMBER in `src/lib/permissions.ts` with `edit:own:profile`, `read:own:comments`, `save:content`
- [x] T004 [P] Add `profileUpdateSchema` (name, email optional; at least one required; email format, length) to `src/utils/validation.ts`
- [x] T005 [P] Add or extend rate limiting for profile update and save/unsave (FR-013) in `src/utils/rate-limit.ts`; clear, non-blocking message when exceeded

**Checkpoint**: Foundation ready — user story implementation can begin.

---

## Phase 3: User Story 1 — Edit Own Profile Data (P1) — MVP

**Goal**: Member can update name/email from profile; validation and uniqueness; success/error feedback.

**Independent Test**: Update name on profile, submit → saved, success message, profile shows new name. Invalid email → validation errors, no persist.

### Unit tests (write first; ensure they fail)

- [x] T006 [P] [US1] Create `src/services/profile/profile.service.ts` stub; add unit tests for `updateProfile` (success, validation failure, email uniqueness) in `tests/unit/services/profile.service.test.ts` — ensure tests fail before implementation

### Implementation

- [x] T007 [US1] Implement `profile.service` `updateProfile` (Zod, email uniqueness, User update) in `src/services/profile/profile.service.ts`
- [x] T008 [US1] Implement `updateProfileAction` (require MEMBER+, validate, rate-limit FR-013, call service) in `src/actions/profile/update-profile.action.ts`
- [x] T009 [US1] Create `ProfileForm` (name, email inputs; submit → action; success/error display; loading state on submit FR-011; WCAG 2.1 AA FR-012) in `components/profile/ProfileForm.tsx`
- [x] T010 [US1] Redesign profile page: profile section with `ProfileForm`; placeholder sections for My comments and Saved; loading state for fetch (skeleton/spinner) FR-011; no layout shift FR-015 in `app/(member)/profile/page.tsx`
- [x] T011 [US1] Add integration test for profile update (auth, submit, assert DB and response) in `tests/integration/api/profile.test.ts`

**Checkpoint**: US1 complete — profile edit works independently.

---

## Phase 4: User Story 2 — Comments History in One Place (P2)

**Goal**: Profile "My comments" section lists member's comments with excerpt, date, link to article; paginated; empty state when none.

**Independent Test**: Post comments on articles → open profile → see all in "My comments" with links. No comments → "You haven't commented yet."

### Unit tests

- [x] T012 [P] [US2] Add unit tests for `getCommentsByUserId` (paginated, visible-only, ordering) in `tests/unit/services/profile.service.test.ts`

### Implementation

- [x] T013 [US2] Implement `getCommentsByUserId` (paginated, VISIBLE + deletedAt null, include content) in `src/services/profile/profile.service.ts`
- [x] T014 [US2] Create `CommentsHistory` component (list, excerpt, date, link to article; empty state; loading state for pagination FR-011; WCAG 2.1 AA FR-012) in `components/profile/CommentsHistory.tsx`
- [x] T015 [US2] Fetch comments in profile page and render `CommentsHistory` in `app/(member)/profile/page.tsx`
- [x] T016 [US2] Add integration test for comments history on profile in `tests/integration/api/profile.test.ts`

**Checkpoint**: US2 complete — My comments works independently.

---

## Phase 5: User Story 3 — Save and Manage News/Blog (P3)

**Goal**: Save/unsave on article pages; "Saved" list on profile; empty state; unavailable handling.

**Independent Test**: Save article → profile Saved list shows it; unsave from profile or article → list updates. No saved → "No saved articles yet."

### Unit tests

- [x] T017 [P] [US3] Create `src/services/saved/saved.service.ts` stub; add unit tests for save, unsave, listSaved, isSaved (idempotency, pagination) in `tests/unit/services/saved.service.test.ts` — ensure tests fail before implementation

### Implementation

- [x] T018 [US3] Implement `saved.service` save, unsave, listSaved, isSaved in `src/services/saved/saved.service.ts`
- [x] T019 [US3] Implement `saveContentAction` and `unsaveContentAction` (rate-limit FR-013; return error for client-side retry FR-014) in `src/actions/saved/save.action.ts` and `src/actions/saved/unsave.action.ts`
- [x] T020 [US3] Create `SavedList` component (list, title/type/date/link; empty state; remove-from-saved; loading for list/pagination FR-011; WCAG 2.1 AA FR-012) in `components/profile/SavedList.tsx`
- [x] T021 [US3] Create `SaveButton` (Save/Unsave; reflect saved state; call actions; loading FR-011; error message + optional retry FR-014; WCAG 2.1 AA FR-012) in `components/content/SaveButton.tsx`
- [x] T022 [US3] Add Saved section to profile page (fetch via service) and `SaveButton` to `app/(public)/news/[slug]/page.tsx` and `app/(public)/blog/[slug]/page.tsx`
- [x] T023 [US3] Add integration tests for save/unsave and list saved in `tests/integration/api/saved.test.ts`

**Checkpoint**: US3 complete — save/unsave and Saved list work independently.

---

## Phase 6: User Story 4 — Profile Design and Layout (P4)

**Goal**: Clearly separated sections; responsive layout; design tokens; no horizontal scroll; WCAG 2.1 AA; no layout shift (FR-015).

**Independent Test**: Profile on desktop and mobile; section hierarchy, readability, consistency with site; keyboard-only use; no layout shift on load/pagination.

- [x] T024 [US4] Apply profile layout and responsive styles (sections, tokens from globals.css); no layout shift, consistent spacing, no redundant primary actions (FR-015); WCAG 2.1 AA for profile, ProfileForm, CommentsHistory, SavedList, SaveButton (FR-012) in `app/(member)/profile/page.tsx` and profile components
- [x] T025 [US4] Verify empty states ("You haven't commented yet", "No saved articles yet") and unavailable-content handling in `components/profile/CommentsHistory.tsx` and `components/profile/SavedList.tsx`

**Checkpoint**: US4 complete — profile design and layout meet spec.

---

## Phase 7: Polish & Cross-Cutting

**Purpose**: Seed data, quickstart validation, docs.

- [x] T026 [P] Add `SavedItem` seed data for a test member in `prisma/seed.ts` (optional)
- [x] T027 Run quickstart verification (migration, permissions, profile, save/unsave; loading, a11y, rate limiting, error+retry, clean design FR-011–FR-015) and update `specs/003-member-profile-enhancements/quickstart.md` if needed

---

## Dependencies & Execution Order

### Phase dependencies

- **Phase 1**: No dependencies.
- **Phase 2**: Depends on Phase 1 — blocks all user stories. T005 (rate limiting) required for T008, T019.
- **Phase 3–6**: Depend on Phase 2. US1 → US2 → US3 → US4 in order (profile page evolves across stories).
- **Phase 7**: After Phase 6.

### User story dependencies

- **US1**: After Foundational. No other story dependency.
- **US2**: After Foundational; profile page exists from US1 (add CommentsHistory).
- **US3**: After Foundational; profile page exists (add SavedList); requires SavedItem migration.
- **US4**: After US1–US3; refines layout and empty states.

### Parallel opportunities

- T004, T005 [P] with T002, T003 (different files).
- T006, T012, T017 [P] within their phases (tests only).
- T026 [P] in Polish.

---

## Implementation Strategy

### MVP first (US1 only)

1. Phase 1 + Phase 2.
2. Phase 3 (US1).
3. **Stop and validate**: Profile edit works.
4. Deploy/demo if ready.

### Incremental delivery

1. Phase 1 + 2 → foundation.
2. US1 → validate → deploy (MVP).
3. US2 → validate → deploy.
4. US3 → validate → deploy.
5. US4 → validate → deploy.
6. Phase 7 → done.

### Format validation

- All tasks use `- [ ]` checkbox.
- All have task ID (T001–T027).
- [P] only where parallelizable.
- [US1]–[US4] only in user-story phases.
- Each task mentions at least one file path.
