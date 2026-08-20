'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { Send, Hash, Users, MessageSquare, Shield, Smile, Sparkles, Circle, CheckCheck, Bell, ArrowLeft, Menu } from 'lucide-react'

interface MessageItem {
  id: string
  sender_name: string
  content: string
  created_at: string
  avatar_color?: string
  is_self?: boolean
}

export default function ChatPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [inputText, setInputText] = useState('')
  const [currentChannel, setCurrentChannel] = useState('general')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputText.trim()) return

    const newMessage: MessageItem = {
      id: Date.now().toString(),
      sender_name: user?.full_name || 'ខ្ញុំករុណា',
      content: inputText,
      created_at: new Date().toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit' }),
      avatar_color: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
      is_self: true,
    }

    setMessages(prev => [...prev, newMessage])
    setInputText('')
  }

  const channels = [
    { id: 'general', name: 'បន្ទប់ទូទៅ', en: 'General Discussion', icon: Hash, count: '3', color: '#D97706' },
    { id: 'monks', name: 'ក្រុមព្រះសង្ឃ', en: 'Monks Group', icon: Users, count: '12', color: '#2563EB' },
    { id: 'management', name: 'គណៈកម្មការវត្ត', en: 'Admin Council', icon: Shield, count: '5', color: '#7C3AED' },
  ]

  const activeCh = channels.find(c => c.id === currentChannel) || channels[0]

  return (
    <div className="animate-fadeIn space-y-4" style={{ paddingBottom: 'var(--space-6)' }}>
      
      {/* 🌟 Header Section with Back Button */}
      <div className="page-header" style={{ marginBottom: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1) {
                window.history.back()
              } else {
                router.push('/dashboard')
              }
            }}
            className="hover-lift"
            title="ថយក្រោយ / Go Back"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: '#FFFFFF',
              border: '1.5px solid #CBD5E1',
              color: '#0F172A',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              flexShrink: 0,
              zIndex: 10
            }}
          >
            <ArrowLeft size={20} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="page-title" style={{ fontSize: '1.4rem', margin: 0 }}>ការសន្ទនាផ្ទៃក្នុង (Internal Chat)</h1>
            <p className="page-subtitle" style={{ margin: '2px 0 0' }}>បន្ទប់ទំនាក់ទំនង ផ្ដល់ដំណឹងបន្ទាន់ និងប្រឹក្សាសង្ឃកិច្ចក្នុងវត្ត</p>
          </div>
        </div>
      </div>

      {/* 📱 Mobile Channel Switcher Tabs (Visible on Mobile) */}
      <div className="md:hidden" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {channels.map(ch => {
          const Icon = ch.icon
          const active = currentChannel === ch.id
          return (
            <button
              key={ch.id}
              onClick={() => setCurrentChannel(ch.id)}
              className="hover-lift"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 14px',
                borderRadius: '12px',
                border: active ? 'none' : '1px solid #E2E8F0',
                background: active ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : '#FFFFFF',
                color: active ? '#1C1917' : '#475569',
                fontWeight: 700,
                fontSize: '0.78rem',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: active ? '0 4px 12px rgba(217, 119, 6, 0.3)' : 'none'
              }}
            >
              <Icon size={15} color={active ? '#1C1917' : ch.color} />
              <span>{ch.name}</span>
              <span style={{ background: active ? 'rgba(0,0,0,0.15)' : '#F1F5F9', padding: '1px 6px', borderRadius: '8px', fontSize: '0.66rem' }}>
                {ch.count}
              </span>
            </button>
          )
        })}
      </div>

      {/* 🌟 Main Chat App Container */}
      <div 
        style={{ 
          background: '#FFFFFF', 
          borderRadius: '24px', 
          border: '1.5px solid #E2E8F0', 
          boxShadow: '0 10px 30px -10px rgba(0,0,0,0.06)',
          height: 'calc(100vh - 230px)', 
          minHeight: '480px',
          display: 'flex', 
          overflow: 'hidden' 
        }}
      >
        {/* 🌟 Left Channels Sidebar (Desktop Only) */}
        <div 
          style={{ 
            width: 280, 
            borderRight: '1.5px solid #E2E8F0', 
            background: '#F8FAFC', 
            padding: '20px 16px', 
            flexDirection: 'column', 
            gap: '16px' 
          }}
          className="hidden md:flex"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MessageSquare size={17} />
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#0F172A' }}>បន្ទប់សន្ទនា</span>
            </div>
            <span style={{ background: '#ECFDF5', color: '#065F46', padding: '2px 8px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 700 }}>Online</span>
          </div>

          {/* Channel buttons */}
          <div className="space-y-1.5 mt-1">
            {channels.map(ch => {
              const Icon = ch.icon
              const active = currentChannel === ch.id
              return (
                <button
                  key={ch.id}
                  onClick={() => setCurrentChannel(ch.id)}
                  className="hover-lift"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px',
                    borderRadius: '14px',
                    border: active ? 'none' : '1px solid #E2E8F0',
                    background: active ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : '#FFFFFF',
                    color: active ? '#1C1917' : '#334155',
                    cursor: 'pointer',
                    boxShadow: active ? '0 6px 14px rgba(217, 119, 6, 0.3)' : 'none',
                    textAlign: 'left'
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon size={16} color={active ? '#1C1917' : ch.color} />
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>{ch.name}</div>
                      <div style={{ fontSize: '0.68rem', opacity: 0.8, fontFamily: 'Plus Jakarta Sans' }}>{ch.en}</div>
                    </div>
                  </div>
                  <span style={{ background: active ? 'rgba(0,0,0,0.15)' : '#F1F5F9', padding: '2px 7px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 700 }}>
                    {ch.count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Mini info card */}
          <div style={{ marginTop: 'auto', padding: '14px', background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', borderRadius: '16px', border: '1px solid #FDE68A' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800, color: '#92400E', fontSize: '0.8rem', marginBottom: '4px' }}>
              <Sparkles size={14} />
              <span>ប្រព័ន្ធសុវត្ថិភាពខ្ពស់</span>
            </div>
            <p style={{ fontSize: '0.72rem', color: '#78350F', lineHeight: 1.4 }}>
              សារសន្ទនាត្រូវបានរក្សាទុកសុវត្ថិភាព សម្រាប់តែព្រះសង្ឃ និងគណៈកម្មការវត្តប៉ុណ្ណោះ។
            </p>
          </div>
        </div>

        {/* 🌟 Right Chat Main Window (Full Width on Mobile) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#FFFFFF', width: '100%' }}>
          
          {/* Channel Header Bar */}
          <div style={{ padding: '14px 18px', borderBottom: '1.5px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF' }}>
            <div className="flex items-center gap-2.5">
              <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: `${activeCh.color}15`, color: activeCh.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <activeCh.icon size={18} />
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>{activeCh.name} ({activeCh.en})</div>
                <div style={{ fontSize: '0.68rem', color: '#64748B' }}>កំពុងភ្ជាប់បណ្ដាញផ្ទៃក្នុងវត្តអារាម</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '4px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, whiteSpace: 'nowrap' }}>
                <Circle size={7} fill="#059669" color="#059669" />
                <span>Online</span>
              </span>
            </div>
          </div>

          {/* Messages Stream Container */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: '#FAFAFA' }}>
            {messages.map(msg => (
              <div
                key={msg.id}
                style={{
                  display: 'flex',
                  gap: '12px',
                  alignItems: 'flex-start',
                  alignSelf: msg.is_self ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  flexDirection: msg.is_self ? 'row-reverse' : 'row'
                }}
              >
                {/* User Avatar Bubble */}
                <div 
                  style={{ 
                    width: '36px', 
                    height: '36px', 
                    borderRadius: '12px', 
                    background: msg.avatar_color || 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', 
                    color: msg.is_self ? '#1C1917' : '#FFFFFF', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    flexShrink: 0,
                    boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                  }}
                >
                  {msg.sender_name.charAt(0)}
                </div>

                {/* Message Bubble Content */}
                <div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '4px', textAlign: msg.is_self ? 'right' : 'left' }}>
                    <strong style={{ color: '#1E293B' }}>{msg.sender_name}</strong> • <span className="font-latin">{msg.created_at}</span>
                  </div>

                  <div
                    className="hover-lift"
                    style={{
                      padding: '12px 18px',
                      borderRadius: '18px',
                      borderTopRightRadius: msg.is_self ? '4px' : '18px',
                      borderTopLeftRadius: msg.is_self ? '18px' : '4px',
                      background: msg.is_self 
                        ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' 
                        : '#FFFFFF',
                      color: msg.is_self ? '#1C1917' : '#0F172A',
                      fontWeight: msg.is_self ? 600 : 500,
                      fontSize: '0.9rem',
                      lineHeight: 1.5,
                      border: msg.is_self ? 'none' : '1.5px solid #E2E8F0',
                      boxShadow: msg.is_self 
                        ? '0 6px 16px rgba(217, 119, 6, 0.25)' 
                        : '0 4px 12px rgba(0,0,0,0.03)',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box Bar */}
          <form 
            onSubmit={handleSendMessage} 
            style={{ 
              padding: '16px 20px', 
              borderTop: '1.5px solid #E2E8F0', 
              display: 'flex', 
              gap: '12px',
              background: '#FFFFFF',
              alignItems: 'center'
            }}
          >
            <input
              type="text"
              className="form-control hover-lift"
              placeholder="វាយសាររបស់អ្នកនៅទីនេះ... Type a message..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              style={{ 
                flex: 1, 
                borderRadius: '14px', 
                border: '1.5px solid #CBD5E1', 
                padding: '12px 16px',
                fontSize: '0.9rem' 
              }}
            />
            <button 
              type="submit" 
              className="hover-lift"
              style={{ 
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                color: '#1C1917', 
                fontWeight: 800,
                border: 'none',
                padding: '12px 24px',
                borderRadius: '14px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 6px 16px rgba(217, 119, 6, 0.35)',
                fontSize: '0.88rem'
              }}
            >
              <Send size={16} />
              <span>ផ្ញើសារ</span>
            </button>
          </form>

        </div>
      </div>

    </div>
  )
}
