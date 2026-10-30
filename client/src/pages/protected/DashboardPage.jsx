import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/layout/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { getDashboardData } from '../../services/dashboard.service.js';
import { formatIST, formatRelativeTime } from '../../utils/date.js';
import { ROUTES } from '../../constants/routes.js';
import { Icon } from '@iconify/react';
import { useAuth } from '../../hooks/useAuth.js';

export function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(false);
    try {
      setLoading(true);
      const res = await getDashboardData();
      setData(res);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to load dashboard telemetry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const stats = data?.stats || {
    organizations: 0,
    totalMembers: 0,
    recentActivityCount: 0,
  };

  return (
    <div>
      <PageHeader
        eyebrow="Cluster Telemetry"
        title={`Welcome, ${user?.name?.split(' ')[0] || 'Engineer'}`}
        subtitle="Multi-tenant management plane and natural-language database query engine."
        actions={
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate(ROUTES.ANALYTICS_NL)}
            >
              <Icon icon="lucide:sparkles" className="w-4 h-4 text-primary" />
              <span>Launch NL Query</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(ROUTES.ORGANIZATIONS_NEW)}
            >
              <Icon icon="lucide:plus" className="w-4 h-4" />
              <span>New Tenant</span>
            </Button>
          </div>
        }
      />

      {error && <ErrorState message={error} onRetry={fetchData} className="mb-8" />}

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        {/* KPI 1 */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm text-muted-foreground font-medium">Authorized Workspaces</p>
          <div className="flex items-baseline justify-between mt-2">
            {loading ? (
              <Skeleton width="60px" height="36px" />
            ) : (
              <span className="font-headings text-3xl font-bold tabular-nums text-foreground">
                {stats.organizations}
              </span>
            )}
            <span className="bg-success/15 text-success rounded-full px-2 py-0.5 text-xs font-mono">
              Active
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Multi-tenant isolated PostgreSQL schemas
          </p>
        </div>

        {/* KPI 2 */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm text-muted-foreground font-medium">Aggregated Memberships</p>
          <div className="flex items-baseline justify-between mt-2">
            {loading ? (
              <Skeleton width="60px" height="36px" />
            ) : (
              <span className="font-headings text-3xl font-bold tabular-nums text-foreground">
                {stats.totalMembers}
              </span>
            )}
            <span className="bg-royal/15 text-royal rounded-full px-2 py-0.5 text-xs font-mono">
              RBAC Verified
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            OWNER, ADMIN, and MEMBER roles
          </p>
        </div>

        {/* KPI 3 */}
        <div className="rounded-xl border border-border bg-surface p-6">
          <p className="text-sm text-muted-foreground font-medium">Recorded Audit Events</p>
          <div className="flex items-baseline justify-between mt-2">
            {loading ? (
              <Skeleton width="60px" height="36px" />
            ) : (
              <span className="font-headings text-3xl font-bold tabular-nums text-foreground">
                {stats.recentActivityCount}
              </span>
            )}
            <span className="bg-primary/15 text-foreground rounded-full px-2 py-0.5 text-xs font-mono">
              Live IST
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Compliance trail for DPDP governance
          </p>
        </div>
      </div>

      {/* Main Split Layout: Quick Actions & Audit Trail */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-6">
        {/* Left Column: Quick Launch & Workspaces */}
        <div className="space-y-6">
          <Card
            title="Assigned Workspaces"
            subtitle="Tenant boundaries resolved with strict database isolation"
            actions={
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(ROUTES.ORGANIZATIONS)}
              >
                View all
              </Button>
            }
          >
            {loading ? (
              <div className="space-y-3">
                <Skeleton height="50px" />
                <Skeleton height="50px" />
              </div>
            ) : !data?.organizations || data.organizations.length === 0 ? (
              <EmptyState
                title="No organizations provisioned"
                description="Create your first organization to establish tenant boundary."
                actionLabel="Create Workspace"
                onAction={() => navigate(ROUTES.ORGANIZATIONS_NEW)}
              />
            ) : (
              <div className="space-y-2.5">
                {data.organizations.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => navigate(ROUTES.ORGANIZATIONS)}
                    className="flex items-center justify-between p-3.5 rounded-md border border-border bg-input hover:bg-surface-raised cursor-pointer transition-colors"
                  >
                    <div>
                      <p className="font-medium text-sm text-foreground">{org.name}</p>
                      <span className="text-xs font-mono text-muted-foreground">
                        slug: {org.slug}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-muted-foreground">
                        {org.memberCount} member{org.memberCount === 1 ? '' : 's'}
                      </span>
                      <span className="text-xs font-mono uppercase px-2 py-0.5 rounded-sm bg-muted text-muted-foreground border border-border">
                        {org.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Hackathon Readiness Card */}
          <Card
            title="Enterprise Foundation"
            subtitle="Architected for immediate hackathon domain expansion"
          >
            <div className="space-y-3 text-xs leading-relaxed text-muted-foreground">
              <div className="flex items-start gap-2.5">
                <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Shared-schema Multi-tenancy:</strong> Every query resolves tenant via verified membership in <code className="font-mono text-foreground">resolveTenant</code> middleware.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Zero-Trust LLM Interface:</strong> Natural language questions generate bounded intermediate query proposals without running arbitrary SQL.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <Icon icon="lucide:check-circle-2" className="w-4 h-4 text-success shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">HTTP-Only JWT Persistence:</strong> Session tokens are immune to XSS with Lax SameSite cookie flags.
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Audit Log & Activity */}
        <Card
          title="Audit Trail & Telemetry"
          subtitle="Real database audit records with IST timestamps"
          actions={
            <Button variant="ghost" size="sm" onClick={fetchData}>
              <Icon icon="lucide:refresh-cw" className="w-3.5 h-3.5" />
            </Button>
          }
        >
          {loading ? (
            <div className="space-y-3">
              <Skeleton height="40px" />
              <Skeleton height="40px" />
              <Skeleton height="40px" />
              <Skeleton height="40px" />
            </div>
          ) : !data?.recentActivity || data.recentActivity.length === 0 ? (
            <EmptyState
              title="No audit events recorded"
              description="Actions performed in organizations will produce verifiable audit entries."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-surface-raised font-mono text-[11px] uppercase tracking-widest text-muted-foreground border-b border-border">
                    <th className="px-3.5 py-2.5">Action</th>
                    <th className="px-3.5 py-2.5">Scope</th>
                    <th className="px-3.5 py-2.5 text-right">Timestamp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {data.recentActivity.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-surface-raised transition-colors text-xs"
                    >
                      <td className="px-3.5 py-3 font-mono font-medium text-foreground">
                        {log.action}
                      </td>
                      <td className="px-3.5 py-3 text-muted-foreground">
                        {log.organization?.name || 'Global'}
                      </td>
                      <td
                        className="px-3.5 py-3 text-right font-mono text-muted-foreground tabular-nums"
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
    </div>
  );
}

