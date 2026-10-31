import {
  createOrganization,
  findOrgsByUserId,
  findOrgById,
  findSlug,
} from './organizations.repository.js';
import { slugify, slugifyUnique } from '../../utils/slugify.js';
import { NotFoundError } from '../../errors/HttpErrors.js';
import { ConflictError } from '../../errors/HttpErrors.js';
import { prisma } from '../../config/database.js';
import { recordAudit } from '../../utils/audit.js';

async function resolveUniqueSlug(name) {
  const base = slugify(name);
  const exists = await findSlug(base);
  if (!exists) return base;
  // Append random suffix until unique
  let candidate;
  do {
    candidate = slugifyUnique(name);
  } while (await findSlug(candidate));
  return candidate;
}

export async function createOrg({ name, description, userId }) {
  const slug = await resolveUniqueSlug(name);
  return createOrganization({ name, slug, description, createdById: userId });
}

export async function getUserOrganizations(userId) {
  return findOrgsByUserId(userId);
}

export async function getOrganization(orgId, requestingUserId) {
  const org = await findOrgById(orgId);
  if (!org) throw new NotFoundError('Organization not found');

  // Verify the requesting user is a member (belt-and-suspenders check)
  const isMember = org.memberships.some((m) => m.userId === requestingUserId);
  if (!isMember) throw new NotFoundError('Organization not found or access denied');

  // A customer or staff user needs their own organization context, not the
  // full roster of unrelated members.
  const membership = org.memberships.find((item) => item.userId === requestingUserId);
  if (membership.role !== 'ADMIN') {
    return {
      ...org,
      memberships: org.memberships.filter((item) => item.userId === requestingUserId),
    };
  }
  return org;
}

export async function switchOrganization(orgId, userId) {
  // Validate user has access to the requested org
  const org = await getOrganization(orgId, userId);
  return { organization: org };
}

async function requireAdminMembership(orgId, userId) {
  const membership = await prisma.membership.findUnique({ where: { userId_organizationId: { userId, organizationId: orgId } } });
  if (!membership || membership.role !== 'ADMIN') throw new NotFoundError('Organization not found or access denied');
  return membership;
}

export async function patchOrganization(orgId, userId, data) {
  await requireAdminMembership(orgId, userId);
  const organization = await prisma.organization.update({ where: { id: orgId }, data });
  await recordAudit({ organizationId: orgId, userId, action: 'organization.updated', resource: 'organization', resourceId: orgId });
  return organization;
}

export async function listMembers(orgId, userId) {
  await requireAdminMembership(orgId, userId);
  return prisma.membership.findMany({
    where: { organizationId: orgId },
    include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    orderBy: { createdAt: 'asc' },
  });
}

export async function addMember(orgId, userId, { email, role }) {
  await requireAdminMembership(orgId, userId);
  const memberUser = await prisma.user.findUnique({ where: { email } });
  if (!memberUser) throw new NotFoundError('The invited user must register before being added');
  try {
    const membership = await prisma.membership.create({
      data: { organizationId: orgId, userId: memberUser.id, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });
    await recordAudit({ organizationId: orgId, userId, action: 'organization.member_added', resource: 'membership', resourceId: membership.id, metadata: { role } });
    return membership;
  } catch (error) {
    if (error.code === 'P2002') throw new ConflictError('User is already a member of this organization');
    throw error;
  }
}

export async function updateMemberRole(orgId, userId, membershipId, role) {
  await requireAdminMembership(orgId, userId);
  const membership = await prisma.membership.findFirst({ where: { id: membershipId, organizationId: orgId } });
  if (!membership) throw new NotFoundError('Membership not found');
  const updated = await prisma.membership.update({ where: { id: membershipId }, data: { role }, include: { user: { select: { id: true, name: true, email: true } } } });
  await recordAudit({ organizationId: orgId, userId, action: 'organization.member_role_updated', resource: 'membership', resourceId: membershipId, metadata: { role } });
  return updated;
}

export async function removeMember(orgId, userId, membershipId) {
  await requireAdminMembership(orgId, userId);
  const membership = await prisma.membership.findFirst({ where: { id: membershipId, organizationId: orgId } });
  if (!membership) throw new NotFoundError('Membership not found');
  if (membership.role === 'ADMIN') {
    const admins = await prisma.membership.count({ where: { organizationId: orgId, role: 'ADMIN' } });
    if (admins <= 1) throw new ConflictError('Cannot remove the last organization admin');
  }
  await prisma.membership.delete({ where: { id: membershipId } });
  await recordAudit({ organizationId: orgId, userId, action: 'organization.member_removed', resource: 'membership', resourceId: membershipId });
}

export async function getSettings(orgId, userId) {
  await requireAdminMembership(orgId, userId);
  return prisma.organizationSetting.findUnique({ where: { organizationId: orgId } });
}

export async function updateSettings(orgId, userId, data) {
  await requireAdminMembership(orgId, userId);
  const settings = await prisma.organizationSetting.upsert({ where: { organizationId: orgId }, create: { organizationId: orgId, ...data }, update: data });
  await recordAudit({ organizationId: orgId, userId, action: 'organization.settings_updated', resource: 'organization_setting', resourceId: settings.id });
  return settings;
}

