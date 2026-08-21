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
  const [user, setUser] = useState<Profile | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedUser = localStorage.getItem('systemmk_current_user')
        if (savedUser) {
          const parsed = JSON.parse(savedUser)
          if (parsed && parsed.role) return parsed
        }
      } catch {}
    }
    return null
  })
  const [loading, setLoading] = useState(true)
  const [customAvatar, setCustomAvatarState] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        return localStorage.getItem('systemmk_user_avatar')
      } catch {}
    }
    return null
  })

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
    try {
      const savedUser = localStorage.getItem('systemmk_current_user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser)
        if (parsed && parsed.role) {
          setUser(parsed)
          setLoading(false)
          return
        }
      }
    } catch {}

    const profile = await getCurrentUser()
    if (profile) {
      setUser(profile)
    } else {
      // Default to guest/recorder if not found, never default to root admin
      setUser({
        id: 'guest',
        full_name: 'អ្នកប្រើប្រាស់',
        display_name: 'User',
        avatar_url: null,
        role: 'guest',
        is_active: true,
        phone: null,
        email: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
    setLoading(false)
  }

  useEffect(() => {
    loadUser()

    const handleStorageChange = () => {
      loadUser()
    }

    window.addEventListener('storage', handleStorageChange)

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        loadUser()
      } else {
        // If Supabase session is null, check if we have a valid custom local session
        try {
          const savedUser = localStorage.getItem('systemmk_current_user')
          if (savedUser) {
            const parsed = JSON.parse(savedUser)
            if (parsed && parsed.role) {
              setUser(parsed)
              setLoading(false)
              return
            }
          }
        } catch {}
        
        // If neither Supabase nor localStorage exists, only then set to null
        loadUser()
      }
    })

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      subscription.unsubscribe()
    }
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
