import bcrypt from 'bcryptjs';
import { prisma } from '../src/utils/prisma';

export async function ensureTestUsersExist() {
  const adminHash = await bcrypt.hash('Admin@123456', 10);
  const agentHash = await bcrypt.hash('Agent@123456', 10);
  const custHash = await bcrypt.hash('Customer@123456', 10);

  // 1. Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@greetwell.com' },
    update: { passwordHash: adminHash, role: 'SUPER_ADMIN', status: 'ACTIVE' },
    create: {
      email: 'admin@greetwell.com',
      passwordHash: adminHash,
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // 2. Loan Agent
  await prisma.user.upsert({
    where: { email: 'loan.agent@greetwell.com' },
    update: { passwordHash: agentHash, role: 'LOAN_AGENT', status: 'ACTIVE' },
    create: {
      email: 'loan.agent@greetwell.com',
      passwordHash: agentHash,
      firstName: 'Sarah',
      lastName: 'Jenkins',
      role: 'LOAN_AGENT',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // 3. Insurance Agent
  await prisma.user.upsert({
    where: { email: 'insurance.agent@greetwell.com' },
    update: { passwordHash: agentHash, role: 'INSURANCE_AGENT', status: 'ACTIVE' },
    create: {
      email: 'insurance.agent@greetwell.com',
      passwordHash: agentHash,
      firstName: 'Marcus',
      lastName: 'Vance',
      role: 'INSURANCE_AGENT',
      status: 'ACTIVE',
      emailVerified: true,
    },
  });

  // 4. Customer
  await prisma.user.upsert({
    where: { email: 'john.doe@example.com' },
    update: { passwordHash: custHash, role: 'CUSTOMER', status: 'ACTIVE', serviceTypes: JSON.stringify(['LOANS', 'INSURANCE', 'INVESTMENT']) },
    create: {
      email: 'john.doe@example.com',
      passwordHash: custHash,
      firstName: 'John',
      lastName: 'Doe',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      serviceTypes: JSON.stringify(['LOANS', 'INSURANCE', 'INVESTMENT']),
      emailVerified: true,
    },
  });
}
