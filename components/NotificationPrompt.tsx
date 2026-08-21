'use client'

import React, { useState, useEffect } from 'react'
import { Bell, Sparkles, X, CheckCircle, Smartphone } from 'lucide-react'

export function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [showPrompt, setShowPrompt] = useState(false)
  const [isSupported, setIsSupported] = useState(true)

  useEffect(() => {
    // Check if Service Worker & Notification API supported
    if (typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})

      setPermission(Notification.permission)

      // If user hasn't chosen and hasn't dismissed before, show gentle prompt after 3s
      const dismissed = localStorage.getItem('systemmk_notif_prompt_dismissed')
      if (Notification.permission === 'default' && !dismissed) {
        const timer = setTimeout(() => setShowPrompt(true), 3000)
        return () => clearTimeout(timer)
      }
    } else {
      setIsSupported(false)
    }
  }, [])

  const requestPermission = async () => {
    if (!('Notification' in window)) return

    try {
      const result = await Notification.requestPermission()
      setPermission(result)
      setShowPrompt(false)

      if (result === 'granted') {
        // Send a celebratory welcome notification
        if ('serviceWorker' in navigator) {
          const reg = await navigator.serviceWorker.ready
          reg.showNotification('🎉 បានបើកការជូនដំណឹងជោគជ័យ!', {
            body: 'លោកអ្នកនឹងទទួលបានដំណឹងបុណ្យវត្ត វត្តមាន និងកម្មវិធីសំខាន់ៗលើអេក្រង់ទូរស័ព្ទជានិច្ច។',
            icon: '/app-logo.png',
            badge: '/app-logo.png',
            vibrate: [200, 100, 200]
          } as any)
        }
      }
    } catch {}
  }

  const dismissPrompt = () => {
    setShowPrompt(false)
    try {
      localStorage.setItem('systemmk_notif_prompt_dismissed', 'true')
    } catch {}
  }

  if (!showPrompt || !isSupported) return null

  return (
    <div 
      className="animate-fadeIn"
      style={{
        position: 'fixed',
        bottom: '80px',
        right: '16px',
        left: '16px',
        maxWidth: '400px',
        margin: '0 auto',
        background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 50%, #452C16 100%)',
        color: '#FFFFFF',
        borderRadius: '24px',
        padding: '18px 20px',
        boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.5)',
        border: '1.5px solid rgba(245, 158, 11, 0.45)',
        zIndex: 1000
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
        <div 
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
            color: '#1C1917',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)'
          }}
        >
          <Bell size={22} className="animate-bounce" />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#FEF3C7', margin: 0 }}>
              បើកការជូនដំណឹងលើទូរស័ព្ទ?
            </h4>
            <button 
              onClick={dismissPrompt} 
              style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: '2px' }}
            >
              <X size={16} />
            </button>
          </div>

          <p style={{ fontSize: '0.74rem', color: '#CBD5E1', lineHeight: 1.4, margin: '4px 0 12px 0' }}>
            ទទួលបានដំណឹងបុណ្យវត្ត កាលវិភាគសូត្រធម៌ និងវត្តមាន <strong>លើអេក្រង់ទូរស័ព្ទភ្លាមៗ</strong> ទោះបិទអេក្រង់ក៏ដោយ។
          </p>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={dismissPrompt}
              style={{
                flex: 1,
                padding: '8px 12px',
                borderRadius: '12px',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#CBD5E1',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              ពេលក្រោយ
            </button>
            <button
              onClick={requestPermission}
              className="hover-lift"
              style={{
                flex: 1.4,
                padding: '8px 14px',
                borderRadius: '12px',
                border: 'none',
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#1C1917',
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}
            >
              <Sparkles size={14} />
              <span>អនុញ្ញាត / Allow</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
