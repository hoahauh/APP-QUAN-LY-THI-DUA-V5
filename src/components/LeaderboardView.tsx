import React, { useState } from 'react';
import { 
  Trophy, 
  Flag, 
  Award, 
  Download, 
  Printer, 
  Search, 
  Eye, 
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Gift,
  DownloadCloud,
  Presentation
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { WeeklyClassScore, GradeLevel, UserRole } from '../types';
import { exportSummaryToCSV, downloadFile } from '../utils/googleSheetsHelper';

interface LeaderboardViewProps {
  scores: WeeklyClassScore[];
  weekNumber: number;
  currentRole: UserRole;
  selectedClassIdForGVCN?: string;
  onViewClassDetail: (classId: string) => void;
  onDisputeClass?: (classId: string) => void;
  onSyncSheets: () => void;
  onPullSheets?: () => void;
  onOpenSpeechModal?: () => void;
  onOpenPptxModal?: () => void;
  isSyncing: boolean;
  isPulling?: boolean;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  scores,
  weekNumber,
  currentRole,
  selectedClassIdForGVCN,
  onViewClassDetail,
  onDisputeClass,
  onSyncSheets,
  onPullSheets,
  onOpenSpeechModal,
  onOpenPptxModal,
  isSyncing,
  isPulling = false,
}) => {
  const [levelFilter, setLevelFilter] = useState<'ALL' | GradeLevel>('ALL');
  const [gradeFilter, setGradeFilter] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Trigger celebratory confetti for rank 1
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  // Filtered scores
  const filteredScores = scores.filter((item) => {
    if (levelFilter !== 'ALL' && item.gradeLevel !== levelFilter) return false;
    if (gradeFilter !== 'ALL' && item.gradeNumber !== gradeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        item.className.toLowerCase().includes(q) ||
        item.teacherName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Top 1 Tiểu học and THCS
  const topTieuHoc = scores.find((s) => s.gradeLevel === 'TIEU_HOC' && s.rankInGradeLevel === 1);
  const topThcs = scores.find((s) => s.gradeLevel === 'THCS' && s.rankInGradeLevel === 1);

  // Summary stats
  const totalViolationsWeek = scores.reduce((sum, s) => sum + s.violationCount, 0);
  const totalBonusPointsWeek = scores.reduce((sum, s) => sum + s.totalBonus, 0);
  const excellentClassesCount = scores.filter(s => s.awardTier === 'XUAT_SAC').length;

  // Export CSV
  const handleExportCSV = () => {
    const csv = exportSummaryToCSV(filteredScores, weekNumber);
    downloadFile(csv, `Bang_Thi_Dua_Tuan_${weekNumber}.csv`);
  };

  // Copy table to clipboard in tab-separated format for direct pasting into Google Sheets
  const handleCopyForGoogleSheets = () => {
    const headers = ['Hạng Khối', 'Lớp', 'Khối Cấp', 'GVCN', 'Nề Nếp', 'Học Tập', 'Phong Trào', 'Điểm Thưởng', 'Tổng Điểm', 'Xếp Loại', 'Cờ Luân Lưu'];
    const rows = filteredScores.map(s => [
      s.rankInGradeLevel,
      s.className,
      s.gradeLevel === 'TIEU_HOC' ? 'Tiểu học' : 'THCS',
      s.teacherName,
      s.scoreNeNep,
      s.gradeLevel === 'THCS' ? s.scoreHocTap : '-',
      s.scorePhongTrao,
      s.totalBonus,
      s.totalScore,
      s.awardTier === 'XUAT_SAC' ? 'Xuất sắc' : s.awardTier === 'TOT' ? 'Tốt' : s.awardTier === 'KHA' ? 'Khá' : 'Trung bình',
      s.hasRotatingFlag ? 'CỜ LUÂN LƯU' : ''
    ]);

    const tsvContent = [headers.join('\t'), ...rows.map(r => r.join('\t'))].join('\n');
    navigator.clipboard.writeText(tsvContent).then(() => {
      setCopiedNotification(true);
      setTimeout(() => setCopiedNotification(false), 3000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cờ Luân Lưu Tiểu học */}
        <div className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 rounded-2xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              Cờ Luân Lưu Tiểu Học
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-xs font-bold flex items-center gap-1">
              <Flag className="w-3 h-3 text-red-500 fill-red-500" /> Hạng 1 Khối
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {topTieuHoc ? topTieuHoc.className : '—'}
            </div>
            <div className="text-lg font-bold text-amber-600 dark:text-amber-400">
              {topTieuHoc ? `${topTieuHoc.totalScore} đ` : ''}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            GVCN: {topTieuHoc?.teacherName || 'Chưa cập nhật'}
          </p>
        </div>

        {/* Cờ Luân Lưu THCS */}
        <div className="bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/30 rounded-2xl p-4 relative overflow-hidden shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Cờ Luân Lưu THCS
            </span>
            <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-500 text-xs font-bold flex items-center gap-1">
              <Flag className="w-3 h-3 text-red-500 fill-red-500" /> Hạng 1 Khối
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {topThcs ? topThcs.className : '—'}
            </div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {topThcs ? `${topThcs.totalScore} đ` : ''}
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            GVCN: {topThcs?.teacherName || 'Chưa cập nhật'}
          </p>
        </div>

        {/* Tổng Vi Phạm Trong Tuần */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Vi Phạm Tuần {weekNumber}
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {totalViolationsWeek}
            </div>
            <span className="text-xs font-medium text-slate-500">lượt ghi nhận</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Được ghi nhận từ Đội cờ đỏ & TPT
          </p>
        </div>

        {/* Điểm Thưởng & Lớp Xuất Sắc */}
        <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Điểm Thưởng Phát Động
            </span>
            <Gift className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              +{totalBonusPointsWeek} đ
            </div>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
              {excellentClassesCount}/31 Xuất sắc
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Cộng trực tiếp không lệch thang chuẩn 100đ
          </p>
        </div>
      </div>

      {/* Filter and Action Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Level tabs & Grade select */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Level Tabs */}
          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => { setLevelFilter('ALL'); setGradeFilter('ALL'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                levelFilter === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tất Cả (31 Lớp)
            </button>
            <button
              onClick={() => { setLevelFilter('TIEU_HOC'); setGradeFilter('ALL'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                levelFilter === 'TIEU_HOC'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Tiểu Học (19 Lớp)
            </button>
            <button
              onClick={() => { setLevelFilter('THCS'); setGradeFilter('ALL'); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                levelFilter === 'THCS'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              THCS (12 Lớp)
            </button>
          </div>

          {/* Grade filter */}
          <div className="flex items-center space-x-1.5">
            <label htmlFor="grade-filter-select" className="text-xs text-slate-500 font-medium">Khối:</label>
            <select
              id="grade-filter-select"
              aria-label="Lọc theo khối"
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value="ALL">Toàn bộ</option>
              {levelFilter === 'ALL' || levelFilter === 'TIEU_HOC' ? (
                <>
                  <option value={1}>Khối 1 (4 lớp)</option>
                  <option value={2}>Khối 2 (4 lớp)</option>
                  <option value={3}>Khối 3 (4 lớp)</option>
                  <option value={4}>Khối 4 (4 lớp)</option>
                  <option value={5}>Khối 5 (3 lớp)</option>
                </>
              ) : null}
              {levelFilter === 'ALL' || levelFilter === 'THCS' ? (
                <>
                  <option value={6}>Khối 6 (3 lớp)</option>
                  <option value={7}>Khối 7 (3 lớp)</option>
                  <option value={8}>Khối 8 (3 lớp)</option>
                  <option value={9}>Khối 9 (3 lớp)</option>
                </>
              ) : null}
            </select>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm lớp hoặc GVCN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-amber-500 w-44"
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-2">
          {/* Confetti celebrate */}
          <button
            onClick={triggerConfetti}
            title="Chúc mừng cờ thi đua luân lưu"
            className="p-1.5 rounded-lg border border-amber-300 dark:border-amber-600 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 hover:scale-105 transition-all text-xs font-semibold flex items-center gap-1"
          >
            <Sparkles className="w-4 h-4 text-amber-500 animate-bounce" />
            <span className="hidden sm:inline">Vinh Danh</span>
          </button>

          {/* AI Speech Generator Button */}
          {onOpenSpeechModal && (
            <button
              onClick={onOpenSpeechModal}
              title="Trợ lý AI Gemini: Tự động phân tích điểm thi đua và soạn bài phát biểu chào cờ đầu tuần"
              className="px-3 py-1.5 rounded-lg border border-amber-400 dark:border-amber-600 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-yellow-200 animate-pulse" />
              <span>Soạn Bài Chào Cờ (AI)</span>
            </button>
          )}

          {/* Export PowerPoint Slide Button */}
          {onOpenPptxModal && (
            <button
              onClick={onOpenPptxModal}
              title="1-Click xuất Slide trình chiếu PowerPoint (.pptx) chuẩn 16:9 cho máy chiếu sân trường"
              className="px-3 py-1.5 rounded-lg border border-red-500 dark:border-red-700 bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span>Xuất Slide (.pptx)</span>
            </button>
          )}

          {/* Pull Data from Google Sheets */}
          {onPullSheets && (
            <button
              onClick={onPullSheets}
              disabled={isPulling}
              title="Nhận dữ liệu mới nhất từ Google Sheets về máy"
              className="px-3 py-1.5 rounded-lg border border-teal-400 dark:border-teal-700 bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 text-xs font-bold hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors flex items-center space-x-1"
            >
              <DownloadCloud className={`w-3.5 h-3.5 ${isPulling ? 'animate-bounce' : ''}`} />
              <span>{isPulling ? 'Đang nhận...' : 'Nhận Data Sheet'}</span>
            </button>
          )}

          {/* Copy for Google Sheets */}
          <button
            onClick={handleCopyForGoogleSheets}
            title="Sao chép dữ liệu dạng bảng để dán trực tiếp vào Google Sheets (Ctrl+V)"
            className="px-3 py-1.5 rounded-lg border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900 transition-colors flex items-center space-x-1"
          >
            <span>{copiedNotification ? '✓ Đã chép!' : 'Chép vào Sheets'}</span>
          </button>

          {/* Export CSV */}
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV</span>
          </button>

          {/* Print */}
          <button
            onClick={() => window.print()}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            title="In bảng thi đua tuần"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-500" />
              Bảng Tổng Hợp Điểm & Xếp Hạng Thi Đua — Tuần {weekNumber}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Logic tính: Tiểu học (60 Nề nếp + 40 Phong trào + Thưởng) • THCS (40 Nề nếp + 30 Học tập + 30 Phong trào + Thưởng)
            </p>
          </div>
          <span className="text-xs font-medium text-slate-500">
            Hiển thị {filteredScores.length} / 31 lớp
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-xs uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-4 text-center">Hạng Khối</th>
                <th className="py-3 px-4">Lớp Học</th>
                <th className="py-3 px-4">Khối Cấp</th>
                <th className="py-3 px-4">GVCN</th>
                <th className="py-3 px-3 text-right">
                  Nề Nếp
                  <span className="block text-[10px] normal-case font-normal text-slate-400">TH: 60đ / THCS: 40đ</span>
                </th>
                <th className="py-3 px-3 text-right">
                  Học Tập
                  <span className="block text-[10px] normal-case font-normal text-slate-400">THCS: 30đ</span>
                </th>
                <th className="py-3 px-3 text-right">
                  Phong Trào
                  <span className="block text-[10px] normal-case font-normal text-slate-400">TH: 40đ / THCS: 30đ</span>
                </th>
                <th className="py-3 px-3 text-right">
                  Điểm Thưởng
                  <span className="block text-[10px] normal-case font-normal text-emerald-500">Dynamic (+)</span>
                </th>
                <th className="py-3 px-4 text-right">
                  Tổng Điểm
                  <span className="block text-[10px] normal-case font-normal text-slate-400">Thang 100 + Thưởng</span>
                </th>
                <th className="py-3 px-4 text-center">Xếp Loại</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredScores.map((row) => {
                const isSelectedForGVCN = currentRole === 'GVCN' && row.classId === selectedClassIdForGVCN;
                const isRank1 = row.rankInGradeLevel === 1;
                const isRank2 = row.rankInGradeLevel === 2;
                const isRank3 = row.rankInGradeLevel === 3;

                return (
                  <tr
                    key={row.classId}
                    className={`transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                      isSelectedForGVCN
                        ? 'bg-blue-50/80 dark:bg-blue-950/40 ring-1 ring-blue-500/40 font-medium'
                        : isRank1
                        ? 'bg-amber-50/40 dark:bg-amber-950/20'
                        : ''
                    }`}
                  >
                    {/* Rank */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center space-x-1.5">
                        {isRank1 ? (
                          <div className="flex items-center space-x-1 bg-amber-500 text-slate-900 px-2 py-0.5 rounded-full font-black text-xs shadow-sm">
                            <Trophy className="w-3.5 h-3.5 fill-slate-900" />
                            <span>#1</span>
                          </div>
                        ) : isRank2 ? (
                          <span className="bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded-full font-bold text-xs">
                            #2
                          </span>
                        ) : isRank3 ? (
                          <span className="bg-amber-800/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full font-bold text-xs">
                            #3
                          </span>
                        ) : (
                          <span className="text-slate-400 font-semibold text-xs">
                            #{row.rankInGradeLevel}
                          </span>
                        )}

                        {row.hasRotatingFlag && (
                          <span title="Cờ thi đua luân lưu của khối" className="inline-block animate-pulse">
                            <Flag className="w-4 h-4 text-red-500 fill-red-500 drop-shadow" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Class Name */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => onViewClassDetail(row.classId)}
                          className="font-bold text-slate-900 dark:text-white hover:text-amber-500 hover:underline flex items-center space-x-1"
                        >
                          <span>{row.className}</span>
                        </button>
                        {isSelectedForGVCN && (
                          <span className="text-[10px] bg-blue-500 text-white font-bold px-1.5 py-0.2 rounded">
                            Lớp của bạn
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Hạng toàn trường: #{row.rankOverall}
                      </div>
                    </td>

                    {/* Grade Level */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span
                        className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                          row.gradeLevel === 'TIEU_HOC'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                            : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                        }`}
                      >
                        {row.gradeLevel === 'TIEU_HOC' ? 'Tiểu Học' : 'THCS'}
                      </span>
                    </td>

                    {/* Teacher */}
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                      {row.teacherName}
                    </td>

                    {/* Nề nếp */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {row.scoreNeNep} <span className="text-[11px] text-slate-400 font-normal">/{row.baseNeNep}</span>
                      </div>
                      {row.deductedNeNep > 0 && (
                        <div className="text-[11px] text-rose-500">-{row.deductedNeNep}đ</div>
                      )}
                    </td>

                    {/* Học tập */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {row.gradeLevel === 'THCS' ? (
                        <>
                          <div className="font-semibold text-slate-900 dark:text-white">
                            {row.scoreHocTap} <span className="text-[11px] text-slate-400 font-normal">/{row.baseHocTap}</span>
                          </div>
                          {row.deductedHocTap > 0 && (
                            <div className="text-[11px] text-rose-500">-{row.deductedHocTap}đ</div>
                          )}
                        </>
                      ) : (
                        <span className="text-slate-400 text-xs italic">Không tính</span>
                      )}
                    </td>

                    {/* Phong trào */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {row.scorePhongTrao} <span className="text-[11px] text-slate-400 font-normal">/{row.basePhongTrao}</span>
                      </div>
                      {row.deductedPhongTrao > 0 && (
                        <div className="text-[11px] text-rose-500">-{row.deductedPhongTrao}đ</div>
                      )}
                    </td>

                    {/* Điểm thưởng */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      {row.totalBonus > 0 ? (
                        <span className="inline-flex items-center font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded text-xs">
                          +{row.totalBonus}đ
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">0đ</span>
                      )}
                    </td>

                    {/* Tổng điểm */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="text-base font-black text-slate-900 dark:text-white">
                        {row.totalScore}
                      </div>
                    </td>

                    {/* Xếp loại */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <span
                        className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${
                          row.awardTier === 'XUAT_SAC'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 ring-1 ring-emerald-500/30'
                            : row.awardTier === 'TOT'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/60 dark:text-blue-300'
                            : row.awardTier === 'KHA'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-900/60 dark:text-rose-300'
                        }`}
                      >
                        {row.awardTier === 'XUAT_SAC'
                          ? 'Xuất Sắc'
                          : row.awardTier === 'TOT'
                          ? 'Tốt'
                          : row.awardTier === 'KHA'
                          ? 'Khá'
                          : 'Trung Bình'}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <button
                        onClick={() => onViewClassDetail(row.classId)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Xem chi tiết vi phạm & điểm thưởng"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
