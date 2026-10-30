import {
  createOrganization,
  findOrgsByUserId,
  findOrgById,
  findSlug,
} from './organizations.repository.js';
import { slugify, slugifyUnique } from '../../utils/slugify.js';
import { NotFoundError } from '../../errors/HttpErrors.js';

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

  return org;
}

export async function switchOrganization(orgId, userId) {
  // Validate user has access to the requested org
  const org = await getOrganization(orgId, userId);
  return { organization: org };
}

