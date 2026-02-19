# API Contract: Saved Content

**Feature**: Enhanced Member Profile  
**Date**: 2025-01-28  
**Status**: Complete

## Overview

Saved content allows members to save and unsave news or blog articles and to view a "Saved" list on their profile. Operations are Server Actions; the article page uses a Save/Unsave control that reflects current state. All require MEMBER (or EDITOR/ADMIN).

## Server Actions

### saveContentAction

Add an article to the current user's saved list. Idempotent when already saved.

**Path**: `src/actions/saved/save.action.ts`

**Required Role**: `MEMBER`, `EDITOR`, or `ADMIN`

**Request**:

```typescript
{
  contentId: string;  // UUID of the news or blog article
}
```

**Response**:

```typescript
{
  success: boolean;
  error?: string;
}
```

**Validation**:

- `contentId` required, valid UUID.
- Content must exist and typically be published (allow saving only published articles; exact rule can be defined in implementation).

**Errors**:

- `400`: Invalid `contentId` or content not saveable.
- `404`: Content not found.
- `401`: Not authenticated.
- `403`: Insufficient role.
- `429` or equivalent: Rate limit exceeded; clear, non-blocking message (FR-013).
- `500`: Server error.

**Behavior**:

- Resolve session; enforce MEMBER+.
- Rate-limit per user (FR-013).
- Create `SavedItem` for `(userId, contentId)`. On unique violation, treat as success (idempotent).

**Loading & error (FR-011, FR-014)**:

- Show loading state (e.g. disabled button or spinner) while request in flight.
- On network or server failure: show explicit error message and optional retry; do not fail silently.

---

### unsaveContentAction

Remove an article from the current user's saved list. Idempotent when not saved.

**Path**: `src/actions/saved/unsave.action.ts`

**Required Role**: `MEMBER`, `EDITOR`, or `ADMIN`

**Request**:

```typescript
{
  contentId: string;
}
```

**Response**:

```typescript
{
  success: boolean;
  error?: string;
}
```

**Behavior**:

- Rate-limit per user (FR-013).
- Delete `SavedItem` where `userId` + `contentId`. If none exists, treat as success (idempotent).
- On failure: explicit error + optional retry (FR-014); loading state while in flight (FR-011).

---

### listSavedAction (optional)

Return the current user's saved list, paginated. Used by the profile page Saved section if data is fetched via an action rather than services directly.

**Path**: `src/actions/saved/list-saved.action.ts` (or equivalent)

**Required Role**: `MEMBER`, `EDITOR`, or `ADMIN`

**Request**:

```typescript
{
  page?: number;     // 1-based; default 1
  pageSize?: number; // Default e.g. 10–20
}
```

**Response**:

```typescript
{
  success: boolean;
  items?: Array<{
    id: string;
    contentId: string;
    createdAt: string;
    content: {
      id: string;
      title: string;
      type: 'NEWS' | 'BLOG';
      slug: string;
      status: string;
      publishedAt: string | null;
    } | null;  // null if content missing/unpublished → "unavailable"
  }>;
  total?: number;
  error?: string;
}
```

**Behavior**:

- Order by `createdAt` DESC.
- Omit or mark "unavailable" items whose content is missing or not published (FR-010).
- Empty list when no saved items → profile shows "No saved articles yet" (FR-007).

---

### isSavedAction (optional)

Check whether the current user has saved a given article. Used by the article page to show Save vs Unsave state.

**Path**: `src/actions/saved/is-saved.action.ts` (or equivalent)

**Required Role**: `MEMBER`, `EDITOR`, or `ADMIN`

**Request**:

```typescript
{
  contentId: string;
}
```

**Response**:

```typescript
{
  saved: boolean;
  error?: string;
}
```

**Behavior**:

- Lookup `SavedItem` by `(userId, contentId)`; return `{ saved: true }` or `{ saved: false }`.

---

## Article Page Integration

- **Save control**: On news/blog detail page, show "Save" or "Unsave" (or equivalent) based on `isSavedAction` (or equivalent check).
- **Actions**: "Save" calls `saveContentAction`; "Unsave" calls `unsaveContentAction`. Update UI state after success (e.g. refetch or optimistic toggle).
- **Loading (FR-011)**: Show loading state (disabled control or spinner) while save/unsave in progress.
- **Error (FR-014)**: On failure, show explicit error message and optional retry; do not fail silently.
- **Accessibility (FR-012)**: SaveButton MUST meet WCAG 2.1 Level AA (keyboard, focus, labels, contrast).

---

## Permissions

Extend `MEMBER` with:

- `save:content`: allow save, unsave, list saved, is-saved.

All saved operations act on the current user only.
