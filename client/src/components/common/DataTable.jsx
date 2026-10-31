import React, { useMemo, useState } from 'react';
import { Icon } from '@iconify/react';
import { EmptyState } from './EmptyState.jsx';

export function DataTable({ columns, rows, searchPlaceholder = 'Search records', emptyTitle = 'No records found', emptyDescription = 'Change the filters or create a record to continue.', renderActions, pageSize = 6 }) {
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({ key: null, direction: 'asc' });
  const [page, setPage] = useState(1);
  const searchableText = (row) => Object.values(row).join(' ').toLowerCase();
  const filtered = useMemo(() => rows.filter((row) => searchableText(row).includes(query.toLowerCase())), [rows, query]);
  const sorted = useMemo(() => {
    if (!sort.key) return filtered;
    return [...filtered].sort((a, b) => {
      const valueA = columns.find((column) => column.key === sort.key)?.sortValue?.(a) ?? a[sort.key] ?? '';
      const valueB = columns.find((column) => column.key === sort.key)?.sortValue?.(b) ?? b[sort.key] ?? '';
      const result = String(valueA).localeCompare(String(valueB), undefined, { numeric: true });
      return sort.direction === 'asc' ? result : -result;
    });
  }, [columns, filtered, sort]);
  const pages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const activePage = Math.min(page, pages);
  const visibleRows = sorted.slice((activePage - 1) * pageSize, activePage * pageSize);
  const toggleSort = (key) => {
    setPage(1);
    setSort((current) => current.key === key ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' } : { key, direction: 'asc' });
  };

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Icon icon="lucide:search" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder={searchPlaceholder} className="w-full rounded-md border border-border bg-input py-2 pl-9 pr-3 text-sm text-foreground" aria-label={searchPlaceholder} />
        </div>
        <span className="font-mono text-xs text-muted-foreground tabular-nums">{filtered.length} records</span>
      </div>
      {visibleRows.length === 0 ? <EmptyState title={emptyTitle} description={emptyDescription} className="m-5" /> : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="bg-surface-raised font-mono text-xs uppercase tracking-widest text-muted-foreground">
              <tr>{columns.map((column) => <th key={column.key} className={`px-4 py-3 font-medium ${column.align === 'right' ? 'text-right' : ''}`}><button type="button" onClick={() => toggleSort(column.key)} className="inline-flex items-center gap-1 hover:text-foreground focus-visible:outline-primary">{column.label}{sort.key === column.key && <Icon icon={sort.direction === 'asc' ? 'lucide:arrow-up' : 'lucide:arrow-down'} className="h-3 w-3" />}</button></th>)}{renderActions && <th className="px-4 py-3 text-right">Actions</th>}</tr>
            </thead>
            <tbody>{visibleRows.map((row) => <tr key={row.id} className="border-t border-border bg-surface transition-colors hover:bg-surface-raised">{columns.map((column) => <td key={column.key} className={`px-4 py-3 ${column.align === 'right' ? 'text-right font-mono tabular-nums' : ''}`}>{column.render ? column.render(row) : row[column.key]}</td>)}{renderActions && <td className="px-4 py-3 text-right">{renderActions(row)}</td>}</tr>)}</tbody>
          </table>
        </div>
      )}
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
        <span className="text-muted-foreground">Page {activePage} of {pages}</span>
        <div className="flex gap-2"><button type="button" disabled={activePage === 1} onClick={() => setPage((value) => value - 1)} className="rounded-md border border-border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50">Previous</button><button type="button" disabled={activePage === pages} onClick={() => setPage((value) => value + 1)} className="rounded-md border border-border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50">Next</button></div>
      </div>
    </div>
  );
}
