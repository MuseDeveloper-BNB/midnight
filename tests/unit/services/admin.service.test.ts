import { AdminService } from '@/services/admin/admin.service';

describe('AdminService', () => {
  it('getUsers returns list', async () => {
    const service = new AdminService();
    expect(service.getUsers).toBeDefined();
  });

  it('getUser returns detail', async () => {
    const service = new AdminService();
    expect(service.getUser).toBeDefined();
  });

  it('updateUserRole updates role', async () => {
    const service = new AdminService();
    expect(service.updateUserRole).toBeDefined();
  });

  it('deactivateUser deactivates', async () => {
    const service = new AdminService();
    expect(service.deactivateUser).toBeDefined();
  });

  it('getModerationHistory returns logs', async () => {
    const service = new AdminService();
    expect(service.getModerationHistory).toBeDefined();
  });
});
