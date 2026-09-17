export type UserRole = 'parent' | 'student';

export interface LocationCoordinates {
  lat: number;
  lng: number;
  accuracy?: number; // in meters
  address?: string;
  updatedAt: string;
}

export type GPSPermissionStatus = 'always' | 'while_using' | 'denied' | 'prompt';

export interface Child {
  id: string;
  name: string;
  age: number;
  schoolName: string;
  grade: string; // e.g. "중학교 2학년"
  avatar: string;
  phone: string;
  batteryLevel: number; // 0-100
  isCharging: boolean;
  gpsPermission: GPSPermissionStatus;
  currentLocation: LocationCoordinates;
  pairingCode: string;
  isOnline: boolean;
}

export interface ShuttleInfo {
  enabled: boolean;
  busName: string; // e.g. "노란 1호차"
  driverPhone: string;
  pickupLocation: string;
  pickupTime: string; // "16:20"
  dropoffLocation: string;
  dropoffTime: string; // "19:15"
}

export interface Academy {
  id: string;
  name: string;
  subject: string; // "수학", "영어", "과학", "태권도"
  classroom: string; // "302호"
  color: string; // for UI badge and map pin
  address: string;
  lat: number;
  lng: number;
  geofenceRadius: number; // 50 to 200 meters
  days: number[]; // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
  startTime: string; // "17:00"
  endTime: string; // "19:00"
  teacherName: string;
  teacherContact: string;
  shuttle: ShuttleInfo;
}

export type AttendanceStatus = 'present' | 'late' | 'left' | 'absent' | 'pending' | 'manual_checked';

export interface AttendanceRecord {
  id: string;
  childId: string;
  academyId: string;
  academyName: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkInTime?: string;
  checkOutTime?: string;
  isManual: boolean;
  manualReason?: string;
  geofenceDistance?: number; // distance in meters when recorded
}

export type NotificationType = 'check_in' | 'check_out' | 'warning_late' | 'shuttle' | 'system';

export interface AppNotification {
  id: string;
  childId: string;
  childName: string;
  academyId?: string;
  academyName?: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
}

export interface SchoolClassPeriod {
  period: number;
  subject: string;
  teacher: string;
  room: string;
}

export interface SchoolMealItem {
  date: string;
  mealType: '중식' | '석식';
  menu: string[];
  calories: string;
  originInfo: string;
  allergies: string[];
}

export interface HomeworkItem {
  id: string;
  childId: string;
  academyId: string;
  academyName: string;
  title: string;
  dueDate: string;
  isCompleted: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface SystemSettings {
  batteryOptimization: boolean;
  pushAlertsEnabled: boolean;
  lateWarningMinutes: number; // default 10 minutes
  autoCheckInMinutesBefore: number; // default 30 minutes
  autoCheckOutMinutesAfter: number; // default 30 minutes
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child';
  relation: string; // e.g. "엄마", "아빠", "첫째", "둘째"
  avatar: string;
  color: string;
}

export type EventCategory = 'family' | 'academy' | 'school' | 'medical' | 'exam';

export interface CalendarEvent {
  id: string;
  title: string;
  category: EventCategory;
  date: string; // YYYY-MM-DD
  endDate?: string;
  startTime?: string; // HH:mm
  endTime?: string;
  memberIds: string[]; // which family members are involved
  location?: string;
  description?: string;
  color?: string;
  isSyncedFromAcademy?: boolean;
  academyId?: string;
  isSyncedFromSchool?: boolean;
}

export interface ChatFileAttachment {
  name: string;
  size: string;
  type: 'image' | 'pdf' | 'doc';
  url: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRelation: string;
  senderAvatar: string;
  senderRole: UserRole;
  text: string;
  timestamp: string;
  attachment?: ChatFileAttachment;
  locationShare?: {
    name: string;
    lat: number;
    lng: number;
  };
  readCount: number;
}

