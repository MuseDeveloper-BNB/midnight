# API Contract: Comments

**Feature**: News Website with Role-Based Access  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

Comments allow members to interact with published content. Members can create, edit, and delete their own comments. Editors and admins can moderate comments (hide or delete). Comments use soft deletion for audit trail preservation.

## Server Actions

### createCommentAction

Create a comment on published content.

**Path**: `src/actions/comments/create.action.ts`

**Required Role**: `MEMBER`, `EDITOR`, or `ADMIN`

**Request**:
```typescript
{
  contentId: string;    // Content UUID
  body: string;        // Comment text (max 5000 characters)
}
```

**Response**:
```typescript
{
  success: boolean;
  comment?: {
    id: string;
    body: string;
    contentId: string;
    authorId: string;
    status: 'VISIBLE';
    createdAt: string;  // ISO timestamp
    author: {
      id: string;
      name: string | null;
      email: string;
    };
  };
  error?: string;
}
```

**Validation**:
- Content must exist and be `PUBLISHED`
- Body required, max 5000 characters
- Body sanitized (HTML stripped or sanitized)
- Author set to current user

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions (not MEMBER+)
- `404`: Content not found or not published
- `400`: Invalid input (empty body, too long)
- `500`: Server error

### updateCommentAction

Update own comment.

**Path**: `src/actions/comments/update.action.ts`

**Required Role**: `MEMBER`, `EDITOR`, or `ADMIN`

**Request**:
```typescript
{
  id: string;          // Comment UUID
  body: string;       // Updated comment text
}
```

**Response**:
```typescript
{
  success: boolean;
  comment?: {
    id: string;
    body: string;
    updatedAt: string;  // ISO timestamp
  };
  error?: string;
}
```

**Validation**:
- Comment must exist
- User must be comment author (or ADMIN/EDITOR for moderation)
- Body required, max 5000 characters
- Comment must not be deleted (`deletedAt IS NULL`)

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions (not author)
- `404`: Comment not found
- `400`: Invalid input
- `500`: Server error

### deleteCommentAction

Delete own comment (soft delete).

**Path**: `src/actions/comments/delete.action.ts`

**Required Role**: `MEMBER`, `EDITOR`, or `ADMIN`

**Request**:
```typescript
{
  id: string;          // Comment UUID
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
- Sets `deletedAt` timestamp (soft delete)
- Sets `status` to `DELETED`
- Comment no longer publicly visible
- Comment remains in database for audit
- Creates ModerationLog entry if deleted by moderator

**Validation**:
- Comment must exist
- User must be comment author (or ADMIN/EDITOR for moderation)

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions (not author)
- `404`: Comment not found
- `500`: Server error

### reportCommentAction

Report a comment as inappropriate.

**Path**: `src/actions/comments/report.action.ts`

**Required Role**: `MEMBER`, `EDITOR`, or `ADMIN`

**Request**:
```typescript
{
  commentId: string;  // Comment UUID
  reason?: string;     // Optional reason for report
}
```

**Response**:
```typescript
{
  success: boolean;
  report?: {
    id: string;
    commentId: string;
    status: 'PENDING';
    createdAt: string;
  };
  error?: string;
}
```

**Validation**:
- Comment must exist
- User cannot report their own comment
- Report status set to `PENDING`

**Errors**:
- `401`: Not authenticated
- `403`: Cannot report own comment
- `404`: Comment not found
- `500`: Server error

### hideCommentAction

Hide a comment (moderation action).

**Path**: `src/actions/comments/hide.action.ts`

**Required Role**: `EDITOR` or `ADMIN`

**Request**:
```typescript
{
  id: string;          // Comment UUID
}
```

**Response**:
```typescript
{
  success: boolean;
  comment?: {
    id: string;
    status: 'HIDDEN';
  };
  error?: string;
}
```

**Behavior**:
- Sets `status` to `HIDDEN`
- Comment no longer publicly visible
- Comment remains stored
- Creates ModerationLog entry

**Validation**:
- Comment must exist
- User must be EDITOR or ADMIN
- Editors can only moderate comments on content they manage

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Comment not found
- `500`: Server error

### deleteCommentModerationAction

Delete a comment (moderation action, soft delete).

**Path**: `src/actions/comments/delete-moderation.action.ts`

**Required Role**: `EDITOR` or `ADMIN`

**Request**:
```typescript
{
  id: string;          // Comment UUID
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
- Sets `deletedAt` timestamp
- Sets `status` to `DELETED`
- Comment no longer publicly visible
- Comment remains stored for audit
- Creates ModerationLog entry

**Validation**:
- Comment must exist
- User must be EDITOR or ADMIN
- Editors can only moderate comments on content they manage

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Comment not found
- `500`: Server error

## API Routes

### GET /api/comments

Get visible comments for a content item.

**Query Parameters**:
```typescript
{
  contentId: string;    // Required, Content UUID
  limit?: number;      // Default: 50, Max: 100
  offset?: number;     // Pagination offset
}
```

**Response**:
```typescript
{
  comments: Array<{
    id: string;
    body: string;
    author: {
      id: string;
      name: string | null;
    };
    createdAt: string;
    updatedAt: string;
  }>;
  total: number;       // Total visible comments
  limit: number;
  offset: number;
}
```

**Behavior**:
- Only returns `VISIBLE` comments (`status = 'VISIBLE' AND deletedAt IS NULL`)
- Ordered by `createdAt ASC` (oldest first)
- Public endpoint (no authentication required)

### GET /api/comments/[id]

Get single comment (for editing own comment).

**Required Role**: `MEMBER`, `EDITOR`, or `ADMIN`

**Response**:
```typescript
{
  comment: {
    id: string;
    body: string;
    contentId: string;
    authorId: string;
    status: 'VISIBLE' | 'HIDDEN' | 'DELETED';
    createdAt: string;
    updatedAt: string;
  };
}
```

**Validation**:
- User must be comment author (or ADMIN/EDITOR)

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: Comment not found

## Comment Display Rules

### Public Visibility

- Only `VISIBLE` comments are shown (`status = 'VISIBLE' AND deletedAt IS NULL`)
- Comments ordered chronologically (oldest first)
- Hidden and deleted comments are filtered out

### Member Visibility

- Members see all visible comments
- Members can edit/delete only their own comments
- Members can report any comment (except their own)

### Editor/Admin Visibility

- Editors and admins see all comments (including hidden/deleted)
- Editors can moderate comments on content they manage
- Admins can moderate all comments

## Soft Delete Pattern

### Deletion Behavior

- `deletedAt` timestamp set when comment is deleted
- `status` set to `DELETED`
- Comment filtered from public queries: `WHERE deletedAt IS NULL AND status = 'VISIBLE'`
- Comment remains in database for audit trail
- Admin views can show deleted comments

### Moderation Logging

All moderation actions are logged:

```typescript
// ModerationLog entry for hide
{
  action: 'HIDE_COMMENT';
  targetType: 'COMMENT';
  targetId: string;           // Comment ID
  moderatorId: string;       // User ID who performed action
  details: {
    reason?: string;
  };
  createdAt: string;
}

// ModerationLog entry for delete
{
  action: 'DELETE_COMMENT';
  targetType: 'COMMENT';
  targetId: string;
  moderatorId: string;
  details: {
    reason?: string;
  };
  createdAt: string;
}
```

## Validation Rules

### Body

- Required
- Max 5000 characters
- Trimmed (leading/trailing whitespace removed)
- HTML sanitized (if rich text allowed) or stripped

### Content Association

- Content must exist
- Content must be `PUBLISHED`
- Cannot comment on draft or archived content

## Error Handling

All errors return user-friendly messages:

- Not authenticated: "Please log in to comment"
- Insufficient permissions: "You don't have permission to perform this action"
- Comment not found: "Comment not found"
- Cannot edit/delete: "You can only edit/delete your own comments"
- Content not published: "Comments are only allowed on published content"
- Invalid input: "Please check your input and try again"
- Server error: "An error occurred. Please try again."

## Testing

### Unit Tests

- Comment creation validation
- Soft delete behavior
- Status transitions
- Permission checks
- Content association validation

### Integration Tests

- Create comment flow
- Update own comment flow
- Delete own comment flow
- Report comment flow
- Hide comment flow (moderation)
- Delete comment flow (moderation)
- Public visibility filtering

### E2E Tests

- Member creates comment on published article
- Member edits own comment
- Member deletes own comment
- Member cannot edit others' comments
- Editor moderates comments
- Deleted comments not visible to public
- Hidden comments not visible to public
