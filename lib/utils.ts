import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

// Format Khmer currency (KHR)
export function formatKHR(amount: number): string {
  return new Intl.NumberFormat('km-KH', {
    style: 'currency',
    currency: 'KHR',
    minimumFractionDigits: 0,
  }).format(amount)
}

// Format USD
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount)
}

// Format currency by type
export function formatCurrency(amount: number, currency: string = 'KHR'): string {
  if (currency === 'USD') return formatUSD(amount)
  return formatKHR(amount)
}

// Format date to Khmer-friendly format
export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('km-KH', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return dateStr
  }
}

// Calculate age in years
export function calculateAge(dateOfBirth: string | null): number | null {
  if (!dateOfBirth) return null
  const today = new Date()
  const birth = new Date(dateOfBirth)
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

// Calculate years as monk (vassa)
export function calculateVassa(ordinationDate: string | null): number | null {
  if (!ordinationDate) return null
  const today = new Date()
  const ordination = new Date(ordinationDate)
  return today.getFullYear() - ordination.getFullYear()
}

// Get initials from name
export function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(n => n[0])
    .join('')
    .toUpperCase()
}

// 🌟 Full Official Buddhist Monastery Hierarchy & Ranks (ឋានៈព្រះសង្ឃក្នុងវត្ត)
export const MONK_RANK_LABELS: Record<string, { kh: string; en: string }> = {
  samanera: { kh: 'សាមណេរ', en: 'Novice' },
  bhikkhu: { kh: 'ភិក្ខុ', en: 'Bhikkhu' },
  anukuthi_1: { kh: 'អនុកុដិទី១', en: 'Deputy Kuthi Leader 1' },
  anukuthi_2: { kh: 'អនុកុដិទី២', en: 'Deputy Kuthi Leader 2' },
  chief_monk: { kh: 'ព្រះមេកុដិ', en: 'Kuthi Leader' },
  secretary: { kh: 'លេខាវត្ត', en: 'Pagoda Secretary' },
  vinayadhara: { kh: 'ព្រះវិន័យធរ', en: 'Discipline Master' },
  left_reciter: { kh: 'ព្រះគ្រូសូត្រឆ្វេង', en: 'Left Chanting Master' },
  right_reciter: { kh: 'ព្រះគ្រូសូត្រស្ដាំ', en: 'Right Chanting Master' },
  abbot: { kh: 'ព្រះគ្រូចៅអធិការ', en: 'Abbot (Chief Monk)' },
  teacher: { kh: 'ព្រះគ្រូបង្រៀន / ធម្មាចារ្យ', en: 'Teacher Monk' },
}

// Monk status labels
export const MONK_STATUS_LABELS: Record<string, { kh: string; en: string }> = {
  new: { kh: 'ព្រះសង្ឃថ្មី', en: 'New Monk' },
  existing: { kh: 'ព្រះសង្ឃបច្ចុប្បន្ន', en: 'Current Monk' },
  beginning_of_year: { kh: 'ព្រះសង្ឃដើមឆ្នាំ', en: 'Beginning of Year' },
  elder: { kh: 'ព្រះសង្ឃចាស់', en: 'Elder Monk' },
  left: { kh: 'ព្រះសង្ឃចាកចេញ', en: 'Left' },
}

// Room status labels
export const ROOM_STATUS_LABELS: Record<string, { kh: string; en: string; color: string }> = {
  available: { kh: 'ទំនេរ', en: 'Available', color: 'green' },
  occupied: { kh: 'ពេញ', en: 'Occupied', color: 'red' },
  maintenance: { kh: 'កំពុងជួសជុល', en: 'Under Maintenance', color: 'yellow' },
}

// Attendance status labels
export const ATTENDANCE_STATUS_LABELS: Record<string, { kh: string; en: string; color: string }> = {
  present: { kh: 'មានវត្តមាន', en: 'Present', color: 'green' },
  absent: { kh: 'អវត្តមាន', en: 'Absent', color: 'red' },
  leave: { kh: 'ច្បាប់', en: 'On Leave', color: 'yellow' },
  sick: { kh: 'ឈឺ', en: 'Sick', color: 'orange' },
}

// Income type labels
export const INCOME_TYPE_LABELS: Record<string, { kh: string; en: string }> = {
  offering: { kh: 'បច្ច័យ', en: 'Offering' },
  donation: { kh: 'ជំនួយ', en: 'Donation' },
  merit: { kh: 'បុណ្យ', en: 'Merit Ceremony' },
  grant: { kh: 'ជំនួយរដ្ឋ', en: 'Grant' },
  other: { kh: 'ផ្សេងៗ', en: 'Other' },
}

// Expense type labels
export const EXPENSE_TYPE_LABELS: Record<string, { kh: string; en: string }> = {
  food: { kh: 'អាហារ', en: 'Food' },
  electricity: { kh: 'ភ្លើង', en: 'Electricity' },
  water: { kh: 'ទឹក', en: 'Water' },
  repair: { kh: 'ជួសជុល', en: 'Repair' },
  supplies: { kh: 'សម្ភារៈ', en: 'Supplies' },
  education: { kh: 'ការសិក្សា', en: 'Education' },
  ceremony: { kh: 'ពិធីការ', en: 'Ceremony' },
  other: { kh: 'ផ្សេងៗ', en: 'Other' },
}

// User role labels - Changed Chief Monk to ព្រះមេកុដិ / Kuthi Leader
export const USER_ROLE_LABELS: Record<string, { kh: string; en: string }> = {
  chief_monk: { kh: 'ព្រះមេកុដិ', en: 'Kuthi Leader' },
  admin: { kh: 'អ្នកគ្រប់គ្រង', en: 'Administrator' },
  recorder: { kh: 'អ្នកកត់ត្រា', en: 'Recorder' },
  guest: { kh: 'ភ្ញៀវ/សិស្ស', en: 'Guest' },
}

// Get color class for status
export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    available: 'var(--color-success)',
    occupied: 'var(--color-danger)',
    maintenance: 'var(--color-warning)',
    present: 'var(--color-success)',
    absent: 'var(--color-danger)',
    leave: 'var(--color-warning)',
    sick: 'var(--color-orange)',
    good: 'var(--color-success)',
    damaged: 'var(--color-warning)',
    lost: 'var(--color-danger)',
  }
  return colors[status] || 'var(--color-muted)'
}

// Truncate text
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

// Get current date as ISO string (YYYY-MM-DD)
export function today(): string {
  return new Date().toISOString().split('T')[0]
}

// Get first day of current month
export function firstDayOfMonth(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0]
}

// Get last day of current month
export function lastDayOfMonth(): string {
  const d = new Date()
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0]
}

// Format number with commas
export function formatNumber(n: number): string {
  return n.toLocaleString('km-KH')
}

// Session labels
export const SESSION_LABELS: Record<string, { kh: string; en: string; icon: string }> = {
  morning: { kh: 'ព្រឹក', en: 'Morning', icon: '🌅' },
  afternoon: { kh: 'រសៀល', en: 'Afternoon', icon: '☀️' },
  evening: { kh: 'យប់', en: 'Evening', icon: '🌙' },
}
