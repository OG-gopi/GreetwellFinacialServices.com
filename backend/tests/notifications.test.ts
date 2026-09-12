import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { ensureTestUsersExist } from './setupTestUsers';

describe('Role-Based Notification History API & Authorization Tests', () => {
  let superAdminToken: string;
  let loanAgentToken: string;
  let insuranceAgentToken: string;
  let customerToken: string;

  beforeAll(async () => {
    await ensureTestUsersExist();

    // 1. Super Admin login
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@greetwell.com', password: 'Admin@123456' });
    expect(adminRes.status).toBe(200);
    superAdminToken = adminRes.body.data.token;

    // 2. Loan Agent login
    const loanRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'loan.agent@greetwell.com', password: 'Agent@123456' });
    expect(loanRes.status).toBe(200);
    loanAgentToken = loanRes.body.data.token;

    // 3. Insurance Agent login
    const insRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'insurance.agent@greetwell.com', password: 'Agent@123456' });
    expect(insRes.status).toBe(200);
    insuranceAgentToken = insRes.body.data.token;

    // 4. Customer login
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john.doe@example.com', password: 'Customer@123456' });
    expect(custRes.status).toBe(200);
    customerToken = custRes.body.data.token;
  });

  it('1. Super Admin can access global notifications history and counts', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${superAdminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
    expect(res.body.data.counts).toBeDefined();
    expect(typeof res.body.data.counts.total).toBe('number');
  });

  it('2. Loan Agent gets role-scoped notification history', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${loanAgentToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
  });

  it('3. Customer gets personal notification history', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data.notifications)).toBe(true);
  });

  it('4. Customer is forbidden from updating actionStatus directly from Notification History', async () => {
    // Attempt to update actionStatus as Customer
    const notificationsRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${customerToken}`);

    if (notificationsRes.body.data.notifications.length > 0) {
      const notifId = notificationsRes.body.data.notifications[0].id;
      const updateRes = await request(app)
        .put(`/api/notifications/${notifId}/status`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({ actionStatus: 'ACTION_TAKEN' });

      expect(updateRes.status).toBe(403);
      expect(updateRes.body.success).toBe(false);
      expect(updateRes.body.message).toContain('Customers are not permitted to change action status');
    }
  });

  it('5. Super Admin can update notification read status and actionStatus', async () => {
    const notificationsRes = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${superAdminToken}`);

    if (notificationsRes.body.data.notifications.length > 0) {
      const notifId = notificationsRes.body.data.notifications[0].id;
      const updateRes = await request(app)
        .put(`/api/notifications/${notifId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ isRead: true, actionStatus: 'ACTION_TAKEN' });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.success).toBe(true);
      expect(updateRes.body.data.isRead).toBe(true);
      expect(updateRes.body.data.actionStatus).toBe('ACTION_TAKEN');
    }
  });
});
