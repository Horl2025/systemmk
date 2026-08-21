'use client'

import { supabase } from './supabase'
import { Profile } from './database.types'

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signOut() {
  try {
    localStorage.removeItem('systemmk_current_user')
  } catch {}
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function getCurrentUser(): Promise<Profile | null> {
  if (typeof window !== 'undefined') {
    try {
      const savedUser = localStorage.getItem('systemmk_current_user')
      if (savedUser) {
        const parsed = JSON.parse(savedUser)
        if (parsed && parsed.role) return parsed as Profile
      }
    } catch {}
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return null
  return data as Profile
}

export function canManageMonks(role: string): boolean {
  return ['chief_monk', 'admin', 'recorder'].includes(role)
}

export function canManageFinance(role: string): boolean {
  return ['chief_monk', 'admin', 'recorder'].includes(role)
}

export function canManageUsers(role: string): boolean {
  return ['chief_monk', 'admin'].includes(role)
}

export function canDeleteRecords(role: string): boolean {
  return ['chief_monk', 'admin'].includes(role)
}
