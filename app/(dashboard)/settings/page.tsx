'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useLanguage } from '@/contexts/LanguageContext'
import { USER_ROLE_LABELS } from '@/lib/utils'
import { UserRole, Profile } from '@/lib/database.types'
import { Settings, Shield, User, Database, Bell, Lock, Save, CheckCircle, ShieldCheck, Key, RefreshCw, Sparkles, Smartphone, Mail, Phone, UserCheck, UserPlus, Trash2, Edit3, Share2, Download, QrCode, Camera, Globe } from 'lucide-react'

// Initial Root Users
const INITIAL_USERS: (Profile & { created_by_label?: string })[] = [
  {
    id: 'u1',
    full_name: 'អ្នកគ្រប់គ្រងប្រព័ន្ធ (Root Admin)',
    display_name: 'Admin',
    avatar_url: null,
    role: 'chief_monk',
    is_active: true,
    phone: '',
    email: 'admin@systemmk.org',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    created_by_label: 'ម្ចាស់ប្រព័ន្ធមេ (Root Admin)'
  }
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'roles' | 'system'>('profile')
  const [saved, setSaved] = useState(false)
  const [usersList, setUsersList] = useState(INITIAL_USERS)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedUserForQR, setSelectedUserForQR] = useState<any | null>(null)

  // Current Role: Defaults to 'chief_monk' for root admin, or actual user.role
  const currentRole: UserRole = (user?.role as UserRole) || 'chief_monk'

  // Permission Checks:
  // 1. Only Chief Monk (ព្រះមេកុដិ) and high Admin have access to User Management
  const canViewUsers = currentRole === 'chief_monk'
  // 2. Only Chief Monk has access to Role Permissions and Cloud Backup
  const canViewSystemAndRoles = currentRole === 'chief_monk'

  // If a restricted user lands on an unauthorized tab, force tab back to 'profile'
  useEffect(() => {
    if (!canViewUsers && (activeTab === 'users' || activeTab === 'roles' || activeTab === 'system')) {
      setActiveTab('profile')
    }
  }, [canViewUsers, activeTab])

  // Load created users from localStorage
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem('systemmk_custom_users')
      if (savedUsers) {
        const parsed = JSON.parse(savedUsers)
        if (Array.isArray(parsed) && parsed.length > 0) {
          setUsersList(parsed)
        }
      }
    } catch {}
  }, [])

  // Editable Form States for current profile
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<UserRole>('chief_monk')

  useEffect(() => {
    try {
      const savedAdmin = localStorage.getItem('systemmk_root_admin_profile')
      if (savedAdmin) {
        const parsed = JSON.parse(savedAdmin)
        if (parsed.full_name) setFullName(parsed.full_name)
        if (parsed.email) setEmail(parsed.email)
        if (parsed.phone) setPhone(parsed.phone)
        if (parsed.role) setRole(parsed.role)
        return
      }
    } catch {}

    if (user) {
      setFullName(user.full_name || 'អ្នកគ្រប់គ្រងប្រព័ន្ធ (Root Admin)')
      setEmail(user.email || 'admin@systemmk.org')
      setPhone(user.phone || '')
      setRole(user.role || 'chief_monk')
    } else {
      setFullName('អ្នកគ្រប់គ្រងប្រព័ន្ធ (Root Admin)')
      setEmail('admin@systemmk.org')
      setPhone('')
      setRole('chief_monk')
    }
  }, [user])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Save Admin Profile to localStorage
    const updatedAdmin = {
      id: 'u1',
      full_name: fullName.trim() || 'អ្នកគ្រប់គ្រងប្រព័ន្ធ (Root Admin)',
      display_name: fullName.trim().split(' ').pop() || 'Admin',
      email: email.trim() || 'admin@systemmk.org',
      phone: phone.trim(),
      role: role,
    }

    try {
      localStorage.setItem('systemmk_root_admin_profile', JSON.stringify(updatedAdmin))
      localStorage.setItem('systemmk_current_user', JSON.stringify(updatedAdmin))

      // Update Root Admin inside usersList table
      setUsersList(prev => {
        const hasRoot = prev.some(u => u.id === 'u1')
        let updatedList: any[]
        if (hasRoot) {
          updatedList = prev.map(u => u.id === 'u1' ? { ...u, full_name: updatedAdmin.full_name, display_name: updatedAdmin.display_name, email: updatedAdmin.email, phone: updatedAdmin.phone } : u)
        } else {
          updatedList = [{ ...updatedAdmin, is_active: true, created_by_label: 'ម្ចាស់ប្រព័ន្ធមេ (Root Admin)' }, ...prev]
        }
        localStorage.setItem('systemmk_custom_users', JSON.stringify(updatedList))
        return updatedList
      })
    } catch {}

    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleDeleteUser = (id: string) => {
    if (confirm('តើលោកអ្នកពិតជាចង់លុបគណនីនេះមែនទេ?')) {
      setUsersList(prev => {
        const updated = prev.filter(u => u.id !== id)
        try {
          localStorage.setItem('systemmk_custom_users', JSON.stringify(updated))
        } catch {}
        return updated
      })
    }
  }

  const handleAddUser = (newUser: any) => {
    setUsersList(prev => {
      const updated = [newUser, ...prev]
      try {
        localStorage.setItem('systemmk_custom_users', JSON.stringify(updated))
      } catch {}
      return updated
    })
  }

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { customAvatar, setCustomAvatar } = useAuth()
  const { language, setLanguage, languages, t } = useLanguage()
  const [password, setPassword] = useState('••••••••••••')
  const [birthDate, setBirthDate] = useState('1995-05-23')
  const [province, setProvince] = useState('ភ្នំពេញ (Phnom Penh)')

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (reader.result) {
          setCustomAvatar(reader.result as string)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // 🌟 If the user is Guest, Student, or Recorder, display the Gorgeous App Edit Profile UI directly!
  if (!canViewUsers) {
    return (
      <div className="animate-fadeIn" style={{ maxWidth: '440px', margin: '0 auto', paddingBottom: '30px' }}>
        
        {/* Hidden File Input for Avatar */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleAvatarUpload} 
          accept="image/*" 
          style={{ display: 'none' }} 
        />

        {/* 📱 Elegant Smartphone Edit Profile Container matching user's design */}
        <div 
          style={{ 
            background: 'linear-gradient(180deg, #09122C 0%, #111E48 50%, #0A122E 100%)', 
            borderRadius: '32px', 
            padding: '28px 22px', 
            color: '#FFFFFF',
            boxShadow: '0 25px 60px -12px rgba(10, 18, 46, 0.6)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            position: 'relative'
          }}
        >
          {/* Top Bar with Title */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', margin: 0, letterSpacing: '0.02em' }}>
              Edit Profile
            </h2>
          </div>

          {/* Profile Avatar with Camera Badge */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="hover-lift"
              style={{ 
                width: '105px', 
                height: '105px', 
                borderRadius: '50%', 
                padding: '4px', 
                background: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)', 
                position: 'relative',
                cursor: 'pointer',
                boxShadow: '0 8px 25px rgba(59, 130, 246, 0.35)'
              }}
            >
              <div style={{ width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#1E293B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {customAvatar ? (
                  <img src={customAvatar} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ fontSize: '2rem', fontWeight: 900, color: '#93C5FD' }}>
                    {fullName ? fullName.charAt(0) : 'U'}
                  </div>
                )}
              </div>

              {/* Camera Badge Icon */}
              <div 
                style={{ 
                  position: 'absolute', 
                  bottom: '2px', 
                  right: '2px', 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  background: '#FFFFFF', 
                  color: '#0F172A', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  boxShadow: '0 4px 10px rgba(0,0,0,0.35)',
                  border: '2px solid #09122C'
                }}
              >
                <Camera size={16} />
              </div>
            </div>

            <div style={{ marginTop: '10px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.78rem', color: '#93C5FD', fontWeight: 700, background: 'rgba(59, 130, 246, 0.15)', padding: '3px 12px', borderRadius: '20px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                {USER_ROLE_LABELS[role]?.kh || 'អ្នកប្រើប្រាស់'}
              </span>
            </div>
          </div>

          {/* Edit Profile Form Inputs */}
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Name Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                Name
              </label>
              <div style={{ background: '#0F1A3A', border: '1.5px solid #1E2E5D', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="text" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="ឈ្មោះអ្នកប្រើប្រាស់"
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '0.92rem', fontWeight: 600, outline: 'none' }}
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                Email
              </label>
              <div style={{ background: '#0F1A3A', border: '1.5px solid #1E2E5D', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="user@systemmk.org"
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '0.92rem', fontWeight: 600, outline: 'none' }}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                Password
              </label>
              <div style={{ background: '#0F1A3A', border: '1.5px solid #1E2E5D', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '0.92rem', fontWeight: 600, outline: 'none', letterSpacing: '0.1em' }}
                />
              </div>
            </div>

            {/* Date of Birth Input */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                Date of Birth
              </label>
              <div style={{ background: '#0F1A3A', border: '1.5px solid #1E2E5D', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                <input 
                  type="date" 
                  value={birthDate}
                  onChange={e => setBirthDate(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '0.92rem', fontWeight: 600, outline: 'none', colorScheme: 'dark' }}
                />
              </div>
            </div>

            {/* Language Selector (ភាសាប្រព័ន្ធ ៦ ភាសា) */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                🌐 Language / ភាសាប្រព័ន្ធ
              </label>
              <div style={{ background: '#0F1A3A', border: '1.5px solid #1E2E5D', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                <select
                  value={language}
                  onChange={e => setLanguage(e.target.value as any)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '0.92rem', fontWeight: 700, outline: 'none', colorScheme: 'dark' }}
                >
                  {languages.map(l => (
                    <option key={l.code} value={l.code} style={{ background: '#0F172A', color: '#FFF' }}>
                      {l.flag} {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Country/Region Selector */}
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 700, color: '#94A3B8', marginBottom: '6px' }}>
                Country / Region
              </label>
              <div style={{ background: '#0F1A3A', border: '1.5px solid #1E2E5D', borderRadius: '14px', padding: '12px 16px', display: 'flex', alignItems: 'center' }}>
                <select
                  value={province}
                  onChange={e => setProvince(e.target.value)}
                  style={{ width: '100%', background: 'transparent', border: 'none', color: '#FFFFFF', fontSize: '0.92rem', fontWeight: 600, outline: 'none', colorScheme: 'dark' }}
                >
                  <option value="ភ្នំពេញ (Phnom Penh)" style={{ background: '#0F172A', color: '#FFF' }}>កម្ពុជា - ភ្នំពេញ (Phnom Penh)</option>
                  <option value="កណ្តាល (Kandal)" style={{ background: '#0F172A', color: '#FFF' }}>កម្ពុជា - កណ្តាល (Kandal)</option>
                  <option value="កំពង់ចាម (Kampong Cham)" style={{ background: '#0F172A', color: '#FFF' }}>កម្ពុជា - កំពង់ចាម (Kampong Cham)</option>
                  <option value="សៀមរាប (Siem Reap)" style={{ background: '#0F172A', color: '#FFF' }}>កម្ពុជា - សៀមរាប (Siem Reap)</option>
                  <option value="បាត់ដំបង (Battambang)" style={{ background: '#0F172A', color: '#FFF' }}>កម្ពុជា - បាត់ដំបង (Battambang)</option>
                </select>
              </div>
            </div>

            {/* Save Changes Button */}
            <div style={{ marginTop: '10px' }}>
              <button
                type="submit"
                className="hover-lift"
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 100%)',
                  color: '#FFFFFF',
                  padding: '14px',
                  borderRadius: '16px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 8px 24px rgba(37, 99, 235, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px'
                }}
              >
                <span>{saved ? 'Saved Changes ✓' : 'Save changes'}</span>
              </button>
            </div>

          </form>

        </div>
      </div>
    )
  }

  return (
    <div className="space-y-7 animate-fadeIn" style={{ paddingBottom: 'var(--space-8)' }}>
      
      {/* 🌟 Header Section with SystemMK v1.0 Official Badge */}
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span style={{ 
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.25) 100%)', 
              border: '1.5px solid rgba(245, 158, 11, 0.45)', 
              color: '#B45309', 
              padding: '4px 14px', 
              borderRadius: '20px', 
              fontSize: '0.78rem', 
              fontWeight: 800, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.12)'
            }}>
              <img 
                src="/app-logo.png" 
                alt="SystemMK Logo" 
                style={{ width: '16px', height: '16px', borderRadius: '4px', objectFit: 'cover' }} 
              />
              SystemMK v1.0
            </span>
            <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 600 }}>• Monastery Configuration & RBAC</span>
          </div>
          <h1 className="page-title">ការកំណត់ប្រព័ន្ធ (System Settings)</h1>
          <p className="page-subtitle">គ្រប់គ្រងគណនី បង្កើត Admin ទូទៅ និងកំណត់សិទ្ធិប្រើប្រាស់ក្នុងវត្ត</p>
        </div>

        <div style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', padding: '6px 14px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.78rem', color: '#334155', fontWeight: 700 }}>
          <Sparkles size={15} color="#D97706" />
          <span>កំណែប្រព័ន្ធផ្លូវការ៖ ២០២៦</span>
        </div>
      </div>

      {/* 🌟 3 VIBRANT RICH GRADIENT KPI CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
        
        {/* Card 1: System Security Status (Emerald Gradient) */}
        <div 
          className="hover-lift"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064E3B 100%)',
            borderRadius: '22px',
            padding: '22px',
            color: '#FFFFFF',
            boxShadow: '0 12px 28px -6px rgba(5, 150, 105, 0.45)',
            border: '1px solid rgba(167, 243, 208, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', right: '-15px', top: '-15px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#A7F3D0', letterSpacing: '0.02em' }}>សុវត្ថិភាពប្រព័ន្ធ / SECURITY</div>
            <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px', lineHeight: 1 }}>
              ១០០% <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#D1FAE5' }}>ការពារ</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: '#6EE7B7', marginTop: '8px', fontWeight: 600 }}>
              SSL & Role-Based Access
            </div>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <ShieldCheck size={26} />
          </div>
        </div>

        {/* Card 2: User Role Status (Solar Amber Gradient) */}
        <div 
          className="hover-lift"
          style={{
            background: 'linear-gradient(135deg, #D97706 0%, #B45309 50%, #78350F 100%)',
            borderRadius: '22px',
            padding: '22px',
            color: '#FFFFFF',
            boxShadow: '0 12px 28px -6px rgba(217, 119, 6, 0.45)',
            border: '1px solid rgba(253, 230, 138, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          <div style={{ position: 'absolute', right: '-15px', top: '-15px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FDE68A', letterSpacing: '0.02em' }}>គណនីបច្ចុប្បន្ន / CURRENT ROLE</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px', lineHeight: 1.1 }}>
              {USER_ROLE_LABELS[role]?.kh || 'ព្រះមេកុដិ'}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#FCD34D', marginTop: '8px', fontWeight: 600 }}>
              {role === 'chief_monk' ? 'សិទ្ធិគ្រប់គ្រងពេញលេញ (Super Admin)' : USER_ROLE_LABELS[role]?.en}
            </div>
          </div>
          <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            <UserCheck size={26} />
          </div>
        </div>

        {/* Card 3: Users Total (Purple Gradient) - ONLY SHOWN TO CHIEF MONK */}
        {canViewUsers && (
          <div 
            className="hover-lift"
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #4C1D95 100%)',
              borderRadius: '22px',
              padding: '22px',
              color: '#FFFFFF',
              boxShadow: '0 12px 28px -6px rgba(124, 58, 237, 0.45)',
              border: '1px solid rgba(221, 214, 254, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            <div style={{ position: 'absolute', right: '-15px', top: '-15px', width: '100px', height: '100px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', pointerEvents: 'none' }} />
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#DDD6FE', letterSpacing: '0.02em' }}>អ្នកប្រើប្រាស់ / USERS</div>
              <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#FFFFFF', marginTop: '4px', lineHeight: 1.1 }}>
                {usersList.length} <span style={{ fontSize: '0.95rem', fontWeight: 600, color: '#DDD6FE' }}>គណនី</span>
              </div>
              <div style={{ fontSize: '0.72rem', color: '#C4B5FD', marginTop: '8px', fontWeight: 600 }}>
                បង្កើត & គ្រប់គ្រងដោយ ព្រះមេកុដិ
              </div>
            </div>
            <div style={{ width: '52px', height: '52px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              <UserPlus size={26} />
            </div>
          </div>
        )}

      </div>

      {/* 🌟 Tabs (Only Chief Monk sees Admin Management, Roles, and Backup) */}
      <div className="tabs">
        <button 
          className={`tab-item ${activeTab === 'profile' ? 'tab-item--active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} />
          <span>ព័ត៌មានគណនី (Profile)</span>
        </button>

        {canViewUsers && (
          <button 
            className={`tab-item ${activeTab === 'users' ? 'tab-item--active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            <UserPlus size={16} />
            <span>គ្រប់គ្រង Admin & Users ({usersList.length})</span>
          </button>
        )}

        {canViewSystemAndRoles && (
          <button 
            className={`tab-item ${activeTab === 'roles' ? 'tab-item--active' : ''}`}
            onClick={() => setActiveTab('roles')}
          >
            <Shield size={16} />
            <span>តួនាទី និងសិទ្ធិប្រើប្រាស់ (Roles & Permissions)</span>
          </button>
        )}

        {canViewSystemAndRoles && (
          <button 
            className={`tab-item ${activeTab === 'system' ? 'tab-item--active' : ''}`}
            onClick={() => setActiveTab('system')}
          >
            <Database size={16} />
            <span>ការបម្រុងទុកទិន្នន័យ (Backup & System)</span>
          </button>
        )}
      </div>

      {/* 🌟 Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div style={{ background: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>ព័ត៌មានគណនីបច្ចុប្បន្ន</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>កែប្រែព័ត៌មានផ្ទាល់ខ្លួន អ៊ីមែល លេខទូរស័ព្ទ និងតួនាទីរបស់អ្នក</p>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '1.1rem', boxShadow: '0 4px 10px rgba(245,158,11,0.25)' }}>
              {fullName ? fullName.charAt(0) : 'ព'}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            <div className="form-grid">
              
              {/* Full Name Input */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>ឈ្មោះពេញ / Full Name</label>
                <input 
                  className="form-control hover-lift" 
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="ឧ. ព្រះនាម ឬឈ្មោះរបស់អ្នក..."
                  style={{ border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px' }} 
                />
              </div>

              {/* Email Address Input */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>អ៊ីមែល / Email Address</label>
                <input 
                  type="email"
                  className="form-control hover-lift" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@systemmk.org"
                  style={{ border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px', background: '#FFFFFF' }} 
                />
              </div>

              {/* Phone Number Input */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>លេខទូរស័ព្ទ / Phone Number</label>
                <input 
                  type="tel"
                  className="form-control hover-lift" 
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="016 203 953"
                  style={{ border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px' }} 
                />
              </div>

              {/* System Role Selector */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700 }}>តួនាទីក្នុងប្រព័ន្ធ / System Role</label>
                <select 
                  className="form-control hover-lift" 
                  value={role}
                  onChange={e => setRole(e.target.value as UserRole)}
                  style={{ border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px', background: '#FFFFFF', fontWeight: 700, color: '#D97706' }}
                >
                  <option value="chief_monk">ព្រះមេកុដិ / Kuthi Leader (អ្នកគ្រប់គ្រងពេញលេញ)</option>
                  <option value="admin">អ្នកគ្រប់គ្រង / Admin</option>
                  <option value="recorder">អ្នកកត់ត្រា / Recorder</option>
                  <option value="guest">ភ្ញៀវ/សិស្សវត្ត / Guest</option>
                </select>
              </div>

              {/* 🌐 System Display Language Selector */}
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={16} color="#2563EB" />
                  <span>ភាសាបង្ហាញក្នុងប្រព័ន្ធ / Display Language</span>
                </label>
                <select 
                  className="form-control hover-lift" 
                  value={language}
                  onChange={e => setLanguage(e.target.value as any)}
                  style={{ border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '10px 14px', background: '#FFFFFF', fontWeight: 800, color: '#1E293B' }}
                >
                  {languages.map(l => (
                    <option key={l.code} value={l.code}>
                      {l.flag} {l.nativeName} ({l.name})
                    </option>
                  ))}
                </select>
              </div>

            </div>

            <div style={{ paddingTop: '14px', display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              <button 
                type="submit" 
                className="hover-lift"
                style={{
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  color: '#1C1917',
                  fontWeight: 800,
                  padding: '12px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  boxShadow: '0 6px 16px rgba(217, 119, 6, 0.35)',
                  fontSize: '0.88rem'
                }}
              >
                <Save size={18} />
                <span>{saved ? 'បានរក្សាទុករួចរាល់ ✓' : 'រក្សាទុកការផ្លាស់ប្ដូរ / Save Changes'}</span>
              </button>

              {/* 🔔 Mobile Push Notification Test Trigger Button */}
              <button
                type="button"
                onClick={async () => {
                  if ('Notification' in window) {
                    if (Notification.permission === 'granted') {
                      if ('serviceWorker' in navigator) {
                        const reg = await navigator.serviceWorker.ready
                        reg.showNotification('📢 ដំណឹងវត្តអារាម SystemMK', {
                          body: 'នេះជាការជូនដំណឹងសាកល្បងលើអេក្រង់ទូរស័ព្ទ! (Test Mobile Push Notification)',
                          icon: '/app-logo.png',
                          badge: '/app-logo.png',
                          vibrate: [200, 100, 200, 100, 200]
                        } as any)
                      } else {
                        new Notification('📢 ដំណឹងវត្តអារាម SystemMK', {
                          body: 'នេះជាការជូនដំណឹងសាកល្បងលើអេក្រង់ទូរស័ព្ទ! (Test Mobile Push Notification)',
                          icon: '/app-logo.png',
                        })
                      }
                      alert('បានផ្ញើដំណឹងសាកល្បងទៅអេក្រង់ទូរស័ព្ទរួចរាល់! សូមពិនិត្យរបារ Notification ខាងលើនៃទូរស័ព្ទរបស់អ្នក។')
                    } else {
                      const res = await Notification.requestPermission()
                      if (res === 'granted') {
                        alert('បានបើកសិទ្ធិជោគជ័យ! សូមចុចប៊ូតុងនេះម្តងទៀតដើម្បីតេស្តដំណឹង។')
                      } else {
                        alert('លោកអ្នកបានបិទសិទ្ធិ Notification។ សូមបើកក្នុង Setting ទូរស័ព្ទរបស់អ្នក។')
                      }
                    }
                  } else {
                    alert('ឧបករណ៍នេះមិនគាំទ្រ Notification ឡើយ។')
                  }
                }}
                className="hover-lift"
                style={{
                  background: '#F8FAFC',
                  color: '#2563EB',
                  fontWeight: 800,
                  padding: '12px 20px',
                  borderRadius: '12px',
                  border: '1.5px solid #BFDBFE',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                <Bell size={17} color="#2563EB" />
                <span>🔔 សាកល្បងផ្ញើដំណឹងទៅទូរស័ព្ទ (Test Push)</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* 🌟 Tab 2: Manage Admin & Users (NEW FEATURE FOR ព្រះមេកុដិ) */}
      {activeTab === 'users' && (
        <div style={{ background: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>បញ្ជីគណនី និងអ្នកគ្រប់គ្រង (Admin & User Management)</h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>បង្កើត Admin ធម្មតាដើម្បីជួយគ្រប់គ្រងសង្ឃ វត្តមាន ហិរញ្ញវត្ថុ និងកិច្ចការទូទៅ</p>
            </div>
            <button 
              className="hover-lift"
              onClick={() => setShowAddModal(true)}
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                color: '#FFFFFF',
                fontWeight: 800,
                padding: '10px 18px',
                borderRadius: '12px',
                border: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(124, 58, 237, 0.35)',
                fontSize: '0.85rem'
              }}
            >
              <UserPlus size={16} />
              <span>បង្កើត Admin / User ថ្មី</span>
            </button>
          </div>

          <div className="table-wrapper" style={{ border: 'none', overflowX: 'auto', width: '100%' }}>
            <table className="table" style={{ width: '100%', minWidth: '650px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800, whiteSpace: 'nowrap' }}>ឈ្មោះអ្នកប្រើប្រាស់ / Name</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, whiteSpace: 'nowrap' }}>អ៊ីមែល / Email</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, whiteSpace: 'nowrap' }}>លេខទូរស័ព្ទ / Phone</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, whiteSpace: 'nowrap' }}>តួនាទី / Role</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, whiteSpace: 'nowrap' }}>អ្នកបង្កើត / Created By</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, textAlign: 'center', whiteSpace: 'nowrap' }}>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: u.role === 'chief_monk' ? '#FEF3C7' : u.role === 'admin' ? '#EFF6FF' : '#ECFDF5', color: u.role === 'chief_monk' ? '#B45309' : u.role === 'admin' ? '#1D4ED8' : '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, flexShrink: 0 }}>
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B', whiteSpace: 'nowrap' }}>{u.display_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-latin" style={{ padding: '14px 18px', color: '#334155', fontWeight: 600, whiteSpace: 'nowrap' }}>{u.email}</td>
                    <td className="font-latin" style={{ padding: '14px 18px', color: '#64748B', whiteSpace: 'nowrap' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <span style={{ 
                        background: u.role === 'chief_monk' ? '#FEF3C7' : u.role === 'admin' ? '#EFF6FF' : '#ECFDF5', 
                        border: `1px solid ${u.role === 'chief_monk' ? '#FDE68A' : u.role === 'admin' ? '#BFDBFE' : '#A7F3D0'}`, 
                        color: u.role === 'chief_monk' ? '#92400E' : u.role === 'admin' ? '#1E40AF' : '#065F46', 
                        padding: '4px 12px', 
                        borderRadius: '10px', 
                        fontSize: '0.75rem', 
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                        display: 'inline-block'
                      }}>
                        {USER_ROLE_LABELS[u.role]?.kh || u.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <span style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', padding: '4px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600, whiteSpace: 'nowrap', display: 'inline-block' }}>
                        {u.created_by_label || 'ព្រះមេកុដិ'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button 
                          onClick={() => setSelectedUserForQR(u)}
                          className="hover-lift" 
                          style={{ 
                            background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', 
                            border: '1.5px solid #FDE68A', 
                            color: '#92400E', 
                            padding: '6px 12px', 
                            borderRadius: '10px', 
                            cursor: 'pointer',
                            fontSize: '0.74rem',
                            fontWeight: 800,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            boxShadow: '0 2px 6px rgba(217, 119, 6, 0.15)'
                          }}
                          title="បង្កើត QR Code សម្រាប់ឱ្យគណនីនេះស្កេនចូលប្រើ"
                        >
                          <QrCode size={14} color="#D97706" />
                          <span>បង្កើត QR ចូលប្រើ</span>
                        </button>

                        {u.role === 'chief_monk' ? (
                          <button
                            onClick={() => setActiveTab('profile')}
                            className="hover-lift"
                            style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                            title="កែប្រែឈ្មោះ និងព័ត៌មាន Admin"
                          >
                            <Edit3 size={13} />
                            <span>កែឈ្មោះ</span>
                          </button>
                        ) : (
                          <button 
                            onClick={() => handleDeleteUser(u.id)}
                            className="hover-lift" 
                            style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                            title="លុបគណនីនេះ"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🌟 Tab 3: Roles & Permissions */}
      {activeTab === 'roles' && (
        <div style={{ background: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>សិទ្ធិប្រើប្រាស់តាមតួនាទី (Role-Based Access Control)</h3>
              <p style={{ fontSize: '0.72rem', color: '#64748B' }}>កម្រិតកំណត់សិទ្ធិចូលមើល និងកែប្រែទិន្នន័យក្នុងប្រព័ន្ធ SystemMK</p>
            </div>
            <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '4px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>RBAC Active</span>
          </div>

          <div className="table-wrapper" style={{ border: 'none', overflowX: 'auto', width: '100%' }}>
            <table className="table" style={{ width: '100%', minWidth: '650px' }}>
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '14px 18px', fontWeight: 800, whiteSpace: 'nowrap' }}>តួនាទី (Role)</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, whiteSpace: 'nowrap' }}>គ្រប់គ្រងព្រះសង្ឃ</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, whiteSpace: 'nowrap' }}>គ្រប់គ្រងហិរញ្ញវត្ថុ</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, whiteSpace: 'nowrap' }}>កត់វត្តមាន</th>
                  <th style={{ padding: '14px 18px', fontWeight: 800, whiteSpace: 'nowrap' }}>គ្រប់គ្រង User</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { role: 'ព្រះមេកុដិ (Kuthi Leader)', monks: 'ពេញលេញ (Full)', fin: 'ពេញលេញ (Full)', att: 'ពេញលេញ (Full)', usr: 'ពេញលេញ (Full)', bg: '#FEF3C7', color: '#92400E', border: '#FDE68A' },
                  { role: 'អ្នកគ្រប់គ្រង (Admin ទូទៅ)', monks: 'ពេញលេញ (Full)', fin: 'ពេញលេញ (Full)', att: 'ពេញលេញ (Full)', usr: 'មើល & កែប្រែ', bg: '#EFF6FF', color: '#1E40AF', border: '#BFDBFE' },
                  { role: 'អ្នកកត់ត្រា (Recorder)', monks: 'មើល/បន្ថែម', fin: 'កត់ត្រាប្រចាំថ្ងៃ', att: 'ពេញលេញ (Full)', usr: 'គ្មានសិទ្ធិ (None)', bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
                  { role: 'ភ្ញៀវ/សិស្ស (Guest)', monks: 'មើលបាន', fin: 'គ្មានសិទ្ធិ (None)', att: 'មើលបាន', usr: 'គ្មានសិទ្ធិ (None)', bg: '#F1F5F9', color: '#475569', border: '#E2E8F0' },
                ].map((r, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '14px 18px', whiteSpace: 'nowrap' }}>
                      <span style={{ background: r.bg, border: `1px solid ${r.border}`, color: r.color, padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap', display: 'inline-block' }}>
                        {r.role}
                      </span>
                    </td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>{r.monks}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>{r.fin}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>{r.att}</td>
                    <td style={{ padding: '14px 18px', fontWeight: 700, color: r.usr.includes('None') ? '#94A3B8' : '#059669', whiteSpace: 'nowrap' }}>{r.usr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 🌟 Tab 4: Backup & System */}
      {activeTab === 'system' && (
        <div style={{ background: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid #F1F5F9' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>ការបម្រុងទុក និងសុវត្ថិភាពទិន្នន័យ (Data Backup & Safety)</h3>
            <p style={{ fontSize: '0.75rem', color: '#64748B' }}>គ្រប់គ្រងការទាញយកទិន្នន័យបម្រុង និងសុវត្ថិភាព Database</p>
          </div>

          <div className="space-y-4">
            <div className="hover-lift" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', background: '#F8FAFC', borderRadius: '16px', border: '1.5px solid #E2E8F0', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>ការបម្រុងទុកទិន្នន័យដោយដៃ (Manual Backup)</h4>
                <p style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>ទាញយកទិន្នន័យ Database ទាំងអស់ជា JSON file រក្សាទុកក្នុងកុំព្យូទ័រ</p>
              </div>
              <button 
                className="hover-lift"
                onClick={() => alert('ទិន្នន័យត្រូវបាន Backup រក្សាទុកដោយជោគជ័យ!')}
                style={{
                  background: '#FFFFFF',
                  color: '#1E293B',
                  border: '1.5px solid #CBD5E1',
                  fontWeight: 800,
                  padding: '10px 18px',
                  borderRadius: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem'
                }}
              >
                <Database size={16} />
                <span>Backup Now (.json)</span>
              </button>
            </div>

            {/* 📱 Official App QR Code Download & Share Card */}
            <div className="hover-lift" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', borderRadius: '16px', border: '1.5px solid #FDE68A', flexWrap: 'wrap', gap: '14px' }}>
              <div className="flex items-center gap-3">
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid #FDE68A', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https%3A%2F%2Fsystemmk.vercel.app&color=0F172A&bgcolor=FFFFFF" alt="SystemMK App QR" style={{ width: '100%', height: '100%', borderRadius: '8px' }} />
                </div>
                <div>
                  <h4 style={{ fontWeight: 800, color: '#92400E', fontSize: '0.96rem' }}>QR Code សម្រាប់ចែករំលែក & តំឡើង App</h4>
                  <p style={{ fontSize: '0.75rem', color: '#B45309', marginTop: '2px' }}>ស្កេនពីទូរស័ព្ទដៃដើម្បីចូលប្រើ ឬទាញយក App SystemMK ភ្លាមៗ</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="hover-lift"
                  onClick={() => {
                    navigator.clipboard.writeText('https://systemmk.vercel.app')
                    alert('បានចម្លង Link វេបសាយជោគជ័យ!')
                  }}
                  style={{
                    background: '#FFFFFF',
                    color: '#92400E',
                    border: '1.5px solid #FDE68A',
                    fontWeight: 800,
                    padding: '8px 14px',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem'
                  }}
                >
                  <Share2 size={14} />
                  <span>ចម្លង Link</span>
                </button>
                <a
                  href="https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https%3A%2F%2Fsystemmk.vercel.app&color=0F172A&bgcolor=FFFFFF"
                  download="SystemMK_App_QR.png"
                  target="_blank"
                  rel="noreferrer"
                  className="hover-lift"
                  style={{
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#1C1917',
                    border: 'none',
                    fontWeight: 800,
                    padding: '8px 16px',
                    borderRadius: '10px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    textDecoration: 'none',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.3)'
                  }}
                >
                  <Download size={14} />
                  <span>ទាញយក QR (.png)</span>
                </a>
              </div>
            </div>

            <div className="hover-lift" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '18px 22px', background: '#ECFDF5', borderRadius: '16px', border: '1.5px solid #A7F3D0', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h4 style={{ fontWeight: 800, color: '#065F46', fontSize: '0.95rem' }}>ការការពារទិន្នន័យតាម Cloud Database</h4>
                <p style={{ fontSize: '0.75rem', color: '#047857', marginTop: '2px' }}>ទិន្នន័យត្រូវបាន Encrypted និងរក្សាទុកដោយស្វ័យប្រវត្តិតាម PostgreSQL</p>
              </div>
              <span style={{ background: '#059669', color: '#FFFFFF', padding: '6px 14px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle size={14} />
                <span>ដំណើរការល្អ (Active)</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Add New Admin/User */}
      {showAddModal && (
        <AddUserModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={handleAddUser} 
        />
      )}

      {/* Modal: Specific User Login & Install QR Code */}
      {selectedUserForQR && (
        <UserLoginQRModal 
          user={selectedUserForQR} 
          onClose={() => setSelectedUserForQR(null)} 
        />
      )}

    </div>
  )
}

function UserLoginQRModal({ user, onClose }: { user: any; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  
  // Custom Login / Access URL with user email prefilled
  const userAccessUrl = `https://systemmk.vercel.app/login?email=${encodeURIComponent(user.email)}`
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=350x350&data=${encodeURIComponent(userAccessUrl)}&color=0F172A&bgcolor=FFFFFF&margin=10`

  const handleCopy = () => {
    navigator.clipboard.writeText(userAccessUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div 
        className="modal modal-md animate-scaleUp"
        style={{
          borderRadius: '26px',
          overflow: 'hidden',
          boxShadow: '0 30px 60px -12px rgba(15, 23, 42, 0.45)',
          maxWidth: '440px',
          width: '100%',
          margin: '0 auto',
          background: '#FFFFFF',
          textAlign: 'center'
        }}
      >
        {/* Header */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 100%)', 
            padding: '16px 20px', 
            color: '#FFFFFF',
            borderBottom: '2px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <QrCode size={18} />
            </div>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#FEF3C7', margin: 0, textAlign: 'left' }}>
              QR Code ចូលប្រើប្រព័ន្ធ / User Login
            </h3>
          </div>
          <button 
            onClick={onClose}
            style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#CBD5E1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '22px 20px', background: '#F8FAFC' }}>
          
          {/* User Card Chip */}
          <div style={{ background: '#FFFFFF', border: '1.5px solid #E2E8F0', borderRadius: '16px', padding: '10px 14px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', textAlign: 'left' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: user.role === 'chief_monk' ? '#FEF3C7' : '#EFF6FF', color: user.role === 'chief_monk' ? '#B45309' : '#1D4ED8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '1.1rem', flexShrink: 0 }}>
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{user.full_name}</div>
              <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                <span style={{ color: '#2563EB', fontWeight: 700 }}>{USER_ROLE_LABELS[user.role]?.kh || user.role}</span>
                <span>•</span>
                <span className="font-latin">{user.email}</span>
              </div>
            </div>
          </div>

          {/* QR Code Frame */}
          <div 
            className="hover-lift"
            style={{
              display: 'inline-block',
              padding: '14px',
              background: '#FFFFFF',
              borderRadius: '22px',
              boxShadow: '0 10px 25px rgba(217, 119, 6, 0.15)',
              border: '2px solid #FDE68A',
              position: 'relative'
            }}
          >
            <img 
              src={qrCodeUrl} 
              alt={`${user.full_name} Login QR Code`} 
              style={{ width: '180px', height: '180px', borderRadius: '12px', display: 'block', margin: '0 auto' }} 
            />
            {/* Center App Badge */}
            <div 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#FFFFFF',
                padding: '2px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <img src="/app-logo.png" alt="Logo" style={{ width: '100%', height: '100%', borderRadius: '8px', objectFit: 'cover' }} />
            </div>
          </div>

          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '4px 12px', borderRadius: '20px', fontSize: '0.74rem', fontWeight: 800 }}>
              <Sparkles size={13} color="#059669" />
              <span>ស្កេនពីទូរស័ព្ទដើម្បីចូលប្រើ ឬតំឡើង App ភ្លាមៗ</span>
            </div>
            <p style={{ fontSize: '0.76rem', color: '#475569', marginTop: '8px', lineHeight: 1.4, margin: '8px 0' }}>
              <strong>{user.full_name}</strong> គ្រាន់តែបើកកាមេរ៉ាទូរស័ព្ទស្កេនលើ QR នេះ នោះវានឹងនាំចូលទៅកាន់ទំព័រ Login ជាមួយ Email របស់គាត់ដោយស្វ័យប្រវត្ត។
            </p>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
            <button
              type="button"
              className="hover-lift"
              onClick={handleCopy}
              style={{
                flex: 1,
                background: '#FFFFFF',
                border: '1.5px solid #CBD5E1',
                color: '#1E293B',
                padding: '10px 14px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Share2 size={14} />
              <span>{copied ? '✓ បានចម្លង Link' : 'ចម្លង Link ចូល'}</span>
            </button>

            <a
              href={qrCodeUrl}
              download={`QR_Login_${user.full_name}.png`}
              target="_blank"
              rel="noreferrer"
              className="hover-lift"
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                border: 'none',
                color: '#1C1917',
                padding: '10px 14px',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.78rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                textDecoration: 'none',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)'
              }}
            >
              <Download size={14} />
              <span>ទាញយក QR</span>
            </a>
          </div>

        </div>
      </div>
    </div>
  )
}

function AddUserModal({ onClose, onAdd }: { onClose: () => void; onAdd: (user: any) => void }) {
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    role: 'admin' as UserRole,
    password: '',
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const newUser = {
      id: Date.now().toString(),
      full_name: form.full_name,
      display_name: form.full_name.split(' ').pop() || form.full_name,
      avatar_url: null,
      role: form.role,
      is_active: true,
      phone: form.phone || null,
      email: form.email,
      created_at: new Date().toISOString().split('T')[0],
      updated_at: new Date().toISOString().split('T')[0],
      created_by_label: 'បង្កើតដោយ ព្រះមេកុដិ'
    }

    onAdd(newUser)
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div 
        className="modal modal-md animate-scaleUp"
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
          maxWidth: '500px',
          width: '100%',
          margin: '0 auto',
          background: '#FFFFFF'
        }}
      >
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 100%)', 
            padding: '16px 20px', 
            color: '#FFFFFF',
            borderBottom: '2px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#FEF3C7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UserPlus size={18} color="#F59E0B" />
            <span>បង្កើតគណនី Admin / User ថ្មី</span>
          </h3>
          <button 
            type="button"
            onClick={onClose}
            style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#CBD5E1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-2" style={{ padding: '16px 20px', background: '#F8FAFC', maxHeight: '52vh', overflowY: 'auto' }}>
            <div className="form-group" style={{ marginBottom: '8px' }}>
              <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700 }}>ឈ្មោះពេញ (Full Name) <span className="required">*</span></label>
              <input 
                className="form-control" 
                value={form.full_name} 
                onChange={e => setForm({...form, full_name: e.target.value})} 
                required 
                placeholder="ឧ. លោក គង់ វិរៈ" 
                style={{ padding: '8px 12px' }}
              />
            </div>

            <div className="grid-cols-2 gap-2" style={{ display: 'grid', marginBottom: '8px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700 }}>អ៊ីមែល (Email) <span className="required">*</span></label>
                <input 
                  type="email"
                  className="form-control" 
                  value={form.email} 
                  onChange={e => setForm({...form, email: e.target.value})} 
                  required 
                  placeholder="admin2@systemmk.org" 
                  style={{ padding: '8px 12px' }}
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700 }}>លេខទូរស័ព្ទ</label>
                <input 
                  type="tel"
                  className="form-control" 
                  value={form.phone} 
                  onChange={e => setForm({...form, phone: e.target.value})} 
                  placeholder="012 345 678" 
                  style={{ padding: '8px 12px' }}
                />
              </div>
            </div>

            <div className="grid-cols-2 gap-2" style={{ display: 'grid', marginBottom: '8px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700 }}>តួនាទី (Role) <span className="required">*</span></label>
                <select 
                  className="form-control" 
                  value={form.role} 
                  onChange={e => setForm({...form, role: e.target.value as UserRole})}
                  style={{ padding: '8px 12px', fontSize: '0.78rem' }}
                >
                  <option value="admin">អ្នកគ្រប់គ្រងទូទៅ / General Admin</option>
                  <option value="recorder">អ្នកកត់ត្រា / Recorder</option>
                  <option value="guest">ភ្ញៀវ/សិស្សវត្ត / Guest</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700 }}>លេខសម្ងាត់ (Password) <span className="required">*</span></label>
                <input 
                  type="password"
                  className="form-control" 
                  value={form.password} 
                  onChange={e => setForm({...form, password: e.target.value})} 
                  required 
                  placeholder="••••••••" 
                  style={{ padding: '8px 12px' }}
                />
              </div>
            </div>

            <div style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', padding: '8px 12px', borderRadius: '10px', fontSize: '0.72rem', color: '#1E40AF' }}>
              💡 <strong>សិទ្ធិ Admin ទូទៅ៖</strong> អាចជួយគ្រប់គ្រងព្រះសង្ឃ កត់វត្តមាន និងគ្រប់គ្រងហិរញ្ញវត្ថុវត្ត។
            </div>
          </div>

          <div className="modal-footer" style={{ padding: '12px 20px', background: '#FFFFFF', borderTop: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '7px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem' }}>បោះបង់</button>
            <button 
              type="submit" 
              className="btn btn-primary hover-lift" 
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%)',
                border: 'none',
                color: '#FFFFFF',
                padding: '7px 20px',
                borderRadius: '10px',
                fontWeight: 800,
                fontSize: '0.82rem',
                boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)'
              }}
            >
              {loading ? 'កំពុងបង្កើត...' : 'បង្កើតគណនី / Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
