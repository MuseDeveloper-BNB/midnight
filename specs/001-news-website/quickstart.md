# Quickstart Guide: News Website

**Feature**: News Website with Role-Based Access  
**Date**: 2025-01-27  
**Status**: Complete

## Prerequisites

- Node.js 20.x LTS or higher
- PostgreSQL 14+ (local or cloud instance)
- npm or yarn package manager
- Git

## Initial Setup

### 1. Clone and Install

```bash
# Clone repository (if applicable)
git clone <repository-url>
cd MIDNIGHT_NEWS

# Install dependencies
npm install
# or
yarn install
```

### 2. Environment Variables

Create `.env` file in project root:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/midnight_news?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-a-random-secret-here" # Use: openssl rand -base64 32

# Google OAuth (optional, for Google login)
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Node Environment
NODE_ENV="development"
```

**Generate NEXTAUTH_SECRET**:
```bash
openssl rand -base64 32
```

### 3. Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed database with test data
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
# or
yarn dev
```

Application will be available at `http://localhost:3000`

## Development Workflow

### Database Migrations

When schema changes are needed:

```bash
# Create migration
npx prisma migrate dev --name descriptive-migration-name

# Apply migrations in production
npx prisma migrate deploy
```

### Prisma Studio (Database GUI)

```bash
npx prisma studio
```

Opens Prisma Studio at `http://localhost:5555` for database inspection.

### Type Generation

Prisma client is auto-generated, but if needed:

```bash
npx prisma generate
```

## Project Structure Overview

```
app/                    # Next.js App Router routes
├── (public)/           # Public pages (no auth)
├── (auth)/             # Auth pages (login, register)
├── (member)/           # Member routes (require MEMBER+)
├── (editor)/           # Editor routes (require EDITOR+)
└── (admin)/            # Admin routes (require ADMIN)

src/
├── lib/                # Core configuration
│   ├── auth.ts        # NextAuth.js config
│   ├── db.ts          # Prisma client
│   └── permissions.ts # Permission definitions
├── services/           # Business logic (testable)
├── actions/           # Server Actions
├── middleware/        # Authorization middleware
└── utils/             # Utilities (validation, sanitization)

components/            # React components
prisma/               # Database schema
tests/                # Test suites
```

## Key Development Tasks

### Creating a Server Action

1. Create action file in `src/actions/[module]/[action].action.ts`
2. Add permission check
3. Validate input with Zod
4. Call service layer
5. Return result or error

Example:
```typescript
// src/actions/content/create.action.ts
'use server'

import { requireRole } from '@/lib/permissions'
import { createContentSchema } from '@/utils/validation'
import { contentService } from '@/services/content/content.service'

export async function createContentAction(data: unknown) {
  const user = await requireRole(['EDITOR', 'ADMIN'])
  const validated = createContentSchema.parse(data)
  return await contentService.create(validated, user.id)
}
```

### Creating a Service

1. Create service file in `src/services/[module]/[module].service.ts`
2. Keep business logic isolated from Next.js
3. Use Prisma client for database operations
4. Return typed results

Example:
```typescript
// src/services/content/content.service.ts
import { db } from '@/lib/db'
import type { Content, UserRole } from '@/types'

export class ContentService {
  async create(data: CreateContentInput, authorId: string): Promise<Content> {
    return await db.content.create({
      data: { ...data, authorId }
    })
  }
}

export const contentService = new ContentService()
```

### Adding a Permission Check

1. Use centralized permission config in `src/lib/permissions.ts`
2. Check permissions in middleware or Server Actions
3. Never hardcode permissions

Example:
```typescript
// src/lib/permissions.ts
export const PERMISSIONS = {
  MEMBER: ['read:content', 'create:comment'],
  EDITOR: [...PERMISSIONS.MEMBER, 'create:content', 'moderate:comments'],
  ADMIN: [...PERMISSIONS.EDITOR, 'manage:users']
}

export async function requireRole(allowedRoles: UserRole[]) {
  const session = await getServerSession()
  if (!session || !allowedRoles.includes(session.user.role)) {
    throw new Error('Unauthorized')
  }
  return session.user
}
```

## Testing

### Unit Tests

```bash
npm run test
# or
yarn test
```

### Integration Tests

```bash
npm run test:integration
```

### E2E Tests

```bash
npm run test:e2e
```

### Test Coverage

```bash
npm run test:coverage
```

## Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server

# Database
npx prisma studio        # Open Prisma Studio
npx prisma migrate dev   # Create and apply migration
npx prisma generate      # Generate Prisma client

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier
npm run type-check       # TypeScript type check

# Testing
npm run test             # Run unit tests
npm run test:watch       # Watch mode
npm run test:e2e         # E2E tests
```

## Creating Test Users

### Via Prisma Studio

1. Open Prisma Studio: `npx prisma studio`
2. Navigate to User table
3. Click "Add record"
4. Fill in:
   - email: `member@example.com`
   - role: `MEMBER`
   - password: (hashed via bcrypt)
   - active: `true`

### Via Seed Script

Create `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10)
  
  await prisma.user.create({
    data: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: hashedPassword,
      role: 'ADMIN',
      active: true
    }
  })
  
  // Add more test users...
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

Run seed:
```bash
npx prisma db seed
```

## Authentication Flow

### Email/Password Login

1. User submits email/password on `/login`
2. Server Action validates credentials
3. NextAuth.js creates session with JWT
4. Session stored in secure httpOnly cookie
5. User redirected to appropriate dashboard

### Google OAuth Login

1. User clicks "Sign in with Google"
2. Redirected to Google OAuth consent
3. Google redirects back with authorization code
4. NextAuth.js exchanges code for tokens
5. User account created/linked if needed
6. Session created and user redirected

## Role-Based Access

### Route Protection

Routes are protected via Next.js middleware:

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = await getServerSession()
  const role = session?.user?.role
  
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (role !== 'ADMIN') {
      return NextResponse.redirect('/login')
    }
  }
  // ... more checks
}
```

### Server Action Protection

Server Actions check permissions:

```typescript
export async function adminAction() {
  await requireRole(['ADMIN'])
  // ... action logic
}
```

## Debugging

### Database Queries

Enable Prisma query logging:

```typescript
// src/lib/db.ts
export const db = new PrismaClient({
  log: ['query', 'error', 'warn'],
})
```

### Next.js Debugging

```bash
DEBUG=* npm run dev
```

### Session Debugging

Check session in Server Component:

```typescript
import { getServerSession } from 'next-auth'

export default async function Page() {
  const session = await getServerSession()
  console.log('Session:', session)
  // ...
}
```

## Deployment Checklist

- [ ] Set production `DATABASE_URL`
- [ ] Set production `NEXTAUTH_URL` (your domain)
- [ ] Generate production `NEXTAUTH_SECRET`
- [ ] Configure Google OAuth redirect URIs
- [ ] Run database migrations: `npx prisma migrate deploy`
- [ ] Build application: `npm run build`
- [ ] Set environment variables in hosting platform
- [ ] Configure domain and SSL certificate

## Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check PostgreSQL is running
- Verify network access (for cloud databases)

### Authentication Issues

- Verify `NEXTAUTH_SECRET` is set
- Check `NEXTAUTH_URL` matches your domain
- Verify OAuth callback URLs are configured

### Permission Errors

- Check user role in database
- Verify permission checks in code
- Check middleware is running correctly

### Migration Issues

- Check Prisma schema is valid: `npx prisma validate`
- Review migration SQL: `npx prisma migrate dev --create-only`
- Reset database (dev only): `npx prisma migrate reset`

## Next Steps

1. Review [data-model.md](./data-model.md) for database schema
2. Review [contracts/](./contracts/) for API contracts
3. Review [research.md](./research.md) for technology decisions
4. Start implementing tasks from `tasks.md` (generated by `/speckit.tasks`)

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://authjs.dev/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
