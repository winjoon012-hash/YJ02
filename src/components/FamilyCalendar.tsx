import React, { useState } from 'react';
import { 
  CalendarEvent, 
  FamilyMember, 
  EventCategory, 
  Academy, 
  Child 
} from '../types';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter, 
  Clock, 
  MapPin, 
  Users, 
  Trash2, 
  X, 
  Check, 
  BookOpen, 
  Building2, 
  HeartPulse, 
  GraduationCap, 
  Sparkles,
  Layers
} from 'lucide-react';
import { KOREAN_DAYS } from '../utils/geo';

interface FamilyCalendarProps {
  events: CalendarEvent[];
  familyMembers: FamilyMember[];
  academies: Academy[];
  childrenList: Child[];
  onAddEvent: (newEvent: CalendarEvent) => void;
  onDeleteEvent: (id: string) => void;
}

export const FamilyCalendar: React.FC<FamilyCalendarProps> = ({
  events,
  familyMembers,
  academies,
  childrenList,
  onAddEvent,
  onDeleteEvent,
}) => {
  // Calendar date navigation (September 2026 default)
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(8); // 0-indexed: 8 is September
  const [selectedDateStr, setSelectedDateStr] = useState<string>('2026-09-18');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState<string>('all');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Event Form State
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventCategory, setNewEventCategory] = useState<EventCategory>('family');
  const [newEventDate, setNewEventDate] = useState('2026-09-18');
  const [newEventStartTime, setNewEventStartTime] = useState('14:00');
  const [newEventEndTime, setNewEventEndTime] = useState('16:00');
  const [newEventLocation, setNewEventLocation] = useState('');
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventMembers, setNewEventMembers] = useState<string[]>(['mem-mom', 'child-1']);
  const [newEventColor, setNewEventColor] = useState('#3B82F6');

  // Month navigation
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Generate days in month
  const firstDayOfWeek = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesMember =
      selectedMemberFilter === 'all' || ev.memberIds.includes(selectedMemberFilter);
    const matchesCategory =
      selectedCategoryFilter === 'all' || ev.category === selectedCategoryFilter;
    return matchesMember && matchesCategory;
  });

  // Events for the selected date
  const selectedDateEvents = filteredEvents.filter((ev) => ev.date === selectedDateStr);

  const getCategoryBadge = (category: EventCategory) => {
    switch (category) {
      case 'academy':
        return { label: '학원·수업', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'school':
        return { label: '학교·행사', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      case 'family':
        return { label: '가족 일정', bg: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'medical':
        return { label: '병원·진료', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
      case 'exam':
        return { label: '시험·평가', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      default:
        return { label: '일반', bg: 'bg-slate-50 text-slate-700 border-slate-200' };
    }
  };

  const handleMemberToggle = (memberId: string) => {
    if (newEventMembers.includes(memberId)) {
      if (newEventMembers.length > 1) {
        setNewEventMembers(newEventMembers.filter((id) => id !== memberId));
      }
    } else {
      setNewEventMembers([...newEventMembers, memberId]);
    }
  };

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim()) return;

    const eventObj: CalendarEvent = {
      id: `ev-${Date.now()}`,
      title: newEventTitle.trim(),
      category: newEventCategory,
      date: newEventDate,
      startTime: newEventStartTime,
      endTime: newEventEndTime,
      location: newEventLocation.trim() || undefined,
      description: newEventDesc.trim() || undefined,
      memberIds: newEventMembers,
      color: newEventColor,
    };

    onAddEvent(eventObj);
    setIsAddModalOpen(false);
    setNewEventTitle('');
    setNewEventLocation('');
    setNewEventDesc('');
    setSelectedDateStr(newEventDate);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-xs">
      {/* Calendar Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 mb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <CalendarIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>통합 가족 캘린더 (Shared Family Calendar)</span>
              </h3>
              <p className="text-xs text-slate-500">
                자녀의 학교·학원 시간표와 온 가족의 주요 일정을 한곳에서 통합 조율합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Member Filter */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedMemberFilter('all')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                selectedMemberFilter === 'all'
                  ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              전체 가족
            </button>
            {familyMembers.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMemberFilter(m.id)}
                className={`px-2.5 py-1 rounded-lg transition flex items-center gap-1 font-medium ${
                  selectedMemberFilter === m.id
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: m.color }}
                />
                <span>{m.relation}</span>
              </button>
            ))}
          </div>

          {/* Add Event Button */}
          <button
            id="btn-add-family-event"
            onClick={() => {
              setNewEventDate(selectedDateStr);
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>일정 추가</span>
          </button>
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-4 scrollbar-none text-xs">
        <span className="text-slate-400 text-xs font-medium flex items-center gap-1 mr-1">
          <Filter className="w-3 h-3" /> 분류:
        </span>
        {[
          { key: 'all', label: '전체 보기' },
          { key: 'family', label: '🏡 가족 행사' },
          { key: 'academy', label: '📚 학원·수업' },
          { key: 'school', label: '🏫 학교 일정' },
          { key: 'medical', label: '🏥 병원·진료' },
        ].map((cat) => (
          <button
            key={cat.key}
            onClick={() => setSelectedCategoryFilter(cat.key)}
            className={`px-2.5 py-1 rounded-lg border text-xs whitespace-nowrap transition ${
              selectedCategoryFilter === cat.key
                ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Monthly Calendar Grid (7 cols) */}
        <div className="lg:col-span-7 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/90">
          {/* Month Controller */}
          <div className="flex items-center justify-between mb-3 px-1">
            <h4 className="font-bold text-sm sm:text-base text-slate-900 flex items-center gap-2">
              <span>{currentYear}년 {currentMonth + 1}월</span>
              <span className="text-xs font-normal text-slate-400">
                (총 {filteredEvents.length}개 일정 동기화됨)
              </span>
            </h4>

            <div className="flex items-center gap-1">
              <button
                onClick={prevMonth}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition shadow-2xs"
                title="이전 달"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentYear(2026);
                  setCurrentMonth(8);
                  setSelectedDateStr('2026-09-18');
                }}
                className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 text-xs font-medium shadow-2xs"
              >
                오늘
              </button>
              <button
                onClick={nextMonth}
                className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 transition shadow-2xs"
                title="다음 달"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 text-center mb-1 text-xs font-semibold text-slate-500">
            {KOREAN_DAYS.map((d, i) => (
              <div
                key={d}
                className={`py-1 ${i === 0 ? 'text-rose-500' : i === 6 ? 'text-blue-500' : ''}`}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day Cells Matrix */}
          <div className="grid grid-cols-7 gap-1">
            {/* Empty slots for first week offset */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} className="min-h-[64px] sm:min-h-[72px] bg-transparent opacity-20" />
            ))}

            {/* Days in Month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDateStr;
              const dayEvents = filteredEvents.filter((ev) => ev.date === dateStr);
              const isToday = dateStr === '2026-09-18';

              return (
                <div
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`min-h-[64px] sm:min-h-[72px] p-1.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'bg-white border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                      : 'bg-white border-slate-200/80 hover:border-slate-300 hover:bg-slate-50/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : isSelected
                          ? 'text-indigo-700'
                          : 'text-slate-700'
                      }`}
                    >
                      {dayNum}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="text-[10px] text-slate-400 font-semibold">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Event Dots/Pills in Cell */}
                  <div className="space-y-0.5 mt-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className="text-[9px] sm:text-[10px] px-1 py-0.5 rounded truncate font-medium flex items-center gap-1"
                        style={{
                          backgroundColor: `${ev.color || '#3B82F6'}18`,
                          color: ev.color || '#1E40AF',
                        }}
                      >
                        <span
                          className="w-1.5 h-1.5 rounded-full shrink-0"
                          style={{ backgroundColor: ev.color || '#3B82F6' }}
                        />
                        <span className="truncate">{ev.title}</span>
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <span className="text-[9px] text-slate-400 font-medium pl-1">
                        +{dayEvents.length - 2}건 더보기
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Day Schedule Details (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-2xl border border-slate-200 flex flex-col">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
            <div>
              <span className="text-xs font-bold text-indigo-600">
                선택한 날짜 상세 일정
              </span>
              <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                {selectedDateStr}
              </h4>
            </div>

            <button
              onClick={() => {
                setNewEventDate(selectedDateStr);
                setIsAddModalOpen(true);
              }}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>이 날짜에 추가</span>
            </button>
          </div>

          {/* List of events for selected day */}
          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[380px] pr-1">
            {selectedDateEvents.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400 flex flex-col items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-slate-300 stroke-1 mb-2" />
                <p>등록된 가족 일정이 없습니다.</p>
                <button
                  onClick={() => {
                    setNewEventDate(selectedDateStr);
                    setIsAddModalOpen(true);
                  }}
                  className="mt-2 text-indigo-600 font-semibold hover:underline"
                >
                  + 새 일정 추가하기
                </button>
              </div>
            ) : (
              selectedDateEvents.map((ev) => {
                const badge = getCategoryBadge(ev.category);
                const assignedMembers = familyMembers.filter((m) =>
                  ev.memberIds.includes(m.id)
                );

                return (
                  <div
                    key={ev.id}
                    className="p-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50/40 hover:bg-white transition shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full mt-0.5 shrink-0"
                          style={{ backgroundColor: ev.color || '#3B82F6' }}
                        />
                        <h5 className="font-bold text-xs sm:text-sm text-slate-900">
                          {ev.title}
                        </h5>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${badge.bg}`}
                        >
                          {badge.label}
                        </span>
                        {!ev.isSyncedFromAcademy && (
                          <button
                            onClick={() => onDeleteEvent(ev.id)}
                            className="p-1 rounded-md text-slate-300 hover:text-rose-600 transition"
                            title="일정 삭제"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Time & Location */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-600">
                      {ev.startTime && (
                        <span className="flex items-center gap-1 font-medium text-slate-700">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {ev.startTime} ~ {ev.endTime || ''}
                        </span>
                      )}
                      {ev.location && (
                        <span className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          <span className="truncate max-w-[170px]">{ev.location}</span>
                        </span>
                      )}
                    </div>

                    {/* Description if any */}
                    {ev.description && (
                      <p className="text-[11px] text-slate-500 mt-1.5 leading-relaxed bg-white/70 p-1.5 rounded-lg border border-slate-100">
                        {ev.description}
                      </p>
                    )}

                    {/* Participants Avatars */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-200/60 text-[11px]">
                      <span className="text-slate-400">참여 가족:</span>
                      <div className="flex items-center -space-x-1.5">
                        {assignedMembers.map((m) => (
                          <img
                            key={m.id}
                            src={m.avatar}
                            alt={m.name}
                            title={`${m.name} (${m.relation})`}
                            className="w-5 h-5 rounded-full object-cover border-2 border-white shadow-2xs"
                            referrerPolicy="no-referrer"
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <CalendarIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                    새 가족 일정 등록
                  </h4>
                  <p className="text-xs text-slate-500">
                    가족 공통 일정 및 자녀별 스케줄 등록
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-3.5 my-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  일정 제목 *
                </label>
                <input
                  type="text"
                  placeholder="예: 민준이 수학 상담, 주말 한강 가족 피크닉"
                  value={newEventTitle}
                  onChange={(e) => setNewEventTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    분류 (카테고리)
                  </label>
                  <select
                    value={newEventCategory}
                    onChange={(e) => setNewEventCategory(e.target.value as EventCategory)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="family">🏡 가족 일정</option>
                    <option value="academy">📚 학원·수업</option>
                    <option value="school">🏫 학교 행사</option>
                    <option value="medical">🏥 병원·진료</option>
                    <option value="exam">📝 시험·평가</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    날짜
                  </label>
                  <input
                    type="date"
                    value={newEventDate}
                    onChange={(e) => setNewEventDate(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    시작 시간
                  </label>
                  <input
                    type="time"
                    value={newEventStartTime}
                    onChange={(e) => setNewEventStartTime(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    종료 시간
                  </label>
                  <input
                    type="time"
                    value={newEventEndTime}
                    onChange={(e) => setNewEventEndTime(e.target.value)}
                    className="w-full px-2.5 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  장소 (선택)
                </label>
                <input
                  type="text"
                  placeholder="예: 반포한강공원 달빛광장, 강남 연세주니어치과"
                  value={newEventLocation}
                  onChange={(e) => setNewEventLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  메모 / 설명 (선택)
                </label>
                <textarea
                  placeholder="추가 준비물이나 전달 사항을 적어주세요."
                  value={newEventDesc}
                  onChange={(e) => setNewEventDesc(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none"
                />
              </div>

              {/* Family member participants selection */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">
                  참여 가족 멤버 선택
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {familyMembers.map((m) => {
                    const isSelected = newEventMembers.includes(m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleMemberToggle(m.id)}
                        className={`p-2 rounded-xl border flex items-center justify-between transition ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-300 text-indigo-950 font-bold'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <img
                            src={m.avatar}
                            alt={m.name}
                            className="w-6 h-6 rounded-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <span>{m.relation}</span>
                        </div>
                        {isSelected && <Check className="w-3.5 h-3.5 text-indigo-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Color Theme */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  라벨 색상 테마
                </label>
                <div className="flex items-center gap-2">
                  {['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#EC4899'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setNewEventColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        newEventColor === c ? 'border-slate-900 scale-110' : 'border-white'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  일정 등록 완료
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
