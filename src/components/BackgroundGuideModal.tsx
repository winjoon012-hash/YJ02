import React, { useState } from 'react';
import { 
  Smartphone, 
  X, 
  MapPin, 
  BatteryCharging, 
  Zap, 
  CheckCircle2, 
  ShieldAlert, 
  Layers,
  Sparkles
} from 'lucide-react';

interface BackgroundGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  batteryOptimization: boolean;
  onToggleBatteryOptimization: () => void;
}

export const BackgroundGuideModal: React.FC<BackgroundGuideModalProps> = ({
  isOpen,
  onClose,
  batteryOptimization,
  onToggleBatteryOptimization,
}) => {
  if (!isOpen) return null;

  const [osTab, setOsTab] = useState<'ios' | 'android'>('android');

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                백그라운드 위치 권한 & 배터리 최적화 사양
              </h3>
              <p className="text-xs text-slate-500">
                하이브리드 위치 측정 및 자녀 단말기 배터리 절약 기술
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

        <div className="my-4 space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          {/* Smart Battery Optimization Toggle */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-200/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-600" />
                <span className="font-bold text-xs text-slate-900">
                  스마트 배터리 최적화 모드 (Dynamic Tracking)
                </span>
              </div>
              <input
                type="checkbox"
                checked={batteryOptimization}
                onChange={onToggleBatteryOptimization}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
            </div>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              수업 시작 전 20분 ~ 종료 후 10분 구간에만 고정밀 GPS 핑 주기를 늘리고, 평상시에는 Wi-Fi/Cell 대기 모드로 전환하여 자녀 단말기 <strong>배터리 소모량을 최대 68% 절감</strong>합니다.
            </p>
          </div>

          {/* Hybrid Location Specification */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
            <div className="font-bold text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-indigo-600" />
              <span>하이브리드 위치 측정 엔진 (Hybrid Location Provider)</span>
            </div>
            <ul className="space-y-1.5 text-slate-600 pl-1">
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span><strong>GPS + GLONASS:</strong> 실외 이동 시 5~15m 고정밀 지오펜스 진입 판정</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span><strong>Wi-Fi AP Fingerprinting:</strong> 고층 빌딩 및 상가 내부 GPS 난청 극복</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span><strong>Cellular 삼각측량:</strong> 통신 음영 발생 시 최소 오차 보정</span>
              </li>
            </ul>
          </div>

          {/* OS Permission Step Guide */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs text-slate-800">
                자녀 단말기 '항상 허용' 필수 설정 가이드
              </span>
              <div className="flex gap-1 bg-slate-100 p-0.5 rounded-lg text-xs">
                <button
                  onClick={() => setOsTab('android')}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    osTab === 'android' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  Android
                </button>
                <button
                  onClick={() => setOsTab('ios')}
                  className={`px-2.5 py-1 rounded-md font-medium transition ${
                    osTab === 'ios' ? 'bg-white text-indigo-700 shadow-2xs font-bold' : 'text-slate-600'
                  }`}
                >
                  iOS (아이폰)
                </button>
              </div>
            </div>

            {osTab === 'android' ? (
              <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>단말기 [설정] &gt; [애플리케이션] &gt; [스케줄키즈] 선택</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>[권한] &gt; [위치] 메뉴 진입</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span className="font-bold text-indigo-900 bg-indigo-100/70 px-1 rounded">
                    '항상 허용' 및 '정확한 위치 사용' 활성화
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                  <span>[배터리] &gt; '제한 없음(배터리 최적화 제외)' 선택</span>
                </div>
              </div>
            ) : (
              <div className="space-y-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-slate-700">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">1</span>
                  <span>아이폰 [설정] &gt; [스케줄키즈] 선택</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">2</span>
                  <span>[위치 접근 허용] &gt; '항상' 선택</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">3</span>
                  <span className="font-bold text-indigo-900 bg-indigo-100/70 px-1 rounded">
                    '정확한 위치' 토글 ON
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">4</span>
                  <span>[백그라운드 앱 새로고침] 활성화 확인</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
          >
            확인 완료
          </button>
        </div>
      </div>
    </div>
  );
};
