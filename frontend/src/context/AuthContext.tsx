import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { logoutUser } from '../lib/api'

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

function mapProfileFromRow(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id ?? ''),
    role: (row.role === 'lawyer' ? 'lawyer' : 'client') as 'client' | 'lawyer',
    full_name: (row.full_name as string) ?? null,
    email: (row.email as string) ?? null,
    phone: (row.phone as string) ?? null,
    city: (row.city as string) ?? null,
    avatar_initials: (row.avatar_initials as string) ?? null,
    bar_number: (row.bar_number as string) ?? null,
    specialization: (row.specialization as string) ?? null,
    rating: (row.rating as number) ?? null,
    is_onboarded: Boolean(row.is_onboarded ?? true),
    name: (row.full_name as string) || '',
    barCouncilNumber: (row.bar_number as string) || '',
  }
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setUser(mapProfileFromRow(data as Record<string, unknown>))
      setLoading(false)
      return
    }

    // Fallback when profiles row is missing — build from auth metadata
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (authUser && authUser.id === userId) {
      const meta = authUser.user_metadata || {}
      const role = (meta.role as 'client' | 'lawyer') || 'client'
      setUser({
        id: authUser.id,
        role,
        full_name: (meta.full_name as string) || null,
        email: authUser.email || null,
        phone: null,
        city: null,
        avatar_initials: null,
        bar_number: null,
        specialization: null,
        rating: null,
        is_onboarded: true,
        name: (meta.full_name as string) || '',
        barCouncilNumber: '',
      })
    } else {
      console.error('Error fetching profile:', error?.message)
      setUser(null)
    }
    setLoading(false)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          setLoading(true)
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
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: error?.message ?? null }
  }

  const signUp = async (
    email: string,
    password: string,
    role: 'client' | 'lawyer',
    fullName: string
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role, full_name: fullName },
      },
    })
    if (error) {
      return { error: error.message }
    }
    // If email confirmation is off, session is returned immediately
    if (data.session?.user) {
      await fetchProfile(data.session.user.id)
    }
    return { error: null }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    logoutUser()
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
