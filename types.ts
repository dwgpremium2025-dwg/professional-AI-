
export enum Language {
  EN = 'EN',
  TH = 'TH'
}

export enum Role {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER'
}

export interface User {
  id: string;
  username: string;
  role: Role;
  expiryDate?: string; // ISO Date string
  isActive: boolean;
  sessionToken?: string; // For validating active sessions
}

export interface ImageState {
  data: string; // Base64
  mimeType: string;
  id: string;
  timestamp: number;
}

export interface PresetCategory {
  name: string;
  prompts: { label: string; value: string }[];
}

// Translation keys
export type TranslationKey = 
  | 'appTitle'
  | 'login'
  | 'username'
  | 'password'
  | 'generate'
  | 'mainPrompt'
  | 'refinePrompt'
  | 'uploadRef'
  | 'download'
  | 'upscale4k'
  | 'reset'
  | 'newProject'
  | 'presets'
  | 'modern'
  | 'adminPanel'
  | 'addUser'
  | 'expiry'
  | 'shareId'
  | 'logout'
  | 'undo'
  | 'redo'
  | 'remove'
  | 'deleteUser'
  | 'confirmDelete'
  | 'imageStyle'
  | 'stylePhoto'
  | 'styleOil'
  | 'stylePencil'
  | 'styleMagic'
  | 'styleColorPencil';

export const DICTIONARY: Record<Language, Record<TranslationKey, string>> = {
  [Language.EN]: {
    appTitle: 'Professional AI',
    login: 'Login',
    username: 'Username',
    password: 'Password',
    generate: 'GENERATE IMAGE',
    mainPrompt: 'Main Prompt',
    refinePrompt: 'Refine / Additional Prompt',
    uploadRef: 'Upload Reference Image',
    download: 'Download',
    upscale4k: 'Upscale 4K',
    reset: 'Reset to Original',
    newProject: 'New Project',
    presets: 'Style Presets',
    modern: 'Architectural Styles',
    adminPanel: 'Admin Panel',
    addUser: 'Add Member',
    expiry: 'Expiry Date',
    shareId: 'Share Link',
    logout: 'Logout',
    undo: 'Undo',
    redo: 'Redo',
    remove: 'Remove',
    deleteUser: 'Delete',
    confirmDelete: 'Are you sure you want to delete this user?',
    imageStyle: 'Image Style',
    stylePhoto: 'Photograph',
    styleOil: 'Oil Painting',
    stylePencil: 'Pencil Sketch',
    styleMagic: 'Magic Marker',
    styleColorPencil: 'Colored Pencil'
  },
  [Language.TH]: {
    appTitle: 'Professional AI',
    login: 'เข้าสู่ระบบ',
    username: 'ชื่อผู้ใช้',
    password: 'รหัสผ่าน',
    generate: 'สร้างรูปภาพ',
    mainPrompt: 'คำสั่งหลัก (Prompt)',
    refinePrompt: 'คำสั่งเพิ่มเติม',
    uploadRef: 'อัพโหลดรูปภาพอ้างอิง',
    download: 'ดาวน์โหลด',
    upscale4k: 'สร้างภาพ 4K',
    reset: 'รีเซทรูปภาพ',
    newProject: 'สร้างโปรเจคใหม่',
    presets: 'รูปแบบสำเร็จรูป',
    modern: 'สไตล์สถาปัตยกรรม',
    adminPanel: 'จัดการสมาชิก',
    addUser: 'เพิ่มสมาชิก',
    expiry: 'วันหมดอายุ',
    shareId: 'แชร์ลิ้งค์',
    logout: 'ออกจากระบบ',
    undo: 'ย้อนกลับ',
    redo: 'ทำซ้ำ',
    remove: 'ลบรูปภาพ',
    deleteUser: 'ลบ',
    confirmDelete: 'คุณแน่ใจหรือไม่ที่จะลบสมาชิกนี้?',
    imageStyle: 'สไตล์ภาพ',
    stylePhoto: 'ภาพถ่าย',
    styleOil: 'ภาพสีน้ำมัน',
    stylePencil: 'ภาพดินสอ',
    styleMagic: 'ภาพสีเมจิก',
    styleColorPencil: 'ภาพสีไม้'
  }
};
