import React, { useState, useRef, useEffect } from 'react';
import { 
  ChatMessage, 
  FamilyMember, 
  UserRole, 
  Child, 
  ChatFileAttachment 
} from '../types';
import { 
  Send, 
  Paperclip, 
  Image as ImageIcon, 
  FileText, 
  MapPin, 
  Check, 
  CheckCheck, 
  Download, 
  Smile, 
  Sparkles, 
  X, 
  Users, 
  Lock,
  Battery,
  Radio,
  ExternalLink
} from 'lucide-react';
import { getCurrentTimeStr } from '../utils/geo';

interface FamilyChatProps {
  messages: ChatMessage[];
  familyMembers: FamilyMember[];
  currentRole: UserRole;
  activeChild: Child;
  onSendMessage: (msg: ChatMessage) => void;
}

export const FamilyChat: React.FC<FamilyChatProps> = ({
  messages,
  familyMembers,
  currentRole,
  activeChild,
  onSendMessage,
}) => {
  const [inputText, setInputText] = useState('');
  // For parents, allow toggling between Mom and Dad
  const [parentSender, setParentSender] = useState<'mem-mom' | 'mem-dad'>('mem-mom');
  const [previewImageModal, setPreviewImageModal] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [pendingFile, setPendingFile] = useState<ChatFileAttachment | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Determine current sender based on mode
  const currentSenderMember: FamilyMember =
    currentRole === 'parent'
      ? familyMembers.find((m) => m.id === parentSender) || familyMembers[0]
      : familyMembers.find((m) => m.id === activeChild.id) || familyMembers[2];

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Quick message chips
  const quickMessages = [
    '🚌 셔틀버스 안전하게 탑승했어요!',
    '📍 학원에 잘 도착했습니다!',
    '📝 오늘 숙제 완료했어요!',
    '🏠 수업 끝나고 집으로 출발해요~',
    '❤️ 안전하게 잘 다녀와!',
  ];

  const handleSend = (textToSend?: string) => {
    const text = textToSend !== undefined ? textToSend : inputText;
    if (!text.trim() && !pendingFile) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentSenderMember.id,
      senderName: currentSenderMember.name,
      senderRelation: currentSenderMember.relation,
      senderAvatar: currentSenderMember.avatar,
      senderRole: currentRole,
      text: text.trim(),
      timestamp: getCurrentTimeStr(),
      attachment: pendingFile || undefined,
      readCount: familyMembers.length - 1,
    };

    onSendMessage(newMsg);
    setInputText('');
    setPendingFile(null);
  };

  // Handle file selection from local device
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];

    const isImg = file.type.startsWith('image/');
    const isPdf = file.type.includes('pdf');
    const type: 'image' | 'pdf' | 'doc' = isImg ? 'image' : isPdf ? 'pdf' : 'doc';

    const reader = new FileReader();
    reader.onload = () => {
      const resultUrl = reader.result as string;
      setPendingFile({
        name: file.name,
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        type,
        url: isImg ? resultUrl : '#',
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Handle Drag and Drop
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      const isImg = file.type.startsWith('image/');
      const isPdf = file.type.includes('pdf');
      const type: 'image' | 'pdf' | 'doc' = isImg ? 'image' : isPdf ? 'pdf' : 'doc';

      const reader = new FileReader();
      reader.onload = () => {
        setPendingFile({
          name: file.name,
          size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
          type,
          url: isImg ? (reader.result as string) : '#',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  // Quick Share Current Location
  const handleShareCurrentLocation = () => {
    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentSenderMember.id,
      senderName: currentSenderMember.name,
      senderRelation: currentSenderMember.relation,
      senderAvatar: currentSenderMember.avatar,
      senderRole: currentRole,
      text: `📍 현재 안심 위치를 공유합니다: ${activeChild.currentLocation.address || '대치동 학원가'}`,
      timestamp: getCurrentTimeStr(),
      locationShare: {
        name: activeChild.currentLocation.address || '대치동 은마아파트 사거리 인근',
        lat: activeChild.currentLocation.lat,
        lng: activeChild.currentLocation.lng,
      },
      readCount: familyMembers.length - 1,
    };
    onSendMessage(newMsg);
  };

  return (
    <div 
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={handleDrop}
      className={`bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs flex flex-col h-[650px] relative transition ${
        isDragOver ? 'ring-2 ring-indigo-500 bg-indigo-50/20' : ''
      }`}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf,.doc,.docx"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Drag & Drop Banner if hovering */}
      {isDragOver && (
        <div className="absolute inset-0 z-30 bg-indigo-600/10 backdrop-blur-2xs border-2 border-dashed border-indigo-500 rounded-2xl flex items-center justify-center text-indigo-700 font-bold text-sm pointer-events-none">
          파일을 이곳에 끌어다 놓으면 채팅에 첨부됩니다.
        </div>
      )}

      {/* Chat Room Top Bar */}
      <div className="p-3.5 sm:p-4 bg-slate-50/90 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xs">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                우리 가족 안심 단톡방 🏡
              </h3>
              <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" />
                종단간 안심 암호화
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              학부모와 연동된 자녀가 실시간 메시지, 숙제 및 위치를 공유하는 프라이빗 공간
            </p>
          </div>
        </div>

        {/* Sender Switcher (for Parent mode) */}
        {currentRole === 'parent' ? (
          <div className="flex items-center gap-1.5 text-xs bg-white px-2 py-1 rounded-xl border border-slate-200">
            <span className="text-slate-400 text-[11px]">발신자:</span>
            <button
              onClick={() => setParentSender('mem-mom')}
              className={`px-2 py-0.5 rounded-md font-semibold transition ${
                parentSender === 'mem-mom'
                  ? 'bg-pink-100 text-pink-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              엄마
            </button>
            <span className="text-slate-300">/</span>
            <button
              onClick={() => setParentSender('mem-dad')}
              className={`px-2 py-0.5 rounded-md font-semibold transition ${
                parentSender === 'mem-dad'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              아빠
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs bg-indigo-50 text-indigo-800 font-semibold px-2.5 py-1 rounded-xl border border-indigo-200">
            <span>작성자: {activeChild.name} (학생)</span>
          </div>
        )}
      </div>

      {/* Family Member Status Bar */}
      <div className="px-4 py-2 bg-slate-100/60 border-b border-slate-200/60 flex items-center gap-3 overflow-x-auto scrollbar-none text-[11px]">
        <span className="text-slate-400 font-medium whitespace-nowrap">가족 상태:</span>
        {familyMembers.map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-1.5 bg-white px-2 py-0.5 rounded-full border border-slate-200 whitespace-nowrap"
          >
            <div className="relative">
              <img
                src={m.avatar}
                alt={m.name}
                className="w-4 h-4 rounded-full object-cover"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 ring-1 ring-white" />
            </div>
            <span className="font-semibold text-slate-700">{m.relation}</span>
          </div>
        ))}
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
        {messages.map((msg) => {
          const isMe = msg.senderId === currentSenderMember.id;

          return (
            <div
              key={msg.id}
              className={`flex gap-2.5 max-w-[85%] sm:max-w-[75%] ${
                isMe ? 'ml-auto flex-row-reverse' : ''
              }`}
            >
              {!isMe && (
                <img
                  src={msg.senderAvatar}
                  alt={msg.senderName}
                  className="w-8 h-8 rounded-full object-cover border border-white shadow-xs shrink-0 mt-0.5"
                  referrerPolicy="no-referrer"
                />
              )}

              <div className={`space-y-1 ${isMe ? 'items-end text-right' : 'text-left'}`}>
                {/* Sender Name & Relation */}
                {!isMe && (
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-600 pl-1">
                    <span className="font-bold text-slate-900">{msg.senderName}</span>
                    <span className="text-[10px] px-1.5 py-0.2 bg-slate-200 text-slate-700 rounded-md">
                      {msg.senderRelation}
                    </span>
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed shadow-xs transition-all ${
                    isMe
                      ? 'bg-indigo-600 text-white rounded-tr-none'
                      : 'bg-white text-slate-800 border border-slate-200/90 rounded-tl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Image Attachment */}
                  {msg.attachment && msg.attachment.type === 'image' && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-white/20">
                      <img
                        src={msg.attachment.url}
                        alt={msg.attachment.name}
                        onClick={() => setPreviewImageModal(msg.attachment?.url || null)}
                        className="max-h-48 w-full object-cover cursor-pointer hover:opacity-95 transition"
                      />
                      <div className="p-1.5 bg-black/40 text-white text-[10px] flex items-center justify-between">
                        <span className="truncate">{msg.attachment.name}</span>
                        <span>{msg.attachment.size}</span>
                      </div>
                    </div>
                  )}

                  {/* Document / PDF Attachment */}
                  {msg.attachment && msg.attachment.type !== 'image' && (
                    <div
                      className={`mt-2 p-2.5 rounded-xl border flex items-center justify-between gap-3 ${
                        isMe
                          ? 'bg-indigo-700/60 border-indigo-400/40 text-white'
                          : 'bg-slate-50 border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileText className={`w-5 h-5 shrink-0 ${isMe ? 'text-indigo-200' : 'text-indigo-600'}`} />
                        <div className="min-w-0">
                          <p className="font-semibold text-[11px] truncate">
                            {msg.attachment.name}
                          </p>
                          <span className={`text-[10px] ${isMe ? 'text-indigo-200' : 'text-slate-400'}`}>
                            {msg.attachment.size} · PDF 문서
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => alert(`[${msg.attachment?.name}] 파일을 다운로드합니다.`)}
                        className={`p-1.5 rounded-lg transition ${
                          isMe ? 'hover:bg-indigo-600 text-white' : 'hover:bg-slate-200 text-slate-600'
                        }`}
                        title="다운로드"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Location Share Card */}
                  {msg.locationShare && (
                    <div
                      className={`mt-2 p-2.5 rounded-xl border flex items-center gap-2 text-[11px] ${
                        isMe
                          ? 'bg-indigo-700/60 border-indigo-400/40 text-white'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-900'
                      }`}
                    >
                      <MapPin className="w-4 h-4 shrink-0 text-emerald-500" />
                      <div className="flex-1 min-w-0">
                        <span className="font-bold block truncate">
                          {msg.locationShare.name}
                        </span>
                        <span className="text-[10px] opacity-80">
                          실시간 GPS 좌표 연동됨
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Timestamp & Read Receipts */}
                <div
                  className={`flex items-center gap-1.5 text-[10px] text-slate-400 px-1 ${
                    isMe ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  <span>·</span>
                  <span className="text-indigo-600 font-semibold">
                    읽음 {msg.readCount}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Canned Action Chips */}
      <div className="p-2 bg-slate-50 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-[11px]">
        {quickMessages.map((quick, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(quick)}
            className="px-2.5 py-1 rounded-full bg-white border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 whitespace-nowrap transition shadow-2xs font-medium"
          >
            {quick}
          </button>
        ))}
      </div>

      {/* Pending File Attachment Banner */}
      {pendingFile && (
        <div className="px-4 py-2 bg-indigo-50 border-t border-indigo-100 flex items-center justify-between text-xs text-indigo-900">
          <div className="flex items-center gap-2 truncate">
            {pendingFile.type === 'image' ? (
              <ImageIcon className="w-4 h-4 text-indigo-600 shrink-0" />
            ) : (
              <FileText className="w-4 h-4 text-indigo-600 shrink-0" />
            )}
            <span className="font-semibold truncate">{pendingFile.name}</span>
            <span className="text-indigo-500 text-[11px]">({pendingFile.size})</span>
          </div>
          <button
            onClick={() => setPendingFile(null)}
            className="p-1 rounded-lg text-indigo-400 hover:text-indigo-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
        {/* Attachment Button */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="p-2 rounded-xl text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition"
          title="사진 / 숙제 파일 첨부"
        >
          <Paperclip className="w-5 h-5" />
        </button>

        {/* Share Location Button */}
        <button
          onClick={handleShareCurrentLocation}
          className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition"
          title="현재 자녀 실시간 위치 안심 전송"
        >
          <MapPin className="w-5 h-5" />
        </button>

        {/* Text Input */}
        <input
          type="text"
          placeholder={`${currentSenderMember.name} (으)로 메시지 입력...`}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
        />

        {/* Send Button */}
        <button
          id="btn-send-chat"
          onClick={() => handleSend()}
          disabled={!inputText.trim() && !pendingFile}
          className={`p-2.5 rounded-xl transition flex items-center justify-center ${
            inputText.trim() || pendingFile
              ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-xs'
              : 'bg-slate-100 text-slate-400 cursor-not-allowed'
          }`}
        >
          <Send className="w-4 h-4" />
        </button>
      </div>

      {/* Image Preview Lightbox Modal */}
      {previewImageModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-2xl w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
            <button
              onClick={() => setPreviewImageModal(null)}
              className="absolute top-3 right-3 z-10 p-2 bg-black/60 hover:bg-black/80 rounded-full text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={previewImageModal}
              alt="Preview"
              className="w-full max-h-[80vh] object-contain bg-slate-900"
            />
          </div>
        </div>
      )}
    </div>
  );
};
