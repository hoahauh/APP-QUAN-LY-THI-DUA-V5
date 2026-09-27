export type GradeLevel = 'TIEU_HOC' | 'THCS';

export type CategoryType = 'NE_NEP' | 'HOC_TAP' | 'PHONG_TRAO';

export type UserRole = 'TPT' | 'GVCN' | 'CO_DO';

export interface ClassInfo {
  id: string;
  name: string;
  gradeLevel: GradeLevel;
  gradeNumber: number; // 1 to 9
  teacherName: string;
  teacherEmail: string;
  studentCount: number;
  redStarStudent: string;
  roomNumber: string;
}

export interface ViolationRule {
  id: string;
  code: string;
  name: string;
  category: CategoryType;
  defaultPoints: number;
  applicableLevel: 'ALL' | 'TIEU_HOC' | 'THCS';
  description?: string;
}

export interface BonusRule {
  id: string;
  code: string;
  name: string;
  defaultPoints: number;
  description?: string;
}

export interface ViolationRecord {
  id: string;
  weekNumber: number; // 1..35
  classId: string;
  date: string; // YYYY-MM-DD
  dayOfWeek: string;
  session: 'SANG' | 'CHIEU';
  ruleId: string;
  ruleCode: string;
  ruleName: string;
  category: CategoryType;
  pointsDeducted: number;
  studentName?: string;
  note?: string;
  reporterRole: UserRole;
  reporterName: string;
  createdAt: string;
  status: 'APPROVED' | 'DISPUTED' | 'RESOLVED' | 'CANCELLED';
  disputeReason?: string;
  disputeReply?: string;
}

export interface BonusRecord {
  id: string;
  weekNumber: number;
  classId: string;
  date: string;
  ruleCode?: string;
  title: string;
  pointsAdded: number;
  reason: string;
  approvedBy: string;
  createdAt: string;
}

export type AwardTier = 'XUAT_SAC' | 'TOT' | 'KHA' | 'TRUNG_BINH';

export interface WeeklyClassScore {
  classId: string;
  className: string;
  gradeLevel: GradeLevel;
  gradeNumber: number;
  teacherName: string;
  weekNumber: number;
  
  // Base maximum points according to school level
  baseNeNep: number;      // 60 (Tiểu học) or 40 (THCS)
  baseHocTap: number;     // 0 (Tiểu học) or 30 (THCS)
  basePhongTrao: number;  // 40 (Tiểu học) or 30 (THCS)
  
  // Total points deducted per category
  deductedNeNep: number;
  deductedHocTap: number;
  deductedPhongTrao: number;
  
  // Net points remaining (clamped to 0 min)
  scoreNeNep: number;
  scoreHocTap: number;
  scorePhongTrao: number;
  
  // Dynamic Bonus points
  totalBonus: number;
  
  // Final calculated score: scoreNeNep + scoreHocTap + scorePhongTrao + totalBonus
  totalScore: number;
  
  // Ranking
  rankInGradeLevel: number;
  rankOverall: number;
  awardTier: AwardTier;
  hasRotatingFlag: boolean; // Flag of honor for rank 1
  
  // Violation & Bonus counts
  violationCount: number;
  bonusCount: number;
}

export interface GoogleSheetsConfig {
  sheetId: string;
  webAppUrl: string;
  isConnected: boolean;
  lastSyncedAt: string | null;
  lastPulledAt?: string | null;
  autoSync: boolean;
  autoPull?: boolean;
  sheetNameViolations: string;
  sheetNameSummary: string;
  sheetNameClasses: string;
  sheetNameBonuses?: string;
  sheetNameRules?: string;
}

export interface SheetsSyncData {
  violations?: ViolationRecord[];
  bonuses?: BonusRecord[];
  classes?: ClassInfo[];
  violationRules?: ViolationRule[];
  bonusRules?: BonusRule[];
  schoolConfig?: Partial<SchoolConfig>;
}

export interface SchoolConfig {
  appName?: string;
  schoolName: string;
  academicYear: string;
  totalWeeks: number;
  currentWeek: number;
  semester1Weeks: number; // 1..18
  semester2Weeks: number; // 19..35
  tptName: string; // Tên Tổng phụ trách
}

export type GeminiModelId = 'gemini-3-flash-preview' | 'gemini-3-pro-preview' | 'gemini-2.5-flash';
