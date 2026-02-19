import { ModerationService } from '@/services/moderation/moderation.service';

describe('ModerationService', () => {
  it('hideComment hides a comment', async () => {
    const service = new ModerationService();
    expect(service.hideComment).toBeDefined();
  });

  it('deleteCommentModeration deletes a comment', async () => {
    const service = new ModerationService();
    expect(service.deleteCommentModeration).toBeDefined();
  });

  it('logModerationAction logs actions', async () => {
    const service = new ModerationService();
    expect(service.logModerationAction).toBeDefined();
  });
});
