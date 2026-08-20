'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Monk } from '@/lib/database.types'
import { MONK_RANK_LABELS, MONK_STATUS_LABELS, formatDate, calculateVassa, calculateAge } from '@/lib/utils'
import { Plus, Search, Trash2, UserCheck, MapPin, Eye, Upload, Camera, Image as ImageIcon, X, ArrowLeft, AlertTriangle } from 'lucide-react'

const INITIAL_DEMO_MONKS: Monk[] = [
  {
    id: '1',
    khmer_name: 'ព្រះមហា សុខ វិបុល',
    latin_name: 'Ven. Sok Vibul',
    dhamma_name: 'ញាណវង្សោ',
    rank: 'bhikkhu',
    status: 'elder',
    date_of_birth: '1995-05-12',
    date_of_ordination: '2015-06-10',
    date_of_higher_ordination: '2017-07-15',
    home_province: 'បាត់ដំបង',
    home_district: 'សង្កែ',
    home_commune: 'វត្តតាមិម',
    home_village: 'ភូមិអូរស្រឡៅ',
    origin_temple: 'វត្តកែវមុនី',
    health_status: 'good',
    health_notes: 'សុខភាពល្អធម្មតា',
    photo_url: null,
    room_id: null,
    is_active: true,
    notes: 'គ្រូបង្រៀនពុទ្ធិកធម្មវិន័យ',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    khmer_name: 'សាមណេរ ចាន់ រ៉ា',
    latin_name: 'Novice Chan Ra',
    dhamma_name: 'សិរីមង្គលោ',
    rank: 'samanera',
    status: 'existing',
    date_of_birth: '2008-09-20',
    date_of_ordination: '2022-04-18',
    date_of_higher_ordination: null,
    home_province: 'សៀមរាប',
    home_district: 'ពួក',
    home_commune: 'ពួក',
    home_village: 'ភូមិប្រឡាយ',
    origin_temple: 'វត្តរាជបូណ៌',
    health_status: 'good',
    health_notes: '',
    photo_url: null,
    room_id: null,
    is_active: true,
    notes: 'កំពុងរៀនភាសាបាលីថ្នាក់ត្រី',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    khmer_name: 'ព្រះគ្រូ ឡុង សារ៉េត',
    latin_name: 'Ven. Long Sareth',
    dhamma_name: 'បញ្ញាវុទ្ធោ',
    rank: 'chief_monk',
    status: 'elder',
    date_of_birth: '1978-02-14',
    date_of_ordination: '1998-05-20',
    date_of_higher_ordination: '2000-06-15',
    home_province: 'កំពង់ចាម',
    home_district: 'ព្រៃឈរ',
    home_commune: 'ព្រៃឈរ',
    home_village: 'ភូមិតាអុង',
    origin_temple: 'វត្តសុវណ្ណារាម',
    health_status: 'good',
    health_notes: '',
    photo_url: null,
    room_id: null,
    is_active: true,
    notes: 'ព្រះមេកុដិ និងគ្រប់គ្រងទូទៅ',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    khmer_name: 'ភិក្ខុ ឌុក សម្បត្តិ',
    latin_name: 'Ven. Duk Sambath',
    dhamma_name: 'ធម្មរតនោ',
    rank: 'bhikkhu',
    status: 'existing',
    date_of_birth: '1992-11-03',
    date_of_ordination: '2012-07-08',
    date_of_higher_ordination: '2014-08-12',
    home_province: 'កណ្ដាល',
    home_district: 'កៀនស្វាយ',
    home_commune: 'ព្រែកឯង',
    home_village: 'ភូមិវាលស្បូវ',
    origin_temple: 'វត្តព្រែកឯង',
    health_status: 'fair',
    health_notes: 'មានជំងឺក្រពះតិចតួច',
    photo_url: null,
    room_id: null,
    is_active: true,
    notes: 'អ្នកគ្រប់គ្រងបណ្ណាល័យ',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    khmer_name: 'សាមណេរ ហេង វុទ្ធី',
    latin_name: 'Novice Heng Vutha',
    dhamma_name: 'ចន្ទវង្សោ',
    rank: 'samanera',
    status: 'new',
    date_of_birth: '2010-01-15',
    date_of_ordination: '2024-02-10',
    date_of_higher_ordination: null,
    home_province: 'តាកែវ',
    home_district: 'ត្រាំកក់',
    home_commune: 'ត្រាំកក់',
    home_village: 'ភូមិត្រពាំងធំ',
    origin_temple: 'វត្តគិរីវង្ស',
    health_status: 'good',
    health_notes: '',
    photo_url: null,
    room_id: null,
    is_active: true,
    notes: 'ទើបបួសថ្មីដើមឆ្នាំ',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    khmer_name: 'ភិក្ខុ សេង សុវណ្ណារ៉ា',
    latin_name: 'Ven. Seng Sovannara',
    dhamma_name: 'សុវណ្ណជោតិ',
    rank: 'teacher',
    status: 'existing',
    date_of_birth: '1989-08-25',
    date_of_ordination: '2009-04-12',
    date_of_higher_ordination: '2011-05-18',
    home_province: 'ភ្នំពេញ',
    home_district: 'ច្បារអំពៅ',
    home_commune: 'ច្បារអំពៅ១',
    home_village: 'ភូមិកោះនរា',
    origin_temple: 'វត្តបទុមវតី',
    health_status: 'good',
    health_notes: '',
    photo_url: null,
    room_id: null,
    is_active: true,
    notes: 'គ្រូបង្រៀនភាសាអង់គ្លេស និងកុំព្យូទ័រ',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export default function MonksPage() {
  const router = useRouter()
  const [monks, setMonks] = useState<Monk[]>(INITIAL_DEMO_MONKS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRank, setFilterRank] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedMonk, setSelectedMonk] = useState<Monk | null>(null)
  const [monkToDelete, setMonkToDelete] = useState<Monk | null>(null)

  useEffect(() => {
    async function loadData() {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-systemmk.supabase.co') {
        try {
          const { data } = await supabase.from('monks').select('*').eq('is_active', true)
          if (data && data.length > 0) {
            setMonks(data as unknown as Monk[])
          }
        } catch {
          // fallback to initial
        }
      }
    }
    loadData()
  }, [])

  const displayedMonks = monks.filter(monk => {
    const matchesRank = filterRank === 'all' || monk.rank === filterRank
    const matchesStatus = filterStatus === 'all' || monk.status === filterStatus
    const s = search.toLowerCase()
    const matchesSearch = !search || 
      monk.khmer_name.toLowerCase().includes(s) ||
      (monk.latin_name && monk.latin_name.toLowerCase().includes(s)) ||
      (monk.dhamma_name && monk.dhamma_name.toLowerCase().includes(s)) ||
      (monk.home_province && monk.home_province.toLowerCase().includes(s)) ||
      (monk.origin_temple && monk.origin_temple.toLowerCase().includes(s))
    return matchesRank && matchesStatus && matchesSearch
  })

  const confirmDeleteMonk = () => {
    if (!monkToDelete) return
    setMonks(prev => prev.filter(m => m.id !== monkToDelete.id))
    setMonkToDelete(null)
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header with Back Button */}
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
            <h1 className="page-title" style={{ fontSize: '1.4rem', margin: 0 }}>គ្រប់គ្រងព្រះសង្ឃ</h1>
            <p className="page-subtitle" style={{ margin: '2px 0 0' }}>Monks Management — {displayedMonks.length} អង្គ</p>
          </div>
        </div>
        <div className="page-header-actions" style={{ marginTop: '8px' }}>
          <button className="btn btn-primary hover-lift" onClick={() => setShowAddModal(true)}>
            <Plus size={16} />
            <span>បន្ថែមព្រះសង្ឃថ្មី / Add Monk</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="card">
        <div className="card-body" style={{ padding: 'var(--space-4)' }}>
          <div className="filter-bar flex-wrap">
            <div className="search-bar" style={{ minWidth: 260 }}>
              <Search size={16} className="search-bar-icon" />
              <input 
                placeholder="ស្វែងរកតាមឈ្មោះ, ឈ្មោះធម៌, វត្ត, ខេត្ត..." 
                value={search} 
                onChange={e => setSearch(e.target.value)} 
              />
            </div>

            <select className="form-control" style={{ width: 'auto' }} value={filterRank} onChange={e => setFilterRank(e.target.value)}>
              <option value="all">គ្រប់ឋានៈទាំងអស់ (All Ranks)</option>
              {Object.entries(MONK_RANK_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.kh} / {v.en}</option>
              ))}
            </select>

            <select className="form-control" style={{ width: 'auto' }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
              <option value="all">គ្រប់ស្ថានភាព (All Status)</option>
              {Object.entries(MONK_STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v.kh} / {v.en}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Monks Grid */}
      {displayedMonks.length === 0 ? (
        <div className="card">
          <div className="table-empty py-12 text-center">
            <UserCheck size={48} style={{ margin: '0 auto var(--space-3)', opacity: 0.3 }} />
            <p className="text-lg font-semibold">មិនមានទិន្នន័យព្រះសង្ឃ</p>
            <p className="text-muted text-sm font-latin">No monks found</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-4)' }}>
          {displayedMonks.map(monk => {
            const vassa = calculateVassa(monk.date_of_ordination)
            const age = calculateAge(monk.date_of_birth)
            
            // Format full birthplace address
            const fullAddress = [
              monk.origin_temple ? `វត្ត${monk.origin_temple.replace(/^វត្ត/, '')}` : '',
              monk.home_village ? `ភូមិ${monk.home_village.replace(/^ភូមិ/, '')}` : '',
              monk.home_commune ? `ឃុំ/សង្កាត់${monk.home_commune.replace(/^(ឃុំ|សង្កាត់)/, '')}` : '',
              monk.home_district ? `ស្រុក/ក្រុង${monk.home_district.replace(/^(ស្រុក|ក្រុង)/, '')}` : '',
              monk.home_province ? `ខេត្ត${monk.home_province.replace(/^(ខេត្ត|រាជធានី)/, '')}` : ''
            ].filter(Boolean).join(', ')

            return (
              <div 
                key={monk.id} 
                className="hover-lift"
                style={{ 
                  background: 'linear-gradient(145deg, #FFFFFF 0%, #FFFDF9 100%)', 
                  borderRadius: '20px', 
                  border: '1.5px solid #FDE68A', 
                  padding: '20px',
                  boxShadow: '0 8px 20px -6px rgba(217, 119, 6, 0.1)'
                }}
              >
                <div className="flex gap-4 items-start">
                  <div 
                    style={{ 
                      width: '64px', 
                      height: '64px', 
                      borderRadius: '16px', 
                      background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', 
                      color: '#78350F', 
                      fontSize: '1.4rem', 
                      fontWeight: 800, 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 6px 14px rgba(245, 158, 11, 0.25)',
                      overflow: 'hidden'
                    }}
                  >
                    {monk.photo_url ? (
                      <img src={monk.photo_url} alt={monk.khmer_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span>{monk.khmer_name.charAt(0)}</span>
                    )}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="flex items-center justify-between gap-1">
                      <h3 style={{ fontWeight: 800, fontSize: '1.05rem', color: '#0F172A' }} className="truncate">
                        {monk.khmer_name}
                      </h3>
                      <span className="badge badge-primary" style={{ fontSize: '0.7rem', fontWeight: 700 }}>
                        {MONK_RANK_LABELS[monk.rank]?.kh || monk.rank}
                      </span>
                    </div>

                    {monk.dhamma_name && (
                      <div style={{ fontSize: '0.8rem', color: '#D97706', fontWeight: 700, marginTop: '2px' }}>
                        ឆាយា: {monk.dhamma_name}
                      </div>
                    )}

                    {monk.latin_name && (
                      <div className="text-xs text-muted font-latin truncate">
                        {monk.latin_name}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-1.5 text-xs text-muted" style={{ borderTop: '1px dashed #FDE68A', paddingTop: '12px' }}>
                  <div className="flex justify-between">
                    <span>វស្សា / Vassa:</span>
                    <span className="font-bold text-gray-800">{vassa !== null ? `${vassa} វស្សា` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ព្រះជន្ម / Age:</span>
                    <span className="font-bold text-gray-800">{age !== null ? `${age} ព្រះវស្សា` : '—'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>ស្ថានភាព:</span>
                    <span className="badge badge-neutral" style={{ fontSize: '0.65rem' }}>
                      {MONK_STATUS_LABELS[monk.status]?.kh || monk.status}
                    </span>
                  </div>
                  {(monk.home_province || monk.origin_temple) && (
                    <div className="flex items-start gap-1 text-xs pt-1">
                      <MapPin size={13} className="text-amber-600 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight">
                        ស្រុកកំណើត: <strong>{fullAddress || monk.home_province}</strong>
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 mt-4 pt-3" style={{ borderTop: '1px solid #F1F5F9' }}>
                  <button className="btn btn-secondary btn-sm" onClick={() => setSelectedMonk(monk)} title="មើលលម្អិត">
                    <Eye size={14} />
                    <span>លម្អិត</span>
                  </button>
                  <button 
                    className="btn btn-ghost btn-sm" 
                    style={{ color: 'var(--color-danger)' }} 
                    onClick={() => setMonkToDelete(monk)} 
                    title="លុបទិន្នន័យព្រះសង្ឃ"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* 🔴 Custom Confirmation Delete Modal */}
      {monkToDelete && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setMonkToDelete(null)}>
          <div 
            className="modal modal-md animate-scaleUp"
            style={{
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.35)',
              maxWidth: '440px',
              width: '100%',
              margin: '0 auto',
              background: '#FFFFFF',
              textAlign: 'center',
              padding: '24px 20px'
            }}
          >
            {/* Warning Icon Badge */}
            <div 
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#FEE2E2',
                border: '2px solid #FCA5A5',
                color: '#DC2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
                boxShadow: '0 8px 20px rgba(220, 38, 38, 0.2)'
              }}
            >
              <AlertTriangle size={32} />
            </div>

            {/* Confirmation Question */}
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.4, margin: '0 0 8px 0' }}>
              តើគុណម្ចាស់/លោកអ្នក ចង់លុបពិតមែនទេ?
            </h3>
            
            <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              ទិន្នន័យរបស់ <strong>«{monkToDelete.khmer_name}»</strong> នឹងត្រូវបានលុបចេញពីប្រព័ន្ធវត្តអារាម។
            </p>

            {/* Action Buttons: No & Yes OK */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="hover-lift"
                onClick={() => setMonkToDelete(null)}
                style={{
                  flex: 1,
                  background: '#F1F5F9',
                  border: '1.5px solid #CBD5E1',
                  color: '#475569',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}
              >
                No
              </button>

              <button
                type="button"
                className="hover-lift"
                onClick={confirmDeleteMonk}
                style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
                  border: 'none',
                  color: '#FFFFFF',
                  padding: '12px 18px',
                  borderRadius: '14px',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  boxShadow: '0 6px 18px rgba(220, 38, 38, 0.35)'
                }}
              >
                ✓ Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Monk Modal */}
      {showAddModal && (
        <AddMonkModal 
          onClose={() => setShowAddModal(false)} 
          onAdd={(newMonk) => setMonks(prev => [newMonk, ...prev])} 
        />
      )}

      {/* View Details Modal */}
      {selectedMonk && (
        <MonkDetailsModal monk={selectedMonk} onClose={() => setSelectedMonk(null)} />
      )}
    </div>
  )
}

function AddMonkModal({ onClose, onAdd }: { onClose: () => void; onAdd: (monk: Monk) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  
  const [form, setForm] = useState({
    khmer_name: '',
    latin_name: '',
    dhamma_name: '',
    rank: 'samanera',
    status: 'new',
    date_of_birth: '',
    date_of_ordination: '',
    date_of_higher_ordination: '',
    origin_temple: '',
    home_village: '',
    home_commune: '',
    home_district: '',
    home_province: '',
    health_status: 'good',
    health_notes: '',
    notes: '',
  })

  // Handle Photo File Selection and Local Preview
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

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newMonk: Monk = {
      id: Date.now().toString(),
      khmer_name: form.khmer_name,
      latin_name: form.latin_name || null,
      dhamma_name: form.dhamma_name || null,
      rank: form.rank as any,
      status: form.status as any,
      date_of_birth: form.date_of_birth || null,
      date_of_ordination: form.date_of_ordination || null,
      date_of_higher_ordination: form.date_of_higher_ordination || null,
      origin_temple: form.origin_temple || null,
      home_village: form.home_village || null,
      home_commune: form.home_commune || null,
      home_district: form.home_district || null,
      home_province: form.home_province || null,
      health_status: form.health_status as any,
      health_notes: form.health_notes || null,
      photo_url: photoPreview || null,
      room_id: null,
      is_active: true,
      notes: form.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    onAdd(newMonk)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg" style={{ maxWidth: '820px' }}>
        <div className="modal-header">
          <h3 className="modal-title">បន្ថែមព័ត៌មានព្រះសង្ឃ / Add Monk</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-4">
            
            {/* 🌟 1. PHOTO UPLOAD SECTION */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '18px', padding: '16px', background: '#F8FAFC', borderRadius: '18px', border: '1.5px dashed #CBD5E1' }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{ 
                  width: '84px', 
                  height: '84px', 
                  borderRadius: '20px', 
                  background: photoPreview ? '#FFFFFF' : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', 
                  border: '2px solid #F59E0B', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 4px 12px rgba(245,158,11,0.2)',
                  flexShrink: 0
                }}
                title="ចុចដើម្បីជ្រើសរើសរូបថត"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <Camera size={26} color="#B45309" />
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#78350F', marginTop: '4px' }}>ដាក់រូប</span>
                  </>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>រូបថតព្រះឆាយាល័ក្ខណ៍ / ព្រះសង្ឃ</h4>
                <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>
                  ជ្រើសរើសរូបថតពីទូរស័ព្ទ ឬកុំព្យូទ័រ (JPG, PNG) ដើម្បីបង្ហាញលើកាត និងបញ្ជីវត្ត
                </p>

                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: '#FFFFFF',
                      border: '1.5px solid #CBD5E1',
                      color: '#1E293B',
                      padding: '6px 14px',
                      borderRadius: '10px',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    <Upload size={14} />
                    <span>{photoPreview ? 'ប្ដូររូបថត' : 'ជ្រើសរើសរូបថត (Upload)'}</span>
                  </button>

                  {photoPreview && (
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        padding: '6px 12px',
                        borderRadius: '10px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <X size={14} />
                      <span>លុបរូប</span>
                    </button>
                  )}
                </div>

                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handlePhotoChange} 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                />
              </div>
            </div>

            {/* 🌟 2. BASIC MONK INFORMATION */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">ព្រះនាម (ភាសាខ្មែរ) <span className="required">*</span></label>
                <input className="form-control" value={form.khmer_name} onChange={e => setForm({...form, khmer_name: e.target.value})} required placeholder="ឧ. សុខ វិបុល" />
              </div>
              <div className="form-group">
                <label className="form-label">ព្រះនាមជាអក្សរឡាតាំង (Latin Name)</label>
                <input className="form-control" value={form.latin_name} onChange={e => setForm({...form, latin_name: e.target.value})} placeholder="Ex. Sok Vibul" />
              </div>
              <div className="form-group">
                <label className="form-label">ឈ្មោះធម៌ / ឆាយា (Dhamma Name)</label>
                <input className="form-control" value={form.dhamma_name} onChange={e => setForm({...form, dhamma_name: e.target.value})} placeholder="ឧ. ញាណវង្សោ" />
              </div>
              <div className="form-group">
                <label className="form-label">ឋានៈ (Rank)</label>
                <select className="form-control" value={form.rank} onChange={e => setForm({...form, rank: e.target.value})}>
                  {Object.entries(MONK_RANK_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.kh} / {v.en}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ស្ថានភាព (Status)</label>
                <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  {Object.entries(MONK_STATUS_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v.kh} / {v.en}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ថ្ងៃខែឆ្នាំកំណើត (DOB)</label>
                <input className="form-control" type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">ថ្ងៃបព្វជ្ជា (បួសសាមណេរ)</label>
                <input className="form-control" type="date" value={form.date_of_ordination} onChange={e => setForm({...form, date_of_ordination: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">ថ្ងៃឧបសម្បទា (បួសភិក្ខុ)</label>
                <input className="form-control" type="date" value={form.date_of_higher_ordination} onChange={e => setForm({...form, date_of_higher_ordination: e.target.value})} />
              </div>
            </div>

            {/* 🌟 3. COMPLETE BIRTHPLACE & ADDRESS SECTION (វត្ត, ភូមិ, ឃុំ/សង្កាត់, ស្រុក/ក្រុង, រាជធានី/ខេត្ត) */}
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '18px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MapPin size={16} className="text-amber-600" />
                <span style={{ fontWeight: 800, fontSize: '0.92rem', color: '#92400E' }}>
                  ព័ត៌មានស្រុកកំណើត និងទីកន្លែងដើម (Birthplace & Origin)
                </span>
              </div>

              <div className="form-grid">
                {/* 1. វត្តដើម */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, color: '#78350F' }}>វត្ត (Origin Temple)</label>
                  <input 
                    className="form-control" 
                    value={form.origin_temple} 
                    onChange={e => setForm({...form, origin_temple: e.target.value})} 
                    placeholder="ឧ. វត្តកែវមុនី" 
                    style={{ background: '#FFFFFF' }}
                  />
                </div>

                {/* 2. ភូមិ */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, color: '#78350F' }}>ភូមិ (Village)</label>
                  <input 
                    className="form-control" 
                    value={form.home_village} 
                    onChange={e => setForm({...form, home_village: e.target.value})} 
                    placeholder="ឧ. ភូមិអូរស្រឡៅ" 
                    style={{ background: '#FFFFFF' }}
                  />
                </div>

                {/* 3. ឃុំ / សង្កាត់ */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, color: '#78350F' }}>ឃុំ / សង្កាត់ (Commune/Sangkat)</label>
                  <input 
                    className="form-control" 
                    value={form.home_commune} 
                    onChange={e => setForm({...form, home_commune: e.target.value})} 
                    placeholder="ឧ. ឃុំវត្តតាមិម" 
                    style={{ background: '#FFFFFF' }}
                  />
                </div>

                {/* 4. ស្រុក / ក្រុង */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, color: '#78350F' }}>ស្រុក / ក្រុង (District/City)</label>
                  <input 
                    className="form-control" 
                    value={form.home_district} 
                    onChange={e => setForm({...form, home_district: e.target.value})} 
                    placeholder="ឧ. ស្រុកសង្កែ" 
                    style={{ background: '#FFFFFF' }}
                  />
                </div>

                {/* 5. រាជធានី / ខេត្ត */}
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, color: '#78350F' }}>រាជធានី / ខេត្ត (Province/Capital) <span className="required">*</span></label>
                  <input 
                    className="form-control" 
                    value={form.home_province} 
                    onChange={e => setForm({...form, home_province: e.target.value})} 
                    placeholder="ឧ. ខេត្តបាត់ដំបង" 
                    required
                    style={{ background: '#FFFFFF' }}
                  />
                </div>
              </div>
            </div>

            {/* 🌟 4. HEALTH & ADDITIONAL NOTES */}
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">ស្ថានភាពសុខភាព (Health)</label>
                <select className="form-control" value={form.health_status} onChange={e => setForm({...form, health_status: e.target.value})}>
                  <option value="good">ល្អធម្មតា (Good)</option>
                  <option value="fair">មធ្យម (Fair)</option>
                  <option value="poor">ខ្សោយ (Poor)</option>
                  <option value="hospitalized">សម្រាកពេទ្យ (Hospitalized)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">កំណត់ចំណាំសុខភាព</label>
                <input className="form-control" value={form.health_notes} onChange={e => setForm({...form, health_notes: e.target.value})} placeholder="ឧ. ជំងឺប្រចាំកាយ..." />
              </div>
              <div className="form-group col-span-full">
                <label className="form-label">កំណត់ចំណាំបន្ថែម</label>
                <textarea className="form-control" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="ព័ត៌មានលម្អិតផ្សេងៗ..." />
              </div>
            </div>

          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>បោះបង់</button>
            <button type="submit" className="btn btn-primary">
              រក្សាទុក / Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function MonkDetailsModal({ monk, onClose }: { monk: Monk; onClose: () => void }) {
  const fullAddress = [
    monk.origin_temple ? `វត្ត${monk.origin_temple.replace(/^វត្ត/, '')}` : '',
    monk.home_village ? `ភូមិ${monk.home_village.replace(/^ភូមិ/, '')}` : '',
    monk.home_commune ? `ឃុំ/សង្កាត់${monk.home_commune.replace(/^(ឃុំ|សង្កាត់)/, '')}` : '',
    monk.home_district ? `ស្រុក/ក្រុង${monk.home_district.replace(/^(ស្រុក|ក្រុង)/, '')}` : '',
    monk.home_province ? `ខេត្ត${monk.home_province.replace(/^(ខេត្ត|រាជធានី)/, '')}` : ''
  ].filter(Boolean).join(', ')

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md">
        <div className="modal-header">
          <h3 className="modal-title">ព័ត៌មានលម្អិតព្រះសង្ឃ</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body space-y-4">
          <div className="flex items-center gap-4">
            <div 
              style={{ 
                width: '68px', 
                height: '68px', 
                borderRadius: '18px', 
                background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', 
                color: '#78350F', 
                fontSize: '1.6rem', 
                fontWeight: 800, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                boxShadow: '0 6px 14px rgba(245, 158, 11, 0.25)',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {monk.photo_url ? <img src={monk.photo_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>{monk.khmer_name.charAt(0)}</span>}
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0F172A' }}>{monk.khmer_name}</h2>
              {monk.dhamma_name && <p style={{ color: '#D97706', fontWeight: 700, fontSize: '0.9rem' }}>ឆាយា: {monk.dhamma_name}</p>}
              {monk.latin_name && <p className="text-muted font-latin text-xs">{monk.latin_name}</p>}
            </div>
          </div>

          <div className="p-4 space-y-2.5 text-sm bg-amber-50/50 rounded-2xl border border-amber-200">
            <div className="flex justify-between">
              <span className="text-muted">ឋានៈ:</span>
              <span className="font-bold text-amber-900">{MONK_RANK_LABELS[monk.rank]?.kh || monk.rank}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">ស្ថានភាព:</span>
              <span className="font-semibold">{MONK_STATUS_LABELS[monk.status]?.kh || monk.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">ថ្ងៃខែឆ្នាំកំណើត:</span>
              <span>{formatDate(monk.date_of_birth)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">ថ្ងៃបួសសាមណេរ:</span>
              <span>{formatDate(monk.date_of_ordination)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">ថ្ងៃបួសភិក្ខុ (ឧបសម្បទា):</span>
              <span>{formatDate(monk.date_of_higher_ordination)}</span>
            </div>
            
            {/* Detailed Birthplace */}
            <div style={{ borderTop: '1px dashed #FDE68A', paddingTop: '8px' }}>
              <span className="text-muted block text-xs mb-1 font-semibold">ស្រុកកំណើត & វត្តដើម៖</span>
              <div className="text-xs font-bold text-amber-950 bg-white/80 p-2.5 rounded-xl border border-amber-100 leading-relaxed">
                {fullAddress || monk.home_province || '—'}
              </div>
            </div>

            <div className="flex justify-between pt-1">
              <span className="text-muted">សុខភាព:</span>
              <span className="badge badge-success">{monk.health_status}</span>
            </div>
            {monk.health_notes && (
              <div className="flex justify-between">
                <span className="text-muted">ចំណាំសុខភាព:</span>
                <span>{monk.health_notes}</span>
              </div>
            )}
            {monk.notes && (
              <div className="flex justify-between">
                <span className="text-muted">ចំណាំបន្ថែម:</span>
                <span>{monk.notes}</span>
              </div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary w-full" onClick={onClose}>បិទ / Close</button>
        </div>
      </div>
    </div>
  )
}
