import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/layout/Card.jsx';
import { KpiCard } from '../../components/common/KpiCard.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { useAuth } from '../../hooks/useAuth.js';
import { useOrganization } from '../../hooks/useOrganization.js';
import { useRole } from '../../hooks/useRole.js';
import { getDashboardData } from '../../services/dashboard.service.js';
import { getPortalData } from '../../services/portal.service.js';
import { formatIndianCurrency } from '../../utils/format.js';

const badge = (status) => ({ ACTIVE: 'completed', IN_PROGRESS: 'completed', PAUSED: 'queued', CLOSED: 'failed', PAID: 'completed', PARTIAL: 'warning' }[status] || 'neutral');

function LoadingDashboard() {
  return <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((key) => <div key={key} className="rounded-xl border border-border bg-surface p-5"><Skeleton height="16px" width="55%" /><Skeleton className="mt-3" height="36px" width="70%" /></div>)}</div>;
}

function OperationsDashboard({ data }) {
  const metrics = data.metrics;
  return <>
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Collected revenue" value={formatIndianCurrency(metrics.totalRevenue)} detail="Succeeded payments" icon="lucide:indian-rupee" />
      <KpiCard label="Monthly recurring revenue" value={formatIndianCurrency(metrics.mrr)} detail="Active subscriptions, normalized" icon="lucide:repeat-2" tone="teal" />
      <KpiCard label="Annual recurring revenue" value={formatIndianCurrency(metrics.arr)} detail="MRR × 12" icon="lucide:trending-up" tone="success" />
      <KpiCard label="Overdue invoices" value={metrics.overdueInvoices} detail="Requires collection follow-up" icon="lucide:circle-alert" tone="warning" />
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card title="Recent subscriptions" subtitle="Persisted records in this organization">
        {data.recentSubscriptions.length === 0 ? <p className="text-sm text-muted-foreground">No subscriptions yet.</p> : <div className="space-y-3">{data.recentSubscriptions.map((item) => <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"><div><p className="text-sm font-medium">{item.customerName}</p><p className="font-mono text-xs text-muted-foreground">{item.number} · {item.plan.name}</p></div><Badge variant={badge(item.status)}>{item.status}</Badge></div>)}</div>}
      </Card>
      <Card title="Recent payments" subtitle="Succeeded payment records">
        {data.recentPayments.length === 0 ? <p className="text-sm text-muted-foreground">No payments recorded yet.</p> : <div className="space-y-3">{data.recentPayments.map((item) => <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"><div><p className="text-sm font-medium">{item.invoice?.customerName || 'Customer'}</p><p className="font-mono text-xs text-muted-foreground">{item.invoice?.number} · {item.method}</p></div><span className="font-mono text-sm tabular-nums">{formatIndianCurrency(item.amount)}</span></div>)}</div>}
      </Card>
    </div>
  </>;
}

function CustomerDashboard({ data }) {
  const current = data.subscriptions.find((item) => ['ACTIVE', 'IN_PROGRESS'].includes(item.status));
  return <>
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <KpiCard label="Current plan" value={current?.plan?.name || 'No active plan'} icon="lucide:layers" />
      <KpiCard label="Next renewal" value={data.metrics.nextRenewal ? new Date(data.metrics.nextRenewal).toLocaleDateString() : '—'} tone="teal" icon="lucide:calendar-clock" />
      <KpiCard label="Balance due" value={formatIndianCurrency(data.metrics.balanceDue)} tone="warning" icon="lucide:wallet-cards" />
      <KpiCard label="Invoices" value={data.metrics.invoiceCount} icon="lucide:receipt" />
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card title="My subscriptions" subtitle="Only subscriptions associated with your customer profile">
        {data.subscriptions.length === 0 ? <p className="text-sm text-muted-foreground">No subscriptions are assigned to your profile.</p> : <div className="space-y-3">{data.subscriptions.slice(0, 5).map((item) => <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"><div><p className="text-sm font-medium">{item.plan.name}</p><p className="font-mono text-xs text-muted-foreground">{item.number}</p></div><Badge variant={badge(item.status)}>{item.status}</Badge></div>)}</div>}
      </Card>
      <Card title="My invoices" subtitle="Invoice records scoped to your profile">
        {data.invoices.length === 0 ? <p className="text-sm text-muted-foreground">No invoices yet.</p> : <div className="space-y-3">{data.invoices.slice(0, 5).map((item) => <div key={item.id} className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"><div><p className="font-mono text-xs text-muted-foreground">{item.number}</p><p className="text-sm">{new Date(item.issueDate).toLocaleDateString()}</p></div><span className="font-mono text-sm">{formatIndianCurrency(item.amountDue)}</span></div>)}</div>}
      </Card>
    </div>
  </>;
}

export function DashboardPage() {
  const { user } = useAuth();
  const { activeOrg } = useOrganization();
  const role = useRole();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!activeOrg?.id) { setData(null); setLoading(false); return; }
    setLoading(true);
    try {
      const response = role === 'CUSTOMER' ? await getPortalData(activeOrg.id) : await getDashboardData(activeOrg.id);
      setData(response); setError(null);
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'Could not load live dashboard data.');
    } finally { setLoading(false); }
  }, [activeOrg?.id, role]);
  useEffect(() => { load(); }, [load]);
  return <div>
    <PageHeader eyebrow={role.toLowerCase() + ' workspace'} title={'Welcome, ' + (user?.name?.split(' ')[0] || 'there')} subtitle="Live operational figures from the active organization." />
    {!activeOrg && <EmptyState icon="lucide:building-2" title="Choose an organization" description="Dashboard figures become available after selecting an organization." />}
    {activeOrg && loading && <LoadingDashboard />}
    {activeOrg && !loading && error && <ErrorState message={error} onRetry={load} />}
    {activeOrg && !loading && !error && data && (role === 'CUSTOMER' ? <CustomerDashboard data={data} /> : <OperationsDashboard data={data} />)}
  </div>;
}
