'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { YearProvider, useYear } from '@/contexts/YearContext'
import { LanguageProvider, useLanguage } from '@/contexts/LanguageContext'
import { NotificationPrompt } from '@/components/NotificationPrompt'
import { signOut } from '@/lib/auth'
import { USER_ROLE_LABELS } from '@/lib/utils'
import {
  LayoutDashboard, Users, Building2, GraduationCap, CalendarCheck,
  Calendar, DollarSign, Package, BarChart3, MessageSquare,
  Settings, LogOut, ChevronLeft, ChevronRight, Menu, X, Bell, CheckCircle2, Sparkles,
  QrCode, Home, Search, User, Moon, Sun, Camera, Upload, Image as ImageIcon, Smartphone, Download, Share2, ChevronDown, Plus
} from 'lucide-react'

const navItems = [
  { label: 'ផ្ទាំងគ្រប់គ្រង', labelEn: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { section: 'ព្រះសង្ឃ / Monks' },
  { label: 'ព្រះសង្ឃ', labelEn: 'Monks', href: '/monks', icon: Users },
  { label: 'ទីកន្លែង', labelEn: 'Rooms', href: '/rooms', icon: Building2 },
  { label: 'សិស្ស', labelEn: 'Students', href: '/students', icon: GraduationCap },
  { section: 'សកម្មភាព / Activity' },
  { label: 'វត្តមាន', labelEn: 'Attendance', href: '/attendance', icon: CalendarCheck },
  { label: 'កាលវិភាគ', labelEn: 'Schedule', href: '/schedule', icon: Calendar },
  { section: 'ហិរញ្ញវត្ថុ / Finance' },
  { label: 'ហិរញ្ញវត្ថុ', labelEn: 'Finance', href: '/finance', icon: DollarSign },
  { label: 'សម្ភារៈ', labelEn: 'Inventory', href: '/inventory', icon: Package },
  { label: 'របាយការណ៍', labelEn: 'Reports', href: '/reports', icon: BarChart3 },
  { section: 'ទំនាក់ទំនង / Connect' },
  { label: 'ការសន្ទនា', labelEn: 'Chat', href: '/chat', icon: MessageSquare },
  { section: 'ប្រព័ន្ធ / System' },
  { label: 'ការកំណត់', labelEn: 'Settings', href: '/settings', icon: Settings },
]

function Sidebar({ 
  collapsed, 
  onToggle, 
  mobileOpen, 
  onMobileClose 
}: { 
  collapsed: boolean; 
  onToggle: () => void; 
  mobileOpen: boolean; 
  onMobileClose: () => void 
}) {
  const { user, loading, customAvatar } = useAuth()
  const { t } = useLanguage()
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div 
          onClick={onMobileClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.7)',
            backdropFilter: 'blur(6px)',
            zIndex: 90
          }}
        />
      )}

      <aside 
        className={`sidebar ${collapsed ? 'sidebar--collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
      >
        {/* Logo */}
        <div className="sidebar-logo flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div 
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 4px 12px rgba(139, 92, 246, 0.35)'
              }}
            >
              <img src="/app-logo.png" alt="SystemMK Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="sidebar-logo-text">
              <div className="sidebar-logo-title">SystemMK</div>
              <div className="sidebar-logo-subtitle">Monastery System</div>
            </div>
          </div>
          {mobileOpen && (
            <button 
              onClick={onMobileClose} 
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: 'white',
                padding: '6px',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Navigation - Filtered by User Role */}
        <nav className="sidebar-nav">
          {(() => {
            const currentRole = user?.role || 'chief_monk'
            
            // 🛡️ Strict RBAC Matrix per Role:
            // - chief_monk: All Modules
            // - admin: All Modules
            // - recorder (អ្នកកត់ត្រា): Attendance, Schedule, Monks (view/edit), Students, Chat, Settings (Edit Profile only) -> HIDE Finance, Inventory, Reports
            // - student (សិស្សវត្ត): Attendance, Schedule, Chat, Settings (Edit Profile only) -> HIDE Monks, Finance, Inventory, Reports, Rooms
            // - guest (ភ្ញៀវ): Attendance, Schedule, Chat, Settings (Edit Profile only)
            
            const allowedHrefs: Record<string, string[]> = {
              chief_monk: ['/dashboard', '/monks', '/rooms', '/students', '/attendance', '/schedule', '/finance', '/inventory', '/reports', '/chat', '/settings'],
              admin: ['/dashboard', '/monks', '/rooms', '/students', '/attendance', '/schedule', '/finance', '/inventory', '/reports', '/chat', '/settings'],
              recorder: ['/dashboard', '/monks', '/students', '/attendance', '/schedule', '/chat', '/settings'],
              student: ['/dashboard', '/attendance', '/schedule', '/chat', '/settings'],
              guest: ['/dashboard', '/attendance', '/schedule', '/chat', '/settings'],
            }

            const accessibleHrefs = allowedHrefs[currentRole] || allowedHrefs.recorder

            const filteredNav = navItems.filter((item, idx, arr) => {
              if ('section' in item) {
                // Check if any following item belongs to this section until next section
                const subsequentItems = []
                for (let j = idx + 1; j < arr.length; j++) {
                  if ('section' in arr[j]) break
                  subsequentItems.push(arr[j])
                }
                return subsequentItems.some(sub => !('section' in sub) && accessibleHrefs.includes(sub.href))
              }
              return accessibleHrefs.includes(item.href)
            })

            return filteredNav.map((item, i) => {
              if ('section' in item) {
                return <div key={i} className="sidebar-section-label">{item.section}</div>
              }
              const Icon = item.icon
              const isActive = pathname === item.href ||
                (item.href !== '/dashboard' && pathname?.startsWith(item.href))
              const keyMap: Record<string, string> = {
                '/dashboard': 'dashboard',
                '/monks': 'monks',
                '/rooms': 'rooms',
                '/students': 'students',
                '/attendance': 'attendance',
                '/schedule': 'schedule',
                '/finance': 'finance',
                '/inventory': 'inventory',
                '/reports': 'reports',
                '/chat': 'chat',
                '/settings': 'settings',
              }
              const translatedLabel = t(keyMap[item.href] || '', item.label)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onMobileClose}
                  className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                  title={collapsed ? `${translatedLabel} / ${item.labelEn}` : ''}
                >
                  <span className="nav-item-icon">
                    <Icon size={18} />
                  </span>
                  <span>{translatedLabel}</span>
                </Link>
              )
            })
          })()}
        </nav>

        {/* Footer / User Profile & Explicit Logout Button */}
        <div className="sidebar-footer" style={{ padding: '12px 14px', borderTop: '1px solid rgba(255, 255, 255, 0.1)', background: 'rgba(0, 0, 0, 0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
              <div 
                style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '12px', 
                  background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                  color: '#1C1917', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: 900, 
                  fontSize: '1rem',
                  flexShrink: 0,
                  boxShadow: '0 4px 10px rgba(217, 119, 6, 0.3)',
                  overflow: 'hidden'
                }}
              >
                {customAvatar ? (
                  <img src={customAvatar} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : user?.avatar_url ? (
                  <img src={user.avatar_url} alt={user.display_name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span>{user?.full_name?.charAt(0) || 'U'}</span>
                )}
              </div>

              {!collapsed && (
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {loading ? 'កំពុងផ្ទុក...' : (user?.full_name || 'អ្នកគ្រប់គ្រង')}
                  </div>
                  <div style={{ fontSize: '0.68rem', color: '#FDE68A', fontWeight: 600, marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user ? USER_ROLE_LABELS[user.role]?.kh : 'ព្រះមេគណ / លេខា'}
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <button
                type="button"
                onClick={handleSignOut}
                className="hover-lift"
                title="ចាកចេញពីប្រព័ន្ធ / Sign Out"
                style={{
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '7px 10px',
                  fontSize: '0.74rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.35)'
                }}
              >
                <LogOut size={13} strokeWidth={2.5} />
                <span>ចាកចេញ</span>
              </button>
            )}

            {collapsed && (
              <button
                type="button"
                onClick={handleSignOut}
                title="ចាកចេញពីប្រព័ន្ធ / Sign Out"
                style={{
                  background: 'rgba(239, 68, 68, 0.2)',
                  color: '#EF4444',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '8px',
                  padding: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <LogOut size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Collapse toggle (Desktop only) */}
        <button
          onClick={onToggle}
          className="sidebar-toggle"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            position: 'absolute',
            right: -12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 24,
            height: 24,
            borderRadius: '50%',
            background: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: 'var(--shadow-sm)',
            color: 'var(--color-text-2)',
            zIndex: 10,
          }}
        >
          {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </aside>
    </>
  )
}

function Header({ onMenuClick }: { onMenuClick: () => void }) {
  const pathname = usePathname()
  const { user, customAvatar, setCustomAvatar } = useAuth()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showAvatarModal, setShowAvatarModal] = useState(false)
  const [unreadCount, setUnreadCount] = useState(1)
  const [isDark, setIsDark] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const avatarFileRef = useRef<HTMLInputElement>(null)

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64Url = reader.result as string
        setCustomAvatar(base64Url)
        setShowAvatarModal(false)
      }
      reader.readAsDataURL(file)
    }
  }

  // Initialize theme from localStorage (Default to Clean Light Mode)
  useEffect(() => {
    const savedTheme = localStorage.getItem('systemmk-theme')
    if (savedTheme === 'dark') {
      setIsDark(true)
      document.documentElement.setAttribute('data-theme', 'dark')
    } else {
      setIsDark(false)
      document.documentElement.removeAttribute('data-theme')
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    if (newTheme) {
      document.documentElement.setAttribute('data-theme', 'dark')
      localStorage.setItem('systemmk-theme', 'dark')
    } else {
      document.documentElement.removeAttribute('data-theme')
      localStorage.setItem('systemmk-theme', 'light')
    }
  }

  // Close notification dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showNotifications])

  const { selectedYear, setSelectedYear, availableYears, addYear } = useYear()
  const [showYearDropdown, setShowYearDropdown] = useState(false)
  const [showAddYearModal, setShowAddYearModal] = useState(false)
  const [newYearInput, setNewYearInput] = useState('')
  const yearDropdownRef = useRef<HTMLDivElement>(null)

  // Close year dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (yearDropdownRef.current && !yearDropdownRef.current.contains(event.target as Node)) {
        setShowYearDropdown(false)
      }
    }
    if (showYearDropdown) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showYearDropdown])

  const handleAddNewYear = (e: React.FormEvent) => {
    e.preventDefault()
    if (newYearInput.trim()) {
      addYear(newYearInput.trim())
      setNewYearInput('')
      setShowAddYearModal(false)
      setShowYearDropdown(false)
    }
  }

  const currentItem = navItems.find(item =>
    !('section' in item) && (
      pathname === item.href ||
      (item.href !== '/dashboard' && pathname?.startsWith(item.href))
    )
  )

  return (
    <header className="header flex items-center justify-between" style={{ position: 'relative' }}>
      <div className="flex items-center gap-3">
        {/* Mobile Hamburger Button */}
        <button 
          onClick={onMenuClick}
          style={{
            background: '#F1F5F9',
            border: '1px solid #E2E8F0',
            borderRadius: '10px',
            padding: '7px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
          className="mobile-menu-btn"
          aria-label="Open Menu"
        >
          <Menu size={20} color="#0F172A" />
        </button>

        {currentItem && !('section' in currentItem) && (
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: 800, lineHeight: 1.2, color: '#0F172A' }}>
              {!('section' in currentItem) && currentItem.label}
            </h2>
            <p style={{ fontSize: '0.68rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-latin)' }}>
              {!('section' in currentItem) && currentItem.labelEn}
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5 sm:gap-3">
        
        {/* 🌟 GLOBAL YEAR SWITCHER DROPDOWN */}
        <div ref={yearDropdownRef} style={{ position: 'relative' }}>
          <button
            type="button"
            onClick={() => setShowYearDropdown(!showYearDropdown)}
            className="hover-lift"
            style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(217, 119, 6, 0.18) 100%)',
              border: '1.5px solid rgba(245, 158, 11, 0.45)',
              color: '#B45309',
              borderRadius: '12px',
              padding: '6px 12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontWeight: 800,
              fontSize: '0.82rem',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.12)'
            }}
            title="ជ្រើសរើសឆ្នាំគ្រប់គ្រងទិន្នន័យ (Fiscal / Academic Year)"
          >
            <Calendar size={15} color="#D97706" />
            <span>ឆ្នាំ {selectedYear}</span>
            <ChevronDown size={14} color="#B45309" style={{ transform: showYearDropdown ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
          </button>

          {/* Dropdown Menu */}
          {showYearDropdown && (
            <div
              className="animate-fadeIn"
              style={{
                position: 'absolute',
                right: 0,
                top: '42px',
                width: '210px',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 12px 30px rgba(0,0,0,0.12)',
                zIndex: 100,
                overflow: 'hidden',
                padding: '6px'
              }}
            >
              <div style={{ padding: '8px 10px 6px', borderBottom: '1px solid #F1F5F9' }}>
                <span style={{ fontSize: '0.7rem', color: '#64748B', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.03em' }}>
                  📅 ជ្រើសរើសឆ្នាំទិន្នន័យ
                </span>
              </div>

              <div style={{ maxHeight: '180px', overflowY: 'auto', padding: '4px 0' }}>
                {availableYears.map(yr => (
                  <button
                    key={yr}
                    onClick={() => {
                      setSelectedYear(yr)
                      setShowYearDropdown(false)
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 12px',
                      borderRadius: '10px',
                      border: 'none',
                      background: selectedYear === yr ? 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)' : 'transparent',
                      color: selectedYear === yr ? '#92400E' : '#334155',
                      fontWeight: selectedYear === yr ? 800 : 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '2px'
                    }}
                  >
                    <span>ឆ្នាំ {yr} {yr === '2026' ? '(បច្ចុប្បន្ន)' : ''}</span>
                    {selectedYear === yr && <CheckCircle2 size={15} color="#D97706" />}
                  </button>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: '6px' }}>
                <button
                  onClick={() => {
                    setShowYearDropdown(false)
                    setShowAddYearModal(true)
                  }}
                  className="hover-lift"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: '1px dashed #CBD5E1',
                    background: '#F8FAFC',
                    color: '#2563EB',
                    fontWeight: 800,
                    fontSize: '0.76rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px'
                  }}
                >
                  <Plus size={14} />
                  <span>+ បន្ថែមឆ្នាំថ្មី</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 🌟 NOTIFICATION BELL BUTTON & CONTAINER */}
        <div ref={dropdownRef} style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setUnreadCount(0)
            }}
            className="hover-lift"
            style={{
              background: '#F8FAFC',
              border: '1.5px solid #E2E8F0',
              borderRadius: '12px',
              padding: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
            title="សេចក្ដីជូនដំណឹង និងព្រឹត្តិការណ៍"
          >
            <Bell size={18} color="#0F172A" />
            {unreadCount > 0 && (
              <span 
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#EF4444',
                  color: '#FFFFFF',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(239, 68, 68, 0.4)'
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {/* 🌟 Professional Standard Notification Dropdown Modal */}
          {showNotifications && (
            <div 
              className="animate-fadeIn notification-dropdown"
              style={{
                position: 'absolute',
                right: '-10px',
                top: '48px',
                width: '350px',
                maxWidth: 'calc(100vw - 32px)',
                background: '#FFFFFF',
                borderRadius: '24px',
                boxShadow: '0 20px 40px -10px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(0,0,0,0.08)',
                border: '1.5px solid #E2E8F0',
                padding: '0',
                zIndex: 1000,
                overflow: 'hidden'
              }}
            >
              {/* Header Bar */}
              <div style={{ background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 100%)', padding: '16px 20px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(245, 158, 11, 0.3)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '8px', background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bell size={15} />
                  </div>
                  <div>
                    <h4 style={{ fontWeight: 800, fontSize: '0.88rem', color: '#FEF3C7', margin: 0 }}>
                      សេចក្ដីជូនដំណឹងវត្ត (Notifications)
                    </h4>
                  </div>
                </div>
                <button 
                  onClick={() => setShowNotifications(false)} 
                  style={{ width: '26px', height: '26px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#CBD5E1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem' }}
                >
                  ✕
                </button>
              </div>

              {/* Notification List Container */}
              <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#FAFAFA' }}>
                
                {/* 1. Official Ceremony Broadcast Notification */}
                <div 
                  className="hover-lift"
                  style={{ 
                    background: '#FFFFFF', 
                    borderRadius: '16px', 
                    padding: '12px 14px', 
                    border: '1.5px solid #FDE68A',
                    boxShadow: '0 4px 12px rgba(217, 119, 6, 0.08)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', color: '#78350F', border: '1px solid #F59E0B', padding: '2px 8px', borderRadius: '6px', fontSize: '0.66rem', fontWeight: 800 }}>
                      📢 ពិធីបុណ្យវត្ត
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>ថ្មីៗនេះ</span>
                  </div>

                  <h5 style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0F172A', lineHeight: 1.3, margin: '0 0 4px 0' }}>
                    ពិធីបុណ្យកឋិនទានសាមគ្គី
                  </h5>
                  <p style={{ fontSize: '0.74rem', color: '#475569', lineHeight: 1.4, margin: '0 0 6px 0' }}>
                    ពិធីដង្ហែត្រៃចីវរ និងបច្ច័យបូជាទូទាំងវត្ត នឹងប្រព្រឹត្តទៅនៅសាលាឆាន់ និងព្រះវិហារ។
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px dashed #E2E8F0', paddingTop: '6px', fontSize: '0.68rem' }}>
                    <span style={{ color: '#D97706', fontWeight: 700 }}>📅 កាលបរិច្ឆេទ: ២៥ តុលា ២០២៦</span>
                    <Link href="/schedule" onClick={() => setShowNotifications(false)} style={{ color: '#2563EB', fontWeight: 700, textDecoration: 'none' }}>
                      មើលលម្អិត →
                    </Link>
                  </div>
                </div>

                {/* 2. Internal Chat Notification */}
                <div 
                  className="hover-lift"
                  style={{ 
                    background: '#FFFFFF', 
                    borderRadius: '16px', 
                    padding: '12px 14px', 
                    border: '1.5px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.02)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                    <span style={{ background: '#EFF6FF', color: '#1E40AF', border: '1px solid #BFDBFE', padding: '2px 8px', borderRadius: '6px', fontSize: '0.66rem', fontWeight: 800 }}>
                      💬 សារសន្ទនាផ្ទៃក្នុង
                    </span>
                    <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>០៨:១៥ ព្រឹក</span>
                  </div>

                  <h5 style={{ fontWeight: 800, fontSize: '0.82rem', color: '#0F172A', margin: '0 0 2px 0' }}>
                    ព្រះមហា សុខ វិបុល
                  </h5>
                  <p style={{ fontSize: '0.72rem', color: '#64748B', lineHeight: 1.4, margin: 0 }}>
                    «ថ្ងៃនេះម៉ោង ២ រសៀលមានកម្មវិធីសូត្រធម៌ និងថ្វាយបង្គំនៅសាលាឆាន់...»
                  </p>

                  <div style={{ textAlign: 'right', marginTop: '6px' }}>
                    <Link href="/chat" onClick={() => setShowNotifications(false)} style={{ color: '#2563EB', fontSize: '0.68rem', fontWeight: 700, textDecoration: 'none' }}>
                      ចូលបន្ទប់សន្ទនា →
                    </Link>
                  </div>
                </div>

              </div>

              {/* Footer Link */}
              <div style={{ padding: '12px', background: '#FFFFFF', borderTop: '1.5px solid #F1F5F9', textAlign: 'center' }}>
                <Link 
                  href="/schedule" 
                  onClick={() => setShowNotifications(false)}
                  style={{ fontSize: '0.76rem', fontWeight: 800, color: '#D97706', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  <span>ពិនិត្យកាលវិភាគ & ពិធីបុណ្យទាំងអស់</span>
                  <span>→</span>
                </Link>
              </div>

            </div>
          )}
        </div>

        {/* 🌙 / ☀️ THEME MODE TOGGLE BUTTON */}
        <button
          type="button"
          onClick={toggleTheme}
          className="hover-lift"
          title={isDark ? "ប្ដូរទៅពន្លឺថ្ងៃ (Light Mode)" : "ប្ដូរទៅរាត្រី (Dark Mode)"}
          style={{
            background: isDark ? '#1E293B' : '#F8FAFC',
            border: isDark ? '1.5px solid #334155' : '1.5px solid #E2E8F0',
            borderRadius: '12px',
            padding: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            color: isDark ? '#FDE68A' : '#0F172A',
            transition: 'all 0.2s ease'
          }}
          aria-label="Toggle Theme Mode"
        >
          {isDark ? <Sun size={18} color="#F59E0B" /> : <Moon size={18} color="#475569" />}
        </button>

        {/* User profile bubble (Clickable to change photo) */}
        <div 
          onClick={() => setShowAvatarModal(true)}
          className="flex items-center gap-2 hover-lift"
          style={{ cursor: 'pointer', padding: '4px 8px', borderRadius: '20px', background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)' }}
          title="ចុចទីនេះដើម្បីប្ដូររូបថតគណនី (Click to change photo)"
        >
          <div 
            className="avatar avatar-sm" 
            style={{ 
              width: 34, 
              height: 34, 
              borderRadius: '50%', 
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
              color: '#1C1917', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: 800,
              overflow: 'hidden',
              boxShadow: '0 2px 8px rgba(217, 119, 6, 0.3)',
              position: 'relative'
            }}
          >
            {customAvatar ? (
              <img src={customAvatar} alt="User Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : user?.avatar_url ? (
              <img src={user.avatar_url} alt={user.display_name || ''} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span>{user?.full_name?.charAt(0) || 'U'}</span>
            )}
          </div>
          <div className="hidden sm:block" style={{ lineHeight: 1.2 }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 700 }}>{user?.full_name || 'ចៅអធិការ'}</div>
            <div style={{ fontSize: '0.65rem', color: 'var(--color-text-muted)', fontFamily: 'var(--font-latin)' }}>
              {user ? USER_ROLE_LABELS[user.role]?.en : 'Chief Monk'}
            </div>
          </div>
        </div>

        {/* Hidden File Input for Avatar */}
        <input 
          type="file" 
          ref={avatarFileRef} 
          accept="image/*" 
          style={{ display: 'none' }} 
          onChange={handleAvatarSelect} 
        />

        {/* 📷 Change User Profile Picture Modal */}
        {showAvatarModal && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowAvatarModal(false)}>
            <div 
              className="modal modal-md animate-scaleUp"
              style={{
                borderRadius: '24px',
                overflow: 'hidden',
                boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.4)',
                maxWidth: '420px',
                width: '100%',
                margin: '0 auto',
                background: '#FFFFFF',
                textAlign: 'center'
              }}
            >
              {/* Header */}
              <div style={{ background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 100%)', padding: '18px 20px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(245, 158, 11, 0.3)' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#FEF3C7', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Camera size={18} color="#F59E0B" />
                  <span>ប្ដូររូបថតគណនី / Profile Photo</span>
                </h3>
                <button 
                  onClick={() => setShowAvatarModal(false)}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#CBD5E1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>

              {/* Body */}
              <div style={{ padding: '24px 20px', background: '#F8FAFC' }}>
                {/* Big Avatar Preview */}
                <div 
                  style={{
                    width: '100px',
                    height: '100px',
                    borderRadius: '50%',
                    margin: '0 auto 16px',
                    background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                    color: '#1C1917',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 900,
                    fontSize: '2.5rem',
                    boxShadow: '0 10px 25px rgba(217, 119, 6, 0.35)',
                    border: '4px solid #FFFFFF',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  {customAvatar ? (
                    <img src={customAvatar} alt="Current Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <span>{user?.full_name?.charAt(0) || 'U'}</span>
                  )}
                </div>

                <h4 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A', margin: '0 0 4px 0' }}>
                  {user?.full_name || 'អ្នកគ្រប់គ្រងវត្ត'}
                </h4>
                <p style={{ fontSize: '0.78rem', color: '#64748B', margin: '0 0 20px 0' }}>
                  ជ្រើសរើសរូបថតផ្ទាល់ខ្លួនពីទូរស័ព្ទ ឬកុំព្យូទ័ររបស់អ្នក
                </p>

                {/* Upload Buttons */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <button
                    type="button"
                    className="hover-lift"
                    onClick={() => avatarFileRef.current?.click()}
                    style={{
                      width: '100%',
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      color: '#1C1917',
                      border: 'none',
                      padding: '12px 18px',
                      borderRadius: '14px',
                      fontWeight: 800,
                      fontSize: '0.88rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 6px 18px rgba(217, 119, 6, 0.35)'
                    }}
                  >
                    <Upload size={18} strokeWidth={2.5} />
                    <span>ជ្រើសរើសរូបថតថ្មី (Upload Photo)</span>
                  </button>

                  {customAvatar && (
                    <button
                      type="button"
                      className="hover-lift"
                      onClick={() => {
                        setCustomAvatar(null)
                        setShowAvatarModal(false)
                      }}
                      style={{
                        width: '100%',
                        background: '#FEE2E2',
                        color: '#DC2626',
                        border: '1px solid #FECACA',
                        padding: '10px 18px',
                        borderRadius: '14px',
                        fontWeight: 700,
                        fontSize: '0.82rem',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️ លុបរូបថតចេញ (Reset to Default)
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
        {/* ➕ Add Custom Year Modal */}
        {showAddYearModal && (
          <div 
            className="animate-fadeIn" 
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(15, 23, 42, 0.75)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1100,
              padding: '16px'
            }}
          >
            <div 
              className="hover-lift"
              style={{
                width: '100%',
                maxWidth: '380px',
                background: '#FFFFFF',
                borderRadius: '24px',
                border: '1.5px solid #E2E8F0',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                overflow: 'hidden'
              }}
            >
              <div style={{ background: 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FEF3C7', fontWeight: 800, fontSize: '0.92rem' }}>
                  <Calendar size={18} color="#F59E0B" />
                  <span>បន្ថែមឆ្នាំគ្រប់គ្រងថ្មី</span>
                </div>
                <button 
                  onClick={() => setShowAddYearModal(false)}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#CBD5E1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddNewYear} style={{ padding: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 800, color: '#334155', marginBottom: '8px' }}>
                  បញ្ចូលឆ្នាំថ្មី (ឧ. 2028, 2029...) :
                </label>
                <input 
                  type="number" 
                  min="2000" 
                  max="2100"
                  required
                  autoFocus
                  value={newYearInput}
                  onChange={e => setNewYearInput(e.target.value)}
                  placeholder="ឧ. 2028"
                  style={{
                    width: '100%',
                    padding: '12px 14px',
                    borderRadius: '12px',
                    border: '1.5px solid #CBD5E1',
                    fontSize: '1rem',
                    fontWeight: 800,
                    color: '#0F172A',
                    outline: 'none',
                    marginBottom: '16px'
                  }}
                />

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setShowAddYearModal(false)}
                    style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 700, fontSize: '0.84rem', cursor: 'pointer' }}
                  >
                    បោះបង់
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#1C1917', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)' }}
                  >
                    + បង្កើតឆ្នាំ
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

function MobileBottomNav({ onOpenQR }: { onOpenQR: () => void }) {
  const pathname = usePathname()
  const { user } = useAuth()
  const currentRole = user?.role || 'chief_monk'

  const allTabs = [
    { label: 'ទំព័រដើម', icon: Home, href: '/dashboard', roles: ['chief_monk', 'admin', 'recorder', 'student', 'guest'] },
    { label: 'ព្រះសង្ឃ', icon: Users, href: '/monks', roles: ['chief_monk', 'admin', 'recorder'] },
    { label: 'ស្កេន QR', icon: QrCode, isAction: true, roles: ['chief_monk', 'admin', 'recorder', 'student', 'guest'] },
    { label: 'វត្តមាន', icon: CalendarCheck, href: '/attendance', roles: ['chief_monk', 'admin', 'recorder', 'student', 'guest'] },
    { label: 'ការកំណត់', icon: Settings, href: '/settings', roles: ['chief_monk', 'admin', 'recorder', 'student', 'guest'] },
  ]

  const tabs = allTabs.filter(t => t.roles.includes(currentRole))

  return (
    <nav className="mobile-bottom-nav">
      {tabs.map((tab, idx) => {
        if (tab.isAction) {
          return (
            <button
              key={idx}
              onClick={onOpenQR}
              className="hover-lift"
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#1C1917',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(217, 119, 6, 0.45)',
                cursor: 'pointer',
                margin: '0 4px',
                transform: 'translateY(-4px)'
              }}
              aria-label="Scan QR Code"
              title="ស្កេន QR Code"
            >
              <QrCode size={22} color="#1C1917" />
            </button>
          )
        }

        const Icon = tab.icon
        const isActive = pathname === tab.href || (tab.href !== '/dashboard' && pathname?.startsWith(tab.href!))

        return (
          <Link
            key={idx}
            href={tab.href!}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '44px',
              height: '44px',
              borderRadius: '20px',
              background: isActive ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)' : 'transparent',
              color: isActive ? '#2563EB' : '#64748B',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isActive ? '0 4px 12px rgba(37, 99, 235, 0.15)' : 'none'
            }}
            title={tab.label}
          >
            <Icon size={21} strokeWidth={isActive ? 2.5 : 1.8} />
          </Link>
        )
      })}
    </nav>
  )
}

function GlobalScanQRModal({ onClose }: { onClose: () => void }) {
  const [scanning, setScanning] = useState(true)
  const [scanResult, setScanResult] = useState<string | null>(null)
  const [hasCamera, setHasCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Request actual camera stream for fast live scanning
  useEffect(() => {
    let stream: MediaStream | null = null

    async function startCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } }
          })
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch(e => console.log('play error', e))
            setHasCamera(true)
          }
        }
      } catch (err) {
        console.log('Camera access error:', err)
        setHasCamera(false)
      }
    }

    if (scanning) {
      startCamera()
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [scanning])

  const handleInstantScan = (monkName: string, role: string) => {
    setScanning(false)
    setScanResult(`វត្តមានបានកត់ត្រាជោគជ័យ ៖ ${monkName} (${role})`)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md animate-fadeIn" style={{ maxWidth: '440px', maxHeight: '85vh', borderRadius: '28px', overflow: 'hidden', border: '1.5px solid #FDE68A', boxShadow: '0 25px 50px -12px rgba(217, 119, 6, 0.4)', padding: 0, display: 'flex', flexDirection: 'column', background: '#FFFFFF' }}>
        
        {/* Luxury Header */}
        <div style={{ background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 100%)', padding: '16px 20px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(245, 158, 11, 0.3)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '12px', background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)' }}>
              <QrCode size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#FEF3C7', margin: 0 }}>
                ស្កេន QR កាតសង្ឃ (Live Camera)
              </h3>
              <p style={{ fontSize: '0.64rem', color: '#D1D5DB', margin: 0, marginTop: '1px' }}>
                Ultra-Fast Monk QR Attendance Scanner
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        <div style={{ padding: '18px 20px', textAlign: 'center', background: '#FAFAFA', overflowY: 'auto' }}>
          {scanning ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              
              {/* Ultra-Fast Live Camera Viewport with Red Laser Bar */}
              <div 
                style={{ 
                  width: '210px', 
                  height: '210px', 
                  borderRadius: '24px', 
                  background: '#0F172A', 
                  border: '3px solid #F59E0B', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  position: 'relative', 
                  overflow: 'hidden', 
                  boxShadow: '0 12px 28px rgba(0,0,0,0.25)' 
                }}
              >
                {/* Real Camera Video Stream */}
                <video 
                  ref={videoRef} 
                  playsInline 
                  autoPlay 
                  muted 
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover', 
                    display: hasCamera ? 'block' : 'none' 
                  }} 
                />

                {/* Animated Fallback if camera stream is pending/simulated */}
                {!hasCamera && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <QrCode size={80} color="#FDE68A" style={{ opacity: 0.85 }} />
                    <span style={{ fontSize: '0.72rem', color: '#CBD5E1', fontWeight: 700 }}>កំពុងដំណើរការកាមេរ៉ាស្កេន...</span>
                  </div>
                )}

                {/* 🔴 High-Speed Laser Bar Scanning Animation */}
                <div 
                  style={{ 
                    position: 'absolute', 
                    left: 0, 
                    right: 0, 
                    height: '3px', 
                    background: 'linear-gradient(90deg, transparent, #EF4444, #F59E0B, #EF4444, transparent)', 
                    boxShadow: '0 0 14px #EF4444', 
                    animation: 'scannerLaser 1.2s ease-in-out infinite alternate', 
                    zIndex: 10 
                  }} 
                />

                {/* 4 Corner Viewfinder Reticles */}
                <div style={{ position: 'absolute', top: '10px', left: '10px', width: '18px', height: '18px', borderTop: '3px solid #10B981', borderLeft: '3px solid #10B981', borderRadius: '4px 0 0 0' }} />
                <div style={{ position: 'absolute', top: '10px', right: '10px', width: '18px', height: '18px', borderTop: '3px solid #10B981', borderRight: '3px solid #10B981', borderRadius: '0 4px 0 0' }} />
                <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '18px', height: '18px', borderBottom: '3px solid #10B981', borderLeft: '3px solid #10B981', borderRadius: '0 0 0 4px' }} />
                <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '18px', height: '18px', borderBottom: '3px solid #10B981', borderRight: '3px solid #10B981', borderRadius: '0 0 4px 0' }} />
              </div>

              {/* Laser Animation Keyframe Injection */}
              <style jsx>{`
                @keyframes scannerLaser {
                  0% { top: 10px; }
                  100% { top: 195px; }
                }
              `}</style>

              <p style={{ fontSize: '0.76rem', color: '#475569', maxWidth: '290px', lineHeight: 1.4, margin: '8px 0 0 0' }}>
                ⚡ សូមតម្រង់កាមេរ៉ាទៅលើ <strong>QR Code លើកាតព្រះសង្ឃ</strong> ដើម្បីកត់ត្រាវត្តមានភ្លាមៗ
              </p>
            </div>
          ) : (
            <div className="animate-fadeIn" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px', padding: '10px 0' }}>
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ECFDF5', border: '2.5px solid #10B981', color: '#059669', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 20px rgba(16, 185, 129, 0.25)' }}>
                <CheckCircle2 size={40} />
              </div>
              <div>
                <h4 style={{ fontWeight: 800, fontSize: '1.1rem', color: '#065F46', margin: '0 0 4px 0' }}>
                  ⚡ ស្កេនកត់ត្រាបានជោគជ័យ!
                </h4>
                <p style={{ fontSize: '0.86rem', color: '#1E293B', fontWeight: 700, margin: 0 }}>
                  {scanResult}
                </p>
                <span style={{ fontSize: '0.72rem', color: '#059669', fontWeight: 700, marginTop: '4px', display: 'block' }}>
                  ✓ ម៉ោងស្កេន: {new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                <button
                  onClick={() => setScanning(true)}
                  className="hover-lift"
                  style={{ background: '#F1F5F9', border: '1.5px solid #CBD5E1', padding: '9px 18px', borderRadius: '12px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer' }}
                >
                  ⚡ ស្កេនអង្គបន្ទាប់
                </button>
                <button
                  onClick={onClose}
                  className="hover-lift"
                  style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#1C1917', border: 'none', padding: '9px 22px', borderRadius: '12px', fontWeight: 800, fontSize: '0.8rem', cursor: 'pointer', boxShadow: '0 6px 16px rgba(217, 119, 6, 0.35)' }}
                >
                  រួចរាល់ / Done
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [showQRScanner, setShowQRScanner] = useState(false)

  return (
    <div className="app-shell">
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)} 
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={`main-content ${collapsed ? 'main-content--expanded' : ''}`}>
        <Header onMenuClick={() => setMobileOpen(true)} />
        <main className="page-wrapper" style={{ overflowX: 'hidden' }}>
          {children}
        </main>
      </div>

      {/* 📱 Floating Mobile Bottom Navigation Bar */}
      <MobileBottomNav onOpenQR={() => setShowQRScanner(true)} />

      {/* 🔔 Mobile Push Notification Permission Prompt */}
      <NotificationPrompt />

      {/* 📷 Global Scan QR Modal */}
      {showQRScanner && (
        <GlobalScanQRModal onClose={() => setShowQRScanner(false)} />
      )}
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <YearProvider>
        <LanguageProvider>
          <DashboardShell>{children}</DashboardShell>
        </LanguageProvider>
      </YearProvider>
    </AuthProvider>
  )
}
