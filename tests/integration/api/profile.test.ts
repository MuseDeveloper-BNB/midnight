jest.mock('@/lib/auth', () => ({
  auth: () => Promise.resolve(null),
  signIn: jest.fn(),
  signOut: jest.fn(),
  handlers: {},
}));

jest.mock('@/lib/db', () => {
  const findMany = jest.fn();
  const count = jest.fn();
  return {
    db: {
      user: { findFirst: jest.fn(), update: jest.fn() },
      comment: { findMany, count },
    },
  };
});

import { updateProfileAction } from '@/actions/profile/update-profile.action';
import { profileService } from '@/services/profile/profile.service';
import { db } from '@/lib/db';

describe('Profile API', () => {
  it('updateProfileAction returns Unauthorized when not authenticated', async () => {
    const result = await updateProfileAction({ name: 'Test', email: 'test@example.com' });
    expect(result).toEqual({ success: false, error: 'Unauthorized' });
  });
});

describe('Comments history on profile', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('getCommentsByUserId returns paginated comments for user', async () => {
    const items = [
      {
        id: 'c1',
        body: 'A comment',
        createdAt: new Date(),
        content: { id: 'a1', title: 'Article', type: 'NEWS', slug: 'art', status: 'PUBLISHED', publishedAt: new Date() },
      },
    ];
    (db.comment.findMany as jest.Mock).mockResolvedValue(items);
    (db.comment.count as jest.Mock).mockResolvedValue(1);

    const result = await profileService.getCommentsByUserId('user-1', { page: 1, pageSize: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].body).toBe('A comment');
    expect(result.items[0].content?.slug).toBe('art');
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
  });
});
