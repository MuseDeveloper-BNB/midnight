# Tasks: News Website with Role-Based Access

**Input**: Design documents from `/specs/001-news-website/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**CONSTITUTION COMPLIANCE (Principle VIII)**: Permission logic and content validation
MUST have 100% test coverage. Business logic functions MUST have unit tests with edge
case coverage. All permission checks MUST be test-covered.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: Next.js App Router structure with `app/`, `src/`, `components/`, `prisma/` at repository root
- Paths shown below follow Next.js App Router conventions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Create Next.js project structure with App Router in repository root
- [x] T002 Initialize TypeScript project with tsconfig.json and Next.js TypeScript configuration
- [x] T003 [P] Install and configure core dependencies: next@^14.0.0, react@^18.0.0, react-dom@^18.0.0, typescript@^5.0.0
- [x] T004 [P] Install and configure database dependencies: @prisma/client, prisma
- [x] T005 [P] Install and configure authentication dependencies: next-auth@^5.0.0, @auth/prisma-adapter
- [x] T006 [P] Install and configure validation/sanitization dependencies: zod, dompurify, isomorphic-dompurify
- [x] T007 [P] Install and configure utility dependencies: bcryptjs, date-fns
- [x] T008 [P] Install and configure development dependencies: @types/node, @types/react, eslint, prettier
- [x] T009 [P] Install and configure testing dependencies: jest, @testing-library/react, @playwright/test, supertest
- [x] T010 [P] Configure ESLint and Prettier with Next.js recommended settings
- [ ] T011 Create .env.example file with required environment variables (DATABASE_URL, NEXTAUTH_URL, NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
- [x] T012 Create .gitignore file for Next.js project (node_modules, .next, .env, etc.)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T013 Create Prisma schema file at prisma/schema.prisma with PostgreSQL datasource
- [x] T014 Define User model in prisma/schema.prisma with all fields (id, email, name, password, role, provider, providerId, active, emailVerified, image, createdAt, updatedAt)
- [x] T015 Define Content model in prisma/schema.prisma with all fields (id, type, title, body, slug, status, authorId, publishedAt, createdAt, updatedAt)
- [x] T016 Define Comment model in prisma/schema.prisma with all fields (id, body, contentId, authorId, status, deletedAt, createdAt, updatedAt)
- [x] T017 Define Report model in prisma/schema.prisma with all fields (id, commentId, reporterId, reason, status, createdAt, updatedAt)
- [x] T018 Define ModerationLog model in prisma/schema.prisma with all fields (id, action, targetType, targetId, moderatorId, details, createdAt)
- [x] T019 Define all enums in prisma/schema.prisma (UserRole, AuthProvider, ContentType, ContentStatus, CommentStatus, ReportStatus, ModerationAction, ModerationTargetType)
- [x] T020 Define all model relationships in prisma/schema.prisma (User ↔ Content, User ↔ Comment, Content ↔ Comment, User ↔ Report, Comment ↔ Report, User ↔ ModerationLog)
- [x] T021 Define all database indexes in prisma/schema.prisma (email unique, provider+providerId composite, slug unique, status+publishedAt composite, contentId+status+deletedAt composite, etc.)
- [ ] T022 Run Prisma migration: npx prisma migrate dev --name init
- [ ] T023 Generate Prisma client: npx prisma generate
- [x] T024 Create Prisma client singleton at src/lib/db.ts
- [x] T025 Create centralized permissions configuration at src/lib/permissions.ts with PERMISSIONS object (MEMBER, EDITOR, ADMIN roles and capabilities)
- [x] T026 Create requireRole helper function in src/lib/permissions.ts
- [x] T027 Create NextAuth.js configuration at src/lib/auth.ts with email/password and Google OAuth providers
- [x] T028 Configure NextAuth.js session callbacks to include role in session object
- [x] T029 Create NextAuth.js API route handler at app/(auth)/api/auth/[...nextauth]/route.ts
- [x] T030 Create Next.js middleware at middleware.ts for route protection
- [x] T031 Implement authentication middleware helper at src/middleware/auth.middleware.ts
- [x] T032 Implement permission middleware helper at src/middleware/permissions.middleware.ts
- [x] T033 Create error handling utilities at src/utils/errors.ts with user-friendly error messages
- [x] T034 Create validation utilities at src/utils/validation.ts with Zod schemas placeholder
- [x] T035 Create sanitization utilities at src/utils/sanitization.ts with DOMPurify setup
- [x] T036 Create shared TypeScript types at src/types/index.ts
- [x] T037 Create root layout component at app/layout.tsx
- [x] T038 Configure Next.js config file (next.config.js) for production settings

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Public Content Browsing (Priority: P1) 🎯 MVP

**Goal**: Anonymous users can browse published news and blog posts without authentication. Homepage displays latest published news. Users can navigate to separate news and blog sections. Only published content is visible.

**Independent Test**: Visit homepage and content pages as anonymous user. Verify published content displays correctly, navigation works, and unpublished content is hidden.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T039 [P] [US1] Unit test for ContentService.getPublishedContent in tests/unit/services/content.service.test.ts
- [x] T040 [P] [US1] Unit test for ContentService.getContentBySlug in tests/unit/services/content.service.test.ts
- [x] T041 [P] [US1] Integration test for GET /api/content endpoint in tests/integration/api/content.test.ts
- [x] T042 [P] [US1] E2E test for homepage displays published news in tests/e2e/public-content.spec.ts
- [x] T043 [P] [US1] E2E test for news detail page in tests/e2e/public-content.spec.ts
- [x] T044 [P] [US1] E2E test for blog list page in tests/e2e/public-content.spec.ts
- [x] T045 [P] [US1] E2E test for draft content not visible in tests/e2e/public-content.spec.ts

### Implementation for User Story 1

- [x] T046 [P] [US1] Create ContentService class in src/services/content/content.service.ts with getPublishedContent method
- [x] T047 [P] [US1] Implement getPublishedContent method in ContentService to query published content ordered by publishedAt DESC
- [x] T048 [P] [US1] Implement getContentBySlug method in ContentService to fetch single published content by slug
- [x] T049 [P] [US1] Implement getContentByType method in ContentService to filter by NEWS or BLOG type
- [x] T050 [US1] Create GET /api/content API route at app/api/content/route.ts with query parameter support (type, limit, offset, sort)
- [x] T051 [US1] Create GET /api/content/[slug] API route at app/api/content/[slug]/route.ts
- [x] T052 [US1] Create homepage Server Component at app/(public)/page.tsx that displays latest published news
- [x] T053 [US1] Create news list page Server Component at app/(public)/news/page.tsx
- [x] T054 [US1] Create news detail page Server Component at app/(public)/news/[slug]/page.tsx
- [x] T055 [US1] Create blog list page Server Component at app/(public)/blog/page.tsx
- [x] T056 [US1] Create blog detail page Server Component at app/(public)/blog/[slug]/page.tsx
- [x] T057 [P] [US1] Create ArticleCard component at components/content/ArticleCard.tsx for content list display
- [x] T058 [P] [US1] Create ArticleDetail component at components/content/ArticleDetail.tsx for content detail display
- [x] T059 [US1] Create public layout component at app/(public)/layout.tsx with navigation
- [x] T060 [US1] Add navigation links between homepage, news, and blog sections
- [x] T061 [US1] Implement content filtering to show only PUBLISHED status content (exclude DRAFT and ARCHIVED)
- [x] T062 [US1] Add pagination support for content lists (limit, offset)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. Anonymous users can browse published content.

---

## Phase 4: User Story 2 - Member Registration, Authentication, and Commenting (Priority: P2)

**Goal**: Members can register, log in, and interact with content through comments. Members can write, edit, and delete their own comments. Members can report comments.

**Independent Test**: Register account, log in, view published content, create comments, edit own comments, delete own comments, report comments. Verify authentication works and comment ownership is enforced.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T063 [P] [US2] Unit test for AuthService.register in tests/unit/services/auth.service.test.ts
- [x] T064 [P] [US2] Unit test for AuthService.login in tests/unit/services/auth.service.test.ts
- [x] T065 [P] [US2] Unit test for CommentsService.createComment in tests/unit/services/comments.service.test.ts
- [x] T066 [P] [US2] Unit test for CommentsService.updateComment with ownership check in tests/unit/services/comments.service.test.ts
- [x] T067 [P] [US2] Unit test for CommentsService.deleteComment with ownership check in tests/unit/services/comments.service.test.ts
- [x] T068 [P] [US2] Unit test for permission checks in tests/unit/lib/permissions.test.ts (100% coverage required)
- [x] T069 [P] [US2] Integration test for POST /api/auth/register endpoint in tests/integration/api/auth.test.ts
- [x] T070 [P] [US2] Integration test for POST /api/auth/login endpoint in tests/integration/api/auth.test.ts
- [x] T071 [P] [US2] Integration test for POST /api/comments endpoint in tests/integration/api/comments.test.ts
- [x] T072 [P] [US2] E2E test for registration flow in tests/e2e/auth.spec.ts
- [x] T073 [P] [US2] E2E test for login flow in tests/e2e/auth.spec.ts
- [x] T074 [P] [US2] E2E test for comment creation in tests/e2e/comments.spec.ts
- [x] T075 [P] [US2] E2E test for comment ownership enforcement in tests/e2e/comments.spec.ts

### Implementation for User Story 2

- [x] T076 [P] [US2] Create AuthService class in src/services/auth/auth.service.ts
- [x] T077 [US2] Implement register method in AuthService with email/password validation and bcrypt hashing
- [x] T078 [US2] Implement login method in AuthService with credential validation
- [x] T079 [US2] Create registerAction Server Action at src/actions/auth/register.action.ts
- [x] T080 [US2] Create loginAction Server Action at src/actions/auth/login.action.ts
- [x] T081 [US2] Create registration page at app/(auth)/register/page.tsx with form
- [x] T082 [US2] Create login page at app/(auth)/login/page.tsx with form
- [x] T083 [US2] Add Google OAuth button to login page (if GOOGLE_CLIENT_ID configured)
- [x] T084 [US2] Create CommentsService class in src/services/comments/comments.service.ts
- [x] T085 [US2] Implement createComment method in CommentsService with content validation and sanitization
- [x] T086 [US2] Implement updateComment method in CommentsService with ownership validation
- [x] T087 [US2] Implement deleteComment method in CommentsService with soft delete (set deletedAt timestamp)
- [x] T088 [US2] Implement getCommentsByContentId method in CommentsService filtering by VISIBLE status and deletedAt IS NULL
- [x] T089 [US2] Create createCommentAction Server Action at src/actions/comments/create.action.ts with permission check
- [x] T090 [US2] Create updateCommentAction Server Action at src/actions/comments/update.action.ts with ownership check
- [x] T091 [US2] Create deleteCommentAction Server Action at src/actions/comments/delete.action.ts with ownership check
- [x] T092 [US2] Create reportCommentAction Server Action at src/actions/comments/report.action.ts
- [x] T093 [US2] Create GET /api/comments API route at app/api/comments/route.ts for fetching visible comments
- [x] T094 [US2] Create CommentList component at components/comments/CommentList.tsx
- [x] T095 [US2] Create CommentForm component at components/comments/CommentForm.tsx
- [x] T096 [US2] Create CommentItem component at components/comments/CommentItem.tsx with edit/delete buttons for own comments
- [x] T097 [US2] Add comment section to content detail pages (news/[slug] and blog/[slug])
- [x] T098 [US2] Show comment form only to logged-in users (check session)
- [x] T099 [US2] Add report button to CommentItem component
- [x] T100 [US2] Create member profile page at app/(member)/profile/page.tsx
- [x] T101 [US2] Create member layout at app/(member)/layout.tsx with navigation
- [x] T102 [US2] Add validation schemas for comment creation/update in src/utils/validation.ts (Zod)
- [x] T103 [US2] Add sanitization for comment body in src/utils/sanitization.ts (DOMPurify)
- [x] T104 [US2] Implement soft delete pattern for comments (deletedAt timestamp, status = DELETED)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently. Members can register, log in, and comment on published content.

---

## Phase 5: User Story 3 - Editor Content Management (Priority: P3)

**Goal**: Editors can create, edit, publish, unpublish, and archive content. Editors have dashboard showing managed content. Editors can moderate comments on their content.

**Independent Test**: Log in as editor, create content in draft, edit it, publish it, unpublish it, archive it, moderate comments. Verify editorial workflow and comment moderation capabilities.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T105 [P] [US3] Unit test for ContentService.createContent in tests/unit/services/content.service.test.ts
- [x] T106 [P] [US3] Unit test for ContentService.updateContent in tests/unit/services/content.service.test.ts
- [x] T107 [P] [US3] Unit test for ContentService.publishContent in tests/unit/services/content.service.test.ts
- [x] T108 [P] [US3] Unit test for ContentService.unpublishContent in tests/unit/services/content.service.test.ts
- [x] T109 [P] [US3] Unit test for ContentService.archiveContent in tests/unit/services/content.service.test.ts
- [x] T110 [P] [US3] Unit test for ModerationService.hideComment in tests/unit/services/moderation.service.test.ts
- [x] T111 [P] [US3] Unit test for ModerationService.deleteCommentModeration in tests/unit/services/moderation.service.test.ts
- [x] T112 [P] [US3] Unit test for moderation logging in tests/unit/services/moderation.service.test.ts
- [x] T113 [P] [US3] Integration test for content creation flow in tests/integration/content.test.ts
- [x] T114 [P] [US3] Integration test for content status transitions in tests/integration/content.test.ts
- [x] T115 [P] [US3] E2E test for editor creates and publishes article in tests/e2e/editor-content.spec.ts
- [x] T116 [P] [US3] E2E test for editor moderates comments in tests/e2e/editor-content.spec.ts

### Implementation for User Story 3

- [x] T117 [US3] Implement createContent method in ContentService with slug generation and DRAFT status default
- [x] T118 [US3] Implement updateContent method in ContentService with author validation (or ADMIN override)
- [x] T119 [US3] Implement publishContent method in ContentService setting status to PUBLISHED and publishedAt timestamp
- [x] T120 [US3] Implement unpublishContent method in ContentService setting status to DRAFT
- [x] T121 [US3] Implement archiveContent method in ContentService setting status to ARCHIVED
- [x] T122 [US3] Implement getContentByAuthorId method in ContentService for editor dashboard
- [x] T123 [US3] Create ModerationService class in src/services/moderation/moderation.service.ts
- [x] T124 [US3] Implement logModerationAction method in ModerationService to create ModerationLog entries
- [x] T125 [US3] Implement hideComment method in ModerationService setting status to HIDDEN and logging action
- [x] T126 [US3] Implement deleteCommentModeration method in ModerationService with soft delete and logging
- [x] T127 [US3] Create createContentAction Server Action at src/actions/content/create.action.ts with EDITOR/ADMIN permission check
- [x] T128 [US3] Create updateContentAction Server Action at src/actions/content/update.action.ts with permission check
- [x] T129 [US3] Create publishContentAction Server Action at src/actions/content/publish.action.ts with logging
- [x] T130 [US3] Create unpublishContentAction Server Action at src/actions/content/unpublish.action.ts with logging
- [x] T131 [US3] Create archiveContentAction Server Action at src/actions/content/archive.action.ts with logging
- [x] T132 [US3] Create hideCommentAction Server Action at src/actions/comments/hide.action.ts with EDITOR/ADMIN permission check
- [x] T133 [US3] Create deleteCommentModerationAction Server Action at src/actions/comments/delete-moderation.action.ts with permission check
- [x] T134 [US3] Create editor dashboard page at app/(editor)/dashboard/page.tsx showing content list with status indicators
- [x] T135 [US3] Create content creation page at app/(editor)/content/new/page.tsx with form (title, body, type)
- [x] T136 [US3] Create content edit page at app/(editor)/content/[id]/page.tsx with form
- [x] T137 [US3] Create ContentEditor component at components/content/ContentEditor.tsx with rich text support for blog posts
- [x] T138 [US3] Add publish/unpublish/archive buttons to content edit page
- [x] T139 [US3] Create editor layout at app/(editor)/layout.tsx with navigation
- [x] T140 [US3] Add comment moderation UI to content detail pages for editors (hide/delete buttons)
- [x] T141 [US3] Implement slug generation utility function (title → URL-friendly slug)
- [x] T142 [US3] Add validation schemas for content creation/update in src/utils/validation.ts (Zod)
- [x] T143 [US3] Add sanitization for blog post body (HTML) in src/utils/sanitization.ts (DOMPurify)
- [x] T144 [US3] Ensure all content status changes create ModerationLog entries

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently. Editors can manage content and moderate comments.

---

## Phase 6: User Story 4 - Admin User Management and System Administration (Priority: P4)

**Goal**: Admins can view all users, change user roles, deactivate users, and view moderation history. Admins have administrative dashboard with system-wide visibility.

**Independent Test**: Log in as admin, view user list, change user role, deactivate user, view moderation history, filter moderation history. Verify administrative capabilities.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [x] T145 [P] [US4] Unit test for AdminService.getUsers in tests/unit/services/admin.service.test.ts
- [x] T146 [P] [US4] Unit test for AdminService.getUser in tests/unit/services/admin.service.test.ts
- [x] T147 [P] [US4] Unit test for AdminService.updateUserRole in tests/unit/services/admin.service.test.ts
- [x] T148 [P] [US4] Unit test for AdminService.deactivateUser in tests/unit/services/admin.service.test.ts
- [x] T149 [P] [US4] Unit test for AdminService.getModerationHistory in tests/unit/services/admin.service.test.ts
- [x] T150 [P] [US4] Unit test for admin permission checks (100% coverage required)
- [x] T151 [P] [US4] Integration test for user role change in tests/integration/admin.test.ts
- [x] T152 [P] [US4] Integration test for user deactivation in tests/integration/admin.test.ts
- [x] T153 [P] [US4] Integration test for moderation history query in tests/integration/admin.test.ts
- [x] T154 [P] [US4] E2E test for admin views users in tests/e2e/admin.spec.ts
- [x] T155 [P] [US4] E2E test for admin changes user role in tests/e2e/admin.spec.ts
- [x] T156 [P] [US4] E2E test for admin views moderation history in tests/e2e/admin.spec.ts

### Implementation for User Story 4

- [x] T157 [US4] Create AdminService class in src/services/admin/admin.service.ts
- [x] T158 [US4] Implement getUsers method in AdminService with pagination and filtering (role, active, search)
- [x] T159 [US4] Implement getUser method in AdminService with full user details including content and comments
- [x] T160 [US4] Implement updateUserRole method in AdminService with validation (cannot change own role) and logging
- [x] T161 [US4] Implement deactivateUser method in AdminService with validation (cannot deactivate own account) and logging
- [x] T162 [US4] Implement activateUser method in AdminService with logging
- [x] T163 [US4] Implement getModerationHistory method in AdminService with filtering (moderator, action, targetType, date range)
- [x] T164 [US4] Create getUsersAction Server Action at src/actions/admin/get-users.action.ts with ADMIN permission check
- [x] T165 [US4] Create getUserAction Server Action at src/actions/admin/get-user.action.ts with ADMIN permission check
- [x] T166 [US4] Create updateUserRoleAction Server Action at src/actions/admin/update-role.action.ts with ADMIN permission check
- [x] T167 [US4] Create deactivateUserAction Server Action at src/actions/admin/deactivate-user.action.ts with ADMIN permission check
- [x] T168 [US4] Create activateUserAction Server Action at src/actions/admin/activate-user.action.ts with ADMIN permission check
- [x] T169 [US4] Create getModerationHistoryAction Server Action at src/actions/admin/get-moderation-history.action.ts with ADMIN permission check
- [x] T170 [US4] Create GET /api/admin/users API route at app/api/admin/users/route.ts with ADMIN permission check
- [x] T171 [US4] Create GET /api/admin/users/[id] API route at app/api/admin/users/[id]/route.ts with ADMIN permission check
- [x] T172 [US4] Create GET /api/admin/moderation-history API route at app/api/admin/moderation-history/route.ts with ADMIN permission check
- [x] T173 [US4] Create admin dashboard page at app/(admin)/dashboard/page.tsx with navigation to user management and moderation history
- [x] T174 [US4] Create user list page at app/(admin)/users/page.tsx with table showing users, roles, status
- [x] T175 [US4] Create user detail page at app/(admin)/users/[id]/page.tsx with role change and deactivation controls
- [x] T176 [US4] Create moderation history page at app/(admin)/moderation-history/page.tsx with filtering controls
- [x] T177 [US4] Create UserList component at components/admin/UserList.tsx
- [x] T178 [US4] Create ModerationHistory component at components/admin/ModerationHistory.tsx with date range and filter controls
- [x] T179 [US4] Create admin layout at app/(admin)/layout.tsx with navigation
- [x] T180 [US4] Add role change form to user detail page with validation (cannot change own role)
- [x] T181 [US4] Add deactivation/activation controls to user detail page with validation (cannot deactivate own account)
- [x] T182 [US4] Ensure all admin actions create ModerationLog entries (role changes, deactivations)

**Checkpoint**: At this point, all user stories should be independently functional. Admins can manage users and view moderation history.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T183 [P] Add error boundaries to all route groups (public, auth, member, editor, admin)
- [x] T184 [P] Add loading states to all async operations (Server Actions, API routes)
- [x] T185 [P] Add form validation feedback to all forms (registration, login, content creation, comment forms)
- [x] T186 [P] Implement consistent error message display across all pages
- [x] T187 [P] Add responsive design styles for mobile devices
- [x] T188 [P] Add SEO meta tags to all public pages (title, description, Open Graph)
- [x] T189 [P] Optimize database queries with proper indexes (verify all indexes from schema are created)
- [ ] T190 [P] Add database connection pooling configuration
- [x] T191 [P] Add rate limiting to API routes (prevent abuse)
- [ ] T192 [P] Add CSRF protection verification for all Server Actions
- [x] T193 [P] Add input length validation (title max 255, comment body max 5000)
- [ ] T194 [P] Add pagination UI components for content lists and user lists
- [ ] T195 [P] Add search functionality to admin user list
- [ ] T196 [P] Add filtering to moderation history (by date range, moderator, action type)
- [ ] T197 [P] Add confirmation dialogs for destructive actions (delete comment, deactivate user, archive content)
- [ ] T198 [P] Add toast notifications for success/error feedback
- [x] T199 [P] Create shared UI components (Button, Input, Card, Modal) in components/ui/
- [x] T200 [P] Add consistent styling with CSS modules or Tailwind CSS
- [ ] T201 [P] Add accessibility features (ARIA labels, keyboard navigation, focus management)
- [ ] T202 [P] Run quickstart.md validation checklist
- [ ] T203 [P] Update README.md with setup instructions and project overview
- [ ] T204 [P] Add code comments and JSDoc to all service methods
- [ ] T205 [P] Review and refactor code for consistency and readability
- [ ] T206 [P] Run full test suite and ensure all tests pass
- [ ] T207 [P] Verify 100% test coverage for permission logic and content validation

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3 → P4)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for content to comment on, but can be tested independently with test data
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Can work independently, but integrates with US2 for comment moderation
- **User Story 4 (P4)**: Can start after Foundational (Phase 2) - Can work independently, but integrates with US3 for moderation history

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models/Entities before services
- Services before Server Actions/API Routes
- Server Actions/API Routes before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T003-T012)
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models/services within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members
- All Polish phase tasks marked [P] can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "Unit test for ContentService.getPublishedContent in tests/unit/services/content.service.test.ts"
Task: "Unit test for ContentService.getContentBySlug in tests/unit/services/content.service.test.ts"
Task: "Integration test for GET /api/content endpoint in tests/integration/api/content.test.ts"
Task: "E2E test for homepage displays published news in tests/e2e/public-content.spec.ts"

# Launch all components for User Story 1 together:
Task: "Create ArticleCard component at components/content/ArticleCard.tsx"
Task: "Create ArticleDetail component at components/content/ArticleDetail.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Public Content Browsing)
   - Developer B: User Story 2 (Member Auth & Commenting)
   - Developer C: User Story 3 (Editor Content Management)
   - Developer D: User Story 4 (Admin Features)
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- **Constitution Compliance**: All permission checks must be test-covered (100% coverage)
- **Constitution Compliance**: All content validation must be test-covered
- **Constitution Compliance**: Business logic in services must be unit testable (isolated from Next.js)
