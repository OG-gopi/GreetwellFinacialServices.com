import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { ensureTestUsersExist } from './setupTestUsers';

describe('Website & Portal Content Management API Tests', () => {
  let superAdminToken: string;
  let customerToken: string;

  beforeAll(async () => {
    await ensureTestUsersExist();

    // Login Super Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@greetwell.com', password: 'Admin@123456' });
    expect(adminRes.status).toBe(200);
    superAdminToken = adminRes.body.data.token;

    // Login Customer
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john.doe@example.com', password: 'Customer@123456' });
    expect(custRes.status).toBe(200);
    customerToken = custRes.body.data.token;
  });

  it('1. GET /api/website/public - should return public website content without auth', async () => {
    const res = await request(app).get('/api/website/public');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('content');
    expect(res.body.data).toHaveProperty('contact');
    expect(res.body.data).toHaveProperty('socials');
    expect(res.body.data).toHaveProperty('media');
    expect(res.body.data.content).toHaveProperty('hero_title');
  });

  it('2. GET /api/website/admin - should return 401 if unauthenticated', async () => {
    const res = await request(app).get('/api/website/admin');
    expect(res.status).toBe(401);
  });

  it('3. GET /api/website/admin - should return 403 for Customer role', async () => {
    const res = await request(app)
      .get('/api/website/admin')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.status).toBe(403);
  });

  it('4. GET /api/website/admin - should return website configuration for Super Admin', async () => {
    const res = await request(app)
      .get('/api/website/admin')
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('contents');
    expect(res.body.data).toHaveProperty('contacts');
  });

  it('5. POST /api/website/admin/draft - should validate Indian phone numbers (fail invalid)', async () => {
    const res = await request(app)
      .post('/api/website/admin/draft')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        contacts: [
          { key: 'primary_phone', title: 'Primary Phone', draftValue: '123' } // Invalid phone
        ]
      });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Invalid Indian phone number');
  });

  it('6. POST /api/website/admin/draft - should save draft for valid Indian phone number and content', async () => {
    const res = await request(app)
      .post('/api/website/admin/draft')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        contents: [
          { key: 'hero_title', draftValue: 'Updated Hero Title via Automated Test' }
        ],
        contacts: [
          { key: 'primary_phone', draftValue: '+91 9988776655' }
        ]
      });
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('7. POST /api/website/admin/publish - should publish draft changes to live website', async () => {
    const publishRes = await request(app)
      .post('/api/website/admin/publish')
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(publishRes.status).toBe(200);
    expect(publishRes.body.success).toBe(true);

    // Verify live public endpoint returns updated published title
    const publicRes = await request(app).get('/api/website/public');
    expect(publicRes.status).toBe(200);
    expect(publicRes.body.data.content.hero_title).toBe('Updated Hero Title via Automated Test');
    expect(publicRes.body.data.contact.primary_phone.value).toBe('+91 9988776655');
  });

  it('8. GET /api/website/admin/history - should return audit log of changes', async () => {
    const res = await request(app)
      .get('/api/website/admin/history')
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(0);
  });

  it('9. POST /api/website/admin/media - should deny Customer role (403)', async () => {
    const res = await request(app)
      .post('/api/website/admin/media')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        title: 'CSR Tree Plantation',
        section: 'CSR Activities',
        imageUrl: '/uploads/media/test.jpg'
      });
    expect(res.status).toBe(403);
  });

  it('10. POST /api/website/admin/media - should create new CSR Activity image record for Super Admin', async () => {
    const res = await request(app)
      .post('/api/website/admin/media')
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        title: 'Tree Plantation Drive 2026',
        description: 'Planting 500 saplings in Hyderabad city outskirts',
        section: 'CSR Activities',
        category: 'ENVIRONMENT',
        displayType: 'CARD',
        imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800',
        publishNow: true
      });
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.title).toBe('Tree Plantation Drive 2026');

    const createdId = res.body.data.id;

    // Test Updating Media
    const updateRes = await request(app)
      .put(`/api/website/admin/media/${createdId}`)
      .set('Authorization', `Bearer ${superAdminToken}`)
      .send({
        title: 'Tree Plantation Drive 2026 (Updated)',
        description: 'Planting 1000 saplings across Telangana',
        publishNow: true
      });
    expect(updateRes.status).toBe(200);
    expect(updateRes.body.success).toBe(true);
    expect(updateRes.body.data.title).toBe('Tree Plantation Drive 2026 (Updated)');

    // Test Deleting Media
    const deleteRes = await request(app)
      .delete(`/api/website/admin/media/${createdId}`)
      .set('Authorization', `Bearer ${superAdminToken}`);
    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);
  });
});
