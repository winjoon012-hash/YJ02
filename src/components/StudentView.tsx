import React from 'react';
import { Academy, AttendanceRecord, Child, HomeworkItem } from '../types';
import { getDistanceMeters, formatDistance } from '../utils/geo';
import { 
  CheckCircle2, 
  MapPin, 
  Clock, 
  Bus, 
  CheckSquare, 
  Square, 
  Phone, 
  Send, 
  Sparkles,
  AlertCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';

interface StudentViewProps {
  child: Child;
  academies: Academy[];
  todayRecords: AttendanceRecord[];
  homeworks: HomeworkItem[];
  onManualCheckIn: (academyId: string, reason: string) => void;
  onToggleHomework: (id: string) => void;
  onNotifyParent: (message: string) => void;
  onOpenChat: () => void;
  onOpenCalendar: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({
  child,
  academies,
  todayRecords,
  homeworks,
  onManualCheckIn,
  onToggleHomework,
  onNotifyParent,
  onOpenChat,
  onOpenCalendar,
}) => {
  const childHws = homeworks.filter((h) => h.childId === child.id);

  return (
    <div className="max-w-xl mx-auto space-y-4">
      {/* Student Top Greeting */}
      <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-3xl p-5 sm:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-xs">
              학생 안심 모드
            </span>
            <span className="text-xs text-indigo-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              위치 자동 전송 중
            </span>
          </div>

          <h2 className="text-xl font-bold mt-2">
            안녕하세요, {child.name}님!
          </h2>
          <p className="text-xs text-indigo-100 mt-1">
            학원 입구 및 교실(반경 10m 초정밀)에 도착하면 부모님께 자동으로 등원 알림이 전송됩니다.
          </p>

          {/* Quick shortcuts to Family Chat & Calendar */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            <button
              onClick={onOpenChat}
              className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>🏡 가족 단톡방 가기</span>
            </button>
            <button
              onClick={onOpenCalendar}
              className="py-2 px-3 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs text-xs font-bold transition flex items-center justify-center gap-1.5"
            >
              <span>📅 가족 캘린더 확인</span>
            </button>
          </div>

          <div className="mt-3 pt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-200" />
              <span>현재 위치: {child.currentLocation.address || '대치동 학원가'}</span>
            </span>
            <span className="text-indigo-200 font-medium">배터리 {child.batteryLevel}%</span>
          </div>
        </div>
      </div>

      {/* Quick Attendance Check for Students */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-indigo-600" />
          <span>오늘 내 학원 일정 & 원터치 출석 체크</span>
        </h3>

        <div className="space-y-3">
          {academies.map((acad) => {
            const record = todayRecords.find((r) => r.academyId === acad.id);
            const distance = getDistanceMeters(
              child.currentLocation.lat,
              child.currentLocation.lng,
              acad.lat,
              acad.lng
            );
            const isInside = distance <= acad.geofenceRadius;
            const isChecked = !!record;

            return (
              <div
                key={acad.id}
                className={`p-4 rounded-xl border transition ${
                  isChecked
                    ? 'bg-emerald-50/70 border-emerald-200'
                    : 'bg-slate-50/70 border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h4 className="font-bold text-sm text-slate-900">{acad.name}</h4>
                    <p className="text-xs text-slate-500">
                      {acad.startTime} ~ {acad.endTime} ({acad.classroom})
                    </p>
                  </div>

                  <span className="text-xs font-semibold text-slate-600">
                    거리 {formatDistance(distance)}
                  </span>
                </div>

                {isChecked ? (
                  <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-white/80 px-3 py-2 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      {record.checkInTime} 등원 처리 완료 (부모님께 안심 전송됨)
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col sm:flex-row gap-2 mt-2">
                    <button
                      id={`btn-student-checkin-${acad.id}`}
                      onClick={() =>
                        onManualCheckIn(acad.id, '학생이 단말기에서 직접 도착 버튼 클릭')
                      }
                      className="flex-1 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>학원 도착 확인 (직접 체크인)</span>
                    </button>

                    <button
                      onClick={() =>
                        onNotifyParent(`${child.name}이가 [${acad.name}] 셔틀 탑승 또는 수업 준비 중입니다.`)
                      }
                      className="px-3 py-2 rounded-xl text-xs font-medium bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 transition"
                    >
                      부모님께 메시지
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Homework Checklist for Student */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
        <h3 className="font-bold text-slate-900 text-sm mb-3 flex items-center gap-1.5">
          <CheckSquare className="w-4 h-4 text-indigo-600" />
          <span>오늘 확인할 숙제 리스트</span>
        </h3>

        <div className="space-y-2">
          {childHws.map((hw) => (
            <div
              key={hw.id}
              onClick={() => onToggleHomework(hw.id)}
              className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 flex items-center gap-3 cursor-pointer transition"
            >
              {hw.isCompleted ? (
                <CheckSquare className="w-5 h-5 text-emerald-600" />
              ) : (
                <Square className="w-5 h-5 text-slate-300" />
              )}
              <div className="min-w-0 flex-1">
                <span className={`text-xs font-semibold ${hw.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                  {hw.title}
                </span>
                <p className="text-[11px] text-slate-500">
                  {hw.academyName} · 마감: {hw.dueDate}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
