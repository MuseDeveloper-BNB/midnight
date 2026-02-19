# API Contract: Admin Features

**Feature**: News Website with Role-Based Access  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

Admin features provide system-wide management capabilities including user management, role assignment, user deactivation, and moderation history viewing. All admin actions require `ADMIN` role and are logged for audit purposes.

## Server Actions

### getUsersAction

Get all users in the system (paginated).

**Path**: `src/actions/admin/get-users.action.ts`

**Required Role**: `ADMIN`

**Request**:
```typescript
{
  limit?: number;      // Default: 50, Max: 100
  offset?: number;    // Pagination offset
  role?: 'MEMBER' | 'EDITOR' | 'ADMIN';  // Filter by role
  active?: boolean;    // Filter by active status
  search?: string;     // Search by email or name
}
```

**Response**:
```typescript
{
  success: boolean;
  users?: Array<{
    id: string;
    email: string;
    name: string | null;
    role: 'MEMBER' | 'EDITOR' | 'ADMIN';
    provider: 'EMAIL' | 'GOOGLE';
    active: boolean;
    createdAt: string;
    updatedAt: string;
    _count: {
      authoredContent: number;
      comments: number;
    };
  }>;
  total: number;       // Total users matching filters
  limit: number;
  offset: number;
  error?: string;
}
```

**Validation**:
- User must be ADMIN
- Limit max 100
- Search queries email and name fields

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions (not ADMIN)
- `500`: Server error

### getUserAction

Get single user details.

**Path**: `src/actions/admin/get-user.action.ts`

**Required Role**: `ADMIN`

**Request**:
```typescript
{
  id: string;          // User UUID
}
```

**Response**:
```typescript
{
  success: boolean;
  user?: {
    id: string;
    email: string;
    name: string | null;
    role: 'MEMBER' | 'EDITOR' | 'ADMIN';
    provider: 'EMAIL' | 'GOOGLE';
    active: boolean;
    emailVerified: string | null;
    image: string | null;
    createdAt: string;
    updatedAt: string;
    authoredContent: Array<{
      id: string;
      title: string;
      status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    }>;
    comments: Array<{
      id: string;
      body: string;
      status: 'VISIBLE' | 'HIDDEN' | 'DELETED';
    }>;
  };
  error?: string;
}
```

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: User not found
- `500`: Server error

### updateUserRoleAction

Change a user's role.

**Path**: `src/actions/admin/update-role.action.ts`

**Required Role**: `ADMIN`

**Request**:
```typescript
{
  userId: string;      // User UUID
  role: 'MEMBER' | 'EDITOR' | 'ADMIN';
}
```

**Response**:
```typescript
{
  success: boolean;
  user?: {
    id: string;
    role: 'MEMBER' | 'EDITOR' | 'ADMIN';
  };
  error?: string;
}
```

**Validation**:
- User must exist
- Cannot change own role (prevent lockout)
- Role must be valid enum value
- Creates ModerationLog entry

**Behavior**:
- Updates user role
- User permissions updated immediately
- Session may need refresh for role changes to take effect
- Logs action in ModerationLog

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions or cannot change own role
- `404`: User not found
- `400`: Invalid role
- `500`: Server error

### deactivateUserAction

Deactivate a user account.

**Path**: `src/actions/admin/deactivate-user.action.ts`

**Required Role**: `ADMIN`

**Request**:
```typescript
{
  userId: string;      // User UUID
}
```

**Response**:
```typescript
{
  success: boolean;
  user?: {
    id: string;
    active: false;
  };
  error?: string;
}
```

**Validation**:
- User must exist
- Cannot deactivate own account
- Creates ModerationLog entry

**Behavior**:
- Sets `active` to `false`
- User cannot log in while deactivated
- User's content and comments remain (soft deactivation)
- Logs action in ModerationLog

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions or cannot deactivate own account
- `404`: User not found
- `500`: Server error

### activateUserAction

Activate a deactivated user account.

**Path**: `src/actions/admin/activate-user.action.ts`

**Required Role**: `ADMIN`

**Request**:
```typescript
{
  userId: string;      // User UUID
}
```

**Response**:
```typescript
{
  success: boolean;
  user?: {
    id: string;
    active: true;
  };
  error?: string;
}
```

**Behavior**:
- Sets `active` to `true`
- User can log in again
- Logs action in ModerationLog

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `404`: User not found
- `500`: Server error

### getModerationHistoryAction

Get moderation action history (audit log).

**Path**: `src/actions/admin/get-moderation-history.action.ts`

**Required Role**: `ADMIN`

**Request**:
```typescript
{
  limit?: number;      // Default: 50, Max: 100
  offset?: number;    // Pagination offset
  moderatorId?: string;  // Filter by moderator
  action?: 'HIDE_COMMENT' | 'DELETE_COMMENT' | 'PUBLISH_CONTENT' | 'UNPUBLISH_CONTENT' | 'ARCHIVE_CONTENT' | 'CHANGE_ROLE' | 'DEACTIVATE_USER';
  targetType?: 'COMMENT' | 'CONTENT' | 'USER';
  startDate?: string;  // ISO timestamp
  endDate?: string;    // ISO timestamp
}
```

**Response**:
```typescript
{
  success: boolean;
  logs?: Array<{
    id: string;
    action: ModerationAction;
    targetType: 'COMMENT' | 'CONTENT' | 'USER';
    targetId: string;
    moderator: {
      id: string;
      email: string;
      name: string | null;
    };
    details: Record<string, unknown>;  // Action-specific details
    createdAt: string;
  }>;
  total: number;       // Total logs matching filters
  limit: number;
  offset: number;
  error?: string;
}
```

**Validation**:
- User must be ADMIN
- Date range validation
- Limit max 100

**Errors**:
- `401`: Not authenticated
- `403`: Insufficient permissions
- `400`: Invalid date range
- `500`: Server error

## API Routes

### GET /api/admin/users

Get all users (admin endpoint).

**Required Role**: `ADMIN`

**Query Parameters**: Same as `getUsersAction`

**Response**: Same as `getUsersAction`

### GET /api/admin/users/[id]

Get single user (admin endpoint).

**Required Role**: `ADMIN`

**Response**: Same as `getUserAction`

### GET /api/admin/moderation-history

Get moderation history (admin endpoint).

**Required Role**: `ADMIN`

**Query Parameters**: Same as `getModerationHistoryAction`

**Response**: Same as `getModerationHistoryAction`

## Moderation Log Details

### Action-Specific Details

**CHANGE_ROLE**:
```typescript
{
  oldRole: 'MEMBER' | 'EDITOR' | 'ADMIN';
  newRole: 'MEMBER' | 'EDITOR' | 'ADMIN';
}
```

**DEACTIVATE_USER / ACTIVATE_USER**:
```typescript
{
  userId: string;
  previousStatus: boolean;  // active status before change
}
```

**PUBLISH_CONTENT / UNPUBLISH_CONTENT / ARCHIVE_CONTENT**:
```typescript
{
  contentId: string;
  oldStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  newStatus: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
```

**HIDE_COMMENT / DELETE_COMMENT**:
```typescript
{
  commentId: string;
  reason?: string;
}
```

## Security Considerations

### Role Change Protection

- Admins cannot change their own role (prevents lockout)
- Role changes logged for audit
- Session refresh may be required for role changes to take effect

### Deactivation Protection

- Admins cannot deactivate their own account
- Deactivated users cannot log in
- User data preserved (soft deactivation)

### Audit Trail

- All admin actions logged in ModerationLog
- Logs are immutable (no updates/deletes)
- Logs queryable by date range, moderator, action type

## Error Handling

All errors return user-friendly messages:

- Not authenticated: "Please log in to continue"
- Insufficient permissions: "Admin access required"
- Cannot change own role: "You cannot change your own role"
- Cannot deactivate own account: "You cannot deactivate your own account"
- User not found: "User not found"
- Invalid input: "Please check your input and try again"
- Server error: "An error occurred. Please try again."

## Testing

### Unit Tests

- Permission checks
- Role change validation
- Deactivation validation
- Moderation log creation

### Integration Tests

- Get users list
- Get single user
- Change user role
- Deactivate user
- Activate user
- Get moderation history
- Filter moderation history

### E2E Tests

- Admin views user list
- Admin changes user role
- Admin deactivates user
- Admin views moderation history
- Admin filters moderation history
- Cannot change own role
- Cannot deactivate own account
