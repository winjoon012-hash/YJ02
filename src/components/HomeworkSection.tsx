import React, { useState } from 'react';
import { Academy, Child, HomeworkItem } from '../types';
import { 
  CheckSquare, 
  Square, 
  Calendar, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertCircle,
  Tag
} from 'lucide-react';

interface HomeworkSectionProps {
  child: Child;
  academies: Academy[];
  homeworks: HomeworkItem[];
  onToggleHomework: (id: string) => void;
  onAddHomework: (newHw: Omit<HomeworkItem, 'id'>) => void;
  onDeleteHomework: (id: string) => void;
}

export const HomeworkSection: React.FC<HomeworkSectionProps> = ({
  child,
  academies,
  homeworks,
  onToggleHomework,
  onAddHomework,
  onDeleteHomework,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [selectedAcademyId, setSelectedAcademyId] = useState(academies[0]?.id || '');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');

  const childHws = homeworks.filter((h) => h.childId === child.id);
  const completedCount = childHws.filter((h) => h.isCompleted).length;
  const completionRate = childHws.length > 0 ? Math.round((completedCount / childHws.length) * 100) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const acad = academies.find((a) => a.id === selectedAcademyId) || academies[0];
    onAddHomework({
      childId: child.id,
      academyId: acad.id,
      academyName: acad.name,
      title: newTitle.trim(),
      dueDate: dueDate || new Date().toISOString().split('T')[0],
      isCompleted: false,
      priority,
    });

    setNewTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-600" />
            <span>학원별 과제 및 숙제 일정</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            제출 기한 및 실시간 숙제 완료율 체크
          </p>
        </div>

        <button
          id="btn-toggle-add-hw"
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>과제 추가</span>
        </button>
      </div>

      {/* Progress Bar */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-slate-700">과제 완료율</span>
          <span className="font-bold text-indigo-600">
            {completedCount} / {childHws.length} 완료 ({completionRate}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-indigo-600 rounded-full transition-all duration-300"
            style={{ width: `${completionRate}%` }}
          />
        </div>
      </div>

      {/* Add Homework Inline Form */}
      {showAddForm && (
        <form onSubmit={handleSubmit} className="p-3.5 rounded-xl bg-indigo-50/50 border border-indigo-200/80 mb-4 space-y-3">
          <h4 className="font-bold text-xs text-indigo-900">새 숙제 등록</h4>
          
          <input
            type="text"
            placeholder="과제 내용 (예: 수학 쎈 45p~48p 오답노트 작성)"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full text-xs px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <select
              value={selectedAcademyId}
              onChange={(e) => setSelectedAcademyId(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {academies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as any)}
              className="text-xs px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="high">우선순위: 높음 (긴급)</option>
              <option value="medium">우선순위: 보통</option>
              <option value="low">우선순위: 여유</option>
            </select>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-3 py-1.5 rounded-xl text-xs font-medium text-slate-600 hover:bg-slate-200/60"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
            >
              등록 완료
            </button>
          </div>
        </form>
      )}

      {/* Homework List */}
      <div className="space-y-2">
        {childHws.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            등록된 과제가 없습니다.
          </div>
        ) : (
          childHws.map((hw) => (
            <div
              key={hw.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all ${
                hw.isCompleted
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <button
                  id={`btn-toggle-hw-${hw.id}`}
                  onClick={() => onToggleHomework(hw.id)}
                  className="text-indigo-600 hover:text-indigo-800 transition"
                >
                  {hw.isCompleted ? (
                    <CheckSquare className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <Square className="w-5 h-5 text-slate-300 hover:text-indigo-500" />
                  )}
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-semibold ${
                        hw.isCompleted ? 'line-through text-slate-400' : 'text-slate-900'
                      }`}
                    >
                      {hw.title}
                    </span>

                    {hw.priority === 'high' && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-700">
                        긴급
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500">
                    <span className="text-indigo-700 font-medium">{hw.academyName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      마감: {hw.dueDate}
                    </span>
                  </div>
                </div>
              </div>

              <button
                id={`btn-del-hw-${hw.id}`}
                onClick={() => onDeleteHomework(hw.id)}
                className="p-1 rounded-lg text-slate-300 hover:text-rose-600 transition"
                title="과제 삭제"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
