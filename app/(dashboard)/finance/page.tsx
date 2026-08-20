'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Income, Expense } from '@/lib/database.types'
import { INCOME_TYPE_LABELS, EXPENSE_TYPE_LABELS, formatCurrency, today } from '@/lib/utils'
import { Plus, DollarSign, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Wallet, Check, Sparkles, ArrowLeft } from 'lucide-react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const DEMO_INCOMES: Income[] = [
  { id: '1', title: 'បច្ច័យបូជាបុណ្យមាឃបូជា', income_type: 'merit', amount: 3500000, currency: 'KHR', income_date: '2026-02-15', donor_name: 'ពុទ្ធបរិស័ទជិតឆ្ងាយ', description: '', receipt_url: null, event_id: null, recorded_by: null, created_at: '', updated_at: '' },
  { id: '2', title: 'សប្បុរសជនឧបត្ថម្ភថ្លៃទឹកភ្លើង', income_type: 'donation', amount: 1200000, currency: 'KHR', income_date: '2026-03-01', donor_name: 'ឧបាសិកា គឹម ហួរ', description: '', receipt_url: null, event_id: null, recorded_by: null, created_at: '', updated_at: '' },
  { id: '3', title: 'បច្ច័យសង្ឃទាន និងចង្ហាន់', income_type: 'offering', amount: 2800000, currency: 'KHR', income_date: '2026-03-08', donor_name: 'លោក គង់ វិរៈ និងគ្រួសារ', description: '', receipt_url: null, event_id: null, recorded_by: null, created_at: '', updated_at: '' },
  { id: '4', title: 'ថវិកាឧបត្ថម្ភសាលាបាលី', income_type: 'grant', amount: 2300000, currency: 'KHR', income_date: '2026-03-12', donor_name: 'សមាគមពុទ្ធសាសនិក', description: '', receipt_url: null, event_id: null, recorded_by: null, created_at: '', updated_at: '' },
]

const DEMO_EXPENSES: Expense[] = [
  { id: '1', title: 'ទូទាត់ថ្លៃអគ្គិសនីប្រចាំខែ', expense_type: 'electricity', amount: 850000, currency: 'KHR', expense_date: '2026-03-05', vendor_name: 'EDC', description: '', receipt_url: null, event_id: null, kuthi_id: null, recorded_by: null, created_at: '', updated_at: '' },
  { id: '2', title: 'ថ្លៃចង្ហាន់ និងគ្រឿងឧបភោគ', expense_type: 'food', amount: 1400000, currency: 'KHR', expense_date: '2026-03-10', vendor_name: 'ផ្សារលើ', description: '', receipt_url: null, event_id: null, kuthi_id: null, recorded_by: null, created_at: '', updated_at: '' },
  { id: '3', title: 'ជួសជុលដំបូលកុដិលេខ ៣', expense_type: 'repair', amount: 2100000, currency: 'KHR', expense_date: '2026-03-14', vendor_name: 'ជាង សុខា', description: '', receipt_url: null, event_id: null, kuthi_id: null, recorded_by: null, created_at: '', updated_at: '' },
  { id: '4', title: 'ទិញសៀវភៅពុទ្ធសាសនាសិក្សា', expense_type: 'education', amount: 650000, currency: 'KHR', expense_date: '2026-03-16', vendor_name: 'បណ្ណាគារអង្គរ', description: '', receipt_url: null, event_id: null, kuthi_id: null, recorded_by: null, created_at: '', updated_at: '' },
]

export default function FinancePage() {
  const router = useRouter()
  const [incomes, setIncomes] = useState<Income[]>(DEMO_INCOMES)
  const [expenses, setExpenses] = useState<Expense[]>(DEMO_EXPENSES)
  const [tab, setTab] = useState<'overview' | 'income' | 'expense'>('overview')
  const [showIncomeModal, setShowIncomeModal] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)

  const loadData = useCallback(async () => {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder-systemmk.supabase.co') {
      try {
        const { data: incData } = await supabase.from('income').select('*').order('income_date', { ascending: false })
        const { data: expData } = await supabase.from('expenses').select('*').order('expense_date', { ascending: false })

        if (incData && incData.length > 0) setIncomes(incData as unknown as Income[])
        if (expData && expData.length > 0) setExpenses(expData as unknown as Expense[])
      } catch {
        // fallback to instant demo state
      }
    }
  }, [])

  useEffect(() => { loadData() }, [loadData])

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0)
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0)
  const balance = totalIncome - totalExpense

  const incomeByType = Object.entries(INCOME_TYPE_LABELS).map(([key, val]) => ({
    name: val.kh,
    amount: incomes.filter(i => i.income_type === key).reduce((s, i) => s + Number(i.amount), 0),
  })).filter(x => x.amount > 0)

  const expenseByType = Object.entries(EXPENSE_TYPE_LABELS).map(([key, val]) => ({
    name: val.kh,
    amount: expenses.filter(e => e.expense_type === key).reduce((s, e) => s + Number(e.amount), 0),
  })).filter(x => x.amount > 0)

  return (
    <div className="animate-fadeIn space-y-7" style={{ paddingBottom: 'var(--space-8)' }}>
      
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
            <h1 className="page-title" style={{ fontSize: '1.4rem', margin: 0 }}>ហិរញ្ញវត្ថុ & បច្ច័យ (Treasury)</h1>
            <p className="page-subtitle" style={{ margin: '2px 0 0' }}>គ្រប់គ្រង និងតាមដានចរន្តចំណូល ចំណាយ និងតុល្យភាពបច្ច័យវត្ត</p>
          </div>
        </div>
        <div className="page-header-actions" style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
          <button 
            className="hover-lift" 
            onClick={() => setShowIncomeModal(true)}
            style={{
              background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(5, 150, 105, 0.35)',
              fontSize: '0.82rem'
            }}
          >
            <Plus size={16} />
            <span>កត់ត្រាចំណូល</span>
          </button>

          <button 
            className="hover-lift" 
            onClick={() => setShowExpenseModal(true)}
            style={{
              background: 'linear-gradient(135deg, #EF4444 0%, #DC2626 100%)',
              color: '#FFFFFF',
              fontWeight: 800,
              padding: '10px 18px',
              borderRadius: '12px',
              border: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(220, 38, 38, 0.35)',
              fontSize: '0.82rem'
            }}
          >
            <Plus size={16} />
            <span>កត់ត្រាចំណាយ</span>
          </button>
        </div>
      </div>

      {/* 🌟 3 VIBRANT RICH GRADIENT KPI CARDS - 2 COLUMNS ON MOBILE */}
      <div className="mobile-2-col-grid" style={{ gap: '10px' }}>
        
        {/* Card 1: Total Income (Emerald Gradient) */}
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
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#A7F3D0', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>ចំណូល / INCOME</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }} className="font-latin">
                {formatCurrency(totalIncome)}
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#6EE7B7', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            សរុប {incomes.length} ប្រភពបច្ច័យ
          </div>
        </div>

        {/* Card 2: Total Expense (Ruby Red Gradient) */}
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
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#FECACA', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>ចំណាយ / EXPENSE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }} className="font-latin">
                {formatCurrency(totalExpense)}
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <TrendingDown size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#FCA5A5', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            សរុប {expenses.length} ប្រតិបត្តិការ
          </div>
        </div>

        {/* Card 3: Net Balance (Solar Amber Gradient) */}
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
              <div style={{ fontSize: '0.68rem', fontWeight: 700, color: '#FDE68A', letterSpacing: '0.02em', whiteSpace: 'nowrap' }}>សមតុល្យ / BALANCE</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px', lineHeight: 1.1 }} className="font-latin">
                {formatCurrency(balance)}
              </div>
            </div>
            <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.2)', backdropFilter: 'blur(10px)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Wallet size={18} />
            </div>
          </div>
          <div style={{ fontSize: '0.62rem', color: '#FCD34D', marginTop: '8px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {balance >= 0 ? 'ស្ថានភាពហិរញ្ញវត្ថុ: ល្អ' : 'ចំណាយលើសចំណូល'}
          </div>
        </div>

      </div>

      {/* 🌟 Tabs */}
      <div className="tabs">
        <button className={`tab-item ${tab === 'overview' ? 'tab-item--active' : ''}`} onClick={() => setTab('overview')}>
          ទិដ្ឋភាពទូទៅ (Overview)
        </button>
        <button className={`tab-item ${tab === 'income' ? 'tab-item--active' : ''}`} onClick={() => setTab('income')}>
          បញ្ជីចំណូល (Incomes - {incomes.length})
        </button>
        <button className={`tab-item ${tab === 'expense' ? 'tab-item--active' : ''}`} onClick={() => setTab('expense')}>
          បញ្ជីចំណាយ (Expenses - {expenses.length})
        </button>
      </div>

      {tab === 'overview' ? (
        <div className="grid-cols-2" style={{ gap: '20px' }}>
          
          {/* Income Breakdown */}
          <div className="hover-lift" style={{ background: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', padding: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>ចំណូលតាមប្រភេទ</h3>
                <p style={{ fontSize: '0.7rem', color: '#64748B' }} className="font-latin">Income by Category</p>
              </div>
              <span style={{ background: '#ECFDF5', color: '#065F46', padding: '3px 10px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                {formatCurrency(totalIncome)}
              </span>
            </div>
            
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={incomeByType} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v/1000000}M`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: 'Kantumruy Pro', fill: '#334155' }} width={110} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v) || 0)} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                <Bar dataKey="amount" fill="#059669" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expense Breakdown */}
          <div className="hover-lift" style={{ background: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', padding: '22px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>ចំណាយតាមប្រភេទ</h3>
                <p style={{ fontSize: '0.7rem', color: '#64748B' }} className="font-latin">Expense by Category</p>
              </div>
              <span style={{ background: '#FEF2F2', color: '#991B1B', padding: '3px 10px', borderRadius: '10px', fontSize: '0.72rem', fontWeight: 700 }}>
                {formatCurrency(totalExpense)}
              </span>
            </div>

            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={expenseByType} layout="vertical" barSize={18}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickFormatter={v => `${v/1000000}M`} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fontFamily: 'Kantumruy Pro', fill: '#334155' }} width={110} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v: any) => formatCurrency(Number(v) || 0)} contentStyle={{ borderRadius: '12px', border: '1px solid #E2E8F0' }} />
                <Bar dataKey="amount" fill="#DC2626" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

        </div>
      ) : tab === 'income' ? (
        <div style={{ background: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ចំណងជើង / Title</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ប្រភេទ / Type</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ចំនួនទឹកប្រាក់ / Amount</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>កាលបរិច្ឆេទ / Date</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>សប្បុរសជន / Donor</th>
                </tr>
              </thead>
              <tbody>
                {incomes.map(inc => (
                  <tr key={inc.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ fontWeight: 800, color: '#0F172A', padding: '16px 20px' }}>{inc.title}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#065F46', padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {INCOME_TYPE_LABELS[inc.income_type]?.kh || inc.income_type}
                      </span>
                    </td>
                    <td className="font-latin font-bold" style={{ color: '#059669', fontSize: '1rem', padding: '16px 20px' }}>
                      {formatCurrency(inc.amount, inc.currency)}
                    </td>
                    <td className="font-latin" style={{ color: '#64748B', padding: '16px 20px' }}>{inc.income_date}</td>
                    <td style={{ color: '#334155', fontWeight: 600, padding: '16px 20px' }}>{inc.donor_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={{ background: '#FFFFFF', borderRadius: '22px', border: '1.5px solid #E2E8F0', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' }}>
          <div className="table-wrapper" style={{ border: 'none' }}>
            <table className="table">
              <thead>
                <tr style={{ background: '#F8FAFC' }}>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ចំណងជើង / Title</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ប្រភេទ / Type</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>ចំនួនទឹកប្រាក់ / Amount</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>កាលបរិច្ឆេទ / Date</th>
                  <th style={{ padding: '16px 20px', fontWeight: 800 }}>អ្នកទទួល/ហាង / Vendor</th>
                </tr>
              </thead>
              <tbody>
                {expenses.map(exp => (
                  <tr key={exp.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                    <td style={{ fontWeight: 800, color: '#0F172A', padding: '16px 20px' }}>{exp.title}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ background: '#FEF2F2', border: '1px solid #FECACA', color: '#991B1B', padding: '3px 10px', borderRadius: '10px', fontSize: '0.75rem', fontWeight: 700 }}>
                        {EXPENSE_TYPE_LABELS[exp.expense_type]?.kh || exp.expense_type}
                      </span>
                    </td>
                    <td className="font-latin font-bold" style={{ color: '#DC2626', fontSize: '1rem', padding: '16px 20px' }}>
                      {formatCurrency(exp.amount, exp.currency)}
                    </td>
                    <td className="font-latin" style={{ color: '#64748B', padding: '16px 20px' }}>{exp.expense_date}</td>
                    <td style={{ color: '#334155', fontWeight: 600, padding: '16px 20px' }}>{exp.vendor_name || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showIncomeModal && (
        <IncomeModal onClose={() => { setShowIncomeModal(false); loadData() }} />
      )}
      {showExpenseModal && (
        <ExpenseModal onClose={() => { setShowExpenseModal(false); loadData() }} />
      )}
    </div>
  )
}

function IncomeModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: '', income_type: 'offering', amount: '', currency: 'KHR', income_date: today(), donor_name: '', description: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await (supabase.from('income') as any).insert({ ...form, amount: Number(form.amount) })
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md">
        <div className="modal-header">
          <h3 className="modal-title">បន្ថែមចំណូល / Add Income</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-3">
            <div className="form-group">
              <label className="form-label">ចំណងជើង <span className="required">*</span></label>
              <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="ឧ. បច្ច័យបូជាបុណ្យ..." />
            </div>
            <div className="grid-cols-2 gap-3" style={{ display: 'grid' }}>
              <div className="form-group">
                <label className="form-label">ប្រភេទចំណូល</label>
                <select className="form-control" value={form.income_type} onChange={e => setForm({...form, income_type: e.target.value})}>
                  {Object.entries(INCOME_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.kh} / {v.en}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ចំនួនទឹកប្រាក់ (រៀល) <span className="required">*</span></label>
                <input className="form-control" type="number" min="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required placeholder="3500000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">សប្បុរសជន / ម្ចាស់ទាន</label>
              <input className="form-control" value={form.donor_name} onChange={e => setForm({...form, donor_name: e.target.value})} placeholder="ឧ. ឧបាសក..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>បោះបង់</button>
            <button type="submit" className="btn btn-success" disabled={loading}>រក្សាទុក / Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ExpenseModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ title: '', expense_type: 'food', amount: '', currency: 'KHR', expense_date: today(), vendor_name: '', description: '' })
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await (supabase.from('expenses') as any).insert({ ...form, amount: Number(form.amount) })
    setLoading(false)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal modal-md">
        <div className="modal-header">
          <h3 className="modal-title">បន្ថែមចំណាយ / Add Expense</h3>
          <button className="btn btn-ghost" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-3">
            <div className="form-group">
              <label className="form-label">ចំណងជើង <span className="required">*</span></label>
              <input className="form-control" value={form.title} onChange={e => setForm({...form, title: e.target.value})} required placeholder="ឧ. ថ្លៃទឹក ភ្លើង..." />
            </div>
            <div className="grid-cols-2 gap-3" style={{ display: 'grid' }}>
              <div className="form-group">
                <label className="form-label">ប្រភេទចំណាយ</label>
                <select className="form-control" value={form.expense_type} onChange={e => setForm({...form, expense_type: e.target.value})}>
                  {Object.entries(EXPENSE_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v.kh} / {v.en}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">ចំនួនទឹកប្រាក់ (រៀល) <span className="required">*</span></label>
                <input className="form-control" type="number" min="0" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} required placeholder="850000" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">អ្នកផ្គត់ផ្គង់ / ហាង</label>
              <input className="form-control" value={form.vendor_name} onChange={e => setForm({...form, vendor_name: e.target.value})} placeholder="EDC, ផ្សារលើ..." />
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>បោះបង់</button>
            <button type="submit" className="btn btn-danger" disabled={loading}>រក្សាទុក / Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}
