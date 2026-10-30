import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/layout/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { getQueryHistory } from '../../services/analytics.service.js';
import { ROUTES } from '../../constants/routes.js';
import { formatIST, formatRelativeTime } from '../../utils/date.js';
import { Icon } from '@iconify/react';

export function AnalyticsPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getQueryHistory(1, 10)
      .then((res) => {
        setHistory(res.logs || []);
      })
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        eyebrow="Intelligence Plane"
        title="Analytics & Telemetry"
        subtitle="Tenant-scoped analytical query execution and historical audit telemetry."
        breadcrumbs={[
          { label: 'Dashboard', to: ROUTES.DASHBOARD },
          { label: 'Analytics' },
        ]}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => navigate(ROUTES.ANALYTICS_NL)}
          >
            <Icon icon="lucide:sparkles" className="w-4 h-4" />
            <span>Launch Natural Language Query</span>
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-md bg-primary/10 border border-primary/20 text-primary flex items-center justify-center mb-3">
              <Icon icon="lucide:sparkles" className="w-5 h-5" />
            </div>
            <h3 className="font-headings text-lg font-bold text-foreground">
              Natural Language USP
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Translate ambiguous inquiries into validated, tenant-scoped structured proposals without raw SQL vulnerabilities.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="mt-4"
            onClick={() => navigate(ROUTES.ANALYTICS_NL)}
          >
            Query Interface
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-md bg-royal/10 border border-royal/20 text-royal flex items-center justify-center mb-3">
              <Icon icon="lucide:shield-check" className="w-5 h-5" />
            </div>
            <h3 className="font-headings text-lg font-bold text-foreground">
              Zero-Trust Allowlist
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Restricted schema provider limits visible models to approved entities only. LLM cannot access unauthorized tables.
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground mt-4 block">
            Enforced at controller & repository boundary
          </span>
        </div>

        <div className="rounded-xl border border-border bg-surface p-6 flex flex-col justify-between">
          <div>
            <div className="w-10 h-10 rounded-md bg-gold/10 border border-gold/20 text-gold flex items-center justify-center mb-3">
              <Icon icon="lucide:database" className="w-5 h-5" />
            </div>
            <h3 className="font-headings text-lg font-bold text-foreground">
              Tenant Partitioning
            </h3>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Every query context automatically binds <code className="font-mono text-foreground">organizationId</code> criteria to eliminate cross-tenant data leakage.
            </p>
          </div>
          <span className="text-[11px] font-mono text-muted-foreground mt-4 block">
            PostgreSQL Shared-Schema Multi-Tenancy
          </span>
        </div>
      </div>

      <Card
        title="Recent Analytical Inquiries"
        subtitle="Audit trace of natural language evaluations performed under your identity"
      >
        {loading ? (
          <div className="space-y-3">
            <Skeleton height="45px" />
            <Skeleton height="45px" />
          </div>
        ) : history.length === 0 ? (
          <EmptyState
            icon="lucide:history"
            title="No query history recorded"
            description="Evaluate natural language queries to view chronological evaluation logs."
            actionLabel="Try Example Query"
            onAction={() => navigate(ROUTES.ANALYTICS_NL)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-surface-raised font-mono text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                  <th className="px-4 py-2.5">Inquiry Question</th>
                  <th className="px-4 py-2.5">Scope</th>
                  <th className="px-4 py-2.5 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {history.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-surface-raised transition-colors text-xs"
                  >
                    <td className="px-4 py-3 font-mono font-medium text-foreground">
                      {log.metadata?.question || 'Analytics inquiry'}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {log.organization?.name || 'Active Tenant'}
                    </td>
                    <td
                      className="px-4 py-3 text-right font-mono text-muted-foreground tabular-nums"
                      title={formatIST(log.createdAt)}
                    >
                      {formatRelativeTime(log.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}

