import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { Check, Save, ThumbsUp, Send } from 'lucide-react';

type EditorTab = 'suggestions' | 'precedents' | 'comments';
type SaveState = 'idle' | 'saving' | 'saved';

const SUGGESTIONS = [
  {
    title: 'Strengthen bail grounds',
    body: 'Reference CrPC Section 437(1)(i) regarding bailable offences to strengthen the primary argument.'
  },
  {
    title: 'Add medical certificate reference',
    body: 'Clause 2(b) mentions medical condition but lacks supporting document reference. Add Exhibit A notation.'
  },
  {
    title: 'Surety declaration missing',
    body: 'Add the financial standing declaration required under Bombay HC practice directions 2022.'
  },
];

const DocumentEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [doc, setDoc] = useState<any>(null);
  const [versions, setVersions] = useState<any[]>([]);
  const [comments, setComments] = useState<any[]>([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [activeTab, setActiveTab] = useState<EditorTab>('suggestions');
  const [newComment, setNewComment] = useState('');
  const [wordCount, setWordCount] = useState(0);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Fetch document, versions, comments
  useEffect(() => {
    const fetchDoc = async () => {
      setLoading(true);

      const [docRes, versionsRes, commentsRes] = await Promise.all([
        supabase
          .from('documents')
          .select(`
            *,
            client:profiles!documents_client_id_fkey (
              id, full_name, avatar_initials
            )
          `)
          .eq('id', id)
          .single(),

        supabase
          .from('document_versions')
          .select('*')
          .eq('document_id', id)
          .order('version', { ascending: false }),

        supabase
          .from('comments')
          .select(`
            *,
            author:profiles!comments_author_id_fkey (
              full_name, avatar_initials, role
            )
          `)
          .eq('document_id', id)
          .order('created_at', { ascending: true }),
      ]);

      if (docRes.data) {
        setDoc(docRes.data);
        const c = docRes.data.content ?? '';
        setContent(c);
        setWordCount(c.trim().split(/\s+/).filter(Boolean).length);
      }
      setVersions(versionsRes.data ?? []);
      setComments(commentsRes.data ?? []);
      setLoading(false);
    };

    if (id) fetchDoc();
  }, [id]);

  // Auto-save every 30 seconds when content changes
  const handleContentChange = (val: string) => {
    setContent(val);
    setWordCount(val.trim().split(/\s+/).filter(Boolean).length);
    setSaveState('idle');

    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => autoSave(val), 30000);
  };

  const autoSave = async (val: string) => {
    setSaveState('saving');
    await supabase
      .from('documents')
      .update({ content: val, updated_at: new Date().toISOString() })
      .eq('id', id);
    setSaveState('saved');
    setTimeout(() => setSaveState('idle'), 3000);
  };

  const saveNow = () => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSave(content);
  };

  // Approve document
  const handleApprove = async () => {
    // Save a version snapshot first
    await supabase.from('document_versions').insert({
      document_id: id,
      version: (doc?.version ?? 1) + 1,
      content,
      changed_by: user!.id,
      change_note: 'Approved by lawyer',
    });

    // Update document status
    await supabase
      .from('documents')
      .update({
        status: 'finalized',
        content,
        version: (doc?.version ?? 1) + 1,
      })
      .eq('id', id);

    // Notify client
    if (doc?.client_id) {
      await supabase.from('notifications').insert({
        user_id: doc.client_id,
        type: 'finalized',
        message: `Your document "${doc.title}" has been approved and finalized.`,
        link: `/client/documents/${id}`,
      });
    }

    navigate('/lawyer/queue');
  };

  // Request revision
  const handleRequestRevision = async () => {
    await supabase
      .from('documents')
      .update({ status: 'revision_needed' })
      .eq('id', id);

    if (doc?.client_id) {
      await supabase.from('notifications').insert({
        user_id: doc.client_id,
        type: 'revision_needed',
        message: `"${doc.title}" requires revision. Check the lawyer's comments.`,
        link: `/client/documents/${id}`,
      });
    }

    navigate('/lawyer/queue');
  };

  // Add comment
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const { data } = await supabase
      .from('comments')
      .insert({
        document_id: id,
        author_id: user!.id,
        content: newComment.trim(),
      })
      .select(`
        *,
        author:profiles!comments_author_id_fkey (
          full_name, avatar_initials, role
        )
      `)
      .single();

    if (data) setComments(prev => [...prev, data]);
    setNewComment('');
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-10 bg-gray-100 dark:bg-slate-850 rounded-xl animate-pulse w-1/3" />
        <div className="h-[calc(100vh-140px)] bg-gray-100 dark:bg-slate-850 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!doc) {
    return (
      <div className="p-6 text-center text-muted-text dark:text-slate-400 font-sans">
        Document not found.{' '}
        <button className="text-blue-brand dark:text-blue-400 underline" onClick={() => navigate('/lawyer/queue')}>
          Back to queue
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 pb-0">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h1 className="font-serif text-lg font-bold text-dark-text dark:text-slate-100">{doc.title}</h1>
          <p className="text-xs text-muted-text dark:text-slate-400 font-sans">
            Client: {doc.client?.full_name} • v{doc.version} • {doc.type}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Save state */}
          <span className={`text-xs font-sans flex items-center gap-1 ${
            saveState === 'saving' ? 'text-amber-500' :
            saveState === 'saved' ? 'text-success' : 'text-muted-text'
          }`}>
            {saveState === 'saving' && (
              <><span className="w-3 h-3 border border-amber-500 border-t-transparent
                rounded-full animate-spin" />Saving…</>
            )}
            {saveState === 'saved' && <><Check size={12} />Saved</>}
          </span>
          <button
            onClick={saveNow}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border dark:border-slate-600
              rounded-lg text-xs font-semibold text-muted-text dark:text-slate-400 hover:bg-surface-gray dark:hover:bg-slate-700
              font-sans transition-colors"
          >
            <Save size={12} /> Save
          </button>
          <button
            onClick={handleRequestRevision}
            className="px-3 py-1.5 border border-border dark:border-slate-600 rounded-lg text-xs font-semibold
              text-muted-text dark:text-slate-400 hover:bg-surface-gray dark:hover:bg-slate-700 font-sans transition-colors"
          >
            ↩ Revision
          </button>
          <button
            onClick={handleApprove}
            className="flex items-center gap-1.5 px-4 py-1.5 bg-success text-white
              rounded-lg text-xs font-semibold font-sans hover:opacity-90 transition-opacity"
          >
            <ThumbsUp size={12} /> Approve
          </button>
        </div>
      </div>

      {/* 3-Panel Editor */}
      <div className="grid grid-cols-[200px_1fr_260px] h-[calc(100vh-130px)]
        border border-border dark:border-slate-700 rounded-2xl overflow-hidden">

        {/* Left: Info + Versions */}
        <div className="bg-surface-gray dark:bg-slate-900 border-r border-border dark:border-slate-700 overflow-y-auto p-4">
          <p className="text-xs font-bold text-muted-text dark:text-slate-400 uppercase tracking-wider
            font-sans mb-3">Document Info</p>
          {[
            ['Type', doc.type],
            ['Status', doc.status.replace(/_/g, ' ')],
            ['District', doc.district ?? '—'],
            ['FIR No.', doc.fir_number ?? '—'],
            ['Version', `v${doc.version}`],
            ['Submitted', new Date(doc.created_at).toLocaleDateString('en-IN')],
          ].map(([k, v]) => (
            <div key={k as string}
              className="flex justify-between py-2 border-b border-border/40 dark:border-slate-700/40 text-xs font-sans">
              <span className="text-muted-text dark:text-slate-400">{k}</span>
              <span className="font-semibold text-dark-text dark:text-slate-200 capitalize">{v}</span>
            </div>
          ))}

          {/* Version History */}
          {versions.length > 0 && (
            <>
              <p className="text-xs font-bold text-muted-text dark:text-slate-400 uppercase tracking-wider
                font-sans mt-4 mb-3">Version History</p>
              {versions.map(v => (
                <div key={v.id}
                  className="p-2 rounded-lg border border-border dark:border-slate-700 bg-white dark:bg-slate-800 mb-2 text-xs font-sans">
                  <div className="font-semibold text-dark-text dark:text-slate-100">v{v.version}</div>
                  <div className="text-muted-text dark:text-slate-400 mt-0.5">{v.change_note}</div>
                  <div className="text-muted-text/60 dark:text-slate-500 text-xs mt-0.5">
                    {new Date(v.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {/* Center: Editor */}
        <div className="flex flex-col overflow-hidden bg-white dark:bg-slate-850">
          {/* Toolbar */}
          <div className="border-b border-border dark:border-slate-700 px-4 py-2 flex gap-1.5 flex-wrap items-center">
            {['B', 'I', 'U', 'H1', 'H2', '•', '1.'].map(b => (
              <button key={b}
                className="px-2 py-1 border border-border dark:border-slate-700 rounded text-xs font-bold
                  font-sans hover:bg-light-blue dark:hover:bg-slate-800 text-dark-text dark:text-slate-300 transition-colors">
                {b}
              </button>
            ))}
            <div className="w-px h-4 bg-border dark:bg-slate-700 mx-1" />
            <span className="ml-auto text-xs text-muted-text dark:text-slate-400 font-sans">
              Track Changes: ON
            </span>
          </div>

          {/* Text Area */}
          <textarea
            value={content}
            onChange={e => handleContentChange(e.target.value)}
            className="flex-1 p-5 text-sm text-dark-text dark:text-slate-150 leading-relaxed resize-none
              focus:outline-none font-mono bg-white dark:bg-slate-900"
            placeholder="Document content will appear here…"
            spellCheck={false}
          />

          {/* Footer */}
          <div className="border-t border-border dark:border-slate-700 px-4 py-2 flex items-center gap-4
            bg-surface-gray/50 dark:bg-slate-900/50">
            <span className="text-xs text-muted-text dark:text-slate-400 font-sans">
              {wordCount} words
            </span>
            <span className="text-xs text-muted-text dark:text-slate-400 font-sans">
              ~{Math.max(1, Math.ceil(wordCount / 200))} min read
            </span>
          </div>
        </div>

        {/* Right: AI Assistant */}
        <div className="border-l border-border dark:border-slate-700 flex flex-col overflow-hidden bg-surface-gray dark:bg-slate-900">
          {/* Tabs */}
          <div className="flex border-b border-border dark:border-slate-700 bg-white dark:bg-slate-850">
            {(['suggestions', 'precedents', 'comments'] as EditorTab[]).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-xs font-bold font-sans capitalize
                  border-b-2 transition-all ${
                  activeTab === tab
                    ? 'border-gold text-dark-text dark:text-gold'
                    : 'border-transparent text-muted-text dark:text-slate-400 hover:text-dark-text dark:hover:text-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto p-3">
            {/* Suggestions */}
            {activeTab === 'suggestions' && SUGGESTIONS.map((s, i) => (
              <div key={i}
                className="bg-white dark:bg-slate-850 rounded-xl border border-border dark:border-slate-700 p-3 mb-3">
                <p className="text-xs font-bold text-dark-text dark:text-slate-200 font-sans mb-1">
                  💡 {s.title}
                </p>
                <p className="text-xs text-muted-text dark:text-slate-400 font-sans leading-relaxed">
                  {s.body}
                </p>
                <button
                  onClick={() => {
                    setContent(prev => prev + '\n\n[SUGGESTED] ' + s.body);
                    setSaveState('idle');
                  }}
                  className="mt-2 text-xs text-blue-brand dark:text-blue-400 font-semibold font-sans
                    hover:underline"
                >
                  Insert into document →
                </button>
              </div>
            ))}

            {/* Precedents */}
            {activeTab === 'precedents' && (
              <div className="space-y-2">
                {[
                  {
                    title: 'State of Maharashtra v. Vijay Salaskar',
                    court: 'Bombay HC • 2019',
                    summary: 'Bail cannot be denied solely on severity of charges.'
                  },
                  {
                    title: 'Arnesh Kumar v. State of Bihar',
                    court: 'Supreme Court • 2014',
                    summary: 'Guidelines on arrest for offences punishable up to 7 years.'
                  },
                  {
                    title: 'Sanjay Chandra v. CBI',
                    court: 'Supreme Court • 2012',
                    summary: 'Bail is the rule, jail is the exception — personal liberty.'
                  },
                ].map((p, i) => (
                  <div key={i}
                    className="bg-white dark:bg-slate-850 rounded-xl border border-border dark:border-slate-700 p-3 cursor-pointer
                      hover:border-blue-brand dark:hover:border-blue-500 transition-colors">
                    <p className="text-xs font-bold text-dark-text dark:text-slate-200 font-sans">{p.title}</p>
                    <p className="text-xs text-blue-brand dark:text-blue-400 font-sans mt-0.5">{p.court}</p>
                    <p className="text-xs text-muted-text dark:text-slate-400 font-sans mt-1 leading-relaxed">
                      {p.summary}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Comments */}
            {activeTab === 'comments' && (
              <div className="flex flex-col h-full">
                <div className="flex-1 space-y-3 mb-3">
                  {comments.map(c => (
                    <div key={c.id}
                      className="bg-white dark:bg-slate-850 rounded-xl border border-border dark:border-slate-700 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-6 h-6 rounded-full bg-gold flex items-center
                          justify-center text-white text-xs font-bold flex-shrink-0">
                          {c.author?.avatar_initials ?? '?'}
                        </div>
                        <span className="text-xs font-bold text-dark-text dark:text-slate-200 font-sans">
                          {c.author?.full_name}
                        </span>
                        <span className="text-[10px] text-muted-text dark:text-slate-500 font-sans ml-auto">
                          {new Date(c.created_at).toLocaleDateString('en-IN')}
                        </span>
                      </div>
                      <p className="text-xs text-dark-text dark:text-slate-350 font-sans leading-relaxed">
                        {c.content}
                      </p>
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-xs text-muted-text dark:text-slate-400 font-sans text-center py-4">
                      No comments yet
                    </p>
                  )}
                </div>
                <div className="flex gap-2 pt-2 border-t border-border dark:border-slate-700">
                  <input
                    value={newComment}
                    onChange={e => setNewComment(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                    placeholder="Add a comment…"
                    className="flex-1 px-3 py-2 text-xs border border-border dark:border-slate-700 bg-white dark:bg-slate-800 text-dark-text dark:text-slate-200 rounded-xl
                      focus:outline-none focus:ring-2 focus:ring-blue-brand/20 font-sans"
                  />
                  <button
                    onClick={handleAddComment}
                    className="p-2 bg-navy text-white rounded-xl hover:bg-blue-brand
                      transition-colors"
                  >
                    <Send size={13} />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;
