import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app';
import { prisma } from '../src/utils/prisma';
import { ensureTestUsersExist } from './setupTestUsers';

describe('Financial Services Portal Backend API Tests', () => {
  let superAdminToken: string;
  let loanAgentToken: string;
  let insuranceAgentToken: string;
  let customerToken: string;
  let createdAppId: string;

  beforeAll(async () => {
    await ensureTestUsersExist();

    // Login Super Admin
    const adminRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'admin@greetwell.com', password: 'Admin@123456' });
    expect(adminRes.status).toBe(200);
    superAdminToken = adminRes.body.data.token;

    // Login Loan Agent
    const loanRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'loan.agent@greetwell.com', password: 'Agent@123456' });
    expect(loanRes.status).toBe(200);
    loanAgentToken = loanRes.body.data.token;

    // Login Insurance Agent
    const insRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'insurance.agent@greetwell.com', password: 'Agent@123456' });
    expect(insRes.status).toBe(200);
    insuranceAgentToken = insRes.body.data.token;

    // Login Customer
    const custRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'john.doe@example.com', password: 'Customer@123456' });
    expect(custRes.status).toBe(200);
    customerToken = custRes.body.data.token;

    // Enable all service types for test customer john.doe@example.com
    await prisma.user.update({
      where: { email: 'john.doe@example.com' },
      data: { serviceTypes: JSON.stringify(['LOANS', 'INSURANCE', 'INVESTMENT']) },
    });
  });

  describe('1. Authentication & Security Tests', () => {
    it('should reject invalid credentials with 401', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'admin@greetwell.com', password: 'wrongpassword' });
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should create active customer registration and allow immediate login without email verification', async () => {
      const email = `activecustomer.${Date.now()}@example.com`;
      const pass = 'TestPassword123!';
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: pass,
          confirmPassword: pass,
          firstName: 'Active',
          lastName: 'Customer',
          phone: '+919876543210',
          serviceTypes: ['LOANS'],
        });
      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ACTIVE');
      expect(res.body.data.customerIdCode).toMatch(/^CUS-2026-/);

      // Verify immediate login capability
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email, password: pass });
      expect(loginRes.status).toBe(200);
      expect(loginRes.body.success).toBe(true);
      expect(loginRes.body.data.token).toBeDefined();
      expect(loginRes.body.data.user.status).toBe('ACTIVE');

      // Verify email endpoint returns 200 OK for active users
      if (res.body.data.verificationToken) {
        const verifyRes = await request(app)
          .post(`/api/auth/verify-email/${res.body.data.verificationToken}`);
        expect(verifyRes.status).toBe(200);
        expect(verifyRes.body.success).toBe(true);
      }
    });
  });

  describe('2. Role-Based Access Control (RBAC) Enforcement', () => {
    it('Super Admin can access system audit logs', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('Loan Agent CANNOT access system audit logs (Forbidden 403)', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${loanAgentToken}`);
      expect(res.status).toBe(403);
    });

    it('Customer CANNOT access user management (Forbidden 403)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe('3. Application & Role Compatibility Assignment Workflow', () => {
    it('Customer creates a new Loan Application', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          type: 'LOAN',
          amount: 25000,
          term: '24 Months',
          purpose: 'Auto Purchase',
        });
      expect(res.status).toBe(201);
      expect(res.body.data.id).toMatch(/^LOAN-2026-/);
      createdAppId = res.body.data.id;
    });

    it('Super Admin CANNOT assign Insurance Agent to a Loan Application', async () => {
      // Get Insurance agent ID
      const usersRes = await request(app)
        .get('/api/users?role=INSURANCE_AGENT')
        .set('Authorization', `Bearer ${superAdminToken}`);
      const insAgentId = usersRes.body.data[0].id;

      const assignRes = await request(app)
        .put(`/api/applications/${createdAppId}/assign`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ agentId: insAgentId });

      expect(assignRes.status).toBe(400);
      expect(assignRes.body.message).toContain('Cannot assign a LOAN application to a INSURANCE AGENT');
    });

    it('Super Admin assigns Loan Agent to Loan Application successfully', async () => {
      const usersRes = await request(app)
        .get('/api/users?role=LOAN_AGENT&search=loan.agent@greetwell.com')
        .set('Authorization', `Bearer ${superAdminToken}`);
      const loanAgentUser = usersRes.body.data.find((u: any) => u.email === 'loan.agent@greetwell.com') || usersRes.body.data[0];
      const loanAgentId = loanAgentUser.id;

      const assignRes = await request(app)
        .put(`/api/applications/${createdAppId}/assign`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ agentId: loanAgentId });

      expect(assignRes.status).toBe(200);
      expect(assignRes.body.data.assignedAgentId).toBe(loanAgentId);
    });

    it('Assigned Loan Agent updates application status to UNDER_REVIEW', async () => {
      const res = await request(app)
        .put(`/api/applications/${createdAppId}/status`)
        .set('Authorization', `Bearer ${loanAgentToken}`)
        .send({ status: 'UNDER_REVIEW', note: 'Beginning document check.' });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('UNDER_REVIEW');
    });
  });

  describe('4. Dynamic Menu Items, Active/Inactive Menu Behavior & Method Permissions Tests', () => {
    let createdTestMenuId: string;

    it('Customer fetches permitted active menus from /api/menus/my-menus', async () => {
      const res = await request(app)
        .get('/api/menus/my-menus')
        .set('Authorization', `Bearer ${customerToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);

      const urls = res.body.data.map((m: any) => m.url);
      expect(urls).toContain('/customer/dashboard');
      expect(urls).not.toContain('/superadmin/audit-logs');
    });

    it('Loan Agent receives only Loan Agent permitted menus', async () => {
      const res = await request(app)
        .get('/api/menus/my-menus')
        .set('Authorization', `Bearer ${loanAgentToken}`);
      expect(res.status).toBe(200);

      const urls = res.body.data.map((m: any) => m.url);
      expect(urls).toContain('/agent/loan-applications');
      expect(urls).not.toContain('/agent/insurance-applications');
      expect(urls).not.toContain('/superadmin/permissions/menu-items');
    });

    it('Super Admin creates a new custom menu item', async () => {
      // Clean up previous run test menu if exists
      await prisma.roleMenuPermission.deleteMany({ where: { menu: { url: '/agent/loan-analytics-test' } } });
      await prisma.menu.deleteMany({ where: { url: '/agent/loan-analytics-test' } });

      const res = await request(app)
        .post('/api/menus')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          name: 'Custom Loan Analytics',
          url: '/agent/loan-analytics-test',
          icon: 'BarChart3',
          displayOrder: 99,
          isActive: true,
          description: 'Special analytics module for loan desk.',
          rolePermissions: {
            SUPER_ADMIN: true,
            LOAN_AGENT: true,
            INSURANCE_AGENT: false,
            CUSTOMER: false,
          },
        });
      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Custom Loan Analytics');
      createdTestMenuId = res.body.data.id;
    });

    it('Super Admin deactivates the menu item (Is Active = Inactive)', async () => {
      const res = await request(app)
        .patch(`/api/menus/${createdTestMenuId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({ isActive: false });
      expect(res.status).toBe(200);
      expect(res.body.data.isActive).toBe(false);
    });

    it('Direct URL access to deactivated menu returns 403 Forbidden with "This menu is currently unavailable."', async () => {
      const res = await request(app)
        .get('/api/menus/check-access?url=/agent/loan-analytics-test')
        .set('Authorization', `Bearer ${loanAgentToken}`);
      expect(res.status).toBe(403);
      expect(res.body.allowed).toBe(false);
      expect(res.body.message).toContain('This menu is currently unavailable.');
    });

    it('Super Admin fetches API Method Permissions', async () => {
      const res = await request(app)
        .get('/api/permissions/methods')
        .set('Authorization', `Bearer ${superAdminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('5. Customer Onboarding & Invitation System Tests', () => {
    let inviteToken: string;
    const testCustomerEmail = `invited.customer.${Date.now()}@example.com`;

    it('Loan Agent sends invitation to customer with LOANS service', async () => {
      const res = await request(app)
        .post('/api/users/invite-customer')
        .set('Authorization', `Bearer ${loanAgentToken}`)
        .send({
          firstName: 'Onboarded',
          lastName: 'Customer',
          email: testCustomerEmail,
          phone: '+1 (555) 987-6543',
          serviceTypes: ['LOANS'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.customerIdCode).toMatch(/^CUS-\d{4}-\d{6}$/);
      expect(res.body.data.email).toBe(testCustomerEmail);
      expect(res.body.data.token).toBeDefined();
      inviteToken = res.body.data.token;
    });

    it('Loan Agent fails to invite customer with unauthorized INSURANCE service selection', async () => {
      const res = await request(app)
        .post('/api/users/invite-customer')
        .set('Authorization', `Bearer ${loanAgentToken}`)
        .send({
          firstName: 'UnAuth',
          lastName: 'Service',
          email: `unauth.${Date.now()}@example.com`,
          phone: '+1 (555) 111-2222',
          serviceTypes: ['INSURANCE'],
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Loan Agents are authorized to invite customers for Loans service only.');
    });

    it('Super Admin successfully invites customer with multi-service selection (LOANS, INSURANCE, INVESTMENT)', async () => {
      const multiEmail = `multi.service.${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/users/invite-customer')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          firstName: 'MultiService',
          lastName: 'Client',
          email: multiEmail,
          phone: '+1 (555) 333-4444',
          serviceTypes: ['LOANS', 'INSURANCE', 'INVESTMENT'],
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.serviceTypes).toEqual(['LOANS', 'INSURANCE', 'INVESTMENT']);
    });

    it('Customer verifies invitation token from email link', async () => {
      const res = await request(app).get(`/api/auth/invite/${inviteToken}`);
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(testCustomerEmail);
      expect(res.body.data.customerIdCode).toMatch(/^CUS-\d{4}-\d{6}$/);
    });

    it('Customer sets password to complete account activation', async () => {
      const res = await request(app)
        .post(`/api/auth/invite/${inviteToken}/accept`)
        .send({
          firstName: 'Onboarded',
          lastName: 'Customer',
          phone: '+1 (555) 987-6543',
          password: 'CustomerSecurePassword123!',
          confirmPassword: 'CustomerSecurePassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.role).toBe('CUSTOMER');
      expect(res.body.data.user.customerIdCode).toMatch(/^CUS-\d{4}-\d{6}$/);
      expect(res.body.data.user.status).toBe('ACTIVE');
    });
  });

  describe('6. Agent Onboarding, Registration & OTP Verification System Tests', () => {
    let agentToken: string;
    let emailOtp: string;
    let mobileOtp: string;
    const testAgentEmail = `invited.agent.${Date.now()}@example.com`;

    it('Super Admin invites Agent with mandatory details & Aadhaar document', async () => {
      const res = await request(app)
        .post('/api/users/create-agent')
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          firstName: 'Vikram',
          dob: '1992-05-15',
          education: "Bachelor's Degree (B.Com / B.A. / B.Sc / B.Tech)",
          email: testAgentEmail,
          phone: '+91 98765 12345',
          agentType: 'LOAN_AGENT',
          aadhaarDocUrl: 'https://storage.greetwell.com/docs/aadhaar_vikram.pdf',
          hasExperience: true,
          previousCompany: 'HDFC Financial Desk',
          previousJobRole: 'Senior Loan Specialist',
          yearsOfExperience: '4 Years',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.agentIdCode).toMatch(/^AGT-\d{4}-\d{6}$/);
      expect(res.body.data.email).toBe(testAgentEmail);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.emailOtp).toBeDefined();
      expect(res.body.data.mobileOtp).toBeDefined();

      agentToken = res.body.data.token;
      emailOtp = res.body.data.emailOtp;
      mobileOtp = res.body.data.mobileOtp;
    });

    it('Non-admin user (Customer) is forbidden from inviting agents', async () => {
      const res = await request(app)
        .post('/api/users/create-agent')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          firstName: 'UnauthAgent',
          email: `unauth.agent.${Date.now()}@example.com`,
          agentType: 'INSURANCE_AGENT',
          dob: '1995-01-01',
          education: 'High School',
          phone: '+91 99999 88888',
          aadhaarDocUrl: 'https://storage.greetwell.com/docs/aadhaar.pdf',
        });

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Agent fails to set password BEFORE completing OTP verification', async () => {
      const res = await request(app)
        .post(`/api/auth/invite/${agentToken}/accept`)
        .send({
          firstName: 'Vikram',
          password: 'AgentSecurePassword123!',
          confirmPassword: 'AgentSecurePassword123!',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Please complete Email & Mobile OTP verification');
    });

    it('Agent fails OTP verification with incorrect OTP codes', async () => {
      const res = await request(app)
        .post(`/api/auth/invite/${agentToken}/verify-otp`)
        .send({
          emailOtp: '000000',
          mobileOtp: '000000',
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Invalid Verification OTP entered');
    });

    it('Agent successfully verifies valid Email and Mobile OTP codes', async () => {
      const res = await request(app)
        .post(`/api/auth/invite/${agentToken}/verify-otp`)
        .send({
          emailOtp,
          mobileOtp,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isEmailVerified).toBe(true);
      expect(res.body.data.isMobileVerified).toBe(true);
    });

    it('Agent sets password, activates account, and receives agentIdCode', async () => {
      const res = await request(app)
        .post(`/api/auth/invite/${agentToken}/accept`)
        .send({
          firstName: 'Vikram',
          password: 'AgentSecurePassword123!',
          confirmPassword: 'AgentSecurePassword123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.role).toBe('LOAN_AGENT');
      expect(res.body.data.user.agentIdCode).toMatch(/^AGT-\d{4}-\d{6}$/);
      expect(res.body.data.user.status).toBe('ACTIVE');
    });

    it('Newly activated Agent logs in to Agent Portal', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: testAgentEmail,
          password: 'AgentSecurePassword123!',
          requiredCategory: 'AGENT',
          requiredRole: 'LOAN_AGENT',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.agentIdCode).toMatch(/^AGT-\d{4}-\d{6}$/);
    });

    it('Customer registration works cleanly without optional Last Name', async () => {
      const noLastNameEmail = `nolastname.${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          firstName: 'SingleNameCustomer',
          email: noLastNameEmail,
          password: 'SecureCustomer123!',
          confirmPassword: 'SecureCustomer123!',
          serviceTypes: ['LOANS'],
          skipVerification: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.firstName).toBe('SingleNameCustomer');
      expect(res.body.data.user.lastName).toBeNull();
    });

    it('Super Admin fetches GET /api/dashboard/stats successfully even when agents/users have null optional Last Name', async () => {
      const res = await request(app)
        .get('/api/dashboard/stats')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.metrics).toBeDefined();
      expect(res.body.data.charts.agentPerformance).toBeDefined();
    });

    it('Super Admin fetches all agents directory via GET /api/users?role=AGENTS', async () => {
      const res = await request(app)
        .get('/api/users?role=AGENTS')
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const roles = res.body.data.map((u: any) => u.role);
      expect(roles.every((r: string) => ['LOAN_AGENT', 'INSURANCE_AGENT', 'INVESTMENT_AGENT'].includes(r))).toBe(true);
    });

    it('Super Admin resends agent invitation successfully', async () => {
      const invsRes = await request(app)
        .get('/api/users/invitations')
        .set('Authorization', `Bearer ${superAdminToken}`);

      const agentInv = invsRes.body.data.find((inv: any) => ['LOAN_AGENT', 'INSURANCE_AGENT', 'INVESTMENT_AGENT'].includes(inv.role) && inv.status !== 'VERIFIED');
      expect(agentInv).toBeDefined();

      const res = await request(app)
        .post(`/api/users/invitations/${agentInv.id}/resend`)
        .set('Authorization', `Bearer ${superAdminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.emailOtp).toBeDefined();
      expect(res.body.data.mobileOtp).toBeDefined();
    });
  });

  describe('7. Extended Applications Workflow, Chit Schemes, Customer Requests & Indian Mobile Validation', () => {
    let createdChitAppId: string;
    let createdRequestId: string;

    it('Rejects invalid Indian mobile number formats (must be 10-12 numeric digits)', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          type: 'LOAN',
          amount: 50000,
          purpose: 'Invalid Phone Test',
          formData: {
            mobile: '12345', // Too short
          },
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe('Please enter a valid Indian mobile number using 10–12 digits.');
    });

    it('Customer creates Insurance Application successfully with INS-2026-XXXXXX ID', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          type: 'INSURANCE',
          amount: 500000,
          term: '1 Year',
          purpose: 'Health Protection Plan',
          formData: {
            productType: 'Health Insurance',
            nomineeName: 'Jane Doe',
            nomineeRelation: 'Spouse',
            sumInsured: '500000',
            mobile: '9876543210',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toMatch(/^INS-2026-\d{6}$/);
    });

    it('Customer creates Investment Application with Chit Fund Scheme details successfully (INV-2026-XXXXXX)', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          type: 'INVESTMENT',
          amount: 100000,
          term: '20 Months',
          purpose: 'GFS Monthly Gold Chit Scheme',
          formData: {
            productType: 'Chit Investment',
            chitSchemeName: 'GFS Gold Monthly Chit',
            chitTotalAmount: '100000',
            chitMonthlyContribution: '5000',
            chitDurationMonths: '20',
            chitMembersCount: '20',
            bankAccountNo: '9876543210123',
            bankIfscCode: 'SBIN0001234',
            mobile: '9876543210',
          },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toMatch(/^INV-2026-\d{6}$/);
      createdChitAppId = res.body.data.id;
    });

    it('Super Admin creates Customer Request on Chit Investment Application', async () => {
      const res = await request(app)
        .post(`/api/applications/${createdChitAppId}/requests`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          title: 'Upload Bank Passbook Copy',
          description: 'Please provide a clear scanned copy of your bank passbook front page for payout verification.',
          isRequired: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Upload Bank Passbook Copy');
      expect(res.body.data.status).toBe('OPEN');
      createdRequestId = res.body.data.id;
    });

    it('Customer submits reply and document link to open request', async () => {
      const res = await request(app)
        .post(`/api/applications/requests/${createdRequestId}/reply`)
        .set('Authorization', `Bearer ${customerToken}`)
        .send({
          customerReply: 'Passbook scanned copy attached as requested.',
          replyDocUrl: 'http://localhost:5000/uploads/passbook.pdf',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('CUSTOMER_REPLIED');
      expect(res.body.data.customerReply).toContain('Passbook scanned copy');
    });

    it('Super Admin updates request status to COMPLETED', async () => {
      const res = await request(app)
        .put(`/api/applications/requests/${createdRequestId}/status`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          status: 'COMPLETED',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('COMPLETED');
    });
  });

  describe('8. Service-Wise and Role-Wise Access Control Tests', () => {
    let custAToken: string;
    let custAId: string;
    let custBToken: string;
    let custBId: string;
    let loanAppAId: string;

    it('Scenario 1 & 2: Customer A registers for Loans service only and receives active account', async () => {
      const email = `custA.${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          firstName: 'Customer',
          lastName: 'Alpha',
          phone: '9876543210',
          serviceTypes: ['LOANS'],
          skipVerification: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      custAToken = res.body.data.token;
      custAId = res.body.data.user.id;
      expect(res.body.data.user.serviceTypes).toEqual(['LOANS']);
    });

    it('Scenario 3: Customer A creates a Loan Application successfully', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${custAToken}`)
        .send({
          type: 'LOAN',
          amount: 25000,
          term: '12 Months',
          purpose: 'Personal Loan for Medical',
          formData: { productType: 'Personal Loan', mobile: '9876543210' },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      loanAppAId = res.body.data.id;
    });

    it('Scenario 4 & 5: Customer A CANNOT create Insurance application (Forbidden 403)', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${custAToken}`)
        .send({
          type: 'INSURANCE',
          amount: 500000,
          term: '1 Year',
          purpose: 'Health Coverage',
          formData: { productType: 'Health Insurance', mobile: '9876543210' },
        });

      expect(res.status).toBe(403);
      expect(res.body.message).toContain('not enabled for your customer account');
    });

    it('Scenario 6 & 7: Customer B registers for Loans and Insurance services', async () => {
      const email = `custB.${Date.now()}@example.com`;
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          email,
          password: 'Password123!',
          confirmPassword: 'Password123!',
          firstName: 'Customer',
          lastName: 'Beta',
          phone: '9876543211',
          serviceTypes: ['LOANS', 'INSURANCE'],
          skipVerification: true,
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      custBToken = res.body.data.token;
      custBId = res.body.data.user.id;
      expect(res.body.data.user.serviceTypes).toEqual(['LOANS', 'INSURANCE']);
    });

    it('Scenario 8: Customer B creates Insurance Application successfully but is blocked from Investment (403)', async () => {
      const insRes = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${custBToken}`)
        .send({
          type: 'INSURANCE',
          amount: 1000000,
          term: '1 Year',
          purpose: 'Life Insurance Cover',
          formData: { productType: 'Life Insurance', mobile: '9876543211' },
        });

      expect(insRes.status).toBe(201);

      const invRes = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${custBToken}`)
        .send({
          type: 'INVESTMENT',
          amount: 50000,
          term: '24 Months',
          purpose: 'Chit Scheme',
          formData: { productType: 'Chit Investment', mobile: '9876543211' },
        });

      expect(invRes.status).toBe(403);
    });

    it('Scenario 10: Customer B submits service access request for Investment', async () => {
      const res = await request(app)
        .post('/api/users/request-service')
        .set('Authorization', `Bearer ${custBToken}`)
        .send({
          requestedService: 'INVESTMENT',
          reason: 'Interested in GFS Monthly Chit Scheme',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('Scenario 10 (cont): Super Admin approves and updates Customer B service access to include INVESTMENT', async () => {
      const res = await request(app)
        .put(`/api/users/${custBId}/services`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          serviceTypes: ['LOANS', 'INSURANCE', 'INVESTMENT'],
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.serviceTypes).toEqual(['LOANS', 'INSURANCE', 'INVESTMENT']);
    });

    it('Customer B can now create Investment application after Super Admin approval', async () => {
      const res = await request(app)
        .post('/api/applications')
        .set('Authorization', `Bearer ${custBToken}`)
        .send({
          type: 'INVESTMENT',
          amount: 50000,
          term: '24 Months',
          purpose: 'Chit Scheme',
          formData: { productType: 'Chit Investment', mobile: '9876543211' },
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('Scenario 9 & 10: Agent scaping — Loan Agent cannot view unassigned Customer A profile (403)', async () => {
      const res = await request(app)
        .get(`/api/users/${custAId}`)
        .set('Authorization', `Bearer ${loanAgentToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it('Scenario 13 & 14: Super Admin assigns Loan Application to Loan Agent and views all system data', async () => {
      const res = await request(app)
        .put(`/api/applications/${loanAppAId}/assign`)
        .set('Authorization', `Bearer ${superAdminToken}`)
        .send({
          agentId: (await prisma.user.findFirst({ where: { role: 'LOAN_AGENT' } }))?.id,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('Customer Application Data Isolation: Customer B cannot view Customer A applications in GET /applications', async () => {
      const res = await request(app)
        .get('/api/applications')
        .set('Authorization', `Bearer ${custBToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const appIds = res.body.data.map((a: any) => a.id);
      expect(appIds).not.toContain(loanAppAId);
    });

    it('Customer Application Data Isolation: Customer B gets 403 Forbidden when accessing Customer A application via direct URL (GET /applications/:id)', async () => {
      const res = await request(app)
        .get(`/api/applications/${loanAppAId}`)
        .set('Authorization', `Bearer ${custBToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('Access denied');
    });

    it('Customer A can successfully access their own application via GET /applications/:id', async () => {
      const res = await request(app)
        .get(`/api/applications/${loanAppAId}`)
        .set('Authorization', `Bearer ${custAToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe(loanAppAId);
    });

    describe('9. Enquiries & Complaints Management Module Tests', () => {
      let enquiryId: string;

      it('Customer A creates Enquiry ticket successfully with ENQ-2026-XXXXXX ID', async () => {
        const res = await request(app)
          .post('/api/enquiries')
          .set('Authorization', `Bearer ${custAToken}`)
          .send({
            subject: 'Question regarding Loan Disbursal Timeline',
            category: 'Loan',
            relatedApplicationId: loanAppAId,
            description: 'Could you please confirm when the loan amount will be credited to my bank account?',
            priority: 'HIGH',
            contactPhone: '9876543210',
          });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toMatch(/^ENQ-2026-\d{6}$/);
        expect(res.body.data.status).toBe('OPEN');
        enquiryId = res.body.data.id;
      });

      it('Customer A views Enquiry in GET /enquiries', async () => {
        const res = await request(app)
          .get('/api/enquiries')
          .set('Authorization', `Bearer ${custAToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        const ids = res.body.data.map((e: any) => e.id);
        expect(ids).toContain(enquiryId);
      });

      it('Customer B is blocked with 403 Forbidden from accessing Customer A enquiry via GET /enquiries/:id', async () => {
        const res = await request(app)
          .get(`/api/enquiries/${enquiryId}`)
          .set('Authorization', `Bearer ${custBToken}`);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
      });

      it('Super Admin can view Customer A enquiry details (GET /enquiries/:id)', async () => {
        const res = await request(app)
          .get(`/api/enquiries/${enquiryId}`)
          .set('Authorization', `Bearer ${superAdminToken}`);

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data.id).toBe(enquiryId);
      });

      it('Super Admin posts a reply and updates status to AWAITING_INFORMATION', async () => {
        const msgRes = await request(app)
          .post(`/api/enquiries/${enquiryId}/messages`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({
            message: 'Hello Customer A, please upload your latest 3 months bank statement for verification.',
          });

        expect(msgRes.status).toBe(201);
        expect(msgRes.body.success).toBe(true);

        const statusRes = await request(app)
          .put(`/api/enquiries/${enquiryId}/status`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({
            status: 'AWAITING_INFORMATION',
            resolutionComment: 'Awaiting 3 months bank statement upload.',
          });

        expect(statusRes.status).toBe(200);
        expect(statusRes.body.data.status).toBe('AWAITING_INFORMATION');
      });

      it('Customer A replies to enquiry thread and status automatically reverts to IN_PROGRESS', async () => {
        const res = await request(app)
          .post(`/api/enquiries/${enquiryId}/messages`)
          .set('Authorization', `Bearer ${custAToken}`)
          .send({
            message: 'I have uploaded the bank statement to my documents section.',
          });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);

        // Verify status auto updated
        const detailRes = await request(app)
          .get(`/api/enquiries/${enquiryId}`)
          .set('Authorization', `Bearer ${custAToken}`);

        expect(detailRes.status).toBe(200);
        expect(detailRes.body.data.status).toBe('IN_PROGRESS');
        expect(detailRes.body.data.messages.length).toBeGreaterThanOrEqual(2);
      });

      it('Super Admin resolves enquiry ticket', async () => {
        const res = await request(app)
          .put(`/api/enquiries/${enquiryId}/status`)
          .set('Authorization', `Bearer ${superAdminToken}`)
          .send({
            status: 'RESOLVED',
            resolutionComment: 'Bank statement verified. Loan amount scheduled for disbursal today.',
          });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('RESOLVED');
      });

      it('Customer A can reopen resolved enquiry ticket', async () => {
        const res = await request(app)
          .put(`/api/enquiries/${enquiryId}/status`)
          .set('Authorization', `Bearer ${custAToken}`)
          .send({
            status: 'IN_PROGRESS',
          });

        expect(res.status).toBe(200);
        expect(res.body.data.status).toBe('IN_PROGRESS');
      });
    });
  });
});

