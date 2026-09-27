import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Copy, 
  Check, 
  Printer, 
  Download, 
  RefreshCw, 
  Flag, 
  Award, 
  AlertTriangle, 
  Edit3, 
  Clock, 
  Mic, 
  Send,
  SlidersHorizontal,
  ChevronRight,
  ShieldAlert,
  Key
} from 'lucide-react';
import { 
  WeeklyClassScore, 
  ViolationRecord, 
  BonusRecord, 
  SchoolConfig, 
  GeminiModelId 
} from '../types';
import { 
  generateFlagSaluteSpeech, 
  SpeechGenerationOptions, 
  GeneratedSpeechResult 
} from '../services/geminiService';
import { downloadFile } from '../utils/googleSheetsHelper';

interface AICopilotSpeechModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  selectedModel: GeminiModelId;
  schoolConfig: SchoolConfig;
  scores: WeeklyClassScore[];
  violations: ViolationRecord[];
  bonuses: BonusRecord[];
  onOpenApiKeySettings: () => void;
}

export const AICopilotSpeechModal: React.FC<AICopilotSpeechModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  selectedModel,
  schoolConfig,
  scores,
  violations,
  bonuses,
  onOpenApiKeySettings,
}) => {
  // Speech options
  const [duration, setDuration] = useState<'SHORT' | 'STANDARD' | 'DETAILED'>('STANDARD');
  const [tone, setTone] = useState<'INSPIRING' | 'DISCIPLINED' | 'BALANCED'>('BALANCED');
  const [themeTopic, setThemeTopic] = useState<string>('Thi đua nề nếp học đường, hoa điểm 10 và giữ gìn trường lớp xanh - sạch - đẹp');
  const [customNote, setCustomNote] = useState<string>('');

  // Generation status
  const [isGenerating, setIsGenerating] = useState(false);
  const [attemptInfo, setAttemptInfo] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [result, setResult] = useState<GeneratedSpeechResult | null>(null);

  // Editable text state
  const [isEditing, setIsEditing] = useState(false);
  const [editedSpeechText, setEditedSpeechText] = useState('');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    if (!apiKey) {
      setErrorMessage('Chưa có Gemini API Key! Vui lòng cài đặt API Key để AI bắt đầu soạn bài phát biểu.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage('');
    setAttemptInfo(`Đang kết nối mô hình ${selectedModel}...`);

    try {
      const speechRes = await generateFlagSaluteSpeech(
        apiKey,
        selectedModel,
        schoolConfig,
        scores,
        violations,
        bonuses,
        { duration, tone, themeTopic, customNote },
        (model, attempt) => {
          setAttemptInfo(`Đang tạo bài viết với mô hình: ${model} (Lần thử ${attempt})...`);
        }
      );

      setResult(speechRes);
      setEditedSpeechText(speechRes.speechText);
      setIsEditing(false);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Có lỗi xảy ra khi tạo bài phát biểu với Gemini AI.');
    } finally {
      setIsGenerating(false);
      setAttemptInfo('');
    }
  };

  const handleCopy = () => {
    const textToCopy = isEditing ? editedSpeechText : (result?.speechText || '');
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handlePrint = () => {
    const printContent = isEditing ? editedSpeechText : (result?.speechText || '');
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Bài Phát Biểu Chào Cờ Tuần ${schoolConfig.currentWeek} - ${schoolConfig.schoolName}</title>
        <style>
          body { font-family: 'Times New Roman', serif; font-size: 14pt; line-height: 1.6; margin: 40px; }
          h2, h3 { text-align: center; margin: 5px 0; }
          .header-box { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
          .content { white-space: pre-wrap; text-align: justify; }
          .footer { margin-top: 40px; display: flex; justify-content: flex-end; }
          .sign { text-align: center; width: 250px; }
        </style>
      </head>
      <body>
        <div class="header-box">
          <h3>LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP</h3>
          <h2>BÀI NHẬN XÉT THI ĐUA NỀ NẾP LỄ CHÀO CỜ ĐẦU TUẦN</h2>
          <p><em>(Tuần thứ ${schoolConfig.currentWeek} - Năm học ${schoolConfig.academicYear})</em></p>
        </div>
        <div class="content">${printContent.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
        <div class="footer">
          <div class="sign">
            <p><em>Phước Hiệp, Thứ Hai ngày ... tháng ... năm ...</em></p>
            <p><strong>TỔNG PHỤ TRÁCH ĐỘI</strong></p>
            <br/><br/><br/>
            <p><strong>${schoolConfig.tptName}</strong></p>
          </div>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 250);
  };

  const handleDownloadText = () => {
    const textToDownload = isEditing ? editedSpeechText : (result?.speechText || '');
    downloadFile(
      textToDownload,
      `Bai_Phat_Bieu_Chao_Co_Tuan_${schoolConfig.currentWeek}_PhuocHiep.txt`,
      'text/plain;charset=utf-8;'
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/80 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full p-5 sm:p-7 shadow-2xl space-y-6 relative my-auto max-h-[92vh] flex flex-col">
        {/* Header Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-600 via-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-lg shadow-amber-500/20">
              <Sparkles className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border border-rose-500/20">
                  Gemini AI Copilot
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  Tuần {schoolConfig.currentWeek} • {schoolConfig.schoolName}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                Trợ Lý AI Soạn Bài Phát Biểu Chào Cờ Đầu Tuần
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

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          {/* Options Panel */}
          <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                Cấu Hình Tham Số Bài Nói
              </span>
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 hidden sm:inline">Model ưu tiên:</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800">
                  {selectedModel}
                </span>
                <button
                  onClick={onOpenApiKeySettings}
                  className="text-slate-400 hover:text-amber-500 transition-colors p-1"
                  title="Thay đổi Model hoặc API Key"
                >
                  <Key className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Duration option */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Độ dài bài phát biểu:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'SHORT', label: 'Ngắn gọn', time: '1 - 2 phút' },
                    { id: 'STANDARD', label: 'Chuẩn mực', time: '3 - 5 phút' },
                    { id: 'DETAILED', label: 'Chi tiết', time: '5 - 7 phút' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDuration(item.id as any)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        duration === item.id
                          ? 'bg-amber-500 text-white font-bold border-amber-600 shadow'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[10px] opacity-80">{item.time}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone option */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1">
                  <Mic className="w-3.5 h-3.5 text-slate-400" />
                  Tông giọng truyền đạt:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'INSPIRING', label: 'Khích lệ', desc: 'Ấm áp, khen ngợi' },
                    { id: 'BALANCED', label: 'Cân bằng', desc: 'Chuẩn mực Đội' },
                    { id: 'DISCIPLINED', label: 'Nghiêm khắc', desc: 'Chấn chỉnh nề nếp' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTone(item.id as any)}
                      className={`p-2 rounded-xl text-center border transition-all ${
                        tone === item.id
                          ? 'bg-rose-600 text-white font-bold border-rose-700 shadow'
                          : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <div className="text-xs">{item.label}</div>
                      <div className="text-[10px] opacity-80">{item.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Theme topic & custom note */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Chủ điểm tuần tới:
                </label>
                <input
                  type="text"
                  value={themeTopic}
                  onChange={(e) => setThemeTopic(e.target.value)}
                  placeholder="Ví dụ: Thi đua chào mừng ngày 20/11, An toàn giao thông..."
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Ghi chú riêng của Tổng phụ trách (tùy chọn):
                </label>
                <input
                  type="text"
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Ví dụ: Lưu ý khối 6 truy bài 15 phút, khen ngợi học sinh nhặt được ví tiền..."
                  className="w-full text-xs px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* Generate Trigger Button */}
            <div className="pt-2 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                AI sẽ tự động tổng hợp điểm của <strong>31 lớp</strong>, lớp nhận cờ luân lưu và <strong>{violations.filter(v => v.weekNumber === schoolConfig.currentWeek).length} lỗi vi phạm</strong> tuần này.
              </div>

              <button
                type="button"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-amber-500 to-yellow-500 hover:from-rose-700 hover:to-yellow-600 text-white font-bold text-xs shadow-lg shadow-amber-500/20 transition-all flex items-center space-x-2 shrink-0 disabled:opacity-50"
              >
                <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-spin' : ''}`} />
                <span>{isGenerating ? 'AI Đang Soạn Bài...' : 'Soạn Bài Bằng AI'}</span>
              </button>
            </div>

            {attemptInfo && (
              <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 text-xs rounded-xl flex items-center space-x-2 animate-pulse">
                <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                <span>{attemptInfo}</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs rounded-xl flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-500" />
                <div className="flex-1">{errorMessage}</div>
                <button
                  onClick={onOpenApiKeySettings}
                  className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-bold hover:bg-rose-700"
                >
                  Nhập Key
                </button>
              </div>
            )}
          </div>

          {/* Generated Result Section */}
          {result && (
            <div className="space-y-4 animate-fade-in">
              {/* Highlight Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-3 rounded-2xl">
                  <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-300 text-xs font-bold mb-1">
                    <Flag className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>Lớp Nhận Cờ Luân Lưu</span>
                  </div>
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {result.keyHighlights.rotatingFlagClasses.join(' & ') || 'Chưa xác định'}
                  </div>
                </div>

                <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 p-3 rounded-2xl">
                  <div className="flex items-center space-x-1.5 text-rose-700 dark:text-rose-300 text-xs font-bold mb-1">
                    <AlertTriangle className="w-4 h-4 text-rose-500" />
                    <span>Lỗi Cần Rút Kinh Nghiệm</span>
                  </div>
                  <div className="text-[11px] text-slate-700 dark:text-slate-300 truncate">
                    {result.keyHighlights.topIssues[0] || 'Toàn trường nề nếp tốt'}
                  </div>
                </div>

                <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-2xl">
                  <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-1">
                    <Award className="w-4 h-4 text-emerald-500" />
                    <span>Mô Hình Đã Dùng</span>
                  </div>
                  <div className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-200 truncate">
                    {result.modelUsed}
                  </div>
                </div>
              </div>

              {/* Action Toolbar for Result */}
              <div className="flex flex-wrap items-center justify-between gap-2 p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center space-x-1.5 ${
                      isEditing
                        ? 'bg-amber-500 text-white shadow'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>{isEditing ? 'Đang chỉnh sửa' : 'Chỉnh sửa câu chữ'}</span>
                  </button>

                  <span className="text-xs text-slate-400 hidden sm:inline">•</span>

                  <span className="text-[11px] text-slate-500">
                    {isEditing ? 'Bạn có thể chỉnh sửa trực tiếp nội dung bên dưới' : 'Bản thảo hoàn chỉnh sẵn sàng đọc'}
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 shadow-sm"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Đã sao chép!' : 'Sao chép'}</span>
                  </button>

                  <button
                    onClick={handlePrint}
                    className="px-3 py-1.5 bg-white dark:bg-slate-700 hover:bg-slate-200 text-slate-800 dark:text-slate-200 text-xs font-semibold rounded-lg transition-colors flex items-center space-x-1 shadow-sm"
                    title="In khổ giấy A4 chuẩn lễ chào cờ"
                  >
                    <Printer className="w-3.5 h-3.5 text-blue-500" />
                    <span>In bài đọc</span>
                  </button>

                  <button
                    onClick={handleDownloadText}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center space-x-1 shadow-sm"
                    title="Tải văn bản về máy (.txt)"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Tải về</span>
                  </button>
                </div>
              </div>

              {/* Speech Text Content */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-950 p-6 shadow-inner">
                {isEditing ? (
                  <textarea
                    rows={16}
                    value={editedSpeechText}
                    onChange={(e) => setEditedSpeechText(e.target.value)}
                    className="w-full text-sm leading-relaxed font-serif p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                ) : (
                  <div className="font-serif text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-200 whitespace-pre-wrap space-y-4">
                    {editedSpeechText || result.speechText}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400 shrink-0">
          <div>
            Hệ thống hỗ trợ tự động Retry qua 3 model: <em>gemini-3-flash &rarr; gemini-3-pro &rarr; gemini-2.5-flash</em>.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
