/**
 * Safe, development-only demo seed.
 *
 * It is idempotent: it only upserts the three explicitly named demo accounts
 * and their workspace records. It never deletes users, organizations, or
 * domain data. Run with `npm run seed` from server/ after setting
 * ALLOW_DEVELOPMENT_SEED=true in .demo-credentials.local.
 */

import 'dotenv/config';
import dotenv from 'dotenv';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const serverDirectory = dirname(dirname(fileURLToPath(import.meta.url)));
dotenv.config({ path: resolve(serverDirectory, '.demo-credentials.local') });

const prisma = new PrismaClient();
const DEMO_ORGANIZATION = {
  name: 'Development Demo Workspace',
  slug: 'development-demo-workspace',
  description: 'Local-only sample workspace. Do not use for production data.',
};

const demoAccounts = [
  { key: 'ADMIN', email: 'dev-admin@subscription-demo.local', name: 'Dev Admin', role: 'ADMIN' },
  { key: 'STAFF', email: 'dev-staff@subscription-demo.local', name: 'Dev Staff', role: 'STAFF' },
  { key: 'CUSTOMER', email: 'dev-customer@subscription-demo.local', name: 'Dev Customer', role: 'CUSTOMER' },
];

function requireDevelopmentConfiguration() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Development demo seeding is disabled in production.');
  }
  if (process.env.ALLOW_DEVELOPMENT_SEED !== 'true') {
    throw new Error('Set ALLOW_DEVELOPMENT_SEED=true in server/.demo-credentials.local before seeding.');
  }
  for (const account of demoAccounts) {
    const password = process.env[`DEMO_${account.key}_PASSWORD`];
    if (!password || password.length < 12) {
      throw new Error(`DEMO_${account.key}_PASSWORD must be set to at least 12 characters.`);
    }
  }
}

async function upsertDemoUser(account) {
  const passwordHash = await bcrypt.hash(process.env[`DEMO_${account.key}_PASSWORD`], 12);
  return prisma.user.upsert({
    where: { email: account.email },
    create: { email: account.email, name: account.name, passwordHash },
    update: { name: account.name, passwordHash },
  });
}

async function main() {
  requireDevelopmentConfiguration();

  const [admin, staff, customer] = await Promise.all(demoAccounts.map(upsertDemoUser));
  const organization = await prisma.organization.upsert({
    where: { slug: DEMO_ORGANIZATION.slug },
    create: { ...DEMO_ORGANIZATION, createdById: admin.id },
    update: { name: DEMO_ORGANIZATION.name, description: DEMO_ORGANIZATION.description },
  });

  await Promise.all([
    prisma.membership.upsert({
      where: { userId_organizationId: { userId: admin.id, organizationId: organization.id } },
      create: { userId: admin.id, organizationId: organization.id, role: 'ADMIN' },
      update: { role: 'ADMIN' },
    }),
    prisma.membership.upsert({
      where: { userId_organizationId: { userId: staff.id, organizationId: organization.id } },
      create: { userId: staff.id, organizationId: organization.id, role: 'STAFF' },
      update: { role: 'STAFF' },
    }),
    prisma.membership.upsert({
      where: { userId_organizationId: { userId: customer.id, organizationId: organization.id } },
      create: { userId: customer.id, organizationId: organization.id, role: 'CUSTOMER' },
      update: { role: 'CUSTOMER' },
    }),
  ]);

  await prisma.customer.upsert({
    where: { organizationId_email: { organizationId: organization.id, email: customer.email } },
    create: {
      organizationId: organization.id,
      userId: customer.id,
      name: customer.name,
      email: customer.email,
      companyName: 'Development Demo Customer',
    },
    update: { userId: customer.id, name: customer.name },
  });

  console.log(`Seeded ${demoAccounts.length} local demo accounts for ${organization.name}.`);
  console.log('Credentials are stored only in server/.demo-credentials.local.');
}

main()
  .catch((error) => {
    console.error(`Seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
