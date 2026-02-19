# Feature Specification: Enhanced Member Profile

**Feature Branch**: `003-member-profile-enhancements`  
**Created**: 2025-01-28  
**Status**: Draft  
**Input**: User description: "Napravi dizajn i proširi mogućnosti klijentskog profila, npr. dohvati sve njegove komentare gde je komentarisao i to lepo spakuj na jedno mesto, omogući da klijent može da sačuva neke blogove ili vesti, dozvoli da klijent može da promeni svoje podatke."

## Clarifications

### Session 2025-01-28

- Q: Should the spec explicitly require loading indicators for profile fetch, profile update submit, save/unsave, and paginated list loading? → A: Require loading states for profile fetch, profile update submit, save/unsave, and paginated list loading (spinner/skeleton or disabled buttons as appropriate).
- Q: Should the spec require a minimum accessibility bar for the profile and related UI? → A: Require WCAG 2.1 Level AA for profile page, ProfileForm, CommentsHistory, SavedList, and SaveButton (keyboard nav, focus, labels, contrast).
- Q: Should "clean" design be made testable (e.g. no layout shift, consistent spacing, no redundant actions)? → A: Yes—no layout shift during load, consistent spacing and section hierarchy, no redundant primary actions.
- Q: Should profile update or save/unsave be rate-limited to prevent abuse? → A: Yes—rate-limit both profile update and save/unsave (reasonable per-user limits).
- Q: On network failure during save/unsave, should the spec require retry or explicit error + retry? → A: Explicit error message and optional retry; no silent failure.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Edit Own Profile Data (Priority: P1)

A signed-in member visits their profile, updates their display name or other editable account data, and saves. The system persists the changes and confirms success. The member sees their updated information on the profile and elsewhere it is shown.

**Why this priority**: Profile editing is a core expectation; without it, members cannot correct mistakes or keep their identity up to date.

**Independent Test**: Can be fully tested by updating name (or other allowed fields), saving, and verifying the new values appear on the profile and in comments/article bylines.

**Acceptance Scenarios**:

1. **Given** a signed-in member on the profile page, **When** they change their display name and submit the form, **Then** the new name is saved, a success message is shown, and the profile displays the updated name.
2. **Given** a signed-in member on the profile page, **When** they submit the form with invalid data (e.g. invalid email format), **Then** the system shows clear validation errors and does not persist changes.
3. **Given** a signed-in member, **When** they update their profile, **Then** their updated name (or other displayed fields) appears wherever the system shows author/commenter identity (e.g. comments, bylines).

---

### User Story 2 - Comments History in One Place (Priority: P2)

A signed-in member opens their profile and sees a dedicated section listing all comments they have posted. Each entry shows the comment text, when it was posted, and a link to the source article (news or blog). The list is ordered by date (newest first) and is easy to scan.

**Why this priority**: Centralizing comment history helps members revisit discussions and find articles they engaged with, without searching the site.

**Independent Test**: Can be fully tested by posting comments on different articles, then opening the profile and verifying all comments appear with correct text, dates, and links to source content.

**Acceptance Scenarios**:

1. **Given** a member who has posted at least one comment, **When** they open the profile, **Then** a "My comments" (or equivalent) section lists each comment with excerpt, date, and link to the source article.
2. **Given** a member with no comments, **When** they open the profile, **Then** the comments section shows an empty state (e.g. "You haven't commented yet") instead of a blank or error state.
3. **Given** a member with many comments, **When** they view the comments section, **Then** the list is ordered by date (newest first) and is paginated or truncated in a defined, consistent way so the page remains usable.

---

### User Story 3 - Save and Manage News/Blog (Priority: P3)

A signed-in member can save news articles or blog posts from their detail pages for later. On the profile, a "Saved" (or equivalent) section lists all saved items. Each saved item shows enough context (e.g. title, type, date) and links to the full article. The member can remove items from saved.

**Why this priority**: Saving content supports reading later and personal curation; it increases engagement and reinforces the profile as a personal hub.

**Independent Test**: Can be fully tested by saving and unsaving articles from detail pages, then checking the profile saved list updates correctly.

**Acceptance Scenarios**:

1. **Given** a signed-in member viewing a news or blog article, **When** they choose "Save" (or equivalent), **Then** the article is added to their saved list and they receive clear feedback (e.g. "Saved" or button state change).
2. **Given** a signed-in member on their profile, **When** they view the saved section, **Then** each saved item shows title, content type (news/blog), publication date when available, and a link to the full article.
3. **Given** a member with saved items, **When** they remove an item from saved on the profile (or on the article page), **Then** the item is removed from their saved list and the UI updates immediately.
4. **Given** a member with no saved items, **When** they open the saved section, **Then** an empty state (e.g. "No saved articles yet") is shown.
5. **Given** an article already saved by the member, **When** they view that article, **Then** the save control reflects the saved state (e.g. "Unsave" or filled icon) so they can unsave from the article page.

---

### User Story 4 - Profile Design and Layout (Priority: P4)

The member profile has a clear, consistent layout: profile data and edit form, comments history, and saved content are grouped in distinct sections. The visual style aligns with the rest of the site (e.g. editorial, minimal). The profile works on different screen sizes and is easy to navigate.

**Why this priority**: Good design ensures the new capabilities are discoverable and pleasant to use, without blocking core behaviour.

**Independent Test**: Can be tested by reviewing the profile on desktop and mobile, verifying section hierarchy, readability, and consistency with the existing site design.

**Acceptance Scenarios**:

1. **Given** any signed-in member, **When** they open the profile, **Then** they see clearly separated sections for profile data, comments history, and saved content (each shown only when applicable).
2. **Given** the profile page, **When** viewed on desktop and on a small screen, **Then** layout adapts so content remains readable and actions remain accessible without horizontal scrolling.
3. **Given** the profile page, **When** compared to the rest of the site, **Then** typography, colours, and spacing are consistent with the existing design system.
4. **Given** the profile page and related controls (form, lists, Save button), **When** used via keyboard only, **Then** all interactive elements are reachable, focusable, and operable; labels and contrast meet WCAG 2.1 Level AA.

---

### Edge Cases

- **Profile edit**: What happens when the member changes email to one already in use? The system rejects the change and shows a clear error (e.g. "Email already in use").
- **Comments history**: How are hidden or deleted comments treated? Only comments that are still visible to the member (per site rules) appear in their history; hidden/deleted ones are omitted.
- **Saved items**: What happens when saved news or blog is unpublished or removed? The system handles missing content gracefully (e.g. omit from list or show "Article no longer available" with optional remove-from-saved).
- **Concurrent edits**: If the member has multiple tabs open and edits profile in both, last successful save wins; no requirement for real-time sync across tabs.
- **Large lists**: For members with very many comments or saved items, pagination or "load more" prevents excessive load; exact limits can be defined during implementation.
- **Loading**: Profile, comments list, and saved list show a loading state while fetching; profile form and save/unsave controls show loading or disabled state during submit. No unexplained blank content or unresponsive buttons (FR-011).
- **Rate limiting**: Profile update and save/unsave are rate-limited per user (reasonable limits) to prevent abuse; excess attempts receive a clear, non-blocking message (FR-013).
- **Save/unsave failure**: On network or server error during save/unsave, the system shows an explicit error message and an optional retry; it does not fail silently (FR-014).
- **Clean design**: No layout shift during initial load or pagination; consistent spacing and section hierarchy; no redundant primary actions (e.g. duplicate submit buttons) (FR-015).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a signed-in member to update their own profile data (e.g. display name, and any other fields deemed editable) from a profile page.
- **FR-002**: The system MUST validate profile edits (e.g. required fields, email format, uniqueness) and MUST NOT persist invalid data.
- **FR-003**: The system MUST show a single, consolidated list of the member's comments (visible per site rules), each with link to the source article, ordered by date (newest first).
- **FR-004**: The system MUST support saving and unsaving news and blog articles for a member, and MUST persist saved items per member.
- **FR-005**: The system MUST expose a "Saved" list on the member profile, showing saved articles with enough context to identify them and with links to the full article.
- **FR-006**: The system MUST allow a member to remove items from their saved list from the profile and, when applicable, from the article page.
- **FR-007**: The system MUST display empty states for "My comments" and "Saved" when the member has no comments or no saved items.
- **FR-008**: The profile MUST present profile data, comments history, and saved content in clearly separated sections, with a layout consistent with the rest of the site.
- **FR-009**: The profile MUST remain usable and readable on small screens (e.g. mobile) and on desktop.
- **FR-010**: When saved or commented-on content is no longer available, the system MUST handle it gracefully (e.g. omit or mark as unavailable) without breaking the profile.
- **FR-011**: The system MUST show loading indicators (e.g. spinner, skeleton, or disabled controls) for profile fetch, profile update submit, save/unsave actions, and paginated loading of comments or saved lists, so users receive clear feedback during async operations.
- **FR-012**: The profile page, ProfileForm, CommentsHistory, SavedList, and SaveButton MUST meet WCAG 2.1 Level AA (keyboard navigation, focus management, labels, sufficient contrast).
- **FR-013**: Profile update and save/unsave MUST be rate-limited per user with reasonable limits; excess attempts receive a clear, non-blocking message.
- **FR-014**: On network or server failure during save/unsave, the system MUST show an explicit error message and an optional retry; it MUST NOT fail silently.
- **FR-015**: The profile MUST avoid layout shift during initial load and pagination; use consistent spacing and section hierarchy; and avoid redundant primary actions (e.g. duplicate submit buttons).

### Assumptions

- Members already have accounts and sign in via the existing authentication system.
- Comments and content (news/blog) exist as today; the spec only adds profile-facing behaviour (history, saved list).
- Editable profile fields are at least display name; exact set (e.g. email, avatar) can be defined during implementation while respecting security and uniqueness rules.
- Pagination or "load more" for comments and saved lists is sufficient; infinite scroll is not required.

### Key Entities

- **Member (User)**: The signed-in user whose profile is viewed. Holds editable profile data (e.g. name, email) and links to their comments and saved items.
- **Comment**: A member's post on a news or blog article. Attributes relevant to the profile include body, date, and reference to the source article.
- **Saved item**: A member's bookmark of a news or blog article. Links the member to the content; used to build the "Saved" list and to show save/unsave state on article pages.
- **Content (News/Blog)**: The article being commented on or saved. Provides title, type, publication date, and URL for display and linking.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A member can update their profile data and see the updated information reflected on the profile and in comments/bylines within one page load or minimal navigation.
- **SC-002**: A member can open their profile and find all their comments in one place, with correct links to source articles, without visiting each article individually.
- **SC-003**: A member can save at least 50 distinct articles and view them in a single saved list on the profile, with remove-from-saved working reliably.
- **SC-004**: Profile page load remains within acceptable response times (e.g. under 3 seconds on typical connections) even with large comment and saved-item lists, using pagination or similar.
- **SC-005**: The profile layout and styling are consistent with the rest of the site, and the page works on common mobile and desktop viewports without horizontal scrolling or broken layout.
- **SC-006**: Profile, ProfileForm, CommentsHistory, SavedList, and SaveButton meet WCAG 2.1 Level AA (keyboard navigable, focusable, labelled, sufficient contrast); no layout shift during load or pagination; save/unsave failures show explicit error and retry option.
