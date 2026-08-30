'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Monk, Student } from '@/lib/database.types'
import { MONK_RANK_LABELS, formatDate, calculateVassa, calculateAge } from '@/lib/utils'
import { 
  Contact, Search, Printer, ChevronRight, Plus, Edit3, Trash2, UserPlus, Upload, Sparkles, X, Check
} from 'lucide-react'
import { fetchCloudCollection, syncToCloud, subscribeToRealtimeSync } from '@/lib/cloudSync'

type MemberType = 'all' | 'monk' | 'student'

interface UnifiedMember {
  id: string
  type: 'monk' | 'student'
  khmer_name: string
  latin_name?: string | null
  dhamma_name?: string | null
  gender?: string
  date_of_birth?: string | null
  rank?: string
  status?: string
  room_number?: string | null
  phone?: string | null
  home_province?: string | null
  origin_temple?: string | null
  school_name?: string | null
  grade?: string | null
  major?: string | null
  date_of_ordination?: string | null
  photo_url?: string | null
}

export default function IDCardsPage() {
  const router = useRouter()
  const [monks, setMonks] = useState<Monk[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<MemberType>('all')

  // Modals state
  const [showAddTypeModal, setShowAddTypeModal] = useState(false)
  const [showMonkModal, setShowMonkModal] = useState(false)
  const [editingMonk, setEditingMonk] = useState<Monk | null>(null)
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  // Load Monks and Students data
  const loadData = async () => {
    setLoading(true)
    try {
      // 1. Load Monks
      let loadedMonks: Monk[] = []
      const savedMonks = localStorage.getItem('systemmk_custom_monks')
      if (savedMonks) {
        try {
          const parsed = JSON.parse(savedMonks)
          if (Array.isArray(parsed)) loadedMonks = parsed
        } catch {}
      }
      const cloudMonks = await fetchCloudCollection('monks')
      if (cloudMonks && Array.isArray(cloudMonks) && cloudMonks.length > 0) {
        const map = new Map<string, Monk>()
        loadedMonks.forEach(m => { if (m?.id) map.set(m.id, m) })
        cloudMonks.forEach(m => { if (m?.id) map.set(m.id, m) })
        loadedMonks = Array.from(map.values())
      }
      setMonks(loadedMonks)

      // 2. Load Students
      let loadedStudents: Student[] = []
      const savedStudents = localStorage.getItem('systemmk_custom_students')
      if (savedStudents) {
        try {
          const parsed = JSON.parse(savedStudents)
          if (Array.isArray(parsed)) loadedStudents = parsed
        } catch {}
      }
      const cloudStudents = await fetchCloudCollection('students')
      if (cloudStudents && Array.isArray(cloudStudents) && cloudStudents.length > 0) {
        const map = new Map<string, Student>()
        loadedStudents.forEach(s => { if (s?.id) map.set(s.id, s) })
        cloudStudents.forEach(s => { if (s?.id) map.set(s.id, s) })
        loadedStudents = Array.from(map.values())
      }
      setStudents(loadedStudents)
    } catch {}
    setLoading(false)
  }

  useEffect(() => {
    loadData()
    const unsubscribe = subscribeToRealtimeSync(() => loadData())
    const handleUpdate = () => loadData()
    window.addEventListener('systemmk_data_updated', handleUpdate)
    return () => {
      unsubscribe()
      window.removeEventListener('systemmk_data_updated', handleUpdate)
    }
  }, [])

  // Save Monk (Add or Edit)
  const handleSaveMonk = (savedMonk: Monk) => {
    let updated: Monk[]
    if (editingMonk) {
      updated = monks.map(m => m.id === savedMonk.id ? savedMonk : m)
      syncToCloud('edit', 'monks', savedMonk)
    } else {
      updated = [savedMonk, ...monks]
      syncToCloud('add', 'monks', savedMonk)
    }
    setMonks(updated)
    try {
      localStorage.setItem('systemmk_custom_monks', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('systemmk_data_updated', { detail: { collection: 'monks' } }))
    } catch {}
    setEditingMonk(null)
    setShowMonkModal(false)
  }

  // Save Student (Add or Edit)
  const handleSaveStudent = (savedStudent: Student) => {
    let updated: Student[]
    if (editingStudent) {
      updated = students.map(s => s.id === savedStudent.id ? savedStudent : s)
      syncToCloud('edit', 'students', savedStudent)
    } else {
      updated = [savedStudent, ...students]
      syncToCloud('add', 'students', savedStudent)
    }
    setStudents(updated)
    try {
      localStorage.setItem('systemmk_custom_students', JSON.stringify(updated))
      window.dispatchEvent(new CustomEvent('systemmk_data_updated', { detail: { collection: 'students' } }))
    } catch {}
    setEditingStudent(null)
    setShowStudentModal(false)
  }

  // Delete Member Handler
  const handleDeleteMember = (member: UnifiedMember) => {
    if (!confirm(`តើអ្នកពិតជាចង់លុបទិន្នន័យកាតរបស់ "${member.khmer_name}" មែនទេ?`)) return

    if (member.type === 'monk') {
      const updated = monks.filter(m => m.id !== member.id)
      setMonks(updated)
      try {
        localStorage.setItem('systemmk_custom_monks', JSON.stringify(updated))
        syncToCloud('delete', 'monks', { id: member.id })
        window.dispatchEvent(new CustomEvent('systemmk_data_updated', { detail: { collection: 'monks' } }))
      } catch {}
    } else {
      const updated = students.filter(s => s.id !== member.id)
      setStudents(updated)
      try {
        localStorage.setItem('systemmk_custom_students', JSON.stringify(updated))
        syncToCloud('delete', 'students', { id: member.id })
        window.dispatchEvent(new CustomEvent('systemmk_data_updated', { detail: { collection: 'students' } }))
      } catch {}
    }
  }

  // Edit Member Handler
  const handleEditMember = (member: UnifiedMember) => {
    if (member.type === 'monk') {
      const m = monks.find(item => item.id === member.id)
      if (m) {
        setEditingMonk(m)
        setShowMonkModal(true)
      }
    } else {
      const s = students.find(item => item.id === member.id)
      if (s) {
        setEditingStudent(s)
        setShowStudentModal(true)
      }
    }
  }

  // Combine into unified list
  const unifiedMembers: UnifiedMember[] = [
    ...monks.map(m => ({
      id: m.id,
      type: 'monk' as const,
      khmer_name: m.khmer_name,
      latin_name: m.latin_name,
      dhamma_name: m.dhamma_name,
      gender: 'ប្រុស',
      date_of_birth: m.date_of_birth,
      rank: m.rank,
      status: m.status,
      room_number: (m as any).room_number || (m as any).room?.room_number || 'កុដិលេខ ១',
      phone: (m as any).phone || null,
      home_province: m.home_province,
      origin_temple: m.origin_temple,
      date_of_ordination: m.date_of_ordination,
      photo_url: m.photo_url
    })),
    ...students.map(s => ({
      id: s.id,
      type: 'student' as const,
      khmer_name: s.khmer_name,
      latin_name: s.latin_name,
      dhamma_name: null,
      gender: s.gender === 'female' ? 'ស្រី' : 'ប្រុស',
      date_of_birth: s.date_of_birth,
      rank: undefined,
      status: undefined,
      room_number: (s as any).room_number || (s as any).room?.room_number || 'បន្ទប់សិស្ស',
      phone: s.phone,
      home_province: s.home_province,
      origin_temple: null,
      school_name: s.school_name,
      grade: s.grade_level || null,
      major: null,
      date_of_ordination: null,
      photo_url: s.photo_url
    }))
  ]

  // Filter members
  const filteredMembers = unifiedMembers.filter(member => {
    if (typeFilter !== 'all' && member.type !== typeFilter) return false
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      member.khmer_name.toLowerCase().includes(q) ||
      (member.latin_name && member.latin_name.toLowerCase().includes(q)) ||
      (member.dhamma_name && member.dhamma_name.toLowerCase().includes(q)) ||
      (member.home_province && member.home_province.toLowerCase().includes(q)) ||
      (member.school_name && member.school_name.toLowerCase().includes(q)) ||
      (member.id.toLowerCase().includes(q))
    )
  })

  // Print Single Card Handler
  const handlePrintCard = (member: UnifiedMember) => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const cardIdFormatted = `MK-${member.type === 'monk' ? 'M' : 'S'}-${member.id.slice(-5).toUpperCase()}`
    const roleText = member.type === 'monk' 
      ? (MONK_RANK_LABELS[member.rank as any]?.kh || 'ព្រះសង្ឃ') 
      : 'សិស្សស្នាក់នៅវត្ត'

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>បោះពុម្ពកាតសម្គាល់ខ្លួន - ${member.khmer_name}</title>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 15mm;
          }
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          body {
            font-family: 'Kantumruy Pro', 'Plus Jakarta Sans', sans-serif;
            background: #F1F5F9;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            padding: 20px;
            color: #0F172A;
          }
          .cards-wrapper {
            display: flex;
            gap: 25px;
            flex-wrap: wrap;
            justify-content: center;
          }
          .id-card {
            width: 340px;
            height: 520px;
            border-radius: 20px;
            background: #FFFFFF;
            box-shadow: 0 10px 25px rgba(0,0,0,0.12);
            position: relative;
            overflow: hidden;
            border: 2px solid ${member.type === 'monk' ? '#F59E0B' : '#3B82F6'};
            display: flex;
            flex-direction: column;
            page-break-inside: avoid;
          }
          .card-header {
            background: ${member.type === 'monk' ? 'linear-gradient(135deg, #1C1917 0%, #351C06 60%, #78350F 100%)' : 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)'};
            color: #FFFFFF;
            padding: 16px;
            text-align: center;
            border-bottom: 3px solid ${member.type === 'monk' ? '#F59E0B' : '#60A5FA'};
          }
          .card-header h2 {
            font-size: 14px;
            font-weight: 800;
            color: #FEF3C7;
            letter-spacing: 0.5px;
          }
          .card-header p {
            font-size: 10px;
            color: #E2E8F0;
            margin-top: 2px;
          }
          .photo-container {
            width: 105px;
            height: 125px;
            margin: 14px auto 8px auto;
            border-radius: 14px;
            border: 3px solid ${member.type === 'monk' ? '#F59E0B' : '#3B82F6'};
            background: #F8FAFC;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }
          .photo-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .member-name {
            text-align: center;
            font-size: 16px;
            font-weight: 800;
            color: #0F172A;
            margin-top: 2px;
          }
          .member-latin {
            text-align: center;
            font-size: 11px;
            color: #64748B;
            font-weight: 600;
            font-family: 'Plus Jakarta Sans', sans-serif;
          }
          .role-badge {
            margin: 6px auto 10px auto;
            background: ${member.type === 'monk' ? '#FEF3C7' : '#EFF6FF'};
            color: ${member.type === 'monk' ? '#92400E' : '#1E40AF'};
            border: 1px solid ${member.type === 'monk' ? '#FDE68A' : '#BFDBFE'};
            font-size: 11px;
            font-weight: 800;
            padding: 3px 12px;
            border-radius: 12px;
            display: inline-block;
          }
          .details-box {
            background: #F8FAFC;
            border-radius: 12px;
            margin: 0 16px;
            padding: 10px 12px;
            border: 1px solid #E2E8F0;
            font-size: 11px;
            line-height: 1.6;
          }
          .details-row {
            display: flex;
            justify-content: space-between;
            border-bottom: 1px dashed #E2E8F0;
            padding: 2px 0;
          }
          .details-row:last-child {
            border-bottom: none;
          }
          .details-label {
            color: #64748B;
          }
          .details-val {
            font-weight: 700;
            color: #1E293B;
          }
          .card-footer {
            margin-top: auto;
            padding: 10px 16px;
            background: #FFFFFF;
            border-top: 1px solid #F1F5F9;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .card-id-text {
            font-size: 11px;
            font-weight: 800;
            font-family: monospace;
            color: #0F172A;
          }
          .qr-box {
            width: 46px;
            height: 46px;
            border: 1px solid #CBD5E1;
            border-radius: 8px;
            padding: 2px;
            background: #FFFFFF;
          }
          .back-card {
            background: #FFFFFF;
            padding: 20px 16px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
          }
          .rules-list {
            font-size: 10.5px;
            color: #334155;
            line-height: 1.6;
            margin-top: 10px;
          }
          .seal-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #E2E8F0;
          }
          .print-actions {
            margin-bottom: 20px;
            display: flex;
            gap: 10px;
          }
          .btn-print {
            background: #F59E0B;
            color: #1C1917;
            font-weight: 800;
            font-size: 14px;
            padding: 10px 20px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(245, 158, 11, 0.4);
          }
          @media print {
            body {
              background: #FFFFFF;
              padding: 0;
            }
            .print-actions {
              display: none;
            }
            .id-card {
              box-shadow: none;
              border: 1.5px solid #CBD5E1;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-actions">
          <button class="btn-print" onclick="window.print()">🖨️ ចុចបោះពុម្ពកាតសម្គាល់ខ្លួន (Print ID Card)</button>
        </div>

        <div class="cards-wrapper">
          <!-- FRONT SIDE -->
          <div class="id-card">
            <div class="card-header">
              <h2>វត្តអារាមពុទ្ធសាសនា SYSTEMMK</h2>
              <p>MONASTERY RESIDENCE IDENTIFICATION CARD</p>
            </div>

            <div class="photo-container">
              ${member.photo_url ? `<img src="${member.photo_url}" alt="${member.khmer_name}">` : `<span style="font-size: 32px; font-weight: 800; color: #94A3B8;">${member.khmer_name.charAt(0)}</span>`}
            </div>

            <div class="member-name">${member.khmer_name}</div>
            ${member.latin_name ? `<div class="member-latin">${member.latin_name}</div>` : ''}

            <div style="text-align: center;">
              <span class="role-badge">${roleText}</span>
            </div>

            <div class="details-box">
              ${member.dhamma_name ? `<div class="details-row"><span class="details-label">ឆាយា:</span><span class="details-val">${member.dhamma_name}</span></div>` : ''}
              ${member.date_of_birth ? `<div class="details-row"><span class="details-label">ថ្ងៃកំណើត:</span><span class="details-val">${formatDate(member.date_of_birth)} (${calculateAge(member.date_of_birth)} ឆ្នាំ)</span></div>` : ''}
              ${member.date_of_ordination ? `<div class="details-row"><span class="details-label">ថ្ងៃបួស:</span><span class="details-val">${formatDate(member.date_of_ordination)} (${calculateVassa(member.date_of_ordination)} វស្សា)</span></div>` : ''}
              ${member.school_name ? `<div class="details-row"><span class="details-label">សាលារៀន:</span><span class="details-val">${member.school_name} ${member.grade ? `(${member.grade})` : ''}</span></div>` : ''}
              <div class="details-row"><span class="details-label">ទីកន្លែងស្នាក់នៅ:</span><span class="details-val">${member.room_number || 'កុដិវត្ត'}</span></div>
              <div class="details-row"><span class="details-label">ស្រុកកំណើត:</span><span class="details-val">${member.home_province || 'ព្រះរាជាណាចក្រកម្ពុជា'}</span></div>
            </div>

            <div class="card-footer">
              <div>
                <div style="font-size: 8px; color: #64748B;">CARD IDENTIFICATION</div>
                <div class="card-id-text">${cardIdFormatted}</div>
              </div>
              <img class="qr-box" src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`SYSTEMMK:ID:${member.id}:${member.khmer_name}`)}" alt="QR Code" />
            </div>
          </div>

          <!-- BACK SIDE -->
          <div class="id-card back-card">
            <div>
              <div style="text-align: center; border-bottom: 2px solid #E2E8F0; padding-bottom: 8px;">
                <h3 style="font-size: 13px; font-weight: 800; color: #1E293B;">លក្ខន្តិកៈ និងការប្រើប្រាស់កាត</h3>
                <p style="font-size: 9px; color: #64748B;">TERMS OF RESIDENCE IDENTIFICATION</p>
              </div>

              <div class="rules-list">
                <p>១. កាតនេះជាសម្គាល់ខ្លួនផ្លូវការរបស់អ្នកស្នាក់នៅក្នុងវត្តអារាម។</p>
                <p>២. ត្រូវរក្សាកាតនេះឱ្យបានគង់វង្ស និងពាក់ពេលបំពេញកិច្ចការវត្ត។</p>
                <p>៣. ករណីបាត់បង់ សូមរាយការណ៍បន្ទាន់ទៅកាន់លេខាធិការដ្ឋានវត្ត។</p>
                <p>៤. បុគ្គលរើសបាន សូមយកមកប្រគល់ជូនគណៈកម្មការវត្តវិញ។</p>
              </div>
            </div>

            <div style="background: #F8FAFC; border-radius: 10px; padding: 8px; border: 1px solid #E2E8F0; text-align: center; font-size: 10px;">
              <div style="color: #64748B;">ទំនាក់ទំនងសង្គ្រោះបន្ទាន់ (Emergency Contact):</div>
              <div style="font-weight: 800; color: #0F172A; margin-top: 2px;">☎️ ${member.phone || '០១២ ៣៤៥ ៦៧៨ / ០៩៨ ៧៦៥ ៤៣២'}</div>
            </div>

            <div class="seal-section" style="justify-content: flex-end;">
              <div style="text-align: center; width: 50%;">
                <div style="font-size: 10px; font-weight: 700; color: #1E293B;">ព្រះមេកុដិ</div>
                <div style="height: 40px; display: flex; align-items: center; justify-content: center; color: #DC2626; font-size: 10.5px; font-weight: 800;">
                  [ សម្គាល់ត្រាកុដិ ]
                </div>
                <div style="font-size: 10px; font-weight: 700; border-top: 1px dotted #94A3B8; padding-top: 2px;">ហត្ថលេខា និងត្រា</div>
              </div>
            </div>

          </div>
        </div>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  // Print All Filtered Cards Handler
  const handlePrintAll = () => {
    const printWindow = window.open('', '_blank')
    if (!printWindow) return

    const cardsHtml = filteredMembers.map(member => {
      const cardIdFormatted = `MK-${member.type === 'monk' ? 'M' : 'S'}-${member.id.slice(-5).toUpperCase()}`
      const roleText = member.type === 'monk' 
        ? (MONK_RANK_LABELS[member.rank as any]?.kh || 'ព្រះសង្ឃ') 
        : 'សិស្សស្នាក់នៅវត្ត'

      return `
        <div class="id-card">
          <div class="card-header ${member.type}">
            <h2>វត្តអារាមពុទ្ធសាសនា SYSTEMMK</h2>
            <p>MONASTERY RESIDENCE ID CARD</p>
          </div>

          <div class="photo-container ${member.type}">
            ${member.photo_url ? `<img src="${member.photo_url}" alt="${member.khmer_name}">` : `<span style="font-size: 28px; font-weight: 800; color: #94A3B8;">${member.khmer_name.charAt(0)}</span>`}
          </div>

          <div class="member-name">${member.khmer_name}</div>
          ${member.latin_name ? `<div class="member-latin">${member.latin_name}</div>` : ''}

          <div style="text-align: center;">
            <span class="role-badge ${member.type}">${roleText}</span>
          </div>

          <div class="details-box">
            ${member.dhamma_name ? `<div class="details-row"><span>ឆាយា:</span><strong>${member.dhamma_name}</strong></div>` : ''}
            ${member.date_of_birth ? `<div class="details-row"><span>ថ្ងៃកំណើត:</span><strong>${formatDate(member.date_of_birth)} (${calculateAge(member.date_of_birth)} ឆ្នាំ)</strong></div>` : ''}
            ${member.school_name ? `<div class="details-row"><span>សាលា:</span><strong>${member.school_name}</strong></div>` : ''}
            <div class="details-row"><span>ស្នាក់នៅ:</span><strong>${member.room_number || 'កុដិវត្ត'}</strong></div>
            <div class="details-row"><span>ខេត្ត:</span><strong>${member.home_province || 'កម្ពុជា'}</strong></div>
          </div>

          <div class="card-footer">
            <div>
              <div style="font-size: 7.5px; color: #64748B;">CARD ID</div>
              <div class="card-id-text">${cardIdFormatted}</div>
            </div>
            <img class="qr-box" src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(`SYSTEMMK:ID:${member.id}:${member.khmer_name}`)}" alt="QR" />
          </div>
        </div>
      `
    }).join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>បោះពុម្ពកាតសម្គាល់ខ្លួនទាំងអស់ (${filteredMembers.length})</title>
        <meta charset="utf-8" />
        <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;600;700;800&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap" rel="stylesheet">
        <style>
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: 'Kantumruy Pro', 'Plus Jakarta Sans', sans-serif;
            background: #F8FAFC;
            padding: 20px;
          }
          .grid-container {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            justify-content: center;
          }
          .id-card {
            width: 100%;
            height: 460px;
            border-radius: 16px;
            background: #FFFFFF;
            position: relative;
            overflow: hidden;
            border: 1.5px solid #CBD5E1;
            display: flex;
            flex-direction: column;
            page-break-inside: avoid;
          }
          .card-header {
            color: #FFFFFF;
            padding: 12px;
            text-align: center;
          }
          .card-header.monk {
            background: linear-gradient(135deg, #1C1917 0%, #351C06 60%, #78350F 100%) ;
            border-bottom: 2px solid #F59E0B;
          }
          .card-header.student {
            background: linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%);
            border-bottom: 2px solid #3B82F6;
          }
          .card-header h2 { font-size: 12px; font-weight: 800; color: #FEF3C7; }
          .card-header p { font-size: 8.5px; color: #E2E8F0; margin-top: 1px; }
          .photo-container {
            width: 85px;
            height: 100px;
            margin: 10px auto 6px auto;
            border-radius: 10px;
            background: #F8FAFC;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .photo-container.monk { border: 2px solid #F59E0B; }
          .photo-container.student { border: 2px solid #3B82F6; }
          .photo-container img { width: 100%; height: 100%; object-fit: cover; }
          .member-name { text-align: center; font-size: 14px; font-weight: 800; color: #0F172A; }
          .member-latin { text-align: center; font-size: 10px; color: #64748B; font-weight: 600; }
          .role-badge {
            margin: 4px auto 8px auto;
            font-size: 10px;
            font-weight: 800;
            padding: 2px 10px;
            border-radius: 10px;
            display: inline-block;
          }
          .role-badge.monk { background: #FEF3C7; color: #92400E; border: 1px solid #FDE68A; }
          .role-badge.student { background: #EFF6FF; color: #1E40AF; border: 1px solid #BFDBFE; }
          .details-box {
            background: #F8FAFC;
            border-radius: 10px;
            margin: 0 12px;
            padding: 8px 10px;
            border: 1px solid #E2E8F0;
            font-size: 10px;
            line-height: 1.5;
          }
          .details-row { display: flex; justify-content: space-between; border-bottom: 1px dashed #E2E8F0; padding: 2px 0; }
          .details-row:last-child { border-bottom: none; }
          .card-footer {
            margin-top: auto;
            padding: 8px 12px;
            background: #FFFFFF;
            border-top: 1px solid #F1F5F9;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }
          .card-id-text { font-size: 10px; font-weight: 800; font-family: monospace; }
          .qr-box { width: 38px; height: 38px; }
          .print-btn {
            background: #F59E0B;
            color: #1C1917;
            font-weight: 800;
            padding: 10px 24px;
            border-radius: 12px;
            border: none;
            cursor: pointer;
            margin-bottom: 20px;
          }
          @media print {
            .print-btn { display: none; }
            body { background: #FFFFFF; padding: 0; }
          }
        </style>
      </head>
      <body>
        <div style="text-align: center;">
          <button class="print-btn" onclick="window.print()">🖨️ ចុចបោះពុម្ពកាតទាំងអស់ (Print All ID Cards)</button>
        </div>
        <div class="grid-container">
          ${cardsHtml}
        </div>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  }

  return (
    <div className="animate-fadeIn space-y-6" style={{ paddingBottom: 'var(--space-8)' }}>
      
      {/* 🌟 Header Section */}
      <div className="page-header" style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={() => router.push('/dashboard')}
            className="hover-lift"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              border: '1.5px solid #E2E8F0',
              background: '#FFFFFF',
              color: '#1E293B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
              flexShrink: 0
            }}
            title="ត្រឡប់ទៅផ្ទាំងគ្រប់គ្រង"
          >
            <ChevronRight size={20} style={{ transform: 'rotate(180deg)' }} />
          </button>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#1C1917', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Contact size={18} />
              </div>
              <h1 className="page-title" style={{ margin: 0 }}>កាតសម្គាល់ខ្លួន (ID Cards)</h1>
            </div>
            <p className="page-subtitle" style={{ margin: '4px 0 0 0' }}>
              បង្កើត បោះពុម្ព និងគ្រប់គ្រងប័ណ្ណសម្គាល់ខ្លួនសម្រាប់ព្រះសង្ឃ និងសិស្សស្នាក់នៅវត្ត
            </p>
          </div>
        </div>

        {/* Action Buttons: Add New & Print All */}
        <div className="page-actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => setShowAddTypeModal(true)}
            className="hover-lift"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#1C1917',
              fontWeight: 800,
              padding: '9px 16px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
            }}
          >
            <Plus size={16} strokeWidth={3} />
            <span>+ បន្ថែមកាតថ្មី (Add New)</span>
          </button>

          <button
            type="button"
            onClick={handlePrintAll}
            className="hover-lift"
            style={{
              background: '#FFFFFF',
              color: '#1E293B',
              fontWeight: 800,
              padding: '9px 16px',
              borderRadius: '12px',
              border: '1.5px solid #CBD5E1',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '0.84rem',
              boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
            }}
          >
            <Printer size={16} />
            <span>បោះពុម្ពកាតទាំងអស់ ({filteredMembers.length})</span>
          </button>
        </div>
      </div>

      {/* 🌟 Filter & Search Bar */}
      <div style={{ background: '#FFFFFF', borderRadius: '18px', padding: '14px 18px', border: '1.5px solid #E2E8F0', boxShadow: '0 4px 14px rgba(0,0,0,0.03)', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
        
        {/* Type Filter Pills */}
        <div style={{ display: 'flex', gap: '6px', background: '#F1F5F9', padding: '4px', borderRadius: '12px' }}>
          <button
            onClick={() => setTypeFilter('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              border: 'none',
              background: typeFilter === 'all' ? '#FFFFFF' : 'transparent',
              color: typeFilter === 'all' ? '#0F172A' : '#64748B',
              fontWeight: typeFilter === 'all' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              boxShadow: typeFilter === 'all' ? '0 2px 6px rgba(0,0,0,0.08)' : 'none'
            }}
          >
            ទាំងអស់ ({unifiedMembers.length})
          </button>
          <button
            onClick={() => setTypeFilter('monk')}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              border: 'none',
              background: typeFilter === 'monk' ? '#FEF3C7' : 'transparent',
              color: typeFilter === 'monk' ? '#92400E' : '#64748B',
              fontWeight: typeFilter === 'monk' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: typeFilter === 'monk' ? '0 2px 6px rgba(245, 158, 11, 0.2)' : 'none'
            }}
          >
            <span>🙏 ព្រះសង្ឃ ({monks.length})</span>
          </button>
          <button
            onClick={() => setTypeFilter('student')}
            style={{
              padding: '6px 14px',
              borderRadius: '9px',
              border: 'none',
              background: typeFilter === 'student' ? '#EFF6FF' : 'transparent',
              color: typeFilter === 'student' ? '#1E40AF' : '#64748B',
              fontWeight: typeFilter === 'student' ? 800 : 600,
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: typeFilter === 'student' ? '0 2px 6px rgba(59, 130, 246, 0.2)' : 'none'
            }}
          >
            <span>🎓 សិស្សវត្ត ({students.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '240px', flex: '1', maxWidth: '380px' }}>
          <Search size={16} color="#94A3B8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="ស្វែងរកតាមឈ្មោះ, ឆាយា, ខេត្ត..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 36px',
              borderRadius: '10px',
              border: '1.5px solid #CBD5E1',
              fontSize: '0.82rem',
              fontWeight: 600,
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* 🌟 ID Cards Grid */}
      {filteredMembers.length === 0 ? (
        <div style={{ background: '#FFFFFF', borderRadius: '20px', padding: '50px 20px', textAlign: 'center', border: '1.5px dashed #CBD5E1', color: '#64748B' }}>
          <Contact size={48} color="#CBD5E1" style={{ margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#1E293B' }}>មិនមានទិន្នន័យកាតសម្គាល់ខ្លួនឡើយ</h3>
          <p style={{ fontSize: '0.8rem', marginTop: '4px', marginBottom: '16px' }}>ចុចប៊ូតុងខាងក្រោមដើម្បីបង្កើតកាតព្រះសង្ឃ ឬសិស្សស្នាក់នៅវត្តដំបូងរបស់អ្នក។</p>
          <button
            type="button"
            onClick={() => setShowAddTypeModal(true)}
            className="hover-lift"
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#1C1917',
              fontWeight: 800,
              padding: '10px 20px',
              borderRadius: '12px',
              border: 'none',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.84rem',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
            }}
          >
            <Plus size={16} strokeWidth={3} />
            <span>+ បន្ថែមកាតថ្មីដំបូង</span>
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 170px), 1fr))', gap: '10px' }}>
          {filteredMembers.map((member) => {
            const isMonk = member.type === 'monk'
            const cardIdFormatted = `MK-${isMonk ? 'M' : 'S'}-${member.id.slice(-5).toUpperCase()}`
            const roleText = isMonk 
              ? (MONK_RANK_LABELS[member.rank as any]?.kh || 'ព្រះសង្ឃ') 
              : 'សិស្សស្នាក់នៅវត្ត'

            return (
              <div
                key={member.id}
                className="hover-lift"
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  border: isMonk ? '1.5px solid #FDE68A' : '1.5px solid #BFDBFE',
                  boxShadow: '0 4px 14px -2px rgba(15, 23, 42, 0.06)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                {/* Header Strip */}
                <div
                  style={{
                    background: isMonk 
                      ? 'linear-gradient(135deg, #1C1917 0%, #351C06 60%, #78350F 100%)' 
                      : 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)',
                    padding: '8px 10px',
                    color: '#FFFFFF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: isMonk ? '2px solid #F59E0B' : '2px solid #3B82F6'
                  }}
                >
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#FEF3C7', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>វត្តអារាម SYSTEMMK</div>
                    <div style={{ fontSize: '0.54rem', color: '#CBD5E1' }}>ID Card</div>
                  </div>
                  <span
                    style={{
                      background: isMonk ? '#FEF3C7' : '#EFF6FF',
                      color: isMonk ? '#92400E' : '#1E40AF',
                      border: isMonk ? '1px solid #F59E0B' : '1px solid #3B82F6',
                      padding: '1px 6px',
                      borderRadius: '6px',
                      fontSize: '0.58rem',
                      fontWeight: 800,
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    {isMonk ? '🙏 សង្ឃ' : '🎓 សិស្ស'}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: '10px 10px 8px 10px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
                  {/* Avatar Photo */}
                  <div
                    style={{
                      width: '62px',
                      height: '74px',
                      borderRadius: '12px',
                      border: isMonk ? '2px solid #F59E0B' : '2px solid #3B82F6',
                      background: '#F8FAFC',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      marginBottom: '8px'
                    }}
                  >
                    {member.photo_url ? (
                      <img src={member.photo_url} alt={member.khmer_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '1.4rem', fontWeight: 800, color: '#94A3B8' }}>{member.khmer_name.charAt(0)}</span>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div style={{ width: '100%', minWidth: 0 }}>
                    <h4 style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {member.khmer_name}
                    </h4>
                    {member.latin_name && (
                      <div style={{ fontSize: '0.64rem', color: '#64748B', fontWeight: 600, marginTop: '1px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {member.latin_name}
                      </div>
                    )}
                    <div style={{ marginTop: '4px' }}>
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, color: isMonk ? '#B45309' : '#2563EB', background: isMonk ? '#FFFBEB' : '#EFF6FF', padding: '1px 6px', borderRadius: '6px', border: isMonk ? '1px solid #FDE68A' : '1px solid #DBEAFE', display: 'inline-block', maxWidth: '100%', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {roleText}
                      </span>
                    </div>
                  </div>

                  {/* Metadata Details Box */}
                  <div style={{ width: '100%', background: '#F8FAFC', borderRadius: '10px', padding: '6px 8px', marginTop: '8px', border: '1px solid #E2E8F0', fontSize: '0.64rem', display: 'flex', flexDirection: 'column', gap: '3px', textAlign: 'left' }}>
                    {member.dhamma_name && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                        <span style={{ color: '#64748B' }}>ឆាយា:</span>
                        <strong style={{ color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.dhamma_name}</strong>
                      </div>
                    )}
                    {member.date_of_birth && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                        <span style={{ color: '#64748B' }}>អាយុ:</span>
                        <strong style={{ color: '#1E293B' }}>{calculateAge(member.date_of_birth)} ឆ្នាំ</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                      <span style={{ color: '#64748B' }}>ស្នាក់នៅ:</span>
                      <strong style={{ color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.room_number || 'កុដិវត្ត'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '4px' }}>
                      <span style={{ color: '#64748B' }}>ខេត្ត:</span>
                      <strong style={{ color: '#1E293B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{member.home_province || 'កម្ពុជា'}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Actions with Edit, Delete & Print Buttons */}
                <div style={{ background: '#FAFAFA', padding: '8px 10px', borderTop: '1px solid #F1F5F9', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.64rem', fontWeight: 800, fontFamily: 'monospace', color: '#64748B' }}>
                      {cardIdFormatted}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.2fr', gap: '4px' }}>
                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleEditMember(member)}
                      className="hover-lift"
                      title="កែប្រែ"
                      style={{
                        background: '#EFF6FF',
                        border: '1px solid #BFDBFE',
                        color: '#2563EB',
                        padding: '4px 2px',
                        borderRadius: '6px',
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px'
                      }}
                    >
                      <Edit3 size={11} />
                      <span>កែ</span>
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => handleDeleteMember(member)}
                      className="hover-lift"
                      title="លុប"
                      style={{
                        background: '#FEF2F2',
                        border: '1px solid #FECACA',
                        color: '#DC2626',
                        padding: '4px 2px',
                        borderRadius: '6px',
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px'
                      }}
                    >
                      <Trash2 size={11} />
                      <span>លុប</span>
                    </button>

                    {/* Print Button */}
                    <button
                      type="button"
                      onClick={() => handlePrintCard(member)}
                      className="hover-lift"
                      title="បោះពុម្ពកាត"
                      style={{
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: '#1C1917',
                        border: 'none',
                        padding: '4px 4px',
                        borderRadius: '6px',
                        fontSize: '0.64rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '2px',
                        boxShadow: '0 2px 6px rgba(217, 119, 6, 0.25)'
                      }}
                    >
                      <Printer size={11} />
                      <span>ពុម្ព</span>
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* 🌟 1. SELECT MEMBER TYPE MODAL (MONK OR STUDENT) */}
      {showAddTypeModal && (
        <div className="modal-overlay animate-fadeIn" style={{ zIndex: 99999 }} onClick={e => e.target === e.currentTarget && setShowAddTypeModal(false)}>
          <div className="modal modal-md" style={{ maxWidth: '440px', borderRadius: '24px', overflow: 'hidden', padding: 0, border: '1.5px solid #FDE68A', boxShadow: '0 25px 50px -12px rgba(217, 119, 6, 0.25)' }}>
            <div style={{ background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 100%)', padding: '18px 22px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={18} color="#F59E0B" />
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#FEF3C7', margin: 0 }}>ជ្រើសរើសប្រភេទកាតដែលត្រូវបង្កើត</h3>
              </div>
              <button onClick={() => setShowAddTypeModal(false)} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
            </div>

            <div style={{ padding: '24px', background: '#FAFAFA', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Option 1: Monk */}
              <button
                type="button"
                onClick={() => {
                  setShowAddTypeModal(false)
                  setEditingMonk(null)
                  setShowMonkModal(true)
                }}
                className="hover-lift"
                style={{
                  background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
                  border: '2px solid #F59E0B',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#1C1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                  🙏
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#92400E' }}>បង្កើតកាតសម្រាប់ «ព្រះសង្ឃ»</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#B45309' }}>Monk ID Card (ភិក្ខុ សាមណេរ ព្រះមេកុដិ...)</p>
                </div>
              </button>

              {/* Option 2: Student */}
              <button
                type="button"
                onClick={() => {
                  setShowAddTypeModal(false)
                  setEditingStudent(null)
                  setShowStudentModal(true)
                }}
                className="hover-lift"
                style={{
                  background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
                  border: '2px solid #3B82F6',
                  borderRadius: '16px',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                  🎓
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '0.96rem', fontWeight: 800, color: '#1E40AF' }}>បង្កើតកាតសម្រាប់ «សិស្សវត្ត»</h4>
                  <p style={{ margin: '2px 0 0 0', fontSize: '0.74rem', color: '#2563EB' }}>Student ID Card (សិស្សស្នាក់នៅរៀនសូត្រ)</p>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🌟 2. ADD/EDIT MONK MODAL */}
      {showMonkModal && (
        <MonkCardModal
          monkToEdit={editingMonk}
          onClose={() => {
            setShowMonkModal(false)
            setEditingMonk(null)
          }}
          onSave={handleSaveMonk}
        />
      )}

      {/* 🌟 3. ADD/EDIT STUDENT MODAL */}
      {showStudentModal && (
        <StudentCardModal
          studentToEdit={editingStudent}
          onClose={() => {
            setShowStudentModal(false)
            setEditingStudent(null)
          }}
          onSave={handleSaveStudent}
        />
      )}

    </div>
  )
}

// ----------------------------------------------------
// 🌟 SUBCOMPONENT: MONK FORM MODAL
// ----------------------------------------------------
function MonkCardModal({ monkToEdit, onClose, onSave }: { monkToEdit: Monk | null; onClose: () => void; onSave: (monk: Monk) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(monkToEdit?.photo_url || null)

  const [form, setForm] = useState({
    khmer_name: monkToEdit?.khmer_name || '',
    latin_name: monkToEdit?.latin_name || '',
    dhamma_name: monkToEdit?.dhamma_name || '',
    status: monkToEdit?.status || 'existing',
    rank: monkToEdit?.rank || 'bhikkhu',
    date_of_birth: monkToEdit?.date_of_birth || '',
    date_of_ordination: monkToEdit?.date_of_ordination || '',
    home_province: monkToEdit?.home_province || '',
    origin_temple: monkToEdit?.origin_temple || '',
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const savedMonk: Monk = {
      id: monkToEdit?.id || Date.now().toString(),
      khmer_name: form.khmer_name,
      latin_name: form.latin_name || null,
      dhamma_name: form.dhamma_name || null,
      status: form.status as any,
      rank: form.rank as any,
      date_of_birth: form.date_of_birth || null,
      date_of_ordination: form.date_of_ordination || null,
      date_of_higher_ordination: null,
      home_province: form.home_province || null,
      home_district: null,
      home_commune: null,
      home_village: null,
      origin_temple: form.origin_temple || null,
      health_status: 'good',
      health_notes: null,
      photo_url: photoPreview || monkToEdit?.photo_url || null,
      room_id: (monkToEdit as any)?.room_id || null,
      is_active: true,
      notes: null,
      created_at: monkToEdit?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    onSave(savedMonk)
  }

  return (
    <div className="modal-overlay animate-fadeIn" style={{ zIndex: 99999 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md" style={{ maxWidth: '580px', borderRadius: '24px', overflow: 'hidden', padding: 0, border: '1.5px solid #FDE68A', boxShadow: '0 25px 50px -12px rgba(217, 119, 6, 0.35)', background: '#FFFFFF' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 100%)', padding: '18px 22px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🙏</span>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#FEF3C7', margin: 0 }}>
                {monkToEdit ? 'កែប្រែកាតព្រះសង្ឃ' : 'បន្ថែមព័ត៌មានកាតព្រះសង្ឃ'}
              </h3>
              <p style={{ fontSize: '0.66rem', color: '#CBD5E1', margin: 0 }}>Monk ID Card Information</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '75vh', overflowY: 'auto' }}>
          
          {/* Photo Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: '#F8FAFC', borderRadius: '16px', border: '1.5px dashed #CBD5E1' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="hover-lift"
              style={{
                width: '68px',
                height: '78px',
                borderRadius: '12px',
                background: '#FFFFFF',
                border: '2px solid #F59E0B',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Upload size={22} color="#F59E0B" />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', padding: '5px 12px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}
              >
                📸 ជ្រើសរើសរូបថតព្រះសង្ឃ
              </button>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.68rem', color: '#64748B' }}>គាំទ្ររូបភាព JPG, PNG (រូបភាពច្បាស់សម្រាប់ដាក់លើកាត)</p>
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>

          {/* Names */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                ព្រះនាម (ភាសាខ្មែរ) <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                required
                value={form.khmer_name}
                onChange={e => setForm({ ...form, khmer_name: e.target.value })}
                placeholder="ឧ. ម៉េង ហ័រ"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                ព្រះនាមឡាតាំង (Latin Name)
              </label>
              <input
                value={form.latin_name}
                onChange={e => setForm({ ...form, latin_name: e.target.value })}
                placeholder="Ex. Meng Horl"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          {/* Dhamma Name & Rank */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                ឆាយា (Dhamma Name)
              </label>
              <input
                value={form.dhamma_name}
                onChange={e => setForm({ ...form, dhamma_name: e.target.value })}
                placeholder="ឧ. ធម្មបាលោ"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                ឋានៈ / តួនាទី <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={form.rank}
                onChange={e => setForm({ ...form, rank: e.target.value as any })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', background: '#FFFFFF' }}
              >
                {Object.entries(MONK_RANK_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v.kh}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                ថ្ងៃខែឆ្នាំកំណើត
              </label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                ថ្ងៃខែឆ្នាំបួស
              </label>
              <input
                type="date"
                value={form.date_of_ordination}
                onChange={e => setForm({ ...form, date_of_ordination: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          {/* Province & Origin Temple */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                ខេត្ត/រាជធានីកំណើត
              </label>
              <input
                value={form.home_province}
                onChange={e => setForm({ ...form, home_province: e.target.value })}
                placeholder="ឧ. កំពង់ចាម"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                វត្តដើមកំណើត
              </label>
              <input
                value={form.origin_temple}
                onChange={e => setForm({ ...form, origin_temple: e.target.value })}
                placeholder="ឧ. វត្តជោតនារាម"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}
            >
              បោះបង់
            </button>
            <button
              type="submit"
              style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#1C1917', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)' }}
            >
              ✨ រក្សាទុកកាតព្រះសង្ឃ
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}

// ----------------------------------------------------
// 🌟 SUBCOMPONENT: STUDENT FORM MODAL
// ----------------------------------------------------
function StudentCardModal({ studentToEdit, onClose, onSave }: { studentToEdit: Student | null; onClose: () => void; onSave: (student: Student) => void }) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(studentToEdit?.photo_url || null)

  const [form, setForm] = useState({
    khmer_name: studentToEdit?.khmer_name || '',
    latin_name: studentToEdit?.latin_name || '',
    gender: studentToEdit?.gender || 'male',
    date_of_birth: studentToEdit?.date_of_birth || '',
    school_name: studentToEdit?.school_name || '',
    grade_level: studentToEdit?.grade_level || '',
    home_province: studentToEdit?.home_province || '',
    phone: studentToEdit?.phone || '',
  })

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    const savedStudent: Student = {
      id: studentToEdit?.id || Date.now().toString(),
      khmer_name: form.khmer_name,
      latin_name: form.latin_name || null,
      date_of_birth: form.date_of_birth || null,
      gender: form.gender,
      school_name: form.school_name || null,
      grade_level: form.grade_level || null,
      room_id: studentToEdit?.room_id || null,
      home_province: form.home_province || null,
      phone: form.phone || null,
      parent_phone: studentToEdit?.parent_phone || null,
      photo_url: photoPreview || studentToEdit?.photo_url || null,
      is_active: true,
      joined_date: studentToEdit?.joined_date || new Date().toISOString(),
      notes: studentToEdit?.notes || null,
      created_at: studentToEdit?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    onSave(savedStudent)
  }

  return (
    <div className="modal-overlay animate-fadeIn" style={{ zIndex: 99999 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md" style={{ maxWidth: '580px', borderRadius: '24px', overflow: 'hidden', padding: 0, border: '1.5px solid #BFDBFE', boxShadow: '0 25px 50px -12px rgba(59, 130, 246, 0.35)', background: '#FFFFFF' }}>
        
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 100%)', padding: '18px 22px', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.2rem' }}>🎓</span>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#DBEAFE', margin: 0 }}>
                {studentToEdit ? 'កែប្រែកាតសិស្សវត្ត' : 'បន្ថែមព័ត៌មានកាតសិស្សវត្ត'}
              </h3>
              <p style={{ fontSize: '0.66rem', color: '#93C5FD', margin: 0 }}>Student ID Card Information</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#FFFFFF', cursor: 'pointer', fontSize: '1.1rem' }}>✕</button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', maxHeight: '75vh', overflowY: 'auto' }}>
          
          {/* Photo Upload */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px', background: '#F8FAFC', borderRadius: '16px', border: '1.5px dashed #CBD5E1' }}>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="hover-lift"
              style={{
                width: '68px',
                height: '78px',
                borderRadius: '12px',
                background: '#FFFFFF',
                border: '2px solid #3B82F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {photoPreview ? (
                <img src={photoPreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Upload size={22} color="#3B82F6" />
              )}
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '5px 12px', borderRadius: '8px', fontSize: '0.76rem', fontWeight: 800, cursor: 'pointer' }}
              >
                📸 ជ្រើសរើសរូបថតសិស្ស
              </button>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.68rem', color: '#64748B' }}>គាំទ្ររូបភាព JPG, PNG (រូបភាពច្បាស់សម្រាប់ដាក់លើកាត)</p>
            </div>
            <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handlePhotoUpload} />
          </div>

          {/* Names */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                ឈ្មោះខ្មែរ <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                required
                value={form.khmer_name}
                onChange={e => setForm({ ...form, khmer_name: e.target.value })}
                placeholder="ឧ. ជា វណ្ណា"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                ឈ្មោះឡាតាំង (Latin Name)
              </label>
              <input
                value={form.latin_name}
                onChange={e => setForm({ ...form, latin_name: e.target.value })}
                placeholder="Ex. Chea Vanna"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          {/* Gender & Date of birth */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                ភេទ <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <select
                value={form.gender}
                onChange={e => setForm({ ...form, gender: e.target.value })}
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem', background: '#FFFFFF' }}
              >
                <option value="male">ប្រុស (Male)</option>
                <option value="female">ស្រី (Female)</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                ថ្ងៃខែឆ្នាំកំណើត
              </label>
              <input
                type="date"
                value={form.date_of_birth}
                onChange={e => setForm({ ...form, date_of_birth: e.target.value })}
                style={{ width: '100%', padding: '8px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          {/* School & Grade */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                សាលារៀន
              </label>
              <input
                value={form.school_name}
                onChange={e => setForm({ ...form, school_name: e.target.value })}
                placeholder="ឧ. សាកលវិទ្យាល័យភូមិន្ទភ្នំពេញ"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                កម្រិតថ្នាក់ / ជំនាញ
              </label>
              <input
                value={form.grade_level}
                onChange={e => setForm({ ...form, grade_level: e.target.value })}
                placeholder="ឧ. ឆ្នាំទី ២"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          {/* Province & Phone */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                ខេត្ត/ស្រុកកំណើត
              </label>
              <input
                value={form.home_province}
                onChange={e => setForm({ ...form, home_province: e.target.value })}
                placeholder="ឧ. កំពង់ចាម"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 800, color: '#1E293B', marginBottom: '4px' }}>
                លេខទូរស័ព្ទ
              </label>
              <input
                value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder="ឧ. ០១២ ៣៤៥ ៦៧៨"
                style={{ width: '100%', padding: '9px 12px', borderRadius: '10px', border: '1.5px solid #CBD5E1', fontSize: '0.84rem' }}
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{ flex: 1, padding: '10px', borderRadius: '12px', border: '1px solid #CBD5E1', background: '#F8FAFC', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer' }}
            >
              បោះបង់
            </button>
            <button
              type="submit"
              style={{ flex: 1, padding: '10px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)', color: '#FFFFFF', fontWeight: 800, fontSize: '0.84rem', cursor: 'pointer', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.35)' }}
            >
              ✨ រក្សាទុកកាតសិស្ស
            </button>
          </div>

        </form>
      </div>
    </div>
  )
}
