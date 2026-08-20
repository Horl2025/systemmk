'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { InventoryItem } from '@/lib/database.types'
import { Package, Plus, Edit, Trash2, Search, CheckCircle, AlertTriangle, XCircle, Box, MapPin, Calendar, Tag, ArrowLeft } from 'lucide-react'

const INITIAL_DEMO_ITEMS: InventoryItem[] = [
  { id: '1', category_id: null, name: 'កង្ហារជញ្ជាំង Panasonic 16"', name_en: 'Wall Fan Panasonic 16"', serial_number: 'PSN-0012', quantity: 6, unit: 'គ្រឿង', status: 'good', location: 'កុដិសន្តិភាព', purchase_date: '2024-01-15', purchase_price: 180000, warranty_expiry: null, photo_url: null, notes: '', is_active: true, created_at: '', updated_at: '' },
  { id: '2', category_id: null, name: 'តុធ្វើការឈើប្រណិត', name_en: 'Wooden Executive Desk', serial_number: 'DSK-004', quantity: 2, unit: 'គ្រឿង', status: 'good', location: 'ការិយាល័យចៅអធិការ', purchase_date: '2023-06-20', purchase_price: 650000, warranty_expiry: null, photo_url: null, notes: '', is_active: true, created_at: '', updated_at: '' },
  { id: '3', category_id: null, name: 'អំពូលសូឡាពន្លឺព្រះអាទិត្យ 100W', name_en: 'Solar Flood Light 100W', serial_number: 'SLR-09', quantity: 4, unit: 'គ្រឿង', status: 'damaged', location: 'បរិវេណវត្ត', purchase_date: '2023-11-05', purchase_price: 240000, warranty_expiry: null, photo_url: null, notes: 'ត្រូវការជួសជុលអាគុយ', is_active: true, created_at: '', updated_at: '' },
  { id: '4', category_id: null, name: 'ម៉ាស៊ីនបំពងសំឡេងចល័ត JBL', name_en: 'JBL Portable Speaker & Mic', serial_number: 'JBL-880', quantity: 2, unit: 'ឈុត', status: 'good', location: 'សាលាឆាន់', purchase_date: '2024-02-10', purchase_price: 1200000, warranty_expiry: null, photo_url: null, notes: '', is_active: true, created_at: '', updated_at: '' },
  { id: '5', category_id: null, name: 'កម្រាលព្រំក្រហមប្រវែង ២០ម', name_en: 'Red Carpet 20m', serial_number: 'CPT-20', quantity: 3, unit: 'ដុំ', status: 'good', location: 'ព្រះវិហារ', purchase_date: '2023-08-12', purchase_price: 450000, warranty_expiry: null, photo_url: null, notes: '', is_active: true, created_at: '', updated_at: '' },
  { id: '6', category_id: null, name: 'កៅអីជ័រពណ៌ក្រហម Superware', name_en: 'Plastic Chairs Red', serial_number: 'CHR-100', quantity: 50, unit: 'កៅអី', status: 'lost', location: 'រោងបុណ្យ', purchase_date: '2022-05-18', purchase_price: 35000, warranty_expiry: null, photo_url: null, notes: 'បាត់កាលពីបុណ្យចូលឆ្នាំ', is_active: true, created_at: '', updated_at: '' },
]

export default function InventoryPage() {
  const router = useRouter()
  const [items, setItems] = useState<InventoryItem[]>(INITIAL_DEMO_ITEMS)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [showModal, setShowModal] = useState(false)

  const loadData = useCallback(async () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-systemmk.supabase.co') {
      try {
        let query = supabase.from('inventory').select('*').eq('is_active', true).order('name')
        if (filterStatus !== 'all') query = query.eq('status', filterStatus)
        const { data } = await query
        if (data && data.length > 0) {
          setItems(data as unknown as InventoryItem[])
        }
      } catch {
        // fallback
      }
    }
  }, [filterStatus])

  useEffect(() => { loadData() }, [loadData])

  const filteredItems = items.filter(i => {
    const matchesSearch = !search || 
      i.name.toLowerCase().includes(search.toLowerCase()) || 
      (i.name_en && i.name_en.toLowerCase().includes(search.toLowerCase())) ||
      (i.location && i.location.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = filterStatus === 'all' || i.status === filterStatus
    return matchesSearch && matchesStatus
  })

  const statusCounts = {
    total: items.length,
    good: items.filter(i => i.status === 'good').length,
    damaged: items.filter(i => i.status === 'damaged').length,
    lost: items.filter(i => i.status === 'lost').length,
  }

  const statusBadge = (status: string) => {
    const map: Record<string, { bg: string; text: string; border: string; label: string }> = {
      good: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0', label: '🟢 ល្អ / Good' },
      damaged: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A', label: '🟡 ខូច / Damaged' },
      lost: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA', label: '🔴 បាត់ / Lost' },
      disposed: { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0', label: '⚪ ចោល / Disposed' },
    }
    const conf = map[status] || { bg: '#F1F5F9', text: '#475569', border: '#E2E8F0', label: status }
    return (
      <span style={{ background: conf.bg, color: conf.text, border: `1px solid ${conf.border}`, padding: '4px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
        {conf.label}
      </span>
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
            <h1 className="page-title" style={{ fontSize: '1.4rem', margin: 0 }}>សម្ភារៈ & ទ្រព្យសម្បត្តិ (Inventory)</h1>
            <p className="page-subtitle" style={{ margin: '2px 0 0' }}>គ្រប់គ្រងគ្រឿងបរិក្ខារ គ្រឿងសង្ហារឹម ទីតាំង និងស្ថានភាពខូចខាត — {items.length} មុខ</p>
          </div>
        </div>
        <div className="page-header-actions" style={{ marginTop: '8px' }}>
          <button 
            className="hover-lift" 
            onClick={() => setShowModal(true)}
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
              boxShadow: '0 6px 16px rgba(109, 40, 217, 0.35)',
              fontSize: '0.82rem'
            }}
          >
            <Plus size={18} />
            <span>បន្ថែមសម្ភារៈ / Add Item</span>
          </button>
        </div>
      </div>

      {/* 🌟 4 VIVID RICH GRADIENT KPI CARDS - 2 COLUMNS ON MOBILE */}
      <div className="mobile-2-col-grid" style={{ gap: '10px' }}>
        
        {/* Card 1: Total Inventory (Purple Gradient) */}
        <div 
          className="hover-lift"
          style={{
            background: 'linear-gradient(135deg, #6D28D9 0%, #5B21B6 50%, #4C1D95 100%)',
            borderRadius: '18px',
            padding: '12px 14px',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px -5px rgba(109, 40, 217, 0.4)',
            border: '1px solid rgba(196, 181, 253, 0.3)',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#E9D5FF', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>សម្ភារៈសរុប / TOTAL</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                {statusCounts.total} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#DDD6FE' }}>មុខ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Box size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#C4B5FD', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            គ្រប់គ្រងក្នុងប្រព័ន្ធ
          </div>
        </div>

        {/* Card 2: Good Condition (Emerald Gradient) */}
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
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>ស្ថានភាពល្អ / GOOD</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                {statusCounts.good} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1FAE5' }}>មុខ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#6EE7B7', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            សមាមាត្រ: {((statusCounts.good / statusCounts.total) * 100).toFixed(0)}% កំពុងប្រើ
          </div>
        </div>

        {/* Card 3: Damaged Condition (Solar Amber Gradient) */}
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
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FDE68A', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>ខូចខាត / DAMAGED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                {statusCounts.damaged} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FEF3C7' }}>មុខ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#FCD34D', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            ត្រូវការជួសជុលបន្ទាន់
          </div>
        </div>

        {/* Card 4: Lost Items (Crimson Red Gradient) */}
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
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FECACA', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>បាត់បង់ / LOST</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                {statusCounts.lost} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FEE2E2' }}>មុខ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <XCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#FCA5A5', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            បានកត់ត្រាបាត់បង់
          </div>
        </div>

      </div>

      {/* 🌟 Search and Filter Bar */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E2E8F0', padding: '16px 20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div className="filter-bar flex-wrap gap-3">
          <div className="search-bar" style={{ minWidth: 260, border: '1.5px solid #CBD5E1', borderRadius: '12px' }}>
            <Search size={16} className="text-gray-400" />
            <input 
              placeholder="ស្វែងរកសម្ភារៈ ទីតាំង ឬលេខកូដ... Search..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
            />
          </div>

          <select 
            className="form-control" 
            style={{ width: 'auto', border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600 }} 
            value={filterStatus} 
            onChange={e => setFilterStatus(e.target.value)}
          >
            <option value="all">ស្ថានភាពទាំងអស់ (All Status)</option>
            <option value="good">🟢 ល្អ / Good</option>
            <option value="damaged">🟡 ខូច / Damaged</option>
            <option value="lost">🔴 បាត់ / Lost</option>
            <option value="disposed">⚪ ចោល / Disposed</option>
          </select>
        </div>
      </div>

      {/* 🌟 Inventory Table */}
      <div style={{ background: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr style={{ background: '#F8FAFC' }}>
                <th style={{ padding: '16px 20px', fontWeight: 800 }}>ឈ្មោះសម្ភារៈ / Asset Name</th>
                <th style={{ padding: '16px 20px', fontWeight: 800 }}>ចំនួន / Quantity</th>
                <th style={{ padding: '16px 20px', fontWeight: 800 }}>ស្ថានភាព / Status</th>
                <th style={{ padding: '16px 20px', fontWeight: 800 }}>ទីតាំង / Location</th>
                <th style={{ padding: '16px 20px', fontWeight: 800 }}>ថ្ងៃទិញ / Date</th>
                <th style={{ padding: '16px 20px', fontWeight: 800 }}>តម្លៃ / Price</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                  <td style={{ padding: '16px 20px' }}>
                    <div className="flex items-center gap-3">
                      <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #DDD6FE 0%, #C4B5FD 100%)', color: '#5B21B6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                        <Package size={20} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.95rem' }}>{item.name}</div>
                        {item.name_en && <div className="text-xs text-muted font-latin">{item.name_en}</div>}
                        {item.serial_number && <div className="text-xs text-purple-700 font-latin font-semibold">S/N: {item.serial_number}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="font-latin font-bold" style={{ color: '#1E293B', padding: '16px 20px' }}>
                    {item.quantity} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#64748B' }}>{item.unit || 'គ្រឿង'}</span>
                  </td>
                  <td style={{ padding: '16px 20px' }}>{statusBadge(item.status)}</td>
                  <td style={{ padding: '16px 20px' }}>
                    <div className="flex items-center gap-1.5" style={{ color: '#334155', fontWeight: 600 }}>
                      <MapPin size={15} className="text-amber-600" />
                      <span>{item.location || '—'}</span>
                    </div>
                  </td>
                  <td className="font-latin" style={{ color: '#64748B', padding: '16px 20px' }}>{item.purchase_date || '—'}</td>
                  <td className="font-latin font-bold" style={{ color: '#7C3AED', fontSize: '0.95rem', padding: '16px 20px' }}>
                    {item.purchase_price ? item.purchase_price.toLocaleString() + ' ៛' : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && <InventoryModal onClose={() => { setShowModal(false); loadData() }} />}
    </div>
  )
}

function InventoryModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: '', name_en: '', quantity: 1, unit: 'គ្រឿង', status: 'good', location: '', purchase_date: '', purchase_price: '', notes: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await (supabase.from('inventory') as any).insert({
      ...form,
      purchase_price: form.purchase_price ? Number(form.purchase_price) : null,
      purchase_date: form.purchase_date || null,
    })
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md">
        <div className="modal-header">
          <h3 className="modal-title">បន្ថែមសម្ភារៈ / Add Inventory</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-3">
            <div className="form-group">
              <label className="form-label">ឈ្មោះសម្ភារៈ (ខ្មែរ) <span className="required">*</span></label>
              <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="ឧ. កង្ហារ..." />
            </div>
            <div className="form-group">
              <label className="form-label">ឈ្មោះជាភាសាអង់គ្លេស</label>
              <input className="form-control" value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} placeholder="Ex. Wall Fan" />
            </div>
            <div className="grid-cols-2 gap-3" style={{ display: 'grid' }}>
              <div className="form-group">
                <label className="form-label">ចំនួន</label>
                <input className="form-control" type="number" min="1" value={form.quantity} onChange={e => setForm({...form, quantity: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">ឯកតា / Unit</label>
                <input className="form-control" value={form.unit} onChange={e => setForm({...form, unit: e.target.value})} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">ទីតាំងរក្សាទុក</label>
              <input className="form-control" value={form.location} onChange={e => setForm({...form, location: e.target.value})} placeholder="ឧ. កុដិលេខ ១" />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>បោះបង់</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>រក្សាទុក / Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
