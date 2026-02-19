jest.mock('@/lib/db', () => {
  const findFirst = jest.fn();
  const update = jest.fn();
  const findMany = jest.fn();
  const count = jest.fn();
  return {
    db: {
      user: { findFirst, update },
      comment: { findMany, count },
    },
  };
});

import { db } from '@/lib/db';
import { profileService } from '@/services/profile/profile.service';

const userId = 'user-1';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ProfileService#getCommentsByUserId', () => {
  it('returns paginated comments (visible only, newest first)', async () => {
    const items = [
      {
        id: 'c1',
        body: 'Comment 1',
        createdAt: new Date('2025-01-02'),
        content: { id: 'a1', title: 'Article 1', type: 'NEWS', slug: 'art-1', status: 'PUBLISHED', publishedAt: new Date() },
      },
    ];
    db.comment.findMany.mockResolvedValue(items);
    db.comment.count.mockResolvedValue(1);

    const result = await profileService.getCommentsByUserId(userId, { page: 1, pageSize: 10 });

    expect(result.items).toEqual(items);
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(db.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { authorId: userId, status: 'VISIBLE', deletedAt: null },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    );
  });

  it('uses default page size when not provided', async () => {
    db.comment.findMany.mockResolvedValue([]);
    db.comment.count.mockResolvedValue(0);

    await profileService.getCommentsByUserId(userId);

    expect(db.comment.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 15 })
    );
  });
});

describe('ProfileService#updateProfile', () => {
  it('updates user and returns id, name, email on success', async () => {
    db.user.findFirst.mockResolvedValue(null);
    db.user.update.mockResolvedValue({
      id: userId,
      name: 'New Name',
      email: 'new@example.com',
      password: null,
      role: 'MEMBER',
      provider: 'EMAIL',
      providerId: null,
      active: true,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const result = await profileService.updateProfile(userId, {
      name: 'New Name',
      email: 'new@example.com',
    });

    expect(result).toEqual({ id: userId, name: 'New Name', email: 'new@example.com' });
    expect(db.user.update).toHaveBeenCalledWith({
      where: { id: userId },
      data: { name: 'New Name', email: 'new@example.com' },
    });
  });

  it('throws validation error when both name and email are empty', async () => {
    await expect(
      profileService.updateProfile(userId, { name: '', email: '' })
    ).rejects.toThrow(/at least one/i);
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it('throws validation error for invalid email format', async () => {
    await expect(
      profileService.updateProfile(userId, { name: 'A', email: 'not-an-email' })
    ).rejects.toThrow();
    expect(db.user.update).not.toHaveBeenCalled();
  });

  it('throws when email already in use by another user', async () => {
    db.user.findFirst.mockResolvedValue({ id: 'other-user', email: 'taken@example.com' });

    await expect(
      profileService.updateProfile(userId, { email: 'taken@example.com' })
    ).rejects.toMatchObject({ message: 'Email already in use' });

    expect(db.user.update).not.toHaveBeenCalled();
  });
});
