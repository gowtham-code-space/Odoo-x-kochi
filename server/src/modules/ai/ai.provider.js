import { env } from '../../config/env.js';

/**
 * Abstract AI provider interface.
 *
 * Reads credentials from environment variables — no hardcoded keys.
 * Returns null (graceful degradation) when AI is not configured.
 *
 * To add a provider during the hackathon:
 *   1. Implement the provider class below
 *   2. Set LLM_API_KEY and LLM_MODEL in .env
 *   3. The rest of the system picks it up automatically
 */

class AIProvider {
  constructor() {
    this.enabled = env.AI_ENABLED;
    this.model = env.LLM_MODEL;
    this.apiKey = env.LLM_API_KEY;
    this.baseURL = env.LLM_BASE_URL;
  }

  isEnabled() {
    return this.enabled;
  }

  /**
   * Generate a structured query proposal from a natural-language question.
   *
   * IMPORTANT: This must return a STRUCTURED PROPOSAL — never raw SQL.
   * The caller is responsible for validating and executing through a
   * restricted interface.
   *
   * @param {object} options
   * @param {string} options.question - The natural-language question
   * @param {object} options.schemaContext - Approved schema description
   * @param {string} options.organizationId - Tenant ID for context
   * @returns {Promise<object>} Structured proposal { intent, filters, groupBy, orderBy, limit }
   */
  async generateQueryProposal({ question, schemaContext }) {
    if (!this.enabled) {
      return null;
    }

    // TODO(hackathon): implement actual LLM call here
    // Example using fetch for OpenAI-compatible APIs:
    //
    // const response = await fetch(`${this.baseURL || 'https://api.openai.com'}/v1/chat/completions`, {
    //   method: 'POST',
    //   headers: {
    //     'Authorization': `Bearer ${this.apiKey}`,
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({
    //     model: this.model,
    //     messages: [
    //       { role: 'system', content: buildSystemPrompt(schemaContext) },
    //       { role: 'user', content: question },
    //     ],
    //     response_format: { type: 'json_object' },
    //   }),
    // });
    //
    // const data = await response.json();
    // return JSON.parse(data.choices[0].message.content);

    throw new Error('AI provider not yet implemented — add your LLM call to ai.provider.js');
  }
}

export const aiProvider = new AIProvider();

/**
 * Build a system prompt that exposes ONLY the approved schema context.
 * Never expose credentials, internal table names, or unrestricted schema.
 */
export function buildSystemPrompt(schemaContext) {
  return `You are a data analyst assistant. Answer questions about the following data schema.
Return a JSON object with these fields:
{
  "intent": "description of what the user wants",
  "table": "the primary table to query (from the allowed list only)",
  "filters": [{ "field": "...", "operator": "eq|gt|lt|gte|lte|like|in", "value": "..." }],
  "groupBy": ["field1"],
  "orderBy": [{ "field": "...", "direction": "asc|desc" }],
  "limit": 50,
  "explanation": "plain-language description of the query"
}

Available schema:
${JSON.stringify(schemaContext, null, 2)}

RULES:
- Only reference tables and columns from the schema above.
- Never produce raw SQL, DROP, DELETE, UPDATE, INSERT, or DDL statements.
- Never access tables not in the schema.
- The organizationId filter is always applied by the system — do not reference it.
- Return only the JSON object, no prose.`;
}

