# Implementation Plan: News Website with Role-Based Access

**Branch**: `001-news-website` | **Date**: 2025-01-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-news-website/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Build a full-stack Next.js news website with three user roles (Member, Editor, Admin) supporting content management, commenting, and moderation. The application uses Next.js App Router for unified frontend and backend, Server Actions for mutations, API Routes for external integrations, and a relational database with ORM for data persistence. Authentication supports both email/password and Google OAuth with unified accounts. Role-based authorization is enforced server-side through middleware and permission checks at API routes, Server Actions, and page access levels.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 20.x LTS  
**Primary Dependencies**: Next.js 14+ (App Router), React 18+, Prisma ORM, NextAuth.js v5 (Auth.js), zod for validation  
**Storage**: PostgreSQL (relational database) with Prisma ORM for schema management and migrations  
**Testing**: Jest, React Testing Library, Playwright for E2E, Supertest for API testing  
**Target Platform**: Web application (modern browsers, responsive design)  
**Project Type**: Web application (full-stack Next.js)  
**Performance Goals**: 
- Page load: <2s for 95% of requests (SC-002)
- API response: <500ms p95 for authenticated operations
- Support 1,000 concurrent users browsing content (SC-005)
**Constraints**: 
- Server-side rendering for SEO and performance
- Secure cookie-based sessions (httpOnly, secure, sameSite)
- CSRF protection required
- Input validation and sanitization mandatory
- Soft deletes for audit trail preservation
**Scale/Scope**: 
- Initial: 1,000 concurrent users, 10k articles, 100k comments
- Scalable to 10k concurrent users, 100k articles, 1M comments
- Multi-tenant ready (single instance, role-based access)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principle I: Clean, Readable, and Maintainable Code
- TypeScript for type safety and clarity
- Clear module boundaries (auth, content, comments, moderation)
- Consistent naming conventions enforced by ESLint/Prettier

### ✅ Principle II: Separation of Concerns (NON-NEGOTIABLE)
- **Auth Module**: Authentication and session management (NextAuth.js)
- **Content Module**: News and blog post management
- **Comments Module**: Comment CRUD and member interactions
- **Moderation Module**: Comment moderation and reporting
- **Admin Module**: User management and system administration
- Clear boundaries with explicit dependencies

### ✅ Principle III: Role-Based Access Control (NON-NEGOTIABLE)
- Centralized permission configuration (permissions config file)
- Middleware-based route protection
- Server-side permission checks in Server Actions and API Routes
- No hardcoded permissions - all role checks reference central config
- Permission checks are testable and traceable

### ✅ Principle IV: Predictable Behavior Over Clever Solutions
- Standard Next.js patterns (App Router, Server Actions)
- Explicit permission checks (no magic middleware)
- Clear error handling with user-friendly messages
- Standard database patterns (ORM, transactions)

### ✅ Principle V: Data Integrity Over Speed
- Database transactions for critical operations
- Schema-level validation (Prisma schema constraints)
- Soft deletes for comments (deleted_at column)
- Audit logs with immutable records

### ✅ Principle VI: Content Validation and Sanitization (NON-NEGOTIABLE)
- Zod schemas for input validation
- DOMPurify for HTML sanitization (blog posts)
- SQL injection prevention via Prisma parameterized queries
- XSS prevention through sanitization

### ✅ Principle VII: Audit Visibility for Editors and Admins
- ModerationLog entity tracks all moderation actions
- Timestamps and moderator identity logged
- Queryable audit history for admins
- Immutable log entries

### ✅ Principle VIII: Testable Business Logic (NON-NEGOTIABLE)
- Business logic isolated in service modules
- Permission checks in dedicated authorization service
- Unit tests for business logic (isolated from Next.js)
- Integration tests for end-to-end workflows

### ✅ Principle IX: Acceptance Criteria Before Features
- All user stories have defined acceptance scenarios in spec.md
- Test cases map to acceptance scenarios

### ✅ Principle X: Future Scalability Considerations
- Database indexes for common queries (published content, user lookups)
- API design supports versioning
- Modular architecture enables horizontal scaling
- Clear separation allows microservices migration if needed

## Project Structure

### Documentation (this feature)

```text
specs/001-news-website/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/          # Phase 1 output (/speckit.plan command)
│   ├── api-auth.md
│   ├── api-content.md
│   ├── api-comments.md
│   └── api-admin.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
app/                          # Next.js App Router
├── (public)/                 # Public routes (no auth required)
│   ├── page.tsx             # Homepage (latest news)
│   ├── news/
│   │   ├── page.tsx         # News list
│   │   └── [slug]/
│   │       └── page.tsx     # News detail
│   └── blog/
│       ├── page.tsx         # Blog list
│       └── [slug]/
│           └── page.tsx     # Blog detail
├── (auth)/                   # Auth routes
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── api/
│       └── auth/
│           └── [...nextauth]/
│               └── route.ts  # NextAuth.js handler
├── (member)/                 # Member routes (require MEMBER+)
│   ├── profile/
│   │   └── page.tsx
│   └── layout.tsx           # Member layout with nav
├── (editor)/                 # Editor routes (require EDITOR+)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── content/
│   │   ├── new/
│   │   │   └── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── layout.tsx           # Editor layout with nav
├── (admin)/                  # Admin routes (require ADMIN)
│   ├── dashboard/
│   │   └── page.tsx
│   ├── users/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── layout.tsx           # Admin layout with nav
├── api/                      # API Routes
│   ├── content/
│   │   └── route.ts
│   ├── comments/
│   │   └── route.ts
│   └── admin/
│       └── route.ts
└── layout.tsx                # Root layout

src/
├── lib/
│   ├── auth.ts              # Auth configuration (NextAuth.js)
│   ├── db.ts                # Prisma client singleton
│   └── permissions.ts       # Centralized permission config
├── services/                # Business logic (isolated, testable)
│   ├── auth/
│   │   └── auth.service.ts
│   ├── content/
│   │   └── content.service.ts
│   ├── comments/
│   │   └── comments.service.ts
│   ├── moderation/
│   │   └── moderation.service.ts
│   └── admin/
│       └── admin.service.ts
├── actions/                 # Server Actions
│   ├── auth/
│   │   ├── login.action.ts
│   │   └── register.action.ts
│   ├── content/
│   │   ├── create.action.ts
│   │   ├── update.action.ts
│   │   └── publish.action.ts
│   ├── comments/
│   │   ├── create.action.ts
│   │   ├── update.action.ts
│   │   └── delete.action.ts
│   └── admin/
│       ├── update-role.action.ts
│       └── deactivate-user.action.ts
├── middleware/             # Authorization middleware
│   ├── auth.middleware.ts
│   └── permissions.middleware.ts
├── utils/
│   ├── validation.ts       # Zod schemas
│   ├── sanitization.ts     # Content sanitization (DOMPurify)
│   └── errors.ts           # Error handling utilities
└── types/
    └── index.ts            # Shared TypeScript types

components/                  # React components
├── ui/                     # Shared UI components
│   ├── Button.tsx
│   ├── Input.tsx
│   └── Card.tsx
├── content/
│   ├── ArticleCard.tsx
│   ├── ArticleDetail.tsx
│   └── ContentEditor.tsx
├── comments/
│   ├── CommentList.tsx
│   ├── CommentForm.tsx
│   └── CommentItem.tsx
└── admin/
    ├── UserList.tsx
    └── ModerationHistory.tsx

prisma/
├── schema.prisma           # Database schema
└── migrations/             # Migration files

tests/
├── unit/                   # Unit tests (business logic)
│   ├── services/
│   └── utils/
├── integration/            # Integration tests
│   ├── api/
│   └── actions/
└── e2e/                    # End-to-end tests (Playwright)
    ├── auth.spec.ts
    ├── content.spec.ts
    └── comments.spec.ts

public/                     # Static assets
├── images/
└── favicon.ico

.env.example                # Environment variables template
next.config.js              # Next.js configuration
tsconfig.json               # TypeScript configuration
jest.config.js              # Jest configuration
playwright.config.ts        # Playwright configuration
```

**Structure Decision**: Single Next.js application using App Router with clear separation of concerns:
- **app/**: Next.js routes organized by access level (public, auth, member, editor, admin)
- **src/lib/**: Core configuration (auth, database, permissions)
- **src/services/**: Business logic isolated from Next.js (testable)
- **src/actions/**: Server Actions for mutations (Next.js-specific)
- **src/middleware/**: Authorization and permission checks
- **components/**: React UI components organized by feature
- **prisma/**: Database schema and migrations
- **tests/**: Test suites organized by test type

This structure follows Next.js App Router conventions while maintaining constitution-compliant separation of concerns.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations identified. Architecture follows constitution principles:
- Clear module boundaries (auth, content, comments, moderation, admin)
- Centralized permissions configuration
- Business logic isolated in services (testable)
- Standard Next.js patterns (no clever solutions)
- Database transactions for data integrity
- Input validation and sanitization planned
- Audit logging via ModerationLog entity
