'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Monk } from '@/lib/database.types'
import { ATTENDANCE_STATUS_LABELS, SESSION_LABELS, today } from '@/lib/utils'
import { CheckCircle, XCircle, Clock, AlertCircle, Save, Calendar, Check, Users, Sparkles, QrCode, Search, Filter, CheckCheck, Camera, UserCheck, Flame, ArrowLeft } from 'lucide-react'

type Session = 'morning' | 'afternoon' | 'evening'
type Status = 'present' | 'absent' | 'leave' | 'sick'

const INITIAL_DEMO_MONKS: Monk[] = [
  { id: '1', khmer_name: 'ព្រះមហា សុខ វិបុល', latin_name: 'Ven. Sok Vibul', rank: 'bhikkhu', photo_url: null } as any,
  { id: '2', khmer_name: 'សាមណេរ ចាន់ រ៉ា', latin_name: 'Novice Chan Ra', rank: 'samanera', photo_url: null } as any,
  { id: '3', khmer_name: 'ព្រះគ្រូ ឡុង សារ៉េត', latin_name: 'Ven. Long Sareth', rank: 'chief_monk', photo_url: null } as any,
  { id: '4', khmer_name: 'ភិក្ខុ ឌុក សម្បត្តិ', latin_name: 'Ven. Duk Sambath', rank: 'bhikkhu', photo_url: null } as any,
  { id: '5', khmer_name: 'សាមណេរ ហេង វុទ្ធី', latin_name: 'Novice Heng Vutha', rank: 'samanera', photo_url: null } as any,
  { id: '6', khmer_name: 'ភិក្ខុ សេង សុវណ្ណារ៉ា', latin_name: 'Ven. Seng Sovannara', rank: 'teacher', photo_url: null } as any,
]

export default function AttendancePage() {
  const router = useRouter()
  const [monks, setMonks] = useState<Monk[]>(INITIAL_DEMO_MONKS)
  const [records, setRecords] = useState<Record<string, Status>>({
    '1': 'present',
    '2': 'present',
    '3': 'present',
    '4': 'leave',
    '5': 'present',
    '6': 'present',
  })
  const [session, setSession] = useState<Session>('morning')
  const [date, setDate] = useState(today())
  const [searchTerm, setSearchTerm] = useState('')
  const [filterRank, setFilterRank] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid')
  const [showQRScanner, setShowQRScanner] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    async function loadData() {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-systemmk.supabase.co') {
        try {
          const { data: monkData } = await supabase
            .from('monks')
            .select('*')
            .eq('is_active', true)
            .neq('status', 'left')
            .order('khmer_name')
          
          if (monkData && monkData.length > 0) {
            setMonks(monkData as unknown as Monk[])
          }
        } catch {
          // fallback
        }
      }
    }
    loadData()
  }, [])

  function handleSave() {
    setSaving(true)
    setTimeout(() => {
      setSaving(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
    }, 300)
  }

  const setStatus = (monkId: string, status: Status) => {
    setRecords(prev => ({ ...prev, [monkId]: status }))
  }

  const setAll = (status: Status) => {
    const next: Record<string, Status> = {}
    monks.forEach(m => { next[m.id] = status })
    setRecords(next)
  }

  // Filter monks by search and rank
  const filteredMonks = monks.filter(m => {
    const matchSearch = m.khmer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (m.latin_name && m.latin_name.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchRank = filterRank === 'all' || m.rank === filterRank
    return matchSearch && matchRank
  })

  const statusCounts = {
    present: Object.values(records).filter(s => s === 'present').length,
    absent: Object.values(records).filter(s => s === 'absent').length,
    leave: Object.values(records).filter(s => s === 'leave').length,
    sick: Object.values(records).filter(s => s === 'sick').length,
  }

  const StatusButton = ({ monkId, status }: { monkId: string; status: Status }) => {
    const icons: Record<Status, React.ReactNode> = {
      present: <CheckCircle size={15} />,
      absent: <XCircle size={15} />,
      leave: <Clock size={15} />,
      sick: <AlertCircle size={15} />,
    }
    const colors: Record<Status, { bg: string; text: string; border: string }> = {
      present: { bg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', text: '#FFFFFF', border: '#059669' },
      absent: { bg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)', text: '#FFFFFF', border: '#DC2626' },
      leave: { bg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', text: '#1C1917', border: '#D97706' },
      sick: { bg: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)', text: '#FFFFFF', border: '#C2410C' },
    }
    const current = records[monkId] || 'present'
    const isSelected = current === status
    return (
      <button
        type="button"
        className="hover-lift"
        style={{
          border: `1.5px solid ${isSelected ? colors[status].border : '#CBD5E1'}`,
          background: isSelected ? colors[status].bg : '#FFFFFF',
          color: isSelected ? colors[status].text : '#475569',
          padding: '6px 12px',
          borderRadius: '12px',
          fontWeight: isSelected ? 800 : 600,
          boxShadow: isSelected ? '0 6px 14px rgba(0,0,0,0.15)' : 'none',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '5px',
          cursor: 'pointer',
          fontSize: '0.78rem'
        }}
        onClick={() => setStatus(monkId, status)}
        title={`${ATTENDANCE_STATUS_LABELS[status]?.kh} / ${ATTENDANCE_STATUS_LABELS[status]?.en}`}
      >
        {icons[status]}
        <span>{ATTENDANCE_STATUS_LABELS[status]?.kh}</span>
      </button>
    )
  }

  return (
    <div className="animate-fadeIn space-y-6" style={{ paddingBottom: 'var(--space-8)' }}>
      
      {/* 🌟 Header Section with Back Button */}
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
            <h1 className="page-title" style={{ fontSize: '1.4rem', margin: 0 }}>វត្តមានប្រចាំថ្ងៃ (Daily Attendance)</h1>
            <p className="page-subtitle" style={{ margin: '2px 0 0' }}>ស្រង់វត្តមានសង្ឃកិច្ចលឿនរហ័ស ងាយស្រួល និងសុក្រឹត — {monks.length} អង្គ</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', width: '100%', maxWidth: '500px', marginTop: '6px' }}>
          <button
            className="hover-lift"
            onClick={() => setShowQRScanner(!showQRScanner)}
            style={{
              background: '#F1F5F9',
              border: '1.5px solid #CBD5E1',
              color: '#1E293B',
              padding: '9px 12px',
              borderRadius: '12px',
              fontWeight: 800,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              fontSize: '0.78rem',
              whiteSpace: 'nowrap',
              flex: '1 1 auto',
              minWidth: '95px'
            }}
          >
            <QrCode size={15} />
            <span>ស្កេន QR</span>
          </button>

          <input 
            type="date" 
            className="form-control hover-lift" 
            value={date} 
            onChange={e => setDate(e.target.value)} 
            style={{ fontWeight: 600, borderRadius: '12px', border: '1.5px solid #CBD5E1', padding: '8px 10px', fontSize: '0.8rem', flex: '1 1 auto', minWidth: '110px' }} 
          />
          <button 
            className="hover-lift" 
            onClick={handleSave} 
            disabled={saving}
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#1C1917',
              fontWeight: 800,
              padding: '9px 14px',
              borderRadius: '12px',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(217, 119, 6, 0.35)',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
              flex: '1 1 auto'
            }}
          >
            {saving ? <span className="spinner" /> : saved ? <Check size={15} /> : <Save size={15} />}
            <span>{saved ? 'រក្សាទុករួច ✓' : 'រក្សាទុក / Save'}</span>
          </button>
        </div>
      </div>

      {/* 🌟 Quick QR Scanner Live Stream Modal */}
      {showQRScanner && (
        <AttendanceCameraScannerModal 
          monks={monks}
          onClose={() => setShowQRScanner(false)}
          onScanSuccess={(monkId, monkName) => {
            setStatus(monkId, 'present')
            alert(`✓ ស្កេនវត្តមានជោគជ័យ! ${monkName} បានចុះវត្តមានរួចរាល់។`)
          }}
        />
      )}

      {/* 🌟 Session Tabs with Vibrant Colors */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '2px solid #E2E8F0', paddingBottom: '10px', overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
        {[
          { key: 'morning', icon: '🌅', labelKh: 'វេនព្រឹក', labelEn: 'Morning', activeBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', activeText: '#1C1917' },
          { key: 'afternoon', icon: '☀️', labelKh: 'វេនរសៀល', labelEn: 'Afternoon', activeBg: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)', activeText: '#FFFFFF' },
          { key: 'evening', icon: '🌙', labelKh: 'វេនយប់', labelEn: 'Evening', activeBg: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)', activeText: '#FFFFFF' },
        ].map(s => {
          const isActive = session === s.key
          return (
            <button 
              key={s.key} 
              className="hover-lift"
              onClick={() => setSession(s.key as Session)}
              style={{
                background: isActive ? s.activeBg : '#FFFFFF',
                color: isActive ? s.activeText : '#475569',
                border: isActive ? 'none' : '1.5px solid #E2E8F0',
                padding: '8px 14px',
                borderRadius: '12px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: isActive ? '0 6px 14px rgba(0,0,0,0.12)' : 'none',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flex: '1 1 auto',
                justifyContent: 'center'
              }}
            >
              <span>{s.icon}</span>
              <span>{s.labelKh}</span>
              <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>• {s.labelEn}</span>
            </button>
          )
        })}
      </div>

      {/* 🌟 4 VIVID GRADIENT KPI CARDS - 2 COLUMNS STRICT ON MOBILE */}
      <div className="mobile-2-col-grid" style={{ gap: '10px' }}>
        
        {/* Card 1: Present (Emerald Green) */}
        <div 
          className="hover-lift"
          style={{
            background: 'linear-gradient(135deg, #059669 0%, #047857 50%, #064E3B 100%)',
            borderRadius: '18px',
            padding: '12px 14px',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px -5px rgba(5, 150, 105, 0.4)',
            border: '1px solid rgba(167, 243, 208, 0.3)',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>មានវត្តមាន / PRESENT</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                {statusCounts.present} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1FAE5' }}>អង្គ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#6EE7B7', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            សមាមាត្រ: {((statusCounts.present / monks.length) * 100).toFixed(0)}% នៃសរុប
          </div>
        </div>

        {/* Card 2: Absent (Ruby Red) */}
        <div 
          className="hover-lift"
          style={{
            background: 'linear-gradient(135deg, #DC2626 0%, #B91C1C 50%, #7F1D1D 100%)',
            borderRadius: '18px',
            padding: '12px 14px',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px -5px rgba(220, 38, 38, 0.4)',
            border: '1px solid rgba(254, 202, 202, 0.3)',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FECACA', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>អវត្តមាន / ABSENT</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                {statusCounts.absent} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FEE2E2' }}>អង្គ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <XCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#FCA5A5', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            អវត្តមានគ្មានច្បាប់
          </div>
        </div>

        {/* Card 3: On Leave (Solar Amber) */}
        <div 
          className="hover-lift"
          style={{
            background: 'linear-gradient(135deg, #D97706 0%, #B45309 50%, #78350F 100%)',
            borderRadius: '18px',
            padding: '12px 14px',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px -5px rgba(217, 119, 6, 0.4)',
            border: '1px solid rgba(253, 230, 138, 0.3)',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FDE68A', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>សុំច្បាប់ / LEAVE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                {statusCounts.leave} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FEF3C7' }}>អង្គ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Clock size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#FCD34D', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            មានច្បាប់អនុញ្ញាត
          </div>
        </div>

        {/* Card 4: Sick (Sunset Orange) */}
        <div 
          className="hover-lift"
          style={{
            background: 'linear-gradient(135deg, #EA580C 0%, #C2410C 50%, #7C2D12 100%)',
            borderRadius: '18px',
            padding: '12px 14px',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px -5px rgba(234, 88, 12, 0.4)',
            border: '1px solid rgba(254, 215, 170, 0.3)',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FFEDD5', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>ឈឺ / SICK</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                {statusCounts.sick} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFF7ED' }}>អង្គ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#FDBA74', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            សម្រាកព្យាបាល
          </div>
        </div>

      </div>

      {/* 🌟 1. SMART 1-CLICK ALL PRESENT / QUICK BATCH BAR */}
      <div 
        style={{ 
          background: 'linear-gradient(135deg, #064E3B 0%, #047857 100%)', 
          borderRadius: '18px', 
          padding: '16px 20px',
          boxShadow: '0 8px 24px -6px rgba(5, 150, 105, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
          color: '#FFFFFF'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, fontSize: '0.98rem', color: '#A7F3D0' }}>
            <Sparkles size={16} />
            <span>យុទ្ធសាស្ត្រស្រង់លឿនបំផុត (1-Click Fast Check-in)</span>
          </div>
          <p style={{ fontSize: '0.72rem', color: '#D1FAE5', marginTop: '2px' }}>
            ចុចតែ ១ប៉ូតុងកំណត់វត្តមានទាំងអស់ រួចគ្រាន់តែកែតែអង្គណាអវត្តមាន ឬច្បាប់ជាការស្រេច!
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button 
            className="hover-lift" 
            onClick={() => setAll('present')}
            style={{ 
              background: '#FFFFFF', 
              color: '#065F46', 
              border: 'none', 
              padding: '9px 18px', 
              borderRadius: '12px', 
              fontWeight: 800, 
              fontSize: '0.82rem', 
              cursor: 'pointer', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
            }}
          >
            <CheckCheck size={16} />
            <span>ចុច ១ប៉ូតុង: វត្តមានទាំងអស់ (Mark All Present)</span>
          </button>
        </div>
      </div>

      {/* 🌟 Search, Filter & Quick Views */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ display: 'flex', gap: '8px', flex: '1 1 280px', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ borderRadius: '12px', padding: '6px 12px' }}>
            <Search size={15} className="text-muted" />
            <input 
              placeholder="ស្វែងរកព្រះនាម..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
              style={{ fontSize: '0.82rem' }}
            />
          </div>
          <select 
            className="form-control" 
            value={filterRank} 
            onChange={e => setFilterRank(e.target.value)}
            style={{ width: 'auto', borderRadius: '12px', fontWeight: 600, fontSize: '0.8rem', padding: '6px 10px' }}
          >
            <option value="all">គ្រប់ឋានៈទាំងអស់</option>
            <option value="bhikkhu">ភិក្ខុ (Bhikkhu)</option>
            <option value="samanera">សាមណេរ (Samanera)</option>
            <option value="chief_monk">ព្រះមេកុដិ</option>
            <option value="teacher">គ្រូពូកែ</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '4px', background: '#F1F5F9', padding: '3px', borderRadius: '10px' }}>
          <button 
            onClick={() => setViewMode('grid')}
            style={{
              background: viewMode === 'grid' ? '#FFFFFF' : 'none',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              color: viewMode === 'grid' ? '#0F172A' : '#64748B',
              boxShadow: viewMode === 'grid' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            ⚡ ទម្រង់កាតចុចលឿន
          </button>
          <button 
            onClick={() => setViewMode('table')}
            style={{
              background: viewMode === 'table' ? '#FFFFFF' : 'none',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.75rem',
              cursor: 'pointer',
              color: viewMode === 'table' ? '#0F172A' : '#64748B',
              boxShadow: viewMode === 'table' ? '0 2px 5px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            📋 ទម្រង់តារាង
          </button>
        </div>
      </div>

      {/* 🌟 2. FAST CARD GRID VIEW (Strict 2 Columns on Mobile) */}
      {viewMode === 'grid' ? (
        <div className="mobile-2-col-grid" style={{ gap: '10px' }}>
          {filteredMonks.map((monk) => {
            const currentStatus = records[monk.id] || 'present'
            const statusConfig = {
              present: { bg: '#ECFDF5', border: '#10B981', color: '#065F46', badge: '#D1FAE5', text: '🟢 វត្តមាន' },
              absent: { bg: '#FEF2F2', border: '#EF4444', color: '#991B1B', badge: '#FEE2E2', text: '🔴 អវត្តមាន' },
              leave: { bg: '#FFFBEB', border: '#F59E0B', color: '#92400E', badge: '#FEF3C7', text: '🟡 ច្បាប់' },
              sick: { bg: '#FFF7ED', border: '#EA580C', color: '#9A3412', badge: '#FFEDD5', text: '🟠 អាពាធ' },
            }[currentStatus]

            return (
              <div 
                key={monk.id}
                className="hover-lift"
                style={{
                  background: '#FFFFFF',
                  border: `1.5px solid ${statusConfig.border}`,
                  borderRadius: '16px',
                  padding: '12px 10px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '10px',
                  overflow: 'hidden'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.95rem', flexShrink: 0 }}>
                      {monk.khmer_name.charAt(0)}
                    </div>
                    <span style={{ background: '#F1F5F9', color: '#475569', padding: '2px 6px', borderRadius: '6px', fontSize: '0.62rem', fontWeight: 700 }}>
                      {monk.rank === 'samanera' ? 'សាមណេរ' : monk.rank === 'bhikkhu' ? 'ភិក្ខុ' : monk.rank === 'chief_monk' ? 'ព្រះមេកុដិ' : 'គ្រូពូកែ'}
                    </span>
                  </div>

                  <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.85rem', lineHeight: 1.25, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {monk.khmer_name}
                  </div>
                  <div style={{ fontSize: '0.65rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: '1px' }}>
                    {monk.latin_name}
                  </div>
                </div>

                {/* Quick 4 Status Selector Buttons for each Monk (2x2 Grid) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '4px', background: '#F8FAFC', padding: '4px', borderRadius: '10px', border: '1px solid #E2E8F0' }}>
                  {(['present', 'absent', 'leave', 'sick'] as Status[]).map(s => {
                    const isSelected = currentStatus === s
                    const label = s === 'present' ? 'វត្តមាន' : s === 'absent' ? 'អវត្តមាន' : s === 'leave' ? 'ច្បាប់' : 'អាពាធ'
                    const activeStyle = {
                      present: { bg: '#059669', color: '#FFFFFF' },
                      absent: { bg: '#DC2626', color: '#FFFFFF' },
                      leave: { bg: '#D97706', color: '#FFFFFF' },
                      sick: { bg: '#EA580C', color: '#FFFFFF' },
                    }[s]

                    return (
                      <button
                        key={s}
                        onClick={() => setStatus(monk.id, s)}
                        style={{
                          background: isSelected ? activeStyle.bg : '#FFFFFF',
                          color: isSelected ? activeStyle.color : '#475569',
                          border: isSelected ? 'none' : '1px solid #E2E8F0',
                          padding: '5px 2px',
                          borderRadius: '6px',
                          fontWeight: isSelected ? 800 : 600,
                          fontSize: '0.68rem',
                          cursor: 'pointer',
                          textAlign: 'center',
                          transition: 'all 0.15s ease',
                          boxShadow: isSelected ? '0 2px 4px rgba(0,0,0,0.1)' : 'none'
                        }}
                      >
                        {label}
                      </button>
                    )
                  })}
                </div>

              </div>
            )
          })}
        </div>
      ) : (
        /* Table View */
        <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ width: 50, padding: '14px 16px', fontWeight: 800 }}>#</th>
                  <th style={{ padding: '14px 16px', fontWeight: 800 }}>ព្រះសង្ឃ / Monk</th>
                  <th style={{ padding: '14px 16px', fontWeight: 800 }}>ឋានៈ / Rank</th>
                  <th style={{ textAlign: 'center', width: 320, padding: '14px 16px', fontWeight: 800 }}>ជ្រើសរើសស្ថានភាព / Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredMonks.map((monk, i) => (
                  <tr key={monk.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td className="text-muted font-latin" style={{ padding: '14px 16px', fontWeight: 700 }}>{i + 1}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <div className="flex items-center gap-2.5">
                        <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, boxShadow: '0 4px 10px rgba(245,158,11,0.25)' }}>
                          {monk.khmer_name.charAt(0)}
                        </div>
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.92rem', color: '#0F172A' }}>{monk.khmer_name}</div>
                          {monk.latin_name && <div className="text-xs text-muted font-latin">{monk.latin_name}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', padding: '3px 10px', borderRadius: '8px', fontSize: '0.72rem', fontWeight: 800 }}>
                        {monk.rank === 'samanera' ? 'សាមណេរ' : monk.rank === 'bhikkhu' ? 'ភិក្ខុ' : monk.rank === 'chief_monk' ? 'ព្រះមេកុដិ' : 'គ្រូពូកែ'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div className="flex gap-1.5 justify-center flex-wrap">
                        {(['present', 'absent', 'leave', 'sick'] as Status[]).map(s => (
                          <StatusButton key={s} monkId={monk.id} status={s} />
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  )
}

function AttendanceCameraScannerModal({ 
  monks, 
  onClose, 
  onScanSuccess 
}: { 
  monks: Monk[]; 
  onClose: () => void; 
  onScanSuccess: (monkId: string, monkName: string) => void 
}) {
  const [hasCamera, setHasCamera] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  // 📷 Start Live Camera on Mount
  useEffect(() => {
    let activeStream: MediaStream | null = null

    async function initCamera() {
      try {
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 640 } }
          })
          activeStream = stream
          if (videoRef.current) {
            videoRef.current.srcObject = stream
            videoRef.current.play().catch(e => console.log('play error', e))
            setHasCamera(true)
          }
        }
      } catch (err) {
        console.log('Camera permission denied or camera not found:', err)
        setHasCamera(false)
      }
    }

    initCamera()

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach(track => track.stop())
      }
    }
  }, [])

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md animate-fadeIn" style={{ maxWidth: '440px', maxHeight: '85vh', borderRadius: '28px', overflow: 'hidden', border: '1.5px solid #FDE68A', boxShadow: '0 25px 50px -12px rgba(217, 119, 6, 0.4)', padding: 0, display: 'flex', flexDirection: 'column' }}>
        
        {/* Luxury Header */}
        <div style={{ background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 100%)', padding: '16px 20px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid rgba(245, 158, 11, 0.3)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '12px', background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(245, 158, 11, 0.35)' }}>
              <QrCode size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#FEF3C7', margin: 0 }}>
                កាមេរ៉ាស្កេន QR វត្តមាន (Live Camera)
              </h3>
              <p style={{ fontSize: '0.64rem', color: '#D1D5DB', margin: 0, marginTop: '1px' }}>
                Real-time Camera Stream Check-in
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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
            
            {/* 📷 Real Live Camera Stream Viewport */}
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
              {/* Actual HTML5 Camera Video */}
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

              {/* Animated QR icon if camera loading or simulated */}
              {!hasCamera && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <QrCode size={80} color="#FDE68A" style={{ opacity: 0.85 }} />
                  <span style={{ fontSize: '0.72rem', color: '#CBD5E1', fontWeight: 700 }}>កំពុងបើកកាមេរ៉ាស្កេន...</span>
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

              {/* 4 Corner Green Reticles */}
              <div style={{ position: 'absolute', top: '10px', left: '10px', width: '18px', height: '18px', borderTop: '3px solid #10B981', borderLeft: '3px solid #10B981', borderRadius: '4px 0 0 0' }} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', width: '18px', height: '18px', borderTop: '3px solid #10B981', borderRight: '3px solid #10B981', borderRadius: '0 4px 0 0' }} />
              <div style={{ position: 'absolute', bottom: '10px', left: '10px', width: '18px', height: '18px', borderBottom: '3px solid #10B981', borderLeft: '3px solid #10B981', borderRadius: '0 0 0 4px' }} />
              <div style={{ position: 'absolute', bottom: '10px', right: '10px', width: '18px', height: '18px', borderBottom: '3px solid #10B981', borderRight: '3px solid #10B981', borderRadius: '0 0 4px 0' }} />
            </div>

            <style jsx>{`
              @keyframes scannerLaser {
                0% { top: 10px; }
                100% { top: 195px; }
              }
            `}</style>

            <p style={{ fontSize: '0.76rem', color: '#475569', maxWidth: '290px', lineHeight: 1.4, margin: 0 }}>
              ⚡ តម្រង់កាមេរ៉ាទៅលើ <strong>QR Code លើកាតព្រះសង្ឃ</strong> ដើម្បីកត់ត្រាវត្តមានភ្លាមៗ
            </p>

            {/* Quick Tap attendance button list */}
            <div style={{ width: '100%', background: '#FFFFFF', padding: '9px 12px', borderRadius: '16px', border: '1.5px solid #E2E8F0' }}>
              <span style={{ fontSize: '0.66rem', color: '#64748B', fontWeight: 800, display: 'block', marginBottom: '6px' }}>
                ⚡ ស្កេនរហ័សគំរូ (Quick Instant Attendance Tap):
              </span>
              <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {monks.slice(0, 3).map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      onScanSuccess(m.id, m.khmer_name)
                    }}
                    className="hover-lift"
                    style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '5px 10px', borderRadius: '9px', fontSize: '0.72rem', fontWeight: 800, cursor: 'pointer' }}
                  >
                    ✓ {m.khmer_name}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

