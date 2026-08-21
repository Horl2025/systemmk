'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Monk } from '@/lib/database.types'
import { MONK_RANK_LABELS, MONK_STATUS_LABELS, formatDate, calculateVassa, calculateAge } from '@/lib/utils'
import { Plus, Search, Trash2, Edit, UserCheck, UserPlus, MapPin, Eye, Upload, Camera, Image as ImageIcon, X, ArrowLeft, AlertTriangle } from 'lucide-react'
import { fetchCloudCollection, syncToCloud, subscribeToRealtimeSync, notifyRealtimeUpdate } from '@/lib/cloudSync'

const INITIAL_MONKS: Monk[] = []

export default function MonksPage() {
  const router = useRouter()
  const [monks, setMonks] = useState<Monk[]>(INITIAL_MONKS)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [filterRank, setFilterRank] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingMonk, setEditingMonk] = useState<Monk | null>(null)
  const [selectedMonk, setSelectedMonk] = useState<Monk | null>(null)
  const [monkToDelete, setMonkToDelete] = useState<Monk | null>(null)

  useEffect(() => {
    async function loadData() {
      // 1. First load local custom monks immediately for 0ms instant UI
      let localMonks: Monk[] = []
      try {
        const saved = localStorage.getItem('systemmk_custom_monks')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            localMonks = parsed
            setMonks(parsed)
          }
        }
      } catch {}

      // 2. Fetch fresh Central Cloud Data and merge
      const cloudData = await fetchCloudCollection('monks')
      if (cloudData && Array.isArray(cloudData)) {
        const map = new Map<string, Monk>()
        localMonks.forEach(m => { if (m?.id) map.set(m.id, m) })
        cloudData.forEach(m => { if (m?.id) map.set(m.id, m) })

        const merged = Array.from(map.values())
        if (merged.length > 0) {
          setMonks(merged)
          try { localStorage.setItem('systemmk_custom_monks', JSON.stringify(merged)) } catch {}
          if (localMonks.length > cloudData.length) {
            syncToCloud('sync_all', 'monks', merged)
          }
        }
      }
    }

    loadData()

    // 0ms Real-time broadcast listener
    const unsubscribe = subscribeToRealtimeSync((col) => {
      if (!col || col === 'monks') loadData()
    })

    const handleCustomEvent = (e: any) => {
      if (!e.detail?.collection || e.detail.collection === 'monks') loadData()
    }
    window.addEventListener('systemmk_data_updated', handleCustomEvent)

    // Fast 2.5-second live polling across different devices
    const timer = setInterval(loadData, 2500)

    return () => {
      unsubscribe()
      window.removeEventListener('systemmk_data_updated', handleCustomEvent)
      clearInterval(timer)
    }
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

  const confirmDeleteMonk = async () => {
    if (!monkToDelete) return
    const updated = monks.filter(m => m.id !== monkToDelete.id)
    setMonks(updated)
    try { localStorage.setItem('systemmk_custom_monks', JSON.stringify(updated)) } catch {}
    await syncToCloud('delete', 'monks', null, monkToDelete.id)
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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 'var(--space-4)' }}>
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
                    className="btn btn-sm hover-lift" 
                    style={{ background: '#EFF6FF', border: '1.5px solid #BFDBFE', color: '#1D4ED8', fontWeight: 700 }}
                    onClick={() => setEditingMonk(monk)} 
                    title="កែប្រែព័ត៌មានព្រះសង្ឃ"
                  >
                    <Edit size={14} />
                    <span>កែប្រែ</span>
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
          onSave={async (savedMonk) => {
            setMonks(prev => {
              const updated = [savedMonk, ...prev]
              try { localStorage.setItem('systemmk_custom_monks', JSON.stringify(updated)) } catch {}
              return updated
            })
            await syncToCloud('add', 'monks', savedMonk)
          }} 
        />
      )}

      {/* Edit Monk Modal */}
      {editingMonk && (
        <AddMonkModal 
          monkToEdit={editingMonk}
          onClose={() => setEditingMonk(null)} 
          onSave={async (savedMonk) => {
            setMonks(prev => {
              const updated = prev.map(m => m.id === savedMonk.id ? savedMonk : m)
              try { localStorage.setItem('systemmk_custom_monks', JSON.stringify(updated)) } catch {}
              return updated
            })
            await syncToCloud('edit', 'monks', savedMonk, savedMonk.id)
          }} 
        />
      )}

      {/* View Details Modal */}
      {selectedMonk && (
        <MonkDetailsModal monk={selectedMonk} onClose={() => setSelectedMonk(null)} />
      )}
    </div>
  )
}

function AddMonkModal({ monkToEdit, onClose, onSave }: { monkToEdit?: Monk | null; onClose: () => void; onSave: (monk: Monk) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(monkToEdit?.photo_url || null)
  
  const [form, setForm] = useState({
    khmer_name: monkToEdit?.khmer_name || '',
    latin_name: monkToEdit?.latin_name || '',
    dhamma_name: monkToEdit?.dhamma_name || '',
    rank: monkToEdit?.rank || 'samanera',
    status: monkToEdit?.status || 'new',
    date_of_birth: monkToEdit?.date_of_birth || '',
    date_of_ordination: monkToEdit?.date_of_ordination || '',
    date_of_higher_ordination: monkToEdit?.date_of_higher_ordination || '',
    origin_temple: monkToEdit?.origin_temple || '',
    home_village: monkToEdit?.home_village || '',
    home_commune: monkToEdit?.home_commune || '',
    home_district: monkToEdit?.home_district || '',
    home_province: monkToEdit?.home_province || '',
    health_status: monkToEdit?.health_status || 'good',
    health_notes: monkToEdit?.health_notes || '',
    notes: monkToEdit?.notes || '',
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
    const savedMonk: Monk = {
      id: monkToEdit?.id || Date.now().toString(),
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
      photo_url: photoPreview || monkToEdit?.photo_url || null,
      room_id: monkToEdit?.room_id || null,
      is_active: true,
      notes: form.notes || null,
      created_at: monkToEdit?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    onSave(savedMonk)
    onClose()
  }

  return (
    <div className="modal-overlay" style={{ zIndex: 999999 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div 
        className="modal modal-lg" 
        style={{ 
          maxWidth: '800px', 
          width: '100%', 
          maxHeight: 'min(82vh, 720px)', 
          display: 'flex', 
          flexDirection: 'column', 
          borderRadius: '24px', 
          overflow: 'hidden',
          boxShadow: '0 25px 60px -12px rgba(15, 23, 42, 0.45)',
          background: '#FFFFFF',
          margin: 'auto'
        }}
      >
        {/* Sticky Modal Header */}
        <div 
          style={{
            padding: '16px 22px',
            borderBottom: '1.5px solid #E2E8F0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 100%)',
            color: '#FFFFFF',
            flexShrink: 0
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '34px', height: '34px', borderRadius: '10px', background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <UserPlus size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FEF3C7', margin: 0 }}>
                {monkToEdit ? 'កែប្រែព័ត៌មានព្រះសង្ឃ' : 'បន្ថែមព័ត៌មានព្រះសង្ឃ'}
              </h3>
              <p style={{ fontSize: '0.68rem', color: '#CBD5E1', margin: 0, fontFamily: 'var(--font-latin)' }}>
                {monkToEdit ? 'Edit Monk Profile' : 'Add New Monk Profile'}
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            style={{ width: '30px', height: '30px', borderRadius: '50%', background: 'rgba(255,255,255,0.12)', border: 'none', color: '#CBD5E1', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          {/* Scrollable Modal Body */}
          <div 
            className="modal-body space-y-4" 
            style={{ 
              padding: '18px 22px', 
              overflowY: 'auto', 
              WebkitOverflowScrolling: 'touch',
              flex: 1,
              background: '#F8FAFC'
            }}
          >
            
            {/* 🌟 1. PHOTO UPLOAD SECTION */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '14px', background: '#FFFFFF', borderRadius: '16px', border: '1.5px dashed #CBD5E1', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="hover-lift"
                style={{ 
                  width: '76px', 
                  height: '76px', 
                  borderRadius: '18px', 
                  background: photoPreview ? '#FFFFFF' : 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', 
                  border: '2px solid #F59E0B', 
                  display: 'flex', 
                  flexDirection: 'column',
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  cursor: 'pointer',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: '0 4px 10px rgba(245,158,11,0.2)',
                  flexShrink: 0
                }}
                title="ចុចដើម្បីជ្រើសរើសរូបថត"
              >
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <>
                    <Camera size={24} color="#B45309" />
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, color: '#78350F', marginTop: '2px' }}>ដាក់រូប</span>
                  </>
                )}
              </div>

              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>រូបថតព្រះឆាយាល័ក្ខណ៍ / ព្រះសង្ឃ</h4>
                <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px', marginBottom: '8px' }}>
                  ជ្រើសរើសរូបថតពីទូរស័ព្ទ ឬកុំព្យូទ័រ (JPG, PNG) ដើម្បីបង្ហាញលើកាត និងបញ្ជីវត្ត
                </p>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      background: '#EFF6FF',
                      border: '1.5px solid #BFDBFE',
                      color: '#1D4ED8',
                      padding: '6px 12px',
                      borderRadius: '10px',
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    <Upload size={13} />
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
                        padding: '6px 10px',
                        borderRadius: '10px',
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <X size={13} />
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
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#F59E0B' }} />
                <span>ព័ត៌មានទូទៅរបស់ព្រះសង្ឃ (Basic Information)</span>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>ព្រះនាម (ភាសាខ្មែរ) <span className="required">*</span></label>
                  <input className="form-control" value={form.khmer_name} onChange={e => setForm({...form, khmer_name: e.target.value})} required placeholder="ឧ. សុខ វិបុល" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>ព្រះនាមជាអក្សរឡាតាំង (Latin Name)</label>
                  <input className="form-control" value={form.latin_name} onChange={e => setForm({...form, latin_name: e.target.value})} placeholder="Ex. Sok Vibul" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>ឈ្មោះធម៌ / ឆាយា (Dhamma Name)</label>
                  <input className="form-control" value={form.dhamma_name} onChange={e => setForm({...form, dhamma_name: e.target.value})} placeholder="ឧ. ញាណវង្សោ" />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>ឋានៈ (Rank)</label>
                  <select className="form-control" value={form.rank} onChange={e => setForm({...form, rank: e.target.value as any})}>
                    {Object.entries(MONK_RANK_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.kh} / {v.en}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>ស្ថានភាព (Status)</label>
                  <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value as any})}>
                    {Object.entries(MONK_STATUS_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>{v.kh} / {v.en}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>ថ្ងៃខែឆ្នាំកំណើត (DOB)</label>
                  <input className="form-control" type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>ថ្ងៃបព្វជ្ជា (បួសសាមណេរ)</label>
                  <input className="form-control" type="date" value={form.date_of_ordination} onChange={e => setForm({...form, date_of_ordination: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>ថ្ងៃឧបសម្បទា (បួសភិក្ខុ)</label>
                  <input className="form-control" type="date" value={form.date_of_higher_ordination} onChange={e => setForm({...form, date_of_higher_ordination: e.target.value})} />
                </div>
              </div>
            </div>

            {/* 🌟 3. COMPLETE BIRTHPLACE & ADDRESS SECTION */}
            <div style={{ background: '#FFFBEB', border: '1.5px solid #FDE68A', borderRadius: '16px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <MapPin size={16} className="text-amber-600" />
                <span style={{ fontWeight: 800, fontSize: '0.88rem', color: '#92400E' }}>
                  ព័ត៌មានស្រុកកំណើត និងទីកន្លែងដើម (Birthplace & Origin)
                </span>
              </div>

              <div className="form-grid">
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

                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700, color: '#78350F' }}>រាជធានី / ខេត្ត (Province) <span className="required">*</span></label>
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
            <div style={{ background: '#FFFFFF', padding: '16px', borderRadius: '16px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ fontWeight: 800, fontSize: '0.86rem', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10B981' }} />
                <span>ស្ថានភាពសុខភាព និងកំណត់ចំណាំ (Health & Notes)</span>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>ស្ថានភាពសុខភាព (Health)</label>
                  <select className="form-control" value={form.health_status} onChange={e => setForm({...form, health_status: e.target.value as any})}>
                    <option value="good">ល្អធម្មតា (Good)</option>
                    <option value="fair">មធ្យម (Fair)</option>
                    <option value="poor">ខ្សោយ (Poor)</option>
                    <option value="hospitalized">សម្រាកពេទ្យ (Hospitalized)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontWeight: 700 }}>កំណត់ចំណាំសុខភាព</label>
                  <input className="form-control" value={form.health_notes} onChange={e => setForm({...form, health_notes: e.target.value})} placeholder="ឧ. ជំងឺប្រចាំកាយ..." />
                </div>
                <div className="form-group col-span-full">
                  <label className="form-label" style={{ fontWeight: 700 }}>កំណត់ចំណាំបន្ថែម</label>
                  <textarea className="form-control" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} rows={2} placeholder="ព័ត៌មានលម្អិតផ្សេងៗ..." />
                </div>
              </div>
            </div>

          </div>

          {/* Sticky Modal Footer */}
          <div 
            style={{
              padding: '14px 22px',
              borderTop: '1.5px solid #E2E8F0',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              gap: '10px',
              background: '#FFFFFF',
              flexShrink: 0
            }}
          >
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={onClose}
              style={{ padding: '8px 18px', borderRadius: '12px', fontWeight: 700 }}
            >
              បោះបង់
            </button>
            <button 
              type="submit" 
              className="btn btn-primary hover-lift"
              style={{ padding: '8px 24px', borderRadius: '12px', fontWeight: 800, background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', border: 'none', color: '#1C1917' }}
            >
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
