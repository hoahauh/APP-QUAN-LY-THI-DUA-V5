import React, { useState } from 'react';
import { Key, Sparkles, ExternalLink, Check, AlertCircle, Shield, X } from 'lucide-react';
import { GeminiModelId } from '../types';

interface ApiKeySettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  selectedModel: GeminiModelId;
  onSave: (key: string, model: GeminiModelId) => void;
  isMandatory?: boolean;
}

export const ApiKeySettingsModal: React.FC<ApiKeySettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  selectedModel,
  onSave,
  isMandatory = false,
}) => {
  const [inputKey, setInputKey] = useState(apiKey);
  const [model, setModel] = useState<GeminiModelId>(selectedModel);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    if (!inputKey.trim()) {
      setError('Vui lòng nhập API Key để tiếp tục sử dụng ứng dụng!');
      return;
    }
    setError('');
    onSave(inputKey.trim(), model);
    onClose();
  };

  const modelsList: { id: GeminiModelId; name: string; tag: string; desc: string; isDefault?: boolean }[] = [
    {
      id: 'gemini-3-flash-preview',
      name: 'Gemini 3 Flash Preview',
      tag: 'Khuyên dùng / Mặc định',
      desc: 'Tốc độ phản hồi cực nhanh, xử lý bảng điểm và tổng hợp thi đua thời gian thực tốt nhất.',
      isDefault: true,
    },
    {
      id: 'gemini-3-pro-preview',
      name: 'Gemini 3 Pro Preview',
      tag: 'Chuyên sâu & Suy luận',
      desc: 'Mô hình mạnh mẽ, phân tích báo cáo và giải quyết khiếu nại nề nếp phức tạp.',
    },
    {
      id: 'gemini-2.5-flash',
      name: 'Gemini 2.5 Flash',
      tag: 'Ổn định & Tiết kiệm',
      desc: 'Mô hình dự phòng ổn định cao, tốc độ mượt mà khi hệ thống có tải lớn.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 relative">
        {!isMandatory && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center space-x-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-500 flex items-center justify-center text-white shadow-md">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              Cấu Hình API Key & Mô Hình Gemini AI
            </h3>
            <p className="text-xs text-slate-500">
              Nhập Gemini API Key cá nhân để kích hoạt các tính năng trợ lý AI thông minh
            </p>
          </div>
        </div>

        {/* Input API Key */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Google Gemini API Key:
            </label>
            <a
              href="https://aistudio.google.com/api-keys"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-semibold text-rose-500 hover:text-rose-600 hover:underline flex items-center space-x-1"
            >
              <span>Lấy API key tại Google AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="Dán API Key (AIzaSy...)"
              value={inputKey}
              onChange={(e) => {
                setInputKey(e.target.value);
                if (error) setError('');
              }}
              className="w-full text-xs font-mono px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
          </div>

          {error && (
            <div className="flex items-center space-x-1 text-xs text-rose-600 font-medium">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 space-y-1">
            <p className="font-semibold flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-amber-600" />
              Bảo mật API Key:
            </p>
            <p>
              Khóa API được lưu trữ trực tiếp và an toàn trong <strong>localStorage</strong> của trình duyệt trên máy bạn, không gửi qua bất kỳ máy chủ trung gian nào.
            </p>
          </div>
        </div>

        {/* Model Selection Cards */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
            Chọn Mô Hình AI (AI Model):
          </label>
          <div className="grid grid-cols-1 gap-2.5">
            {modelsList.map((m) => (
              <div
                key={m.id}
                onClick={() => setModel(m.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start space-x-3 ${
                  model === m.id
                    ? 'border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 ring-1 ring-rose-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-800/40'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full mt-0.5 border flex items-center justify-center flex-shrink-0 ${
                    model === m.id
                      ? 'border-rose-600 bg-rose-600 text-white'
                      : 'border-slate-400 bg-transparent'
                  }`}
                >
                  {model === m.id && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {m.name}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        m.isDefault
                          ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {m.tag}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {m.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          {!isMandatory && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              Hủy bỏ
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/20 transition-all flex items-center space-x-1.5"
          >
            <Sparkles className="w-4 h-4" />
            <span>Lưu & Bắt Đầu Sử Dụng</span>
          </button>
        </div>
      </div>
    </div>
  );
};
