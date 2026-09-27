import { ClassInfo, ViolationRecord, BonusRecord, WeeklyClassScore, AwardTier } from '../types';

export function calculateWeeklyScores(
  classes: ClassInfo[],
  violations: ViolationRecord[],
  bonuses: BonusRecord[],
  weekNumber: number
): WeeklyClassScore[] {
  // Filter records for the target week
  const weekViolations = violations.filter(
    (v) => v.weekNumber === weekNumber && v.status !== 'CANCELLED'
  );
  const weekBonuses = bonuses.filter((b) => b.weekNumber === weekNumber);

  // Calculate scores for each class
  const classScores: WeeklyClassScore[] = classes.map((cls) => {
    const isTieuHoc = cls.gradeLevel === 'TIEU_HOC';

    // Base point quotas
    const baseNeNep = isTieuHoc ? 60 : 40;
    const baseHocTap = isTieuHoc ? 0 : 30;
    const basePhongTrao = isTieuHoc ? 40 : 30;

    // Violations for this class
    const clsViolations = weekViolations.filter((v) => v.classId === cls.id);
    let deductedNeNep = 0;
    let deductedHocTap = 0;
    let deductedPhongTrao = 0;

    clsViolations.forEach((v) => {
      if (v.category === 'NE_NEP') {
        deductedNeNep += v.pointsDeducted;
      } else if (v.category === 'HOC_TAP') {
        deductedHocTap += v.pointsDeducted;
      } else if (v.category === 'PHONG_TRAO') {
        deductedPhongTrao += v.pointsDeducted;
      }
    });

    // Sub-scores (clamped to 0 minimum)
    const scoreNeNep = Math.max(0, baseNeNep - deductedNeNep);
    const scoreHocTap = Math.max(0, baseHocTap - deductedHocTap);
    const scorePhongTrao = Math.max(0, basePhongTrao - deductedPhongTrao);

    // Dynamic bonus points
    const clsBonuses = weekBonuses.filter((b) => b.classId === cls.id);
    const totalBonus = clsBonuses.reduce((sum, b) => sum + b.pointsAdded, 0);

    // Final total score calculation
    const totalScore = Number((scoreNeNep + scoreHocTap + scorePhongTrao + totalBonus).toFixed(2));

    // Award tier
    let awardTier: AwardTier = 'TRUNG_BINH';
    if (totalScore >= 95) awardTier = 'XUAT_SAC';
    else if (totalScore >= 90) awardTier = 'TOT';
    else if (totalScore >= 80) awardTier = 'KHA';

    return {
      classId: cls.id,
      className: cls.name,
      gradeLevel: cls.gradeLevel,
      gradeNumber: cls.gradeNumber,
      teacherName: cls.teacherName,
      weekNumber,
      baseNeNep,
      baseHocTap,
      basePhongTrao,
      deductedNeNep,
      deductedHocTap,
      deductedPhongTrao,
      scoreNeNep,
      scoreHocTap,
      scorePhongTrao,
      totalBonus,
      totalScore,
      rankInGradeLevel: 0,
      rankOverall: 0,
      awardTier,
      hasRotatingFlag: false,
      violationCount: clsViolations.length,
      bonusCount: clsBonuses.length,
    };
  });

  // Sort helper function (score desc, total deduction asc, bonus desc)
  const compareScores = (a: WeeklyClassScore, b: WeeklyClassScore) => {
    if (b.totalScore !== a.totalScore) {
      return b.totalScore - a.totalScore;
    }
    const aTotalDeduction = a.deductedNeNep + a.deductedHocTap + a.deductedPhongTrao;
    const bTotalDeduction = b.deductedNeNep + b.deductedHocTap + b.deductedPhongTrao;
    if (aTotalDeduction !== bTotalDeduction) {
      return aTotalDeduction - bTotalDeduction; // Fewer deductions is better
    }
    return b.totalBonus - a.totalBonus;
  };

  // Rank Overall (all 31 classes)
  const overallSorted = [...classScores].sort(compareScores);
  overallSorted.forEach((item, index) => {
    item.rankOverall = index + 1;
  });

  // Rank within Tiểu học (19 classes)
  const tieuHocSorted = overallSorted.filter((c) => c.gradeLevel === 'TIEU_HOC');
  tieuHocSorted.forEach((item, index) => {
    item.rankInGradeLevel = index + 1;
    if (index === 0) {
      item.hasRotatingFlag = true; // Top 1 Tiểu học receives Cờ Luân Lưu
    }
  });

  // Rank within THCS (12 classes)
  const thcsSorted = overallSorted.filter((c) => c.gradeLevel === 'THCS');
  thcsSorted.forEach((item, index) => {
    item.rankInGradeLevel = index + 1;
    if (index === 0) {
      item.hasRotatingFlag = true; // Top 1 THCS receives Cờ Luân Lưu
    }
  });

  return classScores;
}
