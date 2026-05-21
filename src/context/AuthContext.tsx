import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  role: 'client' | 'lawyer'
  full_name: string | null
  email: string | null
  phone: string | null
  city: string | null
  avatar_initials: string | null
  bar_number: string | null
  specialization: string | null
  rating: number | null
  is_onboarded: boolean
  
  // Compatibility mappings for existing code
  name: string
  barCouncilNumber: string
  cnic?: string
}

interface AuthContextType {
  user: Profile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (
    email: string,
    password: string,
    role: 'client' | 'lawyer',
    fullName: string
  ) => Promise<{ error: string | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | null>(null)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  // Fetch the profile row from public.profiles
  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching profile:', error.message)
      setUser(null)
    } else {
      const profileData = data as any
      setUser({
        ...profileData,
        name: profileData.full_name || '',
        barCouncilNumber: profileData.bar_number || '',
      } as Profile)
    }
    setLoading(false)
  }

  useEffect(() => {
    // ── MOCK MODE ──────────────────────────────────────────────────────────────
    // When REACT_APP_MOCK_MODE=true the app bypasses Supabase completely.
    // Role is picked from ?role=lawyer URL param (defaults to client).
    if (process.env.REACT_APP_MOCK_MODE === 'true') {
      const params = new URLSearchParams(window.location.search)
      const role = params.get('role') === 'lawyer' ? 'lawyer' : 'client'

      if (role === 'lawyer') {
        setUser({
          id: 'u2',
          role: 'lawyer',
          full_name: 'Adv. Rahul Vijay Joshi',
          email: 'rahul.joshi@legalchambers.in',
          phone: '+91-98234-56789',
          city: 'Pune',
          avatar_initials: 'RJ',
          bar_number: 'MH/4521/2017',
          specialization: 'Criminal Law, Property Law, Civil Litigation',
          rating: 4.8,
          is_onboarded: true,
          name: 'Adv. Rahul Vijay Joshi',
          barCouncilNumber: 'MH/4521/2017',
        })
      } else {
        setUser({
          id: 'u1',
          role: 'client',
          full_name: 'Priya Suresh Deshmukh',
          email: 'priya.deshmukh@gmail.com',
          phone: '+91-98765-43210',
          city: 'Pune',
          avatar_initials: 'PD',
          bar_number: null,
          specialization: null,
          rating: null,
          is_onboarded: true,
          name: 'Priya Suresh Deshmukh',
          barCouncilNumber: '',
          cnic: 'XXXX-XXXX-4321',
        })
      }
      setLoading(false)
      return
    }
    // ── END MOCK MODE ──────────────────────────────────────────────────────────

    // Check for an existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for login / logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          fetchProfile(session.user.id)
        } else {
          setUser(null)
          setLoading(false)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    if (process.env.REACT_APP_MOCK_MODE === 'true') return { error: null }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (
    email: string,
    password: string,
    role: 'client' | 'lawyer',
    fullName: string
  ) => {
    if (process.env.REACT_APP_MOCK_MODE === 'true') return { error: null }
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName }
      }
    })
    return { error: error?.message ?? null }
  }

  const signOut = async () => {
    if (process.env.REACT_APP_MOCK_MODE === 'true') return
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
