import React, { useState, useEffect } from 'react';
import {
  Heart, Search, Calendar,
  Copy, Filter,
} from 'lucide-react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Skeleton from '../../components/ui/Skeleton';
import { mockCases } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { CaseResult } from '../../types';

// ─── Colour maps ──────────────────────────────────────────────────────────────

const courtColors: Record<string, string> = {
  'Supreme Court of India': 'bg-navy text-white',
  'Supreme Court': 'bg-navy text-white',
  'Bombay High Court': 'bg-blue-brand text-white',
  'High Court': 'bg-blue-brand text-white',
  'Sessions Court': 'bg-muted-text text-white',
  'Federal Shariat Court': 'bg-gold text-white',
};

const domainColors: Record<string, string> = {
  Criminal: 'bg-red-100 text-risk',
  Civil: 'bg-blue-100 text-blue-brand',
  Family: 'bg-pink-100 text-pink-700',
  Commercial: 'bg-amber-100 text-amber-700',
  Constitutional: 'bg-purple-100 text-purple-700',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const HISTORY_KEY = 'jurisai-search-history';

function getHistory(): string[] {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveHistory(query: string) {
  const prev = getHistory().filter(q => q !== query);
  const next = [query, ...prev].slice(0, 5);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(next));
}

/** Wraps occurrences of `query` in a <mark> element */
function highlightText(text: string, query: string): string {
  if (!query.trim()) return text;
  const words = query.trim().split(/\s+/).filter(Boolean);
  let result = text;
  words.forEach(word => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escaped})`, 'gi');
    result = result.replace(
      regex,
      `<mark class="bg-yellow-200 dark:bg-yellow-800 rounded px-0.5">$1</mark>`,
    );
  });
  return result;
}

// ─── Related Cases mock data ──────────────────────────────────────────────────

const RELATED_CASES = [
  { name: 'Arnab Ranjan Goswami v. Union of India', citation: '(2021) 2 SCC 427', court: 'Supreme Court of India' },
  { name: 'Satender Kumar Antil v. CBI', citation: '(2022) 10 SCC 51', court: 'Supreme Court of India' },
  { name: 'Anil Dattatray Sawant v. State of Maharashtra', citation: '2021 Cri LJ 1832 (Bom)', court: 'Bombay High Court' },
];

// ─── Skeleton card ────────────────────────────────────────────────────────────

const SearchSkeletonCard: React.FC = () => (
  <Card className="p-5 space-y-3">
    <div className="flex gap-2">
      <Skeleton height="1.25rem" width="6rem" rounded="md" />
      <Skeleton height="1.25rem" width="4rem" rounded="md" />
    </div>
    <Skeleton height="1rem" width="75%" />
    <Skeleton height="0.75rem" width="40%" />
    <div className="space-y-1">
      <Skeleton height="0.75rem" />
      <Skeleton height="0.75rem" />
      <Skeleton height="0.75rem" width="80%" />
    </div>
  </Card>
);

// ─── Main component ───────────────────────────────────────────────────────────

const CaseLawSearch: React.FC = () => {
  const { savedCases, toggleSavedCase, addToast } = useApp();

  const [query, setQuery] = useState('bail conditions repeat offender');
  const [searched, setSearched] = useState(true);
  const [loading, setLoading] = useState(false);
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null);
  const [court, setCourt] = useState('All Courts');
  const [domain, setDomain] = useState('All');
  const [history, setHistory] = useState<string[]>(getHistory);

  // Filters sidebar
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [yearFrom, setYearFrom] = useState(1950);
  const [yearTo, setYearTo] = useState(2024);
  const [bench, setBench] = useState<Record<string, boolean>>({
    'Single Bench': false,
    'Division Bench': false,
    'Full Bench': false,
    'Constitution Bench': false,
  });
  const [outcome, setOutcome] = useState('All');

  const outcomes = ['All', 'Acquitted', 'Convicted', 'Remanded', 'Appeal Dismissed'];

  function clearFilters() {
    setYearFrom(1950);
    setYearTo(2024);
    setBench({ 'Single Bench': false, 'Division Bench': false, 'Full Bench': false, 'Constitution Bench': false });
    setOutcome('All');
  }

  // Refresh history on mount
  useEffect(() => {
    setHistory(getHistory());
  }, []);

  function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setSearched(false);
    saveHistory(query.trim());
    setHistory(getHistory());
    setTimeout(() => {
      setLoading(false);
      setSearched(true);
    }, 1500);
  }

  const filtered = mockCases.filter(c => {
    if (court !== 'All Courts' && c.court !== court) return false;
    if (domain !== 'All' && c.domain !== domain) return false;
    return true;
  });

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text).then(() => addToast('Citation copied!', 'success'));
  }

  return (
    <div className="space-y-6">

      {/* ── Search Hero ──────────────────────────────────────────────────────── */}
      <div className="bg-navy rounded-2xl p-8">
        <h1 className="font-serif text-2xl font-bold text-white mb-1">Case Law Search</h1>
        <p className="text-white/60 text-sm mb-5">Search Maharashtra's case law in natural language</p>

        {/* Search history chips */}
        {history.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {history.map(h => (
              <button
                key={h}
                onClick={() => setQuery(h)}
                className="bg-white/10 text-white/80 hover:bg-white/20 rounded-full px-3 py-1 text-xs transition-colors border border-white/15 truncate max-w-[180px]"
                title={h}
              >
                {h}
              </button>
            ))}
          </div>
        )}

        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
            <Search size={18} className="text-white/60 shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSearch(); }}
              placeholder='e.g. "bail denied where accused is repeat offender in Maharashtra"'
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none"
            />
          </div>
          <Button variant="gold" onClick={handleSearch} className="px-6">Search</Button>
        </div>

        {/* Quick-filter row */}
        <div className="flex gap-3 flex-wrap items-center">
          <select value={court} onChange={e => setCourt(e.target.value)}
            className="bg-white/10 text-white text-xs border border-white/20 rounded-lg px-3 py-2 outline-none">
            {['All Courts', 'Supreme Court of India', 'Bombay High Court', 'Sessions Court', 'Federal Shariat Court'].map(c => (
              <option key={c} className="text-dark-text bg-white">{c}</option>
            ))}
          </select>
          <select value={domain} onChange={e => setDomain(e.target.value)}
            className="bg-white/10 text-white text-xs border border-white/20 rounded-lg px-3 py-2 outline-none">
            {['All', 'Criminal', 'Civil', 'Family', 'Commercial', 'Constitutional'].map(d => (
              <option key={d} className="text-dark-text bg-white">{d}</option>
            ))}
          </select>
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Calendar size={12} /> Year: 2000 – 2026
          </div>
          <button
            onClick={() => setFiltersOpen(o => !o)}
            className="ml-auto flex items-center gap-1.5 bg-white/10 hover:bg-white/20 text-white text-xs px-3 py-2 rounded-lg border border-white/20 transition-colors md:hidden"
          >
            <Filter size={13} /> Filters
          </button>
        </div>
      </div>

      {/* ── Content area with optional filters sidebar ────────────────────── */}
      <div className="flex gap-5">

        {/* Filters sidebar — hidden on mobile unless toggled */}
        <aside className={`w-52 flex-shrink-0 ${filtersOpen ? 'block' : 'hidden md:block'}`}>
          <Card className="p-4 sticky top-20 space-y-5">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-sm text-dark-text">Filters</p>
              <button onClick={clearFilters} className="text-xs text-blue-brand hover:underline">Clear All</button>
            </div>

            {/* Year range */}
            <div>
              <p className="text-xs font-medium text-muted-text mb-2 uppercase tracking-wide">Year Range</p>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  value={yearFrom}
                  onChange={e => setYearFrom(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-brand/30"
                  placeholder="From"
                />
                <span className="text-muted-text text-xs">–</span>
                <input
                  type="number"
                  value={yearTo}
                  onChange={e => setYearTo(Number(e.target.value))}
                  className="w-full px-2 py-1 text-xs border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-brand/30"
                  placeholder="To"
                />
              </div>
            </div>

            {/* Bench type */}
            <div>
              <p className="text-xs font-medium text-muted-text mb-2 uppercase tracking-wide">Bench Type</p>
              <div className="space-y-1.5">
                {Object.keys(bench).map(b => (
                  <label key={b} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={bench[b]}
                      onChange={e => setBench(prev => ({ ...prev, [b]: e.target.checked }))}
                      className="accent-navy w-3.5 h-3.5"
                    />
                    <span className="text-xs text-dark-text">{b}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Outcome filter */}
            <div>
              <p className="text-xs font-medium text-muted-text mb-2 uppercase tracking-wide">Outcome</p>
              <div className="space-y-1.5">
                {outcomes.map(o => (
                  <label key={o} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="outcome"
                      checked={outcome === o}
                      onChange={() => setOutcome(o)}
                      className="accent-navy w-3.5 h-3.5"
                    />
                    <span className="text-xs text-dark-text">{o}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              onClick={clearFilters}
              className="w-full py-1.5 text-xs text-muted-text border border-border rounded-xl hover:bg-surface-gray transition-colors"
            >
              Clear Filters
            </button>
          </Card>
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">

          {/* Skeleton loaders */}
          {loading && (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <SearchSkeletonCard key={i} />
              ))}
            </div>
          )}

          {searched && !loading && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-text">
                  <span className="font-semibold text-dark-text">{filtered.length} cases</span> found for "{query}"
                </p>
                <select className="text-xs border border-border rounded-lg px-2.5 py-1.5 text-muted-text bg-white outline-none">
                  <option>Relevance</option>
                  <option>Date</option>
                  <option>Court Level</option>
                </select>
              </div>

              <div className="space-y-4">
                {filtered.map(c => (
                  <Card key={c.id} className="p-5 hover:-translate-y-0.5 hover:shadow-card-hover transition-all duration-200">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${courtColors[c.court] || 'bg-gray-100'}`}>
                          {c.court}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-md ${domainColors[c.domain] || 'bg-gray-100 text-gray-600'}`}>
                          {c.domain}
                        </span>
                        <span className="text-xs text-muted-text">{c.year}</span>
                      </div>
                      <button
                        onClick={() => toggleSavedCase(c.id)}
                        className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${savedCases.includes(c.id) ? 'text-risk bg-red-50' : 'text-muted-text hover:text-risk hover:bg-red-50'}`}
                        aria-label={savedCases.includes(c.id) ? 'Unsave case' : 'Save case'}
                      >
                        <Heart size={16} fill={savedCases.includes(c.id) ? 'currentColor' : 'none'} />
                      </button>
                    </div>

                    <h3
                      className="font-semibold text-dark-text text-sm mb-0.5 cursor-pointer hover:text-navy transition-colors"
                      onClick={() => setSelectedCase(c)}
                      dangerouslySetInnerHTML={{ __html: highlightText(c.caseName, query) }}
                    />

                    {/* Citation with copy button */}
                    <div className="flex items-center gap-1.5 mb-2">
                      <p className="font-mono text-xs text-gold font-semibold">{c.citation}</p>
                      <button
                        onClick={() => copyToClipboard(c.citation)}
                        className="p-0.5 text-muted-text hover:text-navy transition-colors"
                        title="Copy citation"
                      >
                        <Copy size={11} />
                      </button>
                    </div>

                    <div className="border-l-2 border-light-blue pl-3 mb-3">
                      <p
                        className="text-xs text-dark-text leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: highlightText(c.summary, query) }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-1.5 flex-wrap">
                        {c.keyPhrases.slice(0, 3).map(kp => (
                          <span key={kp} className="text-[10px] bg-light-blue text-navy px-2 py-0.5 rounded-full">{kp}</span>
                        ))}
                      </div>
                      <button
                        onClick={() => setSelectedCase(c)}
                        className="text-xs text-blue-brand hover:underline font-medium"
                      >
                        View Full Case →
                      </button>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Case Detail Modal ─────────────────────────────────────────────────── */}
      <Modal isOpen={!!selectedCase} onClose={() => setSelectedCase(null)} title={selectedCase?.caseName} size="xl">
        {selectedCase && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap items-center">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${courtColors[selectedCase.court] || 'bg-gray-100'}`}>
                {selectedCase.court}
              </span>
              {/* Citation with copy in modal */}
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-sm text-gold font-semibold">{selectedCase.citation}</span>
                <button
                  onClick={() => copyToClipboard(selectedCase.citation)}
                  className="p-0.5 text-muted-text hover:text-navy transition-colors"
                  title="Copy citation"
                >
                  <Copy size={13} />
                </button>
              </div>
              <span className="text-xs text-muted-text">{selectedCase.year}</span>
            </div>

            {[
              { label: 'Background', text: 'This case arose from an application for anticipatory bail under Section 438 of the Code of Criminal Procedure. The applicant was accused under Section 302 IPC at Police Station Shivajinagar, Pune.' },
              { label: 'Issue', text: 'Whether bail can be granted to a first-time offender charged under Section 302 IPC where investigation is substantially complete and the accused poses no flight risk.' },
              { label: 'Decision', text: 'Bail granted subject to surety of ₹5,00,000 with two sureties. The Court held that bail is the rule and jail is the exception, particularly for first-time offenders.' },
              { label: 'Ratio Decidendi', text: selectedCase.summary },
              { label: 'Obiter Dicta', text: 'Courts should not mechanically deny bail based on the gravity of charge alone. Personal liberty guaranteed under Article 9 must be the primary consideration.' },
            ].map(s => (
              <div key={s.label} className="mb-4">
                <h4 className="font-semibold text-xs text-muted-text uppercase tracking-wider mb-1">{s.label}</h4>
                <p className="text-sm text-dark-text leading-relaxed">{s.text}</p>
              </div>
            ))}

            {/* Related Cases */}
            <div className="mt-6 pt-4 border-t border-border">
              <h4 className="font-semibold text-xs text-muted-text uppercase tracking-wider mb-3">Related Cases</h4>
              <div className="space-y-2">
                {RELATED_CASES.map(rc => (
                  <div
                    key={rc.citation}
                    className="flex items-center justify-between p-3 bg-surface-gray rounded-xl border border-border/50 cursor-pointer hover:border-light-blue transition-colors"
                    onClick={() => addToast('Loading related case...', 'info')}
                  >
                    <div>
                      <p className="text-xs font-semibold text-dark-text">{rc.name}</p>
                      <p className="font-mono text-[10px] text-gold">{rc.citation}</p>
                    </div>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ml-2 ${courtColors[rc.court] || 'bg-gray-100'}`}>
                      {rc.court.includes('Supreme') ? 'SC' : 'HC'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CaseLawSearch;
