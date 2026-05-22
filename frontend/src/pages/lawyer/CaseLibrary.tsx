import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Folder, FolderOpen, ChevronDown, ChevronRight,
  Trash2, Download, BookOpen,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import { useApp } from '../../context/AppContext';
import { useSavedCases } from '../../hooks/useSavedCases';
import { downloadPdf } from '../../utils/downloadPdf';


// ─── Folder definitions ───────────────────────────────────────────────────────

interface FolderDef {
  id: string;
  label: string;
  domain: string;
  color: string;       // badge colours
  badgeBg: string;
}

const FOLDERS: FolderDef[] = [
  { id: 'criminal', label: 'Criminal Law', domain: 'Criminal', color: 'text-risk', badgeBg: 'bg-red-100 text-risk dark:bg-red-900/40 dark:text-red-300' },
  { id: 'civil', label: 'Civil Law', domain: 'Civil', color: 'text-blue-brand', badgeBg: 'bg-blue-100 text-blue-brand dark:bg-blue-900/40 dark:text-blue-300' },
  { id: 'commercial', label: 'Commercial Law', domain: 'Commercial', color: 'text-amber-700', badgeBg: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

interface CaseCardProps {
  c: {
    id: string;
    case_title: string;
    court: string;
    year: number;
    citation: string;
    domain: string;
    summary: string;
    notes?: string;
  };
  onRemove: () => void;
  onNoteSave: (notes: string) => void;
}

const CaseCard: React.FC<CaseCardProps> = ({ c, onRemove, onNoteSave }) => {
  const [note, setNote] = useState(c.notes || '');

  return (
    <Card className="p-4 dark:bg-slate-800 space-y-3">
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-dark-text dark:text-slate-100 leading-snug">{c.case_title}</p>
          <div className="flex items-center gap-1.5 flex-wrap mt-1">
            <p className="font-mono text-xs text-gold">{c.citation}</p>
            <span className="text-muted-text dark:text-slate-500 text-[10px]">·</span>
            <p className="text-xs text-muted-text dark:text-slate-400">{c.court}</p>
          </div>
        </div>
        {/* Year badge */}
        <span className="text-[10px] font-semibold bg-light-blue dark:bg-slate-700 text-navy dark:text-slate-200 px-2 py-0.5 rounded-full shrink-0">
          {c.year}
        </span>
      </div>

      {/* Notes textarea */}
      <textarea
        rows={2}
        value={note}
        onChange={e => setNote(e.target.value)}
        onBlur={() => onNoteSave(note)}
        placeholder="Add notes..."
        className="w-full px-2.5 py-1.5 text-xs border border-border dark:border-slate-600 rounded-xl
          bg-surface-gray dark:bg-slate-900 text-dark-text dark:text-slate-200
          placeholder:text-muted-text/60 resize-none focus:outline-none focus:ring-1 focus:ring-blue-brand/30"
      />

      {/* Remove button */}
      <div className="flex justify-end">
        <button
          onClick={onRemove}
          className="flex items-center gap-1 text-xs text-muted-text hover:text-risk transition-colors px-2 py-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
        >
          <Trash2 size={12} /> Remove
        </button>
      </div>
    </Card>
  );
};

// ─── Folder Section ───────────────────────────────────────────────────────────

interface FolderSectionProps {
  folder: FolderDef;
  cases: any[];
  onRemove: (id: string) => void;
  onNoteSave: (id: string, notes: string) => void;
}

const FolderSection: React.FC<FolderSectionProps> = ({ folder, cases, onRemove, onNoteSave }) => {
  const [expanded, setExpanded] = useState(true);
  const Icon = expanded ? FolderOpen : Folder;
  const Chevron = expanded ? ChevronDown : ChevronRight;

  return (
    <div>
      {/* Folder header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-800 rounded-2xl
          border border-border dark:border-slate-700 hover:shadow-card-hover transition-all duration-200 group"
      >
        <Icon size={18} className={`${folder.color} shrink-0`} />
        <span className="font-semibold text-sm text-dark-text dark:text-slate-100 flex-1 text-left">
          {folder.label}
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${folder.badgeBg}`}>
          {cases.length}
        </span>
        <Chevron size={16} className="text-muted-text group-hover:text-dark-text transition-colors" />
      </button>

      {/* Cases grid */}
      {expanded && (
        <div className="mt-3 ml-4 pl-4 border-l-2 border-light-blue dark:border-slate-600">
          {cases.length === 0 ? (
            <Card className="dark:bg-slate-800">
              <EmptyState
                title="No cases saved"
                subtitle="Search case law and save cases to your library"
                className="py-10"
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cases.map(c => (
                <CaseCard
                  key={c.id}
                  c={c}
                  onRemove={() => onRemove(c.id)}
                  onNoteSave={(notes) => onNoteSave(c.id, notes)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const CaseLibrary: React.FC = () => {
  const { addToast } = useApp();
  const { savedCases, loading, unsaveCase, updateNotes } = useSavedCases();
  const navigate = useNavigate();

  function handleRemove(id: string) {
    unsaveCase(id);
    addToast('Removed from library', 'success');
  }

  function handleNoteSave(id: string, notes: string) {
    updateNotes(id, notes);
    addToast('Note saved', 'success');
  }

  function handleExport() {
    if (savedCases.length === 0) {
      addToast('No cases to export', 'info');
      return;
    }
    const content = savedCases.map((c, i) => {
      return `CASE #${i + 1}
Title: ${c.case_title}
Citation: ${c.citation}
Court: ${c.court} (${c.year})
Domain: ${c.domain}

Summary:
${c.summary}

Notes:
${c.notes || 'None'}
--------------------------------------------------------------------------------
`;
    }).join('\n');

    downloadPdf(
      content,
      'Saved_Cases_Library',
      {
        title: 'Saved Case Law Library Report',
        type: 'Case Law Summary Export',
        clientName: 'Juris-AI Lawyer Portal',
        date: new Date().toLocaleDateString('en-IN')
      }
    );
  }


  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl animate-pulse w-1/4" />
        <div className="h-32 bg-gray-100 dark:bg-slate-800 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const totalSaved = savedCases.length;

  return (
    <div className="space-y-6">

      {/* ── Page header ───────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-dark-text dark:text-slate-100">Case Library</h1>
          <p className="text-muted-text dark:text-slate-400 text-sm mt-1">
            {totalSaved} saved {totalSaved === 1 ? 'case' : 'cases'} across all folders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2 text-sm">
            <Download size={15} /> Export PDF
          </Button>
          <Button variant="primary" onClick={() => navigate('/lawyer/search')} className="flex items-center gap-2 text-sm">
            <BookOpen size={15} /> Search &amp; Add Cases
          </Button>
        </div>
      </div>

      {/* ── Global empty state ────────────────────────────────────────────────── */}
      {totalSaved === 0 ? (
        <Card className="dark:bg-slate-800">
          <EmptyState
            title="Your library is empty"
            subtitle="Search for case law and save cases to your library. They'll appear here organised by domain."
            ctaLabel="Search Case Law →"
            onCta={() => navigate('/lawyer/search')}
          />
        </Card>
      ) : (
        <div className="space-y-6">
          {FOLDERS.map(folder => {
            const folderCases = savedCases.filter(c => c.domain?.toLowerCase() === folder.domain?.toLowerCase());
            return (
              <FolderSection
                key={folder.id}
                folder={folder}
                cases={folderCases}
                onRemove={handleRemove}
                onNoteSave={handleNoteSave}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default CaseLibrary;
