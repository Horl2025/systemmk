'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Monk, Student } from '@/lib/database.types'
import { MONK_RANK_LABELS, formatDate, calculateVassa, calculateAge } from '@/lib/utils'
import { 
  Contact, Search, Printer, ChevronRight
} from 'lucide-react'
import { fetchCloudCollection, subscribeToRealtimeSync } from '@/lib/cloudSync'

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
            justifyContent: center;
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

            <div class="seal-section">
              <div style="text-align: center; width: 45%;">
                <div style="font-size: 9px; color: #64748B;">ម្ចាស់កាត</div>
                <div style="height: 35px;"></div>
                <div style="font-size: 10px; font-weight: 700; border-top: 1px dotted #94A3B8; padding-top: 2px;">${member.khmer_name}</div>
              </div>
              <div style="text-align: center; width: 45%;">
                <div style="font-size: 9px; color: #64748B;">ព្រះចៅអធិការ / ព្រះមេកុដិ</div>
                <div style="height: 35px; display: flex; align-items: center; justify-content: center; color: #DC2626; font-size: 10px; font-weight: 800;">
                  [ សម្គាល់ត្រាវត្ត ]
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

        {/* Print All Button */}
        <div className="page-actions" style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handlePrintAll}
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
              gap: '8px',
              fontSize: '0.84rem',
              boxShadow: '0 4px 14px rgba(217, 119, 6, 0.35)'
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
          <p style={{ fontSize: '0.8rem', marginTop: '4px' }}>សូមបញ្ចូលទិន្នន័យព្រះសង្ឃ ឬសិស្សស្នាក់នៅវត្តជាមុនសិន។</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
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
                  borderRadius: '20px',
                  border: isMonk ? '1.5px solid #FDE68A' : '1.5px solid #BFDBFE',
                  boxShadow: '0 8px 24px -4px rgba(15, 23, 42, 0.06)',
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
                    padding: '12px 16px',
                    color: '#FFFFFF',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: isMonk ? '2px solid #F59E0B' : '2px solid #3B82F6'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#FEF3C7' }}>វត្តអារាម SYSTEMMK</div>
                    <div style={{ fontSize: '0.62rem', color: '#CBD5E1' }}>Monastery ID Card</div>
                  </div>
                  <span
                    style={{
                      background: isMonk ? '#FEF3C7' : '#EFF6FF',
                      color: isMonk ? '#92400E' : '#1E40AF',
                      border: isMonk ? '1px solid #F59E0B' : '1px solid #3B82F6',
                      padding: '2px 8px',
                      borderRadius: '8px',
                      fontSize: '0.68rem',
                      fontWeight: 800
                    }}
                  >
                    {isMonk ? '🙏 ព្រះសង្ឃ' : '🎓 សិស្សវត្ត'}
                  </span>
                </div>

                {/* Card Body */}
                <div style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
                    {/* Avatar Photo */}
                    <div
                      style={{
                        width: '70px',
                        height: '84px',
                        borderRadius: '12px',
                        border: isMonk ? '2px solid #F59E0B' : '2px solid #3B82F6',
                        background: '#F8FAFC',
                        overflow: 'hidden',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)'
                      }}
                    >
                      {member.photo_url ? (
                        <img src={member.photo_url} alt={member.khmer_name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#94A3B8' }}>{member.khmer_name.charAt(0)}</span>
                      )}
                    </div>

                    {/* Basic Info */}
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: 0, lineHeight: 1.3 }}>
                        {member.khmer_name}
                      </h4>
                      {member.latin_name && (
                        <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 600, marginTop: '2px' }}>
                          {member.latin_name}
                        </div>
                      )}
                      <div style={{ marginTop: '6px' }}>
                        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: isMonk ? '#B45309' : '#2563EB', background: isMonk ? '#FFFBEB' : '#EFF6FF', padding: '2px 6px', borderRadius: '6px', border: isMonk ? '1px solid #FDE68A' : '1px solid #DBEAFE' }}>
                          {roleText}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Metadata Details Box */}
                  <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '10px', marginTop: '14px', border: '1px solid #E2E8F0', fontSize: '0.74rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {member.dhamma_name && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>ឆាយា:</span>
                        <strong style={{ color: '#1E293B' }}>{member.dhamma_name}</strong>
                      </div>
                    )}
                    {member.date_of_birth && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#64748B' }}>អាយុ:</span>
                        <strong style={{ color: '#1E293B' }}>{calculateAge(member.date_of_birth)} ឆ្នាំ ({formatDate(member.date_of_birth)})</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>ទីកន្លែងស្នាក់:</span>
                      <strong style={{ color: '#1E293B' }}>{member.room_number || 'កុដិវត្ត'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>ស្រុកកំណើត:</span>
                      <strong style={{ color: '#1E293B' }}>{member.home_province || 'កម្ពុជា'}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div style={{ background: '#FAFAFA', padding: '10px 16px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 800, fontFamily: 'monospace', color: '#64748B' }}>
                    {cardIdFormatted}
                  </span>

                  <div style={{ display: 'flex', gap: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handlePrintCard(member)}
                      className="hover-lift"
                      style={{
                        background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                        color: '#1C1917',
                        border: 'none',
                        padding: '5px 12px',
                        borderRadius: '8px',
                        fontSize: '0.72rem',
                        fontWeight: 800,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        boxShadow: '0 2px 6px rgba(217, 119, 6, 0.3)'
                      }}
                    >
                      <Printer size={13} />
                      <span>បោះពុម្ពកាត</span>
                    </button>
                  </div>
                </div>

              </div>
            )
          })}
        </div>
      )}

    </div>
  )
}
