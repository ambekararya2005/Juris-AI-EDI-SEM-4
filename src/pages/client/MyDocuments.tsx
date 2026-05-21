import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Eye, Download, Trash2, Filter, Clock, X, RotateCcw } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { getStatusBadge } from '../../components/ui/Badge';
import { TableRowSkeleton } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { mockDocuments } from '../../data/mockData';
import { DocumentType, DocumentStatus } from '../../types';
import { useApp } from '../../context/AppContext';
import useSimulatedLoading from '../../hooks/useSimulatedLoading';

const ALL_TYPES: DocumentType[] = ['Wakalatnama', 'Petition', 'Affidavit', 'Bail Application', 'Business Agreement', 'Rental Agreement'];
const ALL_STATUSES: DocumentStatus[] = ['Draft', 'Under Review', 'Finalized', 'Revision Needed'];

// ─── Version History Drawer ───────────────────────────────────────────────────
interface DrawerProps {
  docTitle: string;
  onClose: () => void;
}

const VersionHistoryDrawer: React.FC<DrawerProps> = ({ docTitle, onClose }) => {
  const { addToast } = useApp();
  const today = new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  const versions = [
    { n: 3, label: 'Latest', date: today, desc: 'Lawyer reviewed and added comments' },
    { n: 2, label: '2 days ago', date: '', desc: 'AI-generated draft refined' },
    { n: 1, label: '3 days ago', date: '', desc: 'Initial AI generation' },
  ];

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/60 z-40 transition-opacity"
        onClick={onClose}
      />
      {/* Drawer panel */}
      <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-slate-800 shadow-2xl z-50 flex flex-col animate-slide-in-right">
        {/* Header */}
        <div className="p-5 border-b border-border dark:border-slate-700 flex items-start justify-between gap-3">
          <div>
            <h3 className="font-serif font-semibold text-dark-text dark:text-slate-100 text-base leading-snug">
              Version History
            </h3>
            <p className="text-xs text-muted-text dark:text-slate-400 mt-0.5 truncate max-w-[200px]" title={docTitle}>
              {docTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-surface-gray dark:hover:bg-slate-700 text-muted-text hover:text-dark-text dark:hover:text-slate-200 transition-colors flex-shrink-0"
          >
            <X size={16} />
          </button>
        </div>

        {/* Versions list */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {versions.map(v => (
            <div
              key={v.n}
              className="p-4 rounded-xl border border-border dark:border-slate-700 bg-surface-gray dark:bg-slate-700/50 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-dark-text dark:text-slate-100">v{v.n}</span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full
                      ${v.n === 3 ? 'bg-gold/20 text-gold' : 'bg-light-blue dark:bg-slate-600 text-navy dark:text-blue-300'}`}
                  >
                    {v.label}
                  </span>
                </div>
                {v.date && (
                  <span className="text-[10px] text-muted-text dark:text-slate-400">{v.date}</span>
                )}
              </div>
              <p className="text-xs text-muted-text dark:text-slate-400 mb-3 leading-relaxed">{v.desc}</p>
              <button
                onClick={() => addToast(`Restored to v${v.n}`, 'info')}
                className="flex items-center gap-1.5 text-xs font-medium text-navy dark:text-blue-400 hover:text-blue-brand dark:hover:text-blue-300 transition-colors"
              >
                <RotateCcw size={11} /> Restore this version
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

// ─── Bulk Action Toolbar ──────────────────────────────────────────────────────
interface BulkToolbarProps {
  count: number;
  onDelete: () => void;
  onClear: () => void;
}

const BulkToolbar: React.FC<BulkToolbarProps> = ({ count, onDelete, onClear }) => (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-navy dark:bg-slate-700 text-white rounded-2xl shadow-2xl px-5 py-3 animate-fade-in-down">
    <span className="text-sm font-semibold">{count} selected</span>
    <div className="w-px h-4 bg-white/30" />
    <button
      onClick={onDelete}
      className="flex items-center gap-1.5 text-sm font-medium text-red-300 hover:text-red-200 transition-colors"
    >
      <Trash2 size={14} /> Delete Selected
    </button>
    <button
      onClick={onClear}
      className="p-1 rounded-lg hover:bg-white/10 transition-colors"
      title="Clear selection"
    >
      <X size={14} />
    </button>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const MyDocuments: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useApp();
  const { isLoading, triggerLoad } = useSimulatedLoading(1000);

  const [activeTab, setActiveTab] = useState<'all' | DocumentStatus>('all');
  const [selectedTypes, setSelectedTypes] = useState<DocumentType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<DocumentStatus[]>([]);
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [drawerDoc, setDrawerDoc] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    triggerLoad();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggleFilter = <T extends string>(arr: T[], setter: (v: T[]) => void, val: T) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const clearFilters = useCallback(() => {
    setSelectedTypes([]);
    setSelectedStatuses([]);
    setSearch('');
    setActiveTab('all');
  }, []);

  const filtered = mockDocuments.filter(doc => {
    if (activeTab !== 'all' && doc.status !== activeTab) return false;
    if (selectedTypes.length && !selectedTypes.includes(doc.type)) return false;
    if (selectedStatuses.length && !selectedStatuses.includes(doc.status)) return false;
    if (search.trim() && !doc.title.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const tabCounts = {
    all: mockDocuments.length,
    Draft: mockDocuments.filter(d => d.status === 'Draft').length,
    'Under Review': mockDocuments.filter(d => d.status === 'Under Review').length,
    Finalized: mockDocuments.filter(d => d.status === 'Finalized').length,
    'Revision Needed': mockDocuments.filter(d => d.status === 'Revision Needed').length,
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map(d => d.id)));
    }
  };

  const handleBulkDelete = () => {
    const count = selectedIds.size;
    setSelectedIds(new Set());
    addToast(`${count} document(s) deleted`, 'success');
  };

  const cbCls = 'flex items-center gap-2 cursor-pointer text-sm text-dark-text dark:text-slate-300 hover:text-navy dark:hover:text-blue-400 select-none';

  return (
    <div className="flex gap-6 relative">
      {/* ── Bulk Toolbar (floating) ── */}
      {selectedIds.size > 0 && (
        <BulkToolbar
          count={selectedIds.size}
          onDelete={handleBulkDelete}
          onClear={() => setSelectedIds(new Set())}
        />
      )}

      {/* ── Version History Drawer ── */}
      {drawerDoc && (
        <VersionHistoryDrawer
          docTitle={drawerDoc.title}
          onClose={() => setDrawerDoc(null)}
        />
      )}

      {/* ── Sidebar Filters ── */}
      <Card className="p-5 w-56 flex-shrink-0 h-fit dark:bg-slate-800">
        <h3 className="font-serif text-sm font-semibold text-dark-text dark:text-slate-100 mb-4 flex items-center gap-2">
          <Filter size={14} /> Filters
        </h3>

        {/* Search */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search documents…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-lg border border-border dark:border-slate-600 bg-white dark:bg-slate-700 text-dark-text dark:text-slate-200 placeholder:text-muted-text focus:outline-none focus:ring-2 focus:ring-navy dark:focus:ring-blue-500 transition"
          />
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wider mb-2">Document Type</p>
          {ALL_TYPES.map(t => (
            <label key={t} className={cbCls}>
              <input
                type="checkbox"
                checked={selectedTypes.includes(t)}
                onChange={() => toggleFilter(selectedTypes, setSelectedTypes, t)}
                className="accent-navy dark:accent-blue-500"
              />
              <span className="truncate">{t}</span>
            </label>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-text dark:text-slate-400 uppercase tracking-wider mb-2">Status</p>
          {ALL_STATUSES.map(s => (
            <label key={s} className={cbCls}>
              <input
                type="checkbox"
                checked={selectedStatuses.includes(s)}
                onChange={() => toggleFilter(selectedStatuses, setSelectedStatuses, s)}
                className="accent-navy dark:accent-blue-500"
              />
              {s}
            </label>
          ))}
        </div>

        <button
          onClick={clearFilters}
          className="text-xs text-muted-text hover:text-risk dark:hover:text-red-400 underline mt-2 transition-colors"
        >
          Clear all
        </button>
      </Card>

      {/* ── Main Content ── */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-dark-text dark:text-slate-100">My Documents</h1>
          <Button variant="gold" onClick={() => navigate('/client/documents/new')}>
            <FilePlus size={16} /> New Document
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-gray dark:bg-slate-700 rounded-xl p-1 w-fit">
          {(['all', 'Draft', 'Under Review', 'Finalized', 'Revision Needed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab
                  ? 'bg-white dark:bg-slate-800 text-navy dark:text-blue-300 shadow-sm'
                  : 'text-muted-text dark:text-slate-400 hover:text-dark-text dark:hover:text-slate-200'}`}
            >
              {tab === 'all' ? 'All' : tab}
              <span className="ml-1 text-xs bg-light-blue dark:bg-slate-600 text-navy dark:text-blue-300 rounded-full px-1.5 py-0.5">
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        {/* Documents Table */}
        <Card className="overflow-hidden dark:bg-slate-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-gray dark:bg-slate-700/60 text-xs text-muted-text dark:text-slate-400 uppercase tracking-wider">
                  {/* Select-all checkbox */}
                  <th className="px-4 py-3 text-left w-8">
                    {!isLoading && filtered.length > 0 && (
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                        onChange={toggleSelectAll}
                        className="accent-navy dark:accent-blue-500 cursor-pointer"
                        title="Select all"
                      />
                    )}
                  </th>
                  <th className="px-4 py-3 text-left">Document Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-left">Lawyer</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50 dark:divide-slate-700">
                {isLoading ? (
                  /* Skeleton rows */
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={7} />
                  ))
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7}>
                      <EmptyState
                        title="No documents found"
                        subtitle="Try adjusting your search or filters"
                        ctaLabel="Clear Filters"
                        onCta={clearFilters}
                      />
                    </td>
                  </tr>
                ) : (
                  filtered.map(doc => {
                    const isSelected = selectedIds.has(doc.id);
                    return (
                      <tr
                        key={doc.id}
                        className={`hover:bg-surface-gray/50 dark:hover:bg-slate-700/40 transition-colors group
                          ${isSelected ? 'bg-light-blue/40 dark:bg-blue-900/20' : ''}`}
                      >
                        {/* Row checkbox */}
                        <td className="px-4 py-3 w-8">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(doc.id)}
                            className="accent-navy dark:accent-blue-500 cursor-pointer"
                          />
                        </td>

                        {/* Document Name */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-light-blue dark:bg-slate-700 flex items-center justify-center flex-shrink-0">
                              <span className="text-xs text-navy dark:text-blue-300">📄</span>
                            </div>
                            <span className="text-sm font-medium text-dark-text dark:text-slate-200 truncate max-w-[180px]">
                              {doc.title}
                            </span>
                          </div>
                        </td>

                        <td className="px-4 py-3 text-xs text-muted-text dark:text-slate-400">{doc.type}</td>
                        <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                        <td className="px-4 py-3 text-xs text-muted-text dark:text-slate-400">{doc.createdAt}</td>
                        <td className="px-4 py-3 text-xs dark:text-slate-400">
                          {doc.lawyerName || <span className="text-muted-text/60 dark:text-slate-500 italic">Unassigned</span>}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3">
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* View */}
                            <button
                              onClick={() => navigate(`/client/documents/${doc.id}`)}
                              className="p-1.5 hover:bg-light-blue dark:hover:bg-slate-700 rounded-lg text-muted-text hover:text-navy dark:hover:text-blue-400 transition-colors"
                              title="View"
                            >
                              <Eye size={14} />
                            </button>
                            {/* Version History */}
                            <button
                              onClick={() => setDrawerDoc({ id: doc.id, title: doc.title })}
                              className="p-1.5 hover:bg-light-blue dark:hover:bg-slate-700 rounded-lg text-muted-text hover:text-navy dark:hover:text-blue-400 transition-colors"
                              title="Version History"
                            >
                              <Clock size={14} />
                            </button>
                            {/* Download */}
                            <button
                              className="p-1.5 hover:bg-light-blue dark:hover:bg-slate-700 rounded-lg text-muted-text hover:text-navy dark:hover:text-blue-400 transition-colors"
                              title="Download"
                            >
                              <Download size={14} />
                            </button>
                            {/* Delete */}
                            <button
                              onClick={() => {
                                addToast('1 document(s) deleted', 'success');
                              }}
                              className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg text-muted-text hover:text-risk transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          {!isLoading && (
            <div className="px-4 py-3 border-t border-border dark:border-slate-700 bg-surface-gray/50 dark:bg-slate-700/30 flex items-center justify-between">
              <p className="text-xs text-muted-text dark:text-slate-400">
                Showing {filtered.length} of {mockDocuments.length} documents
                {selectedIds.size > 0 && (
                  <span className="ml-2 text-navy dark:text-blue-400 font-medium">· {selectedIds.size} selected</span>
                )}
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MyDocuments;
