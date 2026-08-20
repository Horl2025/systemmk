-- ============================================================
-- SystemMK: Database Schema (PostgreSQL / Supabase)
-- ============================================================

-- 1. Profiles (User Accounts & Roles)
create table if not exists profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text,
  display_name text,
  avatar_url text,
  role text not null default 'guest' check (role in ('chief_monk', 'admin', 'recorder', 'guest')),
  is_active boolean not null default true,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Kuthi (Monastery Buildings)
create table if not exists kuthi (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_en text,
  description text,
  floor_count integer not null default 1,
  built_year integer,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 3. Rooms
create table if not exists rooms (
  id uuid primary key default gen_random_uuid(),
  kuthi_id uuid references kuthi(id) on delete set null,
  room_number text not null,
  room_name text,
  room_type text not null default 'bhikkhu' check (room_type in ('bhikkhu', 'samanera', 'guest', 'storage', 'office')),
  floor integer not null default 1,
  capacity integer not null default 1,
  status text not null default 'available' check (status in ('available', 'occupied', 'maintenance')),
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Monks
create table if not exists monks (
  id uuid primary key default gen_random_uuid(),
  khmer_name text not null,
  latin_name text,
  dhamma_name text,
  status text not null default 'existing' check (status in ('new', 'existing', 'beginning_of_year', 'elder', 'left')),
  rank text not null default 'samanera' check (rank in ('samanera', 'bhikkhu', 'chief_monk', 'assistant_chief', 'teacher')),
  date_of_birth date,
  date_of_ordination date,
  date_of_higher_ordination date,
  home_province text,
  home_district text,
  home_commune text,
  home_village text,
  origin_temple text,
  health_status text not null default 'good' check (health_status in ('good', 'fair', 'poor', 'hospitalized')),
  health_notes text,
  photo_url text,
  room_id uuid references rooms(id) on delete set null,
  is_active boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 5. Students / Residents
create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  khmer_name text not null,
  latin_name text,
  date_of_birth date,
  gender text not null default 'male',
  school_name text,
  grade_level text,
  room_id uuid references rooms(id) on delete set null,
  home_province text,
  phone text,
  parent_phone text,
  photo_url text,
  is_active boolean not null default true,
  joined_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Attendance
create table if not exists attendance (
  id uuid primary key default gen_random_uuid(),
  monk_id uuid references monks(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  attendance_date date not null default current_date,
  session text not null default 'morning' check (session in ('morning', 'afternoon', 'evening')),
  status text not null default 'present' check (status in ('present', 'absent', 'leave', 'sick')),
  recorded_by uuid references profiles(id) on delete set null,
  notes text,
  created_at timestamptz not null default now()
);

-- 7. Leave Requests
create table if not exists leave_requests (
  id uuid primary key default gen_random_uuid(),
  monk_id uuid references monks(id) on delete cascade,
  student_id uuid references students(id) on delete cascade,
  leave_type text not null default 'home' check (leave_type in ('sick', 'home', 'study', 'other')),
  start_date date not null,
  end_date date not null,
  reason text,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  reviewed_by uuid references profiles(id) on delete set null,
  reviewed_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);

-- 8. Income
create table if not exists income (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  income_type text not null default 'offering' check (income_type in ('offering', 'donation', 'merit', 'grant', 'other')),
  amount numeric(14, 2) not null default 0,
  currency text not null default 'KHR',
  income_date date not null default current_date,
  donor_name text,
  description text,
  receipt_url text,
  event_id uuid,
  recorded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 9. Expenses
create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  expense_type text not null default 'food' check (expense_type in ('food', 'electricity', 'water', 'repair', 'supplies', 'education', 'ceremony', 'other')),
  amount numeric(14, 2) not null default 0,
  currency text not null default 'KHR',
  expense_date date not null default current_date,
  vendor_name text,
  description text,
  receipt_url text,
  event_id uuid,
  kuthi_id uuid references kuthi(id) on delete set null,
  recorded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 10. Inventory
create table if not exists inventory (
  id uuid primary key default gen_random_uuid(),
  category_id text,
  name text not null,
  name_en text,
  serial_number text,
  quantity integer not null default 1,
  unit text default 'គ្រឿង',
  status text not null default 'good' check (status in ('good', 'damaged', 'lost', 'disposed')),
  location text,
  purchase_date date,
  purchase_price numeric(14, 2),
  warranty_expiry date,
  photo_url text,
  notes text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 11. Chat Messages
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  chat_room_id text not null default 'general',
  sender_id uuid references profiles(id) on delete cascade,
  content text not null,
  message_type text not null default 'text',
  file_url text,
  is_edited boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

-- 12. Notifications
create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  recipient_id uuid references profiles(id) on delete cascade,
  title text not null,
  body text,
  type text,
  link text,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 13. Events & Ceremonies
create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  title_en text,
  description text,
  event_type text,
  start_date date not null,
  end_date date,
  location text,
  budget numeric(14, 2),
  actual_cost numeric(14, 2),
  status text not null default 'upcoming',
  created_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
