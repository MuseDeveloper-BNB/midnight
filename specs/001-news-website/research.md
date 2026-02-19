# Technology Research: News Website

**Feature**: News Website with Role-Based Access  
**Date**: 2025-01-27  
**Status**: Complete

## Technology Stack Decisions

### Framework: Next.js 14+ (App Router)

**Decision**: Use Next.js App Router for full-stack application

**Rationale**:
- Unified frontend and backend in single codebase (reduces complexity)
- Server Components for optimal performance and SEO
- Server Actions for mutations (type-safe, no API boilerplate)
- Built-in routing, middleware, and API routes
- Strong TypeScript support
- Mature ecosystem and deployment options

**Alternatives Considered**:
- **Remix**: Similar capabilities but smaller ecosystem
- **SvelteKit**: Good performance but less TypeScript maturity
- **Separate frontend/backend**: Adds complexity, violates "predictable behavior" principle

**Constitution Compliance**: ✅
- Separation of concerns maintained (services isolated from Next.js)
- Predictable patterns (standard Next.js conventions)
- Testable business logic (services can be tested independently)

### Authentication: NextAuth.js v5 (Auth.js)

**Decision**: Use NextAuth.js v5 for authentication with email/password and Google OAuth

**Rationale**:
- Unified authentication handling (email/password + OAuth)
- JWT session support with secure cookies
- Server-side session resolution
- Built-in CSRF protection
- Extensible for additional providers
- TypeScript-first design

**Configuration**:
- Email/password provider (credentials)
- Google OAuth provider
- JWT strategy with secure httpOnly cookies
- Session callbacks to include role in session

**Constitution Compliance**: ✅
- Centralized auth module (Principle II)
- Server-side role resolution (Principle III)
- No hardcoded permissions (Principle III)

### Database: PostgreSQL with Prisma ORM

**Decision**: PostgreSQL relational database with Prisma ORM

**Rationale**:
- Relational data model fits content, comments, users, moderation logs
- Prisma provides type-safe database access
- Schema migrations for version control
- Transaction support for data integrity
- Strong performance for read-heavy workloads
- Audit trail support (soft deletes, timestamps)

**Schema Management**:
- Prisma schema defines all entities
- Migrations track schema changes
- Database-level constraints for data integrity

**Constitution Compliance**: ✅
- Data integrity over speed (Principle V)
- Schema-level validation (Principle V)
- Soft deletes for audit trail (Principle V)

### Validation: Zod

**Decision**: Use Zod for runtime type validation

**Rationale**:
- TypeScript-first validation
- Composable schemas
- Runtime type safety
- Clear error messages
- Works with Server Actions and API Routes

**Usage**:
- Input validation for Server Actions
- API request validation
- Form validation schemas

**Constitution Compliance**: ✅
- Content validation and sanitization (Principle VI)
- Testable validation rules (Principle VIII)

### Content Sanitization: DOMPurify

**Decision**: Use DOMPurify for HTML content sanitization (blog posts)

**Rationale**:
- Industry-standard XSS prevention
- Configurable allowlists
- Server-side and client-side support
- Well-maintained and audited

**Usage**:
- Blog post rich text sanitization
- Comment HTML sanitization (if rich text allowed)

**Constitution Compliance**: ✅
- Content sanitization mandatory (Principle VI)
- XSS prevention (Principle VI)

### Testing: Jest + React Testing Library + Playwright

**Decision**: Multi-layer testing strategy

**Rationale**:
- **Jest**: Unit tests for business logic (services)
- **React Testing Library**: Component tests
- **Playwright**: End-to-end user journey tests
- **Supertest**: API route testing

**Test Coverage Requirements**:
- 100% coverage for permission logic (Principle VIII)
- Dedicated test suites for content validation (Principle VIII)
- Integration tests for end-to-end workflows

**Constitution Compliance**: ✅
- Testable business logic (Principle VIII)
- Permission checks test-covered (Principle VIII)

## Architecture Patterns

### Permission System Design

**Pattern**: Centralized permission configuration

**Implementation**:
```typescript
// src/lib/permissions.ts
export const PERMISSIONS = {
  MEMBER: ['read:content', 'create:comment', 'edit:own:comment', 'delete:own:comment', 'report:comment'],
  EDITOR: [...MEMBER, 'create:content', 'edit:content', 'publish:content', 'moderate:comments'],
  ADMIN: [...EDITOR, 'manage:users', 'view:audit', 'change:roles']
} as const;
```

**Constitution Compliance**: ✅
- No hardcoded permissions (Principle III)
- Declarative and testable (Principle III)
- Traceable permission checks (Principle III)

### Service Layer Pattern

**Pattern**: Business logic isolated in service modules

**Implementation**:
- Services are pure TypeScript classes/functions
- No Next.js dependencies in services
- Services can be tested independently
- Services called from Server Actions and API Routes

**Constitution Compliance**: ✅
- Separation of concerns (Principle II)
- Testable business logic (Principle VIII)

### Middleware-Based Authorization

**Pattern**: Route-level authorization via Next.js middleware

**Implementation**:
- Middleware checks role before route access
- Server Actions check permissions before execution
- API Routes validate permissions
- Frontend UI adapts but never enforces (server always validates)

**Constitution Compliance**: ✅
- Role-based access control (Principle III)
- Explicit permission checks (Principle III)

## Security Considerations

### CSRF Protection
- NextAuth.js provides CSRF tokens
- Server Actions use CSRF validation
- API Routes validate origin headers

### Input Validation
- Zod schemas validate all inputs
- Database constraints enforce data integrity
- DOMPurify sanitizes HTML content

### Session Security
- httpOnly cookies (not accessible to JavaScript)
- Secure flag (HTTPS only)
- SameSite strict (CSRF protection)
- JWT tokens signed and verified server-side

### OAuth Security
- State parameter validation
- PKCE for OAuth flows
- Callback URL validation
- Token verification

## Performance Considerations

### Database Indexing
- Index on `content.status` + `content.publishedAt` for published content queries
- Index on `user.email` for authentication lookups
- Index on `comment.contentId` + `comment.deletedAt` for comment queries
- Index on `moderationLog.createdAt` for audit history queries

### Caching Strategy
- Next.js built-in caching for static content
- ISR (Incremental Static Regeneration) for published content
- Server-side caching for frequently accessed data

### Scalability Path
- Database read replicas for scaling reads
- Horizontal scaling via Next.js deployment (Vercel, etc.)
- CDN for static assets
- Database connection pooling

## Deployment Considerations

### Hosting Platform
- **Primary**: Vercel (optimal Next.js support)
- **Alternative**: Any Node.js hosting (Railway, Render, AWS)

### Environment Variables
- Database connection string
- NextAuth.js secret
- Google OAuth credentials
- Email service credentials (if email auth used)

### Database Hosting
- **Primary**: Supabase, Neon, or Railway PostgreSQL
- **Alternative**: Self-hosted PostgreSQL

## Dependencies Summary

### Core
- `next`: ^14.0.0
- `react`: ^18.0.0
- `react-dom`: ^18.0.0
- `typescript`: ^5.0.0

### Authentication
- `next-auth`: ^5.0.0 (Auth.js)
- `@auth/prisma-adapter`: For Prisma integration

### Database
- `@prisma/client`: Prisma ORM client
- `prisma`: Prisma CLI

### Validation & Sanitization
- `zod`: Runtime validation
- `dompurify`: HTML sanitization
- `isomorphic-dompurify`: Server-side DOMPurify

### Utilities
- `bcryptjs`: Password hashing
- `date-fns`: Date manipulation

### Development
- `@types/node`: Node.js types
- `@types/react`: React types
- `eslint`: Linting
- `prettier`: Code formatting

### Testing
- `jest`: Unit testing
- `@testing-library/react`: Component testing
- `@playwright/test`: E2E testing
- `supertest`: API testing

## Open Questions Resolved

1. **Q**: Should we use Server Actions or API Routes?
   **A**: Server Actions for mutations (type-safe, simpler), API Routes for external integrations (OAuth callbacks)

2. **Q**: How to handle OAuth with unified accounts?
   **A**: NextAuth.js handles account linking - same user can login via email or Google, unified account

3. **Q**: How to enforce permissions server-side?
   **A**: Middleware for routes, permission checks in Server Actions and API Routes

4. **Q**: How to handle soft deletes?
   **A**: `deletedAt` timestamp column, queries filter out deleted records, admin views show all

5. **Q**: How to audit moderation actions?
   **A**: ModerationLog entity tracks all actions with timestamp, moderator, and action details

## References

- [Next.js App Router Documentation](https://nextjs.org/docs/app)
- [NextAuth.js v5 Documentation](https://authjs.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Zod Documentation](https://zod.dev/)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)
