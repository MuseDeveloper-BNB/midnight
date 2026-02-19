# API Contract: Content Management

**Feature**: News Website with Role-Based Access  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

Content management includes creating, editing, publishing, unpublishing, and archiving news articles and blog posts. Only published content is visible to public users. Editors and admins can manage content in all states.

## Server Actions

### createContentAction

Create a new news article or blog post (draft state).

**Path**: `src/actions/content/create.action.ts`

**Required Role**: `EDITOR` or `ADMIN`

**Request**:
```typescript
{
  type: 'NEWS' | 'BLOG';
  title: string;        // Max 255 characters
  body: string;        // Text or HTML (for blog posts)
  slug?: string;       // Optional, auto-generated from title if not provided
}
```

**Response**:
```typescript
{
  success: boolean;
  content?: {
    id: string;
    type: 'NEWS' | 'BLOG';
    title: string;
    body: string;
    slug: string;
    status: 'DRAFT';
    authorId: string;
    createdAt: string;  // ISO timestamp
  };
  error?: string;
}
```

**Validation**:
- Title required, max 255 characters
- Body required, non-empty
- Slug auto-generated if not provided (URL-friendly)
- Slug must be unique
- Author set to current user

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions (not EDITOR or ADMIN)
- `400`: Invalid input (title too long, empty body)
- `409`: Slug already exists
- `500`: Server error

### updateContentAction

Update an existing content item.

**Path**: `src/actions/content/update.action.ts`

**Required Role**: `EDITOR` or `ADMIN`

**Request**:
```typescript
{
  id: string;          // Content UUID
  title?: string;
  body?: string;
  slug?: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  content?: {
    id: string;
    type: 'NEWS' | 'BLOG';
    title: string;
    body: string;
    slug: string;
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    updatedAt: string;  // ISO timestamp
  };
  error?: string;
}
```

**Validation**:
- Content must exist
- User must be author or ADMIN
- Slug must be unique if changed
- Title max 255 characters if provided

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions or not author
- `404`: Content not found
- `409`: Slug already exists
- `500`: Server error

### publishContentAction

Publish content (change status to PUBLISHED).

**Path**: `src/actions/content/publish.action.ts`

**Required Role**: `EDITOR` or `ADMIN`

**Request**:
```typescript
{
  id: string;          // Content UUID
}
```

**Response**:
```typescript
{
  success: boolean;
  content?: {
    id: string;
    status: 'PUBLISHED';
    publishedAt: string;  // ISO timestamp
  };
  error?: string;
}
```

**Behavior**:
- Sets status to `PUBLISHED`
- Sets `publishedAt` timestamp
- Creates ModerationLog entry
- Content becomes visible to public users

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Content not found
- `500`: Server error

### unpublishContentAction

Unpublish content (change status to DRAFT).

**Path**: `src/actions/content/unpublish.action.ts`

**Required Role**: `EDITOR` or `ADMIN`

**Request**:
```typescript
{
  id: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  content?: {
    id: string;
    status: 'DRAFT';
  };
  error?: string;
}
```

**Behavior**:
- Sets status to `DRAFT`
- Content no longer visible to public users
- Creates ModerationLog entry

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Content not found
- `500`: Server error

### archiveContentAction

Archive content (change status to ARCHIVED).

**Path**: `src/actions/content/archive.action.ts`

**Required Role**: `EDITOR` or `ADMIN`

**Request**:
```typescript
{
  id: string;
}
```

**Response**:
```typescript
{
  success: boolean;
  content?: {
    id: string;
    status: 'ARCHIVED';
  };
  error?: string;
}
```

**Behavior**:
- Sets status to `ARCHIVED`
- Content no longer visible to public users
- Creates ModerationLog entry

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Content not found
- `500`: Server error

## API Routes

### GET /api/content

Get published content (public endpoint).

**Query Parameters**:
```typescript
{
  type?: 'NEWS' | 'BLOG';     // Filter by content type
  limit?: number;              // Default: 20, Max: 100
  offset?: number;             // Pagination offset
  sort?: 'newest' | 'oldest';  // Default: newest
}
```

**Response**:
```typescript
{
  content: Array<{
    id: string;
    type: 'NEWS' | 'BLOG';
    title: string;
    body: string;              // Truncated for list view
    slug: string;
    author: {
      id: string;
      name: string | null;
    };
    publishedAt: string;
    createdAt: string;
  }>;
  total: number;               // Total count
  limit: number;
  offset: number;
}
```

**Behavior**:
- Only returns `PUBLISHED` content
- Public endpoint (no authentication required)
- Supports pagination

### GET /api/content/[slug]

Get single content item by slug (public endpoint).

**Response**:
```typescript
{
  content: {
    id: string;
    type: 'NEWS' | 'BLOG';
    title: string;
    body: string;              // Full body
    slug: string;
    author: {
      id: string;
      name: string | null;
      email: string;
    };
    publishedAt: string;
    createdAt: string;
    updatedAt: string;
  };
}
```

**Errors**:
- `404`: Content not found or not published

## Content Display Rules

### Public Visibility

- Only `PUBLISHED` content is visible to public users
- `DRAFT` and `ARCHIVED` content are hidden
- Content filtered by `status = 'PUBLISHED'` in queries

### Editor/Admin Visibility

- Editors and admins can see all content (all states)
- Editors can manage content they authored
- Admins can manage all content

### Content Formatting

- **News articles**: Plain text or simple formatting
- **Blog posts**: Rich text (HTML) with formatting preserved
- Blog post body is sanitized with DOMPurify before storage

## Validation Rules

### Title

- Required
- Max 255 characters
- Trimmed (leading/trailing whitespace removed)

### Body

- Required
- Non-empty (after trimming)
- For blog posts: HTML sanitized with DOMPurify
- For news: Plain text (HTML stripped)

### Slug

- Auto-generated from title if not provided
- URL-friendly (lowercase, hyphens, alphanumeric)
- Unique constraint enforced
- Max 255 characters

## Moderation Logging

All status changes are logged:

```typescript
// ModerationLog entry
{
  action: 'PUBLISH_CONTENT' | 'UNPUBLISH_CONTENT' | 'ARCHIVE_CONTENT';
  targetType: 'CONTENT';
  targetId: string;           // Content ID
  moderatorId: string;       // User ID who performed action
  details: {
    oldStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  };
  createdAt: string;
}
```

## Error Handling

All errors return user-friendly messages:

- Not authenticated: "Please log in to continue"
- Insufficient permissions: "You don't have permission to perform this action"
- Content not found: "Content not found"
- Slug exists: "A content item with this URL already exists"
- Invalid input: "Please check your input and try again"
- Server error: "An error occurred. Please try again."

## Testing

### Unit Tests

- Content creation validation
- Slug generation
- Status transitions
- Permission checks

### Integration Tests

- Create content flow
- Update content flow
- Publish/unpublish flow
- Archive flow
- Public content visibility

### E2E Tests

- Editor creates and publishes article
- Public user views published article
- Draft content not visible to public
- Permission enforcement
