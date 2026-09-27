import { WeeklyClassScore, ViolationRecord, BonusRecord, SchoolConfig } from '../types';

declare global {
  interface Window {
    PptxGenJS?: any;
  }
}

/**
 * Tải thư viện PptxGenJS động từ CDN nếu chưa có trong runtime
 */
export function loadPptxGenJsLibrary(): Promise<any> {
  if (typeof window !== 'undefined' && window.PptxGenJS) {
    return Promise.resolve(window.PptxGenJS);
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
    script.async = true;
    script.onload = () => {
      if (window.PptxGenJS) {
        resolve(window.PptxGenJS);
      } else {
        reject(new Error('Tải PptxGenJS thành công nhưng không tìm thấy đối tượng toàn cục.'));
      }
    };
    script.onerror = () => {
      // Fallback sang CDN unpkg
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://unpkg.com/pptxgenjs@3.12.0/dist/pptxgen.bundle.js';
      fallbackScript.onload = () => resolve(window.PptxGenJS);
      fallbackScript.onerror = () => reject(new Error('Không thể tải thư viện PptxGenJS từ CDN. Vui lòng kiểm tra kết nối internet.'));
      document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
  });
}

export interface PptxExportOptions {
  themeStyle: 'TRADITIONAL_RED' | 'OCEAN_BLUE' | 'EMERALD_GREEN';
  customThemeTopic?: string;
  tptName?: string;
}

/**
 * Tạo và tải file PowerPoint (.pptx) trình chiếu chào cờ sân trường
 */
export async function exportFlagSalutePowerPoint(
  schoolConfig: SchoolConfig,
  scores: WeeklyClassScore[],
  violations: ViolationRecord[],
  bonuses: BonusRecord[],
  options: PptxExportOptions = { themeStyle: 'TRADITIONAL_RED' }
): Promise<string> {
  const PptxGen = await loadPptxGenJsLibrary();
  const pres = new PptxGen();

  // Định dạng màn hình 16:9 chuẩn cho máy chiếu sân trường & màn hình LED
  pres.layout = 'LAYOUT_16x9';

  const weekNumber = schoolConfig.currentWeek;
  const year = schoolConfig.academicYear;
  const schoolName = schoolConfig.schoolName.toUpperCase();
  const tptName = options.tptName || schoolConfig.tptName;
  const nextWeekTopic = options.customThemeTopic || 'Thi đua nề nếp học đường, hoa điểm 10 và giữ gìn trường lớp xanh - sạch - đẹp';

  // Lấy dữ liệu tuần hiện tại
  const tieuHocRank1 = scores.find(s => s.gradeLevel === 'TIEU_HOC' && s.rankInGradeLevel === 1);
  const thcsRank1 = scores.find(s => s.gradeLevel === 'THCS' && s.rankInGradeLevel === 1);

  const topTieuHoc = scores
    .filter(s => s.gradeLevel === 'TIEU_HOC')
    .sort((a, b) => a.rankInGradeLevel - b.rankInGradeLevel)
    .slice(0, 5);

  const topThcs = scores
    .filter(s => s.gradeLevel === 'THCS')
    .sort((a, b) => a.rankInGradeLevel - b.rankInGradeLevel)
    .slice(0, 5);

  // Thống kê vi phạm & khen thưởng tuần
  const weekViolations = violations.filter(v => v.weekNumber === weekNumber && v.status !== 'CANCELLED');
  const weekBonuses = bonuses.filter(b => b.weekNumber === weekNumber);

  const issueStats: Record<string, number> = {};
  weekViolations.forEach(v => {
    issueStats[v.ruleName] = (issueStats[v.ruleName] || 0) + 1;
  });
  const topIssues = Object.entries(issueStats)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  // Cấu hình bảng màu theo phong cách
  const themes = {
    TRADITIONAL_RED: {
      primary: 'B91C1C', // Đỏ cờ Đội
      primaryDark: '7F1D1D',
      accent: 'F59E0B',  // Vàng sao
      accentLight: 'FEF3C7',
      bgLight: 'FFFFFF',
      cardBg: 'FFFBEB',
      textColor: '1E293B',
      subTextColor: '64748B'
    },
    OCEAN_BLUE: {
      primary: '1D4ED8',
      primaryDark: '1E3A8A',
      accent: 'F59E0B',
      accentLight: 'EFF6FF',
      bgLight: 'FFFFFF',
      cardBg: 'F0F9FF',
      textColor: '0F172A',
      subTextColor: '64748B'
    },
    EMERALD_GREEN: {
      primary: '047857',
      primaryDark: '064E3B',
      accent: 'F59E0B',
      accentLight: 'ECFDF5',
      bgLight: 'FFFFFF',
      cardBg: 'F0FDF4',
      textColor: '064E3B',
      subTextColor: '475569'
    }
  };

  const colors = themes[options.themeStyle] || themes.TRADITIONAL_RED;

  // ==========================================
  // SLIDE 1: TIÊU ĐỀ LỄ CHÀO CỜ ĐẦU TUẦN (COVER)
  // ==========================================
  const slide1 = pres.addSlide();
  slide1.background = { color: colors.primaryDark };

  // Dải ruy băng vàng trang trí trên cùng
  slide1.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.25,
    fill: { color: colors.accent }
  });

  // Huy hiệu Đội / Tổ quốc biểu trưng
  slide1.addText('★ ★ ★', {
    x: 0, y: 1.0, w: '100%',
    fontSize: 24, color: colors.accent, align: 'center', bold: true
  });

  slide1.addText('ĐỘI THIẾU NIÊN TIỀN PHONG HỒ CHÍ MINH', {
    x: 0, y: 1.5, w: '100%',
    fontSize: 16, color: 'FFFFFF', align: 'center', bold: true, letterSpacing: 2
  });

  slide1.addText(`LIÊN ĐỘI ${schoolName}`, {
    x: 0, y: 1.9, w: '100%',
    fontSize: 18, color: colors.accent, align: 'center', bold: true
  });

  // Hộp tiêu đề chính
  slide1.addShape(pres.ShapeType.roundRect, {
    x: 1.5, y: 2.7, w: 10.33, h: 2.3,
    fill: { color: '000000', transparency: 30 },
    line: { color: colors.accent, width: 2 }
  });

  slide1.addText('LỄ CHÀO CỜ ĐẦU TUẦN', {
    x: 1.5, y: 2.9, w: 10.33,
    fontSize: 34, color: 'FFFFFF', align: 'center', bold: true
  });

  slide1.addText(`BÁO CÁO THI ĐUA NỀ NẾP — TUẦN ${weekNumber}`, {
    x: 1.5, y: 3.6, w: 10.33,
    fontSize: 26, color: colors.accent, align: 'center', bold: true
  });

  slide1.addText(`NĂM HỌC ${year}`, {
    x: 1.5, y: 4.3, w: 10.33,
    fontSize: 16, color: 'FFFFFF', align: 'center'
  });

  // Chân trang
  slide1.addText(`Tổng Phụ Trách: ${tptName} • 31 Lớp Liên Cấp (Tiểu Học & THCS)`, {
    x: 0, y: 6.8, w: '100%',
    fontSize: 13, color: 'E2E8F0', align: 'center', italic: true
  });

  // ==========================================
  // SLIDE 2: VINH DANH CỜ LUÂN LƯU (FLAG OF HONOR)
  // ==========================================
  const slide2 = pres.addSlide();
  slide2.background = { color: colors.bgLight };

  // Header Slide
  addSlideHeader(slide2, pres, colors, 'VINH DANH CỜ THI ĐUA LUÂN LƯU', `Tuần ${weekNumber} — Tuyên dương 2 tập thể lớp xuất sắc dẫn đầu toàn trường`);

  // Khung Khối Tiểu học
  slide2.addShape(pres.ShapeType.roundRect, {
    x: 1.0, y: 1.8, w: 5.3, h: 4.8,
    fill: { color: colors.cardBg },
    line: { color: colors.accent, width: 2.5 }
  });

  slide2.addText('CỜ LUÂN LƯU TIỂU HỌC', {
    x: 1.0, y: 2.0, w: 5.3,
    fontSize: 16, color: colors.primary, bold: true, align: 'center'
  });

  slide2.addText('🚩 HẠNG 1 TOÀN KHỐI', {
    x: 1.0, y: 2.4, w: 5.3,
    fontSize: 14, color: colors.accent, bold: true, align: 'center'
  });

  slide2.addText(tieuHocRank1 ? tieuHocRank1.className.toUpperCase() : 'LỚP ...', {
    x: 1.0, y: 2.9, w: 5.3,
    fontSize: 36, color: colors.primaryDark, bold: true, align: 'center'
  });

  slide2.addText(tieuHocRank1 ? `Tổng điểm: ${tieuHocRank1.totalScore} / 100 đ` : 'Đang cập nhật', {
    x: 1.0, y: 3.8, w: 5.3,
    fontSize: 20, color: '059669', bold: true, align: 'center'
  });

  slide2.addText(tieuHocRank1 ? `GVCN: ${tieuHocRank1.teacherName}` : '', {
    x: 1.0, y: 4.3, w: 5.3,
    fontSize: 15, color: colors.textColor, bold: true, align: 'center'
  });

  slide2.addText(`Điểm Nề nếp: ${tieuHocRank1?.scoreNeNep || 0}/60 đ\nĐiểm Phong trào: ${tieuHocRank1?.scorePhongTrao || 0}/40 đ\nĐiểm Thưởng: +${tieuHocRank1?.totalBonus || 0} đ`, {
    x: 1.2, y: 4.8, w: 4.9,
    fontSize: 12, color: colors.subTextColor, align: 'center', lineSpacingMultiple: 1.2
  });

  slide2.addText('★ XẾP LOẠI XUẤT SẮC ★', {
    x: 1.0, y: 5.9, w: 5.3,
    fontSize: 14, color: 'DC2626', bold: true, align: 'center'
  });

  // Khung Khối THCS
  slide2.addShape(pres.ShapeType.roundRect, {
    x: 7.0, y: 1.8, w: 5.3, h: 4.8,
    fill: { color: colors.cardBg },
    line: { color: colors.accent, width: 2.5 }
  });

  slide2.addText('CỜ LUÂN LƯU THCS', {
    x: 7.0, y: 2.0, w: 5.3,
    fontSize: 16, color: colors.primary, bold: true, align: 'center'
  });

  slide2.addText('🚩 HẠNG 1 TOÀN KHỐI', {
    x: 7.0, y: 2.4, w: 5.3,
    fontSize: 14, color: colors.accent, bold: true, align: 'center'
  });

  slide2.addText(thcsRank1 ? thcsRank1.className.toUpperCase() : 'LỚP ...', {
    x: 7.0, y: 2.9, w: 5.3,
    fontSize: 36, color: colors.primaryDark, bold: true, align: 'center'
  });

  slide2.addText(thcsRank1 ? `Tổng điểm: ${thcsRank1.totalScore} / 100 đ` : 'Đang cập nhật', {
    x: 7.0, y: 3.8, w: 5.3,
    fontSize: 20, color: '059669', bold: true, align: 'center'
  });

  slide2.addText(thcsRank1 ? `GVCN: ${thcsRank1.teacherName}` : '', {
    x: 7.0, y: 4.3, w: 5.3,
    fontSize: 15, color: colors.textColor, bold: true, align: 'center'
  });

  slide2.addText(`Điểm Nề nếp: ${thcsRank1?.scoreNeNep || 0}/40 đ • Học tập: ${thcsRank1?.scoreHocTap || 0}/30 đ\nPhong trào: ${thcsRank1?.scorePhongTrao || 0}/30 đ • Thưởng: +${thcsRank1?.totalBonus || 0} đ`, {
    x: 7.2, y: 4.8, w: 4.9,
    fontSize: 12, color: colors.subTextColor, align: 'center', lineSpacingMultiple: 1.2
  });

  slide2.addText('★ XẾP LOẠI XUẤT SẮC ★', {
    x: 7.0, y: 5.9, w: 5.3,
    fontSize: 14, color: 'DC2626', bold: true, align: 'center'
  });

  // ==========================================
  // SLIDE 3: BẢNG VÀNG TOP KHỐI TIỂU HỌC
  // ==========================================
  const slide3 = pres.addSlide();
  slide3.background = { color: colors.bgLight };
  addSlideHeader(slide3, pres, colors, 'BẢNG XẾP HẠNG KHỐI TIỂU HỌC (19 LỚP)', `Tổng hợp kết quả thi đua nề nếp Khối 1 đến Khối 5 — Tuần ${weekNumber}`);

  // Bảng Top 5 Tiểu học
  const tableRowsTieuHoc = [
    [
      { text: 'Hạng', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
      { text: 'Lớp', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
      { text: 'Giáo Viên Chủ Nhiệm', options: { bold: true, fill: colors.primary, color: 'FFFFFF' } },
      { text: 'Nề Nếp (/60)', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
      { text: 'Phong Trào (/40)', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
      { text: 'Thưởng (+)', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
      { text: 'Tổng Điểm', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
      { text: 'Danh Hiệu', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
    ]
  ];

  topTieuHoc.forEach((s) => {
    tableRowsTieuHoc.push([
      { text: s.rankInGradeLevel === 1 ? '🥇 Hạng 1' : s.rankInGradeLevel === 2 ? '🥈 Hạng 2' : s.rankInGradeLevel === 3 ? '🥉 Hạng 3' : `Hạng ${s.rankInGradeLevel}`, options: { align: 'center', bold: true, color: s.rankInGradeLevel === 1 ? 'DC2626' : colors.textColor } },
      { text: s.className, options: { align: 'center', bold: true } },
      { text: s.teacherName, options: { bold: false } },
      { text: `${s.scoreNeNep}`, options: { align: 'center' } },
      { text: `${s.scorePhongTrao}`, options: { align: 'center' } },
      { text: `+${s.totalBonus}`, options: { align: 'center', color: '059669', bold: true } },
      { text: `${s.totalScore}`, options: { align: 'center', bold: true, color: 'DC2626' } },
      { text: s.hasRotatingFlag ? '🚩 CỜ LUÂN LƯU' : 'Xuất Sắc', options: { align: 'center', bold: true, color: s.hasRotatingFlag ? 'DC2626' : '059669' } },
    ]);
  });

  slide3.addTable(tableRowsTieuHoc, {
    x: 0.8, y: 1.8, w: 11.7,
    colW: [1.2, 1.2, 2.7, 1.4, 1.6, 1.2, 1.2, 1.2],
    rowH: 0.7,
    border: { pt: 1, color: 'CBD5E1' },
    fontSize: 13,
    valign: 'middle'
  });

  slide3.addText('Ghi chú: Khối Tiểu học không chấm điểm Sổ đầu bài. Thang điểm chuẩn: 60 Nề nếp + 40 Phong trào + Điểm thưởng.', {
    x: 0.8, y: 6.5, w: 11.7,
    fontSize: 11, color: colors.subTextColor, italic: true
  });

  // ==========================================
  // SLIDE 4: BẢNG VÀNG TOP KHỐI THCS
  // ==========================================
  const slide4 = pres.addSlide();
  slide4.background = { color: colors.bgLight };
  addSlideHeader(slide4, pres, colors, 'BẢNG XẾP HẠNG KHỐI THCS (12 LỚP)', `Tổng hợp kết quả thi đua Khối 6 đến Khối 9 — Tuần ${weekNumber}`);

  const tableRowsThcs = [
    [
      { text: 'Hạng', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
      { text: 'Lớp', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
      { text: 'Giáo Viên Chủ Nhiệm', options: { bold: true, fill: colors.primary, color: 'FFFFFF' } },
      { text: 'Nề Nếp (/40)', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
      { text: 'Học Tập (/30)', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
      { text: 'Phong Trào (/30)', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
      { text: 'Tổng Điểm', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
      { text: 'Danh Hiệu', options: { bold: true, fill: colors.primary, color: 'FFFFFF', align: 'center' } },
    ]
  ];

  topThcs.forEach((s) => {
    tableRowsThcs.push([
      { text: s.rankInGradeLevel === 1 ? '🥇 Hạng 1' : s.rankInGradeLevel === 2 ? '🥈 Hạng 2' : s.rankInGradeLevel === 3 ? '🥉 Hạng 3' : `Hạng ${s.rankInGradeLevel}`, options: { align: 'center', bold: true, color: s.rankInGradeLevel === 1 ? 'DC2626' : colors.textColor } },
      { text: s.className, options: { align: 'center', bold: true } },
      { text: s.teacherName, options: { bold: false } },
      { text: `${s.scoreNeNep}`, options: { align: 'center' } },
      { text: `${s.scoreHocTap}`, options: { align: 'center' } },
      { text: `${s.scorePhongTrao}`, options: { align: 'center' } },
      { text: `${s.totalScore}`, options: { align: 'center', bold: true, color: 'DC2626' } },
      { text: s.hasRotatingFlag ? '🚩 CỜ LUÂN LƯU' : 'Xuất Sắc', options: { align: 'center', bold: true, color: s.hasRotatingFlag ? 'DC2626' : '059669' } },
    ]);
  });

  slide4.addTable(tableRowsThcs, {
    x: 0.8, y: 1.8, w: 11.7,
    colW: [1.2, 1.2, 2.7, 1.4, 1.4, 1.4, 1.2, 1.2],
    rowH: 0.7,
    border: { pt: 1, color: 'CBD5E1' },
    fontSize: 13,
    valign: 'middle'
  });

  slide4.addText('Thang điểm chuẩn THCS: 40 Nề nếp + 30 Học tập (Sổ đầu bài, truy bài) + 30 Phong trào + Điểm thưởng.', {
    x: 0.8, y: 6.5, w: 11.7,
    fontSize: 11, color: colors.subTextColor, italic: true
  });

  // ==========================================
  // SLIDE 5: ĐÁNH GIÁ NỀ NẾP & RÚT KINH NGHIỆM
  // ==========================================
  const slide5 = pres.addSlide();
  slide5.background = { color: colors.bgLight };
  addSlideHeader(slide5, pres, colors, 'ĐÁNH GIÁ NỀ NẾP & RÚT KINH NGHIỆM', `Các ưu điểm cần nhân rộng và các tồn tại cần chấn chỉnh — Tuần ${weekNumber}`);

  // Cột Trái: Ưu điểm biểu dương
  slide5.addShape(pres.ShapeType.roundRect, {
    x: 0.8, y: 1.8, w: 5.6, h: 4.8,
    fill: { color: 'F0FDF4' },
    line: { color: '10B981', width: 2 }
  });

  slide5.addText('🌿 ƯU ĐIỂM TIÊU BIỂU TRONG TUẦN', {
    x: 1.0, y: 2.0, w: 5.2,
    fontSize: 15, color: '047857', bold: true
  });

  const praisePoints = [
    `Đa số 31 lớp duy trì nề nếp xếp hàng ra vào lớp nghiêm túc.`,
    `Có ${weekBonuses.length} lượt tập thể & cá nhân được khen thưởng điểm tích cực.`,
    `Nhiều giờ học tốt, tiết dạy tốt được ghi nhận tại Sổ đầu bài.`,
    `Khen ngợi ý thức bảo vệ của công và giữ gìn khuôn viên trường xanh - sạch - đẹp.`
  ];

  slide5.addText(praisePoints.map(p => `✓  ${p}`).join('\n\n'), {
    x: 1.0, y: 2.6, w: 5.2,
    fontSize: 12.5, color: '1F2937', lineSpacingMultiple: 1.2
  });

  // Cột Phải: Các lỗi cần khắc phục
  slide5.addShape(pres.ShapeType.roundRect, {
    x: 6.8, y: 1.8, w: 5.7, h: 4.8,
    fill: { color: 'FEF2F2' },
    line: { color: 'EF4444', width: 2 }
  });

  slide5.addText('⚠️ CÁC LỖI TỒN TẠI CẦN CHẤN CHỈNH', {
    x: 7.0, y: 2.0, w: 5.3,
    fontSize: 15, color: 'B91C1C', bold: true
  });

  const issueLines = topIssues.length > 0
    ? topIssues.map(([name, count]) => `• ${name}: ${count} lượt vi phạm`)
    : [
        '• Học sinh còn đi học muộn sau tiếng trống báo giờ.',
        '• Quên đeo khăn quàng / phù hiệu / thẻ học sinh.',
        '• Vệ sinh lớp cuối buổi chưa đổ rác đúng quy định.',
        '• 15 phút truy bài đầu giờ còn mất trật tự ở một số lớp.'
      ];

  slide5.addText(issueLines.join('\n\n') + '\n\n→ Đề nghị GVCN và Đội Cờ Đỏ nhắc nhở chấn chỉnh ngay từ đầu tuần!', {
    x: 7.0, y: 2.6, w: 5.3,
    fontSize: 12.5, color: '374151', lineSpacingMultiple: 1.2
  });

  // ==========================================
  // SLIDE 6: PHÁT ĐỘNG THI ĐUA TUẦN TIẾP THEO
  // ==========================================
  const slide6 = pres.addSlide();
  slide6.background = { color: colors.primaryDark };

  slide6.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.25,
    fill: { color: colors.accent }
  });

  slide6.addText('KẾ HOẠCH & PHÁT ĐỘNG THI ĐUA TUẦN MỚI', {
    x: 0, y: 1.0, w: '100%',
    fontSize: 28, color: 'FFFFFF', align: 'center', bold: true
  });

  slide6.addText(`LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP — TUẦN ${weekNumber + 1}`, {
    x: 0, y: 1.7, w: '100%',
    fontSize: 16, color: colors.accent, align: 'center', bold: true
  });

  // Khung chủ điểm
  slide6.addShape(pres.ShapeType.roundRect, {
    x: 1.5, y: 2.4, w: 10.33, h: 3.5,
    fill: { color: '000000', transparency: 35 },
    line: { color: colors.accent, width: 2 }
  });

  slide6.addText('CHỦ ĐIỂM THI ĐUA TRỌNG TÂM:', {
    x: 1.8, y: 2.7, w: 9.7,
    fontSize: 16, color: colors.accent, bold: true
  });

  slide6.addText(`"${nextWeekTopic}"`, {
    x: 1.8, y: 3.2, w: 9.7,
    fontSize: 22, color: 'FFFFFF', bold: true, align: 'center'
  });

  const targets = [
    '1. 100% các lớp không có học sinh đi muộn, thực hiện nghiêm túc truy bài 15 phút.',
    '2. Giữ gìn đồng phục chỉnh tề, nghiêm cấm sử dụng điện thoại trong giờ học.',
    '3. Đẩy mạnh phong trào "Hoa Điểm 10" và tích cực chăm sóc bồn hoa măng non.',
    '4. Đội Cờ Đỏ duy trì trực nề nếp công tâm, minh bạch, chính xác.'
  ];

  slide6.addText(targets.join('\n'), {
    x: 1.8, y: 4.1, w: 9.7,
    fontSize: 13, color: 'F1F5F9', lineSpacingMultiple: 1.3
  });

  slide6.addText('CHÚC QUÝ THẦY CÔ VÀ CÁC EM HỌC SINH MỘT TUẦN MỚI THẮNG LỢI!', {
    x: 0, y: 6.5, w: '100%',
    fontSize: 16, color: colors.accent, align: 'center', bold: true
  });

  // Tên file tải về
  const fileName = `Slide_Chao_Co_Tuan_${weekNumber}_PhuocHiep.pptx`;
  await pres.writeFile({ fileName });

  return fileName;
}

function addSlideHeader(slide: any, pres: any, colors: any, title: string, subtitle: string) {
  // Thanh trang trí trên cùng
  slide.addShape(pres.ShapeType.rect, {
    x: 0, y: 0, w: '100%', h: 0.15,
    fill: { color: colors.primary }
  });

  slide.addText(title, {
    x: 0.8, y: 0.5, w: 11.7,
    fontSize: 22, color: colors.primaryDark, bold: true
  });

  slide.addText(subtitle, {
    x: 0.8, y: 1.05, w: 11.7,
    fontSize: 13, color: colors.subTextColor
  });
}
