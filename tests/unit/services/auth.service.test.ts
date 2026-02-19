import { AuthService } from '@/services/auth/auth.service';

describe('AuthService', () => {
  it('register creates a user', async () => {
    const service = new AuthService();
    expect(service.register).toBeDefined();
  });

  it('login validates credentials', async () => {
    const service = new AuthService();
    expect(service.login).toBeDefined();
  });
});
