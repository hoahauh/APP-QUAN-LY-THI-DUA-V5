import React, { useState } from 'react';
import { 
  Check, 
  AlertCircle, 
  Send, 
  User, 
  Calendar, 
  Clock, 
  Tag, 
  FileText,
  Search,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { ClassInfo, ViolationRule, ViolationRecord, CategoryType, UserRole, GradeLevel } from '../types';

interface RedStarEntryFormProps {
  classes: ClassInfo[];
  rules: ViolationRule[];
  weekNumber: number;
  currentRole: UserRole;
  recentViolations: ViolationRecord[];
  onSubmitViolation: (record: Omit<ViolationRecord, 'id' | 'createdAt'>) => void;
  onDeleteViolation?: (id: string) => void;
}

export const RedStarEntryForm: React.FC<RedStarEntryFormProps> = ({
  classes,
  rules,
  weekNumber,
  currentRole,
  recentViolations,
  onSubmitViolation,
  onDeleteViolation
}) => {
  // Form state
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [session, setSession] = useState<'SANG' | 'CHIEU'>('SANG');
  const [levelFilter, setLevelFilter] = useState<'ALL' | GradeLevel>('ALL');
  const [selectedClassId, setSelectedClassId] = useState<string>('1A1');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType>('NE_NEP');
  const [selectedRuleId, setSelectedRuleId] = useState<string>('NN01');
  const [customPoints, setCustomPoints] = useState<number>(1);
  const [studentName, setStudentName] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [reporterName, setReporterName] = useState<string>(
    currentRole === 'CO_DO' ? 'Nguyễn Mai Anh (Cờ Đỏ)' : 'Thầy Nguyễn Hoàng Nam (TPT)'
  );
  const [successToast, setSuccessToast] = useState(false);

  // Compute day of week in Vietnamese
  const getDayOfWeekVN = (dateStr: string) => {
    const d = new Date(dateStr);
    const day = d.getDay();
    switch (day) {
      case 0: return 'Chủ Nhật';
      case 1: return 'Thứ Hai';
      case 2: return 'Thứ Ba';
      case 3: return 'Thứ Tư';
      case 4: return 'Thứ Năm';
      case 5: return 'Thứ Sáu';
      case 6: return 'Thứ Bảy';
      default: return 'Thứ Hai';
    }
  };

  const selectedClass = classes.find((c) => c.id === selectedClassId);
  const selectedRule = rules.find((r) => r.id === selectedRuleId);

  // Filter rules by category and level
  const filteredRules = rules.filter((r) => {
    if (r.category !== selectedCategory) return false;
    if (selectedClass) {
      if (selectedClass.gradeLevel === 'TIEU_HOC' && r.applicableLevel === 'THCS') return false;
    }
    return true;
  });

  // When rule changes, update default points
  const handleRuleChange = (ruleId: string) => {
    setSelectedRuleId(ruleId);
    const rule = rules.find((r) => r.id === ruleId);
    if (rule) {
      setCustomPoints(rule.defaultPoints);
    }
  };

  // Filter classes by level tab
  const filteredClasses = classes.filter((c) => {
    if (levelFilter === 'ALL') return true;
    return c.gradeLevel === levelFilter;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedRule) return;

    onSubmitViolation({
      weekNumber,
      classId: selectedClass.id,
      date,
      dayOfWeek: getDayOfWeekVN(date),
      session,
      ruleId: selectedRule.id,
      ruleCode: selectedRule.code,
      ruleName: selectedRule.name,
      category: selectedRule.category,
      pointsDeducted: customPoints,
      studentName: studentName.trim() || undefined,
      note: note.trim() || undefined,
      reporterRole: currentRole,
      reporterName: reporterName.trim() || (currentRole === 'CO_DO' ? 'Đội Cờ Đỏ' : 'Tổng Phụ Trách'),
      status: 'APPROVED',
    });

    // Reset student and note
    setStudentName('');
    setNote('');
    setSuccessToast(true);
    setTimeout(() => setSuccessToast(false), 3000);
  };

  // Filter recent violations for this week
  const thisWeekViolations = recentViolations.filter((v) => v.weekNumber === weekNumber);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-amber-600 text-white p-5 rounded-2xl shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-black/20 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-300 animate-ping"></span>
              <span>Phiếu Nhập Liệu Chuẩn Hóa • Tuần {weekNumber}</span>
            </div>
            <h2 className="text-xl font-bold">Chấm Vi Phạm Nề Nếp & Học Tập</h2>
            <p className="text-xs text-rose-100 mt-1">
              Giao diện tối ưu cho Đội Cờ Đỏ ghi nhận trực tiếp theo ca trực • Dữ liệu tự động trừ vào quỹ điểm tuần
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl text-right">
            <span className="text-xs text-rose-200 block">Người trực chấm:</span>
            <span className="text-sm font-bold text-white">{reporterName}</span>
          </div>
        </div>
      </div>

      {successToast && (
        <div className="bg-emerald-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span className="text-sm font-semibold">
              Ghi nhận vi phạm thành công! Điểm số lớp {selectedClass?.name} đã được cập nhật ngay lập tức.
            </span>
          </div>
          <span className="text-xs font-mono bg-white/20 px-2 py-0.5 rounded">-{customPoints}đ</span>
        </div>
      )}

      {/* Main 2-column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Row 1: Date & Session */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-rose-500" />
                  <span>Ngày vi phạm ({getDayOfWeekVN(date)})</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full text-xs font-medium px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>Buổi trực</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSession('SANG')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      session === 'SANG'
                        ? 'bg-amber-500 text-slate-900 border-amber-600 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    ☀️ Buổi Sáng
                  </button>
                  <button
                    type="button"
                    onClick={() => setSession('CHIEU')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      session === 'CHIEU'
                        ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    🌙 Buổi Chiều
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Select Class (with level toggle) */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5 text-rose-500" />
                  <span>Chọn Lớp Vi Phạm (Tổng 31 Lớp)</span>
                </label>
                {/* Level toggle filter */}
                <div className="inline-flex p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-[11px]">
                  <button
                    type="button"
                    onClick={() => setLevelFilter('ALL')}
                    className={`px-2 py-0.5 rounded-md font-semibold ${
                      levelFilter === 'ALL'
                        ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Tất cả (31)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLevelFilter('TIEU_HOC')}
                    className={`px-2 py-0.5 rounded-md font-semibold ${
                      levelFilter === 'TIEU_HOC'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    Tiểu học (19)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLevelFilter('THCS')}
                    className={`px-2 py-0.5 rounded-md font-semibold ${
                      levelFilter === 'THCS'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'text-slate-500'
                    }`}
                  >
                    THCS (12)
                  </button>
                </div>
              </div>

              {/* Class Buttons Grid */}
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                {filteredClasses.map((cls) => (
                  <button
                    key={cls.id}
                    type="button"
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`py-1.5 px-1 rounded-lg text-xs font-bold transition-all truncate text-center ${
                      selectedClassId === cls.id
                        ? 'bg-rose-600 text-white shadow-sm ring-2 ring-rose-300 dark:ring-rose-500'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-600 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    {cls.id}
                  </button>
                ))}
              </div>

              {selectedClass && (
                <div className="mt-1.5 text-xs text-slate-500 flex items-center justify-between">
                  <span>
                    {selectedClass.name} • GVCN: <strong className="text-slate-700 dark:text-slate-300">{selectedClass.teacherName}</strong>
                  </span>
                  <span className="text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded font-mono">
                    Cờ đỏ: {selectedClass.redStarStudent}
                  </span>
                </div>
              )}
            </div>

            {/* Row 3: Category Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nhóm Tiêu Chí Vi Phạm
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('NE_NEP');
                    const firstRule = rules.find((r) => r.category === 'NE_NEP');
                    if (firstRule) handleRuleChange(firstRule.id);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all flex flex-col items-center ${
                    selectedCategory === 'NE_NEP'
                      ? 'bg-blue-600 text-white border-blue-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>1. Nề Nếp</span>
                  <span className="text-[10px] opacity-80">
                    {selectedClass?.gradeLevel === 'TIEU_HOC' ? 'Quỹ 60đ' : 'Quỹ 40đ'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('HOC_TAP');
                    const firstRule = rules.find((r) => r.category === 'HOC_TAP');
                    if (firstRule) handleRuleChange(firstRule.id);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all flex flex-col items-center ${
                    selectedCategory === 'HOC_TAP'
                      ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>2. Học Tập</span>
                  <span className="text-[10px] opacity-80">
                    {selectedClass?.gradeLevel === 'TIEU_HOC' ? 'Không tính' : 'Quỹ 30đ'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedCategory('PHONG_TRAO');
                    const firstRule = rules.find((r) => r.category === 'PHONG_TRAO');
                    if (firstRule) handleRuleChange(firstRule.id);
                  }}
                  className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all flex flex-col items-center ${
                    selectedCategory === 'PHONG_TRAO'
                      ? 'bg-emerald-600 text-white border-emerald-700 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <span>3. Phong Trào</span>
                  <span className="text-[10px] opacity-80">
                    {selectedClass?.gradeLevel === 'TIEU_HOC' ? 'Quỹ 40đ' : 'Quỹ 30đ'}
                  </span>
                </button>
              </div>
            </div>

            {/* Row 4: Select Rule & Point Deduction */}
            <div>
              <label htmlFor="rule-select" className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lỗi Vi Phạm Cụ Thể
              </label>
              <select
                id="rule-select"
                aria-label="Chọn lỗi vi phạm cụ thể"
                value={selectedRuleId}
                onChange={(e) => handleRuleChange(e.target.value)}
                className="w-full text-xs font-medium px-3 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                {filteredRules.map((r) => (
                  <option key={r.id} value={r.id}>
                    [{r.code}] {r.name} (-{r.defaultPoints}đ)
                  </option>
                ))}
              </select>
            </div>

            {/* Row 5: Points deduction & Student Name */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Điểm Trừ
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={customPoints}
                    onChange={(e) => setCustomPoints(Math.max(1, Number(e.target.value)))}
                    className="w-full text-center text-sm font-black px-2 py-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <span className="text-xs text-slate-400">điểm</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Tên Học Sinh Vi Phạm (nếu có cá nhân)
                </label>
                <input
                  type="text"
                  placeholder="Ví dụ: Nguyễn Văn A..."
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            {/* Row 6: Note / Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Ghi Chú / Chi Tiết Vi Phạm
              </label>
              <textarea
                rows={2}
                placeholder="Mô tả cụ thể (ví dụ: Đến muộn lúc 7h45; không sơ vin; phòng học chưa lau bảng...)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            {/* Reporter Name input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-rose-500" />
                <span>Họ Tên Người Chấm / Thành Viên Đội Cờ Đỏ</span>
              </label>
              <input
                type="text"
                value={reporterName}
                onChange={(e) => setReporterName(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-md hover:shadow-lg transition-all flex items-center justify-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>Ghi Nhận Vi Phạm (-{customPoints} điểm)</span>
            </button>
          </form>
        </div>

        {/* Right Column: Live Feed of Recorded Violations for this Week */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-rose-500" />
                Lịch Sử Chấm Gần Đây (Tuần {weekNumber})
              </h3>
              <p className="text-xs text-slate-400">
                {thisWeekViolations.length} lượt vi phạm đã được ghi nhận
              </p>
            </div>
          </div>

          <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 max-h-[480px] pr-1">
            {thisWeekViolations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                Chưa có vi phạm nào được ghi nhận trong tuần này.
              </div>
            ) : (
              thisWeekViolations.map((v) => (
                <div
                  key={v.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs relative group hover:border-rose-400 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-bold text-slate-900 dark:text-white bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[11px]">
                          {v.classId}
                        </span>
                        <span className="font-semibold text-rose-600 dark:text-rose-400 font-mono">
                          -{v.pointsDeducted}đ
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {v.dayOfWeek} • {v.session === 'SANG' ? 'Sáng' : 'Chiều'} ({v.date})
                        </span>
                      </div>
                      <div className="font-medium text-slate-800 dark:text-slate-200 mt-1">
                        [{v.ruleCode}] {v.ruleName}
                      </div>
                    </div>

                    {/* Delete action if TPT or reporter */}
                    {onDeleteViolation && (
                      <button
                        onClick={() => onDeleteViolation(v.id)}
                        className="text-slate-400 hover:text-rose-500 opacity-60 group-hover:opacity-100 p-1"
                        title="Xóa bản ghi này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {v.studentName && (
                    <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                      Học sinh: <span className="font-medium text-slate-800 dark:text-slate-200">{v.studentName}</span>
                    </div>
                  )}

                  {v.note && (
                    <div className="text-[11px] text-slate-500 italic mt-0.5">
                      "{v.note}"
                    </div>
                  )}

                  <div className="text-[10px] text-slate-400 mt-1 flex items-center justify-between">
                    <span>Người chấm: {v.reporterName}</span>
                    <span className="text-emerald-500 font-medium">Đã cập nhật</span>
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
