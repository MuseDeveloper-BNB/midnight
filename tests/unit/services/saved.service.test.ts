jest.mock('@/lib/db', () => {
  const create = jest.fn();
  const deleteMany = jest.fn();
  const findMany = jest.fn();
  const findUnique = jest.fn();
  const count = jest.fn();
  const contentFindUnique = jest.fn();
  return {
    db: {
      savedItem: { create, deleteMany, findMany, findUnique, count },
      content: { findUnique: contentFindUnique },
    },
  };
});

import { db } from '@/lib/db';
import { savedService } from '@/services/saved/saved.service';

const userId = 'user-1';
const contentId = 'content-1';

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SavedService#save', () => {
  it('creates SavedItem when content exists and is published', async () => {
    db.content.findUnique.mockResolvedValue({ id: contentId, status: 'PUBLISHED' });
    db.savedItem.create.mockResolvedValue({ id: 's1', userId, contentId, createdAt: new Date() });

    await savedService.save(userId, contentId);

    expect(db.savedItem.create).toHaveBeenCalledWith({
      data: { userId, contentId },
    });
  });

  it('is idempotent when already saved (unique violation)', async () => {
    db.content.findUnique.mockResolvedValue({ id: contentId, status: 'PUBLISHED' });
    db.savedItem.create.mockRejectedValue({ code: 'P2002' });

    await savedService.save(userId, contentId);

    expect(db.savedItem.create).toHaveBeenCalled();
  });

  it('throws when content not found', async () => {
    db.content.findUnique.mockResolvedValue(null);

    await expect(savedService.save(userId, contentId)).rejects.toMatchObject({
      message: 'Not found',
    });
    expect(db.savedItem.create).not.toHaveBeenCalled();
  });

  it('throws when content not published', async () => {
    db.content.findUnique.mockResolvedValue({ id: contentId, status: 'DRAFT' });

    await expect(savedService.save(userId, contentId)).rejects.toMatchObject({
      message: expect.stringMatching(/published/i),
    });
    expect(db.savedItem.create).not.toHaveBeenCalled();
  });
});

describe('SavedService#unsave', () => {
  it('deletes SavedItem by userId and contentId', async () => {
    db.savedItem.deleteMany.mockResolvedValue({ count: 1 });

    await savedService.unsave(userId, contentId);

    expect(db.savedItem.deleteMany).toHaveBeenCalledWith({
      where: { userId, contentId },
    });
  });

  it('is idempotent when not saved (deleteMany count 0)', async () => {
    db.savedItem.deleteMany.mockResolvedValue({ count: 0 });

    await savedService.unsave(userId, contentId);

    expect(db.savedItem.deleteMany).toHaveBeenCalled();
  });
});

describe('SavedService#listSaved', () => {
  it('returns paginated saved items', async () => {
    const items = [
      {
        id: 's1',
        contentId,
        createdAt: new Date(),
        content: {
          id: contentId,
          title: 'Article',
          type: 'NEWS',
          slug: 'art',
          status: 'PUBLISHED',
          publishedAt: new Date(),
        },
      },
    ];
    db.savedItem.findMany.mockResolvedValue(items);
    db.savedItem.count.mockResolvedValue(1);

    const result = await savedService.listSaved(userId, { page: 1, pageSize: 10 });

    expect(result.items).toHaveLength(1);
    expect(result.items[0].content?.slug).toBe('art');
    expect(result.total).toBe(1);
    expect(result.page).toBe(1);
    expect(result.pageSize).toBe(10);
    expect(db.savedItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      })
    );
  });

  it('uses default page size when not provided', async () => {
    db.savedItem.findMany.mockResolvedValue([]);
    db.savedItem.count.mockResolvedValue(0);

    await savedService.listSaved(userId);

    expect(db.savedItem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ skip: 0, take: 15 })
    );
  });
});

describe('SavedService#isSaved', () => {
  it('returns true when SavedItem exists', async () => {
    db.savedItem.findUnique.mockResolvedValue({ id: 's1', userId, contentId, createdAt: new Date() });

    const result = await savedService.isSaved(userId, contentId);

    expect(result).toBe(true);
    expect(db.savedItem.findUnique).toHaveBeenCalledWith({
      where: { userId_contentId: { userId, contentId } },
    });
  });

  it('returns false when SavedItem does not exist', async () => {
    db.savedItem.findUnique.mockResolvedValue(null);

    const result = await savedService.isSaved(userId, contentId);

    expect(result).toBe(false);
  });
});
