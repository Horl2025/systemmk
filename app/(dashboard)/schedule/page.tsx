'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Plus, Calendar as CalendarIcon, Clock, MapPin, Tag, CheckCircle2, UserCheck, Upload, Camera, X, Trash2, Edit3, Sparkles, AlertCircle, ShieldAlert, Sun, Moon, Sunrise, CalendarDays, CheckCircle, ArrowLeft } from 'lucide-react'
import { formatDate } from '@/lib/utils'

// Khmer 7 Days of the week with vibrant gradient themes
export const KHMER_DAYS = [
  { id: 'sun', kh: 'អាទិត្យ', fullKh: 'ថ្ងៃអាទិត្យ', en: 'Sunday', color: '#EF4444', gradient: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', bg: '#FEF2F2', border: '#FECACA', text: '#991B1B' }, // ក្រហម
  { id: 'mon', kh: 'ចន្ទ', fullKh: 'ថ្ងៃចន្ទ', en: 'Monday', color: '#F59E0B', gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },       // លឿងទុំ
  { id: 'tue', kh: 'អង្គារ', fullKh: 'ថ្ងៃអង្គារ', en: 'Tuesday', color: '#8B5CF6', gradient: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)', bg: '#F5F3FF', border: '#DDD6FE', text: '#5B21B6' },   // ស្វាយ
  { id: 'wed', kh: 'ពុធ', fullKh: 'ថ្ងៃពុធ', en: 'Wednesday', color: '#10B981', gradient: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46' },   // បៃតង
  { id: 'thu', kh: 'ព្រហស្បតិ៍', fullKh: 'ថ្ងៃព្រហស្បតិ៍', en: 'Thursday', color: '#3B82F6', gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF' }, // ខៀវ
  { id: 'fri', kh: 'សុក្រ', fullKh: 'ថ្ងៃសុក្រ', en: 'Friday', color: '#06B6D4', gradient: 'linear-gradient(135deg, #06B6D4 0%, #0891B2 100%)', bg: '#ECFEFF', border: '#A5F3FC', text: '#155E75' },    // ផ្ទៃមេឃ
  { id: 'sat', kh: 'សៅរ៍', fullKh: 'ថ្ងៃសៅរ៍', en: 'Saturday', color: '#A855F7', gradient: 'linear-gradient(135deg, #A855F7 0%, #9333EA 100%)', bg: '#FAF5FF', border: '#F3E8FF', text: '#6B21A8' },   // ព្រីងទុំ
]

export interface DailyScheduleItem {
  id: string
  title: string
  start_time: string
  end_time: string
  start_date?: string
  end_date?: string
  session: 'morning' | 'afternoon' | 'evening'
  days: string[] // e.g. ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
  location: string
  supervisor_name: string // អ្នកទទួលបន្ទុកត្រួតពិនិត្យ
  supervisor_role?: string
  participants: string // សមាជិកអនុវត្ត
  notes?: string
  photo_url?: string | null
}

export interface EventItem {
  id: string
  title: string
  title_en?: string
  description?: string
  event_type?: string
  start_date: string
  end_date?: string | null
  location?: string
  budget?: number
}

const INITIAL_DAILY_SCHEDULES: DailyScheduleItem[] = []
const INITIAL_EVENTS: EventItem[] = []

export default function SchedulePage() {
  const router = useRouter()
  const [dailySchedules, setDailySchedules] = useState<DailyScheduleItem[]>(INITIAL_DAILY_SCHEDULES)
  const [events, setEvents] = useState<EventItem[]>(INITIAL_EVENTS)
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all')
  const [viewTab, setViewTab] = useState<'daily' | 'events'>('events')
  
  // Modals state
  const [showAddScheduleModal, setShowAddScheduleModal] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<DailyScheduleItem | null>(null)
  
  const [showAddEventModal, setShowAddEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<EventItem | null>(null)

  // Filter daily schedules by selected day
  const filteredDaily = dailySchedules.filter(item => {
    if (selectedDayFilter === 'all') return true
    return item.days.includes(selectedDayFilter)
  })

  // Delete handlers
  const handleDeleteSchedule = (id: string) => {
    if (confirm('តើអ្នកពិតជាចង់លុបកាលវិភាគនេះមែនទេ?')) {
      setDailySchedules(prev => prev.filter(s => s.id !== id))
    }
  }

  const handleDeleteEvent = (id: string) => {
    if (confirm('តើអ្នកពិតជាចង់លុបពិធីបុណ្យ/ព្រឹត្តិការណ៍នេះមែនទេ?')) {
      setEvents(prev => prev.filter(e => e.id !== id))
    }
  }

  return (
    <div className="space-y-6 animate-fadeIn" style={{ paddingBottom: 'var(--space-8)' }}>
      
      {/* 🌟 Header with Back Button */}
      <div className="page-header" style={{ marginBottom: '12px' }}>
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
            <h1 className="page-title" style={{ fontSize: '1.4rem', margin: 0 }}>កាលវិភាគ & ព្រឹត្តិការណ៍វត្ត</h1>
            <p className="page-subtitle" style={{ margin: '2px 0 0' }}>គ្រប់គ្រងកាលវិភាគសកម្មភាពប្រចាំថ្ងៃ វេន និងអ្នកទទួលបន្ទុកត្រួតពិនិត្យ</p>
          </div>
        </div>
        <div className="page-header-actions" style={{ marginTop: '8px' }}>
          {viewTab === 'daily' ? (
            <button 
              className="btn btn-primary hover-lift" 
              onClick={() => {
                setEditingSchedule(null)
                setShowAddScheduleModal(true)
              }}
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#1C1917', fontWeight: 800, boxShadow: '0 6px 18px rgba(217, 119, 6, 0.35)' }}
            >
              <Plus size={16} />
              <span>បង្កើតកាលវិភាគថ្មី / Add Schedule</span>
            </button>
          ) : (
            <button 
              className="btn btn-primary hover-lift" 
              onClick={() => {
                setEditingEvent(null)
                setShowAddEventModal(true)
              }}
              style={{ background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#1C1917', fontWeight: 800, boxShadow: '0 6px 18px rgba(217, 119, 6, 0.35)' }}
            >
              <Plus size={16} />
              <span>បន្ថែមពិធីបុណ្យ / Add Event</span>
            </button>
          )}
        </div>
      </div>

      {/* 🌟 Main Tabs */}
      <div className="tabs">
        <button 
          className={`tab-item ${viewTab === 'daily' ? 'tab-item--active' : ''}`}
          onClick={() => setViewTab('daily')}
        >
          <Clock size={16} />
          <span>កាលវិភាគប្រចាំថ្ងៃ (Daily Routine Schedule) ({dailySchedules.length})</span>
        </button>
        <button 
          className={`tab-item ${viewTab === 'events' ? 'tab-item--active' : ''}`}
          onClick={() => setViewTab('events')}
        >
          <CalendarIcon size={16} />
          <span>ព្រឹត្តិការណ៍ និងពិធីបុណ្យ (Ceremonies & Events) ({events.length})</span>
        </button>
      </div>

      {/* 🌟 TAB 1: MODERN VIBRANT DAILY SCHEDULE */}
      {viewTab === 'daily' && (
        <div className="space-y-6">
          
          {/* 7 Days Filter Selector */}
          <div 
            style={{ 
              background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', 
              padding: '18px 20px', 
              borderRadius: '24px', 
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.3)',
              color: '#FFFFFF'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 800, color: '#FDE68A' }}>
                <CalendarDays size={18} />
                <span>ជ្រើសរើសចម្រាញ់តាមថ្ងៃទាំង ៧ (Filter by 7 Buddhist Days):</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 600 }}>
                បង្ហាញ: {filteredDaily.length} សកម្មភាព
              </span>
            </div>

            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
              <button
                onClick={() => setSelectedDayFilter('all')}
                className="hover-lift"
                style={{
                  background: selectedDayFilter === 'all' ? 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)' : 'rgba(255,255,255,0.08)',
                  color: selectedDayFilter === 'all' ? '#1C1917' : '#E2E8F0',
                  border: selectedDayFilter === 'all' ? 'none' : '1px solid rgba(255,255,255,0.15)',
                  padding: '9px 18px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: selectedDayFilter === 'all' ? '0 6px 16px rgba(245, 158, 11, 0.35)' : 'none'
                }}
              >
                🌟 ទាំងអស់ ({dailySchedules.length})
              </button>
              {KHMER_DAYS.map(d => {
                const isSelected = selectedDayFilter === d.id
                return (
                  <button
                    key={d.id}
                    onClick={() => setSelectedDayFilter(d.id)}
                    className="hover-lift"
                    style={{
                      background: isSelected ? d.gradient : 'rgba(255,255,255,0.06)',
                      color: isSelected ? '#FFFFFF' : '#CBD5E1',
                      border: isSelected ? 'none' : `1.5px solid ${d.color}40`,
                      padding: '9px 16px',
                      borderRadius: '14px',
                      fontWeight: 800,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '7px',
                      whiteSpace: 'nowrap',
                      boxShadow: isSelected ? `0 8px 18px -4px ${d.color}80` : 'none',
                      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <span style={{ width: '9px', height: '9px', borderRadius: '50%', background: isSelected ? '#FFFFFF' : d.color, boxShadow: `0 0 8px ${d.color}` }} />
                    <span>{d.fullKh}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Schedule Grid Cards - 2 Columns on Mobile */}
          <div className="mobile-2-col-grid" style={{ gap: '12px' }}>
            {filteredDaily.map(item => {
              const sessionConfig = {
                morning: { 
                  label: '🌅 វេនព្រឹក (Morning)', 
                  gradient: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)', 
                  badgeGradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                  badgeColor: '#1C1917',
                  border: '#FDE68A',
                  accent: '#D97706',
                  icon: <Sunrise size={15} />
                },
                afternoon: { 
                  label: '☀️ វេនរសៀល (Afternoon)', 
                  gradient: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', 
                  badgeGradient: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
                  badgeColor: '#FFFFFF',
                  border: '#BFDBFE',
                  accent: '#2563EB',
                  icon: <Sun size={15} />
                },
                evening: { 
                  label: '🌙 វេនយប់ (Evening)', 
                  gradient: 'linear-gradient(135deg, #FAF5FF 0%, #F3E8FF 100%)', 
                  badgeGradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
                  badgeColor: '#FFFFFF',
                  border: '#DDD6FE',
                  accent: '#7C3AED',
                  icon: <Moon size={15} />
                },
              }[item.session]

              return (
                <div 
                  key={item.id}
                  className="hover-lift"
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '24px',
                    border: `1.5px solid ${sessionConfig.border}`,
                    padding: '22px',
                    boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: sessionConfig.badgeGradient }} />

                  <div>
                    {/* Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <span 
                        style={{ 
                          background: sessionConfig.badgeGradient, 
                          color: sessionConfig.badgeColor, 
                          padding: '5px 12px', 
                          borderRadius: '12px', 
                          fontSize: '0.74rem', 
                          fontWeight: 800,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                        }}
                      >
                        {sessionConfig.icon}
                        <span>{sessionConfig.label}</span>
                      </span>

                      <div 
                        style={{ 
                          background: '#F8FAFC', 
                          border: '1.5px solid #E2E8F0', 
                          padding: '4px 10px', 
                          borderRadius: '12px', 
                          display: 'inline-flex', 
                          alignItems: 'center', 
                          gap: '6px', 
                          color: '#0F172A', 
                          fontWeight: 800, 
                          fontSize: '0.86rem' 
                        }}
                      >
                        <Clock size={15} color={sessionConfig.accent} />
                        <span className="font-latin">{item.start_time} - {item.end_time}</span>
                      </div>
                    </div>

                    {/* Schedule Image if present */}
                    {item.photo_url && (
                      <div style={{ width: '100%', height: '150px', borderRadius: '16px', overflow: 'hidden', marginBottom: '14px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
                        <img src={item.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}

                    {/* Title */}
                    <h3 style={{ fontSize: '1.12rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.35, marginBottom: '12px' }}>
                      {item.title}
                    </h3>

                    {/* Active Days */}
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '16px' }}>
                      {KHMER_DAYS.map(d => {
                        const isActive = item.days.includes(d.id)
                        if (!isActive) return null
                        return (
                          <span 
                            key={d.id}
                            style={{
                              background: d.gradient,
                              color: '#FFFFFF',
                              padding: '3px 9px',
                              borderRadius: '8px',
                              fontSize: '0.68rem',
                              fontWeight: 800,
                              boxShadow: `0 3px 8px -2px ${d.color}80`
                            }}
                          >
                            {d.kh}
                          </span>
                        )
                      })}
                    </div>

                    {/* Info box */}
                    <div 
                      style={{ 
                        background: 'linear-gradient(145deg, #F8FAFC 0%, #F1F5F9 100%)', 
                        borderRadius: '16px', 
                        padding: '14px', 
                        border: '1.5px solid #E2E8F0', 
                        fontSize: '0.78rem', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '8px' 
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFFFFF', padding: '7px 10px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                        <div style={{ width: '26px', height: '26px', borderRadius: '8px', background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <UserCheck size={14} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <span style={{ fontSize: '0.66rem', color: '#64748B', display: 'block', fontWeight: 600 }}>អ្នកទទួលបន្ទុកត្រួតពិនិត្យ (Supervisor):</span>
                          <strong style={{ color: '#065F46', fontSize: '0.82rem' }}>{item.supervisor_name}</strong>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 4px' }}>
                        <MapPin size={15} className="text-blue-600 flex-shrink-0" />
                        <span>ទីកន្លែង: <strong style={{ color: '#1E293B' }}>{item.location}</strong></span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '2px 4px' }}>
                        <CheckCircle size={15} className="text-amber-600 flex-shrink-0" />
                        <span>សមាជិកអនុវត្ត: <strong style={{ color: '#1E293B' }}>{item.participants}</strong></span>
                      </div>

                      {item.notes && (
                        <div style={{ color: '#64748B', fontStyle: 'italic', borderTop: '1px dashed #CBD5E1', paddingTop: '6px', fontSize: '0.72rem' }}>
                          💡 ចំណាំ: {item.notes}
                        </div>
                      )}
                    </div>

                  </div>

                  {/* Actions Bar with Edit & Delete */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '8px', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                    <button 
                      onClick={() => {
                        setEditingSchedule(item)
                        setShowAddScheduleModal(true)
                      }}
                      className="hover-lift"
                      style={{ 
                        background: '#EFF6FF', 
                        border: '1px solid #BFDBFE', 
                        color: '#2563EB', 
                        padding: '6px 14px', 
                        borderRadius: '10px', 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        cursor: 'pointer', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '5px' 
                      }}
                    >
                      <Edit3 size={14} />
                      <span>កែប្រែ</span>
                    </button>

                    <button 
                      onClick={() => handleDeleteSchedule(item.id)}
                      className="hover-lift"
                      style={{ 
                        background: '#FEF2F2', 
                        border: '1px solid #FECACA', 
                        color: '#DC2626', 
                        padding: '6px 14px', 
                        borderRadius: '10px', 
                        fontSize: '0.75rem', 
                        fontWeight: 800, 
                        cursor: 'pointer', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '5px' 
                      }}
                    >
                      <Trash2 size={14} />
                      <span>លុប</span>
                    </button>
                  </div>

                </div>
              )
            })}
          </div>

        </div>
      )}

      {/* 🌟 TAB 2: CEREMONIES & EVENTS (With Edit & Delete Buttons) */}
      {viewTab === 'events' && (
        <div className="mobile-2-col-grid" style={{ gap: '12px' }}>
          {events.map((event, idx) => {
            const eventGradients = [
              { border: '#FDE68A', strip: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', badgeBg: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', badgeText: '#78350F', badgeBorder: '#F59E0B' },
              { border: '#BFDBFE', strip: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', badgeBg: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)', badgeText: '#1E3A8A', badgeBorder: '#3B82F6' },
              { border: '#A7F3D0', strip: 'linear-gradient(135deg, #10B981 0%, #047857 100%)', badgeBg: 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)', badgeText: '#064E3B', badgeBorder: '#10B981' },
              { border: '#DDD6FE', strip: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', badgeBg: 'linear-gradient(135deg, #FAF5FF 0%, #EDE9FE 100%)', badgeText: '#4C1D95', badgeBorder: '#8B5CF6' },
            ][idx % 4]

            return (
              <div 
                key={event.id} 
                className="hover-lift"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '24px',
                  border: `1.5px solid ${eventGradients.border}`,
                  padding: '22px',
                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '16px',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '5px', background: eventGradients.strip }} />

                <div>
                  {/* Header: Title & Event Type Badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.3 }}>{event.title}</h3>
                      {event.title_en && <p style={{ fontSize: '0.74rem', color: '#64748B', fontFamily: 'Plus Jakarta Sans', marginTop: '2px' }}>{event.title_en}</p>}
                    </div>
                    <span 
                      style={{ 
                        background: eventGradients.badgeBg, 
                        border: `1px solid ${eventGradients.badgeBorder}`, 
                        color: eventGradients.badgeText, 
                        padding: '4px 12px', 
                        borderRadius: '12px', 
                        fontSize: '0.72rem', 
                        fontWeight: 800,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      🎪 {event.event_type || 'ពិធីបុណ្យ'}
                    </span>
                  </div>

                  {/* Description */}
                  {event.description && (
                    <p style={{ fontSize: '0.82rem', color: '#334155', lineHeight: 1.5, marginBottom: '14px' }}>
                      {event.description}
                    </p>
                  )}

                  {/* Information Cards */}
                  <div style={{ background: 'linear-gradient(145deg, #F8FAFC 0%, #F1F5F9 100%)', borderRadius: '16px', padding: '14px', border: '1.5px solid #E2E8F0', fontSize: '0.78rem', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CalendarIcon size={15} className="text-amber-600 flex-shrink-0" />
                      <span>កាលបរិច្ឆេទ: <strong style={{ color: '#0F172A' }}>{formatDate(event.start_date)}</strong> {event.end_date ? ` ដល់ ${formatDate(event.end_date)}` : ''}</span>
                    </div>

                    {event.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={15} className="text-blue-600 flex-shrink-0" />
                        <span>ទីតាំង: <strong style={{ color: '#1E293B' }}>{event.location}</strong></span>
                      </div>
                    )}

                    {event.budget && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Tag size={15} className="text-emerald-600 flex-shrink-0" />
                        <span>ថវិកាគ្រោង: <strong style={{ color: '#065F46', fontSize: '0.86rem' }}>{event.budget.toLocaleString()} ៛</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Action with Edit & Delete Buttons */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '12px' }}>
                  <span style={{ fontSize: '0.7rem', color: '#059669', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <Sparkles size={13} /> ត្រៀមរៀបចំពិធី
                  </span>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button 
                      onClick={() => {
                        setEditingEvent(event)
                        setShowAddEventModal(true)
                      }}
                      className="hover-lift"
                      style={{ 
                        background: '#EFF6FF', 
                        border: '1px solid #BFDBFE', 
                        color: '#2563EB', 
                        padding: '5px 12px', 
                        borderRadius: '10px', 
                        fontSize: '0.74rem', 
                        fontWeight: 800, 
                        cursor: 'pointer', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px' 
                      }}
                    >
                      <Edit3 size={13} />
                      <span>កែប្រែ</span>
                    </button>

                    <button 
                      onClick={() => handleDeleteEvent(event.id)}
                      className="hover-lift"
                      style={{ 
                        background: '#FEF2F2', 
                        border: '1px solid #FECACA', 
                        color: '#DC2626', 
                        padding: '5px 12px', 
                        borderRadius: '10px', 
                        fontSize: '0.74rem', 
                        fontWeight: 800, 
                        cursor: 'pointer', 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '4px' 
                      }}
                    >
                      <Trash2 size={13} />
                      <span>លុប</span>
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Modal: Add or Edit Daily Schedule */}
      {showAddScheduleModal && (
        <AddDailyScheduleModal 
          initialData={editingSchedule}
          onClose={() => {
            setShowAddScheduleModal(false)
            setEditingSchedule(null)
          }} 
          onSave={(item) => {
            if (editingSchedule) {
              setDailySchedules(prev => prev.map(s => s.id === item.id ? item : s))
            } else {
              setDailySchedules(prev => [...prev, item])
            }
          }} 
        />
      )}

      {/* Modal: Add or Edit Event */}
      {showAddEventModal && (
        <AddEventModal 
          initialData={editingEvent}
          onClose={() => {
            setShowAddEventModal(false)
            setEditingEvent(null)
          }} 
          onSave={(item) => {
            if (editingEvent) {
              setEvents(prev => prev.map(e => e.id === item.id ? item : e))
            } else {
              setEvents(prev => [item, ...prev])
            }
          }} 
        />
      )}

    </div>
  )
}

function AddDailyScheduleModal({ initialData, onClose, onSave }: { initialData?: DailyScheduleItem | null; onClose: () => void; onSave: (item: DailyScheduleItem) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData?.photo_url || null)
  
  const [form, setForm] = useState({
    title: initialData?.title || '',
    start_time: initialData?.start_time || '០៧:៣០',
    end_time: initialData?.end_time || '០៨:៣០',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    session: (initialData?.session || 'morning') as 'morning' | 'afternoon' | 'evening',
    days: initialData?.days || ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'],
    location: initialData?.location || '',
    supervisor_name: initialData?.supervisor_name || '',
    participants: initialData?.participants || 'ព្រះសង្ឃគ្រប់អង្គ',
    notes: initialData?.notes || '',
  })

  const toggleDay = (dayId: string) => {
    setForm(prev => {
      const exists = prev.days.includes(dayId)
      if (exists) {
        return { ...prev, days: prev.days.filter(d => d !== dayId) }
      } else {
        return { ...prev, days: [...prev.days, dayId] }
      }
    })
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (form.days.length === 0) {
      alert('សូមជ្រើសរើសយ៉ាងហោចណាស់ ១ថ្ងៃក្នុងសប្ដាហ៍!')
      return
    }

    const item: DailyScheduleItem = {
      id: initialData?.id || Date.now().toString(),
      title: form.title,
      start_time: form.start_time,
      end_time: form.end_time,
      start_date: form.start_date || undefined,
      end_date: form.end_date || undefined,
      session: form.session,
      days: form.days,
      location: form.location || 'វត្តអារាម',
      supervisor_name: form.supervisor_name || 'ព្រះមេកុដិ',
      participants: form.participants || 'ព្រះសង្ឃ',
      notes: form.notes || undefined,
      photo_url: photoPreview || null,
    }

    onSave(item)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg animate-fadeIn" style={{ maxWidth: '780px', borderRadius: '28px', overflow: 'hidden', border: '1.5px solid #FDE68A', boxShadow: '0 25px 50px -12px rgba(217, 119, 6, 0.25)', padding: 0 }}>
        
        {/* Luxury Glowing Dark Header */}
        <div style={{ background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 50%, #452C16 100%)', padding: '20px 24px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)' }}>
              <Clock size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FEF3C7', margin: 0 }}>
                {initialData ? 'កែប្រែកាលវិភាគសកម្មភាពប្រចាំថ្ងៃ' : 'បង្កើតកាលវិភាគសកម្មភាពប្រចាំថ្ងៃថ្មី'}
              </h3>
              <p style={{ fontSize: '0.68rem', color: '#D1D5DB', margin: 0, marginTop: '2px' }}>
                Daily Routine Schedule & Supervisor Settings
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4" style={{ padding: '22px 24px', background: '#FAFAFA' }}>
            
            {/* 1. Photo Upload */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', background: '#F8FAFC', borderRadius: '16px', border: '1.5px dashed #CBD5E1' }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  width: '74px', 
                  height: '74px', 
                  borderRadius: '16px', 
                  background: photoPreview ? '#FFFFFF' : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', 
                  border: '2px solid #F59E0B', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  overflow: 'hidden',
                  flexShrink: 0
                }}
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <Camera size={22} color="#B45309" />
                    <span style={{ fontSize: '0.6rem', fontWeight: 800, color: '#78350F', marginTop: '2px' }}>រូបភាព</span>
                  </>
                )}
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>រូបភាពសកម្មភាព / កាលវិភាគ</h4>
                <p style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '2px' }}>ដាក់រូបភាពកាលវិភាគ ឬរូបភាពសកម្មភាពសង្ឃកិច្ច</p>
                <div style={{ display: 'flex', gap: '6px', marginTop: '6px' }}>
                  <button type="button" onClick={() => fileInputRef.current?.click()} style={{ background: '#FFFFFF', border: '1px solid #CBD5E1', padding: '5px 12px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                    {photoPreview ? 'ប្ដូររូប' : 'ជ្រើសរើសរូបថត'}
                  </button>
                  {photoPreview && (
                    <button type="button" onClick={() => setPhotoPreview(null)} style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#DC2626', padding: '5px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer' }}>
                      លុប
                    </button>
                  )}
                </div>
                <input type="file" ref={fileInputRef} onChange={handlePhotoChange} accept="image/*" style={{ display: 'none' }} />
              </div>
            </div>

            {/* 2. Title */}
            <div className="form-group">
              <label className="form-label">ឈ្មោះសកម្មភាព / Activity Name <span className="required">*</span></label>
              <input 
                className="form-control" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                required 
                placeholder="ឧ. ថ្វាយបង្គំព្រះពេលព្រឹក និងចម្រើនសមាធិ" 
              />
            </div>

            {/* 3. Date & Time */}
            <div className="grid-cols-2 gap-3" style={{ display: 'grid' }}>
              <div className="form-group">
                <label className="form-label">ម៉ោងចាប់ផ្ដើម <span className="required">*</span></label>
                <input 
                  className="form-control" 
                  value={form.start_time} 
                  onChange={e => setForm({...form, start_time: e.target.value})} 
                  required 
                  placeholder="ឧ. ០៤:៣០" 
                />
              </div>
              <div className="form-group">
                <label className="form-label">ម៉ោងបញ្ចប់ <span className="required">*</span></label>
                <input 
                  className="form-control" 
                  value={form.end_time} 
                  onChange={e => setForm({...form, end_time: e.target.value})} 
                  required 
                  placeholder="ឧ. ០៥:៣០" 
                />
              </div>
            </div>

            <div className="grid-cols-2 gap-3" style={{ display: 'grid' }}>
              <div className="form-group">
                <label className="form-label">ថ្ងៃចាប់ផ្ដើមអនុវត្ត</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={form.start_date} 
                  onChange={e => setForm({...form, start_date: e.target.value})} 
                />
              </div>
              <div className="form-group">
                <label className="form-label">ថ្ងៃត្រូវបញ្ចប់</label>
                <input 
                  type="date" 
                  className="form-control" 
                  value={form.end_date} 
                  onChange={e => setForm({...form, end_date: e.target.value})} 
                />
              </div>
            </div>

            {/* 4. 7 Days Selection */}
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '16px', padding: '14px' }}>
              <label className="form-label" style={{ fontWeight: 800, color: '#92400E', marginBottom: '8px' }}>
                🎨 ថ្ងៃទាំង ៧ ត្រូវអនុវត្ត (Select Days with Buddhist Colors) <span className="required">*</span>
              </label>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {KHMER_DAYS.map(d => {
                  const isChecked = form.days.includes(d.id)
                  return (
                    <button
                      type="button"
                      key={d.id}
                      onClick={() => toggleDay(d.id)}
                      style={{
                        background: isChecked ? d.gradient : '#FFFFFF',
                        color: isChecked ? '#FFFFFF' : d.text,
                        border: `1.5px solid ${d.border}`,
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontWeight: 800,
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '5px',
                        boxShadow: isChecked ? `0 4px 10px -2px ${d.color}80` : 'none'
                      }}
                    >
                      <span>{isChecked ? '✓' : '+'}</span>
                      <span>{d.fullKh}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* 5. Session, Supervisor & Location */}
            <div className="grid-cols-2 gap-3" style={{ display: 'grid' }}>
              <div className="form-group">
                <label className="form-label">វេន (Session) <span className="required">*</span></label>
                <select 
                  className="form-control" 
                  value={form.session} 
                  onChange={e => setForm({...form, session: e.target.value as any})}
                >
                  <option value="morning">🌅 វេនព្រឹក (Morning)</option>
                  <option value="afternoon">☀️ វេនរសៀល (Afternoon)</option>
                  <option value="evening">🌙 វេនយប់ (Evening)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">អ្នកទទួលបន្ទុកត្រួតពិនិត្យ (Supervisor) <span className="required">*</span></label>
                <input 
                  className="form-control" 
                  value={form.supervisor_name} 
                  onChange={e => setForm({...form, supervisor_name: e.target.value})} 
                  required 
                  placeholder="ឧ. ព្រះមេកុដិ / ព្រះវិន័យធរ..." 
                />
              </div>
            </div>

            <div className="grid-cols-2 gap-3" style={{ display: 'grid' }}>
              <div className="form-group">
                <label className="form-label">ទីកន្លែងអនុវត្ត (Location)</label>
                <input 
                  className="form-control" 
                  value={form.location} 
                  onChange={e => setForm({...form, location: e.target.value})} 
                  placeholder="ឧ. ព្រះវិហារ, សាលាឆាន់..." 
                />
              </div>

              <div className="form-group">
                <label className="form-label">សមាជិកអនុវត្ត (Participants)</label>
                <input 
                  className="form-control" 
                  value={form.participants} 
                  onChange={e => setForm({...form, participants: e.target.value})} 
                  placeholder="ឧ. ព្រះសង្ឃគ្រប់អង្គ / សាមណេរ..." 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">កំណត់ចំណាំបន្ថែម</label>
              <textarea 
                className="form-control" 
                value={form.notes} 
                onChange={e => setForm({...form, notes: e.target.value})} 
                rows={2} 
                placeholder="ចំណាំការត្រួតពិនិត្យ..." 
              />
            </div>

          </div>
          <div className="modal-footer" style={{ padding: '16px 24px', background: '#FFFFFF', borderTop: '1.5px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="hover-lift"
              style={{ background: '#F1F5F9', border: '1.5px solid #CBD5E1', color: '#475569', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
            >
              បោះបង់
            </button>
            <button 
              type="submit" 
              className="hover-lift"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#1C1917',
                fontWeight: 800,
                border: 'none',
                padding: '10px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(217, 119, 6, 0.35)',
                fontSize: '0.84rem'
              }}
            >
              {initialData ? '✨ រក្សាទុកការកែប្រែ / Update Schedule' : '✨ រក្សាទុកកាលវិភាគ / Save Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function AddEventModal({ initialData, onClose, onSave }: { initialData?: EventItem | null; onClose: () => void; onSave: (item: EventItem) => void }) {
  const [form, setForm] = useState({
    title: initialData?.title || '',
    title_en: initialData?.title_en || '',
    description: initialData?.description || '',
    event_type: initialData?.event_type || 'ceremony',
    start_date: initialData?.start_date || '',
    end_date: initialData?.end_date || '',
    location: initialData?.location || '',
    budget: initialData?.budget ? String(initialData.budget) : '',
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const item: EventItem = {
      id: initialData?.id || Date.now().toString(),
      title: form.title,
      title_en: form.title_en || undefined,
      description: form.description || undefined,
      event_type: form.event_type,
      start_date: form.start_date,
      end_date: form.end_date || null,
      location: form.location || undefined,
      budget: form.budget ? Number(form.budget) : 0,
    }

    onSave(item)

    if (!initialData) {
      alert(`📢 ដំណឹងពិធីបុណ្យត្រូវបានបញ្ជូនទៅរាល់អ្នកប្រើប្រាស់គ្រប់គ្នា!\n\nកម្មវិធី៖ ${form.title}\nកាលបរិច្ឆេទ៖ ${form.start_date}${form.end_date ? ' ដល់ ' + form.end_date : ''}\nទីកន្លែង៖ ${form.location || 'វត្តអារាម'}\n\n✓ សារនេះត្រូវបានប្រកាសជាផ្លូវការនៅក្នុងបន្ទប់សន្ទនាផ្ទៃក្នុង និងសេចក្ដីជូនដំណឹងវត្តរួចរាល់។`)
    }

    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md animate-fadeIn" style={{ maxWidth: '620px', borderRadius: '26px', overflow: 'hidden', border: '1.5px solid #FDE68A', boxShadow: '0 25px 50px -12px rgba(217, 119, 6, 0.25)', padding: 0 }}>
        
        {/* Luxury Glowing Dark Header */}
        <div style={{ background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 50%, #452C16 100%)', padding: '20px 24px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(245, 158, 11, 0.3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)' }}>
              <Sparkles size={20} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FEF3C7', margin: 0 }}>
                {initialData ? 'កែប្រែកម្មវិធីបុណ្យ ឬព្រឹត្តិការណ៍' : 'បន្ថែមកម្មវិធីបុណ្យ ឬព្រឹត្តិការណ៍ថ្មី'}
              </h3>
              <p style={{ fontSize: '0.68rem', color: '#D1D5DB', margin: 0, marginTop: '2px' }}>
                Event & Ceremony Information Form
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFFFFF', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4" style={{ padding: '22px 24px', background: '#FAFAFA' }}>
            
            {/* 1. Title (Khmer & English) */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, color: '#1E293B' }}>ឈ្មោះកម្មវិធីបុណ្យ (ភាសាខ្មែរ) <span className="required">*</span></label>
              <input 
                className="form-control hover-lift" 
                value={form.title} 
                onChange={e => setForm({...form, title: e.target.value})} 
                required 
                placeholder="ឧ. បុណ្យពិសាខបូជា, បុណ្យកឋិនទាន..." 
                style={{ borderRadius: '14px', border: '1.5px solid #CBD5E1', padding: '11px 14px', background: '#FFFFFF' }}
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, color: '#1E293B' }}>ឈ្មោះជាភាសាអង់គ្លេស (Latin Name)</label>
              <input 
                className="form-control hover-lift" 
                value={form.title_en} 
                onChange={e => setForm({...form, title_en: e.target.value})} 
                placeholder="Ex. Visak Bochea Day, Kathina Ceremony" 
                style={{ borderRadius: '14px', border: '1.5px solid #CBD5E1', padding: '11px 14px', background: '#FFFFFF' }}
              />
            </div>

            {/* 2. Start & End Date */}
            <div className="grid-cols-2 gap-3" style={{ display: 'grid' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 800, color: '#1E293B' }}>ថ្ងៃចាប់ផ្ដើម <span className="required">*</span></label>
                <input 
                  type="date" 
                  className="form-control hover-lift" 
                  value={form.start_date} 
                  onChange={e => setForm({...form, start_date: e.target.value})} 
                  required 
                  style={{ borderRadius: '14px', border: '1.5px solid #CBD5E1', padding: '10px 14px', background: '#FFFFFF' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 800, color: '#1E293B' }}>ថ្ងៃបញ្ចប់</label>
                <input 
                  type="date" 
                  className="form-control hover-lift" 
                  value={form.end_date} 
                  onChange={e => setForm({...form, end_date: e.target.value})} 
                  style={{ borderRadius: '14px', border: '1.5px solid #CBD5E1', padding: '10px 14px', background: '#FFFFFF' }}
                />
              </div>
            </div>

            {/* 3. Location & Budget */}
            <div className="grid-cols-2 gap-3" style={{ display: 'grid' }}>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 800, color: '#1E293B' }}>ទីកន្លែងរៀបចំ</label>
                <input 
                  className="form-control hover-lift" 
                  value={form.location} 
                  onChange={e => setForm({...form, location: e.target.value})} 
                  placeholder="ឧ. ព្រះវិហារ, សាលាឆាន់..." 
                  style={{ borderRadius: '14px', border: '1.5px solid #CBD5E1', padding: '11px 14px', background: '#FFFFFF' }}
                />
              </div>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 800, color: '#1E293B' }}>ថវិកាគ្រោង (KHR)</label>
                <input 
                  type="number" 
                  className="form-control hover-lift" 
                  value={form.budget} 
                  onChange={e => setForm({...form, budget: e.target.value})} 
                  placeholder="0" 
                  style={{ borderRadius: '14px', border: '1.5px solid #CBD5E1', padding: '11px 14px', background: '#FFFFFF' }}
                />
              </div>
            </div>

            {/* 4. Description */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 800, color: '#1E293B' }}>ការពិពណ៌នាកម្មវិធី</label>
              <textarea 
                className="form-control hover-lift" 
                value={form.description} 
                onChange={e => setForm({...form, description: e.target.value})} 
                rows={2} 
                placeholder="ពិពណ៌នាអំពីលំដាប់លំដោយពិធីបុណ្យ..." 
                style={{ borderRadius: '14px', border: '1.5px solid #CBD5E1', padding: '11px 14px', background: '#FFFFFF' }}
              />
            </div>

          </div>

          <div className="modal-footer" style={{ padding: '16px 24px', background: '#FFFFFF', borderTop: '1.5px solid #F1F5F9', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button 
              type="button" 
              onClick={onClose}
              className="hover-lift"
              style={{ background: '#F1F5F9', border: '1.5px solid #CBD5E1', color: '#475569', padding: '10px 20px', borderRadius: '12px', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}
            >
              បោះបង់
            </button>
            <button 
              type="submit" 
              className="hover-lift"
              style={{
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                color: '#1C1917',
                fontWeight: 800,
                border: 'none',
                padding: '10px 24px',
                borderRadius: '12px',
                cursor: 'pointer',
                boxShadow: '0 8px 20px rgba(217, 119, 6, 0.35)',
                fontSize: '0.84rem'
              }}
            >
              {initialData ? '✨ រក្សាទុកការកែប្រែ / Update' : '✨ រក្សាទុក / Save Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
