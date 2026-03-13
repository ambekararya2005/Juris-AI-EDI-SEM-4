import React, { useState } from 'react';
import { Heart, Search, Filter, Calendar, ChevronDown } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { mockCases } from '../../data/mockData';
import { useApp } from '../../context/AppContext';
import { CaseResult } from '../../types';

const courtColors: Record<string, string> = {
  'Supreme Court': 'bg-navy text-white',
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

const CaseLawSearch: React.FC = () => {
  const { savedCases, toggleSavedCase } = useApp();
  const [query, setQuery] = useState('bail conditions repeat offender');
  const [searched, setSearched] = useState(true);
  const [selectedCase, setSelectedCase] = useState<CaseResult | null>(null);
  const [court, setCourt] = useState('All Courts');
  const [domain, setDomain] = useState('All');

  const filtered = mockCases.filter(c => {
    if (court !== 'All Courts' && c.court !== court) return false;
    if (domain !== 'All' && c.domain !== domain) return false;
    return true;
  });

  const highlightText = (text: string, terms: string[]) => {
    let result = text;
    terms.forEach(term => {
      const regex = new RegExp(`(${term})`, 'gi');
      result = result.replace(regex, '<mark class="bg-amber-100 text-amber-900 rounded px-0.5">$1</mark>');
    });
    return result;
  };

  return (
    <div className="space-y-6">
      {/* Search Hero */}
      <div className="bg-navy rounded-2xl p-8">
        <h1 className="font-serif text-2xl font-bold text-white mb-1">Case Law Search</h1>
        <p className="text-white/60 text-sm mb-5">Search Pakistan's case law in natural language</p>

        <div className="flex gap-2 mb-4">
          <div className="flex-1 flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3 border border-white/20">
            <Search size={18} className="text-white/60" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') setSearched(true); }}
              placeholder='e.g. "bail denied where accused is repeat offender in Punjab"'
              className="flex-1 bg-transparent text-white placeholder:text-white/40 text-sm outline-none"
            />
          </div>
          <Button variant="gold" onClick={() => setSearched(true)} className="px-6">Search</Button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 flex-wrap">
          <select value={court} onChange={e => setCourt(e.target.value)}
            className="bg-white/10 text-white text-xs border border-white/20 rounded-lg px-3 py-2 outline-none">
            {['All Courts', 'Supreme Court', 'High Court', 'Sessions Court', 'Federal Shariat Court'].map(c => <option key={c} className="text-dark-text bg-white">{c}</option>)}
          </select>
          <select value={domain} onChange={e => setDomain(e.target.value)}
            className="bg-white/10 text-white text-xs border border-white/20 rounded-lg px-3 py-2 outline-none">
            {['All', 'Criminal', 'Civil', 'Family', 'Commercial', 'Constitutional'].map(d => <option key={d} className="text-dark-text bg-white">{d}</option>)}
          </select>
          <div className="flex items-center gap-2 text-white/60 text-xs">
            <Calendar size={12} /> Year: 2000 – 2026
          </div>
        </div>
      </div>

      {/* Results */}
      {searched && (
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
                >
                  {c.caseName}
                </h3>
                <p className="font-mono text-xs text-gold font-semibold mb-2">{c.citation}</p>

                <div className="border-l-2 border-light-blue pl-3 mb-3">
                  <p
                    className="text-xs text-dark-text leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: highlightText(c.summary, c.keyPhrases) }}
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

      {/* Case Detail Modal */}
      <Modal isOpen={!!selectedCase} onClose={() => setSelectedCase(null)} title={selectedCase?.caseName} size="xl">
        {selectedCase && (
          <div>
            <div className="flex gap-2 mb-4 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${courtColors[selectedCase.court] || 'bg-gray-100'}`}>
                {selectedCase.court}
              </span>
              <span className="font-mono text-sm text-gold font-semibold">{selectedCase.citation}</span>
              <span className="text-xs text-muted-text">{selectedCase.year}</span>
            </div>

            {[
              { label: 'Background', text: 'This case arose from an application for pre-arrest bail under Section 498 of the Code of Criminal Procedure. The applicant was accused under Section 302 PPC at Police Station Gulberg, Lahore.' },
              { label: 'Issue', text: 'Whether bail can be granted to a first-time offender charged under Section 302 PPC where investigation is substantially complete and the accused poses no flight risk.' },
              { label: 'Decision', text: 'Bail granted subject to surety of PKR 500,000 with two sureties. The Court held that bail is the rule and jail is the exception, particularly for first-time offenders.' },
              { label: 'Ratio Decidendi', text: selectedCase.summary },
              { label: 'Obiter Dicta', text: 'Courts should not mechanically deny bail based on the gravity of charge alone. Personal liberty guaranteed under Article 9 must be the primary consideration.' },
            ].map(s => (
              <div key={s.label} className="mb-4">
                <h4 className="font-semibold text-xs text-muted-text uppercase tracking-wider mb-1">{s.label}</h4>
                <p className="text-sm text-dark-text leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CaseLawSearch;
