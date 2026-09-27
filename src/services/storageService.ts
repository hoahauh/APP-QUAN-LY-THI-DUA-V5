import { 
  ClassInfo, 
  ViolationRule, 
  BonusRule, 
  ViolationRecord, 
  BonusRecord, 
  SchoolConfig, 
  GoogleSheetsConfig,
  WeeklyClassScore,
  SheetsSyncData,
  GeminiModelId
} from '../types';
import {
  INITIAL_CLASSES,
  INITIAL_SCHOOL_CONFIG,
  INITIAL_VIOLATION_RULES,
  INITIAL_BONUS_RULES,
  INITIAL_VIOLATIONS,
  INITIAL_BONUSES
} from '../data/mockData';
import { fetchFullOnlineDatabase } from '../utils/googleSheetsHelper';

const KEYS = {
  CLASSES: 'school_emulation_classes',
  CONFIG: 'school_emulation_config',
  VIOLATION_RULES: 'school_emulation_violation_rules',
  BONUS_RULES: 'school_emulation_bonus_rules',
  VIOLATIONS: 'school_emulation_violations',
  BONUSES: 'school_emulation_bonuses',
  SHEETS_CONFIG: 'school_emulation_sheets_config',
  GEMINI_API_KEY: 'school_emulation_gemini_api_key',
  GEMINI_MODEL: 'school_emulation_gemini_model',
};

export const INITIAL_SHEETS_CONFIG: GoogleSheetsConfig = {
  sheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
  webAppUrl: '',
  isConnected: false,
  lastSyncedAt: null,
  lastPulledAt: null,
  autoSync: false,
  autoPull: false,
  sheetNameViolations: 'Bang_Vi_Pham',
  sheetNameSummary: 'Bang_Tong_Hop_Tuan',
  sheetNameClasses: 'Danh_Sach_Lop',
  sheetNameBonuses: 'Bang_Diem_Thuong',
  sheetNameRules: 'Quy_Dinh_Vi_Pham',
};

export const storageService = {
  getClasses(): ClassInfo[] {
    const raw = localStorage.getItem(KEYS.CLASSES);
    if (!raw) {
      localStorage.setItem(KEYS.CLASSES, JSON.stringify(INITIAL_CLASSES));
      return INITIAL_CLASSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_CLASSES;
    }
  },

  saveClasses(classes: ClassInfo[]) {
    localStorage.setItem(KEYS.CLASSES, JSON.stringify(classes));
  },

  getConfig(): SchoolConfig {
    const raw = localStorage.getItem(KEYS.CONFIG);
    if (!raw) {
      localStorage.setItem(KEYS.CONFIG, JSON.stringify(INITIAL_SCHOOL_CONFIG));
      return INITIAL_SCHOOL_CONFIG;
    }
    try {
      const parsed: SchoolConfig = JSON.parse(raw);
      // Tự động nâng cấp tên app và trường nếu còn là tên demo cũ
      if (!parsed.appName || parsed.schoolName.includes('Vinschool')) {
        const updatedConfig: SchoolConfig = {
          ...parsed,
          appName: 'Quản lý thi đua LĐ trường TH&THCS Phước Hiệp',
          schoolName: 'Trường TH&THCS Phước Hiệp',
          tptName: parsed.tptName.includes('Nguyễn Hoàng Nam') ? 'Tổng Phụ Trách Đội' : parsed.tptName,
        };
        localStorage.setItem(KEYS.CONFIG, JSON.stringify(updatedConfig));
        return updatedConfig;
      }
      return parsed;
    } catch {
      return INITIAL_SCHOOL_CONFIG;
    }
  },

  saveConfig(config: SchoolConfig) {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  },

  getViolationRules(): ViolationRule[] {
    const raw = localStorage.getItem(KEYS.VIOLATION_RULES);
    if (!raw) {
      localStorage.setItem(KEYS.VIOLATION_RULES, JSON.stringify(INITIAL_VIOLATION_RULES));
      return INITIAL_VIOLATION_RULES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_VIOLATION_RULES;
    }
  },

  saveViolationRules(rules: ViolationRule[]) {
    localStorage.setItem(KEYS.VIOLATION_RULES, JSON.stringify(rules));
  },

  getBonusRules(): BonusRule[] {
    const raw = localStorage.getItem(KEYS.BONUS_RULES);
    if (!raw) {
      localStorage.setItem(KEYS.BONUS_RULES, JSON.stringify(INITIAL_BONUS_RULES));
      return INITIAL_BONUS_RULES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BONUS_RULES;
    }
  },

  saveBonusRules(rules: BonusRule[]) {
    localStorage.setItem(KEYS.BONUS_RULES, JSON.stringify(rules));
  },

  getViolations(): ViolationRecord[] {
    const raw = localStorage.getItem(KEYS.VIOLATIONS);
    if (!raw) {
      localStorage.setItem(KEYS.VIOLATIONS, JSON.stringify(INITIAL_VIOLATIONS));
      return INITIAL_VIOLATIONS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_VIOLATIONS;
    }
  },

  saveViolations(violations: ViolationRecord[]) {
    localStorage.setItem(KEYS.VIOLATIONS, JSON.stringify(violations));
  },

  getBonuses(): BonusRecord[] {
    const raw = localStorage.getItem(KEYS.BONUSES);
    if (!raw) {
      localStorage.setItem(KEYS.BONUSES, JSON.stringify(INITIAL_BONUSES));
      return INITIAL_BONUSES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_BONUSES;
    }
  },

  saveBonuses(bonuses: BonusRecord[]) {
    localStorage.setItem(KEYS.BONUSES, JSON.stringify(bonuses));
  },

  getSheetsConfig(): GoogleSheetsConfig {
    const raw = localStorage.getItem(KEYS.SHEETS_CONFIG);
    if (!raw) {
      localStorage.setItem(KEYS.SHEETS_CONFIG, JSON.stringify(INITIAL_SHEETS_CONFIG));
      return INITIAL_SHEETS_CONFIG;
    }
    try {
      const parsed = JSON.parse(raw);
      return {
        ...INITIAL_SHEETS_CONFIG,
        ...parsed,
      };
    } catch {
      return INITIAL_SHEETS_CONFIG;
    }
  },

  saveSheetsConfig(config: GoogleSheetsConfig) {
    localStorage.setItem(KEYS.SHEETS_CONFIG, JSON.stringify(config));
  },

  getGeminiApiKey(): string {
    return localStorage.getItem(KEYS.GEMINI_API_KEY) || '';
  },

  saveGeminiApiKey(key: string) {
    localStorage.setItem(KEYS.GEMINI_API_KEY, key.trim());
  },

  getGeminiModel(): GeminiModelId {
    return (localStorage.getItem(KEYS.GEMINI_MODEL) as GeminiModelId) || 'gemini-3-flash-preview';
  },

  saveGeminiModel(model: GeminiModelId) {
    localStorage.setItem(KEYS.GEMINI_MODEL, model);
  },

  resetAll() {
    localStorage.removeItem(KEYS.CLASSES);
    localStorage.removeItem(KEYS.CONFIG);
    localStorage.removeItem(KEYS.VIOLATION_RULES);
    localStorage.removeItem(KEYS.BONUS_RULES);
    localStorage.removeItem(KEYS.VIOLATIONS);
    localStorage.removeItem(KEYS.BONUSES);
    localStorage.removeItem(KEYS.SHEETS_CONFIG);
  },

  /**
   * ĐẨY (Sync/Push) một vi phạm lên Google Sheets
   */
  async syncViolationToGoogleSheets(
    record: ViolationRecord,
    sheetsConfig: GoogleSheetsConfig
  ): Promise<{ success: boolean; message: string }> {
    if (!sheetsConfig.webAppUrl) {
      return { 
        success: true, 
        message: 'Đã lưu cục bộ an toàn. (Chưa kích hoạt Webhook Google Sheets)' 
      };
    }
    try {
      await fetch(sheetsConfig.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'recordViolation',
          data: record,
        }),
        mode: 'no-cors',
      });
      return { success: true, message: 'Đã đồng bộ tức thì sang Google Sheets!' };
    } catch (e: any) {
      return { success: false, message: `Lỗi kết nối Google Sheets: ${e?.message || 'Không xác định'}` };
    }
  },

  /**
   * ĐẨY (Sync/Push) bảng tổng kết điểm sang Google Sheets
   */
  async syncSummaryToGoogleSheets(
    scores: WeeklyClassScore[],
    sheetsConfig: GoogleSheetsConfig
  ): Promise<{ success: boolean; message: string }> {
    if (!sheetsConfig.webAppUrl) {
      return { 
        success: false, 
        message: 'Vui lòng cấu hình Web App URL của Google Apps Script để đồng bộ!' 
      };
    }
    try {
      await fetch(sheetsConfig.webAppUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'syncSummary',
          data: scores,
        }),
        mode: 'no-cors',
      });
      return { success: true, message: `Đã gửi bảng tổng kết ${scores.length} lớp sang Google Sheets!` };
    } catch (e: any) {
      return { success: false, message: `Lỗi kết nối: ${e?.message}` };
    }
  },

  /**
   * NHẬN (Pull/Fetch) toàn bộ database online từ Google Sheets
   */
  async pullDatabaseFromGoogleSheets(
    sheetsConfig: GoogleSheetsConfig
  ): Promise<{ success: boolean; data?: SheetsSyncData; source: 'APPS_SCRIPT' | 'GVIZ'; message: string }> {
    return await fetchFullOnlineDatabase(sheetsConfig);
  }
};
