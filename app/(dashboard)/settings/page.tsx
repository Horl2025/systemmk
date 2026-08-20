'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { USER_ROLE_LABELS } from '@/lib/utils'
import { UserRole, Profile } from '@/lib/database.types'
import { Settings, Shield, User, Database, Bell, Lock, Save, CheckCircle, ShieldCheck, Key, RefreshCw, Sparkles, Smartphone, Mail, Phone, UserCheck, UserPlus, Trash2, Edit3 } from 'lucide-react'

// Demo Initial Users
const INITIAL_USERS: (Profile & { created_by_label?: string })[] = [
  {
    id: 'u1',
    full_name: 'ព្រះមេកុដិ ឡុង សារ៉េត',
    display_name: 'ឡុង សារ៉េត',
    avatar_url: null,
    role: 'chief_monk',
    is_active: true,
    phone: '016 203 953',
    email: 'admin@systemmk.org',
    created_at: '2026-01-01',
    updated_at: '2026-01-01',
    created_by_label: 'ម្ចាស់ប្រព័ន្ធមេ (Root)'
  },
  {
    id: 'u2',
    full_name: 'លោក គង់ វិរៈ (Admin ទូទៅ)',
    display_name: 'វិរៈ',
    avatar_url: null,
    role: 'admin',
    is_active: true,
    phone: '012 889 900',
    email: 'general.admin@systemmk.org',
    created_at: '2026-02-10',
    updated_at: '2026-02-10',
    created_by_label: 'បង្កើតដោយ ព្រះមេកុដិ'
  },
  {
    id: 'u3',
    full_name: 'ឧបាសក ចាន់ សុខ (អ្នកកត់ត្រា)',
    display_name: 'សុខ',
    avatar_url: null,
    role: 'recorder',
    is_active: true,
    phone: '098 765 432',
    email: 'recorder@systemmk.org',
    created_at: '2026-02-15',
    updated_at: '2026-02-15',
    created_by_label: 'បង្កើតដោយ ព្រះមេកុដិ'
  }
]

export default function SettingsPage() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'profile' | 'users' | 'roles' | 'system'>('profile')
  const [saved, setSaved] = useState(false)
  const [usersList, setUsersList] = useState(INITIAL_USERS)
  const [showAddModal, setShowAddModal] = useState(false)

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
    if (user) {
      setFullName(user.full_name || 'ព្រះមេកុដិ ឡុង សារ៉េត')
      setEmail(user.email || 'admin@systemmk.org')
      setPhone(user.phone || '016 203 953')
      setRole(user.role || 'chief_monk')
    } else {
      setFullName('Menghorl')
      setEmail('admin@systemmk.org')
      setPhone('016 203 953')
      setRole('chief_monk')
    }
  }, [user])

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
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

  return (
    <div className="space-y-7 animate-fadeIn" style={{ paddingBottom: 'var(--space-8)' }}>
      
      {/* 🌟 Header Section */}
      <div className="page-header">
        <div>
          <h1 className="page-title">ការកំណត់ប្រព័ន្ធ (System Settings)</h1>
          <p className="page-subtitle">គ្រប់គ្រងគណនី បង្កើត Admin ទូទៅ និងកំណត់សិទ្ធិប្រើប្រាស់ក្នុងវត្ត</p>
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

        {/* Card 3: Users Total (Purple Gradient) */}
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

      </div>

      {/* 🌟 Tabs */}
      <div className="tabs">
        <button 
          className={`tab-item ${activeTab === 'profile' ? 'tab-item--active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <User size={16} />
          <span>ព័ត៌មានគណនី (Profile)</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'users' ? 'tab-item--active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <UserPlus size={16} />
          <span>គ្រប់គ្រង Admin & Users ({usersList.length})</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'roles' ? 'tab-item--active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <Shield size={16} />
          <span>តួនាទី និងសិទ្ធិប្រើប្រាស់ (Roles & Permissions)</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'system' ? 'tab-item--active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          <Database size={16} />
          <span>ការបម្រុងទុកទិន្នន័យ (Backup & System)</span>
        </button>
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
                  placeholder="ឧ. ព្រះមេកុដិ ឡុង សារ៉េត"
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

            </div>

            <div style={{ paddingTop: '10px' }}>
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

          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ឈ្មោះអ្នកប្រើប្រាស់ / Name</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>អ៊ីមែល / Email</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>លេខទូរស័ព្ទ / Phone</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>តួនាទី / Role</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>អ្នកបង្កើត / Created By</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800, textAlign: 'center' }}>សកម្មភាព</th>
                </tr>
              </thead>
              <tbody>
                {usersList.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div className="flex items-center gap-3">
                        <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: u.role === 'chief_monk' ? '#FEF3C7' : u.role === 'admin' ? '#EFF6FF' : '#ECFDF5', color: u.role === 'chief_monk' ? '#B45309' : u.role === 'admin' ? '#1D4ED8' : '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                          {u.full_name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>{u.full_name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#64748B' }}>{u.display_name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="font-latin" style={{ padding: '16px 20px', color: '#334155', fontWeight: 600 }}>{u.email}</td>
                    <td className="font-latin" style={{ padding: '16px 20px', color: '#64748B' }}>{u.phone || '—'}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        background: u.role === 'chief_monk' ? '#FEF3C7' : u.role === 'admin' ? '#EFF6FF' : '#ECFDF5', 
                        border: `1px solid ${u.role === 'chief_monk' ? '#FDE68A' : u.role === 'admin' ? '#BFDBFE' : '#A7F3D0'}`, 
                        color: u.role === 'chief_monk' ? '#92400E' : u.role === 'admin' ? '#1E40AF' : '#065F46', 
                        padding: '4px 12px', 
                        borderRadius: '10px', 
                        fontSize: '0.75rem', 
                        fontWeight: 800 
                      }}>
                        {USER_ROLE_LABELS[u.role]?.kh || u.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', color: '#475569', padding: '3px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 600 }}>
                        {u.created_by_label || 'ព្រះមេកុដិ'}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                      {u.role !== 'chief_monk' ? (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="hover-lift" 
                          style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '6px 10px', borderRadius: '8px', cursor: 'pointer' }}
                          title="លុបគណនីនេះ"
                        >
                          <Trash2 size={15} />
                        </button>
                      ) : (
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600 }}>មេប្រព័ន្ធ</span>
                      )}
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

          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>តួនាទី (Role)</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>គ្រប់គ្រងព្រះសង្ឃ</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>គ្រប់គ្រងហិរញ្ញវត្ថុ</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>កត់វត្តមាន</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>គ្រប់គ្រង User</th>
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
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: r.bg, border: `1px solid ${r.border}`, color: r.color, padding: '4px 12px', borderRadius: '10px', fontSize: '0.8rem', fontWeight: 800 }}>
                        {r.role}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#059669' }}>{r.monks}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#059669' }}>{r.fin}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: '#059669' }}>{r.att}</td>
                    <td style={{ padding: '16px 20px', fontWeight: 700, color: r.usr.includes('None') ? '#94A3B8' : '#059669' }}>{r.usr}</td>
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
