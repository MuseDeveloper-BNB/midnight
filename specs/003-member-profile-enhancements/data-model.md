# Data Model: Enhanced Member Profile

**Feature**: Enhanced Member Profile  
**Date**: 2025-01-28  
**Status**: Complete

## Overview

The feature reuses the existing schema (User, Comment, Content, etc.) from [001-news-website data-model](../001-news-website/data-model.md) and adds a **SavedItem** join entity for saved news/blog. No changes to User, Comment, or Content field definitions; only new relations and the SavedItem model.

## Delta: New Entity and Relations

### SavedItem (new)

Join table linking members to saved content. One row per (user, content) pair.

**Fields**:

| Field      | Type     | Description                                |
|-----------|----------|--------------------------------------------|
| `id`      | String   | UUID, primary key                          |
| `userId`  | String   | FK to User                                 |
| `contentId` | String | FK to Content                              |
| `createdAt` | DateTime | When the item was saved (default: now)   |

**Constraints**:

- `@@unique([userId, contentId])`: no duplicate saves per user per article.
- `onDelete: Cascade` on both FKs: remove saved items when user or content is deleted.

**Indexes**:

- `userId`: list saved by user, paginated.
- `(userId, contentId)`: uniqueness and “is saved?” lookup.

**Relations**:

- `user`: User (owner).
- `content`: Content (saved article).

**Constitution**:

- Data integrity via unique constraint and FKs.
- Indexes support profile list and save/unsave checks (Principle X).

### User (existing; relation added)

Add relation:

- `savedItems`: SavedItem[]

No new fields. `name`, `email` remain the editable profile fields (see spec and api-profile contract).

### Content (existing; relation added)

Add relation:

- `savedItems`: SavedItem[]

No new fields. Used to resolve saved article title, type, slug, publishedAt for the Saved list.

### Comment (unchanged)

Already has `authorId` and `contentId`. “My comments” uses `Comment.authorId = currentUser.id` with `content` included for source article link. Filter by `status = VISIBLE` and `deletedAt IS NULL` per spec (hidden/deleted omitted from history).

---

## Prisma Schema Delta

Add the following model and relation wires.

```prisma
model SavedItem {
  id        String   @id @default(uuid())
  userId    String
  contentId String
  createdAt DateTime @default(now())

  user    User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  content Content @relation(fields: [contentId], references: [id], onDelete: Cascade)

  @@unique([userId, contentId])
  @@index([userId])
  @@index([userId, contentId])
}
```

**User** — add:

```prisma
savedItems SavedItem[]
```

**Content** — add:

```prisma
savedItems SavedItem[]
```

---

## Query Patterns

### My comments (paginated)

- Filter: `Comment.authorId = userId`, `status = VISIBLE`, `deletedAt IS NULL`.
- Include: `content` (id, title, type, slug, status, publishedAt) for link and “unavailable” handling.
- Order: `createdAt DESC`.
- Paginate: `skip` / `take` (offset) or cursor; default page size ~10–20.

### Saved list (paginated)

- Filter: `SavedItem.userId = userId`.
- Include: `content` (id, title, type, slug, status, publishedAt).
- Order: `SavedItem.createdAt DESC`.
- Paginate: same as comments.
- When displaying, omit or mark “unavailable” if `content.status !== PUBLISHED` or content missing (FR-010).

### Is article saved?

- `SavedItem` findUnique where `userId` + `contentId`; existence => saved.

### Save

- Create `SavedItem` for `(userId, contentId)`. Ignore unique violation if already saved (idempotent).

### Unsave

- Delete `SavedItem` where `userId` + `contentId`.

---

## Migration

1. Add `SavedItem` model and User/Content relations.
2. Create migration: `npx prisma migrate dev --name add_saved_item`.
3. No data migration; existing tables unchanged.

---

## Constitution Compliance

- **Principle V**: Unique constraint and FKs; cascade deletes keep referential integrity.
- **Principle X**: Indexes on `userId` and `(userId, contentId)` for scale.
- **Principle VII**: No new audit entity; saved-item add/remove are self-service, not moderation.
