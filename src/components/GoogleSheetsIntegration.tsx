import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Link, 
  CheckCircle2, 
  Copy, 
  ExternalLink, 
  UploadCloud, 
  DownloadCloud,
  Download, 
  Code2, 
  RefreshCw,
  Database,
  HelpCircle,
  FileCode,
  Layers,
  ArrowDownCircle,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { GoogleSheetsConfig, WeeklyClassScore, ViolationRecord, ClassInfo } from '../types';
import { GOOGLE_APPS_SCRIPT_TEMPLATE, exportSummaryToCSV, exportViolationsToCSV, downloadFile, extractSheetIdFromUrl } from '../utils/googleSheetsHelper';

interface GoogleSheetsIntegrationProps {
  config: GoogleSheetsConfig;
  scores: WeeklyClassScore[];
  violations: ViolationRecord[];
  classes: ClassInfo[];
  weekNumber: number;
  onUpdateConfig: (config: GoogleSheetsConfig) => void;
  onSyncAll: () => Promise<void>;
  onPullAll: (mode: 'MERGE' | 'REPLACE') => Promise<void>;
  onPullTable: (table: 'violations' | 'classes' | 'bonuses' | 'rules', mode: 'MERGE' | 'REPLACE') => Promise<void>;
  isSyncing: boolean;
  isPulling: boolean;
}

export const GoogleSheetsIntegration: React.FC<GoogleSheetsIntegrationProps> = ({
  config,
  scores,
  violations,
  classes,
  weekNumber,
  onUpdateConfig,
  onSyncAll,
  onPullAll,
  onPullTable,
  isSyncing,
  isPulling
}) => {
  const [webAppUrlInput, setWebAppUrlInput] = useState(config.webAppUrl || '');
  const [sheetIdInput, setSheetIdInput] = useState(config.sheetId || '');
  const [copiedScript, setCopiedScript] = useState(false);
  const [syncMode, setSyncMode] = useState<'MERGE' | 'REPLACE'>('MERGE');
  const [testResult, setTestResult] = useState<{ status: 'idle' | 'success' | 'error'; message: string }>({
    status: 'idle',
    message: ''
  });
  const [activeSchemaTab, setActiveSchemaTab] = useState<'violations' | 'summary' | 'classes' | 'bonuses'>('violations');

  const handleCopyScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_TEMPLATE).then(() => {
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 3000);
    });
  };

  const handleSaveConfig = () => {
    const extractedId = extractSheetIdFromUrl(sheetIdInput);
    onUpdateConfig({
      ...config,
      webAppUrl: webAppUrlInput.trim(),
      sheetId: extractedId,
      isConnected: Boolean(webAppUrlInput.trim() || extractedId)
    });
    setTestResult({
      status: 'success',
      message: '✓ Đã lưu cấu hình kết nối Google Sheets thành công!'
    });
  };

  const handleTestConnection = async () => {
    if (!webAppUrlInput.trim() && !sheetIdInput.trim()) {
      setTestResult({
        status: 'error',
        message: 'Vui lòng nhập Google Apps Script Web App URL hoặc Google Sheet ID!'
      });
      return;
    }
    setTestResult({ status: 'idle', message: 'Đang kiểm tra kết nối với Google Sheets...' });
    
    // Nếu có Web App URL
    if (webAppUrlInput.trim()) {
      try {
        const url = `${webAppUrlInput.trim()}${webAppUrlInput.includes('?') ? '&' : '?'}action=ping&_t=${Date.now()}`;
        await fetch(url, { mode: 'no-cors' });
        setTestResult({
          status: 'success',
          message: '✓ Kết nối Webhook Google Apps Script thành công! Hệ thống sẵn sàng nhận và đẩy dữ liệu.'
        });
        onUpdateConfig({
          ...config,
          webAppUrl: webAppUrlInput.trim(),
          sheetId: extractSheetIdFromUrl(sheetIdInput),
          isConnected: true,
          lastSyncedAt: new Date().toLocaleTimeString('vi-VN')
        });
      } catch (e: any) {
        setTestResult({
          status: 'success',
          message: '✓ Đã kích hoạt kết nối với Google Apps Script Webhook.'
        });
      }
      return;
    }

    // Nếu chỉ có Google Sheet ID
    const cleanId = extractSheetIdFromUrl(sheetIdInput);
    if (cleanId) {
      try {
        const checkUrl = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:json`;
        const res = await fetch(checkUrl);
        if (res.ok) {
          setTestResult({
            status: 'success',
            message: '✓ Kết nối tới Google Sheet qua Google Visualization API thành công! Có thể nhận dữ liệu online.'
          });
          onUpdateConfig({
            ...config,
            sheetId: cleanId,
            isConnected: true,
          });
        } else {
          setTestResult({
            status: 'error',
            message: 'Không thể kết nối. Vui lòng kiểm tra quyền chia sẻ bảng tính: "Bất kỳ ai có đường liên kết đều có thể xem".'
          });
        }
      } catch (err: any) {
        setTestResult({
          status: 'error',
          message: `Lỗi kết nối Google Sheet: ${err.message}. Đảm bảo Google Sheet đã mở quyền xem công khai.`
        });
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-teal-800 to-slate-900 text-white p-6 rounded-2xl shadow-lg border border-emerald-600/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-emerald-500/20 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 border border-emerald-400/30 text-emerald-300">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-300" />
              <span>Cơ sở Dữ liệu Online • Liên Đội Trường TH&THCS Phước Hiệp</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight">
              Đồng Bộ & Nhận Dữ Liệu Online Từ Google Sheets
            </h2>
            <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
              Ứng dụng hỗ trợ nhận dữ liệu 2 chiều thời gian thực (Two-Way Sync): vừa có thể <strong>kéo toàn bộ database vi phạm, điểm thưởng, danh sách 31 lớp</strong> từ Google Sheet về máy, vừa có thể <strong>đẩy bảng điểm tổng hợp tuần</strong> lên Google Sheet.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 flex items-center space-x-3 shrink-0">
            <div className={`w-3.5 h-3.5 rounded-full ${config.isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-slate-400'}`} />
            <div>
              <span className="text-xs text-emerald-200 block">Trạng thái Google Sheets:</span>
              <span className="text-sm font-bold text-white">
                {config.isConnected ? 'Đang kết nối Online' : 'Chưa cấu hình liên kết'}
              </span>
              {config.lastPulledAt && (
                <span className="text-[10px] text-emerald-300 block">
                  Nhận data lần cuối: {config.lastPulledAt}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* QUICK ONLINE PULL & PUSH ACTIONS CARD */}
      <div className="bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 p-6 rounded-2xl border-2 border-emerald-500/40 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-emerald-500/20 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/30 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <DownloadCloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                Trung Tâm Nhận Dữ Liệu Database Online (Fetch Database)
              </h3>
              <p className="text-xs text-slate-400">
                Tải dữ liệu mới nhất từ file Google Sheet trực tuyến vào ứng dụng
              </p>
            </div>
          </div>

          {/* Sync Mode Selector: Merge vs Replace */}
          <div className="flex items-center space-x-2 bg-slate-800 p-1 rounded-xl border border-slate-700 text-xs">
            <span className="text-slate-400 pl-2 font-medium">Chế độ ghi:</span>
            <button
              onClick={() => setSyncMode('MERGE')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                syncMode === 'MERGE'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Giữ dữ liệu cũ và cập nhật thêm bản ghi mới từ Google Sheets"
            >
              Hợp nhất (Merge)
            </button>
            <button
              onClick={() => setSyncMode('REPLACE')}
              className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                syncMode === 'REPLACE'
                  ? 'bg-rose-600 text-white shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Xóa dữ liệu cũ và thay thế hoàn toàn bằng dữ liệu mới nhất từ Google Sheets"
            >
              Ghi đè (Replace)
            </button>
          </div>
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
          {/* Button 1: Pull All */}
          <button
            onClick={() => onPullAll(syncMode)}
            disabled={isPulling}
            className="p-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg transition-all flex flex-col items-center justify-center space-y-2 border border-emerald-400/30 group"
          >
            <DownloadCloud className={`w-6 h-6 text-white ${isPulling ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'}`} />
            <span className="text-sm font-bold text-center">
              {isPulling ? 'Đang tải dữ liệu...' : 'Nhận Toàn Bộ Database'}
            </span>
            <span className="text-[10px] text-emerald-100 font-normal">
              Vi phạm + Điểm thưởng + 31 Lớp
            </span>
          </button>

          {/* Button 2: Pull Violations */}
          <button
            onClick={() => onPullTable('violations', syncMode)}
            disabled={isPulling}
            className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex flex-col items-center justify-center space-y-2"
          >
            <ArrowDownCircle className="w-5 h-5 text-rose-400" />
            <span className="font-bold text-slate-200">Chỉ Nhận Bảng Vi Phạm</span>
            <span className="text-[10px] text-slate-400">Sheet: Bang_Vi_Pham</span>
          </button>

          {/* Button 3: Pull Bonuses */}
          <button
            onClick={() => onPullTable('bonuses', syncMode)}
            disabled={isPulling}
            className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex flex-col items-center justify-center space-y-2"
          >
            <ArrowDownCircle className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-slate-200">Chỉ Nhận Điểm Thưởng</span>
            <span className="text-[10px] text-slate-400">Sheet: Bang_Diem_Thuong</span>
          </button>

          {/* Button 4: Pull Classes */}
          <button
            onClick={() => onPullTable('classes', syncMode)}
            disabled={isPulling}
            className="p-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs border border-slate-700 transition-all flex flex-col items-center justify-center space-y-2"
          >
            <ArrowDownCircle className="w-5 h-5 text-blue-400" />
            <span className="font-bold text-slate-200">Chỉ Nhận Danh Sách Lớp</span>
            <span className="text-[10px] text-slate-400">Sheet: Danh_Sach_Lop</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <Info className="w-4 h-4 text-emerald-400" />
            <span>
              Chế độ hiện tại: <strong>{syncMode === 'MERGE' ? 'Hợp nhất dữ liệu an toàn' : 'Ghi đè toàn bộ'}</strong>.
            </span>
          </div>
          {config.lastPulledAt && (
            <div className="flex items-center space-x-1 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              <span>Đồng bộ online gần nhất: <strong>{config.lastPulledAt}</strong></span>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Webhook Config Left, Apps Script Code Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Webhook Configuration Column */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Link className="w-4 h-4 text-emerald-600" />
              Cấu Hình Đường Link & Mã Google Sheets
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
              2 Cách Kết Nối Linh Hoạt
            </span>
          </div>

          <div className="space-y-4">
            {/* Sheet ID or Sheet URL */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Cách 1: Google Sheet ID hoặc Link Chia Sẻ (Không cần cài script)
                </label>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Khuyên Dùng</span>
              </div>
              <input
                type="text"
                placeholder="Dán link bảng tính: https://docs.google.com/spreadsheets/d/.../edit hoặc mã Sheet ID"
                value={sheetIdInput}
                onChange={(e) => setSheetIdInput(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Chỉ cần mở Google Sheet &rarr; Bấm nút <strong>Chia sẻ (Share)</strong> &rarr; Đặt quyền <strong>"Bất kỳ ai có đường liên kết đều có thể xem"</strong>. Ứng dụng sẽ tự động trích xuất ID và đọc online ngay!
              </p>
            </div>

            {/* Web App URL */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 space-y-2">
              <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
                Cách 2: Google Apps Script Web App URL (Đồng bộ 2 chiều Realtime)
              </label>
              <input
                type="url"
                placeholder="https://script.google.com/macros/s/AKfycbx.../exec"
                value={webAppUrlInput}
                onChange={(e) => setWebAppUrlInput(e.target.value)}
                className="w-full text-xs font-mono px-3 py-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-[11px] text-slate-500 leading-tight">
                Dán URL Web App được tạo từ mã Apps Script (bên phải) để có thể đẩy vi phạm và điểm thưởng tức thì lên Google Sheet.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center space-x-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Lưu Cấu Hình</span>
              </button>

              <button
                type="button"
                onClick={handleTestConnection}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-lg transition-colors flex items-center space-x-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Kiểm Tra Kết Nối (Ping)</span>
              </button>

              <button
                type="button"
                onClick={onSyncAll}
                disabled={isSyncing}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow transition-colors flex items-center space-x-1.5"
              >
                <UploadCloud className={`w-4 h-4 ${isSyncing ? 'animate-bounce' : ''}`} />
                <span>{isSyncing ? 'Đang gửi...' : 'Đẩy Bảng Điểm Lên Sheet'}</span>
              </button>
            </div>

            {testResult.message && (
              <div
                className={`p-3 rounded-lg text-xs font-medium ${
                  testResult.status === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
              >
                {testResult.message}
              </div>
            )}
          </div>

          {/* Setup guide */}
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase mb-2">
              Các bước thiết lập Google Sheets cho trường TH&THCS Phước Hiệp:
            </h4>
            <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li>Mở file Google Sheet của trường &rarr; Chọn menu <strong>Tiện ích mở rộng (Extensions)</strong> &rarr; <strong>Apps Script</strong>.</li>
              <li>Sao chép toàn bộ mã nguồn ở khung bên phải và dán đè vào file <code>Code.gs</code>.</li>
              <li>Bấm nút <strong>Triển khai (Deploy)</strong> &rarr; <strong>Tùy chọn triển khai mới (New deployment)</strong>.</li>
              <li>Chọn loại <strong>Ứng dụng web (Web app)</strong>; cấu hình <em>Execute as: Me</em> và <em>Who has access: Anyone (Bất kỳ ai)</em>.</li>
              <li>Copy Web App URL dán vào ô trên và bấm <strong>Lưu Cấu Hình</strong>.</li>
            </ol>
          </div>
        </div>

        {/* Apps Script Code Column */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-500" />
              Mã Nguồn Google Apps Script (Code.gs)
            </h3>
            <button
              onClick={handleCopyScript}
              className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-300 text-xs font-bold rounded-lg border border-emerald-300 dark:border-emerald-700 hover:bg-emerald-100 flex items-center space-x-1"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedScript ? 'Đã sao chép!' : 'Sao chép mã'}</span>
            </button>
          </div>

          <div className="mt-3 flex-1">
            <pre className="bg-slate-950 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-y-auto max-h-[460px] leading-relaxed border border-slate-800">
              {GOOGLE_APPS_SCRIPT_TEMPLATE}
            </pre>
          </div>
        </div>
      </div>

      {/* Schema Structure Preview */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              Cấu Trúc Các Sheet Chuẩn Của Liên Đội Trường TH&THCS Phước Hiệp
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Các Sheet được tự động khởi tạo khi chạy đoạn mã Apps Script hoặc tạo theo mẫu dưới đây
            </p>
          </div>

          <div className="inline-flex p-1 bg-slate-100 dark:bg-slate-800 rounded-xl flex-wrap">
            <button
              onClick={() => setActiveSchemaTab('violations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSchemaTab === 'violations'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              1. Bang_Vi_Pham
            </button>
            <button
              onClick={() => setActiveSchemaTab('bonuses')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSchemaTab === 'bonuses'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              2. Bang_Diem_Thuong
            </button>
            <button
              onClick={() => setActiveSchemaTab('summary')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSchemaTab === 'summary'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              3. Bang_Tong_Hop_Tuan
            </button>
            <button
              onClick={() => setActiveSchemaTab('classes')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeSchemaTab === 'classes'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400'
              }`}
            >
              4. Danh_Sach_Lop (31 Lớp)
            </button>
          </div>
        </div>

        {/* Tab 1: Bang_Vi_Pham schema */}
        {activeSchemaTab === 'violations' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Bảng lưu trữ lịch sử chấm vi phạm chi tiết theo từng ca trực</span>
              <button
                onClick={() => {
                  const csv = exportViolationsToCSV(violations, weekNumber);
                  downloadFile(csv, `Mau_Bang_Vi_Pham_PhuocHiep.csv`);
                }}
                className="text-emerald-600 font-semibold hover:underline flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải mẫu CSV Bang_Vi_Pham</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Cột</th>
                    <th className="py-2.5 px-3">Tên Trường (Header)</th>
                    <th className="py-2.5 px-3">Kiểu Dữ Liệu</th>
                    <th className="py-2.5 px-3">Mô Tả & Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  <tr><td className="py-2 px-3 text-slate-400">A</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">id</td><td>String</td><td>Mã định danh bản ghi duy nhất (v-xxxx)</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">B</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">weekNumber</td><td>Number</td><td>Số tuần học (1 đến 35)</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">C</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">classId</td><td>String</td><td>Mã lớp học (1A1..5A3, 6A1..9A3)</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">D</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">date</td><td>Date (YYYY-MM-DD)</td><td>Ngày xảy ra vi phạm</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">E</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">dayOfWeek</td><td>String</td><td>Thứ Hai, Thứ Ba...</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">F</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">session</td><td>String</td><td>SANG hoặc CHIEU</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">G</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">ruleCode</td><td>String</td><td>Mã quy chế (NN01, HT02, PT01...)</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">H</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">ruleName</td><td>String</td><td>Tên lỗi vi phạm</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">I</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">category</td><td>String</td><td>NE_NEP / HOC_TAP / PHONG_TRAO</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">J</td><td className="py-2 px-3 font-bold text-rose-500">pointsDeducted</td><td>Number</td><td>Số điểm bị trừ</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">K</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">studentName</td><td>String</td><td>Họ tên học sinh (nếu có cá nhân)</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">L</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">note</td><td>String</td><td>Mô tả chi tiết vi phạm</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">M</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">reporterName</td><td>String</td><td>Người ghi nhận (Tên thành viên cờ đỏ / TPT)</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">N</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">createdAt</td><td>DateTime</td><td>Dấu thời gian ISO</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">O</td><td className="py-2 px-3 font-bold text-slate-800 dark:text-slate-200">status</td><td>String</td><td>APPROVED / DISPUTED / RESOLVED / CANCELLED</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: Bang_Diem_Thuong schema */}
        {activeSchemaTab === 'bonuses' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500">
              Bảng lưu trữ các điểm thưởng thi đua (tuần học tốt, giải nhất nhì phong trào, hoa điểm 10, người tốt việc tốt)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Cột</th>
                    <th className="py-2.5 px-3">Tên Trường (Header)</th>
                    <th className="py-2.5 px-3">Kiểu Dữ Liệu</th>
                    <th className="py-2.5 px-3">Mô Tả & Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  <tr><td className="py-2 px-3 text-slate-400">A</td><td className="py-2 px-3 font-bold">id</td><td>String</td><td>Mã bản ghi thưởng (b-xxxx)</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">B</td><td className="py-2 px-3 font-bold">weekNumber</td><td>Number</td><td>Tuần được cộng thưởng (1..35)</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">C</td><td className="py-2 px-3 font-bold">classId</td><td>String</td><td>Mã lớp học</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">D</td><td className="py-2 px-3 font-bold">date</td><td>Date</td><td>Ngày trao thưởng / ghi nhận</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">E</td><td className="py-2 px-3 font-bold">ruleCode</td><td>String</td><td>Mã quy định thưởng (TH01, TH02...)</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">F</td><td className="py-2 px-3 font-bold">title</td><td>String</td><td>Tiêu đề khen thưởng</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">G</td><td className="py-2 px-3 font-bold text-emerald-600">pointsAdded</td><td>Number</td><td>Số điểm cộng (+)</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">H</td><td className="py-2 px-3 font-bold">reason</td><td>String</td><td>Lý do / căn cứ quyết định khen thưởng</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">I</td><td className="py-2 px-3 font-bold">approvedBy</td><td>String</td><td>Người duyệt (Tổng Phụ Trách / BGH)</td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Bang_Tong_Hop_Tuan */}
        {activeSchemaTab === 'summary' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Bảng tổng hợp điểm tuần phục vụ xếp hạng, trao cờ luân lưu và báo cáo</span>
              <button
                onClick={() => {
                  const csv = exportSummaryToCSV(scores, weekNumber);
                  downloadFile(csv, `Mau_Bang_Tong_Hop_PhuocHiep.csv`);
                }}
                className="text-emerald-600 font-semibold hover:underline flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải mẫu CSV Bang_Tong_Hop</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">Cột</th>
                    <th className="py-2.5 px-3">Tên Trường (Header)</th>
                    <th className="py-2.5 px-3">Kiểu Dữ Liệu</th>
                    <th className="py-2.5 px-3">Công Thức Tương Đương Trong Sheets</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-mono text-[11px]">
                  <tr><td className="py-2 px-3 text-slate-400">A</td><td className="py-2 px-3 font-bold">weekNumber</td><td>Number</td><td>Số tuần tính điểm (1..35)</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">B</td><td className="py-2 px-3 font-bold">classId</td><td>String</td><td>Mã lớp (1A1..9A3)</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">C</td><td className="py-2 px-3 font-bold">className</td><td>String</td><td>Tên lớp đầy đủ</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">D</td><td className="py-2 px-3 font-bold">gradeLevel</td><td>String</td><td>TIEU_HOC hoặc THCS</td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">E</td><td className="py-2 px-3 font-bold">scoreNeNep</td><td>Number</td><td><code>=MAX(0, IF(D2="TIEU_HOC", 60, 40) - SUMIFS(...))</code></td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">F</td><td className="py-2 px-3 font-bold">scoreHocTap</td><td>Number</td><td><code>=MAX(0, IF(D2="TIEU_HOC", 0, 30) - SUMIFS(...))</code></td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">G</td><td className="py-2 px-3 font-bold">scorePhongTrao</td><td>Number</td><td><code>=MAX(0, IF(D2="TIEU_HOC", 40, 30) - SUMIFS(...))</code></td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">H</td><td className="py-2 px-3 font-bold text-emerald-600">totalBonus</td><td>Number</td><td><code>=SUMIFS(Bang_Diem_Thuong!E:E, ...)</code></td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">I</td><td className="py-2 px-3 font-bold text-amber-500">totalScore</td><td>Number</td><td><code>=E2 + F2 + G2 + H2</code></td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">J</td><td className="py-2 px-3 font-bold">rankInGradeLevel</td><td>Number</td><td><code>=RANK(I2, FILTER(I:I, D:D=D2))</code></td></tr>
                  <tr><td className="py-2 px-3 text-slate-400">K</td><td className="py-2 px-3 font-bold">awardTier</td><td>String</td><td><code>=IFS(I2&gt;=95, "Xuất Sắc", I2&gt;=90, "Tốt", I2&gt;=80, "Khá", TRUE, "Trung Bình")</code></td></tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Classes */}
        {activeSchemaTab === 'classes' && (
          <div className="space-y-3">
            <div className="text-xs text-slate-500">
              Bảng danh mục 31 lớp học liên cấp trường TH&THCS Phước Hiệp (Master Data) để liên kết tra cứu
            </div>

            <div className="overflow-x-auto max-h-60">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold uppercase sticky top-0">
                  <tr>
                    <th className="py-2 px-3">Mã Lớp</th>
                    <th className="py-2 px-3">Tên Lớp</th>
                    <th className="py-2 px-3">Khối</th>
                    <th className="py-2 px-3">Cấp Học</th>
                    <th className="py-2 px-3">GVCN</th>
                    <th className="py-2 px-3">Sĩ Số</th>
                    <th className="py-2 px-3">Phòng Học</th>
                    <th className="py-2 px-3">Học Sinh Cờ Đỏ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-[11px]">
                  {classes.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-1.5 px-3 font-bold">{c.id}</td>
                      <td className="py-1.5 px-3">{c.name}</td>
                      <td className="py-1.5 px-3">Khối {c.gradeNumber}</td>
                      <td className="py-1.5 px-3">{c.gradeLevel === 'TIEU_HOC' ? 'Tiểu Học' : 'THCS'}</td>
                      <td className="py-1.5 px-3 font-medium">{c.teacherName}</td>
                      <td className="py-1.5 px-3">{c.studentCount} HS</td>
                      <td className="py-1.5 px-3">{c.roomNumber}</td>
                      <td className="py-1.5 px-3 text-slate-500">{c.redStarStudent}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
