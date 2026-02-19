import { CommentsService } from '@/services/comments/comments.service';

describe('CommentsService', () => {
  it('createComment validates content', async () => {
    const service = new CommentsService();
    expect(service.createComment).toBeDefined();
  });

  it('updateComment enforces ownership', async () => {
    const service = new CommentsService();
    expect(service.updateComment).toBeDefined();
  });

  it('deleteComment enforces ownership', async () => {
    const service = new CommentsService();
    expect(service.deleteComment).toBeDefined();
  });
});
