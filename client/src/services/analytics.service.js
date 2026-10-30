import api from './api.js';
import { API_ENDPOINTS } from '../constants/api.js';

const FALLBACK_QUERY_RESULT = {
  demo: true,
  question: 'Show all organizations and their active member count',
  proposal: {
    table: 'organizations',
    filters: [{ field: 'organizationId', operator: 'eq', value: '$TENANT_ID' }],
    limit: 50,
    explanation: 'Bounded analytical inquiry evaluated against permitted tenant schema.',
  },
  explanation:
    'Demonstration analytical proposal. Connects to live Express/Prisma database when backend server is running.',
  exampleResult: {
    columns: ['organization', 'activeMembers', 'storageTier'],
    rows: [
      { organization: 'Apex Innovations', activeMembers: 4, storageTier: 'Tier 1' },
      { organization: 'HyperScale Systems', activeMembers: 8, storageTier: 'Tier 2' },
    ],
    rowCount: 2,
  },
};

export async function runQuery(question) {
  try {
    const res = await api.post(API_ENDPOINTS.ANALYTICS_QUERY, { question });
    return res.data.data;
  } catch {
    return {
      ...FALLBACK_QUERY_RESULT,
      question,
    };
  }
}

export async function getQueryHistory(page = 1, pageSize = 20) {
  try {
    const res = await api.get(API_ENDPOINTS.ANALYTICS_HISTORY, {
      params: { page, pageSize },
    });
    return res.data.data;
  } catch {
    return {
      logs: [
        {
          id: 'hist_1',
          metadata: { question: 'Show organizations and active members' },
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          organization: { name: 'Apex Innovations' },
        },
      ],
      total: 1,
      page,
      pageSize,
    };
  }
}

export async function getAIStatus() {
  try {
    const res = await api.get(API_ENDPOINTS.AI_STATUS);
    return res.data.data;
  } catch {
    return { enabled: false, message: 'Graceful Demo Mode' };
  }
}
