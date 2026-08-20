'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Room, Kuthi } from '@/lib/database.types'
import { ROOM_STATUS_LABELS } from '@/lib/utils'
import { Plus, Edit, Trash2, Building2, ChevronDown, ChevronRight, Home, DoorOpen, CheckCircle, AlertCircle, Users, ArrowLeft, Eye, UserPlus, Sparkles, UserCheck, Bed, Shield } from 'lucide-react'

interface KuthiWithRooms extends Kuthi {
  rooms: (Room & { monks?: any[] })[]
}

const INITIAL_DEMO_KUTHI: KuthiWithRooms[] = [
  {
    id: 'k1',
    name: 'កុដិសន្តិភាព (កុដិលេខ ១)',
    name_en: 'Peace Kuthi (Building 1)',
    description: 'កុដិស្នាក់នៅរបស់ព្រះថេរៈ និងភិក្ខុសង្ឃ',
    floor_count: 2,
    built_year: 2018,
    is_active: true,
    created_at: '',
    updated_at: '',
    rooms: [
      { id: 'r1', kuthi_id: 'k1', room_number: '១០១', room_name: 'បន្ទប់សមាធិ', room_type: 'bhikkhu', floor: 1, capacity: 2, status: 'occupied', notes: '', is_active: true, created_at: '', updated_at: '', monks: [{ id: 'm1', khmer_name: 'ព្រះមហា សុខ វិបុល', rank: 'bhikkhu', vassa: 5, dhamma_name: 'ញាណវង្សោ' }] } as any,
      { id: 'r2', kuthi_id: 'k1', room_number: '១០២', room_name: null, room_type: 'bhikkhu', floor: 1, capacity: 2, status: 'available', notes: '', is_active: true, created_at: '', updated_at: '', monks: [] } as any,
      { id: 'r3', kuthi_id: 'k1', room_number: '២០១', room_name: null, room_type: 'bhikkhu', floor: 2, capacity: 2, status: 'available', notes: '', is_active: true, created_at: '', updated_at: '', monks: [] } as any,
      { id: 'r4', kuthi_id: 'k1', room_number: '២០២', room_name: null, room_type: 'bhikkhu', floor: 2, capacity: 2, status: 'maintenance', notes: '', is_active: true, created_at: '', updated_at: '', monks: [] } as any,
    ]
  },
  {
    id: 'k2',
    name: 'កុដិមេត្តា (កុដិលេខ ២)',
    name_en: 'Metta Kuthi (Building 2)',
    description: 'កុដិសម្រាប់សាមណេរ និងសិស្សនិស្សិត',
    floor_count: 1,
    built_year: 2021,
    is_active: true,
    created_at: '',
    updated_at: '',
    rooms: [
      { id: 'r5', kuthi_id: 'k2', room_number: 'A-01', room_name: null, room_type: 'samanera', floor: 1, capacity: 4, status: 'occupied', notes: '', is_active: true, created_at: '', updated_at: '', monks: [{ id: 'm2', khmer_name: 'សាមណេរ ចាន់ រ៉ា', rank: 'samanera', vassa: 2, dhamma_name: 'បញ្ញាវុឌ្ឍោ' }] } as any,
      { id: 'r6', kuthi_id: 'k2', room_number: 'A-02', room_name: null, room_type: 'samanera', floor: 1, capacity: 4, status: 'available', notes: '', is_active: true, created_at: '', updated_at: '', monks: [] } as any,
      { id: 'r7', kuthi_id: 'k2', room_number: 'A-03', room_name: 'បន្ទប់ភ្ញៀវ', room_type: 'guest', floor: 1, capacity: 2, status: 'available', notes: '', is_active: true, created_at: '', updated_at: '', monks: [] } as any,
    ]
  }
]

export default function RoomsPage() {
  const router = useRouter()
  const [kuthi, setKuthi] = useState<KuthiWithRooms[]>(INITIAL_DEMO_KUTHI)
  const [loading, setLoading] = useState(false)
  const [expandedKuthi, setExpandedKuthi] = useState<Set<string>>(new Set(['k1', 'k2']))
  const [showKuthiModal, setShowKuthiModal] = useState(false)
  const [editingKuthi, setEditingKuthi] = useState<KuthiWithRooms | null>(null)
  const [showRoomModal, setShowRoomModal] = useState<string | null>(null)
  const [editingRoom, setEditingRoom] = useState<{ kuthiId: string; room: any } | null>(null)
  const [selectedViewRoom, setSelectedViewRoom] = useState<{ kuthiName: string; kuthiId: string; room: any } | null>(null)
  const [deleteConfirmItem, setDeleteConfirmItem] = useState<{ type: 'kuthi' | 'room'; id: string; name: string; kuthiId?: string } | null>(null)

  const confirmDelete = () => {
    if (!deleteConfirmItem) return
    if (deleteConfirmItem.type === 'kuthi') {
      setKuthi(prev => prev.filter(k => k.id !== deleteConfirmItem.id))
    } else if (deleteConfirmItem.type === 'room' && deleteConfirmItem.kuthiId) {
      setKuthi(prev => prev.map(k => {
        if (k.id === deleteConfirmItem.kuthiId) {
          return { ...k, rooms: k.rooms.filter(r => r.id !== deleteConfirmItem.id) }
        }
        return k
      }))
    }
    setDeleteConfirmItem(null)
  }

  useEffect(() => {
    async function loadData() {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-systemmk.supabase.co') {
        try {
          const { data: kuthiData } = await supabase.from('kuthi').select('*').eq('is_active', true).order('name')
          const { data: roomData } = await supabase.from('rooms').select('*, monks(id, khmer_name)').eq('is_active', true).order('room_number')

          const kList = ((kuthiData as unknown) as Kuthi[]) || []
          const rList = ((roomData as unknown) as (Room & { monks: { id: string; khmer_name: string }[] })[]) || []

          if (kList.length > 0) {
            const result = kList.map(k => ({
              ...k,
              rooms: rList.filter(r => r.kuthi_id === k.id)
            }))
            setKuthi(result as KuthiWithRooms[])
            setExpandedKuthi(new Set(kList.map(k => k.id)))
          }
        } catch {
          // fallback to initial
        }
      }
    }
    loadData()
  }, [])

  const toggleKuthi = (id: string) => {
    setExpandedKuthi(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const allRooms = kuthi.flatMap(k => k.rooms)
  const availableRooms = allRooms.filter(r => r.status === 'available').length
  const occupiedRooms = allRooms.filter(r => r.status === 'occupied').length
  const maintenanceRooms = allRooms.filter(r => r.status === 'maintenance').length

  const getRoomStyle = (status: string) => {
    if (status === 'available') {
      return {
        bg: 'linear-gradient(145deg, #ECFDF5 0%, #D1FAE5 100%)',
        border: '1.5px solid #6EE7B7',
        badgeBg: '#059669',
        badgeText: '#FFFFFF',
        numberColor: '#065F46',
        label: 'ទំនេរ / Available'
      }
    }
    if (status === 'occupied') {
      return {
        bg: 'linear-gradient(145deg, #FEF2F2 0%, #FEE2E2 100%)',
        border: '1.5px solid #FCA5A5',
        badgeBg: '#DC2626',
        badgeText: '#FFFFFF',
        numberColor: '#991B1B',
        label: 'ពេញ / Occupied'
      }
    }
    return {
      bg: 'linear-gradient(145deg, #FFFBEB 0%, #FEF3C7 100%)',
      border: '1.5px solid #FCD34D',
      badgeBg: '#D97706',
      badgeText: '#FFFFFF',
      numberColor: '#92400E',
      label: 'កំពុងជួសជុល'
    }
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
            <h1 className="page-title" style={{ fontSize: '1.4rem', margin: 0 }}>គ្រប់គ្រងទីកន្លែង & កុដិ (Rooms & Kuthi)</h1>
            <p className="page-subtitle" style={{ margin: '2px 0 0' }}>គ្រប់គ្រងអគារកុដិ បន្ទប់ស្នាក់នៅ និងស្ថានភាពស្នាក់នៅរបស់ព្រះសង្ឃ</p>
          </div>
        </div>
        <div className="page-header-actions" style={{ marginTop: '8px' }}>
          <button 
            className="hover-lift" 
            onClick={() => setShowKuthiModal(true)}
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#1C1917',
              fontWeight: 800,
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(217, 119, 6, 0.35)',
              fontSize: '0.82rem'
            }}
          >
            <Plus size={18} />
            <span>បន្ថែមរចនាសម្ព័ន្ធកុដិ / Add Kuthi</span>
          </button>
        </div>
      </div>

      {/* 🌟 4 VIVID RICH GRADIENT KPI CARDS - 2 COLUMNS ON MOBILE */}
      <div className="mobile-2-col-grid" style={{ gap: '10px' }}>
        
        {/* Card 1: Total Kuthi (Amber Gradient) */}
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
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FDE68A', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>កុដិសរុប / TOTAL KUTHI</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                {kuthi.length} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FEF3C7' }}>អគារ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Building2 size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#FCD34D', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            រចនាសម្ព័ន្ធក្នុងវត្ត
          </div>
        </div>

        {/* Card 2: Total Rooms (Royal Blue Gradient) */}
        <div 
          className="hover-lift"
          style={{
            background: 'linear-gradient(135deg, #2563EB 0%, #1D4ED8 50%, #1E3A8A 100%)',
            borderRadius: '18px',
            padding: '12px 14px',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px -5px rgba(37, 99, 235, 0.4)',
            border: '1px solid rgba(191, 219, 254, 0.3)',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#BFDBFE', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>បន្ទប់សរុប / TOTAL ROOMS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                {allRooms.length} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#DBEAFE' }}>បន្ទប់</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <DoorOpen size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#93C5FD', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            គ្រប់គ្រងសរុប
          </div>
        </div>

        {/* Card 3: Available Rooms (Emerald Gradient) */}
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
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>បន្ទប់ទំនេរ / AVAILABLE</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                {availableRooms} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1FAE5' }}>បន្ទប់</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#6EE7B7', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            អាចទទួលព្រះសង្ឃស្នាក់នៅ
          </div>
        </div>

        {/* Card 4: Occupied Rooms (Crimson Red Gradient) */}
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
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FECACA', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>បន្ទប់ពេញ / OCCUPIED</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                {occupiedRooms} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FEE2E2' }}>បន្ទប់</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#FCA5A5', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            មានព្រះសង្ឃស្នាក់នៅរួច
          </div>
        </div>

      </div>

      {/* 🌟 Kuthi & Room Visual Grid */}
      <div className="space-y-5">
        {kuthi.map(k => (
          <div key={k.id} style={{ background: '#FFFFFF', borderRadius: '24px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            
            {/* Kuthi Header Strip */}
            <div
              style={{ 
                cursor: 'pointer', 
                padding: '20px 24px', 
                background: '#F8FAFC',
                borderBottom: expandedKuthi.has(k.id) ? '1.5px solid #E2E8F0' : 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
              onClick={() => toggleKuthi(k.id)}
            >
              <div className="flex items-center gap-3">
                {expandedKuthi.has(k.id) ? <ChevronDown size={22} color="#D97706" /> : <ChevronRight size={22} color="#64748B" />}
                <div style={{ width: '42px', height: '42px', borderRadius: '14px', background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)', color: '#B45309', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(217,119,6,0.15)' }}>
                  <Building2 size={22} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0F172A' }}>{k.name}</div>
                  {k.name_en && <div style={{ fontSize: '0.75rem', color: '#64748B', fontFamily: 'Plus Jakarta Sans' }}>{k.name_en}</div>}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ background: '#F1F5F9', color: '#475569', padding: '5px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    {k.rooms.length} បន្ទប់
                  </span>
                  <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '5px 10px', borderRadius: '8px', fontSize: '0.74rem', fontWeight: 800, whiteSpace: 'nowrap' }}>
                    {k.rooms.filter(r => r.status === 'available').length} ទំនេរ
                  </span>
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    type="button"
                    className="hover-lift"
                    style={{
                      background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
                      color: '#1C1917',
                      fontWeight: 800,
                      padding: '5px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                      cursor: 'pointer',
                      fontSize: '0.74rem',
                      boxShadow: '0 3px 8px rgba(217,119,6,0.2)',
                      whiteSpace: 'nowrap'
                    }}
                    onClick={e => { e.stopPropagation(); setEditingRoom(null); setShowRoomModal(k.id) }}
                  >
                    <Plus size={13} />
                    <span>+ បន្ទប់</span>
                  </button>

                  <button
                    type="button"
                    className="hover-lift"
                    title="កែប្រែកុដិ / Edit Kuthi"
                    onClick={e => { e.stopPropagation(); setEditingKuthi(k); setShowKuthiModal(true) }}
                    style={{
                      background: '#EFF6FF',
                      border: '1px solid #BFDBFE',
                      color: '#2563EB',
                      padding: '5px 9px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Edit size={12} />
                    <span>កែប្រែ</span>
                  </button>

                  <button
                    type="button"
                    className="hover-lift"
                    title="លុបកុដិ / Delete Kuthi"
                    onClick={e => { e.stopPropagation(); setDeleteConfirmItem({ type: 'kuthi', id: k.id, name: k.name }) }}
                    style={{
                      background: '#FEF2F2',
                      border: '1px solid #FECACA',
                      color: '#DC2626',
                      padding: '5px 9px',
                      borderRadius: '8px',
                      fontSize: '0.74rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '3px',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    <Trash2 size={12} />
                    <span>លុប</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Room Grid Cells - Strict 2 Columns on Mobile */}
            {expandedKuthi.has(k.id) && (
              <div style={{ padding: '16px' }}>
                {k.rooms.length === 0 ? (
                  <div className="text-center py-8 text-muted">មិនទាន់មានបន្ទប់នៅឡើយទេ</div>
                ) : (
                  <div className="mobile-2-col-grid" style={{ gap: '12px' }}>
                    {k.rooms.map(room => {
                      const style = getRoomStyle(room.status)
                      return (
                        <div
                          key={room.id}
                          className="hover-lift"
                          onClick={() => setSelectedViewRoom({ kuthiName: k.name, kuthiId: k.id, room })}
                          style={{
                            background: style.bg,
                            border: style.border,
                            borderRadius: '18px',
                            padding: '14px 10px',
                            textAlign: 'center',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.03)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            minHeight: '140px',
                            position: 'relative',
                            cursor: 'pointer'
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '1.3rem', fontWeight: 900, color: style.numberColor }} className="font-latin">
                              {room.room_number}
                            </div>
                            {room.room_name && (
                              <div style={{ fontSize: '0.72rem', marginTop: '2px', fontWeight: 700, color: '#475569' }}>
                                {room.room_name}
                              </div>
                            )}
                            <div style={{ fontSize: '0.7rem', marginTop: '3px', fontWeight: 600, color: '#64748B' }}>
                              {room.monks && room.monks.length > 0
                                ? `${room.monks.length}/${room.capacity} អង្គ`
                                : `ចំណុះ ${room.capacity} អង្គ`
                              }
                            </div>
                          </div>

                          <span 
                            style={{ 
                              background: style.badgeBg, 
                              color: style.badgeText, 
                              padding: '2px 8px', 
                              borderRadius: '7px', 
                              fontSize: '0.66rem', 
                              fontWeight: 800,
                              marginTop: '6px',
                              boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                            }}
                          >
                            {ROOM_STATUS_LABELS[room.status]?.kh || room.status}
                          </span>

                          {/* 🌟 Room Action Buttons: View, Edit & Delete */}
                          <div style={{ display: 'flex', gap: '4px', marginTop: '8px', borderTop: '1px solid rgba(0,0,0,0.06)', paddingTop: '6px', width: '100%', justifyContent: 'center' }} onClick={e => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={() => setSelectedViewRoom({ kuthiName: k.name, kuthiId: k.id, room })}
                              className="hover-lift"
                              title="ចូលមើលបន្ទប់"
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                color: '#0F172A',
                                padding: '3px 7px',
                                borderRadius: '6px',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <Eye size={11} color="#D97706" />
                              <span>មើល</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingRoom({ kuthiId: k.id, room })
                                setShowRoomModal(k.id)
                              }}
                              className="hover-lift"
                              title="កែប្រែបន្ទប់"
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #CBD5E1',
                                color: '#2563EB',
                                padding: '3px 7px',
                                borderRadius: '6px',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <Edit size={11} />
                              <span>កែ</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setDeleteConfirmItem({ type: 'room', id: room.id, name: `បន្ទប់លេខ ${room.room_number}`, kuthiId: k.id })}
                              className="hover-lift"
                              title="លុបបន្ទប់"
                              style={{
                                background: '#FFFFFF',
                                border: '1px solid #FECACA',
                                color: '#DC2626',
                                padding: '3px 7px',
                                borderRadius: '6px',
                                fontSize: '0.65rem',
                                fontWeight: 800,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '2px'
                              }}
                            >
                              <Trash2 size={11} />
                              <span>លុប</span>
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* 🔴 Custom Confirmation Delete Modal (No / Yes OK) */}
      {deleteConfirmItem && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setDeleteConfirmItem(null)}>
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
              <AlertCircle size={32} />
            </div>

            {/* Confirmation Question */}
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.4, margin: '0 0 8px 0' }}>
              តើគុណម្ចាស់/លោកអ្នក ចង់លុបពិតមែនទេ?
            </h3>
            
            <p style={{ fontSize: '0.84rem', color: '#64748B', lineHeight: 1.5, margin: '0 0 20px 0' }}>
              ទិន្នន័យ <strong>«{deleteConfirmItem.name}»</strong> នឹងត្រូវបានលុបចេញពីប្រព័ន្ធវត្តអារាម។
            </p>

            {/* Action Buttons: No & Yes OK */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button
                type="button"
                className="hover-lift"
                onClick={() => setDeleteConfirmItem(null)}
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
                onClick={confirmDelete}
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

      {/* 🌟 Room Details Modal (ចូលមើលព័ត៌មានលម្អិតក្នុងបន្ទប់) */}
      {selectedViewRoom && (
        <RoomDetailsModal
          kuthiName={selectedViewRoom.kuthiName}
          kuthiId={selectedViewRoom.kuthiId}
          room={selectedViewRoom.room}
          onClose={() => setSelectedViewRoom(null)}
          onEdit={() => {
            setEditingRoom({ kuthiId: selectedViewRoom.kuthiId, room: selectedViewRoom.room })
            setShowRoomModal(selectedViewRoom.kuthiId)
            setSelectedViewRoom(null)
          }}
          onAssignMonk={(monkName) => {
            const updatedRoom = {
              ...selectedViewRoom.room,
              status: 'occupied',
              monks: [...(selectedViewRoom.room.monks || []), { id: Date.now().toString(), khmer_name: monkName, rank: 'bhikkhu', vassa: 1 }]
            }
            setKuthi(prev => prev.map(k => {
              if (k.id === selectedViewRoom.kuthiId) {
                return {
                  ...k,
                  rooms: k.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
                }
              }
              return k
            }))
            setSelectedViewRoom(prev => prev ? { ...prev, room: updatedRoom } : null)
          }}
          onRemoveMonk={(monkId) => {
            const remainingMonks = (selectedViewRoom.room.monks || []).filter((m: any) => m.id !== monkId)
            const updatedRoom = {
              ...selectedViewRoom.room,
              status: remainingMonks.length === 0 ? 'available' : selectedViewRoom.room.status,
              monks: remainingMonks
            }
            setKuthi(prev => prev.map(k => {
              if (k.id === selectedViewRoom.kuthiId) {
                return {
                  ...k,
                  rooms: k.rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r)
                }
              }
              return k
            }))
            setSelectedViewRoom(prev => prev ? { ...prev, room: updatedRoom } : null)
          }}
        />
      )}

      {showKuthiModal && (
        <KuthiModal 
          initialData={editingKuthi}
          onClose={() => { setShowKuthiModal(false); setEditingKuthi(null) }} 
          onSave={(savedKuthi) => {
            setKuthi(prev => {
              if (editingKuthi) {
                return prev.map(k => k.id === savedKuthi.id ? { ...k, ...savedKuthi, rooms: k.rooms } : k)
              }
              return [...prev, savedKuthi]
            })
          }} 
        />
      )}
      {showRoomModal && (
        <RoomModal 
          kuthiId={showRoomModal} 
          initialData={editingRoom?.room}
          onClose={() => { setShowRoomModal(null); setEditingRoom(null) }} 
          onSave={(savedRoom) => {
            setKuthi(prev => prev.map(k => {
              if (k.id === showRoomModal) {
                if (editingRoom) {
                  return { ...k, rooms: k.rooms.map(r => r.id === savedRoom.id ? { ...r, ...savedRoom } : r) }
                }
                return { ...k, rooms: [...k.rooms, savedRoom] }
              }
              return k
            }))
          }}
        />
      )}
    </div>
  )
}

function KuthiModal({ initialData, onClose, onSave }: { initialData?: KuthiWithRooms | null; onClose: () => void; onSave: (kuthi: KuthiWithRooms) => void }) {
  const [form, setForm] = useState({
    name: initialData?.name || '',
    name_en: initialData?.name_en || '',
    description: initialData?.description || '',
    floor_count: initialData?.floor_count || 1,
    built_year: initialData?.built_year ? String(initialData.built_year) : ''
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const savedK: KuthiWithRooms = {
      id: initialData?.id || Date.now().toString(),
      name: form.name,
      name_en: form.name_en || null,
      description: form.description || null,
      floor_count: Number(form.floor_count),
      built_year: form.built_year ? Number(form.built_year) : null,
      is_active: true,
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      rooms: initialData?.rooms || []
    }
    onSave(savedK)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div 
        className="modal modal-md animate-scaleUp"
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          maxWidth: '520px',
          width: '100%',
          margin: '0 auto',
          background: '#FFFFFF'
        }}
      >
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 100%)', 
            padding: '18px 22px', 
            color: '#FFFFFF',
            borderBottom: '2px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FEF3C7', margin: 0 }}>
            {initialData ? 'កែប្រែរចនាសម្ព័ន្ធកុដិ / Edit Kuthi' : 'បន្ថែមរចនាសម្ព័ន្ធកុដិ / Add Kuthi'}
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              width: '30px', 
              height: '30px', 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: '#FFFFFF', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-2" style={{ padding: '16px 20px', background: '#F8FAFC', maxHeight: '50vh', overflowY: 'auto' }}>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700 }}>ឈ្មោះកុដិ (ខ្មែរ) <span className="required">*</span></label>
              <input className="form-control" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required placeholder="ឧ. កុដិសន្តិភាព" style={{ padding: '8px 12px' }} />
            </div>
            <div className="form-group" style={{ marginBottom: '10px' }}>
              <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700 }}>ឈ្មោះជាភាសាអង់គ្លេស</label>
              <input className="form-control" value={form.name_en} onChange={e => setForm({...form, name_en: e.target.value})} placeholder="Ex. Peace Kuthi" style={{ padding: '8px 12px' }} />
            </div>
            <div className="grid-cols-2 gap-2" style={{ display: 'grid', marginBottom: '10px' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700 }}>ចំនួនជាន់</label>
                <input className="form-control" type="number" min="1" value={form.floor_count} onChange={e => setForm({...form, floor_count: Number(e.target.value)})} style={{ padding: '8px 12px' }} />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700 }}>ឆ្នាំសាងសង់</label>
                <input className="form-control" type="number" value={form.built_year} onChange={e => setForm({...form, built_year: e.target.value})} placeholder="2024" style={{ padding: '8px 12px' }} />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.74rem', fontWeight: 700 }}>ការពិពណ៌នា</label>
              <textarea className="form-control" value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2} style={{ padding: '8px 12px' }} />
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '12px 20px', background: '#FFFFFF', borderTop: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '7px 16px', borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem' }}>បោះបង់</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '7px 18px', borderRadius: '10px', fontWeight: 800, fontSize: '0.8rem' }}>រក្សាទុក / Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RoomModal({ kuthiId, initialData, onClose, onSave }: { kuthiId: string; initialData?: any; onClose: () => void; onSave: (room: any) => void }) {
  const [form, setForm] = useState({
    room_number: initialData?.room_number || '',
    room_name: initialData?.room_name || '',
    room_type: initialData?.room_type || 'bhikkhu',
    floor: initialData?.floor || 1,
    capacity: initialData?.capacity || 2,
    status: initialData?.status || 'available'
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const savedR = {
      id: initialData?.id || Date.now().toString(),
      kuthi_id: kuthiId,
      room_number: form.room_number,
      room_name: form.room_name || null,
      room_type: form.room_type,
      floor: Number(form.floor),
      capacity: Number(form.capacity),
      status: form.status,
      notes: initialData?.notes || null,
      is_active: true,
      created_at: initialData?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString(),
      monks: initialData?.monks || []
    }
    onSave(savedR)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div 
        className="modal modal-md animate-scaleUp"
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          maxWidth: '520px',
          width: '100%',
          margin: '0 auto',
          background: '#FFFFFF'
        }}
      >
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 100%)', 
            padding: '18px 22px', 
            color: '#FFFFFF',
            borderBottom: '2px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FEF3C7', margin: 0 }}>
            {initialData ? 'កែប្រែបន្ទប់ / Edit Room' : 'បន្ថែមបន្ទប់ក្នុងកុដិ / Add Room'}
          </h3>
          <button 
            onClick={onClose}
            style={{ 
              width: '30px', 
              height: '30px', 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: '#FFFFFF', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-3" style={{ padding: '20px', background: '#F8FAFC', maxHeight: '60vh', overflowY: 'auto' }}>
            <div className="grid-cols-2 gap-3" style={{ display: 'grid' }}>
              <div className="form-group">
                <label className="form-label">លេខបន្ទប់ <span className="required">*</span></label>
                <input className="form-control" value={form.room_number} onChange={e => setForm({...form, room_number: e.target.value})} required placeholder="ឧ. ១០១" />
              </div>
              <div className="form-group">
                <label className="form-label">ឈ្មោះបន្ទប់ (បើមាន)</label>
                <input className="form-control" value={form.room_name} onChange={e => setForm({...form, room_name: e.target.value})} placeholder="ឧ. បន្ទប់សមាធិ" />
              </div>
            </div>
            <div className="grid-cols-2 gap-3" style={{ display: 'grid' }}>
              <div className="form-group">
                <label className="form-label">ប្រភេទបន្ទប់</label>
                <select className="form-control" value={form.room_type} onChange={e => setForm({...form, room_type: e.target.value})}>
                  <option value="bhikkhu">បន្ទប់ភិក្ខុ / Bhikkhu</option>
                  <option value="samanera">បន្ទប់សាមណេរ / Samanera</option>
                  <option value="guest">បន្ទប់ភ្ញៀវ / Guest</option>
                  <option value="storage">បន្ទប់ឃ្លាំង / Storage</option>
                  <option value="office">ការិយាល័យ / Office</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ស្ថានភាពបន្ទប់</label>
                <select className="form-control" value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
                  <option value="available">ទំនេរ / Available</option>
                  <option value="occupied">ពេញ / Occupied</option>
                  <option value="maintenance">កំពុងជួសជុល / Maintenance</option>
                </select>
              </div>
            </div>
            <div className="grid-cols-2 gap-3" style={{ display: 'grid' }}>
              <div className="form-group">
                <label className="form-label">ជាន់ទី</label>
                <input className="form-control" type="number" min="1" value={form.floor} onChange={e => setForm({...form, floor: Number(e.target.value)})} />
              </div>
              <div className="form-group">
                <label className="form-label">ចំណុះ (ចំនួនអង្គ)</label>
                <input className="form-control" type="number" min="1" value={form.capacity} onChange={e => setForm({...form, capacity: Number(e.target.value)})} />
              </div>
            </div>
          </div>
          <div className="modal-footer" style={{ padding: '14px 20px', background: '#FFFFFF', borderTop: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 18px', borderRadius: '10px', fontWeight: 800 }}>បោះបង់</button>
            <button type="submit" className="btn btn-primary" style={{ padding: '8px 20px', borderRadius: '10px', fontWeight: 800 }}>រក្សាទុក / Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function RoomDetailsModal({ 
  kuthiName, 
  kuthiId, 
  room, 
  onClose, 
  onEdit, 
  onAssignMonk, 
  onRemoveMonk 
}: { 
  kuthiName: string
  kuthiId: string
  room: any
  onClose: () => void
  onEdit: () => void
  onAssignMonk: (monkName: string) => void
  onRemoveMonk: (monkId: string) => void
}) {
  const [newMonkName, setNewMonkName] = useState('')
  const [showAddMonkInput, setShowAddMonkInput] = useState(false)

  const roomTypeLabels: Record<string, string> = {
    bhikkhu: 'បន្ទប់ភិក្ខុ (Bhikkhu Room)',
    samanera: 'បន្ទប់សាមណេរ (Samanera Room)',
    guest: 'បន្ទប់ភ្ញៀវ (Guest Room)',
    storage: 'បន្ទប់ឃ្លាំង (Storage Room)',
    office: 'ការិយាល័យ (Office)'
  }

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    available: { bg: '#ECFDF5', text: '#065F46', border: '#A7F3D0' },
    occupied: { bg: '#FEF2F2', text: '#991B1B', border: '#FECACA' },
    maintenance: { bg: '#FFFBEB', text: '#92400E', border: '#FDE68A' },
  }

  const currentStatus = statusColors[room.status] || statusColors.available

  const handleAddMonk = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMonkName.trim()) return
    onAssignMonk(newMonkName.trim())
    setNewMonkName('')
    setShowAddMonkInput(false)
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div 
        className="modal modal-md animate-scaleUp"
        style={{
          borderRadius: '24px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          maxWidth: '520px'
        }}
      >
        {/* Header with vibrant saffron gradient */}
        <div 
          style={{ 
            background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 100%)', 
            padding: '20px 24px', 
            color: '#FFFFFF',
            borderBottom: '2px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div 
              style={{ 
                width: '46px', 
                height: '46px', 
                borderRadius: '14px', 
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                color: '#1C1917', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontWeight: 900,
                fontSize: '1.2rem',
                boxShadow: '0 4px 12px rgba(217, 119, 6, 0.35)'
              }}
              className="font-latin"
            >
              {room.room_number}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FEF3C7', margin: 0 }}>
                  បន្ទប់លេខ {room.room_number} {room.room_name ? `(${room.room_name})` : ''}
                </h3>
              </div>
              <p style={{ fontSize: '0.74rem', color: '#CBD5E1', margin: '2px 0 0' }}>
                {kuthiName} • ជាន់ទី {room.floor || 1}
              </p>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ 
              width: '32px', 
              height: '32px', 
              borderRadius: '50%', 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              color: '#FFFFFF', 
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '22px', background: '#F8FAFC', maxHeight: '480px', overflowY: 'auto' }}>
          
          {/* Key Info Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '18px' }}>
            <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '14px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B' }}>ស្ថានភាពបច្ចុប្បន្ន</div>
              <span 
                style={{ 
                  display: 'inline-block',
                  background: currentStatus.bg, 
                  color: currentStatus.text, 
                  border: `1px solid ${currentStatus.border}`,
                  padding: '3px 10px', 
                  borderRadius: '8px', 
                  fontSize: '0.74rem', 
                  fontWeight: 800,
                  marginTop: '4px'
                }}
              >
                {ROOM_STATUS_LABELS[room.status]?.kh || room.status}
              </span>
            </div>

            <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '14px', border: '1.5px solid #E2E8F0' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B' }}>ចំណុះស្នាក់នៅ</div>
              <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', marginTop: '3px' }}>
                {(room.monks || []).length} / {room.capacity} អង្គ
              </div>
            </div>

            <div style={{ background: '#FFFFFF', padding: '12px 14px', borderRadius: '14px', border: '1.5px solid #E2E8F0', gridColumn: 'span 2' }}>
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#64748B' }}>ប្រភេទបន្ទប់</div>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0F172A', marginTop: '2px' }}>
                {roomTypeLabels[room.room_type] || room.room_type}
              </div>
            </div>
          </div>

          {/* Occupants Section (បញ្ជីព្រះសង្ឃស្នាក់នៅ) */}
          <div style={{ background: '#FFFFFF', borderRadius: '16px', border: '1.5px solid #E2E8F0', padding: '16px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} color="#D97706" />
                <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', margin: 0 }}>
                  បញ្ជីព្រះសង្ឃស្នាក់នៅ ({ (room.monks || []).length })
                </h4>
              </div>

              {(!room.monks || room.monks.length < room.capacity) && !showAddMonkInput && (
                <button
                  type="button"
                  onClick={() => setShowAddMonkInput(true)}
                  className="hover-lift"
                  style={{
                    background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
                    color: '#FFFFFF',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '5px 10px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  <UserPlus size={12} />
                  <span>បញ្ចូលព្រះសង្ឃ</span>
                </button>
              )}
            </div>

            {/* Inline Add Monk Form */}
            {showAddMonkInput && (
              <form onSubmit={handleAddMonk} style={{ display: 'flex', gap: '8px', marginBottom: '12px', background: '#F8FAFC', padding: '10px', borderRadius: '10px', border: '1px solid #CBD5E1' }}>
                <input
                  type="text"
                  placeholder="ព្រះនាម / ឈ្មោះព្រះសង្ឃ..."
                  value={newMonkName}
                  onChange={e => setNewMonkName(e.target.value)}
                  className="form-control"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '6px 10px' }}
                  autoFocus
                  required
                />
                <button 
                  type="submit" 
                  style={{ background: '#059669', color: '#FFFFFF', border: 'none', borderRadius: '8px', padding: '6px 12px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  យល់ព្រម
                </button>
                <button 
                  type="button" 
                  onClick={() => setShowAddMonkInput(false)}
                  style={{ background: '#E2E8F0', color: '#475569', border: 'none', borderRadius: '8px', padding: '6px 10px', fontSize: '0.75rem', fontWeight: 800, cursor: 'pointer' }}
                >
                  បោះបង់
                </button>
              </form>
            )}

            {(!room.monks || room.monks.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '16px', color: '#94A3B8', fontSize: '0.8rem' }}>
                <Bed size={24} style={{ margin: '0 auto 6px', display: 'block', color: '#CBD5E1' }} />
                មិនទាន់មានព្រះសង្ឃស្នាក់នៅបន្ទប់នេះទេ (បន្ទប់ទំនេរ)
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {room.monks.map((monk: any, idx: number) => (
                  <div 
                    key={monk.id || idx}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between',
                      background: '#F8FAFC',
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', color: '#1C1917', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '0.8rem' }}>
                        {monk.khmer_name?.charAt(0) || 'ស'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: '0.84rem', color: '#0F172A' }}>
                          {monk.khmer_name}
                        </div>
                        {monk.dhamma_name && (
                          <div style={{ fontSize: '0.68rem', color: '#D97706', fontWeight: 700 }}>
                            ឆាយា: «{monk.dhamma_name}»
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveMonk(monk.id)}
                      title="ដកចេញពីបន្ទប់"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#EF4444',
                        padding: '6px',
                        cursor: 'pointer',
                        borderRadius: '6px'
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ padding: '14px 22px', background: '#FFFFFF', borderTop: '1.5px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button
            type="button"
            className="hover-lift"
            onClick={onEdit}
            style={{
              background: '#EFF6FF',
              border: '1.5px solid #BFDBFE',
              color: '#2563EB',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '0.8rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Edit size={14} />
            <span>កែប្រែព័ត៌មានបន្ទប់</span>
          </button>

          <button
            type="button"
            className="btn btn-secondary"
            onClick={onClose}
            style={{ padding: '8px 18px', borderRadius: '10px', fontWeight: 800 }}
          >
            បិទ / Close
          </button>
        </div>
      </div>
    </div>
  )
}
