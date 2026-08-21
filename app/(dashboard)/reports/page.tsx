'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useYear } from '@/contexts/YearContext'
import { FileText, Download, Table, CheckCircle, BarChart3, Calendar, Sparkles, TrendingUp, Users, DollarSign, Package, ArrowLeft } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

export default function ReportsPage() {
  const router = useRouter()
  const { selectedYear, availableYears } = useYear()
  const [reportType, setReportType] = useState('monthly')
  const [year, setYear] = useState(selectedYear)
  const [month, setMonth] = useState('8')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    setYear(selectedYear)
  }, [selectedYear])

  const handleExportExcel = () => {
    setExporting(true)
    try {
      const data = [
        { 'ល.រ': 1, 'ឈ្មោះព្រះសង្ឃ': 'ព្រះមហា សុខ វិបុល', 'ឋានៈ': 'ភិក្ខុ', 'វស្សា': 5, 'វត្តមាន': '២៨ ថ្ងៃ', 'ស្ថានភាព': 'វត្តមានពេញលេញ' },
        { 'ល.រ': 2, 'ឈ្មោះព្រះសង្ឃ': 'សាមណេរ ចាន់ រ៉ា', 'ឋានៈ': 'សាមណេរ', 'វស្សា': 2, 'វត្តមាន': '៣០ ថ្ងៃ', 'ស្ថានភាព': 'រៀនពូកែ' },
        { 'ល.រ': 3, 'ឈ្មោះព្រះសង្ឃ': 'ព្រះគ្រូ ឡុង សារ៉េត', 'ឋានៈ': 'ចៅអធិការ', 'វស្សា': 18, 'វត្តមាន': '៣១ ថ្ងៃ', 'ស្ថានភាព': 'ដឹកនាំសង្ឃកិច្ច' },
        { 'ល.រ': 4, 'ឈ្មោះព្រះសង្ឃ': 'ភិក្ខុ ឌុក សម្បត្តិ', 'ឋានៈ': 'ភិក្ខុ', 'វស្សា': 8, 'វត្តមាន': '២៥ ថ្ងៃ', 'ស្ថានភាព': 'សុំច្បាប់ព្យាបាលជំងឺ' },
      ]

      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'របាយការណ៍វត្តអារាម')
      XLSX.writeFile(workbook, `SystemMK_Report_${year}_${month}.xlsx`)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = () => {
    setExporting(true)
    try {
      const doc = new jsPDF()
      doc.text('វត្តអារាម SystemMK - របាយការណ៍បូកសរុបប្រចាំខែ', 14, 20)
      
      const tableData = [
        [1, 'ព្រះមហា សុខ វិបុល', 'ភិក្ខុ', '5 វស្សា', '២៨ ថ្ងៃ', 'វត្តមានល្អ'],
        [2, 'សាមណេរ ចាន់ រ៉ា', 'សាមណេរ', '2 វស្សា', '៣០ ថ្ងៃ', 'រៀនពូកែ'],
        [3, 'ព្រះគ្រូ ឡុង សារ៉េត', 'ចៅអធិការ', '18 វស្សា', '៣១ ថ្ងៃ', 'ដឹកនាំសង្ឃកិច្ច'],
        [4, 'ភិក្ខុ ឌុក សម្បត្តិ', 'ភិក្ខុ', '8 វស្សា', '២៥ ថ្ងៃ', 'សុំច្បាប់'],
      ]

      ;(doc as any).autoTable({
        head: [['ល.រ', 'ឈ្មោះ', 'ឋានៈ', 'វស្សា', 'វត្តមាន', 'ស្ថានភាព']],
        body: tableData,
        startY: 30,
      })

      doc.save(`SystemMK_Report_${year}_${month}.pdf`)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
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
            <h1 className="page-title" style={{ fontSize: '1.4rem', margin: 0 }}>ផែនការ & របាយការណ៍ (Reports)</h1>
            <p className="page-subtitle" style={{ margin: '2px 0 0' }}>ទាញយករបាយការណ៍បូកសរុប និងតាមដានផែនការយុទ្ធសាស្ត្រវត្តអារាម</p>
          </div>
        </div>
        <div className="page-header-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
          <button 
            className="hover-lift" 
            onClick={handleExportExcel} 
            disabled={exporting}
            style={{
              background: '#FFFFFF',
              color: '#059669',
              border: '1.5px solid #A7F3D0',
              fontWeight: 800,
              padding: '9px 16px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.1)',
              fontSize: '0.82rem'
            }}
          >
            <Download size={16} />
            <span>នាំចេញ Excel</span>
          </button>

          <button 
            className="hover-lift" 
            onClick={handleExportPDF} 
            disabled={exporting}
            style={{
              background: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
              color: '#1C1917',
              fontWeight: 800,
              padding: '9px 16px',
              borderRadius: '12px',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(217, 119, 6, 0.35)',
              fontSize: '0.82rem'
            }}
          >
            <FileText size={16} />
            <span>ទាញយក PDF</span>
          </button>
        </div>
      </div>

      {/* 🌟 4 VIVID RICH GRADIENT KPI CARDS - 2 COLUMNS ON MOBILE */}
      <div className="mobile-2-col-grid" style={{ gap: '10px' }}>
        
        {/* Card 1: Monks Summary */}
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
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#FDE68A', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>ព្រះសង្ឃសរុប / MONKS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                ២៨ <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FEF3C7' }}>អង្គ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Users size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#FCD34D', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            គង់ជាក់ស្ដែងក្នុងវត្ត
          </div>
        </div>

        {/* Card 2: Attendance Rate */}
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
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>អត្រាវត្តមាន / ATTEND</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                ៩៦% <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1FAE5' }}>មធ្យម</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <CheckCircle size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#6EE7B7', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            សង្ឃកិច្ច ព្រឹក/រសៀល/យប់
          </div>
        </div>

        {/* Card 3: Finance Surplus */}
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
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#BFDBFE', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>សមតុល្យ / BALANCE</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }} className="font-latin">
                3.4M ៛
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#93C5FD', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            សល់ពីចំណូល/ចំណាយ
          </div>
        </div>

        {/* Card 4: Inventory Assets */}
        <div 
          className="hover-lift"
          style={{
            background: 'linear-gradient(135deg, #7C3AED 0%, #6D28D9 50%, #4C1D95 100%)',
            borderRadius: '18px',
            padding: '12px 14px',
            color: '#FFFFFF',
            boxShadow: '0 8px 20px -5px rgba(124, 58, 237, 0.4)',
            border: '1px solid rgba(221, 214, 254, 0.3)',
            overflow: 'hidden'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#DDD6FE', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>ទ្រព្យសម្បត្តិ / ASSETS</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }}>
                ៥៦ <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#EDE9FE' }}>មុខ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#C4B5FD', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            ស្ថានភាពល្អ ៤៨ មុខ
          </div>
        </div>

      </div>

      {/* 🌟 Filter Parameters Section */}
      <div style={{ background: '#FFFFFF', borderRadius: '20px', border: '1.5px solid #E2E8F0', padding: '18px 24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
        <div className="flex flex-wrap gap-4 items-center">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 800 }}>ប្រភេទរបាយការណ៍ / Report Type</label>
            <select className="form-control" style={{ border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600 }} value={reportType} onChange={e => setReportType(e.target.value)}>
              <option value="monthly">របាយការណ៍ប្រចាំខែ (Monthly Report)</option>
              <option value="annual">របាយការណ៍ប្រចាំឆ្នាំ (Annual Report)</option>
              <option value="plan">ផែនការសកម្មភាព ១ ឆ្នាំ (1-Year Plan)</option>
              <option value="finance">របាយការណ៍សមតុល្យហិរញ្ញវត្ថុ (Financial Balance)</option>
              <option value="attendance">របាយការណ៍វត្តមាន និងការសុំច្បាប់ (Attendance)</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label" style={{ fontWeight: 800 }}>ឆ្នាំ / Year</label>
            <select className="form-control" style={{ border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600 }} value={year} onChange={e => setYear(e.target.value)}>
              {availableYears.map(yr => (
                <option key={yr} value={yr}>ឆ្នាំ {yr}</option>
              ))}
            </select>
          </div>

          {reportType === 'monthly' && (
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontWeight: 800 }}>ខែ / Month</label>
              <select className="form-control" style={{ border: '1.5px solid #CBD5E1', borderRadius: '12px', fontWeight: 600 }} value={month} onChange={e => setMonth(e.target.value)}>
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
                  <option key={m} value={m}>ខែទី {m}</option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* 🌟 1-Year Strategic Plan Section */}
      {reportType === 'plan' ? (
        <div style={{ background: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', padding: '24px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>ផែនការយុទ្ធសាស្ត្រ និងសកម្មភាព ១ ឆ្នាំ (២០២៦)</h3>
            <span style={{ background: '#FEF3C7', color: '#92400E', padding: '4px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>ផែនការមេ</span>
          </div>
          <div className="space-y-4">
            {[
              { quarter: 'ត្រីមាសទី ១ (មករា - មីនា)', goal: 'ពង្រឹងវិន័យ និងការសិក្សាភាសាបាលី', actions: 'រៀបចំកាលវិភាគសិក្សាថ្មី, ជួសជុលបន្ទប់ស្នាក់នៅកុដិលេខ ១, រៀបចំបញ្ជីសារពើភណ្ឌ', color: '#D97706', bg: '#FFFBEB' },
              { quarter: 'ត្រីមាសទី ២ (មេសា - មិថុនា)', goal: 'ពិធីបុណ្យចូលឆ្នាំថ្មី និងបុណ្យវិសាខបូជា', actions: 'រៀបចំពិធីស្រង់ព្រះ, បើកវគ្គបំប៉នសីលធម៌សម្រាប់យុវជន, រៀបចំថវិកាប្រចាំឆមាសទី១', color: '#2563EB', bg: '#EFF6FF' },
              { quarter: 'ត្រីមាសទី ៣ (កក្កដា - កញ្ញា)', goal: 'រដូវចូលវស្សា និងបុណ្យភ្ជុំបិណ្ឌ', actions: 'ពិធីចូលព្រះវស្សា, បង្រៀនគម្ពីរធម្មបទ, រៀបចំទទួលពុទ្ធបរិស័ទក្នុងពិធីបុណ្យភ្ជុំបិណ្ឌ', color: '#059669', bg: '#ECFDF5' },
              { quarter: 'ត្រីមាសទី ៤ (តុលា - ធ្នូ)', goal: 'បុណ្យចេញវស្សា, កឋិនទាន និងប្រឡងប្រចាំឆ្នាំ', actions: 'រៀបចំពិធីបុណ្យកឋិនទានសាមគ្គី, ការប្រឡងធម្មវិន័យបញ្ចប់ឆ្នាំ, សរុបរបាយការណ៍បូកសរុបប្រចាំឆ្នាំ', color: '#7C3AED', bg: '#F5F3FF' },
            ].map((p, idx) => (
              <div key={idx} className="hover-lift" style={{ padding: '18px 20px', borderRadius: '16px', border: `1.5px solid ${p.color}30`, background: p.bg }}>
                <h4 style={{ fontWeight: 800, color: p.color, fontSize: '0.95rem', marginBottom: '4px' }}>{p.quarter}</h4>
                <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#1E293B' }}>គោលដៅ: {p.goal}</p>
                <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px' }}>សកម្មភាពគន្លឹះ: {p.actions}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Report Preview Table */
        <div style={{ background: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div style={{ padding: '18px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>តារាងទិន្នន័យរបាយការណ៍សង្ខេប</h3>
            <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '4px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>ទិន្នន័យជាក់ស្ដែង</span>
          </div>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ល.រ</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ព្រះនាម / ឈ្មោះ</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ឋានៈ / តួនាទី</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>វស្សា</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>វត្តមានសរុប</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ស្ថានភាព / ចំណាំ</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { id: 1, name: 'ព្រះមហា សុខ វិបុល', rank: 'ភិក្ខុ', vassa: '៥', att: '២៨ ថ្ងៃ', note: 'វត្តមានពេញលេញ', color: '#059669', bg: '#ECFDF5' },
                  { id: 2, name: 'សាមណេរ ចាន់ រ៉ា', rank: 'សាមណេរ', vassa: '២', att: '៣០ ថ្ងៃ', note: 'រៀនពូកែ', color: '#2563EB', bg: '#EFF6FF' },
                  { id: 3, name: 'ព្រះគ្រូ ឡុង សារ៉េត', rank: 'ចៅអធិការ', vassa: '១៨', att: '៣១ ថ្ងៃ', note: 'ដឹកនាំសង្ឃកិច្ច', color: '#D97706', bg: '#FFFBEB' },
                  { id: 4, name: 'ភិក្ខុ ឌុក សម្បត្តិ', rank: 'ភិក្ខុ', vassa: '៨', att: '២៥ ថ្ងៃ', note: 'សុំច្បាប់ព្យាបាលជំងឺ', color: '#DC2626', bg: '#FEF2F2' },
                ].map(row => (
                  <tr key={row.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td className="text-muted font-latin" style={{ padding: '16px 20px', fontWeight: 700 }}>{row.id}</td>
                    <td style={{ fontWeight: 800, color: '#0F172A', padding: '16px 20px' }}>{row.name}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', padding: '4px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="font-latin" style={{ padding: '16px 20px', color: '#475569', fontWeight: 600 }}>{row.vassa} វស្សា</td>
                    <td className="font-latin font-bold" style={{ color: '#059669', fontSize: '0.95rem', padding: '16px 20px' }}>{row.att}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: row.bg, color: row.color, padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {row.note}
                      </span>
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
