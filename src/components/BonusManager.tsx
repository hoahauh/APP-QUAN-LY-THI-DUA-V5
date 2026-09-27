import React, { useState } from 'react';
import { 
  Gift, 
  Plus, 
  Trash2, 
  Award, 
  CheckCircle2, 
  Sparkles, 
  HelpCircle,
  Calendar,
  Tag
} from 'lucide-react';
import { BonusRecord, BonusRule, ClassInfo, UserRole, GradeLevel } from '../types';

interface BonusManagerProps {
  bonuses: BonusRecord[];
  bonusRules: BonusRule[];
  classes: ClassInfo[];
  weekNumber: number;
  currentRole: UserRole;
  onAddBonus: (bonus: Omit<BonusRecord, 'id' | 'createdAt'>) => void;
  onDeleteBonus: (id: string) => void;
}

export const BonusManager: React.FC<BonusManagerProps> = ({
  bonuses,
  bonusRules,
  classes,
  weekNumber,
  currentRole,
  onAddBonus,
  onDeleteBonus
}) => {
  const [targetWeek, setTargetWeek] = useState<number>(weekNumber);
  const [selectedClassId, setSelectedClassId] = useState<string>('1A1');
  const [selectedRuleCode, setSelectedRuleCode] = useState<string>('TH01');
  const [customTitle, setCustomTitle] = useState<string>('Tuần học tốt (100% tiết đạt xếp loại A)');
  const [pointsAdded, setPointsAdded] = useState<number>(5);
  const [reason, setReason] = useState<string>('Tất cả các tiết học đạt xếp loại Tốt theo Sổ đầu bài');
  const [approvedBy, setApprovedBy] = useState<string>('Thầy Nguyễn Hoàng Nam (TPT)');
  const [showToast, setShowToast] = useState<boolean>(false);

  // Filtered bonuses for the selected week
  const weekBonuses = bonuses.filter((b) => b.weekNumber === targetWeek);

  const handleRuleSelect = (ruleCode: string) => {
    setSelectedRuleCode(ruleCode);
    const rule = bonusRules.find((r) => r.code === ruleCode);
    if (rule) {
      setCustomTitle(rule.name);
      setPointsAdded(rule.defaultPoints);
      setReason(rule.description || '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];

    onAddBonus({
      weekNumber: targetWeek,
      classId: selectedClassId,
      date: today,
      ruleCode: selectedRuleCode,
      title: customTitle.trim(),
      pointsAdded,
      reason: reason.trim(),
      approvedBy: approvedBy.trim(),
    });

    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-600 to-cyan-700 text-white p-6 rounded-2xl shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-black/20 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>Hệ Thống Biến Số Linh Hoạt (Dynamic Bonus)</span>
            </div>
            <h2 className="text-xl font-bold">Quản Lý & Phân Bổ Điểm Thưởng Thi Đua</h2>
            <p className="text-xs text-emerald-100 mt-1 max-w-2xl leading-relaxed">
              Điểm thưởng được thiết kế như một biến số độc lập (Dynamic Variable), cộng thẳng vào tổng điểm tuần của lớp mà <strong>không làm biến dạng thang điểm gốc 100 điểm</strong> của khối Tiểu học (60+40) và khối THCS (40+30+30).
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl text-center">
            <span className="text-xs text-emerald-200 block">Tổng điểm thưởng tuần {targetWeek}:</span>
            <span className="text-2xl font-black text-white">
              +{weekBonuses.reduce((sum, b) => sum + b.pointsAdded, 0)} đ
            </span>
          </div>
        </div>
      </div>

      {showToast && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">
              Đã cộng +{pointsAdded} điểm thưởng cho lớp {selectedClassId} thành công!
            </span>
          </div>
        </div>
      )}

      {/* Grid: Form Left, List Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-500" />
              Phiếu Khen Thưởng / Cộng Điểm
            </h3>
            {currentRole !== 'TPT' && (
              <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">
                TPT phê duyệt
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Week & Target Class */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="bonus-week-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tuần Áp Dụng
                </label>
                <select
                  id="bonus-week-select"
                  aria-label="Chọn tuần áp dụng điểm thưởng"
                  value={targetWeek}
                  onChange={(e) => setTargetWeek(Number(e.target.value))}
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                    <option key={w} value={w}>
                      Tuần {w}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="bonus-class-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Lớp Được Thưởng
                </label>
                <select
                  id="bonus-class-select"
                  aria-label="Chọn lớp được thưởng"
                  value={selectedClassId}
                  onChange={(e) => setSelectedClassId(e.target.value)}
                  className="w-full text-xs font-bold px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                >
                  <optgroup label="Khối Tiểu Học (19 lớp)">
                    {classes.filter(c => c.gradeLevel === 'TIEU_HOC').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                  <optgroup label="Khối THCS (12 lớp)">
                    {classes.filter(c => c.gradeLevel === 'THCS').map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Preset Bonus Category */}
            <div>
              <label htmlFor="bonus-template-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Danh Mục Khen Thưởng Mẫu
              </label>
              <select
                id="bonus-template-select"
                aria-label="Chọn mẫu khen thưởng"
                value={selectedRuleCode}
                onChange={(e) => handleRuleSelect(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              >
                {bonusRules.map((br) => (
                  <option key={br.code} value={br.code}>
                    [{br.code}] {br.name} (+{br.defaultPoints}đ)
                  </option>
                ))}
              </select>
            </div>

            {/* Custom Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Tiêu Đề Khen Thưởng
              </label>
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            {/* Points to Add */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Số Điểm Cộng (+)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="1"
                  max="15"
                  value={pointsAdded}
                  onChange={(e) => setPointsAdded(Math.max(1, Number(e.target.value)))}
                  className="w-24 text-center text-sm font-black px-2 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                  required
                />
                <span className="text-xs text-slate-500 font-medium">điểm cộng trực tiếp vào tổng tuần</span>
              </div>
            </div>

            {/* Reason */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lý Do / Thành Tích Cụ Thể
              </label>
              <textarea
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ví dụ: Em Nguyễn Văn B đạt Giải Nhất Hội thi Kể chuyện Bác Hồ cấp Thành phố..."
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            {/* Approver */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Cán Bộ Phê Duyệt
              </label>
              <input
                type="text"
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
                required
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow transition-all flex items-center justify-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Phê Duyệt & Cộng +{pointsAdded} Điểm</span>
            </button>
          </form>
        </div>

        {/* List Column */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-emerald-500" />
                Danh Sách Điểm Thưởng Đã Duyệt (Tuần {targetWeek})
              </h3>
              <p className="text-xs text-slate-400">
                Có {weekBonuses.length} lượt khen thưởng trong tuần này
              </p>
            </div>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto space-y-3 max-h-[500px] pr-1">
            {weekBonuses.length === 0 ? (
              <div className="text-center py-16 text-slate-400 text-xs">
                Chưa có lớp nào được cộng điểm thưởng trong Tuần {targetWeek}.
              </div>
            ) : (
              weekBonuses.map((b) => (
                <div
                  key={b.id}
                  className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-emerald-100 dark:border-emerald-900/30 text-xs hover:border-emerald-400 transition-colors flex items-start justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 dark:text-white bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded text-xs">
                        Lớp {b.classId}
                      </span>
                      <span className="font-black text-emerald-600 dark:text-emerald-400 text-sm font-mono">
                        +{b.pointsAdded} điểm
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {b.date}
                      </span>
                    </div>

                    <div className="font-bold text-slate-800 dark:text-slate-100">
                      {b.title}
                    </div>

                    <div className="text-slate-600 dark:text-slate-300 text-[11px]">
                      {b.reason}
                    </div>

                    <div className="text-[10px] text-slate-400 pt-0.5">
                      Duyệt bởi: <span className="text-slate-600 dark:text-slate-300 font-medium">{b.approvedBy}</span>
                    </div>
                  </div>

                  {currentRole === 'TPT' && (
                    <button
                      onClick={() => onDeleteBonus(b.id)}
                      className="text-slate-400 hover:text-rose-500 p-1 opacity-50 group-hover:opacity-100 transition-opacity"
                      title="Thu hồi điểm thưởng này"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
