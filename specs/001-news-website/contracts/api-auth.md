# API Contract: Authentication

**Feature**: News Website with Role-Based Access  
**Date**: 2025-01-27  
**Status**: Complete

## Overview

Authentication is handled via NextAuth.js v5 (Auth.js) with support for email/password and Google OAuth. Sessions are JWT-based with secure httpOnly cookies. Role is always resolved server-side.

## Server Actions

### registerAction

Register a new user account with email/password.

**Path**: `src/actions/auth/register.action.ts`

**Request**:
```typescript
{
  email: string;        // Valid email format, unique
  password: string;    // Min 8 characters
  name?: string;       // Optional display name
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
    role: 'MEMBER';
  };
  error?: string;
}
```

**Validation**:
- Email must be valid format
- Email must be unique (not already registered)
- Password minimum 8 characters
- Password is hashed with bcrypt before storage

**Errors**:
- `400`: Invalid input (email format, password length)
- `409`: Email already exists
- `500`: Server error

### loginAction

Authenticate user with email/password.

**Path**: `src/actions/auth/login.action.ts`

**Request**:
```typescript
{
  email: string;
  password: string;
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
- Validates credentials
- Creates NextAuth.js session
- Sets secure httpOnly cookie
- Redirects to appropriate dashboard based on role

**Errors**:
- `401`: Invalid credentials
- `403`: Account deactivated
- `500`: Server error

## NextAuth.js API Routes

### POST /api/auth/signin

NextAuth.js sign-in handler (handles email/password and OAuth).

**Request**: NextAuth.js standard sign-in request

**Response**: NextAuth.js standard response

**Providers**:
- **Credentials**: Email/password authentication
- **Google**: OAuth 2.0 authentication

### GET /api/auth/callback/google

Google OAuth callback handler.

**Request**: OAuth callback with authorization code

**Response**: Redirects to application with session

**Behavior**:
- Validates OAuth state parameter
- Exchanges code for tokens
- Creates or links user account
- Creates session
- Redirects to dashboard

## Session Structure

Session object (available server-side):

```typescript
{
  user: {
    id: string;           // User UUID
    email: string;        // User email
    name: string | null;  // Display name
    role: 'MEMBER' | 'EDITOR' | 'ADMIN';
    image?: string;       // Profile image URL
  };
  expires: string;        // ISO timestamp
}
```

## Helper Functions

### getServerSession()

Get current session server-side.

**Usage**:
```typescript
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
```

**Returns**: Session object or `null` if not authenticated

### requireAuth()

Require authentication (throws if not authenticated).

**Usage**:
```typescript
import { requireAuth } from '@/lib/auth'

const session = await requireAuth()
// session is guaranteed to be non-null
```

**Throws**: Error if not authenticated

### requireRole(allowedRoles)

Require specific role(s).

**Usage**:
```typescript
import { requireRole } from '@/lib/permissions'

const user = await requireRole(['EDITOR', 'ADMIN'])
// user has EDITOR or ADMIN role
```

**Parameters**:
- `allowedRoles`: Array of allowed roles

**Throws**: Error if user doesn't have required role

## OAuth Configuration

### Google OAuth Setup

1. Create OAuth 2.0 credentials in Google Cloud Console
2. Add authorized redirect URI: `{NEXTAUTH_URL}/api/auth/callback/google`
3. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in `.env`

### Account Linking

- If user exists with same email, account is linked
- OAuth provider ID stored in `User.providerId`
- User can login via email/password or Google OAuth
- Unified account regardless of login method

## Security Considerations

### Session Security

- JWT tokens signed with `NEXTAUTH_SECRET`
- Cookies are httpOnly (not accessible to JavaScript)
- Cookies are secure (HTTPS only in production)
- Cookies use SameSite=Strict (CSRF protection)

### Password Security

- Passwords hashed with bcrypt (10 rounds)
- Passwords never stored in plain text
- Password reset flow (future feature)

### OAuth Security

- State parameter validation (CSRF protection)
- PKCE for OAuth flows (if supported)
- Callback URL validation
- Token verification

## Error Handling

All authentication errors return user-friendly messages:

- Invalid credentials: "Invalid email or password"
- Account deactivated: "Account has been deactivated"
- Email exists: "An account with this email already exists"
- Server error: "An error occurred. Please try again."

## Testing

### Unit Tests

- Password hashing verification
- Email validation
- Session creation
- Role resolution

### Integration Tests

- Registration flow
- Login flow
- OAuth callback flow
- Session persistence

### E2E Tests

- Complete registration journey
- Complete login journey
- OAuth login journey
- Session expiration handling
