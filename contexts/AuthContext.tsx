'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Profile } from '@/lib/database.types'
import { getCurrentUser } from '@/lib/auth'

interface AuthContextType {
  user: Profile | null
  loading: boolean
  customAvatar: string | null
  setCustomAvatar: (url: string | null) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  customAvatar: null,
  setCustomAvatar: () => {},
  refreshUser: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [customAvatar, setCustomAvatarState] = useState<string | null>(null)

  // Load custom user profile avatar from localStorage
  useEffect(() => {
    try {
      const savedAvatar = localStorage.getItem('systemmk_user_avatar')
      if (savedAvatar) {
        setCustomAvatarState(savedAvatar)
      }
    } catch {}
  }, [])

  const setCustomAvatar = (url: string | null) => {
    setCustomAvatarState(url)
    try {
      if (url) {
        localStorage.setItem('systemmk_user_avatar', url)
      } else {
        localStorage.removeItem('systemmk_user_avatar')
      }
    } catch {}
  }

  async function loadUser() {
    const profile = await getCurrentUser()
    setUser(profile)
    setLoading(false)
  }

  useEffect(() => {
    loadUser()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUser()
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, customAvatar, setCustomAvatar, refreshUser: loadUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
