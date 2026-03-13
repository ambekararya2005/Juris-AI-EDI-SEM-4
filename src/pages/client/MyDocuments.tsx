import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FilePlus, Eye, Download, Trash2, Filter } from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge, { getStatusBadge } from '../../components/ui/Badge';
import { mockDocuments } from '../../data/mockData';
import { DocumentType, DocumentStatus } from '../../types';

const ALL_TYPES: DocumentType[] = ['Wakalatnama', 'Petition', 'Affidavit', 'Bail Application', 'Business Agreement', 'Rental Agreement'];
const ALL_STATUSES: DocumentStatus[] = ['Draft', 'Under Review', 'Finalized', 'Revision Needed'];

const MyDocuments: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | DocumentStatus>('all');
  const [selectedTypes, setSelectedTypes] = useState<DocumentType[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<DocumentStatus[]>([]);

  const toggleFilter = <T extends string>(arr: T[], setter: (v: T[]) => void, val: T) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
  };

  const filtered = mockDocuments.filter(doc => {
    if (activeTab !== 'all' && doc.status !== activeTab) return false;
    if (selectedTypes.length && !selectedTypes.includes(doc.type)) return false;
    if (selectedStatuses.length && !selectedStatuses.includes(doc.status)) return false;
    return true;
  });

  const tabCounts = {
    all: mockDocuments.length,
    Draft: mockDocuments.filter(d => d.status === 'Draft').length,
    'Under Review': mockDocuments.filter(d => d.status === 'Under Review').length,
    Finalized: mockDocuments.filter(d => d.status === 'Finalized').length,
    'Revision Needed': mockDocuments.filter(d => d.status === 'Revision Needed').length,
  };

  const cbCls = "flex items-center gap-2 cursor-pointer text-sm text-dark-text hover:text-navy";

  return (
    <div className="flex gap-6">
      {/* Sidebar Filters */}
      <Card className="p-5 w-56 flex-shrink-0 h-fit">
        <h3 className="font-serif text-sm font-semibold text-dark-text mb-4 flex items-center gap-2">
          <Filter size={14} /> Filters
        </h3>

        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-text uppercase tracking-wider mb-2">Document Type</p>
          {ALL_TYPES.map(t => (
            <label key={t} className={cbCls}>
              <input type="checkbox" checked={selectedTypes.includes(t)} onChange={() => toggleFilter(selectedTypes, setSelectedTypes, t)} className="accent-navy" />
              <span className="truncate">{t}</span>
            </label>
          ))}
        </div>

        <div className="mb-4">
          <p className="text-xs font-semibold text-muted-text uppercase tracking-wider mb-2">Status</p>
          {ALL_STATUSES.map(s => (
            <label key={s} className={cbCls}>
              <input type="checkbox" checked={selectedStatuses.includes(s)} onChange={() => toggleFilter(selectedStatuses, setSelectedStatuses, s)} className="accent-navy" />
              {s}
            </label>
          ))}
        </div>

        <button
          onClick={() => { setSelectedTypes([]); setSelectedStatuses([]); }}
          className="text-xs text-muted-text hover:text-risk underline mt-2"
        >
          Clear all
        </button>
      </Card>

      {/* Main */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-2xl font-bold text-dark-text">My Documents</h1>
          <Button variant="gold" onClick={() => navigate('/client/documents/new')}>
            <FilePlus size={16} /> New Document
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-surface-gray rounded-xl p-1 w-fit">
          {(['all', 'Draft', 'Under Review', 'Finalized', 'Revision Needed'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab ? 'bg-white text-navy shadow-sm' : 'text-muted-text hover:text-dark-text'}`}
            >
              {tab === 'all' ? 'All' : tab}
              <span className="ml-1 text-xs bg-light-blue text-navy rounded-full px-1.5 py-0.5">
                {tabCounts[tab]}
              </span>
            </button>
          ))}
        </div>

        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-surface-gray text-xs text-muted-text uppercase tracking-wider">
                  <th className="px-4 py-3 text-left">Document Name</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Created</th>
                  <th className="px-4 py-3 text-left">Lawyer</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map(doc => (
                  <tr key={doc.id} className="hover:bg-surface-gray/50 transition-colors group">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-light-blue flex items-center justify-center flex-shrink-0">
                          <span className="text-xs text-navy">📄</span>
                        </div>
                        <span className="text-sm font-medium text-dark-text">{doc.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-text">{doc.type}</td>
                    <td className="px-4 py-3">{getStatusBadge(doc.status)}</td>
                    <td className="px-4 py-3 text-xs text-muted-text">{doc.createdAt}</td>
                    <td className="px-4 py-3 text-xs">{doc.lawyerName || <span className="text-muted-text/60 italic">Unassigned</span>}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/client/documents/${doc.id}`)}
                          className="p-1.5 hover:bg-light-blue rounded-lg text-muted-text hover:text-navy transition-colors"
                          title="View"
                        >
                          <Eye size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-light-blue rounded-lg text-muted-text hover:text-navy transition-colors" title="Download">
                          <Download size={14} />
                        </button>
                        <button className="p-1.5 hover:bg-red-50 rounded-lg text-muted-text hover:text-risk transition-colors" title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border bg-surface-gray/50 flex items-center justify-between">
            <p className="text-xs text-muted-text">Showing {filtered.length} of {mockDocuments.length} documents</p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MyDocuments;
