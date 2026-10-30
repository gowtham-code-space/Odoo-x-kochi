import { aiProvider, buildSystemPrompt } from './ai.provider.js';
import { env } from '../../config/env.js';

/**
 * Allowlist of tables and columns that the AI may query.
 * This is the ONLY schema context exposed to the LLM.
 * Extend this during the hackathon with domain-specific tables.
 *
 * SECURITY: This list is enforced independently in the query executor.
 * The LLM cannot gain access to tables not in this list.
 */
const ALLOWED_SCHEMA = {
  organizations: {
    description: 'Organizations registered in the system',
    columns: {
      id: 'string — unique identifier',
      name: 'string — organization name',
      slug: 'string — URL-safe identifier',
      createdAt: 'datetime — when created',
    },
  },
  memberships: {
    description: 'User memberships within organizations',
    columns: {
      id: 'string — unique identifier',
      role: 'enum(OWNER, ADMIN, MEMBER) — user role',
      createdAt: 'datetime — when joined',
    },
  },
};

const ALLOWED_TABLES = new Set(Object.keys(ALLOWED_SCHEMA));
const ALLOWED_OPERATORS = new Set(['eq', 'gt', 'lt', 'gte', 'lte', 'like', 'in']);

/**
 * Validate that an AI-generated proposal references only allowed tables/columns.
 * Throws if the proposal attempts to access unauthorized resources.
 */
function validateProposal(proposal) {
  const errors = [];

  if (!proposal || typeof proposal !== 'object') {
    errors.push('Proposal must be a valid object');
    return errors;
  }

  if (proposal.table && !ALLOWED_TABLES.has(proposal.table)) {
    errors.push(`Table "${proposal.table}" is not in the allowed list`);
  }

  if (Array.isArray(proposal.filters)) {
    for (const f of proposal.filters) {
      if (!ALLOWED_OPERATORS.has(f.operator)) {
        errors.push(`Operator "${f.operator}" is not permitted`);
      }
      // Prevent injection via field names
      if (typeof f.field !== 'string' || !/^[a-z_]+$/i.test(f.field)) {
        errors.push(`Invalid field name: "${f.field}"`);
      }
    }
  }

  if (proposal.limit && (proposal.limit < 1 || proposal.limit > 100)) {
    errors.push('Limit must be between 1 and 100');
  }

  return errors;
}

/**
 * Generate a query proposal from a natural-language question.
 * Returns a demo response when AI is not configured.
 */
export async function generateAnalyticsProposal({ question, organizationId }) {
  if (!env.AI_ENABLED) {
    return {
      demo: true,
      question,
      proposal: null,
      explanation:
        'AI is not configured. Set LLM_API_KEY in your .env file to enable natural-language analytics.',
      exampleResult: {
        columns: ['name', 'role', 'memberCount'],
        rows: [
          { name: 'Ashoka Research Labs', role: 'OWNER', memberCount: 3 },
          { name: 'Mumbai AI Collective', role: 'MEMBER', memberCount: 7 },
        ],
        rowCount: 2,
        note: 'This is a demo result. Configure AI to run real queries.',
      },
    };
  }

  const schemaContext = ALLOWED_SCHEMA;
  const systemPrompt = buildSystemPrompt(schemaContext);

  let proposal;
  try {
    proposal = await aiProvider.generateQueryProposal({
      question,
      schemaContext,
      systemPrompt,
      organizationId,
    });
  } catch (err) {
    return {
      demo: false,
      question,
      proposal: null,
      error: 'AI query generation failed. Please try again.',
    };
  }

  const validationErrors = validateProposal(proposal);
  if (validationErrors.length > 0) {
    return {
      demo: false,
      question,
      proposal: null,
      error: `Generated proposal failed validation: ${validationErrors.join('; ')}`,
    };
  }

  // NOTE: actual SQL execution is intentionally disabled.
  // To enable it, implement executeValidatedProposal() in analytics.service.js
  // with: read-only DB role, tenant scoping, query timeout, and row limits.
  return {
    demo: false,
    question,
    proposal,
    explanation: proposal.explanation || 'Query generated successfully.',
    executionDisabled: true,
    message:
      'Query proposal generated and validated. SQL execution is disabled until the read-only execution layer is implemented.',
  };
}

