'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import { 
  Users, Building2, DollarSign, CalendarCheck, Package, Bell, Calendar, 
  ArrowUpRight, ArrowDownRight, Sparkles, TrendingUp, TrendingDown,
  ChevronRight, ShieldCheck, HeartPulse, GraduationCap, Sun, Moon, ArrowRight, Clock
} from 'lucide-react'
import Link from 'next/link'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell } from 'recharts'

import { useYear } from '@/contexts/YearContext'
import { fetchCloudCollection, subscribeToRealtimeSync } from '@/lib/cloudSync'

const PIE_COLORS = ['#D97706', '#2563EB', '#059669', '#7C3AED', '#DC2626']

export default function DashboardPage() {
  const { selectedYear } = useYear()
  const [currentDateTime, setCurrentDateTime] = useState({
    khmerDate: '',
    timeStr: '',
    solarDate: ''
  })

  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      
      const khmerDays = ['ថ្ងៃអាទិត្យ', 'ថ្ងៃចន្ទ', 'ថ្ងៃអង្គារ', 'ថ្ងៃពុធ', 'ថ្ងៃព្រហស្បតិ៍', 'ថ្ងៃសុក្រ', 'ថ្ងៃសៅរ៍']
      const khmerMonths = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
      
      const dayName = khmerDays[now.getDay()]
      const dateNum = now.getDate()
      const monthName = khmerMonths[now.getMonth()]
      const yearNum = now.getFullYear()

      // Convert Arabic digits to Khmer digits
      const toKhmerDigits = (n: number | string) => {
        const khmerNums = ['០', '១', '២', '៣', '៤', '៥', '៦', '៧', '៨', '៩']
        return String(n).split('').map(d => khmerNums[Number(d)] !== undefined ? khmerNums[Number(d)] : d).join('')
      }

      const khmerDateFormatted = `${dayName} ទី${toKhmerDigits(dateNum)} ខែ${monthName} ឆ្នាំ${toKhmerDigits(yearNum)}`
      const timeFormatted = now.toLocaleTimeString('km-KH', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
      const solarDateFormatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

      setCurrentDateTime({
        khmerDate: khmerDateFormatted,
        timeStr: timeFormatted,
        solarDate: solarDateFormatted
      })
    }

    updateTime()
    const timer = setInterval(updateTime, 1000)
    return () => clearInterval(timer)
  }, [])

  const [stats, setStats] = useState({
    monksCount: 0,
    bhikkhuCount: 0,
    samaneraCount: 0,
    roomsCount: 0,
    availableRooms: 0,
    occupiedRooms: 0,
    studentsCount: 0,
    inventoryCount: 0,
    goodItems: 0,
    damagedItems: 0,
    lostItems: 0,
    monthlyIncome: 0,
    monthlyExpense: 0,
  })

  const [rankDistribution, setRankDistribution] = useState<{ name: string; value: number }[]>([])
  const [financeData, setFinanceData] = useState<{ month: string; income: number; expense: number }[]>([])
  const [flipIncome, setFlipIncome] = useState(false)
  const [flipExpense, setFlipExpense] = useState(false)

  // Load and calculate stats filtered by selectedYear and local persisted data
  useEffect(() => {
    async function loadDashboardStats() {
      try {
        // 1. Monks Data
        let monksList: any[] = (await fetchCloudCollection('monks')) || []
        if (monksList.length === 0) {
          const savedMonks = localStorage.getItem('systemmk_custom_monks')
          if (savedMonks) monksList = JSON.parse(savedMonks)
        }

        // 2. Students Data
        let studentsList: any[] = (await fetchCloudCollection('students')) || []
        if (studentsList.length === 0) {
          const savedStudents = localStorage.getItem('systemmk_custom_students')
          if (savedStudents) studentsList = JSON.parse(savedStudents)
        }

        // 3. Inventory Data
        let inventoryList: any[] = (await fetchCloudCollection('inventory')) || []
        if (inventoryList.length === 0) {
          const savedInventory = localStorage.getItem('systemmk_custom_inventory')
          if (savedInventory) inventoryList = JSON.parse(savedInventory)
        }

        // 4. Finance Data
        let incList: any[] = (await fetchCloudCollection('incomes')) || []
        if (incList.length === 0) {
          const savedIncomes = localStorage.getItem('systemmk_custom_incomes')
          if (savedIncomes) incList = JSON.parse(savedIncomes)
        }

        let expList: any[] = (await fetchCloudCollection('expenses')) || []
        if (expList.length === 0) {
          const savedExpenses = localStorage.getItem('systemmk_custom_expenses')
          if (savedExpenses) expList = JSON.parse(savedExpenses)
        }

        const yearIncomes = incList.filter((i: any) => (i.income_date || '').startsWith(selectedYear))
        const yearExpenses = expList.filter((e: any) => (e.expense_date || '').startsWith(selectedYear))

        const totalInc = yearIncomes.reduce((s: number, i: any) => s + Number(i.amount || 0), 0)
        const totalExp = yearExpenses.reduce((s: number, e: any) => s + Number(e.amount || 0), 0)

        // Calculate Monk Rank distribution
        const bhikkhu = monksList.filter((m: any) => m.rank === 'bhikkhu' || m.rank === 'thera' || m.rank === 'maha_thera' || m.rank === 'samdech').length
        const samanera = monksList.filter((m: any) => m.rank === 'samanera' || !m.rank).length

        const rankCounts: Record<string, number> = {}
        monksList.forEach((m: any) => {
          const r = m.rank || 'samanera'
          rankCounts[r] = (rankCounts[r] || 0) + 1
        })

        const rankNames: Record<string, string> = {
          samdech: 'សម្តេច',
          maha_thera: 'មហាថេរ',
          thera: 'ថេរ',
          bhikkhu: 'ភិក្ខុ',
          samanera: 'សាមណេរ'
        }

        const pieData = Object.entries(rankCounts).map(([k, v]) => ({
          name: rankNames[k] || k,
          value: v
        }))

        setRankDistribution(pieData.length > 0 ? pieData : [
          { name: 'ភិក្ខុ', value: bhikkhu || 0 },
          { name: 'សាមណេរ', value: samanera || 0 }
        ])

        // Calculate Monthly Finance Chart (12 Months)
        const months = ['មករា', 'កុម្ភៈ', 'មីនា', 'មេសា', 'ឧសភា', 'មិថុនា', 'កក្កដា', 'សីហា', 'កញ្ញា', 'តុលា', 'វិច្ឆិកា', 'ធ្នូ']
        const monthlyChart = months.map((mName, idx) => {
          const mStr = String(idx + 1).padStart(2, '0')
          const prefix = `${selectedYear}-${mStr}`
          const mInc = incList.filter((i: any) => (i.income_date || '').startsWith(prefix)).reduce((s: number, i: any) => s + Number(i.amount || 0), 0)
          const mExp = expList.filter((e: any) => (e.expense_date || '').startsWith(prefix)).reduce((s: number, e: any) => s + Number(e.amount || 0), 0)
          return {
            month: mName,
            income: mInc,
            expense: mExp
          }
        })
        setFinanceData(monthlyChart)

        // Inventory breakdowns
        const good = inventoryList.filter((i: any) => i.status === 'good').length
        const damaged = inventoryList.filter((i: any) => i.status === 'damaged').length
        const lost = inventoryList.filter((i: any) => i.status === 'lost').length

        // 5. Rooms & Kuthi Data
        let kuthiList: any[] = (await fetchCloudCollection('rooms')) || []
        if (kuthiList.length === 0) {
          const savedKuthi = localStorage.getItem('systemmk_custom_rooms')
          if (savedKuthi) kuthiList = JSON.parse(savedKuthi)
        }

        const allRooms = kuthiList.flatMap((k: any) => k.rooms || [])
        const totalRooms = allRooms.length > 0 ? allRooms.length : 12
        const availRooms = allRooms.length > 0 ? allRooms.filter((r: any) => r.status === 'available').length : 8
        const occRooms = allRooms.length > 0 ? allRooms.filter((r: any) => r.status === 'occupied').length : 4

        setStats({
          monksCount: monksList.length,
          bhikkhuCount: bhikkhu,
          samaneraCount: samanera,
          roomsCount: totalRooms,
          availableRooms: availRooms,
          occupiedRooms: occRooms,
          studentsCount: studentsList.length,
          inventoryCount: inventoryList.length,
          goodItems: good,
          damagedItems: damaged,
          lostItems: lost,
          monthlyIncome: totalInc,
          monthlyExpense: totalExp
        })
      } catch {}
    }

    loadDashboardStats()

    // Instant Real-time broadcast update
    const unsubscribe = subscribeToRealtimeSync(() => {
      loadDashboardStats()
    })

    const handleCustomEvent = () => {
      loadDashboardStats()
    }
    window.addEventListener('systemmk_data_updated', handleCustomEvent)

    // Fast 2.5s auto-poll across devices
    const timer = setInterval(loadDashboardStats, 2500)

    return () => {
      unsubscribe()
      window.removeEventListener('systemmk_data_updated', handleCustomEvent)
      clearInterval(timer)
    }
  }, [selectedYear])

  return (
    <div className="space-y-7 animate-fadeIn" style={{ paddingBottom: 'var(--space-8)' }}>
      
      {/* 🌟 1. HERO BANNER WITH REAL-TIME KHMER DATE & TIME */}
      <div 
        className="hover-lift"
        style={{
          background: 'linear-gradient(135deg, #1E1B18 0%, #2D2013 40%, #452C16 100%)',
          borderRadius: '24px',
          padding: '24px',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 40px -15px rgba(69, 44, 22, 0.45)',
          border: '1px solid rgba(245, 158, 11, 0.25)'
        }}
      >
        <div 
          className="animate-float"
          style={{ 
            position: 'absolute', 
            right: '-30px', 
            top: '-30px', 
            width: '240px', 
            height: '240px', 
            borderRadius: '50%', 
            background: 'radial-gradient(circle, rgba(245,158,11,0.2) 0%, transparent 70%)', 
            pointerEvents: 'none' 
          }} 
        />

        <div className="flex justify-between items-center flex-wrap gap-5 relative z-10">
          <div style={{ maxWidth: '640px' }}>
            
            {/* Top Badges & Real-time Date Badge */}
            <div className="flex items-center gap-2 mb-2.5 flex-wrap">

              {/* 📅 LIVE DATE BADGE */}
              <div 
                style={{ 
                  background: 'rgba(0, 0, 0, 0.35)', 
                  border: '1px solid rgba(245, 158, 11, 0.3)', 
                  color: '#FEF3C7', 
                  padding: '4px 14px', 
                  borderRadius: '20px', 
                  fontSize: '0.75rem', 
                  fontWeight: 700, 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  backdropFilter: 'blur(8px)'
                }}
              >
                <Calendar size={14} className="text-amber-400" />
                <span>{currentDateTime.khmerDate || 'កំពុងទាញយកកាលបរិច្ឆេទ...'}</span>
                <span style={{ opacity: 0.5 }}>|</span>
                <Clock size={13} className="text-amber-400" />
                <span className="font-latin">{currentDateTime.timeStr}</span>
              </div>
            </div>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FEF3C7', lineHeight: 1.3 }}>
              សូមស្វាគមន៍ មកកាន់SystemMK
            </h1>
            <p style={{ color: '#D1D5DB', marginTop: '6px', fontSize: '0.82rem', lineHeight: 1.5 }}>
              តាមដានស្ថិតិព្រះសង្ឃ បន្ទប់ស្នាក់នៅ វត្តមានសង្ឃកិច្ច តុល្យភាពហិរញ្ញវត្ថុ និងរបាយការណ៍បានយ៉ាងរហ័ស។
            </p>
          </div>

          <div className="flex gap-2.5 flex-wrap w-full sm:w-auto">
            <Link 
              href="/monks" 
              className="hover-lift"
              style={{ 
                background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)', 
                color: '#1C1917', 
                fontWeight: 700, 
                padding: '10px 16px', 
                borderRadius: '12px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '6px', 
                textDecoration: 'none', 
                boxShadow: '0 8px 20px rgba(217, 119, 6, 0.35)', 
                fontSize: '0.82rem', 
                flex: '1 1 auto' 
              }}
            >
              <Users size={16} />
              <span>មើលបញ្ជីព្រះសង្ឃ</span>
            </Link>

            <Link 
              href="/attendance" 
              className="hover-lift"
              style={{ 
                background: 'rgba(255, 255, 255, 0.12)', 
                color: '#FFFFFF', 
                fontWeight: 600, 
                padding: '10px 16px', 
                borderRadius: '12px', 
                display: 'inline-flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                gap: '6px', 
                textDecoration: 'none', 
                backdropFilter: 'blur(10px)', 
                border: '1px solid rgba(255, 255, 255, 0.25)', 
                fontSize: '0.82rem', 
                flex: '1 1 auto' 
              }}
            >
              <CalendarCheck size={16} />
              <span>កត់វត្តមានថ្ងៃនេះ</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 🌟 2. STATS KPI CARDS - Compact Mobile Responsive Grid */}
      <div className="mobile-2-col-grid" style={{ gap: '10px' }}>
        
        {/* Card 1: Monks Total */}
        <div 
          className="hover-lift"
          style={{ 
            background: 'linear-gradient(145deg, #FFFBEB 0%, #FEF3C7 100%)', 
            borderRadius: '18px', 
            padding: '12px 14px', 
            border: '1.5px solid #FDE68A', 
            boxShadow: '0 8px 20px -5px rgba(217, 119, 6, 0.15)',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#92400E', display: 'block', whiteSpace: 'nowrap' }}>ព្រះសង្ឃសរុប</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#78350F', marginTop: '2px', lineHeight: 1.1 }}>
                {stats.monksCount} <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#B45309' }}>អង្គ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #FDE68A 0%, #F59E0B 100%)', color: '#78350F', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)', flexShrink: 0 }}>
              <Users size={16} />
            </div>
          </div>
          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #FDE68A', fontSize: '0.62rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <span style={{ color: '#B45309' }}>ភិក្ខុ: <strong>{stats.bhikkhuCount}</strong> | សាមណេរ: <strong>{stats.samaneraCount}</strong></span>
          </div>
        </div>

        {/* Card 2: Rooms Status */}
        <div 
          className="hover-lift"
          style={{ 
            background: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)', 
            borderRadius: '18px', 
            padding: '12px 14px', 
            border: '1.5px solid #BFDBFE', 
            boxShadow: '0 8px 20px -5px rgba(37, 99, 235, 0.15)',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#1E40AF', display: 'block', whiteSpace: 'nowrap' }}>បន្ទប់ស្នាក់នៅ</span>
              <div style={{ fontSize: '1.45rem', fontWeight: 800, color: '#1E3A8A', marginTop: '2px', lineHeight: 1.1 }}>
                {stats.availableRooms}<span style={{ fontSize: '0.9rem', color: '#60A5FA', fontWeight: 500 }}>/{stats.roomsCount}</span> <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#2563EB' }}>ទំនេរ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #93C5FD 0%, #3B82F6 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(59, 130, 246, 0.3)', flexShrink: 0 }}>
              <Building2 size={16} />
            </div>
          </div>
          <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #BFDBFE', fontSize: '0.62rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            <span style={{ color: '#1E40AF' }}>ស្នាក់នៅ: <strong>{stats.occupiedRooms} បន្ទប់</strong></span>
          </div>
        </div>

        {/* Card 3: Monthly Income with 3D Flip to USD */}
        <div 
          onClick={() => setFlipIncome(!flipIncome)}
          className="hover-lift"
          style={{ 
            background: flipIncome 
              ? 'linear-gradient(145deg, #064E3B 0%, #065F46 100%)' 
              : 'linear-gradient(145deg, #ECFDF5 0%, #D1FAE5 100%)', 
            borderRadius: '18px', 
            padding: '12px 14px', 
            border: flipIncome ? '1.5px solid #059669' : '1.5px solid #A7F3D0', 
            boxShadow: '0 8px 20px -5px rgba(5, 150, 105, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: flipIncome ? 'scale(1.02)' : 'none',
            userSelect: 'none'
          }}
          title="ចុចដើម្បីត្រឡប់មើលជាប្រាក់ដុល្លារ ($ USD) / ប្រាក់រៀល (៛ KHR)"
        >
          {!flipIncome ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#065F46', display: 'block', whiteSpace: 'nowrap' }}>ចំណូលបច្ច័យ</span>
                    <span style={{ fontSize: '0.55rem', background: '#A7F3D0', color: '#065F46', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>៛</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#064E3B', marginTop: '2px', lineHeight: 1.1, whiteSpace: 'nowrap' }} className="font-latin">
                    {formatCurrency(stats.monthlyIncome)}
                  </div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #6EE7B7 0%, #10B981 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)', flexShrink: 0 }}>
                  <ArrowUpRight size={16} />
                </div>
              </div>
              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #A7F3D0', fontSize: '0.62rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#047857', fontWeight: 700 }}>+១២% ខែនេះ</span>
                <span style={{ color: '#059669', fontSize: '0.6rem', fontWeight: 700 }}>🔄 ចុចមើល $</span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#A7F3D0', display: 'block', whiteSpace: 'nowrap' }}>ចំណូលបច្ច័យ ($)</span>
                    <span style={{ fontSize: '0.55rem', background: '#047857', color: '#D1FAE5', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>USD</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1, whiteSpace: 'nowrap' }} className="font-latin">
                    ${(stats.monthlyIncome / 4100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#10B981', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(16, 185, 129, 0.5)', flexShrink: 0, fontWeight: 900, fontSize: '0.9rem' }}>
                  $
                </div>
              </div>
              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed rgba(167, 243, 208, 0.3)', fontSize: '0.62rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#A7F3D0', fontWeight: 600 }}>អត្រា $1 = 4,100 ៛</span>
                <span style={{ color: '#FEF3C7', fontSize: '0.6rem', fontWeight: 700 }}>🔄 ត្រឡប់មើល ៛</span>
              </div>
            </div>
          )}
        </div>

        {/* Card 4: Monthly Expense with 3D Flip to USD */}
        <div 
          onClick={() => setFlipExpense(!flipExpense)}
          className="hover-lift"
          style={{ 
            background: flipExpense 
              ? 'linear-gradient(145deg, #7F1D1D 0%, #991B1B 100%)' 
              : 'linear-gradient(145deg, #FEF2F2 0%, #FEE2E2 100%)', 
            borderRadius: '18px', 
            padding: '12px 14px', 
            border: flipExpense ? '1.5px solid #EF4444' : '1.5px solid #FECACA', 
            boxShadow: '0 8px 20px -5px rgba(220, 38, 38, 0.2)',
            cursor: 'pointer',
            transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
            transform: flipExpense ? 'scale(1.02)' : 'none',
            userSelect: 'none'
          }}
          title="ចុចដើម្បីត្រឡប់មើលជាប្រាក់ដុល្លារ ($ USD) / ប្រាក់រៀល (៛ KHR)"
        >
          {!flipExpense ? (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#991B1B', display: 'block', whiteSpace: 'nowrap' }}>ចំណាយសរុប</span>
                    <span style={{ fontSize: '0.55rem', background: '#FECACA', color: '#991B1B', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>៛</span>
                  </div>
                  <div style={{ fontSize: '1.05rem', fontWeight: 800, color: '#7F1D1D', marginTop: '2px', lineHeight: 1.1, whiteSpace: 'nowrap' }} className="font-latin">
                    {formatCurrency(stats.monthlyExpense)}
                  </div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #FCA5A5 0%, #EF4444 100%)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.3)', flexShrink: 0 }}>
                  <ArrowDownRight size={16} />
                </div>
              </div>
              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed #FECACA', fontSize: '0.62rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#991B1B' }}>សល់: <strong>{formatCurrency(stats.monthlyIncome - stats.monthlyExpense)}</strong></span>
                <span style={{ color: '#DC2626', fontSize: '0.6rem', fontWeight: 700 }}>🔄 ចុចមើល $</span>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#FECACA', display: 'block', whiteSpace: 'nowrap' }}>ចំណាយសរុប ($)</span>
                    <span style={{ fontSize: '0.55rem', background: '#991B1B', color: '#FEE2E2', padding: '1px 4px', borderRadius: '4px', fontWeight: 800 }}>USD</span>
                  </div>
                  <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1, whiteSpace: 'nowrap' }} className="font-latin">
                    ${(stats.monthlyExpense / 4100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                </div>
                <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: '#EF4444', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(239, 68, 68, 0.5)', flexShrink: 0, fontWeight: 900, fontSize: '0.9rem' }}>
                  $
                </div>
              </div>
              <div style={{ marginTop: '8px', paddingTop: '6px', borderTop: '1px dashed rgba(254, 202, 202, 0.3)', fontSize: '0.62rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#FECACA' }}>សល់: <strong>${((stats.monthlyIncome - stats.monthlyExpense) / 4100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></span>
                <span style={{ color: '#FEF3C7', fontSize: '0.6rem', fontWeight: 700 }}>🔄 ត្រឡប់មើល ៛</span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 🌟 3. DIGITAL INVENTORY HIGHLIGHT BANNER */}
      <div 
        className="hover-lift"
        style={{
          background: 'linear-gradient(135deg, #2E1065 0%, #4C1D95 50%, #6D28D9 100%)',
          borderRadius: '22px',
          padding: '20px',
          color: '#FFFFFF',
          position: 'relative',
          overflow: 'hidden',
          boxShadow: '0 20px 35px -10px rgba(109, 40, 217, 0.4)',
          border: '1px solid rgba(196, 181, 253, 0.3)'
        }}
      >
        <div className="flex justify-between items-center flex-wrap gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span style={{ background: 'rgba(255, 255, 255, 0.15)', border: '1px solid rgba(255, 255, 255, 0.3)', color: '#E9D5FF', padding: '3px 12px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <Package size={14} className="text-purple-200" />
                Digital Inventory
              </span>
            </div>

            <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: '#FAF5FF', lineHeight: 1.2 }}>
              សម្ភារៈ & ទ្រព្យសម្បត្តិវត្ត {stats.inventoryCount} មុខ
            </h2>
          </div>

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <div style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '6px 12px', borderRadius: '12px', textAlign: 'center', flex: '1 1 60px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#86EFAC', lineHeight: 1 }}>{stats.goodItems}</div>
              <div style={{ fontSize: '0.62rem', color: '#DCFCE7', marginTop: '2px', fontWeight: 600 }}>ល្អ</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '6px 12px', borderRadius: '12px', textAlign: 'center', flex: '1 1 60px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FDE047', lineHeight: 1 }}>{stats.damagedItems}</div>
              <div style={{ fontSize: '0.62rem', color: '#FEF9C3', marginTop: '2px', fontWeight: 600 }}>ខូច</div>
            </div>

            <div style={{ background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255, 255, 255, 0.15)', padding: '6px 12px', borderRadius: '12px', textAlign: 'center', flex: '1 1 60px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FCA5A5', lineHeight: 1 }}>{stats.lostItems}</div>
              <div style={{ fontSize: '0.62rem', color: '#FEE2E2', marginTop: '2px', fontWeight: 600 }}>បាត់</div>
            </div>

            <Link 
              href="/inventory"
              style={{
                background: '#FAF5FF',
                color: '#581C87',
                fontWeight: 700,
                padding: '10px 14px',
                borderRadius: '12px',
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                fontSize: '0.78rem',
                flex: '1 1 100%'
              }}
            >
              <span>ពិនិត្យបញ្ជី</span>
              <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>

      {/* 🌟 4. CHARTS & ANALYTICS SECTION */}
      <div className="grid-cols-2" style={{ gap: '16px' }}>
        
        {/* Income vs Expense Graph */}
        <div className="hover-lift" style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>ចំណូល និង ចំណាយប្រចាំខែ</h3>
              <p style={{ fontSize: '0.68rem', color: '#64748B' }} className="font-latin">Monthly Income vs Expenses</p>
            </div>
            <span style={{ background: '#F1F5F9', color: '#475569', padding: '3px 8px', borderRadius: '10px', fontSize: '0.68rem', fontWeight: 600 }}>
              ២០២៦
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={financeData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 10, fontFamily: 'Kantumruy Pro', fill: '#64748B' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: '#94A3B8' }} tickFormatter={(v) => `${v / 1000000}M`} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => formatCurrency(Number(v) || 0)} contentStyle={{ borderRadius: '10px', border: '1px solid #E2E8F0', fontSize: '0.75rem' }} />
              <Bar dataKey="income" name="ចំណូល" fill="#059669" radius={[4, 4, 0, 0]} barSize={12} />
              <Bar dataKey="expense" name="ចំណាយ" fill="#DC2626" radius={[4, 4, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Monk Rank Distribution Pie */}
        <div className="hover-lift" style={{ background: '#FFFFFF', borderRadius: '20px', border: '1px solid #E2E8F0', padding: '18px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div>
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0F172A' }}>ស្ថិតិព្រះសង្ឃតាមឋានៈ</h3>
              <p style={{ fontSize: '0.68rem', color: '#64748B' }} className="font-latin">Monks Distribution by Rank</p>
            </div>
            <Link href="/monks" style={{ fontSize: '0.7rem', color: '#D97706', fontWeight: 700, textDecoration: 'none' }}>មើលទាំងអស់ →</Link>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '220px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={rankDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={75}
                  innerRadius={45}
                  paddingAngle={4}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name.split(' ')[0]} ${(percent * 100).toFixed(0)}%`}
                >
                  {rankDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* 🌟 5. DIGITAL VIVID RICH COLOR-CODED QUICK ACCESS MODULES - STRICT 2-COLUMN GRID */}
      <div style={{ background: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', padding: '18px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div style={{ marginBottom: '14px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>ម៉ូឌុលគ្រប់គ្រងរហ័ស (Digital Access Modules)</h3>
          <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '2px' }}>ជ្រើសរើសផ្នែកដែលចង់ចូលប្រើប្រាស់ក្នុងប្រព័ន្ធ</p>
        </div>

        {/* STRICT 2 COLUMNS ALWAYS ON MOBILE */}
        <div className="mobile-2-col-grid" style={{ gap: '10px' }}>
          {[
            { 
              title: 'គ្រប់គ្រងព្រះសង្ឃ', 
              en: 'Monks', 
              href: '/monks', 
              icon: Users, 
              color: '#B45309', 
              border: '#FDE68A',
              cardBg: 'linear-gradient(145deg, #FEF3C7 0%, #FDE68A 100%)',
              iconBg: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              iconColor: '#FFFFFF',
              desc: 'បញ្ជីព្រះសង្ឃ ឋានៈ វស្សា' 
            },
            { 
              title: 'កុដិ និងបន្ទប់', 
              en: 'Rooms & Kuthi', 
              href: '/rooms', 
              icon: Building2, 
              color: '#1D4ED8', 
              border: '#BFDBFE',
              cardBg: 'linear-gradient(145deg, #EFF6FF 0%, #DBEAFE 100%)',
              iconBg: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
              iconColor: '#FFFFFF',
              desc: 'កុដិ បន្ទប់ និងផែនទី' 
            },
            { 
              title: 'វត្តមានប្រចាំថ្ងៃ', 
              en: 'Attendance', 
              href: '/attendance', 
              icon: CalendarCheck, 
              color: '#047857', 
              border: '#A7F3D0',
              cardBg: 'linear-gradient(145deg, #ECFDF5 0%, #D1FAE5 100%)',
              iconBg: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              iconColor: '#FFFFFF',
              desc: 'ព្រឹក រសៀល យប់ ច្បាប់' 
            },
            { 
              title: 'ហិរញ្ញវត្ថុ & បច្ច័យ', 
              en: 'Finance', 
              href: '/finance', 
              icon: DollarSign, 
              color: '#B91C1C', 
              border: '#FECACA',
              cardBg: 'linear-gradient(145deg, #FEF2F2 0%, #FEE2E2 100%)',
              iconBg: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              iconColor: '#FFFFFF',
              desc: 'ចំណូល ចំណាយ ថវិកា' 
            },
            { 
              title: 'សម្ភារៈ & ទ្រព្យសម្បត្តិ', 
              en: 'Inventory', 
              href: '/inventory', 
              icon: Package, 
              color: '#6D28D9', 
              border: '#DDD6FE',
              cardBg: 'linear-gradient(145deg, #F5F3FF 0%, #EDE9FE 100%)',
              iconBg: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
              iconColor: '#FFFFFF',
              desc: 'សម្ភារៈវត្ត ស្ថានភាព ទីតាំង' 
            },
            { 
              title: 'កាលវិភាគ & ពិធីបុណ្យ', 
              en: 'Schedule', 
              href: '/schedule', 
              icon: Calendar, 
              color: '#0369A1', 
              border: '#BAE6FD',
              cardBg: 'linear-gradient(145deg, #F0F9FF 0%, #E0F2FE 100%)',
              iconBg: 'linear-gradient(135deg, #0EA5E9 0%, #0284C7 100%)',
              iconColor: '#FFFFFF',
              desc: 'បុណ្យកឋិន ភ្ជុំបិណ្ឌ រៀន' 
            },
            { 
              title: 'របាយការណ៍ & ផែនការ', 
              en: 'Reports', 
              href: '/reports', 
              icon: Bell, 
              color: '#C2410C', 
              border: '#FED7AA',
              cardBg: 'linear-gradient(145deg, #FFF7ED 0%, #FFEDD5 100%)',
              iconBg: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
              iconColor: '#FFFFFF',
              desc: 'ផែនការ១ឆ្នាំ Export Excel/PDF' 
            },
            { 
              title: 'ការសន្ទនាផ្ទៃក្នុង', 
              en: 'Live Chat', 
              href: '/chat', 
              icon: Sparkles, 
              color: '#0F766E', 
              border: '#99F6E4',
              cardBg: 'linear-gradient(145deg, #F0FDFA 0%, #CCFBF1 100%)',
              iconBg: 'linear-gradient(135deg, #14B8A6 0%, #0D9488 100%)',
              iconColor: '#FFFFFF',
              desc: 'បន្ទប់សន្ទនា ទំនាក់ទំនង' 
            },
          ].map(m => {
            const Icon = m.icon
            return (
              <Link
                key={m.href}
                href={m.href}
                className="hover-lift"
                style={{
                  display: 'block',
                  background: m.cardBg,
                  border: `1.5px solid ${m.border}`,
                  borderRadius: '16px',
                  padding: '12px 10px',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.04)',
                  transition: 'all 0.25s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '11px', background: m.iconBg, color: m.iconColor, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 4px 10px ${m.color}35` }}>
                    <Icon size={18} />
                  </div>
                  <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(255,255,255,0.9)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
                    <ArrowRight size={12} color={m.color} />
                  </div>
                </div>

                <h4 style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>{m.title}</h4>
                <div style={{ fontSize: '0.62rem', color: m.color, fontFamily: 'Plus Jakarta Sans', fontWeight: 700, marginTop: '2px', marginBottom: '2px' }}>{m.en}</div>
                <p style={{ fontSize: '0.62rem', color: '#475569', lineHeight: 1.25 }}>{m.desc}</p>
              </Link>
            )
          })}
        </div>
      </div>

    </div>
  )
}
