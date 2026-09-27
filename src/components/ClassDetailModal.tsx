import React from 'react';
import { 
  X, 
  Trophy, 
  Flag, 
  User, 
  Calendar, 
  Award, 
  AlertTriangle, 
  CheckCircle2, 
  Printer,
  MessageSquare
} from 'lucide-react';
import { ClassInfo, WeeklyClassScore, ViolationRecord, BonusRecord, UserRole } from '../types';

interface ClassDetailModalProps {
  classInfo: ClassInfo;
  weeklyScore: WeeklyClassScore;
  violations: ViolationRecord[];
  bonuses: BonusRecord[];
  weekNumber: number;
  currentRole: UserRole;
  onClose: () => void;
  onOpenDispute?: (record: ViolationRecord) => void;
}

export const ClassDetailModal: React.FC<ClassDetailModalProps> = ({
  classInfo,
  weeklyScore,
  violations,
  bonuses,
  weekNumber,
  currentRole,
  onClose,
  onOpenDispute
}) => {
  const isTieuHoc = classInfo.gradeLevel === 'TIEU_HOC';
  const classViolations = violations.filter((v) => v.classId === classInfo.id && v.weekNumber === weekNumber);
  const classBonuses = bonuses.filter((b) => b.classId === classInfo.id && b.weekNumber === weekNumber);

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-black text-lg">
              {classInfo.id}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-black text-white">{classInfo.name}</h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  isTieuHoc ? 'bg-amber-500/20 text-amber-300' : 'bg-rose-500/20 text-rose-300'
                }`}>
                  {isTieuHoc ? 'Khối Tiểu Học' : 'Khối THCS'}
                </span>
                {weeklyScore.hasRotatingFlag && (
                  <span className="flex items-center gap-1 bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full animate-pulse">
                    <Flag className="w-3 h-3 fill-white" /> CỜ LUÂN LƯU
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                GVCN: <span className="text-slate-200 font-medium">{classInfo.teacherName}</span> • Phòng {classInfo.roomNumber} • Sĩ số {classInfo.studentCount} HS
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="In phiếu thi đua lớp"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Score Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hạng Khối</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                #{weeklyScore.rankInGradeLevel}
              </span>
              <span className="text-[11px] text-slate-500 block">
                {isTieuHoc ? '/19 lớp' : '/12 lớp'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Hạng Toàn Trường</span>
              <span className="text-2xl font-black text-slate-900 dark:text-white">
                #{weeklyScore.rankOverall}
              </span>
              <span className="text-[11px] text-slate-500 block">/31 lớp liên cấp</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Tổng Điểm Tuần</span>
              <span className="text-2xl font-black text-amber-500">
                {weeklyScore.totalScore}
              </span>
              <span className="text-[11px] text-slate-500 block">Thang chuẩn 100đ</span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Xếp Loại</span>
              <span className={`inline-block text-xs font-bold px-2 py-1 rounded-full mt-1.5 ${
                weeklyScore.awardTier === 'XUAT_SAC'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                  : weeklyScore.awardTier === 'TOT'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                  : weeklyScore.awardTier === 'KHA'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
              }`}>
                {weeklyScore.awardTier === 'XUAT_SAC' ? 'Xuất Sắc' : weeklyScore.awardTier === 'TOT' ? 'Tốt' : weeklyScore.awardTier === 'KHA' ? 'Khá' : 'Trung Bình'}
              </span>
            </div>
          </div>

          {/* Sub-scores breakdown */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <h3 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-3">
              Cơ Cấu Điểm Thành Phần (Tuần {weekNumber})
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Nề nếp */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">1. Nề Nếp</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {weeklyScore.scoreNeNep} / {weeklyScore.baseNeNep}đ
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-blue-600 h-full rounded-full transition-all"
                    style={{ width: `${(weeklyScore.scoreNeNep / weeklyScore.baseNeNep) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>Trừ: {weeklyScore.deductedNeNep}đ</span>
                  <span>Đạt: {Math.round((weeklyScore.scoreNeNep / weeklyScore.baseNeNep) * 100)}%</span>
                </div>
              </div>

              {/* Học tập */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">2. Học Tập</span>
                  {isTieuHoc ? (
                    <span className="text-[11px] text-slate-400 italic">Không tính</span>
                  ) : (
                    <span className="font-bold text-slate-900 dark:text-white">
                      {weeklyScore.scoreHocTap} / {weeklyScore.baseHocTap}đ
                    </span>
                  )}
                </div>
                {isTieuHoc ? (
                  <p className="text-[10px] text-slate-400 mt-2">Áp dụng công thức Tiểu học 60+40</p>
                ) : (
                  <>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                      <div 
                        className="bg-purple-600 h-full rounded-full transition-all"
                        style={{ width: `${(weeklyScore.scoreHocTap / weeklyScore.baseHocTap) * 100}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                      <span>Trừ: {weeklyScore.deductedHocTap}đ</span>
                      <span>Đạt: {Math.round((weeklyScore.scoreHocTap / weeklyScore.baseHocTap) * 100)}%</span>
                    </div>
                  </>
                )}
              </div>

              {/* Phong trào */}
              <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">3. Phong Trào</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {weeklyScore.scorePhongTrao} / {weeklyScore.basePhongTrao}đ
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${(weeklyScore.scorePhongTrao / weeklyScore.basePhongTrao) * 100}%` }}
                  />
                </div>
                <div className="text-[10px] text-slate-400 mt-1 flex justify-between">
                  <span>Trừ: {weeklyScore.deductedPhongTrao}đ</span>
                  <span>Đạt: {Math.round((weeklyScore.scorePhongTrao / weeklyScore.basePhongTrao) * 100)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Violations List */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between mb-3">
              <span className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                Danh Sách Vi Phạm Trong Tuần ({classViolations.length})
              </span>
              <span className="text-xs text-rose-600 font-mono font-bold">
                Tổng trừ: -{weeklyScore.deductedNeNep + weeklyScore.deductedHocTap + weeklyScore.deductedPhongTrao}đ
              </span>
            </h3>

            {classViolations.length === 0 ? (
              <div className="p-6 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ Tuyệt vời! Lớp {classInfo.name} không ghi nhận lỗi vi phạm nào trong tuần {weekNumber}.
              </div>
            ) : (
              <div className="space-y-2">
                {classViolations.map((v) => (
                  <div
                    key={v.id}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs flex items-start justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-rose-600 dark:text-rose-400 font-mono">
                          -{v.pointsDeducted}đ
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          [{v.ruleCode}] {v.ruleName}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {v.dayOfWeek} ({v.date}) • {v.session === 'SANG' ? 'Sáng' : 'Chiều'}
                        </span>
                      </div>
                      {v.studentName && (
                        <div className="text-slate-600 dark:text-slate-400 mt-1">
                          Học sinh: <strong>{v.studentName}</strong>
                        </div>
                      )}
                      {v.note && (
                        <div className="text-slate-500 italic mt-0.5">"{v.note}"</div>
                      )}
                      <div className="text-[10px] text-slate-400 mt-1">
                        Người chấm: {v.reporterName}
                      </div>
                    </div>

                    {currentRole === 'GVCN' && onOpenDispute && (
                      <button
                        onClick={() => onOpenDispute(v)}
                        className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded text-[10px] flex items-center space-x-1"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Khiếu nại</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bonuses List */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center justify-between mb-3">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Điểm Thưởng Phát Động ({classBonuses.length})
              </span>
              <span className="text-xs text-emerald-600 font-mono font-bold">
                Tổng cộng: +{weeklyScore.totalBonus}đ
              </span>
            </h3>

            {classBonuses.length === 0 ? (
              <div className="p-4 text-center bg-slate-50 dark:bg-slate-800/40 rounded-xl text-xs text-slate-400">
                Chưa có điểm thưởng nào trong tuần {weekNumber}.
              </div>
            ) : (
              <div className="space-y-2">
                {classBonuses.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {b.title}
                      </div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                        +{b.pointsAdded}đ
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 mt-1">{b.reason}</div>
                    <div className="text-[10px] text-slate-400 mt-1">
                      Duyệt bởi: {b.approvedBy} • Ngày: {b.date}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
