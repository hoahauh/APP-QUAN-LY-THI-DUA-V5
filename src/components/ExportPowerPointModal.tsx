import React, { useState } from 'react';
import { 
  Presentation, 
  X, 
  Download, 
  Sparkles, 
  CheckCircle2, 
  Layers, 
  Palette, 
  Flag, 
  Award, 
  AlertTriangle,
  Monitor,
  Check,
  FileCheck
} from 'lucide-react';
import { WeeklyClassScore, ViolationRecord, BonusRecord, SchoolConfig } from '../types';
import { exportFlagSalutePowerPoint, PptxExportOptions } from '../utils/pptxExportHelper';

interface ExportPowerPointModalProps {
  isOpen: boolean;
  onClose: () => void;
  schoolConfig: SchoolConfig;
  scores: WeeklyClassScore[];
  violations: ViolationRecord[];
  bonuses: BonusRecord[];
}

export const ExportPowerPointModal: React.FC<ExportPowerPointModalProps> = ({
  isOpen,
  onClose,
  schoolConfig,
  scores,
  violations,
  bonuses
}) => {
  const [themeStyle, setThemeStyle] = useState<'TRADITIONAL_RED' | 'OCEAN_BLUE' | 'EMERALD_GREEN'>('TRADITIONAL_RED');
  const [customThemeTopic, setCustomThemeTopic] = useState('Thi đua nề nếp học đường, hoa điểm 10 và giữ gìn trường lớp xanh - sạch - đẹp');
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccessMessage, setExportSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleExport = async () => {
    setIsExporting(true);
    setExportSuccessMessage('');
    try {
      const fileName = await exportFlagSalutePowerPoint(
        schoolConfig,
        scores,
        violations,
        bonuses,
        {
          themeStyle,
          customThemeTopic,
          tptName: schoolConfig.tptName
        }
      );
      setExportSuccessMessage(`✓ Đã tạo và tải file thành công: ${fileName}`);
    } catch (err: any) {
      alert(`Lỗi khi tạo file PowerPoint: ${err?.message || 'Không thể tạo file'}`);
    } finally {
      setIsExporting(false);
    }
  };

  const previewSlides = [
    { num: 1, title: 'Slide Bìa Lễ Chào Cờ', desc: `Trường TH&THCS Phước Hiệp • Tuần ${schoolConfig.currentWeek}`, tag: 'Mở màn' },
    { num: 2, title: 'Vinh Danh Cờ Luân Lưu', desc: 'Xướng tên 2 lớp hạng 1 Tiểu học & THCS', tag: 'Trang trọng' },
    { num: 3, title: 'Bảng Vàng Khối Tiểu Học', desc: 'Top 5 lớp dẫn đầu trong 19 lớp Tiểu học', tag: 'Xếp hạng' },
    { num: 4, title: 'Bảng Vàng Khối THCS', desc: 'Top 5 lớp dẫn đầu trong 12 lớp THCS', tag: 'Xếp hạng' },
    { num: 5, title: 'Rút Kinh Nghiệm Nề Nếp', desc: 'Thống kê ưu điểm và các lỗi vi phạm cần chấn chỉnh', tag: 'Nề nếp' },
    { num: 6, title: 'Phát Động Tuần Mới', desc: 'Chủ điểm thi đua và 4 nhiệm vụ trọng tâm', tag: 'Hành động' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full p-5 sm:p-7 shadow-2xl space-y-6 relative my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-600 to-red-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/20">
              <Presentation className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  PowerPoint Presentation (16:9)
                </span>
                <span className="text-xs text-slate-400">
                  Lễ Chào Cờ Tuần {schoolConfig.currentWeek}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Xuất Slide Trình Chiếu Chào Cờ Sân Trường (.pptx)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto space-y-5 pr-1">
          {/* Theme Palette Selection */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-amber-500" />
              Chọn Phong Cách Thiết Kế Slide:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                {
                  id: 'TRADITIONAL_RED',
                  title: 'Đỏ & Vàng Kim',
                  sub: 'Màu Cờ Đội & Cờ Tổ Quốc',
                  badge: 'Khuyên Dùng',
                  bgPreview: 'from-red-700 to-red-900',
                  accentBorder: 'border-red-500'
                },
                {
                  id: 'OCEAN_BLUE',
                  title: 'Xanh Khăn Quàng',
                  sub: 'Hiện Đại, Tươi Sáng',
                  badge: 'Thanh lịch',
                  bgPreview: 'from-blue-700 to-indigo-900',
                  accentBorder: 'border-blue-500'
                },
                {
                  id: 'EMERALD_GREEN',
                  title: 'Xanh Măng Non',
                  sub: 'Trường Học Xanh',
                  badge: 'Thân thiện',
                  bgPreview: 'from-emerald-700 to-teal-900',
                  accentBorder: 'border-emerald-500'
                }
              ].map((th) => (
                <div
                  key={th.id}
                  onClick={() => setThemeStyle(th.id as any)}
                  className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-2 ${
                    themeStyle === th.id
                      ? `${th.accentBorder} bg-slate-50 dark:bg-slate-800/80 ring-2 ring-amber-400/40 shadow-md`
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {th.title}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 font-semibold">
                      {th.badge}
                    </span>
                  </div>
                  <div className={`h-6 rounded-lg bg-gradient-to-r ${th.bgPreview} shadow-inner flex items-center justify-center text-white text-[10px] font-bold`}>
                    16:9 Full HD
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {th.sub}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Theme Topic Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              Chủ điểm thi đua đưa vào Slide kết thúc (Slide 6):
            </label>
            <input
              type="text"
              value={customThemeTopic}
              onChange={(e) => setCustomThemeTopic(e.target.value)}
              placeholder="Nhập chủ điểm thi đua tuần tới..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {/* Slide Deck Structure Preview */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                Cấu Trúc Bộ Slide Tự Động (6 Slide Chuẩn):
              </span>
              <span className="text-xs text-slate-400">
                Tự động lấy số liệu 31 lớp Tuần {schoolConfig.currentWeek}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {previewSlides.map((s) => (
                <div
                  key={s.num}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 flex items-center space-x-3"
                >
                  <div className="w-7 h-7 rounded-lg bg-rose-600/10 text-rose-600 font-bold text-xs flex items-center justify-center border border-rose-500/20 shrink-0">
                    {s.num}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {s.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {s.tag}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Success Banner */}
          {exportSuccessMessage && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 rounded-xl text-xs font-semibold flex items-center space-x-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{exportSuccessMessage}</span>
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 hidden sm:block">
            Tương thích 100% với Microsoft PowerPoint, Google Slides, WPS Office.
          </div>

          <div className="flex items-center space-x-2 ml-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Đóng
            </button>

            <button
              onClick={handleExport}
              disabled={isExporting}
              className="px-5 py-2.5 bg-gradient-to-r from-rose-600 via-amber-500 to-yellow-500 hover:from-rose-700 hover:to-yellow-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center space-x-2 disabled:opacity-50"
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              <span>{isExporting ? 'Đang Tạo Slide .pptx...' : 'Tải Slide PowerPoint (.pptx)'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
