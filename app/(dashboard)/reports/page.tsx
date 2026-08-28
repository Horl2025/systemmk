'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useYear } from '@/contexts/YearContext'
import { FileText, Download, Table, CheckCircle, BarChart3, Calendar, Sparkles, TrendingUp, Users, DollarSign, Package, ArrowLeft, Send } from 'lucide-react'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'
import { fetchCloudCollection, subscribeToRealtimeSync } from '@/lib/cloudSync'
import { Monk } from '@/lib/database.types'
import { MONK_RANK_LABELS, MONK_STATUS_LABELS, calculateVassa, formatCurrency } from '@/lib/utils'
import { sendTelegramReport } from '@/lib/telegram'

export default function ReportsPage() {
  const router = useRouter()
  const { selectedYear, availableYears } = useYear()
  const [reportType, setReportType] = useState('monthly')
  const [year, setYear] = useState(selectedYear)
  const [month, setMonth] = useState('8')
  const [exporting, setExporting] = useState(false)
  const [sendingTelegram, setSendingTelegram] = useState(false)

  // Live Data States
  const [monks, setMonks] = useState<Monk[]>([])
  const [incomes, setIncomes] = useState<any[]>([])
  const [expenses, setExpenses] = useState<any[]>([])
  const [inventory, setInventory] = useState<any[]>([])

  useEffect(() => {
    setYear(selectedYear)
  }, [selectedYear])

  // Load Real-time Data from Cloud & LocalStorage
  const loadData = async () => {
    // 1. Monks
    let localMonks: Monk[] = []
    try {
      const savedM = localStorage.getItem('systemmk_custom_monks')
      if (savedM) {
        const parsed = JSON.parse(savedM)
        if (Array.isArray(parsed) && parsed.length > 0) {
          localMonks = parsed
          setMonks(parsed)
        }
      }
    } catch {}

    const cloudMonks = await fetchCloudCollection('monks')
    if (cloudMonks && Array.isArray(cloudMonks) && cloudMonks.length > 0) {
      const map = new Map<string, Monk>()
      localMonks.forEach(m => { if (m?.id) map.set(m.id, m) })
      cloudMonks.forEach(m => { if (m?.id) map.set(m.id, m) })
      setMonks(Array.from(map.values()))
    }

    // 2. Finance
    let localInc: any[] = []
    let localExp: any[] = []
    try {
      const sInc = localStorage.getItem('systemmk_custom_incomes')
      if (sInc) localInc = JSON.parse(sInc)
      const sExp = localStorage.getItem('systemmk_custom_expenses')
      if (sExp) localExp = JSON.parse(sExp)
    } catch {}

    const cInc = await fetchCloudCollection('incomes')
    if (cInc && Array.isArray(cInc)) {
      const map = new Map<string, any>()
      localInc.forEach(i => { if (i?.id) map.set(i.id, i) })
      cInc.forEach(i => { if (i?.id) map.set(i.id, i) })
      setIncomes(Array.from(map.values()))
    } else {
      setIncomes(localInc)
    }

    const cExp = await fetchCloudCollection('expenses')
    if (cExp && Array.isArray(cExp)) {
      const map = new Map<string, any>()
      localExp.forEach(e => { if (e?.id) map.set(e.id, e) })
      cExp.forEach(e => { if (e?.id) map.set(e.id, e) })
      setExpenses(Array.from(map.values()))
    } else {
      setExpenses(localExp)
    }

    // 3. Inventory
    let localInv: any[] = []
    try {
      const sInv = localStorage.getItem('systemmk_custom_inventory')
      if (sInv) localInv = JSON.parse(sInv)
    } catch {}

    const cInv = await fetchCloudCollection('inventory')
    if (cInv && Array.isArray(cInv)) {
      const map = new Map<string, any>()
      localInv.forEach(i => { if (i?.id) map.set(i.id, i) })
      cInv.forEach(i => { if (i?.id) map.set(i.id, i) })
      setInventory(Array.from(map.values()))
    } else {
      setInventory(localInv)
    }
  }

  useEffect(() => {
    loadData()

    const unsubscribe = subscribeToRealtimeSync(() => loadData())
    const handleCustomEvent = () => loadData()
    window.addEventListener('systemmk_data_updated', handleCustomEvent)
    const timer = setInterval(loadData, 2500)

    return () => {
      unsubscribe()
      window.removeEventListener('systemmk_data_updated', handleCustomEvent)
      clearInterval(timer)
    }
  }, [])

  const handleExportExcel = () => {
    setExporting(true)
    try {
      const data = monks.length > 0 ? monks.map((m, idx) => ({
        'ល.រ': idx + 1,
        'ឈ្មោះព្រះសង្ឃ': m.khmer_name + (m.dhamma_name ? ` (${m.dhamma_name})` : ''),
        'ឋានៈ': MONK_RANK_LABELS[m.rank]?.kh || m.rank,
        'វស្សា': calculateVassa(m.date_of_ordination) || 0,
        'សុខភាព': m.health_status === 'good' ? 'ល្អ' : 'មានបញ្ហាសុខភាព',
        'វត្តកំណើត': m.origin_temple || '—',
        'ស្ថានភាព': MONK_STATUS_LABELS[m.status]?.kh || m.status
      })) : [
        { 'ល.រ': 1, 'ឈ្មោះព្រះសង្ឃ': 'មិនទាន់មានទិន្នន័យព្រះសង្ឃ', 'ឋានៈ': '—', 'វស្សា': 0, 'សុខភាព': '—', 'វត្តកំណើត': '—', 'ស្ថានភាព': '—' }
      ]

      const worksheet = XLSX.utils.json_to_sheet(data)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'របាយការណ៍ព្រះសង្ឃ')
      XLSX.writeFile(workbook, `SystemMK_Monks_Report_${year}_${month}.xlsx`)
    } catch (err) {
      console.error(err)
    } finally {
      setExporting(false)
    }
  }

  const handleExportPDF = () => {
    setExporting(true)
    try {
      // Create a dedicated printable HTML report window with full Khmer font support
      const printWindow = window.open('', '_blank', 'width=900,height=1100')
      if (!printWindow) {
        alert('សូមអនុញ្ញាត (Allow Popups) ដើម្បីមើល និងទាញយក PDF!')
        setExporting(false)
        return
      }

      const totalInc = yearIncomes.reduce((s, i) => s + Number(i.amount || 0), 0)
      const totalExp = yearExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
      const bal = totalInc - totalExp
      const goodInvCount = inventory.filter(i => i.status === 'good').length

      const monksRows = monks.length > 0 ? monks.map((m, idx) => `
        <tr style="border-bottom: 1px solid #E2E8F0; text-align: left;">
          <td style="padding: 10px 12px; font-weight: 700; text-align: center;">${idx + 1}</td>
          <td style="padding: 10px 12px; font-weight: 700; color: #1E293B;">${m.khmer_name} ${m.dhamma_name ? `(${m.dhamma_name})` : ''}</td>
          <td style="padding: 10px 12px; color: #D97706; font-weight: 700;">${MONK_RANK_LABELS[m.rank]?.kh || m.rank || '—'}</td>
          <td style="padding: 10px 12px; text-align: center;">${calculateVassa(m.date_of_ordination) || 0} វស្សា</td>
          <td style="padding: 10px 12px; color: ${m.health_status === 'good' ? '#059669' : '#DC2626'}; font-weight: 600;">${m.health_status === 'good' ? '🟢 សុខភាពល្អ' : '🔴 មានបញ្ហា'}</td>
          <td style="padding: 10px 12px; color: #475569;">${m.origin_temple || '—'}</td>
          <td style="padding: 10px 12px; font-weight: 700; color: #0284C7;">${MONK_STATUS_LABELS[m.status]?.kh || m.status || '—'}</td>
        </tr>
      `).join('') : `
        <tr>
          <td colspan="7" style="padding: 20px; text-align: center; color: #64748B;">មិនទាន់មានទិន្នន័យព្រះសង្ឃនៅឡើយ</td>
        </tr>
      `

      const reportHtml = `
        <!DOCTYPE html>
        <html lang="km">
        <head>
          <meta charset="UTF-8">
          <title>SystemMK_Report_${year}_${month}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Kantumruy+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            body {
              font-family: 'Kantumruy Pro', sans-serif;
              color: #0F172A;
              margin: 0;
              padding: 30px 40px;
              background: #FFFFFF;
            }
            @media print {
              body { padding: 0; }
              .no-print { display: none !important; }
            }
            .header-banner {
              border-bottom: 2.5px solid #F59E0B;
              padding-bottom: 16px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: flex-end;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 12px;
              margin-bottom: 28px;
            }
            .stat-box {
              border: 1.5px solid #E2E8F0;
              border-radius: 12px;
              padding: 12px 14px;
              background: #F8FAFC;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 14px;
              font-size: 0.88rem;
            }
            th {
              background: #F1F5F9;
              color: #334155;
              padding: 10px 12px;
              font-weight: 800;
              border-bottom: 2px solid #CBD5E1;
              text-align: left;
            }
            .print-bar {
              background: #1E293B;
              color: #FFFFFF;
              padding: 12px 20px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              border-radius: 12px;
              margin-bottom: 20px;
            }
            .btn-action {
              background: #F59E0B;
              color: #1E293B;
              border: none;
              font-weight: 800;
              padding: 8px 18px;
              border-radius: 8px;
              cursor: pointer;
              font-family: 'Kantumruy Pro', sans-serif;
              font-size: 0.9rem;
            }
          </style>
        </head>
        <body>
          <div class="print-bar no-print">
            <span style="font-weight: 700;">📄 ផ្ទាំងទស្សនា និងទាញយករបាយការណ៍ជា PDF (Print / Save as PDF)</span>
            <button class="btn-action" onclick="window.print()">🖨️ បោះពុម្ព ឬរក្សាទុកជា PDF</button>
          </div>

          <div class="header-banner">
            <div>
              <div style="font-size: 0.85rem; color: #B45309; font-weight: 800; letter-spacing: 0.05em; text-transform: uppercase;">ព្រះរាជាណាចក្រកម្ពុជា • ជាតិ សាសនា ព្រះមហាក្សត្រ</div>
              <h1 style="font-size: 1.5rem; color: #1E293B; margin: 4px 0 0 0; font-weight: 800;">របាយការណ៍បូកសរុបការងារវត្តអារាម (SystemMK)</h1>
              <div style="font-size: 0.9rem; color: #64748B; margin-top: 4px;">កាលបរិច្ឆេទរបាយការណ៍៖ <strong>ឆ្នាំ ${year} ${reportType === 'monthly' ? `ខែទី ${month}` : ''}</strong></div>
            </div>
            <div style="text-align: right; font-size: 0.82rem; color: #64748B;">
              <div>ចេញពីប្រព័ន្ធ៖ <strong>SystemMK</strong></div>
              <div>កាលបរិច្ឆេទចេញ៖ <strong>${new Date().toLocaleDateString('km-KH')}</strong></div>
            </div>
          </div>

          <!-- KPI Summary Boxes -->
          <div class="stats-grid">
            <div class="stat-box" style="border-color: #FDE68A; background: #FFFBEB;">
              <div style="font-size: 0.75rem; color: #92400E; font-weight: 800;">ព្រះសង្ឃសរុប</div>
              <div style="font-size: 1.35rem; color: #78350F; font-weight: 900; margin-top: 4px;">${monks.length} អង្គ</div>
            </div>
            <div class="stat-box" style="border-color: #A7F3D0; background: #ECFDF5;">
              <div style="font-size: 0.75rem; color: #065F46; font-weight: 800;">ចំណូលបច្ច័យ (${year})</div>
              <div style="font-size: 1.15rem; color: #064E3B; font-weight: 900; margin-top: 4px;">${formatCurrency(totalInc)}</div>
            </div>
            <div class="stat-box" style="border-color: #FECACA; background: #FEF2F2;">
              <div style="font-size: 0.75rem; color: #991B1B; font-weight: 800;">ចំណាយវត្ត (${year})</div>
              <div style="font-size: 1.15rem; color: #7F1D1D; font-weight: 900; margin-top: 4px;">${formatCurrency(totalExp)}</div>
            </div>
            <div class="stat-box" style="border-color: #DDD6FE; background: #F5F3FF;">
              <div style="font-size: 0.75rem; color: #5B21B6; font-weight: 800;">សមតុល្យសល់ (${year})</div>
              <div style="font-size: 1.15rem; color: #4C1D95; font-weight: 900; margin-top: 4px;">${formatCurrency(bal)}</div>
            </div>
          </div>

          <!-- Monks Detailed Table -->
          <h3 style="font-size: 1.05rem; font-weight: 800; color: #1E293B; margin: 0 0 8px 0;">បញ្ជីព្រះសង្ឃវត្តអារាម</h3>
          <table>
            <thead>
              <tr>
                <th style="width: 50px; text-align: center;">ល.រ</th>
                <th>ព្រះនាម / ឈ្មោះ</th>
                <th>ឋានៈ</th>
                <th style="text-align: center;">វស្សា</th>
                <th>សុខភាព</th>
                <th>វត្តកំណើត</th>
                <th>ស្ថានភាព</th>
              </tr>
            </thead>
            <tbody>
              ${monksRows}
            </tbody>
          </table>

          <!-- Footer Signature Section -->
          <div style="display: flex; justify-content: space-between; margin-top: 50px; padding-top: 20px; page-break-inside: avoid;">
            <div style="text-align: center; width: 220px;">
              <div style="font-size: 0.85rem; font-weight: 700; color: #64748B;">អ្នកធ្វើរបាយការណ៍</div>
              <div style="margin-top: 60px; font-weight: 800; border-top: 1.5px dashed #CBD5E1; padding-top: 6px;">លេខាធិការ / គណៈកម្មការ</div>
            </div>
            <div style="text-align: center; width: 220px;">
              <div style="font-size: 0.85rem; font-weight: 700; color: #64748B;">បានឃើញ និងឯកភាព</div>
              <div style="margin-top: 60px; font-weight: 800; border-top: 1.5px dashed #CBD5E1; padding-top: 6px;">ព្រះចៅអធិការវត្ត</div>
            </div>
          </div>

          <script>
            // Automatically prompt print dialog after content loads
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
        </html>
      `

      printWindow.document.open()
      printWindow.document.write(reportHtml)
      printWindow.document.close()
    } catch (err) {
      console.error(err)
      alert('មានបញ្ហាក្នុងការបង្កើត PDF សូមព្យាយាមម្តងទៀត!')
    } finally {
      setExporting(false)
    }
  }

  // Handle Broadcasting Report to Telegram
  const yearIncomes = incomes.filter(i => (i.income_date || '').startsWith(year))
  const yearExpenses = expenses.filter(e => (e.expense_date || '').startsWith(year))
  const totalIncome = yearIncomes.reduce((s, i) => s + Number(i.amount || 0), 0)
  const totalExpense = yearExpenses.reduce((s, e) => s + Number(e.amount || 0), 0)
  const balance = totalIncome - totalExpense

  const handleSendTelegram = async () => {
    setSendingTelegram(true)
    const goodInv = inventory.filter(i => i.status === 'good').length

    let msg = ''
    if (reportType === 'monthly' || reportType === 'annual') {
      msg = `🏛️ <b>វត្តអារាម SystemMK - របាយការណ៍បូកសរុប (ឆ្នាំ ${year} ${reportType === 'monthly' ? `ខែទី ${month}` : ''})</b>
📅 កាលបរិច្ឆេទ: ${new Date().toLocaleDateString('km-KH')}
━━━━━━━━━━━━━━━━━━━━━━
🧘‍♂️ <b>ស្ថិតិព្រះសង្ឃសរុប:</b> <b>${monks.length} អង្គ</b>
• ភិក្ខុ: ${monks.filter(m => m.rank === 'bhikkhu' || m.rank === 'abbot' || m.rank === 'chief_monk').length} អង្គ
• សាមណេរ: ${monks.filter(m => m.rank === 'samanera' || !m.rank).length} អង្គ
• សុខភាពល្អ: ${monks.filter(m => m.health_status === 'good').length} អង្គ

💰 <b>របាយការណ៍ហិរញ្ញវត្ថុ (${year}):</b>
• ចំណូលសរុប: <b>+ ${formatCurrency(totalIncome)}</b>
• ចំណាយសរុប: <b>- ${formatCurrency(totalExpense)}</b>
• សមតុល្យសល់: <b>${formatCurrency(balance)}</b>

📦 <b>សារពើភណ្ឌសម្ភារៈ:</b> <b>${inventory.length} មុខ</b> (ល្អ ${goodInv} មុខ)
━━━━━━━━━━━━━━━━━━━━━━
<i>របាយការណ៍ចេញពីប្រព័ន្ធគ្រប់គ្រងវត្តអារាម SystemMK</i>`
    } else if (reportType === 'finance') {
      msg = `💰 <b>វត្តអារាម SystemMK - របាយការណ៍សមតុល្យបច្ច័យ (${year})</b>
📅 ឆ្នាំ ${year}
━━━━━━━━━━━━━━━━━━━━━━
🟢 ចំណូលបច្ច័យសរុប: <b>+ ${formatCurrency(totalIncome)}</b>
🔴 ចំណាយវត្តសរុប: <b>- ${formatCurrency(totalExpense)}</b>
━━━━━━━━━━━━━━━━━━━━━━
💵 <b>សមតុល្យបច្ច័យនៅសល់: ${formatCurrency(balance)}</b>
📈 ស្ថានភាព: ${balance >= 0 ? 'ថវិកាសល់វិជ្ជមាន' : 'ចំណាយលើសចំណូល'}`
    } else {
      msg = `📋 <b>វត្តអារាម SystemMK - របាយការណ៍ទូទៅ (${year})</b>
📅 ឆ្នាំ ${year}
━━━━━━━━━━━━━━━━━━━━━━
• ព្រះសង្ឃសរុប: <b>${monks.length} អង្គ</b>
• សមតុល្យបច្ច័យ (${year}): <b>${formatCurrency(balance)}</b>
• សម្ភារៈវត្ត: <b>${inventory.length} មុខ</b>
━━━━━━━━━━━━━━━━━━━━━━
<i>ចេញពីប្រព័ន្ធ SystemMK</i>`
    }

    const res = await sendTelegramReport(msg)
    alert(res.message)
    setSendingTelegram(false)
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
        <div className="page-header-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button 
            className="hover-lift" 
            onClick={handleSendTelegram} 
            disabled={sendingTelegram}
            style={{
              background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)',
              color: '#FFFFFF',
              border: 'none',
              fontWeight: 800,
              padding: '9px 16px',
              borderRadius: '12px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.35)',
              fontSize: '0.82rem'
            }}
          >
            <Send size={15} />
            <span>{sendingTelegram ? 'កំពុងផ្ញើ...' : '📢 ផ្ញើទៅ Telegram'}</span>
          </button>

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
                {monks.length} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FEF3C7' }}>អង្គ</span>
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
                ១០០% <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D1FAE5' }}>មធ្យម</span>
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
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: '#BFDBFE', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>សមតុល្យ ({year}) / BALANCE</div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }} className="font-latin">
                {formatCurrency(balance)}
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#93C5FD', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            សល់ពីចំណូល/ចំណាយ ឆ្នាំ {year}
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
                {inventory.length} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#EDE9FE' }}>មុខ</span>
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#C4B5FD', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            សម្ភារៈវត្តជាក់ស្ដែង
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
            <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>តារាងទិន្នន័យរបាយការណ៍សង្ខេប (បញ្ជីព្រះសង្ឃគង់ជាក់ស្ដែង)</h3>
            <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '4px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>{monks.length} អង្គសរុប</span>
          </div>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ល.រ</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ព្រះនាម / ឈ្មោះ</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ឋានៈ / តួនាទី</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>វស្សា</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>សុខភាព</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>វត្តកំណើត</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ស្ថានភាព</th>
                </tr>
              </thead>
              <tbody>
                {monks.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '32px', color: '#94A3B8', fontWeight: 700 }}>
                      មិនទាន់មានទិន្នន័យព្រះសង្ឃដែលបានបញ្ចូលនៅឡើយទេ
                    </td>
                  </tr>
                ) : (
                  monks.map((monk, idx) => (
                    <tr key={monk.id || idx} style={{ borderBottom: '1px solid #F1F5F9' }}>
                      <td className="text-muted font-latin" style={{ padding: '16px 20px', fontWeight: 700 }}>{idx + 1}</td>
                      <td style={{ fontWeight: 800, color: '#0F172A', padding: '16px 20px' }}>
                        {monk.khmer_name} {monk.dhamma_name && <span style={{ color: '#D97706', fontSize: '0.8rem', fontWeight: 700 }}>({monk.dhamma_name})</span>}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: '#FEF3C7', border: '1px solid #FDE68A', color: '#92400E', padding: '4px 12px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 800 }}>
                          {MONK_RANK_LABELS[monk.rank]?.kh || monk.rank}
                        </span>
                      </td>
                      <td className="font-latin" style={{ padding: '16px 20px', color: '#475569', fontWeight: 600 }}>
                        {calculateVassa(monk.date_of_ordination)} វស្សា
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ 
                          background: monk.health_status === 'good' ? '#ECFDF5' : '#FEF2F2', 
                          color: monk.health_status === 'good' ? '#065F46' : '#991B1B', 
                          padding: '4px 10px', 
                          borderRadius: '8px', 
                          fontSize: '0.75rem', 
                          fontWeight: 700 
                        }}>
                          {monk.health_status === 'good' ? '🟢 ល្អ' : '🔴 មានបញ្ហា'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', color: '#64748B', fontSize: '0.85rem' }}>
                        {monk.origin_temple || '—'}
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1E40AF', padding: '4px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 700 }}>
                          {MONK_STATUS_LABELS[monk.status]?.kh || monk.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
