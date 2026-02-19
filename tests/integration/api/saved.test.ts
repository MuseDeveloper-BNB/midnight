jest.mock('@/lib/auth', () => ({
  auth: () => Promise.resolve({
    user: { id: 'user-1', email: 'u@example.com', name: 'User', role: 'MEMBER' },
  }),
  signIn: jest.fn(),
  signOut: jest.fn(),
  handlers: {},
}));

jest.mock('@/lib/db', () => {
  const create = jest.fn();
  const deleteMany = jest.fn();
  const findUnique = jest.fn();
  const contentFindUnique = jest.fn();
  return {
    db: {
      savedItem: {
        create,
        deleteMany,
        findMany: jest.fn(),
        findUnique,
        count: jest.fn(),
      },
      content: { findUnique: contentFindUnique },
    },
  };
});

import { db } from '@/lib/db';
import { saveContentAction } from '@/actions/saved/save.action';
import { unsaveContentAction } from '@/actions/saved/unsave.action';

const contentId = '00000000-0000-0000-0000-000000000001';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Saved API', () => {
  it('saveContentAction creates SavedItem when content exists and is published', async () => {
    db.content.findUnique.mockResolvedValue({ id: contentId, status: 'PUBLISHED' });
    db.savedItem.create.mockResolvedValue({ id: 's1', userId: 'user-1', contentId, createdAt: new Date() });

    const result = await saveContentAction({ contentId });

    expect(result).toEqual({ success: true });
    expect(db.savedItem.create).toHaveBeenCalledWith({ data: { userId: 'user-1', contentId } });
  });

  it('saveContentAction returns error when content not found', async () => {
    db.content.findUnique.mockResolvedValue(null);

    const result = await saveContentAction({ contentId });

    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
    expect(String(result.error)).toMatch(/not found|published/i);
    expect(db.savedItem.create).not.toHaveBeenCalled();
  });

  it('unsaveContentAction removes SavedItem', async () => {
    db.savedItem.deleteMany.mockResolvedValue({ count: 1 });

    const result = await unsaveContentAction({ contentId });

    expect(result).toEqual({ success: true });
    expect(db.savedItem.deleteMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', contentId },
    });
  });

  it('unsaveContentAction is idempotent when not saved', async () => {
    db.savedItem.deleteMany.mockResolvedValue({ count: 0 });

    const result = await unsaveContentAction({ contentId });

    expect(result).toEqual({ success: true });
  });
});
