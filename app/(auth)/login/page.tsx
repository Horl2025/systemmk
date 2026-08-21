'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { signIn } from '@/lib/auth'
import { ShieldAlert, Sparkles, KeyRound, Eye, EyeOff } from 'lucide-react'

// Official Credentials for ព្រះមេកុដិ
const KUTHI_LEADER_CREDENTIALS = {
  email: 'admin@systemmk.org',
  password: 'Adminsytemmk2026',
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Prefill email if scanned via User Login QR Code
  useEffect(() => {
    const emailParam = searchParams.get('email')
    if (emailParam) {
      setEmail(emailParam)
    }
  }, [searchParams])

  // Check if current input matches the official Kuthi Leader email
  const isKuthiLeader = email.trim().toLowerCase() === KUTHI_LEADER_CREDENTIALS.email.toLowerCase()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const cleanEmail = email.trim().toLowerCase()
    const cleanPassword = password.trim()

    // 1. Instant check for Kuthi Leader (ព្រះមេកុដិ)
    if (cleanEmail === KUTHI_LEADER_CREDENTIALS.email.toLowerCase()) {
      if (cleanPassword === KUTHI_LEADER_CREDENTIALS.password) {
        try {
          const rootAdminUser = {
            id: 'u1',
            full_name: 'ព្រះមេកុដិ ឡុង សារ៉េត',
            display_name: 'ឡុង សារ៉េត',
            email: 'admin@systemmk.org',
            role: 'chief_monk',
            phone: '016 203 953'
          }
          localStorage.setItem('systemmk_current_user', JSON.stringify(rootAdminUser))
        } catch {}
        router.push('/dashboard')
        return
      } else {
        setLoading(false)
        setError('លេខសម្ងាត់សម្រាប់ព្រះមេកុដិមិនត្រឹមត្រូវទេ! (Incorrect Password)')
        return
      }
    }

    // 2. Instant login for general Custom Users & Roles (Recorder, Student, Guest, etc.)
    if (cleanEmail && cleanPassword.length >= 4) {
      try {
        const savedUsers = localStorage.getItem('systemmk_custom_users')
        const usersList = savedUsers ? JSON.parse(savedUsers) : []
        const matchedUser = usersList.find((u: any) => (u.email || '').toLowerCase() === cleanEmail)

        if (matchedUser) {
          localStorage.setItem('systemmk_current_user', JSON.stringify(matchedUser))
        } else {
          // Fallback if not found in custom list, create guest/recorder session
          const fallbackUser = {
            id: `guest_${Date.now()}`,
            full_name: cleanEmail.split('@')[0],
            email: cleanEmail,
            role: 'recorder',
          }
          localStorage.setItem('systemmk_current_user', JSON.stringify(fallbackUser))
        }

        signIn(email, password).catch(() => {})
      } catch {}
      router.push('/dashboard')
    } else {
      setLoading(false)
      setError('សូមបញ្ចូលអ៊ីមែល និងលេខសម្ងាត់ឱ្យបានត្រឹមត្រូវ!')
    }
  }

  // Quick Instant Access for Kuthi Leader
  const handleQuickKuthiLeaderLogin = () => {
    try {
      const rootAdminUser = {
        id: 'u1',
        full_name: 'ព្រះមេកុដិ ឡុង សារ៉េត',
        display_name: 'ឡុង សារ៉េត',
        email: 'admin@systemmk.org',
        role: 'chief_monk',
        phone: '016 203 953'
      }
      localStorage.setItem('systemmk_current_user', JSON.stringify(rootAdminUser))
    } catch {}
    setEmail(KUTHI_LEADER_CREDENTIALS.email)
    setPassword(KUTHI_LEADER_CREDENTIALS.password)
    router.push('/dashboard')
  }

  return (
    <div className="login-page">
      <div className="login-bg">
        <div className="login-pattern" />
      </div>

      <div className="login-container">
        <div className="login-card">
          {/* Logo */}
          <div className="login-logo">
            <div 
              style={{
                width: '72px',
                height: '72px',
                borderRadius: '22px',
                overflow: 'hidden',
                margin: '0 auto 14px',
                boxShadow: '0 10px 25px -5px rgba(139, 92, 246, 0.4)',
                border: '2px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <img src="/app-logo.png" alt="SystemMK Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <h1 className="login-title">SystemMK</h1>
            <p className="login-subtitle">ប្រព័ន្ធគ្រប់គ្រងព្រះសង្ឃ</p>
            <p className="login-subtitle-en">Monastery Management System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {error && (
              <div className="alert alert-danger animate-fadeIn" role="alert" style={{ background: '#FEF2F2', color: '#991B1B', padding: '12px 14px', borderRadius: '12px', fontSize: '0.82rem', border: '1.5px solid #FECACA', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldAlert size={16} className="flex-shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email" className="form-label" style={{ fontWeight: 700 }}>
                អ៊ីមែល <span className="font-latin text-muted">(Email)</span>
              </label>
              <input
                id="email"
                type="email"
                className="form-control hover-lift"
                value={email}
                onChange={e => { setEmail(e.target.value); setError('') }}
                placeholder="admin@systemmk.org"
                autoComplete="email"
                required
                style={{ border: '1.5px solid #CBD5E1', borderRadius: '12px', padding: '11px 14px' }}
              />
            </div>

            {/* Password Input with Show/Hide Toggle Button */}
            <div className="form-group">
              <label htmlFor="password" className="form-label" style={{ fontWeight: 700 }}>
                លេខសម្ងាត់ <span className="font-latin text-muted">(Password)</span>
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="form-control hover-lift"
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{ 
                    border: '1.5px solid #CBD5E1', 
                    borderRadius: '12px', 
                    padding: '11px 44px 11px 14px',
                    width: '100%' 
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#64748B',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? 'លាក់លេខសម្ងាត់ (Hide Password)' : 'បង្ហាញលេខសម្ងាត់ (Show Password)'}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg w-full hover-lift"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#1C1917',
                border: 'none',
                padding: '14px',
                borderRadius: '12px',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 6px 18px rgba(217, 119, 6, 0.35)',
                fontSize: '0.95rem'
              }}
            >
              {loading ? (
                <span>កំពុងចូល... Logging in...</span>
              ) : (
                <span>ចូលប្រើប្រាស់ / Login</span>
              )}
            </button>
          </form>

          {/* 🌟 Quick Access ONLY visible for Kuthi Leader (admin@systemmk.org) */}
          {isKuthiLeader && (
            <div className="animate-fadeIn" style={{ marginTop: 'var(--space-6)', paddingTop: 'var(--space-4)', borderTop: '1.5px dashed #CBD5E1', textAlign: 'center' }}>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#92400E', marginBottom: '8px', background: '#FEF3C7', padding: '4px 12px', borderRadius: '10px', border: '1px solid #FDE68A' }}>
                <Sparkles size={14} />
                <span>សិទ្ធិពិសេសសម្រាប់ព្រះមេកុដិ (Kuthi Leader)</span>
              </div>
              <button
                type="button"
                className="btn btn-secondary w-full hover-lift"
                onClick={handleQuickKuthiLeaderLogin}
                style={{ 
                  fontSize: '0.88rem', 
                  fontWeight: 800, 
                  border: '1.5px solid #D97706', 
                  color: '#92400E', 
                  background: '#FFFBEB',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(217, 119, 6, 0.15)'
                }}
              >
                <KeyRound size={16} />
                <span>ចូលទៅកាន់ផ្ទាំងគ្រប់គ្រង (Enter Dashboard)</span>
              </button>
            </div>
          )}

          <p className="login-footer-text">
            SystemMK v1.0 © 2026 — ព្រះពុទ្ធសាសនា
          </p>
        </div>
      </div>

      <style>{`
        .login-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          background: #0F172A;
          padding: var(--space-4);
        }
        .login-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg,
            #0F172A 0%,
            #1E293B 50%,
            #334155 100%
          );
        }
        .login-pattern {
          position: absolute;
          inset: 0;
          opacity: 0.04;
          background-image: radial-gradient(circle at 2px 2px, #FDE68A 1px, transparent 0);
          background-size: 32px 32px;
        }
        .login-container {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
        }
        .login-card {
          background: var(--color-surface);
          border-radius: var(--radius-2xl);
          padding: var(--space-8) var(--space-8);
          box-shadow: 0 32px 64px -12px rgba(0, 0, 0, 0.4);
          border: 1px solid var(--color-border);
        }
        .login-logo {
          text-align: center;
          margin-bottom: var(--space-6);
        }
        .login-logo-icon {
          font-size: 3rem;
          margin-bottom: var(--space-2);
        }
        .login-title {
          font-size: var(--text-3xl);
          font-weight: 800;
          color: var(--color-primary);
          letter-spacing: -0.02em;
          font-family: var(--font-latin);
        }
        .login-subtitle {
          font-size: 1.05rem;
          font-weight: 800;
          color: var(--color-text);
          margin-top: var(--space-1);
        }
        .login-subtitle-en {
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          font-family: var(--font-latin);
        }
        .login-form {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }
        .login-footer-text {
          text-align: center;
          font-size: var(--text-xs);
          color: var(--color-text-muted);
          margin-top: var(--space-6);
        }
      `}</style>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="login-page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0F172A', color: '#CBD5E1' }}>កំពុងដំណើរការ...</div>}>
      <LoginForm />
    </Suspense>
  )
}
