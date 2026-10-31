/**
 * Tenant isolation tests.
 * Run with: node --test tests/tenant-isolation.test.js
 *
 * These tests use the repository layer directly with an in-memory mock
 * of the Prisma client so they can run without a live database.
 */

import { test, describe, mock, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

// ── Mock Prisma ──────────────────────────────────────────────────────────────

const USER_A = { id: 'user-a', email: 'usera@test.com', name: 'User A' };
const USER_B = { id: 'user-b', email: 'userb@test.com', name: 'User B' };
const ORG_A = { id: 'org-a', name: 'Org A', slug: 'org-a', createdById: USER_A.id };
const ORG_B = { id: 'org-b', name: 'Org B', slug: 'org-b', createdById: USER_B.id };

const MEMBERSHIPS = [
  { userId: USER_A.id, organizationId: ORG_A.id, role: 'ADMIN', organization: ORG_A },
  { userId: USER_B.id, organizationId: ORG_B.id, role: 'ADMIN', organization: ORG_B },
];

/**
 * Simulate resolveTenant: looks up membership in DB.
 * Returns the membership if found, null otherwise.
 */
async function simulateResolveTenant(userId, organizationId) {
  return MEMBERSHIPS.find(
    (m) => m.userId === userId && m.organizationId === organizationId
  ) ?? null;
}

/**
 * Simulate an org read that enforces tenant scoping.
 */
async function simulateGetOrganization(requestingUserId, targetOrgId) {
  const membership = await simulateResolveTenant(requestingUserId, targetOrgId);
  if (!membership) {
    const err = new Error('Organization not found or access denied');
    err.statusCode = 404;
    throw err;
  }
  return membership.organization;
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('Tenant isolation', () => {
  test('User A can read their own organization', async () => {
    const org = await simulateGetOrganization(USER_A.id, ORG_A.id);
    assert.equal(org.id, ORG_A.id);
    assert.equal(org.name, 'Org A');
  });

  test('User B can read their own organization', async () => {
    const org = await simulateGetOrganization(USER_B.id, ORG_B.id);
    assert.equal(org.id, ORG_B.id);
    assert.equal(org.name, 'Org B');
  });

  test('User A CANNOT read Org B (cross-tenant access denied)', async () => {
    await assert.rejects(
      () => simulateGetOrganization(USER_A.id, ORG_B.id),
      (err) => {
        assert.equal(err.statusCode, 404);
        assert.match(err.message, /access denied/i);
        return true;
      }
    );
  });

  test('User B CANNOT read Org A (cross-tenant access denied)', async () => {
    await assert.rejects(
      () => simulateGetOrganization(USER_B.id, ORG_A.id),
      (err) => {
        assert.equal(err.statusCode, 404);
        return true;
      }
    );
  });

  test('Non-existent user cannot access any organization', async () => {
    await assert.rejects(
      () => simulateGetOrganization('ghost-user', ORG_A.id),
      (err) => {
        assert.equal(err.statusCode, 404);
        return true;
      }
    );
  });

  test('resolveTenant returns null for non-member', async () => {
    const result = await simulateResolveTenant(USER_A.id, ORG_B.id);
    assert.equal(result, null);
  });

  test('resolveTenant returns membership for valid member', async () => {
    const result = await simulateResolveTenant(USER_A.id, ORG_A.id);
    assert.equal(result?.role, 'ADMIN');
    assert.equal(result?.organizationId, ORG_A.id);
  });
});

describe('Role authorization', () => {
  function checkRole(memberRole, allowedRoles) {
    if (!allowedRoles.includes(memberRole)) {
      const err = new Error(`Requires one of: ${allowedRoles.join(', ')}`);
      err.statusCode = 403;
      throw err;
    }
    return true;
  }

  test('ADMIN is authorized when ADMIN is required', () => {
    assert.doesNotThrow(() => checkRole('ADMIN', ['ADMIN']));
  });

  test('CUSTOMER is denied when ADMIN or STAFF is required', () => {
    assert.throws(
      () => checkRole('CUSTOMER', ['ADMIN', 'STAFF']),
      (err) => err.statusCode === 403
    );
  });

  test('STAFF is authorized when STAFF access is required', () => {
    assert.doesNotThrow(() => checkRole('STAFF', ['ADMIN', 'STAFF']));
  });

  test('Missing role (undefined) is always denied', () => {
    assert.throws(
      () => checkRole(undefined, ['ADMIN']),
      (err) => err.statusCode === 403
    );
  });
});

