import React, { useState, useEffect } from 'react';
import { 
  Academy, 
  AttendanceRecord, 
  Child, 
  HomeworkItem, 
  AppNotification, 
  UserRole,
  NotificationType,
  SystemSettings,
  FamilyMember,
  CalendarEvent,
  ChatMessage
} from './types';
import { 
  INITIAL_CHILDREN, 
  INITIAL_ACADEMIES, 
  INITIAL_ATTENDANCE_LOGS, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_HOMEWORKS,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_CALENDAR_EVENTS,
  INITIAL_CHAT_MESSAGES,
  MOCK_SCHOOL_TIMETABLE,
  MOCK_SCHOOL_MEAL
} from './mockData';
import { getDistanceMeters, getCurrentTimeStr, formatDistance } from './utils/geo';
import { Navbar, MainAppTab, BgTheme } from './components/Navbar';
import { ChildSelector } from './components/ChildSelector';
import { GeofenceMap } from './components/GeofenceMap';
import { AttendanceCard } from './components/AttendanceCard';
import { TimetableSection } from './components/TimetableSection';
import { HomeworkSection } from './components/HomeworkSection';
import { NotificationDrawer } from './components/NotificationDrawer';
import { ReportModal } from './components/ReportModal';
import { AcademyModal } from './components/AcademyModal';
import { PairingModal } from './components/PairingModal';
import { BackgroundGuideModal } from './components/BackgroundGuideModal';
import { StudentView } from './components/StudentView';
import { FamilyCalendar } from './components/FamilyCalendar';
import { FamilyChat } from './components/FamilyChat';
import { 
  CheckCircle2, 
  Bell, 
  AlertTriangle, 
  Info, 
  X, 
  Sparkles,
  ShieldCheck,
  Calendar,
  MessageCircle,
  MapPin
} from 'lucide-react';

export default function App() {
  const [role, setRole] = useState<UserRole>('parent');
  const [currentTab, setCurrentTab] = useState<MainAppTab>('monitoring');
  const [childrenList, setChildrenList] = useState<Child[]>(INITIAL_CHILDREN);
  const [activeChildId, setActiveChildId] = useState<string>(INITIAL_CHILDREN[0].id);

  const [academies, setAcademies] = useState<Academy[]>(INITIAL_ACADEMIES);
  const [selectedAcademyId, setSelectedAcademyId] = useState<string | null>(INITIAL_ACADEMIES[0].id);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(INITIAL_ATTENDANCE_LOGS);
  const [notifications, setNotifications] = useState<AppNotification[]>(INITIAL_NOTIFICATIONS);
  const [homeworks, setHomeworks] = useState<HomeworkItem[]>(INITIAL_HOMEWORKS);

  // Family Calendar & Group Chat States
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(INITIAL_FAMILY_MEMBERS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(INITIAL_CHAT_MESSAGES);

  const [settings, setSettings] = useState<SystemSettings>({
    batteryOptimization: true,
    pushAlertsEnabled: true,
    lateWarningMinutes: 10,
    autoCheckInMinutesBefore: 30,
    autoCheckOutMinutesAfter: 30,
  });

  // Modal open states
  const [bgTheme, setBgTheme] = useState<BgTheme>('candypop');
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isPairingOpen, setIsPairingOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAcademyModalOpen, setIsAcademyModalOpen] = useState(false);
  const [isBgGuideOpen, setIsBgGuideOpen] = useState(false);

  // Active toast banner for push feedback
  const [activeToast, setActiveToast] = useState<{
    id: string;
    type: NotificationType;
    title: string;
    message: string;
  } | null>(null);

  const activeChild = childrenList.find((c) => c.id === activeChildId) || childrenList[0];
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const showToast = (type: NotificationType, title: string, message: string) => {
    const toastId = String(Date.now());
    setActiveToast({ id: toastId, type, title, message });
    setTimeout(() => {
      setActiveToast((current) => (current?.id === toastId ? null : current));
    }, 4500);
  };

  // Geofence Trigger Engine
  const handleUpdateChildLocation = (lat: number, lng: number, addressDesc?: string) => {
    const nowTime = getCurrentTimeStr();
    const todayStr = new Date().toISOString().split('T')[0];

    // Update active child position in state
    setChildrenList((prev) =>
      prev.map((c) =>
        c.id === activeChildId
          ? {
              ...c,
              currentLocation: {
                ...c.currentLocation,
                lat,
                lng,
                address: addressDesc || c.currentLocation.address,
                updatedAt: '방금 전 (실시간)',
              },
            }
          : c
      )
    );

    // Evaluate geofence status against all academies for this child
    academies.forEach((acad) => {
      const distance = getDistanceMeters(lat, lng, acad.lat, acad.lng);
      const isInside = distance <= acad.geofenceRadius;

      // Existing today's record for this academy
      const existing = attendanceRecords.find(
        (r) => r.childId === activeChild.id && r.academyId === acad.id && r.date === todayStr
      );

      // Condition 1: Enter Geofence -> Auto Check-In
      if (isInside) {
        if (!existing || existing.status === 'pending') {
          const newRecord: AttendanceRecord = {
            id: `att-${Date.now()}`,
            childId: activeChild.id,
            academyId: acad.id,
            academyName: acad.name,
            date: todayStr,
            status: 'present',
            checkInTime: nowTime,
            isManual: false,
            geofenceDistance: distance,
          };

          setAttendanceRecords((prev) => [
            newRecord,
            ...prev.filter((r) => !(r.childId === activeChild.id && r.academyId === acad.id && r.date === todayStr)),
          ]);

          const notifTitle = '📍 10m 초정밀 지오펜싱 자동 등원 완료';
          const notifMsg = `${activeChild.name}이가 [${acad.name}] 10m 출석 영역에 ${nowTime} 정상 진입하여 등원 처리되었습니다.`;

          const newNotif: AppNotification = {
            id: `notif-${Date.now()}`,
            childId: activeChild.id,
            childName: activeChild.name,
            academyId: acad.id,
            academyName: acad.name,
            type: 'check_in',
            title: notifTitle,
            message: notifMsg,
            timestamp: `오늘 ${nowTime}`,
            isRead: false,
          };

          setNotifications((prev) => [newNotif, ...prev]);
          showToast('check_in', notifTitle, notifMsg);

          // Automatically send an automated comfort announcement to the family group chat
          const autoChatMsg: ChatMessage = {
            id: `msg-auto-${Date.now()}`,
            senderId: 'system-bot',
            senderName: '스케줄키즈 안심봇',
            senderRelation: '시스템',
            senderAvatar: 'https://images.unsplash.com/photo-1546776310-eef45dd6d63c?w=150&auto=format&fit=crop&q=80',
            senderRole: 'parent',
            text: `📍 [10m 자동 등원 알림] ${activeChild.name}이가 [${acad.name}] 10m 출석 영역에 ${nowTime} 도착했습니다.`,
            timestamp: nowTime,
            locationShare: {
              name: acad.name,
              lat: acad.lat,
              lng: acad.lng,
            },
            readCount: 3,
          };
          setChatMessages((prev) => [...prev, autoChatMsg]);
        }
      } 
      // Condition 2: Leave Geofence -> Auto Check-Out
      else if (!isInside && existing && (existing.status === 'present' || existing.status === 'manual_checked') && !existing.checkOutTime) {
        if (distance > acad.geofenceRadius + 20) {
          setAttendanceRecords((prev) =>
            prev.map((r) =>
              r.id === existing.id
                ? {
                    ...r,
                    status: 'left',
                    checkOutTime: nowTime,
                  }
                : r
            )
          );

          const notifTitle = '👋 지오펜싱 하원 완료 알림';
          const notifMsg = `${activeChild.name}이가 [${acad.name}] 10m 출석 영역을 벗어나 안전하게 출발했습니다 (${nowTime} 출발).`;

          const newNotif: AppNotification = {
            id: `notif-${Date.now()}`,
            childId: activeChild.id,
            childName: activeChild.name,
            academyId: acad.id,
            academyName: acad.name,
            type: 'check_out',
            title: notifTitle,
            message: notifMsg,
            timestamp: `오늘 ${nowTime}`,
            isRead: false,
          };

          setNotifications((prev) => [newNotif, ...prev]);
          showToast('check_out', notifTitle, notifMsg);
        }
      }
    });
  };

  // Manual check-in handler
  const handleManualCheckIn = (academyId: string, reason: string) => {
    const acad = academies.find((a) => a.id === academyId);
    if (!acad) return;

    const nowTime = getCurrentTimeStr();
    const todayStr = new Date().toISOString().split('T')[0];

    const newRecord: AttendanceRecord = {
      id: `att-man-${Date.now()}`,
      childId: activeChild.id,
      academyId: acad.id,
      academyName: acad.name,
      date: todayStr,
      status: 'manual_checked',
      checkInTime: nowTime,
      isManual: true,
      manualReason: reason,
      geofenceDistance: 0,
    };

    setAttendanceRecords((prev) => [
      newRecord,
      ...prev.filter((r) => !(r.childId === activeChild.id && r.academyId === acad.id && r.date === todayStr)),
    ]);

    const title = '📝 수동 등원 확인 완료';
    const message = `${activeChild.name}이가 [${acad.name}]에 수동 등원 처리되었습니다. (사유: ${reason})`;

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        childId: activeChild.id,
        childName: activeChild.name,
        academyId: acad.id,
        academyName: acad.name,
        type: 'check_in',
        title,
        message,
        timestamp: `오늘 ${nowTime}`,
        isRead: false,
      },
      ...prev,
    ]);

    showToast('check_in', title, message);
  };

  const handleManualCheckOut = (academyId: string) => {
    const acad = academies.find((a) => a.id === academyId);
    if (!acad) return;

    const nowTime = getCurrentTimeStr();
    const todayStr = new Date().toISOString().split('T')[0];

    setAttendanceRecords((prev) =>
      prev.map((r) =>
        r.childId === activeChild.id && r.academyId === academyId && r.date === todayStr
          ? {
              ...r,
              status: 'left',
              checkOutTime: nowTime,
            }
          : r
      )
    );

    const title = '👋 하원 완료 처리';
    const message = `${activeChild.name}이의 [${acad.name}] 하원이 정상 처리되었습니다.`;

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        childId: activeChild.id,
        childName: activeChild.name,
        academyId: acad.id,
        academyName: acad.name,
        type: 'check_out',
        title,
        message,
        timestamp: `오늘 ${nowTime}`,
        isRead: false,
      },
      ...prev,
    ]);

    showToast('check_out', title, message);
  };

  // Test Push notification trigger
  const handleSendTestNotification = (type: NotificationType) => {
    const acad = academies[0];
    const nowTime = getCurrentTimeStr();
    let title = '안심 알림';
    let message = '스케줄키즈 알림 테스트';

    if (type === 'check_in') {
      title = '📍 등원 완료 알림';
      message = `${activeChild.name}이가 [${acad.name}] 지오펜스 영역에 ${nowTime} 정상 도착했습니다.`;
    } else if (type === 'warning_late') {
      title = '⚠️ 지각 위험 경고 알림';
      message = `수업 시작 10분 전이나 아직 [${acad.name}] 반경 350m 외부에 있습니다. 확인이 필요합니다.`;
    } else if (type === 'shuttle') {
      title = '🚌 셔틀 탑승 10분 전 안내';
      message = `노란 1호차가 은마아파트 3동 정문으로 16:30 도착 예정입니다.`;
    }

    setNotifications((prev) => [
      {
        id: `notif-test-${Date.now()}`,
        childId: activeChild.id,
        childName: activeChild.name,
        academyId: acad.id,
        academyName: acad.name,
        type,
        title,
        message,
        timestamp: '방금',
        isRead: false,
      },
      ...prev,
    ]);

    showToast(type, title, message);
  };

  // Add Homework
  const handleAddHomework = (newHw: Omit<HomeworkItem, 'id'>) => {
    setHomeworks((prev) => [
      {
        ...newHw,
        id: `hw-${Date.now()}`,
      },
      ...prev,
    ]);
  };

  const handleToggleHomework = (id: string) => {
    setHomeworks((prev) =>
      prev.map((hw) => (hw.id === id ? { ...hw, isCompleted: !hw.isCompleted } : hw))
    );
  };

  const handleDeleteHomework = (id: string) => {
    setHomeworks((prev) => prev.filter((hw) => hw.id !== id));
  };

  // Add Academy
  const handleSaveAcademy = (newAcad: Academy) => {
    setAcademies((prev) => {
      const idx = prev.findIndex((a) => a.id === newAcad.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = newAcad;
        return copy;
      }
      return [...prev, newAcad];
    });
    setSelectedAcademyId(newAcad.id);

    // Sync into Calendar Events as well!
    const syncEvent: CalendarEvent = {
      id: `ev-sync-${newAcad.id}`,
      title: `${activeChild.name} ${newAcad.name} 수업`,
      category: 'academy',
      date: '2026-09-18',
      startTime: newAcad.startTime,
      endTime: newAcad.endTime,
      memberIds: [activeChild.id, 'mem-mom'],
      location: newAcad.address,
      description: `${newAcad.subject} 수업 (${newAcad.classroom}) - 지오펜스 자동 체크인`,
      color: newAcad.color,
      isSyncedFromAcademy: true,
      academyId: newAcad.id,
    };
    setCalendarEvents((prev) => [syncEvent, ...prev]);

    showToast('system', '학원 등록 완료', `[${newAcad.name}] 지오펜스 및 가족 캘린더 동기화가 완료되었습니다.`);
  };

  // Calendar event handlers
  const handleAddCalendarEvent = (newEvent: CalendarEvent) => {
    setCalendarEvents((prev) => [newEvent, ...prev]);
    showToast('system', '일정 등록 완료', `[${newEvent.title}] 일정이 가족 캘린더에 추가되었습니다.`);
  };

  const handleDeleteCalendarEvent = (id: string) => {
    setCalendarEvents((prev) => prev.filter((ev) => ev.id !== id));
    showToast('system', '일정 삭제', '선택한 일정이 삭제되었습니다.');
  };

  // Family Chat handler
  const handleSendChatMessage = (msg: ChatMessage) => {
    setChatMessages((prev) => [...prev, msg]);
  };

  // Add Child Profile
  const handleAddChild = () => {
    const newName = prompt('추가할 자녀의 이름을 입력하세요:', '이도현');
    if (!newName) return;
    const grade = prompt('학교 및 학년을 입력하세요:', '초등학교 3학년') || '초등학교 3학년';

    const newChildId = `child-${Date.now()}`;
    const newChild: Child = {
      id: newChildId,
      name: newName,
      age: 10,
      schoolName: '서울대치초등학교',
      grade,
      avatar: 'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=150&auto=format&fit=crop&q=80',
      phone: '010-5511-9988',
      batteryLevel: 92,
      isCharging: false,
      gpsPermission: 'always',
      isOnline: true,
      pairingCode: `SK-${Math.floor(1000 + Math.random() * 9000)}`,
      currentLocation: {
        lat: 37.4980,
        lng: 127.0588,
        accuracy: 10,
        address: '서울특별시 강남구 대치동 학원가 인근',
        updatedAt: '방금',
      },
    };

    setChildrenList((prev) => [...prev, newChild]);
    setActiveChildId(newChild.id);

    // Also add to family members list
    setFamilyMembers((prev) => [
      ...prev,
      {
        id: newChildId,
        name: newName,
        role: 'child',
        relation: `${newName} (막내)`,
        avatar: newChild.avatar,
        color: '#F97316',
      },
    ]);

    showToast('system', '자녀 프로필 등록 완료', `${newName}의 안심 계정 및 가족 구성원이 등록되었습니다.`);
  };

  return (
    <div className={`min-h-screen relative flex flex-col font-sans transition-colors duration-500 ${
      bgTheme === 'candypop' ? 'bg-theme-candypop' :
      bgTheme === 'rainbow' ? 'bg-theme-rainbow' :
      bgTheme === 'aurora' ? 'bg-theme-aurora' :
      bgTheme === 'lavender' ? 'bg-theme-lavender' :
      'bg-theme-mintlemon'
    }`}>
      {/* Decorative whimsical floating stickers and doodles in the background */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0">
        {/* Soft polka dot overlay for cute stationery feel */}
        <div className="absolute inset-0 bg-polka-dots opacity-40" />

        {/* Floating colorful icons & doodles */}
        <div className="absolute top-20 left-[5%] text-2xl opacity-40 animate-pulse">✨</div>
        <div className="absolute top-36 right-[8%] text-3xl opacity-35">🍭</div>
        <div className="absolute top-72 left-[2%] text-2xl opacity-35">🌸</div>
        <div className="absolute top-[450px] right-[4%] text-2xl opacity-40">💖</div>
        <div className="absolute bottom-40 left-[7%] text-3xl opacity-35">🌈</div>
        <div className="absolute bottom-24 right-[10%] text-2xl opacity-40">⭐️</div>
        <div className="absolute top-1/2 left-[12%] text-xl opacity-25">🎀</div>
        <div className="absolute bottom-1/3 right-[15%] text-2xl opacity-30">🍀</div>
        <div className="absolute top-28 left-[40%] text-xl opacity-30">☁️</div>

        {/* Ambient colorful light orbs */}
        <div className="absolute top-10 left-1/4 w-96 h-96 rounded-full bg-pink-200/30 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full bg-yellow-200/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-1/3 w-96 h-96 rounded-full bg-indigo-200/30 blur-3xl pointer-events-none" />
      </div>

      {/* Top Fixed Navbar */}
      <Navbar
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        currentRole={role}
        onRoleChange={setRole}
        activeChild={activeChild}
        unreadCount={unreadCount}
        chatMessageCount={chatMessages.length}
        onOpenNotifications={() => setIsNotificationOpen(true)}
        onOpenPairing={() => setIsPairingOpen(true)}
        onOpenReport={() => setIsReportOpen(true)}
        onOpenAddAcademy={() => setIsAcademyModalOpen(true)}
        onOpenBgGuide={() => setIsBgGuideOpen(true)}
        onQuickLocate={() => {}}
        bgTheme={bgTheme}
        onChangeBgTheme={setBgTheme}
      />

      {/* Realtime Toast Popover */}
      {activeToast && (
        <div className="fixed top-20 right-4 sm:right-6 z-50 max-w-sm w-full bg-white rounded-2xl shadow-xl border border-pink-200 p-4 animate-in slide-in-from-top-3 fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-pink-50 text-pink-600 mt-0.5 shrink-0">
              {activeToast.type === 'check_in' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              ) : activeToast.type === 'warning_late' ? (
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              ) : (
                <Bell className="w-5 h-5 text-pink-600" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-xs sm:text-sm text-slate-900 whitespace-nowrap">
                {activeToast.title}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5 leading-relaxed keep-all">
                {activeToast.message}
              </p>
            </div>
            <button
              onClick={() => setActiveToast(null)}
              className="text-slate-400 hover:text-slate-600 p-1 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 relative z-10">
        {/* Child Selector & Mode Switch Banner */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2 whitespace-nowrap">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider whitespace-nowrap keep-all">
              {role === 'parent' ? '학부모 관리 대상 자녀' : '내 프로필'}
            </span>
            <span 
              className="text-xs text-indigo-600 font-bold cursor-pointer hover:underline whitespace-nowrap" 
              onClick={() => setIsPairingOpen(true)}
            >
              + 새 단말기 연동
            </span>
          </div>
          <ChildSelector
            childrenList={childrenList}
            activeChildId={activeChildId}
            onSelectChild={setActiveChildId}
            onAddChild={handleAddChild}
          />
        </div>

        {/* Tab-driven View Switching */}
        {currentTab === 'calendar' ? (
          /* Shared Family Calendar View */
          <FamilyCalendar
            events={calendarEvents}
            familyMembers={familyMembers}
            academies={academies}
            childrenList={childrenList}
            onAddEvent={handleAddCalendarEvent}
            onDeleteEvent={handleDeleteCalendarEvent}
          />
        ) : currentTab === 'chat' ? (
          /* Family Group Chat View */
          <FamilyChat
            messages={chatMessages}
            familyMembers={familyMembers}
            currentRole={role}
            activeChild={activeChild}
            onSendMessage={handleSendChatMessage}
          />
        ) : role === 'student' ? (
          /* Student View */
          <StudentView
            child={activeChild}
            academies={academies}
            todayRecords={attendanceRecords.filter((r) => r.childId === activeChild.id)}
            homeworks={homeworks}
            onManualCheckIn={handleManualCheckIn}
            onToggleHomework={handleToggleHomework}
            onOpenChat={() => setCurrentTab('chat')}
            onOpenCalendar={() => setCurrentTab('calendar')}
            onNotifyParent={(msg) => {
              // Send into chat directly
              const studentMsg: ChatMessage = {
                id: `msg-${Date.now()}`,
                senderId: activeChild.id,
                senderName: activeChild.name,
                senderRelation: '학생',
                senderAvatar: activeChild.avatar,
                senderRole: 'student',
                text: msg,
                timestamp: getCurrentTimeStr(),
                readCount: 1,
              };
              setChatMessages((prev) => [...prev, studentMsg]);
              showToast('system', '부모님께 안심 메시지 전송', msg);
            }}
          />
        ) : (
          /* Parent Live Monitoring & Timetable Dashboard - Timetable as Central Focus */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Primary Center Column (7 cols on desktop, 8 cols on xl): Timetable & Homework */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-5">
              {/* Central Data Centerpiece: Timetable Section */}
              <TimetableSection
                child={activeChild}
                academies={academies}
                attendanceRecords={attendanceRecords}
                schoolTimetable={MOCK_SCHOOL_TIMETABLE}
                schoolMeal={MOCK_SCHOOL_MEAL}
                selectedAcademyId={selectedAcademyId}
                onSelectAcademy={setSelectedAcademyId}
                onManualCheckIn={handleManualCheckIn}
                onManualCheckOut={handleManualCheckOut}
              />

              {/* Homework Checklist */}
              <HomeworkSection
                child={activeChild}
                academies={academies}
                homeworks={homeworks}
                onToggleHomework={handleToggleHomework}
                onAddHomework={handleAddHomework}
                onDeleteHomework={handleDeleteHomework}
              />
            </div>

            {/* Side Column (5 cols on desktop, 4 cols on xl): Compact Geofence Map & Attendance */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-5">
              {/* Compact Geofence Map with 10m Precision */}
              <GeofenceMap
                child={activeChild}
                academies={academies}
                selectedAcademyId={selectedAcademyId}
                onSelectAcademy={setSelectedAcademyId}
                onUpdateChildLocation={handleUpdateChildLocation}
              />

              {/* Attendance Status Card & Manual Check-in */}
              <AttendanceCard
                child={activeChild}
                academies={academies}
                todayRecords={attendanceRecords.filter((r) => r.childId === activeChild.id)}
                currentRole={role}
                onManualCheckIn={handleManualCheckIn}
                onManualCheckOut={handleManualCheckOut}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/80 bg-white py-4 mt-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">스케줄키즈 (ScheduleKids)</span>
            <span>· 위치 기반 자동 등·하원, 가족 캘린더 및 안심 단톡방</span>
          </div>
          <div className="text-slate-400 text-[11px]">
            지오펜싱 인식 정확도 96.2% | NEIS 교육정보 개방포털 연동 | 가족 통합 일정 동기화
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <NotificationDrawer
        isOpen={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        notifications={notifications}
        onMarkAllRead={() =>
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
        }
        onClearAll={() => setNotifications([])}
        onSendTestNotification={handleSendTestNotification}
      />

      <PairingModal
        isOpen={isPairingOpen}
        onClose={() => setIsPairingOpen(false)}
        activeChild={activeChild}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        child={activeChild}
        records={attendanceRecords.filter((r) => r.childId === activeChild.id)}
      />

      <AcademyModal
        isOpen={isAcademyModalOpen}
        onClose={() => setIsAcademyModalOpen(false)}
        onSaveAcademy={handleSaveAcademy}
      />

      <BackgroundGuideModal
        isOpen={isBgGuideOpen}
        onClose={() => setIsBgGuideOpen(false)}
        batteryOptimization={settings.batteryOptimization}
        onToggleBatteryOptimization={() =>
          setSettings((prev) => ({
            ...prev,
            batteryOptimization: !prev.batteryOptimization,
          }))
        }
      />
    </div>
  );
}
