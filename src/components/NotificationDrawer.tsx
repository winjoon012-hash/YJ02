import React, { useState } from 'react';
import { AppNotification, NotificationType } from '../types';
import { 
  Bell, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  Bus, 
  CheckCheck, 
  Sparkles, 
  Trash2,
  Send
} from 'lucide-react';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  onMarkAllRead: () => void;
  onClearAll: () => void;
  onSendTestNotification: (type: NotificationType) => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onClearAll,
  onSendTestNotification,
}) => {
  const [filter, setFilter] = useState<'all' | NotificationType>('all');

  if (!isOpen) return null;

  const filtered = filter === 'all' 
    ? notifications 
    : notifications.filter((n) => n.type === filter);

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'check_in':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'check_out':
        return <CheckCheck className="w-4 h-4 text-indigo-600" />;
      case 'warning_late':
        return <AlertTriangle className="w-4 h-4 text-rose-600" />;
      case 'shuttle':
        return <Bus className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  const requestBrowserPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('스케줄키즈 안심 알림 활성화', {
          body: '자녀의 학원 등·하원 및 지각 위험 실시간 Push 알림이 정상 설정되었습니다.',
          icon: '/favicon.ico',
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
        onClick={onClose} 
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Drawer Header */}
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">실시간 학부모 알림 피드</h3>
                <p className="text-[11px] text-slate-500">
                  지오펜싱 자동 감지 및 실시간 Push 내역
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

          {/* Quick Push Test Actions */}
          <div className="p-3 bg-slate-50 border-b border-slate-200/80">
            <div className="flex items-center justify-between mb-2 text-[11px]">
              <span className="font-semibold text-slate-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                모의 Push 알림 발송 테스트
              </span>
              <button
                onClick={requestBrowserPermission}
                className="text-indigo-600 hover:underline font-medium"
              >
                브라우저 푸시 권한 요청
              </button>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-xs">
              <button
                onClick={() => onSendTestNotification('check_in')}
                className="px-2 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-medium text-[11px]"
              >
                + 등원 알림
              </button>
              <button
                onClick={() => onSendTestNotification('warning_late')}
                className="px-2 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-medium text-[11px]"
              >
                + 지각 경고
              </button>
              <button
                onClick={() => onSendTestNotification('shuttle')}
                className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-medium text-[11px]"
              >
                + 셔틀 안내
              </button>
            </div>
          </div>

          {/* Filter Pills & Actions */}
          <div className="px-4 py-2.5 border-b border-slate-100 flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-1 overflow-x-auto scrollbar-none">
              {(['all', 'check_in', 'check_out', 'warning_late', 'shuttle'] as const).map((t) => {
                const labels: Record<string, string> = {
                  all: '전체',
                  check_in: '등원',
                  check_out: '하원',
                  warning_late: '지각경고',
                  shuttle: '셔틀',
                };
                return (
                  <button
                    key={t}
                    onClick={() => setFilter(t)}
                    className={`px-2 py-1 rounded-lg text-[11px] whitespace-nowrap transition ${
                      filter === t
                        ? 'bg-slate-900 text-white font-semibold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {labels[t]}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onMarkAllRead}
                className="text-[11px] text-slate-500 hover:text-indigo-600 whitespace-nowrap"
              >
                모두 읽음
              </button>
              <button
                onClick={onClearAll}
                className="text-[11px] text-slate-400 hover:text-rose-600"
                title="알림 전체 삭제"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filtered.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center text-slate-400 text-xs">
                <Bell className="w-8 h-8 stroke-1 text-slate-300 mb-2" />
                <p>도착한 알림 내역이 없습니다.</p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item.id}
                  className={`p-3 rounded-xl border transition-all ${
                    item.isRead
                      ? 'bg-white border-slate-200/80 opacity-80'
                      : 'bg-indigo-50/40 border-indigo-200 shadow-2xs'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs mt-0.5">
                      {getIcon(item.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs text-slate-900 truncate">
                          {item.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {item.message}
                      </p>
                      {item.academyName && (
                        <div className="mt-1.5 text-[10px] text-indigo-700 font-medium">
                          대상: {item.childName} · {item.academyName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
