import React from 'react';
import { 
  Trophy, 
  UserCheck, 
  Calendar, 
  Shield, 
  User, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  FileSpreadsheet,
  Award,
  DownloadCloud,
  UploadCloud,
  Key,
  ExternalLink,
  Sparkles,
  Presentation
} from 'lucide-react';
import { UserRole, SchoolConfig, GoogleSheetsConfig, ClassInfo } from '../types';

interface HeaderProps {
  config: SchoolConfig;
  currentRole: UserRole;
  selectedClassIdForGVCN: string;
  classes: ClassInfo[];
  sheetsConfig: GoogleSheetsConfig;
  activeTab: string;
  hasApiKey: boolean;
  onRoleChange: (role: UserRole) => void;
  onClassChangeForGVCN: (classId: string) => void;
  onWeekChange: (week: number) => void;
  onTabChange: (tab: string) => void;
  onSyncSheets: () => void;
  onPullSheets: () => void;
  onOpenApiKeySettings: () => void;
  onOpenSpeechModal: () => void;
  onOpenPptxModal: () => void;
  isSyncing: boolean;
  isPulling: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  config,
  currentRole,
  selectedClassIdForGVCN,
  classes,
  sheetsConfig,
  activeTab,
  hasApiKey,
  onRoleChange,
  onClassChangeForGVCN,
  onWeekChange,
  onTabChange,
  onSyncSheets,
  onPullSheets,
  onOpenApiKeySettings,
  onOpenSpeechModal,
  onOpenPptxModal,
  isSyncing,
  isPulling
}) => {
  const selectedClass = classes.find(c => c.id === selectedClassIdForGVCN);
  const appDisplayName = config.appName || 'Quản lý thi đua LĐ trường TH&THCS Phước Hiệp';

  return (
    <header className="bg-slate-900 text-white shadow-xl border-b border-slate-800 sticky top-0 z-40">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
          {/* Logo & School Title */}
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-400 flex items-center justify-center shadow-lg shadow-amber-500/20 ring-2 ring-amber-300/30 flex-shrink-0">
              <Award className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Liên Đội TH&THCS Phước Hiệp
                </span>
                <span className="text-xs text-slate-400">
                  Năm học {config.academicYear} • 31 Lớp
                </span>
              </div>
              <h1 className="text-base sm:text-lg md:text-xl font-bold text-white tracking-tight leading-tight">
                {appDisplayName}
              </h1>
              <p className="text-xs text-slate-400">
                {config.schoolName} • Tổng phụ trách: <span className="text-amber-300 font-medium">{config.tptName}</span>
              </p>
            </div>
          </div>

          {/* Quick Controls: Week Selector, Google Sheets Pull/Push & RBAC Switcher */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Week Selector */}
            <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700">
              <Calendar className="w-4 h-4 text-amber-400 ml-2 mr-1.5" />
              <label htmlFor="week-select" className="text-xs text-slate-300 mr-1.5 font-medium hidden sm:inline">Tuần:</label>
              <select
                id="week-select"
                aria-label="Chọn tuần học"
                value={config.currentWeek}
                onChange={(e) => onWeekChange(Number(e.target.value))}
                className="bg-slate-900 text-amber-300 font-bold text-xs sm:text-sm px-2 py-1 rounded border border-slate-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
              >
                {Array.from({ length: config.totalWeeks }, (_, i) => i + 1).map((w) => (
                  <option key={w} value={w}>
                    Tuần {w} {w <= config.semester1Weeks ? '(HK1)' : '(HK2)'}
                  </option>
                ))}
              </select>
            </div>

            {/* Google Sheets ONLINE DATA ACTIONS */}
            {/* 1. Pull/Fetch Online Database button */}
            <button
              onClick={onPullSheets}
              disabled={isPulling}
              title="Nhận dữ liệu database online mới nhất từ Google Sheets"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all border border-emerald-400/40"
            >
              <DownloadCloud className={`w-3.5 h-3.5 ${isPulling ? 'animate-bounce' : ''}`} />
              <span className="hidden sm:inline">Nhận Dữ Liệu Online</span>
              <span className="sm:hidden">Nhận Sheet</span>
            </button>

            {/* 2. Push/Sync Summary button */}
            <button
              onClick={onSyncSheets}
              disabled={isSyncing}
              title="Đẩy bảng điểm tổng kết lên Google Sheets"
              className={`flex items-center space-x-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                sheetsConfig.isConnected
                  ? 'bg-slate-800 text-emerald-300 border-emerald-700 hover:bg-slate-700'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">Đẩy Điểm</span>
              <RefreshCw className={`w-3 h-3 text-slate-400 ${isSyncing ? 'animate-spin text-amber-400' : ''}`} />
            </button>

            {/* AI Copilot: Soạn bài phát biểu chào cờ */}
            <button
              onClick={onOpenSpeechModal}
              title="Trợ lý AI Gemini: Tự động phân tích điểm thi đua và soạn bài phát biểu chào cờ đầu tuần"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white shadow-md shadow-amber-500/20 transition-all border border-amber-300/40"
            >
              <Sparkles className="w-3.5 h-3.5 animate-pulse text-yellow-200" />
              <span className="hidden sm:inline">AI Soạn Chào Cờ</span>
              <span className="sm:hidden">AI Chào Cờ</span>
            </button>

            {/* Xuất Slide PowerPoint Chào Cờ */}
            <button
              onClick={onOpenPptxModal}
              title="1-Click xuất file PowerPoint (.pptx) 16:9 chiếu máy chiếu sân trường"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-600 hover:bg-red-500 text-white shadow-sm transition-all border border-red-400/40"
            >
              <Presentation className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Xuất Slide (.pptx)</span>
              <span className="sm:hidden">Slide</span>
            </button>

            {/* Settings (API Key) button with red warning prompt as required in AI_INSTRUCTIONS.md */}
            <div className="flex flex-col items-center">
              <button
                onClick={onOpenApiKeySettings}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 transition-colors"
                title="Cài đặt Google Gemini API Key và chọn Model"
              >
                <Key className="w-3.5 h-3.5 text-amber-400" />
                <span>Settings (API Key)</span>
              </button>
              <a
                href="https://aistudio.google.com/api-keys"
                target="_blank"
                rel="noreferrer"
                className="text-[10px] text-rose-400 hover:text-rose-300 font-semibold underline leading-tight mt-0.5"
                title="Bấm để lấy key miễn phí tại Google AI Studio"
              >
                Lấy API key để sử dụng app
              </a>
            </div>

            {/* Role Switcher (RBAC) */}
            <div className="flex items-center bg-slate-800 p-1 rounded-lg border border-slate-700">
              <span className="text-xs text-slate-400 px-2 font-medium hidden md:inline">Vai trò:</span>
              <div className="flex space-x-1">
                <button
                  onClick={() => onRoleChange('TPT')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                    currentRole === 'TPT'
                      ? 'bg-rose-600 text-white shadow'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Tổng Phụ Trách: Toàn quyền quản trị Liên Đội"
                >
                  <Shield className="w-3.5 h-3.5" />
                  <span>TPT</span>
                </button>

                <button
                  onClick={() => onRoleChange('GVCN')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                    currentRole === 'GVCN'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Giáo viên chủ nhiệm"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>GVCN</span>
                </button>

                <button
                  onClick={() => onRoleChange('CO_DO')}
                  className={`flex items-center space-x-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                    currentRole === 'CO_DO'
                      ? 'bg-amber-500 text-slate-900 shadow'
                      : 'text-slate-300 hover:bg-slate-700'
                  }`}
                  title="Đội Cờ Đỏ Liên Đội"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Cờ Đỏ</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* If Role is GVCN, show quick class selector */}
        {currentRole === 'GVCN' && (
          <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between flex-wrap gap-2 bg-blue-950/40 -mx-4 -mb-3 px-4 py-2">
            <div className="flex items-center space-x-2 text-xs">
              <span className="font-semibold text-blue-300">Đang đăng nhập với tư cách GVCN:</span>
              <label htmlFor="gvcn-class-select" className="sr-only">Chọn lớp phụ trách</label>
              <select
                id="gvcn-class-select"
                aria-label="Chọn lớp phụ trách"
                value={selectedClassIdForGVCN}
                onChange={(e) => onClassChangeForGVCN(e.target.value)}
                className="bg-slate-900 text-blue-200 font-bold px-2 py-0.5 rounded border border-blue-500 text-xs focus:ring-1 focus:ring-blue-400"
              >
                <optgroup label="Khối Tiểu Học (19 lớp)">
                  {classes.filter(c => c.gradeLevel === 'TIEU_HOC').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.teacherName}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Khối THCS (12 lớp)">
                  {classes.filter(c => c.gradeLevel === 'THCS').map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} - {c.teacherName}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            {selectedClass && (
              <div className="text-xs text-slate-300">
                Phòng: <span className="text-white font-medium">{selectedClass.roomNumber}</span> • Sĩ số: <span className="text-white font-medium">{selectedClass.studentCount} HS</span> • Cờ đỏ: <span className="text-amber-300">{selectedClass.redStarStudent}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Navigation Tabs Bar */}
      <nav className="bg-slate-950/90 border-t border-slate-800/80 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-1.5 scrollbar-none">
          <button
            onClick={() => onTabChange('leaderboard')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>Bảng Xếp Hạng & Báo Cáo</span>
          </button>

          <button
            onClick={() => onTabChange('entry')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'entry'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
            <span>Chấm Vi Phạm (Cờ Đỏ)</span>
          </button>

          <button
            onClick={() => onTabChange('violations')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'violations'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <AlertCircle className="w-4 h-4" />
            <span>Sổ Vi Phạm & Khiếu Nại</span>
          </button>

          <button
            onClick={() => onTabChange('bonuses')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'bonuses'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Cộng Điểm Thưởng</span>
          </button>

          <button
            onClick={() => onTabChange('sheets')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'sheets'
                ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Kết Nối Google Sheets (Online)</span>
          </button>

          <button
            onClick={() => onTabChange('architect')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeTab === 'architect'
                ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Kiến Trúc Hệ Thống (Spec)</span>
          </button>
        </div>
      </nav>
    </header>
  );
};
