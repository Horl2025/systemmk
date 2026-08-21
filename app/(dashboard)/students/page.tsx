'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Student } from '@/lib/database.types'
import { Plus, Search, Edit, Trash2, GraduationCap, Phone, MapPin, Building } from 'lucide-react'
import { formatDate } from '@/lib/utils'

const INITIAL_STUDENTS: Student[] = []

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS)
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    async function loadData() {
      // 1. Load local custom students
      try {
        const saved = localStorage.getItem('systemmk_custom_students')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStudents(parsed)
          }
        }
      } catch {}

      // 2. Fetch from Supabase
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-systemmk.supabase.co') {
        try {
          const { data } = await supabase.from('students').select('*').eq('is_active', true).order('khmer_name')
          if (data && data.length > 0) {
            setStudents(prev => {
              const ids = new Set(prev.map(s => s.id))
              const newItems = (data as unknown as Student[]).filter(s => !ids.has(s.id))
              const merged = [...prev, ...newItems]
              try { localStorage.setItem('systemmk_custom_students', JSON.stringify(merged)) } catch {}
              return merged
            })
          }
        } catch {
          // fallback
        }
      }
    }
    loadData()
  }, [])

  const displayedStudents = students.filter(st => {
    if (!search) return true
    const s = search.toLowerCase()
    return st.khmer_name.toLowerCase().includes(s) || (st.latin_name && st.latin_name.toLowerCase().includes(s)) || (st.school_name && st.school_name.toLowerCase().includes(s))
  })

  const handleDelete = (id: string) => {
    if (!confirm('តើអ្នកពិតជាចង់លុបទិន្នន័យសិស្សរូបនេះមែនទេ?')) return
    const updated = students.filter(s => s.id !== id)
    setStudents(updated)
    try { localStorage.setItem('systemmk_custom_students', JSON.stringify(updated)) } catch {}
  }

  return (
    <div className="animate-fadeIn space-y-6">
      <div className="page-header">
        <div>
          <h1 className="page-title">សិស្ស & អ្នកស្នាក់នៅ</h1>
          <p className="page-subtitle">Students & Residents — {displayedStudents.length} នាក់</p>
        </div>
        <div className="page-header-actions">
          <button className="btn btn-primary hover-lift" onClick={() => setShowModal(true)}>
            <Plus size={16} />
            <span>បន្ថែមសិស្សស្នាក់នៅ / Add Student</span>
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="card">
        <div className="card-body" style={{ padding: 'var(--space-4)' }}>
          <div className="search-bar" style={{ maxWidth: 450 }}>
            <Search size={16} className="search-bar-icon" />
            <input placeholder="ស្វែងរកតាមឈ្មោះ, សាលារៀន, Latin..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="card" style={{ borderRadius: '20px', overflow: 'hidden' }}>
        <div className="table-wrapper" style={{ border: 'none' }}>
          <table className="table">
            <thead>
              <tr>
                <th>ឈ្មោះសិស្ស / Student</th>
                <th>ថ្ងៃខែឆ្នាំកំណើត / DOB</th>
                <th>សាលារៀន / School</th>
                <th>កម្រិតថ្នាក់ / Grade</th>
                <th>លេខទូរស័ព្ទ / Phone</th>
                <th>ស្រុកកំណើត / Province</th>
                <th style={{ textAlign: 'right' }}>សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {displayedStudents.map(s => (
                <tr key={s.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div style={{ width: '38px', height: '38px', borderRadius: '12px', background: 'linear-gradient(135deg, #E0F2FE 0%, #BAE6FD 100%)', color: '#0284C7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                        {s.photo_url ? <img src={s.photo_url} alt="" style={{ width: '100%', height: '100%', borderRadius: '12px' }} /> : <span>{s.khmer_name.charAt(0)}</span>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: '#0F172A' }}>{s.khmer_name}</div>
                        {s.latin_name && <div className="text-xs text-muted font-latin">{s.latin_name}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="font-latin">{formatDate(s.date_of_birth)}</td>
                  <td>
                    <div style={{ fontWeight: 600, color: '#334155' }}>{s.school_name || '—'}</div>
                  </td>
                  <td><span className="badge badge-primary">{s.grade_level || '—'}</span></td>
                  <td className="font-latin">{s.phone || s.parent_phone || '—'}</td>
                  <td>{s.home_province || '—'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--color-danger)' }} onClick={() => handleDelete(s.id)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <StudentModal 
          onClose={() => setShowModal(false)} 
          onAdd={async (newStudent) => {
            setStudents(prev => {
              const updated = [newStudent, ...prev]
              try { localStorage.setItem('systemmk_custom_students', JSON.stringify(updated)) } catch {}
              return updated
            })

            if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-systemmk.supabase.co') {
              try {
                await (supabase.from('students') as any).insert([newStudent])
              } catch {}
            }
          }} 
        />
      )}
    </div>
  )
}

function StudentModal({ onClose, onAdd }: { onClose: () => void; onAdd: (student: Student) => void }) {
  const [form, setForm] = useState({ khmer_name: '', latin_name: '', date_of_birth: '', gender: 'male', school_name: '', grade_level: '', home_province: '', phone: '', parent_phone: '', notes: '' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const newS: Student = {
      id: Date.now().toString(),
      khmer_name: form.khmer_name,
      latin_name: form.latin_name || null,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender,
      school_name: form.school_name || null,
      grade_level: form.grade_level || null,
      room_id: null,
      home_province: form.home_province || null,
      phone: form.phone || null,
      parent_phone: form.parent_phone || null,
      photo_url: null,
      is_active: true,
      joined_date: new Date().toISOString(),
      notes: form.notes || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    onAdd(newS)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-lg">
        <div className="modal-header">
          <h3 className="modal-title">បន្ថែមព័ត៌មានសិស្ស / Add Student</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-3">
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">ឈ្មោះខ្មែរ <span className="required">*</span></label>
                <input className="form-control" value={form.khmer_name} onChange={e => setForm({...form, khmer_name: e.target.value})} required placeholder="ឧ. ជា វណ្ណា" />
              </div>
              <div className="form-group">
                <label className="form-label">ឈ្មោះឡាតាំង</label>
                <input className="form-control" value={form.latin_name} onChange={e => setForm({...form, latin_name: e.target.value})} placeholder="Ex. Chea Vanna" />
              </div>
              <div className="form-group">
                <label className="form-label">ថ្ងៃខែឆ្នាំកំណើត</label>
                <input className="form-control" type="date" value={form.date_of_birth} onChange={e => setForm({...form, date_of_birth: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">សាលារៀន</label>
                <input className="form-control" value={form.school_name} onChange={e => setForm({...form, school_name: e.target.value})} placeholder="ឧ. សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ" />
              </div>
              <div className="form-group">
                <label className="form-label">កម្រិតថ្នាក់</label>
                <input className="form-control" value={form.grade_level} onChange={e => setForm({...form, grade_level: e.target.value})} placeholder="ឧ. ឆ្នាំទី ២" />
              </div>
              <div className="form-group">
                <label className="form-label">ខេត្ត/ស្រុកកំណើត</label>
                <input className="form-control" value={form.home_province} onChange={e => setForm({...form, home_province: e.target.value})} placeholder="ឧ. កំពង់ចាម" />
              </div>
              <div className="form-group">
                <label className="form-label">លេខទូរស័ព្ទផ្ទាល់ខ្លួន</label>
                <input className="form-control" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">លេខទូរស័ព្ទអាណាព្យាបាល</label>
                <input className="form-control" value={form.parent_phone} onChange={e => setForm({...form, parent_phone: e.target.value})} />
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>បោះបង់</button>
            <button type="submit" className="btn btn-primary">រក្សាទុក / Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
