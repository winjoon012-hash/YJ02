import React, { useState } from 'react';
import { Child } from '../types';
import { 
  QrCode, 
  X, 
  Copy, 
  Check, 
  Smartphone, 
  Share2, 
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

interface PairingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeChild: Child;
}

export const PairingModal: React.FC<PairingModalProps> = ({
  isOpen,
  onClose,
  activeChild,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const inviteLink = `https://schedulekids.app/join?code=${activeChild.pairingCode}&child=${encodeURIComponent(activeChild.name)}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(activeChild.pairingCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    alert('자녀 기기 연동 초댓링크가 클립보드에 복사되었습니다. 자녀 휴대폰으로 링크를 전달해 주세요.');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                자녀 단말기 연동
              </h3>
              <p className="text-xs text-slate-500">
                {activeChild.name} 기기와 실시간 위치 및 지오펜싱 연동
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

        {/* QR Code Card */}
        <div className="my-5 flex flex-col items-center text-center">
          <div className="p-4 bg-white border-2 border-dashed border-indigo-200 rounded-2xl shadow-xs">
            {/* SVG simulated QR Code with high polish */}
            <svg
              className="w-44 h-44"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="200" height="200" fill="white" rx="12" />
              {/* Outer markers */}
              <rect x="15" y="15" width="45" height="45" rx="8" fill="#4338CA" />
              <rect x="23" y="23" width="29" height="29" rx="4" fill="white" />
              <rect x="29" y="29" width="17" height="17" rx="3" fill="#4338CA" />

              <rect x="140" y="15" width="45" height="45" rx="8" fill="#4338CA" />
              <rect x="148" y="23" width="29" height="29" rx="4" fill="white" />
              <rect x="154" y="29" width="17" height="17" rx="3" fill="#4338CA" />

              <rect x="15" y="140" width="45" height="45" rx="8" fill="#4338CA" />
              <rect x="23" y="148" width="29" height="29" rx="4" fill="white" />
              <rect x="29" y="154" width="17" height="17" rx="3" fill="#4338CA" />

              {/* Data matrix dots */}
              <rect x="75" y="20" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="95" y="20" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="115" y="20" width="12" height="12" rx="2" fill="#1E1B4B" />

              <rect x="75" y="45" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="95" y="45" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="115" y="45" width="12" height="12" rx="2" fill="#4F46E5" />

              <rect x="20" y="75" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="45" y="75" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="70" y="75" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="95" y="75" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="120" y="75" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="145" y="75" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="170" y="75" width="12" height="12" rx="2" fill="#1E1B4B" />

              <rect x="75" y="95" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="100" y="95" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="125" y="95" width="12" height="12" rx="2" fill="#4F46E5" />

              <rect x="20" y="115" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="45" y="115" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="70" y="115" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="95" y="115" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="120" y="115" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="145" y="115" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="170" y="115" width="12" height="12" rx="2" fill="#1E1B4B" />

              <rect x="75" y="140" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="95" y="140" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="115" y="140" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="140" y="140" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="165" y="140" width="12" height="12" rx="2" fill="#1E1B4B" />

              <rect x="75" y="165" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="95" y="165" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="115" y="165" width="12" height="12" rx="2" fill="#4F46E5" />
              <rect x="140" y="165" width="12" height="12" rx="2" fill="#1E1B4B" />
              <rect x="165" y="165" width="12" height="12" rx="2" fill="#4F46E5" />
            </svg>
          </div>

          <div className="mt-3">
            <span className="text-xs text-slate-500">
              자녀 휴대폰 카메라로 위 QR 코드를 스캔하세요.
            </span>
          </div>

          {/* 6 Digit Code */}
          <div className="mt-3 bg-slate-50 px-4 py-2 rounded-xl border border-slate-200 flex items-center gap-3">
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block font-medium">
                또는 6자리 초대코드 직접 입력
              </span>
              <span className="font-mono text-lg font-black tracking-wider text-indigo-700">
                {activeChild.pairingCode}
              </span>
            </div>

            <button
              onClick={handleCopyCode}
              className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-indigo-600 shadow-2xs transition"
              title="코드 복사"
            >
              {copied ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <button
            onClick={handleCopyLink}
            className="w-full py-2.5 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-1.5 shadow-xs transition"
          >
            <Share2 className="w-4 h-4" />
            <span>카카오톡 / 문자 초댓링크 복사</span>
          </button>

          <div className="flex items-center gap-1.5 justify-center text-[11px] text-slate-500 mt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>암호화된 안전한 1:1 디바이스 페어링 보안 프로토콜 적용</span>
          </div>
        </div>
      </div>
    </div>
  );
};
