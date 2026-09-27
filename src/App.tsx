import React, { useState, useMemo, useEffect } from 'react';
import { 
  ClassInfo, 
  SchoolConfig, 
  ViolationRule, 
  BonusRule, 
  ViolationRecord, 
  BonusRecord, 
  GoogleSheetsConfig, 
  UserRole,
  GeminiModelId
} from './types';
import { storageService } from './services/storageService';
import { calculateWeeklyScores } from './utils/emulationCalculator';
import { Header } from './components/Header';
import { LeaderboardView } from './components/LeaderboardView';
import { RedStarEntryForm } from './components/RedStarEntryForm';
import { ViolationsManager } from './components/ViolationsManager';
import { BonusManager } from './components/BonusManager';
import { GoogleSheetsIntegration } from './components/GoogleSheetsIntegration';
import { ArchitectDocumentation } from './components/ArchitectDocumentation';
import { ClassDetailModal } from './components/ClassDetailModal';
import { ApiKeySettingsModal } from './components/ApiKeySettingsModal';
import { AICopilotSpeechModal } from './components/AICopilotSpeechModal';
import { ExportPowerPointModal } from './components/ExportPowerPointModal';
import { RotateCcw, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  // Primary application state initialized from persistent local storage
  const [classes, setClasses] = useState<ClassInfo[]>(() => storageService.getClasses());
  const [config, setConfig] = useState<SchoolConfig>(() => storageService.getConfig());
  const [violationRules, setViolationRules] = useState<ViolationRule[]>(() => storageService.getViolationRules());
  const [bonusRules, setBonusRules] = useState<BonusRule[]>(() => storageService.getBonusRules());
  const [violations, setViolations] = useState<ViolationRecord[]>(() => storageService.getViolations());
  const [bonuses, setBonuses] = useState<BonusRecord[]>(() => storageService.getBonuses());
  const [sheetsConfig, setSheetsConfig] = useState<GoogleSheetsConfig>(() => storageService.getSheetsConfig());

  // Gemini AI Key & Model state (as specified in AI_INSTRUCTIONS.md)
  const [apiKey, setApiKey] = useState<string>(() => storageService.getGeminiApiKey());
  const [selectedModel, setSelectedModel] = useState<GeminiModelId>(() => storageService.getGeminiModel());
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState<boolean>(false);
  const [isSpeechModalOpen, setIsSpeechModalOpen] = useState<boolean>(false);
  const [isPptxModalOpen, setIsPptxModalOpen] = useState<boolean>(false);

  // Navigation and RBAC role state
  const [currentRole, setCurrentRole] = useState<UserRole>('TPT');
  const [selectedClassIdForGVCN, setSelectedClassIdForGVCN] = useState<string>('1A1');
  const [activeTab, setActiveTab] = useState<string>('leaderboard');
  const [selectedClassDetailId, setSelectedClassDetailId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isPulling, setIsPulling] = useState<boolean>(false);
  const [globalToast, setGlobalToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setGlobalToast({ message, type });
    setTimeout(() => setGlobalToast(null), 4000);
  };

  // Synchronize state changes to localStorage
  useEffect(() => {
    storageService.saveClasses(classes);
  }, [classes]);

  useEffect(() => {
    storageService.saveConfig(config);
  }, [config]);

  useEffect(() => {
    storageService.saveViolations(violations);
  }, [violations]);

  useEffect(() => {
    storageService.saveBonuses(bonuses);
  }, [bonuses]);

  useEffect(() => {
    storageService.saveSheetsConfig(sheetsConfig);
  }, [sheetsConfig]);

  // Real-time calculation of weekly scores and rankings
  const weeklyScores = useMemo(() => {
    return calculateWeeklyScores(classes, violations, bonuses, config.currentWeek);
  }, [classes, violations, bonuses, config.currentWeek]);

  // Handle Role changes with intuitive tab switching
  const handleRoleChange = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'CO_DO') {
      setActiveTab('entry');
      showToast('Đã chuyển sang vai trò: Đội Cờ Đỏ (Giao diện chấm vi phạm)', 'info');
    } else if (newRole === 'GVCN') {
      showToast(`Đã chuyển sang vai trò: GVCN (${selectedClassIdForGVCN})`, 'info');
    } else {
      showToast('Đã chuyển sang vai trò: Tổng Phụ Trách (Toàn quyền quản trị)', 'info');
    }
  };

  // Week change
  const handleWeekChange = (newWeek: number) => {
    setConfig((prev) => ({ ...prev, currentWeek: newWeek }));
    showToast(`Đã chuyển sang xem dữ liệu Tuần ${newWeek}`, 'info');
  };

  // Add violation record
  const handleAddViolation = async (newRecordData: Omit<ViolationRecord, 'id' | 'createdAt'>) => {
    const id = `v-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`;
    const createdAt = new Date().toISOString();
    const newRecord: ViolationRecord = {
      ...newRecordData,
      id,
      createdAt,
    };

    const updatedViolations = [newRecord, ...violations];
    setViolations(updatedViolations);

    // If Google Sheets webhook is configured, sync in background
    if (sheetsConfig.isConnected && sheetsConfig.webAppUrl) {
      storageService.syncViolationToGoogleSheets(newRecord, sheetsConfig).catch(() => {});
    }
  };

  // Delete violation
  const handleDeleteViolation = (id: string) => {
    setViolations((prev) => prev.filter((v) => v.id !== id));
    showToast('Đã xóa bản ghi vi phạm', 'info');
  };

  // Update violation status (resolve dispute, cancel, approve)
  const handleUpdateViolationStatus = (
    id: string, 
    status: 'APPROVED' | 'DISPUTED' | 'RESOLVED' | 'CANCELLED',
    reply?: string
  ) => {
    setViolations((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            status,
            disputeReply: reply || v.disputeReply,
          };
        }
        return v;
      })
    );
    showToast(
      status === 'CANCELLED'
        ? 'Đã hủy vi phạm (miễn trừ điểm cho lớp)'
        : 'Đã cập nhật trạng thái vi phạm'
    );
  };

  // Submit dispute from GVCN
  const handleSubmitDispute = (id: string, reason: string) => {
    setViolations((prev) =>
      prev.map((v) => {
        if (v.id === id) {
          return {
            ...v,
            status: 'DISPUTED',
            disputeReason: reason,
          };
        }
        return v;
      })
    );
    showToast('Đã gửi khiếu nại tới Tổng phụ trách để xem xét giải quyết', 'info');
  };

  // Add dynamic bonus
  const handleAddBonus = (newBonusData: Omit<BonusRecord, 'id' | 'createdAt'>) => {
    const id = `b-${Date.now().toString(36)}`;
    const createdAt = new Date().toISOString();
    const newBonus: BonusRecord = {
      ...newBonusData,
      id,
      createdAt,
    };

    setBonuses((prev) => [newBonus, ...prev]);
    showToast(`Đã cộng +${newBonus.pointsAdded} điểm thưởng cho lớp ${newBonus.classId}!`);
  };

  // Delete bonus
  const handleDeleteBonus = (id: string) => {
    setBonuses((prev) => prev.filter((b) => b.id !== id));
    showToast('Đã xóa điểm thưởng', 'info');
  };

  // Sync summary to Google Sheets (PUSH)
  const handleSyncSheets = async () => {
    setIsSyncing(true);
    try {
      const res = await storageService.syncSummaryToGoogleSheets(weeklyScores, sheetsConfig);
      if (res.success) {
        showToast(res.message, 'success');
        setSheetsConfig((prev) => ({
          ...prev,
          lastSyncedAt: new Date().toLocaleTimeString('vi-VN'),
        }));
      } else {
        showToast(res.message, 'info');
      }
    } catch (e: any) {
      showToast('Đã lưu dữ liệu cục bộ an toàn.', 'info');
    } finally {
      setIsSyncing(false);
    }
  };

  // NHẬN DỮ LIỆU DATABASE ONLINE TỪ GOOGLE SHEETS (PULL/FETCH)
  const handlePullSheetsAll = async (mode: 'MERGE' | 'REPLACE' = 'MERGE') => {
    setIsPulling(true);
    try {
      const res = await storageService.pullDatabaseFromGoogleSheets(sheetsConfig);
      if (res.success && res.data) {
        const d = res.data;
        let countViolations = 0;
        let countBonuses = 0;
        let countClasses = 0;

        // 1. Nhận Violations
        if (d.violations && d.violations.length > 0) {
          if (mode === 'REPLACE') {
            setViolations(d.violations);
            countViolations = d.violations.length;
          } else {
            // MERGE
            const map = new Map<string, ViolationRecord>();
            violations.forEach((v) => map.set(v.id, v));
            d.violations.forEach((v) => map.set(v.id, v));
            const merged = Array.from(map.values());
            setViolations(merged);
            countViolations = d.violations.length;
          }
        }

        // 2. Nhận Bonuses
        if (d.bonuses && d.bonuses.length > 0) {
          if (mode === 'REPLACE') {
            setBonuses(d.bonuses);
            countBonuses = d.bonuses.length;
          } else {
            const map = new Map<string, BonusRecord>();
            bonuses.forEach((b) => map.set(b.id, b));
            d.bonuses.forEach((b) => map.set(b.id, b));
            const merged = Array.from(map.values());
            setBonuses(merged);
            countBonuses = d.bonuses.length;
          }
        }

        // 3. Nhận Danh sách Lớp
        if (d.classes && d.classes.length > 0) {
          if (mode === 'REPLACE') {
            setClasses(d.classes);
            countClasses = d.classes.length;
          } else {
            const map = new Map<string, ClassInfo>();
            classes.forEach((c) => map.set(c.id, c));
            d.classes.forEach((c) => map.set(c.id, c));
            setClasses(Array.from(map.values()));
            countClasses = d.classes.length;
          }
        }

        // 4. Nhận Quy định nếu có
        if (d.violationRules && d.violationRules.length > 0) {
          setViolationRules(d.violationRules);
        }

        // Lưu thời gian nhận
        const nowStr = new Date().toLocaleTimeString('vi-VN');
        setSheetsConfig((prev) => ({
          ...prev,
          isConnected: true,
          lastPulledAt: nowStr,
        }));

        showToast(
          `✓ Nhận dữ liệu thành công! Đã nạp ${countViolations} vi phạm, ${countBonuses} điểm thưởng, ${countClasses} lớp từ Google Sheets.`,
          'success'
        );
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(`Lỗi khi nhận dữ liệu online: ${err?.message || 'Không thể kết nối Google Sheets'}`, 'error');
    } finally {
      setIsPulling(false);
    }
  };

  // Nhận riêng từng bảng
  const handlePullTable = async (table: 'violations' | 'classes' | 'bonuses' | 'rules', mode: 'MERGE' | 'REPLACE') => {
    setIsPulling(true);
    try {
      const res = await storageService.pullDatabaseFromGoogleSheets(sheetsConfig);
      if (res.success && res.data) {
        if (table === 'violations' && res.data.violations) {
          if (mode === 'REPLACE') {
            setViolations(res.data.violations);
          } else {
            const map = new Map<string, ViolationRecord>();
            violations.forEach((v) => map.set(v.id, v));
            res.data.violations.forEach((v) => map.set(v.id, v));
            setViolations(Array.from(map.values()));
          }
          showToast(`✓ Đã nạp ${res.data.violations.length} bản ghi vi phạm từ Google Sheets!`);
        } else if (table === 'bonuses' && res.data.bonuses) {
          if (mode === 'REPLACE') {
            setBonuses(res.data.bonuses);
          } else {
            const map = new Map<string, BonusRecord>();
            bonuses.forEach((b) => map.set(b.id, b));
            res.data.bonuses.forEach((b) => map.set(b.id, b));
            setBonuses(Array.from(map.values()));
          }
          showToast(`✓ Đã nạp ${res.data.bonuses.length} bản ghi điểm thưởng từ Google Sheets!`);
        } else if (table === 'classes' && res.data.classes) {
          setClasses(res.data.classes);
          showToast(`✓ Đã nạp ${res.data.classes.length} lớp học từ Google Sheets!`);
        } else if (table === 'rules' && res.data.violationRules) {
          setViolationRules(res.data.violationRules);
          showToast(`✓ Đã nạp danh mục quy chế vi phạm từ Google Sheets!`);
        } else {
          showToast('Không tìm thấy dữ liệu cho bảng này trên Google Sheets.', 'info');
        }
      } else {
        showToast(res.message, 'error');
      }
    } catch (err: any) {
      showToast(`Lỗi: ${err?.message || 'Không thể nạp dữ liệu'}`, 'error');
    } finally {
      setIsPulling(false);
    }
  };

  // Save API Key & Model
  const handleSaveApiKey = (newKey: string, newModel: GeminiModelId) => {
    storageService.saveGeminiApiKey(newKey);
    storageService.saveGeminiModel(newModel);
    setApiKey(newKey);
    setSelectedModel(newModel);
    showToast('Đã lưu cấu hình Gemini API Key và Mô hình AI thành công!', 'success');
  };

  // Reset demo data to defaults
  const handleResetDemoData = () => {
    if (window.confirm('Bạn có chắc chắn muốn đặt lại toàn bộ dữ liệu về trạng thái mẫu của Trường TH&THCS Phước Hiệp?')) {
      storageService.resetAll();
      setClasses(storageService.getClasses());
      setConfig(storageService.getConfig());
      setViolationRules(storageService.getViolationRules());
      setBonusRules(storageService.getBonusRules());
      setViolations(storageService.getViolations());
      setBonuses(storageService.getBonuses());
      setSheetsConfig(storageService.getSheetsConfig());
      showToast('Đã khôi phục dữ liệu ban đầu của Trường TH&THCS Phước Hiệp!', 'success');
    }
  };

  // Selected class for Detail Modal
  const selectedClassInfo = useMemo(() => {
    if (!selectedClassDetailId) return null;
    return classes.find((c) => c.id === selectedClassDetailId) || null;
  }, [selectedClassDetailId, classes]);

  const selectedClassScore = useMemo(() => {
    if (!selectedClassDetailId) return null;
    return weeklyScores.find((s) => s.classId === selectedClassDetailId) || null;
  }, [selectedClassDetailId, weeklyScores]);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Top Header */}
      <Header
        config={config}
        currentRole={currentRole}
        selectedClassIdForGVCN={selectedClassIdForGVCN}
        classes={classes}
        sheetsConfig={sheetsConfig}
        activeTab={activeTab}
        hasApiKey={Boolean(apiKey)}
        onRoleChange={handleRoleChange}
        onClassChangeForGVCN={setSelectedClassIdForGVCN}
        onWeekChange={handleWeekChange}
        onTabChange={setActiveTab}
        onSyncSheets={handleSyncSheets}
        onPullSheets={() => handlePullSheetsAll('MERGE')}
        onOpenApiKeySettings={() => setIsApiKeyModalOpen(true)}
        onOpenSpeechModal={() => setIsSpeechModalOpen(true)}
        onOpenPptxModal={() => setIsPptxModalOpen(true)}
        isSyncing={isSyncing}
        isPulling={isPulling}
      />

      {/* Global Toast Notification */}
      {globalToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className={`px-4 py-3 rounded-xl shadow-2xl text-xs font-bold text-white flex items-center space-x-2 ${
              globalToast.type === 'success'
                ? 'bg-emerald-600 ring-2 ring-emerald-400'
                : globalToast.type === 'error'
                ? 'bg-rose-600 ring-2 ring-rose-400'
                : 'bg-blue-600 ring-2 ring-blue-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4 flex-shrink-0" />
            <span>{globalToast.message}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'leaderboard' && (
          <LeaderboardView
            scores={weeklyScores}
            weekNumber={config.currentWeek}
            currentRole={currentRole}
            selectedClassIdForGVCN={selectedClassIdForGVCN}
            onViewClassDetail={(classId) => setSelectedClassDetailId(classId)}
            onSyncSheets={handleSyncSheets}
            onPullSheets={() => handlePullSheetsAll('MERGE')}
            onOpenSpeechModal={() => setIsSpeechModalOpen(true)}
            onOpenPptxModal={() => setIsPptxModalOpen(true)}
            isSyncing={isSyncing}
            isPulling={isPulling}
          />
        )}

        {activeTab === 'entry' && (
          <RedStarEntryForm
            classes={classes}
            rules={violationRules}
            weekNumber={config.currentWeek}
            currentRole={currentRole}
            recentViolations={violations}
            onSubmitViolation={handleAddViolation}
            onDeleteViolation={handleDeleteViolation}
          />
        )}

        {activeTab === 'violations' && (
          <ViolationsManager
            violations={violations}
            classes={classes}
            weekNumber={config.currentWeek}
            currentRole={currentRole}
            selectedClassIdForGVCN={selectedClassIdForGVCN}
            onUpdateViolationStatus={handleUpdateViolationStatus}
            onSubmitDispute={handleSubmitDispute}
            onDeleteViolation={handleDeleteViolation}
          />
        )}

        {activeTab === 'bonuses' && (
          <BonusManager
            bonuses={bonuses}
            bonusRules={bonusRules}
            classes={classes}
            weekNumber={config.currentWeek}
            currentRole={currentRole}
            onAddBonus={handleAddBonus}
            onDeleteBonus={handleDeleteBonus}
          />
        )}

        {activeTab === 'sheets' && (
          <GoogleSheetsIntegration
            config={sheetsConfig}
            scores={weeklyScores}
            violations={violations}
            classes={classes}
            weekNumber={config.currentWeek}
            onUpdateConfig={setSheetsConfig}
            onSyncAll={handleSyncSheets}
            onPullAll={handlePullSheetsAll}
            onPullTable={handlePullTable}
            isSyncing={isSyncing}
            isPulling={isPulling}
          />
        )}

        {activeTab === 'architect' && (
          <ArchitectDocumentation />
        )}
      </main>

      {/* Class Detail Modal */}
      {selectedClassInfo && selectedClassScore && (
        <ClassDetailModal
          classInfo={selectedClassInfo}
          weeklyScore={selectedClassScore}
          violations={violations}
          bonuses={bonuses}
          weekNumber={config.currentWeek}
          currentRole={currentRole}
          onClose={() => setSelectedClassDetailId(null)}
          onOpenDispute={(v) => {
            setSelectedClassDetailId(null);
            setActiveTab('violations');
            handleSubmitDispute(v.id, 'Khiếu nại kiểm tra lại từ giáo viên chủ nhiệm.');
          }}
        />
      )}

      {/* Gemini API Key & Model Settings Modal */}
      <ApiKeySettingsModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
        apiKey={apiKey}
        selectedModel={selectedModel}
        onSave={handleSaveApiKey}
      />

      {/* AI Copilot: Soạn bài phát biểu chào cờ đầu tuần */}
      <AICopilotSpeechModal
        isOpen={isSpeechModalOpen}
        onClose={() => setIsSpeechModalOpen(false)}
        apiKey={apiKey}
        selectedModel={selectedModel}
        schoolConfig={config}
        scores={weeklyScores}
        violations={violations}
        bonuses={bonuses}
        onOpenApiKeySettings={() => {
          setIsSpeechModalOpen(false);
          setIsApiKeyModalOpen(true);
        }}
      />

      {/* Xuất Slide PowerPoint Chào Cờ Đầu Tuần */}
      <ExportPowerPointModal
        isOpen={isPptxModalOpen}
        onClose={() => setIsPptxModalOpen(false)}
        schoolConfig={config}
        scores={weeklyScores}
        violations={violations}
        bonuses={bonuses}
      />

      {/* Footer */}
      <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 py-4 px-4 sm:px-6 lg:px-8 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">
              Quản lý thi đua LĐ trường TH&THCS Phước Hiệp
            </span>
            <span>•</span>
            <span>Chu kỳ 35 tuần học</span>
            <span>•</span>
            <span className="text-emerald-600 font-medium">31/31 Lớp hoạt động</span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={handleResetDemoData}
              className="hover:text-rose-500 flex items-center space-x-1 text-slate-400 hover:underline transition-colors"
              title="Khôi phục lại dữ liệu mẫu"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Đặt lại dữ liệu mẫu</span>
            </button>
            <span>•</span>
            <span className="flex items-center gap-1">
              Liên Đội Trường TH&THCS Phước Hiệp
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
