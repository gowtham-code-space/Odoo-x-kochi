import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/layout/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { CopyButton } from '../../components/common/CopyButton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { runQuery, getAIStatus } from '../../services/analytics.service.js';
import { ROUTES } from '../../constants/routes.js';
import { Icon } from '@iconify/react';

export function NLAnalyticsPage() {
  const [question, setQuestion] = useState('');
  const [aiStatus, setAiStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'proposal' | 'raw'

  useEffect(() => {
    getAIStatus()
      .then(setAiStatus)
      .catch(() => setAiStatus({ enabled: false }));
  }, []);

  const examplePrompts = [
    'Show all organizations and their active member count',
    'List audit logs categorized by resource action',
    'Find tenant memberships with OWNER role assigned',
    'Compare membership activity between this month and last month',
  ];

  const handleQuery = async (queryText) => {
    const q = queryText || question;
    if (!q.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await runQuery(q.trim());
      setResult(data);
    } catch (err) {
      setError(
        err.response?.data?.error?.message ||
          'Failed to execute natural-language analytics proposal.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="AI-Powered Engine"
        title="Natural-Language Analytics"
        subtitle="Translate natural-language inquiries into validated, tenant-scoped structured proposals."
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Analytics', to: ROUTES.ANALYTICS },
          { label: 'Natural Language Engine' },
        ]}
        actions={
          <Badge variant={aiStatus?.enabled ? 'completed' : 'neutral'}>
            <Icon
              icon={aiStatus?.enabled ? 'lucide:cpu' : 'lucide:shield-alert'}
              className="w-3.5 h-3.5"
            />
            <span>
              {aiStatus?.enabled ? `LLM: ${aiStatus.model}` : 'Graceful Demo Mode'}
            </span>
          </Badge>
        }
      />

      {/* AI Mode Banner if disabled */}
      {!aiStatus?.enabled && (
        <div className="mb-6 rounded-md border border-warning/30 bg-warning/10 p-4 flex items-start gap-3">
          <Icon icon="lucide:info" className="w-5 h-5 text-warning shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed text-muted-foreground">
            <span className="font-medium text-foreground block mb-0.5">
              AI integration unavailable: LLM credentials not detected
            </span>
            The application operates reliably without required LLM API keys. Queries will
            return no analytical rows. To connect live Gemini /
            OpenAI models, configure <code className="font-mono text-foreground">LLM_API_KEY</code> in <code className="font-mono text-foreground">server/.env</code>.
          </div>
        </div>
      )}

      {error && <ErrorState message={error} className="mb-6" />}

      {/* Query Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 mb-8">
        <Card
          title="Query Prompt"
          subtitle="Ask questions in plain English or Indic technical syntax"
        >
          <div className="space-y-4">
            <div className="relative">
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about workspace members, audit patterns, or tenant metrics..."
                rows={4}
                className="w-full rounded-md border border-border bg-input p-3.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-2 focus:border-primary focus:outline-none transition-colors"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleQuery();
                  }
                }}
              />
              <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-muted-foreground">
                ⌘ + Enter to execute
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-muted-foreground">
                Protected by tenant-scoping & allowlist validation
              </span>
              <Button
                variant="primary"
                size="sm"
                isLoading={loading}
                disabled={!question.trim()}
                onClick={() => handleQuery()}
              >
                <Icon icon="lucide:sparkles" className="w-3.5 h-3.5" />
                <span>Evaluate Query</span>
              </Button>
            </div>
          </div>
        </Card>

        {/* Example prompts */}
        <Card
          title="Verified Prompts"
          subtitle="Click to evaluate canonical analytical queries"
        >
          <div className="space-y-2">
            {examplePrompts.map((prompt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuestion(prompt);
                  handleQuery(prompt);
                }}
                className="w-full text-left p-2.5 rounded-md border border-border bg-input hover:bg-surface-raised transition-colors text-xs text-foreground flex items-center justify-between group cursor-pointer"
              >
                <span className="truncate pr-2 font-mono">{prompt}</span>
                <Icon
                  icon="lucide:arrow-right"
                  className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary shrink-0 transition-colors"
                />
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Results / Proposal Section */}
      {result && (
        <Card
          title="Evaluation Context & Schema Proposal"
          subtitle={`Evaluated inquiry: "${result.question}"`}
          actions={
            <div className="flex items-center gap-1 border-b border-border">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'summary'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Summary & Table
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('proposal')}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'proposal'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                Structured Plan
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('raw')}
                className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors cursor-pointer ${
                  activeTab === 'raw'
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                JSON Payload
              </button>
            </div>
          }
        >
          {/* Security Notice: SQL Execution Is Disabled */}
          <div className="mb-5 p-3 rounded-md border border-royal/30 bg-royal/10 text-xs text-muted-foreground flex items-start gap-2.5">
            <Icon icon="lucide:shield" className="w-4 h-4 text-royal shrink-0 mt-0.5" />
            <div>
              <strong className="text-foreground">Zero-Trust SQL Execution Scaffold: </strong>
              Per architectural security rules, raw SQL execution from LLMs is restricted.
              The proposal has been parsed and schema-validated against permitted tables only.
            </div>
          </div>

          {activeTab === 'summary' && (
            <div className="space-y-6">
              {/* Natural language explanation */}
              <div className="p-4 rounded-md border border-border bg-input">
                <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1">
                  Model Explanation
                </span>
                <p className="text-sm text-foreground leading-relaxed">
                  {result.explanation ||
                    result.proposal?.explanation ||
                    'Analyzed inquiry against current tenant schemas.'}
                </p>
              </div>

              {/* Data Table */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Analytical result ({result.exampleResult?.rowCount ?? 0} records)
                  </span>
                  {result.demo && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-sm bg-muted text-muted-foreground border border-border">
                      AI unavailable
                    </span>
                  )}
                </div>

                {!result.exampleResult ? <p className="rounded-md border border-border bg-input p-4 text-sm text-muted-foreground">No analytical rows were returned. Natural-language execution requires a configured provider and a reviewed read-only query executor.</p> : <div className="overflow-x-auto rounded-md border border-border">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="bg-surface-raised font-mono text-xs uppercase tracking-widest text-muted-foreground border-b border-border">
                        {result.exampleResult.columns.map(
                          (col) => (
                            <th key={col} className="px-4 py-2.5 font-medium">
                              {col}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border bg-surface">
                      {result.exampleResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-surface-raised text-xs font-mono">
                          <td className="px-4 py-3 font-medium text-foreground">{row.name}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            <span className="px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground border border-border text-[10px]">
                              {row.role}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-foreground tabular-nums">
                            {row.memberCount}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>}
              </div>
            </div>
          )}

          {activeTab === 'proposal' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-4 rounded-md border border-border bg-background">
                <div className="flex items-center justify-between border-b border-border pb-2 mb-3">
                  <span className="text-muted-foreground font-semibold">
                    Structured Intermediate Query Plan (AST)
                  </span>
                  <CopyButton
                    text={JSON.stringify(result.proposal || result, null, 2)}
                  />
                </div>
                <div className="space-y-2 text-muted-foreground">
                  <div>
                    <span className="text-foreground">TARGET_TABLE:</span>{' '}
                    <span className="text-primary">{result.proposal?.table || 'organizations'}</span>
                  </div>
                  <div>
                    <span className="text-foreground">FILTERS:</span>{' '}
                    <span>
                      {JSON.stringify(
                        result.proposal?.filters || [{ field: 'organizationId', operator: 'eq', value: '$TENANT_ID' }]
                      )}
                    </span>
                  </div>
                  <div>
                    <span className="text-foreground">BOUNDED_ROW_LIMIT:</span>{' '}
                    <span className="text-foreground">{result.proposal?.limit || 50}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'raw' && (
            <div className="relative font-mono text-xs">
              <div className="absolute top-2 right-2">
                <CopyButton text={JSON.stringify(result, null, 2)} />
              </div>
              <pre className="p-4 rounded-md border border-border bg-background text-muted-foreground overflow-x-auto leading-relaxed max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}

