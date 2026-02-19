import { PERMISSIONS } from '@/lib/permissions';

describe('permissions', () => {
  it('defines MEMBER permissions', () => {
    expect(PERMISSIONS.MEMBER.length).toBeGreaterThan(0);
  });

  it('defines EDITOR permissions', () => {
    expect(PERMISSIONS.EDITOR.length).toBeGreaterThan(0);
  });

  it('defines ADMIN permissions', () => {
    expect(PERMISSIONS.ADMIN.length).toBeGreaterThan(0);
  });
});
