import React, { useState } from 'react';
import { Academy, ShuttleInfo } from '../types';
import { 
  Building2, 
  X, 
  MapPin, 
  Clock, 
  Bus, 
  Sliders, 
  Sparkles,
  Phone,
  User,
  Check
} from 'lucide-react';
import { KOREAN_DAYS } from '../utils/geo';

interface AcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveAcademy: (academy: Academy) => void;
  initialAcademy?: Academy | null;
}

export const AcademyModal: React.FC<AcademyModalProps> = ({
  isOpen,
  onClose,
  onSaveAcademy,
  initialAcademy,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState(initialAcademy?.name || '');
  const [subject, setSubject] = useState(initialAcademy?.subject || '수학');
  const [classroom, setClassroom] = useState(initialAcademy?.classroom || '301호');
  const [address, setAddress] = useState(initialAcademy?.address || '서울특별시 강남구 대치동 988');
  const [lat, setLat] = useState<number>(initialAcademy?.lat || 37.4980);
  const [lng, setLng] = useState<number>(initialAcademy?.lng || 127.0590);
  const [radius, setRadius] = useState<number>(initialAcademy?.geofenceRadius || 10);
  const [days, setDays] = useState<number[]>(initialAcademy?.days || [1, 3, 5]);
  const [startTime, setStartTime] = useState(initialAcademy?.startTime || '17:00');
  const [endTime, setEndTime] = useState(initialAcademy?.endTime || '19:00');
  const [teacherName, setTeacherName] = useState(initialAcademy?.teacherName || '김선생님');
  const [teacherContact, setTeacherContact] = useState(initialAcademy?.teacherContact || '02-555-1234');
  const [color, setColor] = useState(initialAcademy?.color || '#3B82F6');

  // Shuttle
  const [shuttleEnabled, setShuttleEnabled] = useState(initialAcademy?.shuttle.enabled || false);
  const [busName, setBusName] = useState(initialAcademy?.shuttle.busName || '노란 1호차');
  const [driverPhone, setDriverPhone] = useState(initialAcademy?.shuttle.driverPhone || '010-1234-5678');
  const [pickupLocation, setPickupLocation] = useState(initialAcademy?.shuttle.pickupLocation || '아파트 정문');
  const [pickupTime, setPickupTime] = useState(initialAcademy?.shuttle.pickupTime || '16:30');

  const toggleDay = (d: number) => {
    if (days.includes(d)) {
      setDays(days.filter((item) => item !== d));
    } else {
      setDays([...days, d].sort());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newAcademy: Academy = {
      id: initialAcademy?.id || `acad-${Date.now()}`,
      name: name.trim(),
      subject: subject.trim(),
      classroom: classroom.trim(),
      color,
      address,
      lat,
      lng,
      geofenceRadius: radius,
      days,
      startTime,
      endTime,
      teacherName,
      teacherContact,
      shuttle: {
        enabled: shuttleEnabled,
        busName,
        driverPhone,
        pickupLocation,
        pickupTime,
        dropoffLocation: pickupLocation,
        dropoffTime: endTime,
      },
    };

    onSaveAcademy(newAcademy);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                {initialAcademy ? '학원 정보 및 지오펜스 수정' : '신규 학원 및 지오펜스 등록'}
              </h3>
              <p className="text-xs text-slate-500">
                주소 좌표, 지오펜스 출석 인식 반경(10m 초정밀) 및 셔틀 설정
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Academy Name & Subject */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                학원명 *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="예: 대치 엠스쿨 수학학원"
                required
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                과목 / 강의실
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="예: 수학 (심화) · 302호"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Address & Coordinates */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              학원 주소
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="서울특별시 강남구 ..."
                className="flex-1 text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Geofencing Radius Slider */}
          <div className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-indigo-950 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                지오펜스 출석 인식 반경 (초정밀 10m)
              </span>
              <span className="font-bold text-indigo-700 bg-white px-2 py-0.5 rounded-md border border-indigo-200">
                {radius}m
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-2">
              학원 출입문/건물 기준 {radius}m 이내 접근 시 자동으로 "등원 완료" 처리됩니다. (기본 권장: 10m 초정밀 출석)
            </p>
            <input
              type="range"
              min="5"
              max="50"
              step="5"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>5m (초밀착)</span>
              <span className="font-semibold text-indigo-600">10m (기본 표준)</span>
              <span>25m</span>
              <span>50m</span>
            </div>
          </div>

          {/* Days of week */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              수업 요일
            </label>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 0].map((d) => {
                const isSelected = days.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(d)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {KOREAN_DAYS[d]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Class Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                수업 시작 시간
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                수업 종료 시간
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Shuttle Bus Toggle */}
          <div className="border border-slate-200 rounded-xl p-3.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                <Bus className="w-4 h-4 text-amber-600" />
                학원 셔틀버스 이용
              </span>
              <input
                type="checkbox"
                checked={shuttleEnabled}
                onChange={(e) => setShuttleEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
            </div>

            {shuttleEnabled && (
              <div className="mt-3 space-y-2 pt-2 border-t border-slate-100 text-xs">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="셔틀 차량명 (예: 노란 1호차)"
                    value={busName}
                    onChange={(e) => setBusName(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="text"
                    placeholder="기사님 연락처 (010-...)"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="탑승 장소 (예: 은마아파트 3동)"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                  <input
                    type="time"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    className="px-2.5 py-1.5 border border-slate-300 rounded-lg text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Teacher Info & Badge Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                선생님 성함 / 연락처
              </label>
              <input
                type="text"
                value={teacherName}
                onChange={(e) => setTeacherName(e.target.value)}
                placeholder="예: 박준혁 원장"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                지도 핀 색상 테마
              </label>
              <div className="flex items-center gap-2 mt-1">
                {['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444'].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-7 h-7 rounded-full border-2 transition ${
                      color === c ? 'border-slate-900 scale-110' : 'border-white'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              {initialAcademy ? '수정 완료' : '학원 등록 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
