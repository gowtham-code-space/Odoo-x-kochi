import React, { useCallback, useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Card } from '../../components/layout/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { EmptyState } from '../../components/common/EmptyState.jsx';
import { ErrorState } from '../../components/common/ErrorState.jsx';
import { Skeleton } from '../../components/common/Skeleton.jsx';
import { Input } from '../../components/forms/Input.jsx';
import { Select } from '../../components/forms/Select.jsx';
import { Textarea } from '../../components/forms/Textarea.jsx';
import { Modal } from '../../components/feedback/Modal.jsx';
import { useOrganization } from '../../hooks/useOrganization.js';
import { useToast } from '../../hooks/useToast.js';
import { formatIndianCurrency } from '../../utils/format.js';
import { getProducts } from '../../services/product.service.js';
import { getPortalData, requestSubscriptionCancellation } from '../../services/portal.service.js';
import { getDashboardData } from '../../services/dashboard.service.js';
import {
  acceptQuotation, activateSubscription, archivePlan, closeSubscription, confirmInvoice,
  createCustomer, createDiscount, createInvoice, createPlan, createQuotation, createSubscription,
  getCustomers, getDiscounts, getInvoices, getPayments, getPlans, getQuotations, getSubscriptions,
  pauseSubscription, recordPayment, resumeSubscription, sendQuotation,
} from '../../services/business.service.js';

const formDateIso = (value) => value ? new Date(value + 'T00:00:00.000Z').toISOString() : undefined;
const statusVariant = (status) => ({ ACTIVE: 'completed', IN_PROGRESS: 'completed', PAID: 'completed', SENT: 'queued', CONFIRMED: 'running', DRAFT: 'neutral', PAUSED: 'queued', PARTIAL: 'warning', OVERDUE: 'failed', CLOSED: 'failed', CANCELLED: 'failed', ARCHIVED: 'neutral', ACCEPTED: 'completed', SUCCEEDED: 'completed' }[status] || 'neutral');
const statusColumn = { key: 'status', label: 'Status', render: (row) => <Badge variant={statusVariant(row.status)}>{row.status}</Badge> };
const amount = (key, label = 'Amount') => ({ key, label, align: 'right', sortValue: (row) => Number(row[key] || 0), render: (row) => formatIndianCurrency(row[key]) });

function initialForm(fields) {
  return Object.fromEntries(fields.map((field) => [field.key, field.defaultValue || '']));
}

function LivePage({ config }) {
  const { activeOrg } = useOrganization();
  const { addToast } = useToast();
  const [rows, setRows] = useState([]);
  const [context, setContext] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(() => initialForm(config.fields));

  const load = useCallback(async () => {
    if (!activeOrg?.id) { setRows([]); setLoading(false); return; }
    setLoading(true);
    try {
      const [response, dependencies] = await Promise.all([
        config.load(activeOrg.id),
        config.loadContext ? config.loadContext(activeOrg.id) : Promise.resolve({}),
      ]);
      setRows(response[config.collection] || []);
      setContext(dependencies || {});
      setError(null);
    } catch (requestError) {
      setError(requestError.response?.data?.error?.message || 'Could not load saved records.');
    } finally { setLoading(false); }
  }, [activeOrg?.id, config]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    const missing = config.fields.find((field) => field.required && !String(form[field.key] || '').trim());
    if (missing) { addToast({ type: 'error', title: 'Complete required fields', message: missing.label + ' is required.' }); return; }
    setSaving(true);
    try {
      await config.create(activeOrg.id, config.toPayload(form, context));
      setForm(initialForm(config.fields)); setOpen(false);
      addToast({ type: 'success', title: config.createdLabel || 'Record created', message: 'The record was saved to the active organization.' });
      await load();
    } catch (requestError) {
      addToast({ type: 'error', title: 'Could not save record', message: requestError.response?.data?.error?.message || 'Review the information and try again.' });
    } finally { setSaving(false); }
  };

  const runAction = async (action, row) => {
    setSaving(true);
    try {
      await action.run(activeOrg.id, row);
      addToast({ type: 'success', title: action.label, message: 'The status change was saved.' });
      await load();
    } catch (requestError) {
      addToast({ type: 'error', title: action.label + ' failed', message: requestError.response?.data?.error?.message || 'The operation was not saved.' });
    } finally { setSaving(false); }
  };

  return <div>
    <PageHeader eyebrow={config.eyebrow} title={config.title} subtitle={config.subtitle} actions={<Button onClick={() => setOpen(true)} disabled={!activeOrg}><Icon icon="lucide:plus" className="h-4 w-4" />{config.actionLabel}</Button>} />
    {!activeOrg && <EmptyState icon="lucide:building-2" title="Choose an organization first" description="Business records are always stored inside an organization." />}
    {activeOrg && loading && <div className="space-y-3"><Skeleton height="50px" /><Skeleton height="180px" /></div>}
    {activeOrg && !loading && error && <ErrorState message={error} onRetry={load} />}
    {activeOrg && !loading && !error && <DataTable columns={config.columns} rows={rows} searchPlaceholder={'Search ' + config.title.toLowerCase()} emptyTitle={'No ' + config.title.toLowerCase() + ' yet'} emptyDescription={config.emptyDescription} renderActions={config.actions ? (row) => <div className="flex justify-end gap-1">{config.actions(row).map((action) => <Button key={action.label} size="sm" variant={action.variant || 'ghost'} disabled={saving} onClick={() => runAction(action, row)}>{action.label}</Button>)}</div> : undefined} />}
    <Modal isOpen={open} onClose={() => setOpen(false)} title={config.actionLabel} description="Saved to the active organization after server validation." confirmLabel={config.actionLabel} onConfirm={submit} isConfirmLoading={saving} maxWidth="max-w-2xl">
      <div className="grid gap-4 sm:grid-cols-2">{config.fields.map((field) => <div key={field.key} className={field.wide ? 'sm:col-span-2' : ''}>
        {field.type === 'select'
          ? <Select label={field.label} required={field.required} value={form[field.key]} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} options={typeof field.options === 'function' ? field.options(context) : field.options} />
          : field.type === 'textarea'
            ? <Textarea label={field.label} required={field.required} value={form[field.key]} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} />
            : <Input label={field.label} required={field.required} type={field.type || 'text'} min={field.min} step={field.step} value={form[field.key]} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} />}
      </div>)}</div>
    </Modal>
  </div>;
}

const productOptions = (context) => [{ value: '', label: 'Choose product' }, ...(context.products || []).map((item) => ({ value: item.id, label: item.name }))];
const customerOptions = (context) => [{ value: '', label: 'Choose customer' }, ...(context.customers || []).map((item) => ({ value: item.id, label: item.name + ' · ' + item.email }))];
const planOptions = (context) => [{ value: '', label: 'Choose plan' }, ...(context.plans || []).filter((item) => item.status === 'ACTIVE').map((item) => ({ value: item.id, label: item.name }))];
const invoiceOptions = (context) => [{ value: '', label: 'Choose confirmed invoice' }, ...(context.invoices || []).filter((item) => ['CONFIRMED', 'POSTED', 'PARTIAL', 'OVERDUE'].includes(item.status)).map((item) => ({ value: item.id, label: item.number + ' · ' + item.customerName }))];

export function PlansPage() {
  return <LivePage config={{
    eyebrow: 'Catalogue', title: 'Plans', subtitle: 'Create billable offers from real catalogue products.', actionLabel: 'Create plan', collection: 'plans', load: getPlans,
    loadContext: async (org) => ({ products: (await getProducts(org)).products }),
    fields: [{ key: 'productId', label: 'Product', type: 'select', required: true, options: productOptions }, { key: 'name', label: 'Plan name', required: true }, { key: 'billingFrequency', label: 'Billing interval', type: 'select', required: true, options: [{ value: '', label: 'Choose interval' }, ...['DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'SEMI_ANNUAL', 'ANNUAL'].map((value) => ({ value, label: value.replace('_', ' ') }))] }, { key: 'basePrice', label: 'Price (₹)', type: 'number', required: true, min: '0.01', step: '0.01' }, { key: 'trialDays', label: 'Trial days', type: 'number', min: '0', defaultValue: '0' }, { key: 'status', label: 'Status', type: 'select', options: [{ value: 'DRAFT', label: 'Draft' }, { value: 'ACTIVE', label: 'Active' }] }],
    toPayload: (form) => ({ ...form, basePrice: Number(form.basePrice), trialDays: Number(form.trialDays || 0) }),
    create: createPlan, createdLabel: 'Plan created',
    columns: [{ key: 'name', label: 'Plan', render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.product?.name}</p></div> }, { key: 'billingFrequency', label: 'Billing' }, amount('basePrice', 'Price'), { key: 'trialDays', label: 'Trial' }, statusColumn],
    actions: (row) => row.status === 'ARCHIVED' ? [] : [{ label: 'Archive', variant: 'ghost', run: (org) => archivePlan(org, row.id) }],
    emptyDescription: 'Create a product first, then add its plans.',
  }} />;
}

export function CustomersPage() {
  return <LivePage config={{
    eyebrow: 'Customers', title: 'Customers', subtitle: 'Customer contacts and billing details stored in this organization.', actionLabel: 'Add customer', collection: 'customers', load: getCustomers,
    fields: [{ key: 'name', label: 'Customer name', required: true }, { key: 'email', label: 'Billing email', type: 'email', required: true }, { key: 'phone', label: 'Phone' }, { key: 'companyName', label: 'Company' }, { key: 'city', label: 'City' }, { key: 'gstin', label: 'GSTIN' }],
    toPayload: (form) => form, create: createCustomer, createdLabel: 'Customer added',
    columns: [{ key: 'name', label: 'Customer', render: (row) => <div><p className="font-medium">{row.name}</p><p className="text-xs text-muted-foreground">{row.email}</p></div> }, { key: 'companyName', label: 'Company' }, { key: 'city', label: 'City' }, { key: 'subscriptionCount', label: 'Subscriptions', align: 'right', render: (row) => row._count?.subscriptions || 0 }, { key: 'active', label: 'Status', render: (row) => <Badge variant={row.isActive ? 'completed' : 'neutral'}>{row.isActive ? 'ACTIVE' : 'INACTIVE'}</Badge> }],
    emptyDescription: 'Add a customer before preparing a quotation or subscription.',
  }} />;
}

export function DiscountsPage() {
  return <LivePage config={{
    eyebrow: 'Catalogue', title: 'Discounts', subtitle: 'Admin-managed fixed and percentage discounts with eligibility limits.', actionLabel: 'Create discount', collection: 'discounts', load: getDiscounts,
    loadContext: async (org) => ({ products: (await getProducts(org)).products }),
    fields: [{ key: 'name', label: 'Discount name', required: true }, { key: 'code', label: 'Coupon code', required: true }, { key: 'type', label: 'Type', type: 'select', required: true, options: [{ value: '', label: 'Choose type' }, { value: 'PERCENTAGE', label: 'Percentage' }, { value: 'FIXED_AMOUNT', label: 'Fixed amount' }] }, { key: 'value', label: 'Value', type: 'number', required: true, min: '0.01', step: '0.01' }, { key: 'maxUses', label: 'Maximum uses', type: 'number', min: '1' }, { key: 'productId', label: 'Applicable product', type: 'select', options: productOptions }],
    toPayload: (form) => ({ ...form, value: Number(form.value), maxUses: form.maxUses ? Number(form.maxUses) : null, productId: form.productId || null }),
    create: createDiscount, createdLabel: 'Discount created',
    columns: [{ key: 'code', label: 'Code', render: (row) => <span className="font-mono text-xs">{row.code}</span> }, { key: 'name', label: 'Rule' }, { key: 'type', label: 'Type' }, { key: 'value', label: 'Value' }, { key: 'usage', label: 'Usage', render: (row) => String(row.usedCount) + ' / ' + (row.maxUses ?? '∞') }, statusColumn],
    emptyDescription: 'Create an eligibility rule to apply it during invoicing.',
  }} />;
}

export function QuotationsPage() {
  return <LivePage config={{
    eyebrow: 'Sales', title: 'Quotations', subtitle: 'Server-calculated quotation lines, GST, and lifecycle states.', actionLabel: 'Create quotation', collection: 'quotations', load: getQuotations,
    loadContext: async (org) => ({ customers: (await getCustomers(org)).customers }),
    fields: [{ key: 'customerId', label: 'Customer', type: 'select', required: true, options: customerOptions }, { key: 'description', label: 'Line description', required: true }, { key: 'quantity', label: 'Quantity', type: 'number', required: true, min: '1', defaultValue: '1' }, { key: 'unitPrice', label: 'Unit price (₹)', type: 'number', required: true, min: '0', step: '0.01' }, { key: 'taxRate', label: 'GST rate (%)', type: 'number', min: '0', step: '0.01', defaultValue: '18' }, { key: 'validUntil', label: 'Valid until', type: 'date' }, { key: 'notes', label: 'Notes', type: 'textarea', wide: true }],
    toPayload: (form) => ({ customerId: form.customerId, validUntil: formDateIso(form.validUntil), notes: form.notes || undefined, lines: [{ description: form.description, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice), taxRate: Number(form.taxRate || 0) }] }),
    create: createQuotation, createdLabel: 'Quotation created',
    columns: [{ key: 'number', label: 'Quotation', render: (row) => <span className="font-mono text-xs">{row.number}</span> }, { key: 'customerName', label: 'Customer', render: (row) => <div><p className="font-medium">{row.customerName}</p><p className="text-xs text-muted-foreground">{row.customerEmail}</p></div> }, amount('total', 'Total'), { key: 'validUntil', label: 'Valid until', render: (row) => row.validUntil ? new Date(row.validUntil).toLocaleDateString() : '—' }, statusColumn],
    actions: (row) => [row.status === 'DRAFT' && { label: 'Send', run: (org) => sendQuotation(org, row.id) }, ['DRAFT', 'SENT', 'CONFIRMED'].includes(row.status) && { label: 'Accept', run: (org) => acceptQuotation(org, row.id) }].filter(Boolean),
    emptyDescription: 'Choose a customer and add the first quotation line.',
  }} />;
}

export function SubscriptionsPage() {
  return <LivePage config={{
    eyebrow: 'Subscriptions', title: 'Subscriptions', subtitle: 'Create and operate subscriptions using saved plans and customers.', actionLabel: 'Create subscription', collection: 'subscriptions', load: getSubscriptions,
    loadContext: async (org) => {
      const [plans, customers] = await Promise.all([getPlans(org), getCustomers(org)]);
      return { plans: plans.plans, customers: customers.customers };
    },
    fields: [{ key: 'customerId', label: 'Customer', type: 'select', required: true, options: customerOptions }, { key: 'planId', label: 'Plan', type: 'select', required: true, options: planOptions }, { key: 'startDate', label: 'Start date', type: 'date', required: true }, { key: 'quantity', label: 'Quantity', type: 'number', required: true, min: '1', defaultValue: '1' }, { key: 'taxRate', label: 'GST rate (%)', type: 'number', min: '0', step: '0.01', defaultValue: '18' }, { key: 'notes', label: 'Notes', type: 'textarea', wide: true }],
    toPayload: (form) => ({ customerId: form.customerId, planId: form.planId, startDate: formDateIso(form.startDate), quantity: Number(form.quantity), taxRate: Number(form.taxRate || 0), notes: form.notes || undefined }),
    create: createSubscription, createdLabel: 'Subscription created',
    columns: [{ key: 'number', label: 'Subscription', render: (row) => <span className="font-mono text-xs">{row.number}</span> }, { key: 'customerName', label: 'Customer' }, { key: 'planName', label: 'Plan', render: (row) => row.plan?.name }, { key: 'nextBillingDate', label: 'Next billing', render: (row) => row.nextBillingDate ? new Date(row.nextBillingDate).toLocaleDateString() : '—' }, amount('unitPrice', 'Unit price'), statusColumn],
    actions: (row) => {
      if (row.status === 'DRAFT' || row.status === 'CONFIRMED') return [{ label: 'Activate', run: (org) => activateSubscription(org, row.id) }];
      if (row.status === 'ACTIVE' || row.status === 'IN_PROGRESS') return [{ label: 'Pause', run: (org) => pauseSubscription(org, row.id) }, { label: 'Close', variant: 'ghost', run: (org) => closeSubscription(org, row.id) }];
      if (row.status === 'PAUSED') return [{ label: 'Resume', run: (org) => resumeSubscription(org, row.id) }, { label: 'Close', variant: 'ghost', run: (org) => closeSubscription(org, row.id) }];
      return [];
    },
    emptyDescription: 'Create a plan and customer, then start the first subscription.',
  }} />;
}

export function InvoicesPage() {
  return <LivePage config={{
    eyebrow: 'Finance', title: 'Invoices', subtitle: 'GST-aware invoices calculated and persisted by the server.', actionLabel: 'Create invoice', collection: 'invoices', load: getInvoices,
    loadContext: async (org) => ({ customers: (await getCustomers(org)).customers }),
    fields: [{ key: 'customerId', label: 'Customer', type: 'select', required: true, options: customerOptions }, { key: 'description', label: 'Line description', required: true }, { key: 'quantity', label: 'Quantity', type: 'number', required: true, min: '1', defaultValue: '1' }, { key: 'unitPrice', label: 'Unit price (₹)', type: 'number', required: true, min: '0', step: '0.01' }, { key: 'taxRate', label: 'GST rate (%)', type: 'number', min: '0', step: '0.01', defaultValue: '18' }, { key: 'dueDate', label: 'Due date', type: 'date', required: true }, { key: 'notes', label: 'Notes', type: 'textarea', wide: true }],
    toPayload: (form) => ({ customerId: form.customerId, dueDate: formDateIso(form.dueDate), notes: form.notes || undefined, lines: [{ description: form.description, quantity: Number(form.quantity), unitPrice: Number(form.unitPrice), taxRate: Number(form.taxRate || 0) }] }),
    create: createInvoice, createdLabel: 'Invoice created',
    columns: [{ key: 'number', label: 'Invoice', render: (row) => <span className="font-mono text-xs">{row.number}</span> }, { key: 'customerName', label: 'Customer' }, { key: 'issueDate', label: 'Issued', render: (row) => new Date(row.issueDate).toLocaleDateString() }, { key: 'dueDate', label: 'Due', render: (row) => new Date(row.dueDate).toLocaleDateString() }, amount('total', 'Total'), amount('amountDue', 'Due'), statusColumn],
    actions: (row) => row.status === 'DRAFT' ? [{ label: 'Confirm', run: (org) => confirmInvoice(org, row.id) }] : [],
    emptyDescription: 'Select a customer and add an invoice line.',
  }} />;
}

export function PaymentsPage() {
  return <LivePage config={{
    eyebrow: 'Finance', title: 'Payments', subtitle: 'Record verified manual payment references; no gateway success is simulated.', actionLabel: 'Record payment', collection: 'payments', load: getPayments,
    loadContext: async (org) => ({ invoices: (await getInvoices(org)).invoices }),
    fields: [{ key: 'invoiceId', label: 'Invoice', type: 'select', required: true, options: invoiceOptions }, { key: 'amount', label: 'Amount (₹)', type: 'number', required: true, min: '0.01', step: '0.01' }, { key: 'method', label: 'Method', type: 'select', required: true, options: [{ value: '', label: 'Choose method' }, ...['UPI', 'BANK_TRANSFER', 'CASH', 'CARD', 'CHEQUE', 'NEFT', 'RTGS', 'IMPS'].map((value) => ({ value, label: value.replace('_', ' ') }))] }, { key: 'reference', label: 'Transaction reference', required: true }, { key: 'paidAt', label: 'Paid date', type: 'date' }, { key: 'notes', label: 'Notes', type: 'textarea', wide: true }],
    toPayload: (form) => ({ ...form, amount: Number(form.amount), paidAt: formDateIso(form.paidAt), notes: form.notes || undefined }),
    create: recordPayment, createdLabel: 'Payment recorded',
    columns: [{ key: 'number', label: 'Payment', render: (row) => <span className="font-mono text-xs">{row.number}</span> }, { key: 'invoiceNumber', label: 'Invoice', render: (row) => row.invoice?.number }, { key: 'paidAt', label: 'Received', render: (row) => new Date(row.paidAt).toLocaleDateString() }, { key: 'method', label: 'Method' }, amount('amount'), statusColumn],
    emptyDescription: 'Confirm an invoice before recording a payment.',
  }} />;
}

export function CustomerPortalPage() {
  const { activeOrg } = useOrganization();
  const { addToast } = useToast();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reason, setReason] = useState('');
  const load = useCallback(async () => {
    if (!activeOrg?.id) { setLoading(false); return; }
    setLoading(true);
    try { setData(await getPortalData(activeOrg.id)); setError(null); } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Could not load your portal.'); } finally { setLoading(false); }
  }, [activeOrg?.id]);
  useEffect(() => { load(); }, [load]);
  const requestCancel = async (subscriptionId) => {
    if (reason.trim().length < 3) { addToast({ type: 'error', title: 'Cancellation reason required', message: 'Provide a short reason for the request.' }); return; }
    try { await requestSubscriptionCancellation(activeOrg.id, subscriptionId, reason.trim()); setReason(''); addToast({ type: 'success', title: 'Request submitted', message: 'An organization administrator will review it.' }); await load(); } catch (requestError) { addToast({ type: 'error', title: 'Request failed', message: requestError.response?.data?.error?.message || 'Try again.' }); }
  };
  return <div>
    <PageHeader eyebrow="Customer portal" title="My subscription" subtitle="Your customer-owned subscriptions, invoices, and payment records." />
    {!activeOrg && <EmptyState title="Choose an organization" description="Your customer portal is scoped to the selected organization." />}
    {activeOrg && loading && <div className="space-y-3"><Skeleton height="50px" /><Skeleton height="180px" /></div>}
    {activeOrg && !loading && error && <ErrorState message={error} onRetry={load} />}
    {activeOrg && !loading && !error && data && <div className="space-y-6">
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><Card title="Active subscriptions"><p className="font-headings text-3xl font-bold">{data.metrics.activeSubscriptions}</p></Card><Card title="Balance due"><p className="font-headings text-3xl font-bold">{formatIndianCurrency(data.metrics.balanceDue)}</p></Card><Card title="Invoices"><p className="font-headings text-3xl font-bold">{data.metrics.invoiceCount}</p></Card><Card title="Next renewal"><p className="text-sm font-medium">{data.metrics.nextRenewal ? new Date(data.metrics.nextRenewal).toLocaleDateString() : '—'}</p></Card></div>
      <Card title="Billing profile" subtitle="Customer contact data for this organization"><div className="grid gap-3 sm:grid-cols-2"><Input label="Name" value={data.customer.name} disabled /><Input label="Email" value={data.customer.email} disabled /><Input label="Phone" value={data.customer.phone || '—'} disabled /><Input label="GSTIN" value={data.customer.gstin || '—'} disabled /></div></Card>
      <Card title="My subscriptions" subtitle="Cancellation is submitted as a request; it does not close a subscription automatically."><div className="space-y-4">{data.subscriptions.length === 0 ? <p className="text-sm text-muted-foreground">No subscriptions are assigned to this profile.</p> : data.subscriptions.map((item) => <div key={item.id} className="rounded-md border border-border p-4"><div className="flex items-start justify-between gap-4"><div><p className="font-medium">{item.plan.name}</p><p className="font-mono text-xs text-muted-foreground">{item.number}</p></div><Badge variant={statusVariant(item.status)}>{item.status}</Badge></div>{['ACTIVE', 'IN_PROGRESS', 'PAUSED'].includes(item.status) && <div className="mt-3 flex flex-col gap-2 sm:flex-row"><Input aria-label="Cancellation reason" placeholder="Reason for cancellation" value={reason} onChange={(event) => setReason(event.target.value)} /><Button variant="secondary" onClick={() => requestCancel(item.id)}>Request cancellation</Button></div>}</div>)}</div></Card>
      <DataTable columns={[{ key: 'number', label: 'Invoice' }, { key: 'issueDate', label: 'Issued', render: (row) => new Date(row.issueDate).toLocaleDateString() }, amount('total', 'Total'), amount('amountDue', 'Due'), statusColumn]} rows={data.invoices} emptyTitle="No invoices yet" emptyDescription="Invoices will appear here when issued." />
    </div>}
  </div>;
}

export function ReportsPage() {
  const { activeOrg } = useOrganization();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    if (!activeOrg?.id) { setLoading(false); return; }
    setLoading(true);
    try { setData(await getDashboardData(activeOrg.id)); setError(null); } catch (requestError) { setError(requestError.response?.data?.error?.message || 'Could not load report data.'); } finally { setLoading(false); }
  }, [activeOrg?.id]);
  useEffect(() => { load(); }, [load]);
  return <div><PageHeader eyebrow="Reports" title="Revenue and subscriptions" subtitle="Live metrics calculated from persisted records." />{!activeOrg && <EmptyState title="Choose an organization" description="Reports are scoped to one organization." />}{activeOrg && loading && <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{[1, 2, 3, 4].map((key) => <Skeleton key={key} height="120px" />)}</div>}{activeOrg && !loading && error && <ErrorState message={error} onRetry={load} />}{activeOrg && !loading && !error && data && <><div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4"><Card title="MRR"><p className="font-headings text-3xl font-bold">{formatIndianCurrency(data.metrics.mrr)}</p></Card><Card title="ARR"><p className="font-headings text-3xl font-bold">{formatIndianCurrency(data.metrics.arr)}</p></Card><Card title="Active subscriptions"><p className="font-headings text-3xl font-bold">{data.metrics.activeSubscriptions}</p></Card><Card title="Cancelled subscriptions"><p className="font-headings text-3xl font-bold">{data.metrics.cancelledSubscriptions}</p></Card></div><Card title="Metric methodology" subtitle="Definitions used by these live figures" className="mt-6"><ul className="space-y-2 text-sm text-muted-foreground"><li>{data.methodology.revenue}</li><li>{data.methodology.mrr}</li><li>{data.methodology.arr}</li></ul></Card></>}</div>;
}
