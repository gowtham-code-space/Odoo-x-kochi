import { generateAnalyticsProposal } from '../ai/ai.service.js';
import { prisma } from '../../config/database.js';

/**
 * Analytics service.
 *
 * Orchestrates the natural-language analytics pipeline:
 *   1. Authenticate request (done in middleware)
 *   2. Resolve active organization (done in middleware or from user's orgs)
 *   3. Load permitted schema context
 *   4. Generate structured query proposal via AI service
 *   5. Validate the proposal (enforced in ai.service.js)
 *   6. Return proposal + results (execution disabled until safe executor built)
 *
 * SECURITY:
 * - Tenant scoping is enforced independently of the AI output
 * - The LLM never determines its own authorization
 * - Raw SQL execution is intentionally disabled
 */

export async function runNaturalLanguageQuery({ question, userId }) {
  // Get user's first org for context when no specific org is active
  const membership = await prisma.membership.findFirst({
    where: { userId },
    include: { organization: true },
    orderBy: { createdAt: 'asc' },
  });

  const organizationId = membership?.organizationId;

  const result = await generateAnalyticsProposal({ question, organizationId });

  // Log query to audit trail
  if (organizationId) {
    await prisma.auditLog.create({
      data: {
        userId,
        organizationId,
        action: 'ANALYTICS_QUERY',
        resource: 'analytics',
        metadata: { question: question.slice(0, 200) },
      },
    });
  }

  return result;
}

/**
 * Retrieve recent query history for the authenticated user.
 */
export async function getQueryHistory(userId, { page = 1, pageSize = 20 } = {}) {
  const skip = (page - 1) * pageSize;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { userId, action: 'ANALYTICS_QUERY' },
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      select: {
        id: true,
        metadata: true,
        createdAt: true,
        organization: { select: { name: true } },
      },
    }),
    prisma.auditLog.count({ where: { userId, action: 'ANALYTICS_QUERY' } }),
  ]);

  return { logs, total, page, pageSize };
}

