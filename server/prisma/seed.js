/**
 * Development seed script.
 * Creates clearly identified demo users, organizations, and memberships.
 *
 * Run: npm run seed (from server/)
 *
 * WARNING: Do not run this in production.
 * Demo credentials are for development only.
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding development data...\n');

  // Clean existing seed data
  await prisma.auditLog.deleteMany({});
  await prisma.membership.deleteMany({});
  await prisma.organization.deleteMany({});
  await prisma.user.deleteMany({});

  // Create demo users
  const passwordHash = await bcrypt.hash('demo123', 12);
  const adminHash = await bcrypt.hash('admin123', 12);

  const demoUser = await prisma.user.create({
    data: {
      email: 'demo@nexus.io',
      name: 'Priya Sharma',
      passwordHash,
    },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@nexus.io',
      name: 'Arjun Menon',
      passwordHash: adminHash,
    },
  });

  console.log('✓ Created users:', demoUser.email, adminUser.email);

  // Create organizations
  const org1 = await prisma.organization.create({
    data: {
      name: 'Apex Innovations',
      slug: 'apex-innovations',
      description: 'Operations and intelligent systems engineering.',
      createdById: demoUser.id,
    },
  });

  const org2 = await prisma.organization.create({
    data: {
      name: 'HyperScale Systems',
      slug: 'hyperscale-systems',
      description: 'Enterprise data fabric and distributed processing.',
      createdById: adminUser.id,
    },
  });

  console.log('✓ Created organizations:', org1.name, org2.name);

  // Create memberships
  await prisma.membership.createMany({
    data: [
      { userId: demoUser.id, organizationId: org1.id, role: 'OWNER' },
      { userId: demoUser.id, organizationId: org2.id, role: 'MEMBER' },
      { userId: adminUser.id, organizationId: org2.id, role: 'OWNER' },
      { userId: adminUser.id, organizationId: org1.id, role: 'ADMIN' },
    ],
  });

  console.log('✓ Created memberships');

  // Create sample audit logs
  const now = new Date();
  await prisma.auditLog.createMany({
    data: [
      {
        userId: demoUser.id,
        organizationId: org1.id,
        action: 'ORG_CREATED',
        resource: 'organization',
        resourceId: org1.id,
        createdAt: new Date(now - 5 * 24 * 60 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        organizationId: org2.id,
        action: 'ORG_CREATED',
        resource: 'organization',
        resourceId: org2.id,
        createdAt: new Date(now - 3 * 24 * 60 * 60 * 1000),
      },
      {
        userId: demoUser.id,
        organizationId: org1.id,
        action: 'ANALYTICS_QUERY',
        resource: 'analytics',
        metadata: { question: 'Show organizations by member count' },
        createdAt: new Date(now - 1 * 24 * 60 * 60 * 1000),
      },
      {
        userId: adminUser.id,
        organizationId: org1.id,
        action: 'MEMBER_INVITED',
        resource: 'membership',
        metadata: { invitedEmail: 'riya@example.com', role: 'MEMBER' },
        createdAt: new Date(now - 2 * 60 * 60 * 1000),
      },
    ],
  });

  console.log('✓ Created audit logs');

  console.log(`
✅ Seed complete!

Demo credentials (development only):
  Email: demo@nexus.io   Password: demo123
  Email: admin@nexus.io  Password: admin123

Organizations:
  - Apex Innovations (slug: apex-innovations)
  - HyperScale Systems (slug: hyperscale-systems)
`);
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

