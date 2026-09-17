import React, { useState } from 'react';
import { Academy, AttendanceRecord, Child, SchoolClassPeriod, SchoolMealItem } from '../types';
import { 
  Calendar, 
  Clock, 
  Utensils, 
  GraduationCap, 
  Bus, 
  MapPin, 
  Flame, 
  AlertCircle, 
  BookOpen, 
  CheckCircle2, 
  Phone, 
  CheckCheck, 
  Sparkles, 
  ChevronRight, 
  ArrowRight,
  Filter,
  Layers,
  Compass
} from 'lucide-react';
import { KOREAN_DAYS, formatDistance, getDistanceMeters } from '../utils/geo';

interface TimetableSectionProps {
  child: Child;
  academies: Academy[];
  attendanceRecords: AttendanceRecord[];
  schoolTimetable: SchoolClassPeriod[];
  schoolMeal: SchoolMealItem;
  selectedAcademyId: string | null;
  onSelectAcademy: (academyId: string) => void;
  onManualCheckIn: (academyId: string, reason: string) => void;
  onManualCheckOut: (academyId: string) => void;
}

export const TimetableSection: React.FC<TimetableSectionProps> = ({
  child,
  academies,
  attendanceRecords,
  schoolTimetable,
  schoolMeal,
  selectedAcademyId,
  onSelectAcademy,
  onManualCheckIn,
  onManualCheckOut,
}) => {
  const [activeTab, setActiveTab] = useState<'timeline' | 'weekly' | 'neis'>('timeline');
  const [timelineFilter, setTimelineFilter] = useState<'all' | 'academy' | 'school_shuttle'>('all');
  const [manualModalAcademyId, setManualModalAcademyId] = useState<string | null>(null);
  const [manualReason, setManualReason] = useState('실내 교실 진입 및 GPS 수신 지연 대면 확인');

  // Days 1-6 (Mon-Sat) for weekly grid
  const weekDays = [1, 2, 3, 4, 5, 6];

  // Calculate today's status metrics
  const todayRecords = attendanceRecords.filter((r) => r.childId === child.id);
  const attendedCount = todayRecords.filter((r) => r.status === 'present' || r.status === 'manual_checked').length;
  const totalAcademies = academies.length;

  // Active / next class identification
  const activeClass = academies.find((a) => {
    const rec = todayRecords.find((r) => r.academyId === a.id);
    return rec?.status === 'present' || rec?.status === 'manual_checked';
  }) || academies[0];

  const handleConfirmManualCheckIn = () => {
    if (manualModalAcademyId) {
      onManualCheckIn(manualModalAcademyId, manualReason);
      setManualModalAcademyId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden flex flex-col">
      {/* Hero Header: Timetable as the Central Command Center */}
      <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold backdrop-blur-xs flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-300" />
                오늘의 데이터 중심 통합 시간표
              </span>
              <span className="text-indigo-200 text-xs font-medium">
                2026.09.17 (목요일)
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight mt-1 flex items-center gap-2">
              <span>{child.name}의 하루 일정 & 출석 타임라인</span>
            </h2>
          </div>

          {/* Today's Attendance Counter & Progress */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-xs px-3.5 py-2 rounded-xl border border-white/10 self-start sm:self-auto">
            <div className="text-right">
              <div className="text-[10px] text-indigo-200 font-medium">오늘 학원 등원율</div>
              <div className="text-sm font-bold text-white">
                {attendedCount} / {totalAcademies}개 완료
              </div>
            </div>
            <div className="w-9 h-9 rounded-full bg-indigo-500/30 border-2 border-indigo-400 flex items-center justify-center font-black text-xs text-white">
              {totalAcademies > 0 ? Math.round((attendedCount / totalAcademies) * 100) : 100}%
            </div>
          </div>
        </div>

        {/* Live Active Schedule Status Pill */}
        <div className="mt-4 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-indigo-200">현재 상태:</span>
            <span className="font-bold text-white">
              {attendedCount > 0 
                ? `[${activeClass?.name || '학원'}] 수업 진행 중 (반경 10m 등원 완료)` 
                : `[${academies[0]?.name || '학원'}] 수업 준비 중 (등원 대기)`}
            </span>
          </div>

          <div className="flex items-center gap-1 text-[11px] text-indigo-200 bg-white/10 px-2.5 py-1 rounded-lg">
            <Clock className="w-3.5 h-3.5 text-indigo-300" />
            <span>다음 셔틀/귀가 예정: 19:20 은마아파트 3동</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="px-4 pt-3 pb-2 border-b border-slate-100 bg-slate-50/60 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs font-semibold">
          <button
            id="tab-today-timeline"
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>오늘 동선 타임라인</span>
          </button>
          <button
            id="tab-weekly-grid"
            onClick={() => setActiveTab('weekly')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'weekly'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>주간 학원 시간표</span>
          </button>
          <button
            id="tab-neis-school"
            onClick={() => setActiveTab('neis')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'neis'
                ? 'bg-white text-indigo-700 font-bold shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
            <span>나이스(NEIS) 학교·급식</span>
          </button>
        </div>

        {/* Timeline Filter Pills (Only visible in Timeline tab) */}
        {activeTab === 'timeline' && (
          <div className="flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <Filter className="w-3 h-3 text-slate-400" />
            <button
              onClick={() => setTimelineFilter('all')}
              className={`px-2 py-1 rounded-md transition ${
                timelineFilter === 'all'
                  ? 'bg-indigo-100 text-indigo-800 font-bold'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setTimelineFilter('academy')}
              className={`px-2 py-1 rounded-md transition ${
                timelineFilter === 'academy'
                  ? 'bg-indigo-100 text-indigo-800 font-bold'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              학원 수업만
            </button>
            <button
              onClick={() => setTimelineFilter('school_shuttle')}
              className={`px-2 py-1 rounded-md transition ${
                timelineFilter === 'school_shuttle'
                  ? 'bg-indigo-100 text-indigo-800 font-bold'
                  : 'hover:bg-slate-200/70 text-slate-600'
              }`}
            >
              학교·셔틀
            </button>
          </div>
        )}
      </div>

      {/* Tab 1: Enhanced Today Timeline Flow */}
      {activeTab === 'timeline' && (
        <div className="p-4 sm:p-5 space-y-4">
          <div className="relative pl-6 sm:pl-8 space-y-5 before:absolute before:left-2 sm:before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
            {/* Step 1: School (Shown if 'all' or 'school_shuttle') */}
            {(timelineFilter === 'all' || timelineFilter === 'school_shuttle') && (
              <div className="relative group">
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full bg-blue-100 border-2 border-blue-600 flex items-center justify-center">
                  <GraduationCap className="w-2.5 h-2.5 text-blue-600" />
                </div>
                <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-blue-800 bg-blue-100/80 px-2 py-0.5 rounded-md border border-blue-200">
                        학교 정규 수업
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">
                        {child.schoolName} ({child.grade})
                      </h4>
                    </div>
                    <span className="text-xs text-slate-600 font-bold bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                      08:40 ~ 15:10
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2">
                    1~6교시 수업 (국어, 영어, 수학, 과학, 체육, 역사) 및 학교 점심 급식 완료
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between text-[11px] text-slate-500">
                    <span className="text-emerald-700 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      정규 하교 완료 (15:10)
                    </span>
                    <button
                      onClick={() => setActiveTab('neis')}
                      className="text-blue-600 hover:underline font-semibold flex items-center gap-0.5"
                    >
                      <span>학교 시간표 & 급식 상세 보기</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Shuttle Transfer (if enabled) */}
            {(timelineFilter === 'all' || timelineFilter === 'school_shuttle') && (
              <div className="relative group">
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full bg-amber-100 border-2 border-amber-600 flex items-center justify-center">
                  <Bus className="w-2.5 h-2.5 text-amber-600" />
                </div>
                <div className="p-4 rounded-xl border border-amber-200/90 bg-amber-50/40">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                        학원 셔틀 이동 동선
                      </span>
                      <h4 className="font-bold text-sm text-slate-900">
                        노란 1호차 탑승 (은마아파트 3동 정문 앞)
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-md border border-amber-300">
                      16:30 탑승
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5 bg-white/70 p-2 rounded-lg border border-amber-100">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>도착 예정: 16:45 (수업 시작 15분 전)</span>
                    </div>
                    <div className="flex items-center justify-between bg-white/70 p-2 rounded-lg border border-amber-100">
                      <span className="text-slate-700 font-medium">기사님: 010-3321-7712</span>
                      <a
                        href="tel:010-3321-7712"
                        className="text-[11px] text-amber-800 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Phone className="w-3 h-3" />
                        <span>통화</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Academies (The Core Data Cards with 10m Geofencing) */}
            {(timelineFilter === 'all' || timelineFilter === 'academy') && academies.map((acad) => {
              const record = todayRecords.find((r) => r.academyId === acad.id);
              const distance = getDistanceMeters(
                child.currentLocation.lat,
                child.currentLocation.lng,
                acad.lat,
                acad.lng
              );
              const isInside = distance <= acad.geofenceRadius; // 10m
              const isSelected = acad.id === selectedAcademyId;

              const isPresent = record?.status === 'present';
              const isManual = record?.status === 'manual_checked';
              const isLeft = record?.status === 'left';

              return (
                <div key={acad.id} className="relative group">
                  {/* Timeline Node Bullet */}
                  <div
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center shadow-xs transition-transform ${
                      isSelected ? 'ring-2 ring-indigo-600 scale-110' : ''
                    }`}
                    style={{ backgroundColor: acad.color }}
                  >
                    <Clock className="w-2.5 h-2.5 text-white" />
                  </div>

                  {/* Main Academy Schedule Card */}
                  <div
                    className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                      isPresent || isManual
                        ? 'bg-emerald-50/50 border-emerald-300 ring-1 ring-emerald-200'
                        : isLeft
                        ? 'bg-slate-50/80 border-slate-200 opacity-90'
                        : isSelected
                        ? 'bg-indigo-50/40 border-indigo-300 ring-2 ring-indigo-200'
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Subject Pill + Time + 10m Attendance Status Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-xs font-bold px-2.5 py-1 rounded-lg text-white shadow-2xs"
                          style={{ backgroundColor: acad.color }}
                        >
                          {acad.subject}
                        </span>
                        <h3 className="font-extrabold text-base text-slate-900">
                          {acad.name}
                        </h3>
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                          {acad.classroom}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs font-black text-indigo-950 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{acad.startTime} ~ {acad.endTime}</span>
                        </span>
                      </div>
                    </div>

                    {/* Middle Row: 10m Geofencing Real-time Status Banner */}
                    <div className="my-3 p-3 rounded-xl bg-white border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isPresent ? (
                          <div className="flex items-center gap-1.5 text-emerald-800 text-xs font-bold">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            <span>반경 10m 진입 완료 · 자동 등원 처리 ({record.checkInTime})</span>
                          </div>
                        ) : isManual ? (
                          <div className="flex items-center gap-1.5 text-teal-800 text-xs font-bold">
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            <span>수동 등원 확인 완료 ({record.checkInTime} · {record.manualReason})</span>
                          </div>
                        ) : isLeft ? (
                          <div className="flex items-center gap-1.5 text-slate-700 text-xs font-bold">
                            <CheckCheck className="w-4 h-4 text-slate-600" />
                            <span>수업 종료 및 하원 완료 ({record.checkOutTime})</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-slate-700 text-xs">
                            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>
                              현재 자녀와 거리: <strong className="text-slate-900">{formatDistance(distance)}</strong>
                              <span className="text-slate-400 ml-1">(출석 기준: 반경 10m)</span>
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Quick Attendance Action Buttons inside Timetable */}
                      <div className="flex items-center gap-1.5">
                        {/* Map Focus Button */}
                        <button
                          onClick={() => onSelectAcademy(acad.id)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border font-semibold transition flex items-center gap-1 ${
                            isSelected
                              ? 'bg-indigo-600 text-white border-indigo-600'
                              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                          }`}
                          title="미니맵에서 이 학원의 10m 출석 반경을 확인합니다"
                        >
                          <Compass className="w-3.5 h-3.5" />
                          <span>10m 맵 확인</span>
                        </button>

                        {/* Manual Check-in Button if pending */}
                        {!record && (
                          <button
                            onClick={() => setManualModalAcademyId(acad.id)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 font-bold transition flex items-center gap-1 shadow-2xs"
                            title="GPS 음영 또는 실내 시 수동 등원 처리"
                          >
                            <CheckCheck className="w-3.5 h-3.5 text-indigo-600" />
                            <span>수동 등원</span>
                          </button>
                        )}

                        {/* Manual Checkout Button if present */}
                        {(isPresent || isManual) && (
                          <button
                            onClick={() => onManualCheckOut(acad.id)}
                            className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition"
                            title="하원 완료 처리"
                          >
                            하원 처리
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Bottom Details Row: Address, Teacher, Shuttle */}
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 pt-1">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate max-w-[280px]">{acad.address}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-700 font-medium">
                          {acad.teacherName} ({acad.teacherContact})
                        </span>
                        {acad.shuttle.enabled && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-100/70 text-amber-800 text-[11px] font-semibold flex items-center gap-1">
                            <Bus className="w-3 h-3" />
                            <span>{acad.shuttle.busName.split(' ')[0]}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* Step 4: Safe Return Home (Shown if 'all' or 'school_shuttle') */}
            {(timelineFilter === 'all' || timelineFilter === 'school_shuttle') && (
              <div className="relative group">
                <div className="absolute -left-6 sm:-left-8 top-1.5 w-5 h-5 rounded-full bg-emerald-100 border-2 border-emerald-600 flex items-center justify-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                </div>
                <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs">
                  <div>
                    <h4 className="font-bold text-slate-900">귀가 완료 알림</h4>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      학원 수업 종료 후 집 반경 진입 시 부모님께 안심 도착 알림 전송
                    </p>
                  </div>
                  <span className="font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    19:30 예정
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: High-Density Weekly Grid */}
      {activeTab === 'weekly' && (
        <div className="p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3 text-xs text-slate-500">
            <span>월요일부터 토요일까지 정규 주간 학원 시간표 매트릭스</span>
            <span className="text-indigo-600 font-medium">총 주간 수업: {academies.reduce((acc, a) => acc + a.days.length, 0)}회</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
            {weekDays.map((dayNum) => {
              const dayName = KOREAN_DAYS[dayNum];
              const dayAcademies = academies.filter((a) => a.days.includes(dayNum));
              const isToday = new Date().getDay() === dayNum;

              return (
                <div
                  key={dayNum}
                  className={`border rounded-xl p-3 flex flex-col h-full min-h-[180px] transition-all ${
                    isToday
                      ? 'bg-indigo-50/60 border-indigo-300 ring-2 ring-indigo-200'
                      : 'bg-slate-50/70 border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/80 mb-2">
                    <div className="flex items-center gap-1">
                      <span className="font-black text-xs text-slate-900">
                        {dayName}요일
                      </span>
                      {isToday && (
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold bg-white px-1.5 py-0.2 rounded border border-slate-200">
                      {dayAcademies.length}개
                    </span>
                  </div>

                  <div className="space-y-2 flex-1">
                    {dayAcademies.length === 0 ? (
                      <div className="text-[11px] text-slate-400 text-center py-8">
                        수업 없음
                      </div>
                    ) : (
                      dayAcademies.map((acad) => (
                        <div
                          key={acad.id}
                          onClick={() => onSelectAcademy(acad.id)}
                          className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-2xs text-[11px] cursor-pointer hover:border-indigo-300 transition"
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: acad.color }}
                            />
                            <span className="font-black text-slate-900 truncate">
                              {acad.name}
                            </span>
                          </div>
                          <div className="text-indigo-700 font-bold">
                            {acad.startTime} ~ {acad.endTime}
                          </div>
                          <div className="text-slate-500 text-[10px] mt-0.5">
                            {acad.subject} · {acad.classroom}
                          </div>
                          <div className="text-[10px] text-emerald-700 font-semibold mt-1">
                            10m 출석 반경
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: NEIS School Timetable & Meal Data */}
      {activeTab === 'neis' && (
        <div className="p-4 sm:p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* School Timetable */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  {child.schoolName} ({child.grade}) 정규 시간표
                </h4>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 font-bold">
                나이스(NEIS) 연동
              </span>
            </div>

            <div className="space-y-2">
              {schoolTimetable.map((period) => (
                <div
                  key={period.period}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200 text-xs shadow-2xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-lg bg-indigo-50 text-indigo-700 font-black flex items-center justify-center text-[11px] border border-indigo-100">
                      {period.period}
                    </span>
                    <span className="font-bold text-slate-900">{period.subject}</span>
                  </div>
                  <div className="text-slate-500 text-[11px]">
                    {period.teacher} ({period.room})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* School Meal */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-sm text-slate-900">
                  오늘의 학교 급식 ({schoolMeal.mealType})
                </h4>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500" />
                {schoolMeal.calories}
              </span>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5 mb-3 shadow-2xs">
              {schoolMeal.menu.map((item, idx) => (
                <div
                  key={idx}
                  className="text-xs font-medium text-slate-800 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{item}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900">
              <div className="font-bold flex items-center gap-1 mb-1">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <span>알레르기 정보</span>
              </div>
              <p className="text-slate-700">
                {schoolMeal.allergies.join(', ')}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                * 원산지: {schoolMeal.originInfo}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Check-in Inline Modal if clicked from timetable */}
      {manualModalAcademyId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200">
            <h3 className="font-bold text-base text-slate-900 mb-1">
              수동 등원 확인 처리
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              GPS 오차 또는 실내 음영으로 반경 10m 자동 인식이 지연될 경우 부모님이 직접 등원을 확정합니다.
            </p>

            <div className="space-y-2 mb-4">
              {[
                '실내 교실 진입 및 GPS 수신 지연 대면 확인',
                '부모님 직접 차량 픽업 후 학원 도착 확인',
                '학원 담당 선생님 유선 통화 확인 완료',
                '단말기 절전 모드로 인한 위치 갱신 지연',
              ].map((reason, idx) => (
                <button
                  key={idx}
                  onClick={() => setManualReason(reason)}
                  className={`w-full text-left text-xs p-2.5 rounded-xl border transition ${
                    manualReason === reason
                      ? 'bg-indigo-50 border-indigo-400 text-indigo-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setManualModalAcademyId(null)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700"
              >
                취소
              </button>
              <button
                onClick={handleConfirmManualCheckIn}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                등원 확인 확정
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
