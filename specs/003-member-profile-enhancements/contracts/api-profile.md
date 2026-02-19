# API Contract: Profile

**Feature**: Enhanced Member Profile  
**Date**: 2025-01-28  
**Status**: Complete

## Overview

Profile operations allow signed-in members to update their own profile data (name, email) and to view a unified "My comments" section. The profile page fetches user info plus paginated comments history; update is done via a Server Action. All operations require MEMBER (or EDITOR/ADMIN).

## Server Actions

### updateProfileAction

Update the current user's profile (name, email). Validates input and checks email uniqueness when email changes.

**Path**: `src/actions/profile/update-profile.action.ts`

**Required Role**: `MEMBER`, `EDITOR`, or `ADMIN`

**Request**:

```typescript
{
  name?: string;   // Optional; non-empty if provided, reasonable max length
  email?: string;  // Optional; valid email format; must be unique if changed
}
```

At least one of `name` or `email` must be present.

**Response**:

```typescript
{
  success: boolean;
  error?: string;
}
```

**Validation**:

- `name`: optional; if provided, non-empty, max length per schema (e.g. 255).
- `email`: optional; if provided, valid format, unique in User table.
- At least one field must be supplied.

**Errors**:

- `400`: Invalid input (validation failure).
- `409`: Email already in use (when changing email).
- `401`: Not authenticated.
- `403`: Insufficient role.
- `429` or equivalent: Rate limit exceeded; return clear, non-blocking message (FR-013).
- `500`: Server error.

**Behavior**:

- Resolve session; enforce MEMBER+.
- Validate with Zod (profileUpdateSchema).
- If email changed, check uniqueness; then update User.
- Return `{ success: true }` or `{ success: false, error }`.

---

## Profile Page Data Shape

The profile page (`app/(member)/profile/page.tsx`) receives data for:

1. **User**: `id`, `name`, `email` (and any other displayed profile fields).
2. **My comments**: Paginated list of the member's comments (visible only), each with:
   - `id`, `body`, `createdAt`
   - `content`: `id`, `title`, `type`, `slug`, `status`, `publishedAt` for link and optional "unavailable" handling.
3. **Saved**: Paginated list of saved items (see [api-saved](./api-saved.md)); each with `content` summary and link.

Data can be fetched in the Server Component via services (e.g. `profile.service.getCommentsByUserId`, `saved.service.listSaved`) or via a single "get profile page data" action. The contract does not prescribe implementation; it defines the **structure** of profile, comments, and saved data used by the UI.

**Comments list**:

- Ordered by `createdAt` DESC.
- Paginated (e.g. `page`, `pageSize`); default page size ~10–20.
- Only comments with `status = VISIBLE` and `deletedAt IS NULL`.
- Source article omitted or marked "unavailable" if content is missing or not published (FR-010).

**Empty states**:

- No comments: show "You haven't commented yet" (or equivalent) per FR-007.
- No saved items: handled in Saved section (see api-saved).

**Loading (FR-011)**:

- Profile fetch: show loading indicator (skeleton or spinner) until user, comments, and saved data are ready.
- Profile update submit: disable form / show loading state until action completes.

**Accessibility (FR-012)**:

- Profile page, ProfileForm, CommentsHistory, SavedList MUST meet WCAG 2.1 Level AA (keyboard navigation, focus management, labels, sufficient contrast).

**Clean design (FR-015)**:

- No layout shift during initial load or pagination; consistent spacing and section hierarchy; no redundant primary actions.

---

## Permissions

Extend `MEMBER` in `src/lib/permissions.ts` with:

- `edit:own:profile`: allow `updateProfileAction`.
- `read:own:comments`: allow fetching own comments for "My comments".

Profile and comments-history operations always act on the current user; no resource-level ownership check beyond session.
