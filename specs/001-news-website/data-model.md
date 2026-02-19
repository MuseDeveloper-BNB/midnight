# Data Model: News Website

**Feature**: News Website with Role-Based Access  
**Date**: 2025-01-27  
**Status**: Complete

## Database Schema (Prisma)

### Overview

The database uses PostgreSQL with Prisma ORM. All tables include `createdAt` and `updatedAt` timestamps for audit purposes. Soft deletes are used for user-generated content (comments) to preserve audit trails.

### Entity Relationship Diagram

```
User (1) ──< (many) Content (News/BlogPost)
User (1) ──< (many) Comment
Content (1) ──< (many) Comment
User (1) ──< (many) Report
Comment (1) ──< (many) Report
User (1) ──< (many) ModerationLog (as moderator)
```

### Entities

#### User

Represents system users with authentication credentials and role assignment.

**Fields**:
- `id`: String (UUID, primary key)
- `email`: String (unique, indexed)
- `name`: String (nullable, display name)
- `password`: String (nullable, hashed, only for email/password auth)
- `role`: Enum (MEMBER | EDITOR | ADMIN, default: MEMBER)
- `provider`: Enum (EMAIL | GOOGLE, default: EMAIL)
- `providerId`: String (nullable, OAuth provider user ID)
- `active`: Boolean (default: true, for deactivation)
- `emailVerified`: DateTime (nullable, for email verification)
- `image`: String (nullable, profile image URL)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Indexes**:
- `email` (unique index)
- `provider` + `providerId` (composite index for OAuth lookups)

**Relations**:
- `authoredContent`: Content[] (content created by this user)
- `comments`: Comment[] (comments written by this user)
- `reports`: Report[] (reports submitted by this user)
- `moderationActions`: ModerationLog[] (moderation actions performed by this user)

**Constitution Compliance**:
- Role stored in database (not hardcoded)
- Active flag for deactivation (soft delete for users)
- Audit timestamps (createdAt, updatedAt)

#### Content (Base Entity)

Base entity for News and BlogPost. Uses single-table inheritance pattern with `type` discriminator.

**Fields**:
- `id`: String (UUID, primary key)
- `type`: Enum (NEWS | BLOG, discriminator)
- `title`: String (required, max length: 255)
- `body`: String (required, text field)
- `slug`: String (unique, indexed, URL-friendly identifier)
- `status`: Enum (DRAFT | PUBLISHED | ARCHIVED, default: DRAFT)
- `authorId`: String (foreign key to User)
- `publishedAt`: DateTime (nullable, set when status changes to PUBLISHED)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Indexes**:
- `slug` (unique index)
- `status` + `publishedAt` (composite index for published content queries)
- `authorId` (index for author lookups)
- `type` + `status` + `publishedAt` (composite index for content type queries)

**Relations**:
- `author`: User (user who created the content)
- `comments`: Comment[] (comments on this content)

**Constitution Compliance**:
- Status enforced at database level (enum constraint)
- Soft delete not needed (status-based visibility)
- Audit timestamps (createdAt, updatedAt, publishedAt)

**Notes**:
- Blog posts can have richer formatting stored in `body` (HTML/Markdown)
- News articles use plain text or simple formatting
- Slug is auto-generated from title (URL-friendly)

#### Comment

User comments on content items with moderation support.

**Fields**:
- `id`: String (UUID, primary key)
- `body`: String (required, text field, sanitized HTML)
- `contentId`: String (foreign key to Content)
- `authorId`: String (foreign key to User)
- `status`: Enum (VISIBLE | HIDDEN | DELETED, default: VISIBLE)
- `deletedAt`: DateTime (nullable, soft delete timestamp)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Indexes**:
- `contentId` + `status` + `deletedAt` (composite index for visible comments query)
- `authorId` (index for user's comments)
- `contentId` + `createdAt` (index for chronological comment display)

**Relations**:
- `content`: Content (parent content item)
- `author`: User (user who wrote the comment)
- `reports`: Report[] (reports about this comment)

**Constitution Compliance**:
- Soft delete via `deletedAt` timestamp (Principle V)
- Status for moderation (VISIBLE, HIDDEN, DELETED)
- Audit timestamps (createdAt, updatedAt, deletedAt)

**Notes**:
- `deletedAt` is set when comment is deleted (soft delete)
- `status` can be HIDDEN by moderators (still stored, not publicly visible)
- Comments are filtered by `status = VISIBLE AND deletedAt IS NULL` for public display

#### Report

Member reports of inappropriate comments.

**Fields**:
- `id`: String (UUID, primary key)
- `commentId`: String (foreign key to Comment)
- `reporterId`: String (foreign key to User)
- `reason`: String (nullable, text field, reason for report)
- `status`: Enum (PENDING | REVIEWED | RESOLVED, default: PENDING)
- `createdAt`: DateTime (auto-generated)
- `updatedAt`: DateTime (auto-updated)

**Indexes**:
- `commentId` (index for comment lookups)
- `reporterId` (index for reporter lookups)
- `status` + `createdAt` (composite index for pending reports query)

**Relations**:
- `comment`: Comment (reported comment)
- `reporter`: User (user who submitted the report)

**Constitution Compliance**:
- Audit timestamps (createdAt, updatedAt)
- Status tracking for moderation workflow

#### ModerationLog

Immutable audit log of all moderation actions.

**Fields**:
- `id`: String (UUID, primary key)
- `action`: Enum (HIDE_COMMENT | DELETE_COMMENT | PUBLISH_CONTENT | UNPUBLISH_CONTENT | ARCHIVE_CONTENT | CHANGE_ROLE | DEACTIVATE_USER, required)
- `targetType`: Enum (COMMENT | CONTENT | USER, required)
- `targetId`: String (required, ID of target entity)
- `moderatorId`: String (foreign key to User)
- `details`: Json (nullable, additional action details)
- `createdAt`: DateTime (auto-generated, immutable)

**Indexes**:
- `moderatorId` (index for moderator lookups)
- `targetType` + `targetId` (composite index for target entity lookups)
- `action` + `createdAt` (composite index for action type queries)
- `createdAt` (index for date range queries)

**Relations**:
- `moderator`: User (user who performed the action)

**Constitution Compliance**:
- Immutable log (createdAt only, no updatedAt)
- Timestamps and moderator identity (Principle VII)
- Queryable audit history (Principle VII)

**Notes**:
- `details` JSON field stores action-specific data:
  - For role changes: `{ oldRole: "MEMBER", newRole: "EDITOR" }`
  - For content status changes: `{ oldStatus: "DRAFT", newStatus: "PUBLISHED" }`
  - For comment moderation: `{ reason: "..." }`

### Enums

#### UserRole
```prisma
enum UserRole {
  MEMBER
  EDITOR
  ADMIN
}
```

#### AuthProvider
```prisma
enum AuthProvider {
  EMAIL
  GOOGLE
}
```

#### ContentType
```prisma
enum ContentType {
  NEWS
  BLOG
}
```

#### ContentStatus
```prisma
enum ContentStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}
```

#### CommentStatus
```prisma
enum CommentStatus {
  VISIBLE
  HIDDEN
  DELETED
}
```

#### ReportStatus
```prisma
enum ReportStatus {
  PENDING
  REVIEWED
  RESOLVED
}
```

#### ModerationAction
```prisma
enum ModerationAction {
  HIDE_COMMENT
  DELETE_COMMENT
  PUBLISH_CONTENT
  UNPUBLISH_CONTENT
  ARCHIVE_CONTENT
  CHANGE_ROLE
  DEACTIVATE_USER
}
```

#### ModerationTargetType
```prisma
enum ModerationTargetType {
  COMMENT
  CONTENT
  USER
}
```

### Prisma Schema Example

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String        @id @default(uuid())
  email         String        @unique
  name          String?
  password      String?       // Hashed, only for email/password auth
  role          UserRole      @default(MEMBER)
  provider      AuthProvider  @default(EMAIL)
  providerId    String?       // OAuth provider user ID
  active        Boolean       @default(true)
  emailVerified DateTime?
  image         String?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  // Relations
  authoredContent      Content[]         @relation("ContentAuthor")
  comments             Comment[]
  reports              Report[]
  moderationActions    ModerationLog[]

  @@index([email])
  @@index([provider, providerId])
}

model Content {
  id         String        @id @default(uuid())
  type       ContentType
  title      String        @db.VarChar(255)
  body       String        @db.Text
  slug       String        @unique
  status     ContentStatus @default(DRAFT)
  authorId   String
  publishedAt DateTime?
  createdAt  DateTime      @default(now())
  updatedAt  DateTime      @updatedAt

  // Relations
  author     User          @relation("ContentAuthor", fields: [authorId], references: [id])
  comments   Comment[]

  @@index([slug])
  @@index([status, publishedAt])
  @@index([authorId])
  @@index([type, status, publishedAt])
}

model Comment {
  id        String        @id @default(uuid())
  body      String        @db.Text
  contentId String
  authorId  String
  status    CommentStatus @default(VISIBLE)
  deletedAt DateTime?
  createdAt DateTime      @default(now())
  updatedAt DateTime      @updatedAt

  // Relations
  content   Content      @relation(fields: [contentId], references: [id], onDelete: Cascade)
  author    User         @relation(fields: [authorId], references: [id])
  reports   Report[]

  @@index([contentId, status, deletedAt])
  @@index([authorId])
  @@index([contentId, createdAt])
}

model Report {
  id         String       @id @default(uuid())
  commentId  String
  reporterId String
  reason     String?      @db.Text
  status     ReportStatus @default(PENDING)
  createdAt  DateTime     @default(now())
  updatedAt  DateTime     @updatedAt

  // Relations
  comment    Comment      @relation(fields: [commentId], references: [id], onDelete: Cascade)
  reporter   User         @relation(fields: [reporterId], references: [id])

  @@index([commentId])
  @@index([reporterId])
  @@index([status, createdAt])
}

model ModerationLog {
  id         String              @id @default(uuid())
  action     ModerationAction
  targetType ModerationTargetType
  targetId   String
  moderatorId String
  details    Json?
  createdAt  DateTime            @default(now())

  // Relations
  moderator  User                @relation(fields: [moderatorId], references: [id])

  @@index([moderatorId])
  @@index([targetType, targetId])
  @@index([action, createdAt])
  @@index([createdAt])
}
```

### Database Constraints

**Data Integrity**:
- Foreign key constraints enforce referential integrity
- Unique constraints on `User.email` and `Content.slug`
- Enum constraints enforce valid values
- NOT NULL constraints on required fields

**Soft Delete Pattern**:
- Comments use `deletedAt` timestamp (NULL = not deleted)
- Public queries filter: `WHERE deletedAt IS NULL AND status = 'VISIBLE'`
- Admin queries can include deleted records

**Audit Trail**:
- All tables have `createdAt` timestamp
- Most tables have `updatedAt` timestamp
- ModerationLog is immutable (no `updatedAt`)
- Content tracks `publishedAt` for publication date

### Query Patterns

#### Published Content Query
```sql
SELECT * FROM Content
WHERE status = 'PUBLISHED'
  AND publishedAt IS NOT NULL
ORDER BY publishedAt DESC
LIMIT 20;
```

#### Visible Comments Query
```sql
SELECT * FROM Comment
WHERE contentId = ?
  AND status = 'VISIBLE'
  AND deletedAt IS NULL
ORDER BY createdAt ASC;
```

#### Moderation History Query
```sql
SELECT * FROM ModerationLog
WHERE createdAt >= ?
  AND createdAt <= ?
ORDER BY createdAt DESC;
```

### Migration Strategy

1. Initial migration creates all tables and indexes
2. Future migrations add columns or modify constraints
3. Data migrations handled via Prisma migration scripts
4. Rollback support via Prisma migration rollback

### Constitution Compliance Summary

✅ **Principle V (Data Integrity)**:
- Database constraints enforce data integrity
- Transactions for critical operations
- Soft deletes preserve audit trails

✅ **Principle III (RBAC)**:
- Role stored in database (not hardcoded)
- Role changes tracked in ModerationLog

✅ **Principle VII (Audit Visibility)**:
- ModerationLog tracks all moderation actions
- Timestamps on all entities
- Immutable audit log

✅ **Principle VI (Validation)**:
- Database-level constraints (enums, NOT NULL, unique)
- Application-level validation via Zod schemas
