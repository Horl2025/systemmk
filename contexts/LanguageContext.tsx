'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type LanguageCode = 'km' | 'en' | 'zh' | 'vi' | 'th' | 'lo'

export interface LanguageOption {
  code: LanguageCode
  name: string
  nativeName: string
  flag: string
}

export const LANGUAGES: LanguageOption[] = [
  { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', flag: '🇰🇭' },
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧' },
  { code: 'zh', name: 'Chinese', nativeName: '中文 (简体)', flag: '🇨🇳' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'th', name: 'Thai', nativeName: 'ภาษาไทย', flag: '🇹🇭' },
  { code: 'lo', name: 'Lao', nativeName: 'ພາສາລາວ', flag: '🇱🇦' },
]

export const TRANSLATIONS: Record<LanguageCode, Record<string, string>> = {
  km: {
    // Navigation
    dashboard: 'ផ្ទាំងគ្រប់គ្រង',
    monks: 'ព្រះសង្ឃ',
    rooms: 'ទីកន្លែង',
    students: 'សិស្ស',
    idcards: 'កាតសម្គាល់ខ្លួន',
    attendance: 'វត្តមាន',
    schedule: 'កាលវិភាគ',
    finance: 'ហិរញ្ញវត្ថុ',
    inventory: 'សម្ភារៈ',
    reports: 'របាយការណ៍',
    chat: 'ការសន្ទនា',
    settings: 'ការកំណត់',
    // Sections
    sectionMonks: 'ព្រះសង្ឃ',
    sectionActivity: 'សកម្មភាព',
    sectionFinance: 'ហិរញ្ញវត្ថុ',
    sectionConnect: 'ទំនាក់ទំនង',
    sectionSystem: 'ប្រព័ន្ធ',
    // Actions & Common
    save: 'រក្សាទុក',
    saveChanges: 'រក្សាទុកការផ្លាស់ប្ដូរ',
    cancel: 'បោះបង់',
    delete: 'លុប',
    edit: 'កែប្រែ',
    add: 'បន្ថែមថ្មី',
    search: 'ស្វែងរក...',
    scanQR: 'ស្កេន QR',
    exportPDF: 'ទាញយក PDF',
    exportExcel: 'នាំចេញ Excel',
    signOut: 'ចាកចេញ',
    // Settings & Profile
    language: 'ភាសាប្រព័ន្ធ (Language)',
    selectLanguage: 'ជ្រើសរើសភាសាប្រើប្រាស់',
    editProfile: 'កែប្រែព័ត៌មានផ្ទាល់ខ្លួន',
    fullName: 'ឈ្មោះពេញ',
    email: 'អ៊ីមែល',
    password: 'លេខសម្ងាត់',
    dateOfBirth: 'ថ្ងៃខែឆ្នាំកំណើត',
    region: 'រាជធានី / ខេត្ត',
    role: 'តួនាទីក្នុងប្រព័ន្ធ',
    savedSuccess: 'បានរក្សាទុករួចរាល់ ✓',
  },
  en: {
    dashboard: 'Dashboard',
    monks: 'Monks',
    rooms: 'Rooms & Kuthi',
    students: 'Students',
    idcards: 'ID Cards',
    attendance: 'Attendance',
    schedule: 'Schedule',
    finance: 'Finance',
    inventory: 'Inventory',
    reports: 'Reports',
    chat: 'Chat',
    settings: 'Settings',
    // Sections
    sectionMonks: 'Monks',
    sectionActivity: 'Activity',
    sectionFinance: 'Finance',
    sectionConnect: 'Connect',
    sectionSystem: 'System',
    save: 'Save',
    saveChanges: 'Save Changes',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    add: 'Add New',
    search: 'Search...',
    scanQR: 'Scan QR',
    exportPDF: 'Export PDF',
    exportExcel: 'Export Excel',
    signOut: 'Sign Out',
    language: 'System Language',
    selectLanguage: 'Select Display Language',
    editProfile: 'Edit Profile',
    fullName: 'Full Name',
    email: 'Email Address',
    password: 'Password',
    dateOfBirth: 'Date of Birth',
    region: 'Country / Region',
    role: 'System Role',
    savedSuccess: 'Saved Changes ✓',
  },
  zh: {
    dashboard: '仪表板',
    monks: '僧侣管理',
    rooms: '寺院宿舍',
    students: '学生管理',
    attendance: '出勤记录',
    schedule: '日程安排',
    finance: '财务收支',
    inventory: '物资资产',
    reports: '统计报告',
    chat: '内部交流',
    settings: '系统设置',
    save: '保存',
    saveChanges: '保存更改',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    add: '新增',
    search: '搜索...',
    scanQR: '扫描二维码',
    exportPDF: '导出 PDF',
    exportExcel: '导出 Excel',
    signOut: '退出登录',
    language: '系统语言 (Language)',
    selectLanguage: '选择显示语言',
    editProfile: '编辑个人资料',
    fullName: '姓名',
    email: '电子邮件',
    password: '密码',
    dateOfBirth: '出生日期',
    region: '国家 / 地区',
    role: '系统权限',
    savedSuccess: '已成功保存 ✓',
  },
  vi: {
    dashboard: 'Bảng Điều Khiển',
    monks: 'Chư Tăng',
    rooms: 'Khu Tịnh Thất',
    students: 'Học Sinh Chùa',
    attendance: 'Điểm Danh',
    schedule: 'Lịch Sinh Hoạt',
    finance: 'Tài Chính & Thu Chi',
    inventory: 'Vật Tư & Tài Sản',
    reports: 'Báo Cáo Thống Kê',
    chat: 'Trò Chuyện Nội Bộ',
    settings: 'Cài Đặt Hệ Thống',
    save: 'Lưu',
    saveChanges: 'Lưu Thay Đổi',
    cancel: 'Hủy',
    delete: 'Xóa',
    edit: 'Chỉnh Sửa',
    add: 'Thêm Mới',
    search: 'Tìm kiếm...',
    scanQR: 'Quét Mã QR',
    exportPDF: 'Xuất PDF',
    exportExcel: 'Xuất Excel',
    signOut: 'Đăng Xuất',
    language: 'Ngôn Ngữ Hệ Thống',
    selectLanguage: 'Chọn Ngôn Ngữ Hiển Thị',
    editProfile: 'Chỉnh Sửa Hồ Sơ',
    fullName: 'Họ và Tên',
    email: 'Email',
    password: 'Mật Khẩu',
    dateOfBirth: 'Ngày Sinh',
    region: 'Tỉnh / Thành Phố',
    role: 'Vai Trò',
    savedSuccess: 'Đã Lưu Thành Công ✓',
  },
  th: {
    dashboard: 'แดชบอร์ด',
    monks: 'พระภิกษุสามเณร',
    rooms: 'กุฏิและสถานที่',
    students: 'เด็กวัดและนักเรียน',
    attendance: 'เช็คชื่อและกิจวัตร',
    schedule: 'ตารางกิจกรรม',
    finance: 'การเงินและบัญชี',
    inventory: 'พัสดุและครุภัณฑ์',
    reports: 'รายงานสรุป',
    chat: 'แชทภายใน',
    settings: 'ตั้งค่าระบบ',
    save: 'บันทึก',
    saveChanges: 'บันทึกการเปลี่ยนแปลง',
    cancel: 'ยกเลิก',
    delete: 'ลบ',
    edit: 'แก้ไข',
    add: 'เพิ่มใหม่',
    search: 'ค้นหา...',
    scanQR: 'สแกน QR',
    exportPDF: 'ส่งออก PDF',
    exportExcel: 'ส่งออก Excel',
    signOut: 'ออกจากระบบ',
    language: 'ภาษาของระบบ (Language)',
    selectLanguage: 'เลือกภาษาการแสดงผล',
    editProfile: 'แก้ไขโปรไฟล์',
    fullName: 'ชื่อ-นามสกุล',
    email: 'อีเมล',
    password: 'รหัสผ่าน',
    dateOfBirth: 'วันเดือนปีเกิด',
    region: 'จังหวัด / ภูมิภาค',
    role: 'บทบาทในระบบ',
    savedSuccess: 'บันทึกสำเร็จ ✓',
  },
  lo: {
    dashboard: 'ໜ້າຫຼັກ',
    monks: 'ພຣະສົງ-ສາມະເນນ',
    rooms: 'ກຸຕິ ແລະ ສະຖານທີ່',
    students: 'ສິດວັດ ແລະ ນັກຮຽນ',
    attendance: 'ກວດກາວັດທະນະທຳ',
    schedule: 'ຕາຕະລາງກິດຈະກຳ',
    finance: 'ການເງິນ ແລະ ບັນຊີ',
    inventory: 'ວັດຖຸອຸປະກອນ',
    reports: 'ລາຍງານສະຫຼຸບ',
    chat: 'ສົນທະນາພາຍໃນ',
    settings: 'ຕັ້ງຄ່າລະບົບ',
    save: 'ບັນທຶກ',
    saveChanges: 'ບັນທຶກການປ່ຽນແປງ',
    cancel: 'ຍົກເລີກ',
    delete: 'ລຶບ',
    edit: 'ແກ້ໄຂ',
    add: 'ເພີ່ມໃໝ່',
    search: 'ຄົ້ນຫາ...',
    scanQR: 'ສະແກນ QR',
    exportPDF: 'ດາວໂຫຼດ PDF',
    exportExcel: 'ດາວໂຫຼດ Excel',
    signOut: 'ອອກຈາກລະບົບ',
    language: 'ພາສາຂອງລະບົບ (Language)',
    selectLanguage: 'ເລືອກພາສາການສະແດງຜົນ',
    editProfile: 'ແກ້ໄຂໂປຣໄຟລ໌',
    fullName: 'ຊື່ ແລະ ນາມສະກຸນ',
    email: 'ອີເມວ',
    password: 'ລະຫັດຜ່ານ',
    dateOfBirth: 'ວັນເດືອນປີເກີດ',
    region: 'ແຂວງ / ພາກພື້ນ',
    role: 'ບົດບາດໃນລະບົບ',
    savedSuccess: 'ບັນທຶກສຳເລັດ ✓',
  }
}

interface LanguageContextType {
  language: LanguageCode
  setLanguage: (lang: LanguageCode) => void
  t: (key: string, defaultText?: string) => string
  languages: LanguageOption[]
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'km',
  setLanguage: () => {},
  t: (_key: string, defaultText?: string) => defaultText || '',
  languages: LANGUAGES,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>('km')

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('systemmk_language') as LanguageCode
      if (savedLang && ['km', 'en', 'zh', 'vi', 'th', 'lo'].includes(savedLang)) {
        setLanguageState(savedLang)
      }
    } catch {}
  }, [])

  const setLanguage = (lang: LanguageCode) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('systemmk_language', lang)
    } catch {}
  }

  const t = (key: string, defaultText?: string): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.km
    return langDict[key] || TRANSLATIONS.km[key] || defaultText || key
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
