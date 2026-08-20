export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type MonkStatus = 'new' | 'existing' | 'beginning_of_year' | 'elder' | 'left'
export type MonkRank = 
  | 'samanera' 
  | 'bhikkhu' 
  | 'anukuthi_1' 
  | 'anukuthi_2' 
  | 'chief_monk' 
  | 'secretary' 
  | 'vinayadhara' 
  | 'left_reciter' 
  | 'right_reciter' 
  | 'abbot' 
  | 'assistant_chief' 
  | 'teacher'

export type RoomType = 'bhikkhu' | 'samanera' | 'guest' | 'storage' | 'office'
export type RoomStatus = 'available' | 'occupied' | 'maintenance'
export type AttendanceSession = 'morning' | 'afternoon' | 'evening'
export type AttendanceStatus = 'present' | 'absent' | 'leave' | 'sick'
export type LeaveType = 'sick' | 'home' | 'study' | 'other'
export type LeaveStatus = 'pending' | 'approved' | 'rejected'
export type IncomeType = 'offering' | 'donation' | 'merit' | 'grant' | 'other'
export type ExpenseType = 'food' | 'electricity' | 'water' | 'repair' | 'supplies' | 'education' | 'ceremony' | 'other'
export type InventoryStatus = 'good' | 'damaged' | 'lost' | 'disposed'
export type UserRole = 'chief_monk' | 'admin' | 'recorder' | 'guest'
export type HealthStatus = 'good' | 'fair' | 'poor' | 'hospitalized'
export type EducationLevel = 'primary' | 'secondary' | 'dhamma_primary' | 'dhamma_secondary' | 'dhamma_high' | 'bachelor' | 'master' | 'doctorate'

export interface Profile {
  id: string
  full_name: string | null
  display_name: string | null
  avatar_url: string | null
  role: UserRole
  is_active: boolean
  phone: string | null
  email: string | null
  created_at: string
  updated_at: string
}

export interface Monk {
  id: string
  khmer_name: string
  latin_name: string | null
  dhamma_name: string | null
  status: MonkStatus
  rank: MonkRank
  date_of_birth: string | null
  date_of_ordination: string | null
  date_of_higher_ordination: string | null
  home_province: string | null
  home_district: string | null
  home_commune: string | null
  home_village: string | null
  origin_temple: string | null
  health_status: HealthStatus
  health_notes: string | null
  photo_url: string | null
  room_id: string | null
  is_active: boolean
  notes: string | null
  created_at: string
  updated_at: string
  // joined
  room?: Room
}

export interface Kuthi {
  id: string
  name: string
  name_en: string | null
  description: string | null
  floor_count: number
  built_year: number | null
  is_active: boolean
  created_at: string
  updated_at: string
  // joined
  rooms?: Room[]
}

export interface Room {
  id: string
  kuthi_id: string | null
  room_number: string
  room_name: string | null
  room_type: RoomType
  floor: number
  capacity: number
  status: RoomStatus
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
  // joined
  kuthi?: Kuthi
  monks?: Monk[]
}

export interface Student {
  id: string
  khmer_name: string
  latin_name: string | null
  date_of_birth: string | null
  gender: string
  school_name: string | null
  grade_level: string | null
  room_id: string | null
  home_province: string | null
  phone: string | null
  parent_phone: string | null
  photo_url: string | null
  is_active: boolean
  joined_date: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Attendance {
  id: string
  monk_id: string | null
  student_id: string | null
  attendance_date: string
  session: AttendanceSession
  status: AttendanceStatus
  recorded_by: string | null
  notes: string | null
  created_at: string
}

export interface LeaveRequest {
  id: string
  monk_id: string | null
  student_id: string | null
  leave_type: LeaveType
  start_date: string
  end_date: string
  reason: string | null
  status: LeaveStatus
  reviewed_by: string | null
  reviewed_at: string | null
  notes: string | null
  created_at: string
}

export interface Income {
  id: string
  title: string
  income_type: IncomeType
  amount: number
  currency: string
  income_date: string
  donor_name: string | null
  description: string | null
  receipt_url: string | null
  event_id: string | null
  recorded_by: string | null
  created_at: string
  updated_at: string
}

export interface Expense {
  id: string
  title: string
  expense_type: ExpenseType
  amount: number
  currency: string
  expense_date: string
  vendor_name: string | null
  description: string | null
  receipt_url: string | null
  event_id: string | null
  kuthi_id: string | null
  recorded_by: string | null
  created_at: string
  updated_at: string
}

export interface InventoryItem {
  id: string
  category_id: string | null
  name: string
  name_en: string | null
  serial_number: string | null
  quantity: number
  unit: string | null
  status: InventoryStatus
  location: string | null
  purchase_date: string | null
  purchase_price: number | null
  warranty_expiry: string | null
  photo_url: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ChatMessage {
  id: string
  chat_room_id: string
  sender_id: string
  content: string
  message_type: string
  file_url: string | null
  is_edited: boolean
  is_deleted: boolean
  created_at: string
  // joined
  sender?: Profile
}

export interface Notification {
  id: string
  recipient_id: string
  title: string
  body: string | null
  type: string | null
  link: string | null
  is_read: boolean
  created_at: string
}

export interface Event {
  id: string
  title: string
  title_en: string | null
  description: string | null
  event_type: string | null
  start_date: string
  end_date: string | null
  location: string | null
  budget: number | null
  actual_cost: number | null
  status: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile> & { id: string }; Update: Partial<Profile> }
      monks: { Row: Monk; Insert: Partial<Monk> & { khmer_name: string }; Update: Partial<Monk> }
      kuthi: { Row: Kuthi; Insert: Partial<Kuthi> & { name: string }; Update: Partial<Kuthi> }
      rooms: { Row: Room; Insert: Partial<Room> & { room_number: string }; Update: Partial<Room> }
      students: { Row: Student; Insert: Partial<Student> & { khmer_name: string }; Update: Partial<Student> }
      attendance: { Row: Attendance; Insert: Partial<Attendance>; Update: Partial<Attendance> }
      leave_requests: { Row: LeaveRequest; Insert: Partial<LeaveRequest>; Update: Partial<LeaveRequest> }
      income: { Row: Income; Insert: Partial<Income> & { title: string; amount: number }; Update: Partial<Income> }
      expenses: { Row: Expense; Insert: Partial<Expense> & { title: string; amount: number }; Update: Partial<Expense> }
      inventory: { Row: InventoryItem; Insert: Partial<InventoryItem> & { name: string }; Update: Partial<InventoryItem> }
      messages: { Row: ChatMessage; Insert: Partial<ChatMessage> & { content: string; sender_id: string }; Update: Partial<ChatMessage> }
      notifications: { Row: Notification; Insert: Partial<Notification> & { recipient_id: string; title: string }; Update: Partial<Notification> }
      events: { Row: Event; Insert: Partial<Event> & { title: string; start_date: string }; Update: Partial<Event> }
    }
  }
}
