import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Battery, 
  BatteryCharging, 
  MapPin, 
  Bell, 
  QrCode, 
  BarChart3, 
  Smartphone, 
  Plus, 
  UserCheck, 
  HelpCircle,
  Radio,
  Calendar,
  MessageCircle,
  Palette,
  Sparkles
} from 'lucide-react';
import { Child, UserRole, AppNotification } from '../types';

export type MainAppTab = 'monitoring' | 'calendar' | 'chat';
export type BgTheme = 'candypop' | 'rainbow' | 'aurora' | 'lavender' | 'mintlemon';

interface NavbarProps {
  currentTab: MainAppTab;
  onTabChange: (tab: MainAppTab) => void;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  activeChild: Child;
  unreadCount: number;
  chatMessageCount: number;
  onOpenNotifications: () => void;
  onOpenPairing: () => void;
  onOpenReport: () => void;
  onOpenAddAcademy: () => void;
  onOpenBgGuide: () => void;
  onQuickLocate: () => void;
  bgTheme?: BgTheme;
  onChangeBgTheme?: (theme: BgTheme) => void;
}

const THEME_OPTIONS: { id: BgTheme; label: string; icon: string; dotColor: string }[] = [
  { id: 'candypop', label: '알록달록 캔디팝', icon: '🍭', dotColor: 'bg-pink-400' },
  { id: 'rainbow', label: '무지개 파스텔', icon: '🌈', dotColor: 'bg-amber-400' },
  { id: 'aurora', label: '오로라 드림', icon: '🦄', dotColor: 'bg-purple-400' },
  { id: 'lavender', label: '스위트 라벤더', icon: '🌸', dotColor: 'bg-indigo-400' },
  { id: 'mintlemon', label: '상큼 민트레몬', icon: '🍋', dotColor: 'bg-emerald-400' },
];

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  currentRole,
  onRoleChange,
  activeChild,
  unreadCount,
  chatMessageCount,
  onOpenNotifications,
  onOpenPairing,
  onOpenReport,
  onOpenAddAcademy,
  onOpenBgGuide,
  onQuickLocate,
  bgTheme = 'candypop',
  onChangeBgTheme,
}) => {
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-pink-200/50 shadow-xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand Logo & Name */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div 
              onClick={() => onTabChange('monitoring')}
              className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-pink-200 cursor-pointer shrink-0 transition-transform hover:scale-105"
            >
              <ShieldCheck className="w-6 h-6 shrink-0" />
            </div>
            <div className="whitespace-nowrap shrink-0">
              <div className="flex items-center gap-1.5">
                <span 
                  onClick={() => onTabChange('monitoring')}
                  className="font-bold text-lg tracking-tight text-slate-900 cursor-pointer whitespace-nowrap"
                >
                  스케줄키즈
                </span>
                <span className="text-[11px] px-2 py-0.5 rounded-full font-bold bg-pink-100/90 text-pink-700 border border-pink-200/80 hidden sm:inline-block whitespace-nowrap">
                  ScheduleKids
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block whitespace-nowrap keep-all">
                위치 기반 지오펜싱 등·하원 안심 케어
              </p>
            </div>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-white/85 backdrop-blur-sm p-1 rounded-2xl border border-slate-200/90 text-xs shadow-xs shrink-0">
            <button
              id="nav-tab-monitoring"
              onClick={() => onTabChange('monitoring')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition font-bold whitespace-nowrap shrink-0 ${
                currentTab === 'monitoring'
                  ? 'bg-gradient-to-r from-pink-500 to-indigo-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">출석·동선 모니터링</span>
            </button>

            <button
              id="nav-tab-calendar"
              onClick={() => onTabChange('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition font-bold whitespace-nowrap shrink-0 ${
                currentTab === 'calendar'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">가족 캘린더</span>
            </button>

            <button
              id="nav-tab-chat"
              onClick={() => onTabChange('chat')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition font-bold whitespace-nowrap shrink-0 relative ${
                currentTab === 'chat'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">가족 단톡방</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            </button>
          </nav>

          {/* Child Realtime Device Status Indicator */}
          <div className="hidden xl:flex items-center gap-2.5 bg-white/80 backdrop-blur-sm px-3.5 py-1.5 rounded-2xl border border-pink-100/80 text-xs shadow-xs whitespace-nowrap shrink-0">
            <div className="flex items-center gap-1.5 text-slate-700 whitespace-nowrap shrink-0">
              <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse shrink-0" />
              <span className="font-bold text-slate-800 whitespace-nowrap">{activeChild.name}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-medium whitespace-nowrap">{activeChild.grade}</span>
            </div>

            <div className="h-3 w-px bg-slate-200 shrink-0" />

            {/* GPS State */}
            <div 
              onClick={onOpenBgGuide}
              className="flex items-center gap-1 text-emerald-700 font-bold whitespace-nowrap shrink-0 cursor-pointer hover:underline"
              title="백그라운드 위치 수신: 항상 허용 (터치하여 가이드 확인)"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="whitespace-nowrap">GPS 항상허용</span>
            </div>

            <div className="h-3 w-px bg-slate-200 shrink-0" />

            {/* Battery */}
            <div className="flex items-center gap-1 text-slate-700 whitespace-nowrap shrink-0">
              {activeChild.isCharging ? (
                <BatteryCharging className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <Battery className={`w-4 h-4 shrink-0 ${activeChild.batteryLevel < 20 ? 'text-rose-500' : 'text-slate-600'}`} />
              )}
              <span className={`font-semibold whitespace-nowrap ${activeChild.batteryLevel < 20 ? 'text-rose-600 font-bold' : ''}`}>
                {activeChild.batteryLevel}%
              </span>
            </div>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Colorful Background Theme Picker Button */}
            {onChangeBgTheme && (
              <div className="relative">
                <button
                  id="btn-toggle-bg-theme"
                  onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                  title="알록달록 배경화면 테마 변경"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-pink-200 bg-pink-50/80 hover:bg-pink-100 text-pink-700 text-xs font-bold transition shadow-xs whitespace-nowrap shrink-0"
                >
                  <Palette className="w-3.5 h-3.5 text-pink-500 shrink-0" />
                  <span className="hidden lg:inline whitespace-nowrap">배경 테마</span>
                  <span className="text-[10px]">✨</span>
                </button>

                {isThemeMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-pink-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="text-[11px] font-bold text-slate-400 px-2.5 py-1 uppercase tracking-wider">
                      알록달록 배경 테마
                    </div>
                    {THEME_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          onChangeBgTheme(opt.id);
                          setIsThemeMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold transition ${
                          bgTheme === opt.id
                            ? 'bg-pink-50 text-pink-700 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <span>{opt.icon}</span>
                          <span>{opt.label}</span>
                        </span>
                        {bgTheme === opt.id && (
                          <span className="w-2 h-2 rounded-full bg-pink-500" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Mode Switcher Toggle */}
            <div className="bg-slate-100/90 p-0.5 rounded-xl flex items-center border border-slate-200 text-xs font-medium whitespace-nowrap shrink-0">
              <button
                id="toggle-role-parent"
                onClick={() => onRoleChange('parent')}
                className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  currentRole === 'parent'
                    ? 'bg-white text-indigo-700 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                학부모 모드
              </button>
              <button
                id="toggle-role-student"
                onClick={() => onRoleChange('student')}
                className={`px-2.5 py-1 rounded-lg transition-all whitespace-nowrap shrink-0 ${
                  currentRole === 'student'
                    ? 'bg-white text-pink-600 shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                자녀(학생) 뷰
              </button>
            </div>

            {/* Add Academy Button (Parent) */}
            {currentRole === 'parent' && (
              <button
                id="btn-add-academy"
                onClick={onOpenAddAcademy}
                className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 active:scale-95 text-white rounded-xl text-xs font-bold transition shadow-xs whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap">학원 등록</span>
              </button>
            )}

            {/* Device Pairing QR */}
            <button
              id="btn-open-pairing"
              onClick={onOpenPairing}
              title="자녀 단말기 연동 (QR / 초대코드)"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition relative border border-slate-200/80 shrink-0"
            >
              <QrCode className="w-4 h-4 shrink-0" />
            </button>

            {/* Attendance Report & KPI */}
            <button
              id="btn-open-report"
              onClick={onOpenReport}
              title="출석 통계 및 KPI 분석 리포트"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition relative border border-slate-200/80 shrink-0"
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
            </button>

            {/* Notification Center */}
            <button
              id="btn-open-notifications"
              onClick={onOpenNotifications}
              title="알림 센터"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition relative border border-slate-200/80 shrink-0"
            >
              <Bell className="w-4 h-4 shrink-0" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => onTabChange('monitoring')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl font-bold whitespace-nowrap shrink-0 ${
              currentTab === 'monitoring' ? 'text-indigo-700 bg-indigo-50 border border-indigo-100' : 'text-slate-600'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">출석·모니터링</span>
          </button>
          <button
            onClick={() => onTabChange('calendar')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl font-bold whitespace-nowrap shrink-0 ${
              currentTab === 'calendar' ? 'text-purple-700 bg-purple-50 border border-purple-100' : 'text-slate-600'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">가족 캘린더</span>
          </button>
          <button
            onClick={() => onTabChange('chat')}
            className={`flex items-center gap-1 py-1.5 px-2.5 rounded-xl font-bold whitespace-nowrap shrink-0 ${
              currentTab === 'chat' ? 'text-emerald-700 bg-emerald-50 border border-emerald-100' : 'text-slate-600'
            }`}
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="whitespace-nowrap">가족 단톡방</span>
          </button>
        </div>
      </div>
    </header>
  );
};


