import React, { useState } from 'react';
import { Academy, AttendanceRecord, Child, UserRole } from '../types';
import { getDistanceMeters, formatDistance } from '../utils/geo';
import { 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Bus, 
  Phone, 
  CheckCheck, 
  HelpCircle,
  Sparkles,
  MapPin,
  X
} from 'lucide-react';

interface AttendanceCardProps {
  child: Child;
  academies: Academy[];
  todayRecords: AttendanceRecord[];
  currentRole: UserRole;
  onManualCheckIn: (academyId: string, reason: string) => void;
  onManualCheckOut: (academyId: string) => void;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  child,
  academies,
  todayRecords,
  currentRole,
  onManualCheckIn,
  onManualCheckOut,
}) => {
  const [modalAcademyId, setModalAcademyId] = useState<string | null>(null);
  const [manualReason, setManualReason] = useState<string>('실내 지하/고층 건물로 인한 GPS 수신 지연');

  const commonReasons = [
    '실내 지하/고층 건물로 인한 GPS 수신 지연',
    '부모님 차량 직접 픽업 및 학원 도착 확인',
    '학원 담당 선생님 유선 대면 확인 완료',
    '단말기 배터리 절전 모드로 인한 위치 갱신 지연',
  ];

  const handleConfirmManualCheckIn = () => {
    if (modalAcademyId) {
      onManualCheckIn(modalAcademyId, manualReason);
      setModalAcademyId(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <CheckCheck className="w-5 h-5 text-indigo-600" />
            <span>오늘의 학원 등·하원 현황</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            지오펜싱 자동 감지 및 실시간 출석 처리 상태
          </p>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
          오늘 일정 {academies.length}개
        </span>
      </div>

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

          const isPresent = record?.status === 'present';
          const isManual = record?.status === 'manual_checked';
          const isLeft = record?.status === 'left';
          const isLate = record?.status === 'late';

          return (
            <div
              key={acad.id}
              className={`p-4 rounded-xl border transition-all ${
                isPresent || isManual
                  ? 'bg-emerald-50/60 border-emerald-200'
                  : isLeft
                  ? 'bg-slate-50 border-slate-200 opacity-90'
                  : 'bg-white border-slate-200 hover:border-indigo-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: acad.color }}
                    />
                    <h4 className="font-bold text-sm sm:text-base text-slate-900">
                      {acad.name}
                    </h4>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {acad.subject} · {acad.classroom}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-medium text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {acad.startTime} ~ {acad.endTime}
                    </span>
                    <span className="text-slate-300">|</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      현재 거리 {formatDistance(distance)} (초정밀 출석 반경: {acad.geofenceRadius}m)
                    </span>
                  </div>
                </div>

                {/* Status Badges & Action Buttons */}
                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isPresent && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>등원 완료 ({record.checkInTime})</span>
                    </div>
                  )}

                  {isManual && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-semibold shadow-xs">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>수동 등원 확인 ({record.checkInTime})</span>
                    </div>
                  )}

                  {isLeft && (
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-700 text-white text-xs font-semibold">
                      <CheckCheck className="w-4 h-4" />
                      <span>하원 완료 ({record.checkOutTime})</span>
                    </div>
                  )}

                  {!record && (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200/80 px-2.5 py-1 rounded-lg">
                        등원 대기 중
                      </span>

                      {/* Manual Check-in button */}
                      <button
                        id={`btn-manual-checkin-${acad.id}`}
                        onClick={() => setModalAcademyId(acad.id)}
                        className="text-xs font-medium px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 transition shadow-xs flex items-center gap-1"
                        title="GPS 오차 또는 실내 음영 시 수동 등원 체크"
                      >
                        <CheckCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>수동 등원</span>
                      </button>
                    </div>
                  )}

                  {(isPresent || isManual) && (
                    <button
                      id={`btn-manual-checkout-${acad.id}`}
                      onClick={() => onManualCheckOut(acad.id)}
                      className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      title="하원 수동 처리"
                    >
                      하원 처리
                    </button>
                  )}
                </div>
              </div>

              {/* Shuttle Bus Info Bar if enabled */}
              {acad.shuttle.enabled && (
                <div className="mt-2.5 pt-2.5 border-t border-slate-200/60 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Bus className="w-3.5 h-3.5 text-amber-600" />
                    <span className="font-semibold text-slate-800">
                      셔틀버스: {acad.shuttle.busName}
                    </span>
                    <span className="text-slate-400">·</span>
                    <span>탑승: {acad.shuttle.pickupTime} ({acad.shuttle.pickupLocation})</span>
                  </div>

                  <a
                    href={`tel:${acad.shuttle.driverPhone}`}
                    className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <Phone className="w-3 h-3" />
                    <span>기사님 연락 ({acad.shuttle.driverPhone})</span>
                  </a>
                </div>
              )}

              {/* Manual Record Note */}
              {record?.isManual && record.manualReason && (
                <div className="mt-2 text-[11px] text-teal-800 bg-teal-50/80 px-2.5 py-1 rounded-md border border-teal-200/60">
                  <span className="font-semibold">수동 등원 사유:</span> {record.manualReason}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Manual Check-in Reason Modal */}
      {modalAcademyId && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-indigo-600" />
                <span>수동 등원 체크 및 예외 사유 기록</span>
              </h4>
              <button
                onClick={() => setModalAcademyId(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              건물 내부 음영지역 또는 GPS 지연으로 지오펜스 자동 인식이 안 된 경우, 수동으로 등원을 확정하고 사유를 기록합니다.
            </p>

            <div className="space-y-2 mb-4">
              <label className="block text-xs font-semibold text-slate-700">
                자주 사용하는 예외 사유 선택
              </label>
              {commonReasons.map((reason, idx) => (
                <button
                  key={idx}
                  onClick={() => setManualReason(reason)}
                  className={`w-full text-left text-xs p-2.5 rounded-xl border transition-all ${
                    manualReason === reason
                      ? 'bg-indigo-50/80 border-indigo-300 text-indigo-900 font-medium'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                직접 사유 입력
              </label>
              <input
                type="text"
                value={manualReason}
                onChange={(e) => setManualReason(e.target.value)}
                placeholder="예: 학원 데스크 선생님과 직접 통화 확인"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setModalAcademyId(null)}
                className="px-3 py-2 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-100"
              >
                취소
              </button>
              <button
                id="btn-confirm-manual-checkin"
                onClick={handleConfirmManualCheckIn}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
              >
                수동 등원 완료 처리
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
