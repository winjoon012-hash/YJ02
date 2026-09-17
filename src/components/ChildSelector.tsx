import React from 'react';
import { Child } from '../types';
import { Smartphone, Battery, BatteryCharging, MapPin, CheckCircle2, AlertTriangle, Plus } from 'lucide-react';

interface ChildSelectorProps {
  childrenList: Child[];
  activeChildId: string;
  onSelectChild: (childId: string) => void;
  onAddChild: () => void;
}

export const ChildSelector: React.FC<ChildSelectorProps> = ({
  childrenList,
  activeChildId,
  onSelectChild,
  onAddChild,
}) => {
  return (
    <div className="flex items-center gap-3 overflow-x-auto pb-1 scrollbar-none">
      {childrenList.map((child) => {
        const isActive = child.id === activeChildId;
        return (
          <button
            key={child.id}
            id={`child-tab-${child.id}`}
            onClick={() => onSelectChild(child.id)}
            className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl border text-left transition-all min-w-[210px] sm:min-w-[240px] shrink-0 whitespace-nowrap ${
              isActive
                ? 'bg-white border-pink-400 shadow-md shadow-pink-100 ring-2 ring-pink-400/20'
                : 'bg-white/90 backdrop-blur-sm border-slate-200/90 hover:border-pink-300 hover:bg-white text-slate-700'
            }`}
          >
            <div className="relative shrink-0">
              <img
                src={child.avatar}
                alt={child.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs shrink-0"
                referrerPolicy="no-referrer"
              />
              <span
                className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white shrink-0 ${
                  child.isOnline ? 'bg-emerald-500' : 'bg-slate-400'
                }`}
                title={child.isOnline ? '온라인 (실시간 위치 전송 중)' : '오프라인'}
              />
            </div>

            <div className="flex-1 min-w-0 whitespace-nowrap">
              <div className="flex items-center justify-between gap-1">
                <span className="font-bold text-sm text-slate-900 truncate whitespace-nowrap">
                  {child.name}
                </span>
                <span className="text-[10px] font-semibold text-pink-700 bg-pink-50 border border-pink-100 px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0">
                  {child.grade}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-500 whitespace-nowrap">
                <span className="flex items-center gap-0.5 shrink-0">
                  <MapPin className="w-3 h-3 text-pink-500 shrink-0" />
                  <span className="truncate max-w-[90px] whitespace-nowrap">{child.currentLocation.address?.split(' ')[2] || '대치동'}</span>
                </span>
                <span className="text-slate-300 shrink-0">·</span>
                <span className="flex items-center gap-0.5 shrink-0">
                  {child.isCharging ? (
                    <BatteryCharging className="w-3 h-3 text-emerald-600 shrink-0" />
                  ) : (
                    <Battery className="w-3 h-3 text-slate-500 shrink-0" />
                  )}
                  <span className="whitespace-nowrap">{child.batteryLevel}%</span>
                </span>
              </div>
            </div>
          </button>
        );
      })}

      <button
        id="btn-add-child-profile"
        onClick={onAddChild}
        className="flex items-center gap-1.5 px-3 py-2.5 rounded-2xl border border-dashed border-slate-300 hover:border-indigo-400 text-slate-500 hover:text-indigo-600 text-xs font-medium hover:bg-indigo-50/50 transition whitespace-nowrap"
      >
        <Plus className="w-4 h-4" />
        <span>자녀 추가</span>
      </button>
    </div>
  );
};
