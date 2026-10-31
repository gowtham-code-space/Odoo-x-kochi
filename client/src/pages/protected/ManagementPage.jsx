import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { PageHeader } from '../../components/layout/PageHeader.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { DataTable } from '../../components/common/DataTable.jsx';
import { DemoNotice } from '../../components/common/DemoNotice.jsx';
import { Input } from '../../components/forms/Input.jsx';
import { Select } from '../../components/forms/Select.jsx';
import { Textarea } from '../../components/forms/Textarea.jsx';
import { Modal } from '../../components/feedback/Modal.jsx';
import { useToast } from '../../hooks/useToast.js';

const badgeVariant = (value) => ({ Active: 'completed', Paid: 'completed', Received: 'completed', Confirmed: 'running', Sent: 'queued', Draft: 'neutral', Paused: 'queued', Pending: 'queued', Partial: 'warning', Overdue: 'failed', Closed: 'failed', Expired: 'failed', Attention: 'warning' }[value] || 'neutral');

function buildBlank(fields) { return Object.fromEntries(fields.map((field) => [field.key, field.defaultValue || ''])); }

export function ManagementPage({ eyebrow, title, subtitle, rows: initialRows, columns, fields = [], actionLabel = 'Create record', createTitle, createDescription, statusKey = 'status', rowActions = [], children }) {
  const [rows, setRows] = useState(initialRows);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(() => buildBlank(fields));
  const { addToast } = useToast();
  const displayColumns = useMemo(() => columns.map((column) => column.kind === 'status' ? { ...column, render: (row) => <Badge variant={badgeVariant(row[column.key])}>{row[column.key]}</Badge> } : column), [columns]);
  const submit = () => {
    const missing = fields.find((field) => field.required && !String(form[field.key] || '').trim());
    if (missing) { addToast({ type: 'error', title: 'Complete required fields', message: `${missing.label} is required.` }); return; }
    const firstText = fields.find((field) => field.primary) || fields[0];
    const next = { id: `LOCAL-${Date.now()}`, ...form, [statusKey]: form[statusKey] || 'Draft' };
    setRows((current) => [next, ...current]);
    setForm(buildBlank(fields)); setModalOpen(false);
    addToast({ type: 'info', title: 'Local preview updated', message: `${firstText ? form[firstText.key] : 'This record'} is shown only in this browser; the server API is not connected yet.` });
  };
  const runAction = (action, row) => {
    if (action.kind === 'status') setRows((current) => current.map((record) => record.id === row.id ? { ...record, [statusKey]: action.nextStatus } : record));
    addToast({ type: 'info', title: action.label, message: action.kind === 'status' ? `Status changed locally to ${action.nextStatus}; it has not been saved to the server.` : `${action.label} is a development-preview action; no backend operation was performed.` });
  };
  return <div>
    <PageHeader eyebrow={eyebrow} title={title} subtitle={subtitle} actions={<Button onClick={() => setModalOpen(true)}><Icon icon="lucide:plus" className="h-4 w-4" />{actionLabel}</Button>} />
    <DemoNotice />
    {children}
    <DataTable columns={displayColumns} rows={rows} searchPlaceholder={`Search ${title.toLowerCase()}`} renderActions={(row) => <div className="flex justify-end gap-2">{rowActions.map((action) => <Button key={action.label} size="sm" variant={action.variant || 'ghost'} onClick={() => runAction(action, row)}>{action.icon && <Icon icon={action.icon} className="h-3.5 w-3.5" />}{action.label}</Button>)}</div>} />
    <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={createTitle || actionLabel} description={createDescription || 'This form validates inputs and updates the clearly marked local development preview.'} confirmLabel={actionLabel} onConfirm={submit} maxWidth="max-w-2xl">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{fields.map((field) => <div key={field.key} className={field.wide ? 'sm:col-span-2' : ''}>{field.type === 'select' ? <Select label={field.label} required={field.required} value={form[field.key]} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} options={field.options} /> : field.type === 'textarea' ? <Textarea label={field.label} required={field.required} value={form[field.key]} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} /> : <Input label={field.label} required={field.required} type={field.type || 'text'} min={field.min} step={field.step} value={form[field.key]} onChange={(event) => setForm((current) => ({ ...current, [field.key]: event.target.value }))} />}</div>)}</div>
    </Modal>
  </div>;
}
