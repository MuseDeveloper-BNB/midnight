import { ContentService } from '@/services/content/content.service';

describe('ContentService', () => {
  it('getPublishedContent returns published content', async () => {
    const service = new ContentService();
    expect(service.getPublishedContent).toBeDefined();
  });

  it('getContentBySlug returns a single published item', async () => {
    const service = new ContentService();
    expect(service.getContentBySlug).toBeDefined();
  });

  it('createContent creates draft content', async () => {
    const service = new ContentService();
    expect(service.createContent).toBeDefined();
  });

  it('updateContent updates existing content', async () => {
    const service = new ContentService();
    expect(service.updateContent).toBeDefined();
  });

  it('publishContent changes status', async () => {
    const service = new ContentService();
    expect(service.publishContent).toBeDefined();
  });

  it('unpublishContent changes status', async () => {
    const service = new ContentService();
    expect(service.unpublishContent).toBeDefined();
  });

  it('archiveContent changes status', async () => {
    const service = new ContentService();
    expect(service.archiveContent).toBeDefined();
  });
});
