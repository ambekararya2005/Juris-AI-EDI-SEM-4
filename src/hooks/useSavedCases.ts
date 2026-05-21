import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';

export const useSavedCases = () => {
  const { user } = useAuth();
  const [savedCases, setSavedCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSaved = async () => {
      const { data } = await supabase
        .from('saved_cases')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });
      setSavedCases(data ?? []);
      setLoading(false);
    };
    if (user) fetchSaved();
  }, [user]);

  const saveCase = async (c: {
    case_title: string;
    court: string;
    year: number;
    citation: string;
    domain: string;
    summary: string;
  }) => {
    const { data } = await supabase
      .from('saved_cases')
      .insert({ ...c, user_id: user!.id })
      .select()
      .single();
    if (data) setSavedCases(prev => [data, ...prev]);
  };

  const unsaveCase = async (id: string) => {
    await supabase.from('saved_cases').delete().eq('id', id);
    setSavedCases(prev => prev.filter(c => c.id !== id));
  };

  const updateNotes = async (id: string, notes: string) => {
    await supabase.from('saved_cases').update({ notes }).eq('id', id);
    setSavedCases(prev =>
      prev.map(c => (c.id === id ? { ...c, notes } : c))
    );
  };

  const isSaved = (citation: string) =>
    savedCases.some(c => c.citation === citation);

  return { savedCases, loading, saveCase, unsaveCase, updateNotes, isSaved };
};
