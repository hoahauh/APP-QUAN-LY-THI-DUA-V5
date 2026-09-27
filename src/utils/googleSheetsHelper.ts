import { WeeklyClassScore, ViolationRecord, ClassInfo, BonusRecord, ViolationRule, BonusRule, GoogleSheetsConfig, SheetsSyncData } from '../types';

export const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * Google Apps Script - Webhook & Database API
 * Quản Lý Thi Đua Liên Đội Trường TH&THCS Phước Hiệp
 * 
 * Hướng dẫn cài đặt 2 chiều (Đẩy dữ liệu lên & Nhận dữ liệu về app):
 * 1. Mở file Google Sheet mới trên Google Drive của trường
 * 2. Vào menu "Tiện ích mở rộng" (Extensions) -> "Apps Script"
 * 3. Xóa code cũ và dán toàn bộ đoạn code này vào file Code.gs
 * 4. Bấm "Triển khai" (Deploy) -> "Tùy chọn triển khai mới" (New deployment)
 * 5. Chọn loại: "Ứng dụng web" (Web app)
 * 6. Cấu hình:
 *    - Thực thi dưới dạng (Execute as): Tôi (Me)
 *    - Ai có quyền truy cập (Who has access): Bất kỳ ai (Anyone)
 * 7. Bấm "Triển khai" (Deploy), cấp quyền và copy Web App URL dán vào ứng dụng.
 */

function doGet(e) {
  var action = (e && e.parameter && e.parameter.action) ? e.parameter.action : 'ping';
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  
  if (action === 'ping') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Kết nối Google Sheets thành công! Hệ thống Quản lý thi đua LĐ trường TH&THCS Phước Hiệp sẵn sàng.',
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }

  // Lấy toàn bộ database để ứng dụng nhận về
  if (action === 'getAllData') {
    var result = {
      status: 'success',
      timestamp: new Date().toISOString(),
      data: {
        violations: readSheetData(ss, 'Bang_Vi_Pham'),
        bonuses: readSheetData(ss, 'Bang_Diem_Thuong'),
        classes: readSheetData(ss, 'Danh_Sach_Lop'),
        violationRules: readSheetData(ss, 'Quy_Dinh_Vi_Pham'),
        bonusRules: readSheetData(ss, 'Quy_Dinh_Diem_Thuong')
      }
    };
    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  if (action === 'getViolations') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: readSheetData(ss, 'Bang_Vi_Pham')
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getBonuses') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: readSheetData(ss, 'Bang_Diem_Thuong')
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getClasses') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: readSheetData(ss, 'Danh_Sach_Lop')
    })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getRules') {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      data: {
        violations: readSheetData(ss, 'Quy_Dinh_Vi_Pham'),
        bonuses: readSheetData(ss, 'Quy_Dinh_Diem_Thuong')
      }
    })).setMimeType(ContentService.MimeType.JSON);
  }

  return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Action not supported: ' + action }))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    var action = payload.action;
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    
    // Ghi nhận bản ghi vi phạm mới
    if (action === 'recordViolation') {
      var sheet = getOrCreateSheet(ss, 'Bang_Vi_Pham');
      var item = payload.data;
      sheet.appendRow([
        item.id,
        item.weekNumber,
        item.classId,
        item.date,
        item.dayOfWeek,
        item.session,
        item.ruleCode,
        item.ruleName,
        item.category,
        item.pointsDeducted,
        item.studentName || '',
        item.note || '',
        item.reporterName,
        new Date().toISOString(),
        item.status || 'APPROVED',
        item.disputeReason || '',
        item.disputeReply || ''
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', id: item.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Ghi nhận điểm thưởng mới
    if (action === 'recordBonus') {
      var sheetBonus = getOrCreateSheet(ss, 'Bang_Diem_Thuong');
      var b = payload.data;
      sheetBonus.appendRow([
        b.id,
        b.weekNumber,
        b.classId,
        b.date,
        b.ruleCode || '',
        b.title,
        b.pointsAdded,
        b.reason || '',
        b.approvedBy,
        new Date().toISOString()
      ]);
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', id: b.id }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    // Đồng bộ bảng tổng hợp xếp hạng tuần
    if (action === 'syncSummary') {
      var sheetSummary = getOrCreateSheet(ss, 'Bang_Tong_Hop_Tuan');
      var summaryList = payload.data; // Mảng điểm 31 lớp
      summaryList.forEach(function(s) {
        sheetSummary.appendRow([
          s.weekNumber,
          s.classId,
          s.className,
          s.gradeLevel,
          s.teacherName,
          s.scoreNeNep,
          s.scoreHocTap,
          s.scorePhongTrao,
          s.totalBonus,
          s.totalScore,
          s.rankInGradeLevel,
          s.rankOverall,
          s.awardTier,
          s.hasRotatingFlag ? 'CỜ LUÂN LƯU' : '',
          new Date().toISOString()
        ]);
      });
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', count: summaryList.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Đồng bộ danh sách lớp Master Data
    if (action === 'syncClasses') {
      var sheetClasses = getOrCreateSheet(ss, 'Danh_Sach_Lop');
      var classList = payload.data;
      sheetClasses.clearContents();
      sheetClasses.appendRow(['id', 'name', 'gradeLevel', 'gradeNumber', 'teacherName', 'teacherEmail', 'studentCount', 'redStarStudent', 'roomNumber']);
      classList.forEach(function(c) {
        sheetClasses.appendRow([c.id, c.name, c.gradeLevel, c.gradeNumber, c.teacherName, c.teacherEmail, c.studentCount, c.redStarStudent, c.roomNumber]);
      });
      return ContentService.createTextOutput(JSON.stringify({ status: 'success', count: classList.length }))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: 'Action not supported' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Đọc dữ liệu từ sheet trả về mảng object JSON
function readSheetData(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var rows = [];
  for (var i = 1; i < data.length; i++) {
    var rowObj = {};
    var hasData = false;
    for (var j = 0; j < headers.length; j++) {
      var key = headers[j].toString().trim();
      if (key) {
        rowObj[key] = data[i][j];
        if (data[i][j] !== '' && data[i][j] !== null) hasData = true;
      }
    }
    if (hasData) rows.push(rowObj);
  }
  return rows;
}

// Khởi tạo các Sheet chuẩn tự động
function getOrCreateSheet(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (sheet) return sheet;
  
  if (sheetName === 'Bang_Vi_Pham') {
    sheet = ss.insertSheet('Bang_Vi_Pham');
    sheet.appendRow([
      'id', 'weekNumber', 'classId', 'date', 'dayOfWeek', 'session', 
      'ruleCode', 'ruleName', 'category', 'pointsDeducted', 'studentName', 
      'note', 'reporterName', 'createdAt', 'status', 'disputeReason', 'disputeReply'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 17).setBackground('#1E3A8A').setFontColor('#FFFFFF').setFontWeight('bold');
  } else if (sheetName === 'Bang_Diem_Thuong') {
    sheet = ss.insertSheet('Bang_Diem_Thuong');
    sheet.appendRow(['id', 'weekNumber', 'classId', 'date', 'ruleCode', 'title', 'pointsAdded', 'reason', 'approvedBy', 'createdAt']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 10).setBackground('#065F46').setFontColor('#FFFFFF').setFontWeight('bold');
  } else if (sheetName === 'Bang_Tong_Hop_Tuan') {
    sheet = ss.insertSheet('Bang_Tong_Hop_Tuan');
    sheet.appendRow([
      'weekNumber', 'classId', 'className', 'gradeLevel', 'teacherName', 
      'scoreNeNep', 'scoreHocTap', 'scorePhongTrao', 'totalBonus', 
      'totalScore', 'rankInGradeLevel', 'rankOverall', 'awardTier', 'rotatingFlag', 'updatedAt'
    ]);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 15).setBackground('#047857').setFontColor('#FFFFFF').setFontWeight('bold');
  } else if (sheetName === 'Danh_Sach_Lop') {
    sheet = ss.insertSheet('Danh_Sach_Lop');
    sheet.appendRow(['id', 'name', 'gradeLevel', 'gradeNumber', 'teacherName', 'teacherEmail', 'studentCount', 'redStarStudent', 'roomNumber']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 9).setBackground('#4338CA').setFontColor('#FFFFFF').setFontWeight('bold');
  } else if (sheetName === 'Quy_Dinh_Vi_Pham') {
    sheet = ss.insertSheet('Quy_Dinh_Vi_Pham');
    sheet.appendRow(['id', 'code', 'name', 'category', 'defaultPoints', 'applicableLevel', 'description']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 7).setBackground('#B91C1C').setFontColor('#FFFFFF').setFontWeight('bold');
  } else if (sheetName === 'Quy_Dinh_Diem_Thuong') {
    sheet = ss.insertSheet('Quy_Dinh_Diem_Thuong');
    sheet.appendRow(['id', 'code', 'name', 'defaultPoints', 'description']);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, 5).setBackground('#D97706').setFontColor('#FFFFFF').setFontWeight('bold');
  } else {
    sheet = ss.insertSheet(sheetName);
  }
  return sheet;
}
`;

/**
 * Trích xuất Sheet ID từ URL Google Sheets bất kỳ hoặc ID thuần túy
 */
export function extractSheetIdFromUrl(urlOrId: string): string {
  if (!urlOrId) return '';
  const trimmed = urlOrId.trim();
  // Khớp định dạng: /spreadsheets/d/([a-zA-Z0-9-_]+)
  const match = trimmed.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) {
    return match[1];
  }
  // Nếu là ID thô không chứa URL
  if (/^[a-zA-Z0-9-_]{20,}$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed;
}

/**
 * Phân tích dữ liệu trả về từ Google Visualization API (gviz/tq)
 */
export function parseGvizResponse(rawText: string): any[] {
  try {
    const match = rawText.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\);?/);
    if (!match || !match[1]) {
      // Trường hợp rawText có thể đã là JSON
      if (rawText.trim().startsWith('{')) {
        const parsed = JSON.parse(rawText);
        if (parsed.data) return Array.isArray(parsed.data) ? parsed.data : [];
        if (parsed.table) return parseGvizTable(parsed.table);
      }
      return [];
    }

    const payload = JSON.parse(match[1]);
    if (!payload.table) return [];
    return parseGvizTable(payload.table);
  } catch (err) {
    console.warn('Lỗi phân tích gviz response:', err);
    return [];
  }
}

function parseGvizTable(table: any): any[] {
  const cols = (table.cols || []).map((c: any, idx: number) => {
    return (c && (c.label || c.id)) ? String(c.label || c.id).trim() : `col_${idx}`;
  });

  const rows: any[] = [];
  (table.rows || []).forEach((r: any) => {
    if (!r || !r.c) return;
    const rowObj: Record<string, any> = {};
    let hasVal = false;
    r.c.forEach((cell: any, idx: number) => {
      const colName = cols[idx] || `col_${idx}`;
      const val = cell ? (cell.v !== undefined ? cell.v : cell.f) : '';
      rowObj[colName] = val;
      if (val !== '' && val !== null && val !== undefined) hasVal = true;
    });
    if (hasVal) rows.push(rowObj);
  });
  return rows;
}

/**
 * Fetch bảng tính từ Google Sheet công khai (không cần Apps Script Web App)
 */
export async function fetchSheetViaGviz(sheetId: string, sheetName: string): Promise<any[]> {
  const cleanId = extractSheetIdFromUrl(sheetId);
  if (!cleanId) throw new Error('Mã Google Sheet ID không hợp lệ');

  const url = `https://docs.google.com/spreadsheets/d/${cleanId}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Không thể tải trang "${sheetName}". Hãy đảm bảo Google Sheet đã mở quyền "Bất kỳ ai có liên kết đều xem được" (HTTP ${response.status})`);
  }
  const text = await response.text();
  return parseGvizResponse(text);
}

/**
 * Nhận toàn bộ database online từ Google Sheets
 * Tự động chọn:
 * 1. Gọi Web App URL (Apps Script API) nếu có
 * 2. Fallback sang Google Sheet ID công khai (gviz)
 */
export async function fetchFullOnlineDatabase(
  config: GoogleSheetsConfig
): Promise<{ success: boolean; data?: SheetsSyncData; source: 'APPS_SCRIPT' | 'GVIZ'; message: string }> {
  // Thử qua Google Apps Script Web App trước nếu có cấu hình
  if (config.webAppUrl && config.webAppUrl.trim().startsWith('http')) {
    try {
      const url = `${config.webAppUrl.trim()}${config.webAppUrl.includes('?') ? '&' : '?'}action=getAllData&_t=${Date.now()}`;
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) {
        const json = await res.json();
        if (json.status === 'success' && json.data) {
          const formatted = normalizeDatabaseRecords(json.data);
          return {
            success: true,
            source: 'APPS_SCRIPT',
            data: formatted,
            message: 'Đã nhận toàn bộ cơ sở dữ liệu qua Google Apps Script Web App thành công!'
          };
        }
      }
    } catch (e: any) {
      console.warn('Lỗi khi fetch qua Apps Script, chuyển sang fetch qua Sheet ID:', e);
    }
  }

  // Fallback: Fetch trực tiếp qua Google Sheet ID (Public Sheet via Gviz)
  const sheetId = extractSheetIdFromUrl(config.sheetId);
  if (!sheetId) {
    return {
      success: false,
      source: 'GVIZ',
      message: 'Vui lòng cung cấp Web App URL hoặc Google Sheet ID để nhận dữ liệu online!'
    };
  }

  try {
    const sheetViPham = config.sheetNameViolations || 'Bang_Vi_Pham';
    const sheetLop = config.sheetNameClasses || 'Danh_Sach_Lop';
    const sheetBonus = config.sheetNameBonuses || 'Bang_Diem_Thuong';
    const sheetRules = config.sheetNameRules || 'Quy_Dinh_Vi_Pham';

    // Tải song song các sheet
    const [rawViolations, rawClasses, rawBonuses, rawRules] = await Promise.allSettled([
      fetchSheetViaGviz(sheetId, sheetViPham),
      fetchSheetViaGviz(sheetId, sheetLop),
      fetchSheetViaGviz(sheetId, sheetBonus),
      fetchSheetViaGviz(sheetId, sheetRules),
    ]);

    const resultData: SheetsSyncData = {};

    if (rawViolations.status === 'fulfilled' && rawViolations.value.length > 0) {
      resultData.violations = mapRawToViolations(rawViolations.value);
    }
    if (rawClasses.status === 'fulfilled' && rawClasses.value.length > 0) {
      resultData.classes = mapRawToClasses(rawClasses.value);
    }
    if (rawBonuses.status === 'fulfilled' && rawBonuses.value.length > 0) {
      resultData.bonuses = mapRawToBonuses(rawBonuses.value);
    }
    if (rawRules.status === 'fulfilled' && rawRules.value.length > 0) {
      resultData.violationRules = mapRawToRules(rawRules.value);
    }

    const totalRecords = 
      (resultData.violations?.length || 0) + 
      (resultData.classes?.length || 0) + 
      (resultData.bonuses?.length || 0) + 
      (resultData.violationRules?.length || 0);

    if (totalRecords === 0) {
      return {
        success: false,
        source: 'GVIZ',
        message: 'Đã kết nối Google Sheet nhưng không tìm thấy dữ liệu trong các sheet. Vui lòng kiểm tra tên sheet hoặc chia sẻ quyền xem.'
      };
    }

    return {
      success: true,
      source: 'GVIZ',
      data: resultData,
      message: `Đã nhận thành công dữ liệu từ Google Sheet (${resultData.violations?.length || 0} vi phạm, ${resultData.classes?.length || 0} lớp, ${resultData.bonuses?.length || 0} điểm thưởng)!`
    };
  } catch (err: any) {
    return {
      success: false,
      source: 'GVIZ',
      message: `Lỗi nhận dữ liệu từ Google Sheets: ${err?.message || 'Không thể truy cập Google Sheet. Vui lòng kiểm tra quyền chia sẻ công khai.'}`
    };
  }
}

/**
 * Chuẩn hóa các record từ Apps Script trả về
 */
function normalizeDatabaseRecords(raw: any): SheetsSyncData {
  const res: SheetsSyncData = {};
  if (Array.isArray(raw.violations)) {
    res.violations = mapRawToViolations(raw.violations);
  }
  if (Array.isArray(raw.classes)) {
    res.classes = mapRawToClasses(raw.classes);
  }
  if (Array.isArray(raw.bonuses)) {
    res.bonuses = mapRawToBonuses(raw.bonuses);
  }
  if (Array.isArray(raw.violationRules)) {
    res.violationRules = mapRawToRules(raw.violationRules);
  }
  return res;
}

function mapRawToViolations(rows: any[]): ViolationRecord[] {
  return rows.map((r, i) => {
    const id = String(r.id || r['Mã Bản Ghi'] || r['Mã Ghi Nhận'] || `v-sheet-${i + 1}`);
    const weekNumber = Number(r.weekNumber || r['Tuần'] || 1);
    const classId = String(r.classId || r['Lớp'] || r['Mã Lớp'] || '').trim().toUpperCase();
    const date = String(r.date || r['Ngày Vi Phạm'] || r['Ngày'] || new Date().toISOString().split('T')[0]);
    const dayOfWeek = String(r.dayOfWeek || r['Thứ'] || 'Thứ Hai');
    const session = String(r.session || r['Buổi'] || 'SANG').toUpperCase().includes('CHIEU') ? 'CHIEU' : 'SANG';
    const ruleCode = String(r.ruleCode || r['Mã Lỗi'] || r['Mã Quy Định'] || 'NN01');
    const ruleName = String(r.ruleName || r['Tên Lỗi'] || r['Tên Vi Phạm'] || 'Vi phạm nề nếp');
    const category = (r.category || r['Danh Mục'] || 'NE_NEP') as any;
    const pointsDeducted = Math.abs(Number(r.pointsDeducted || r['Điểm Trừ'] || 1));
    const studentName = r.studentName || r['Học Sinh Vi Phạm'] || r['Học Sinh'] || '';
    const note = r.note || r['Ghi Chú'] || '';
    const reporterName = r.reporterName || r['Người Ghi Nhận'] || 'Cờ Đỏ';
    const createdAt = r.createdAt || r['Thời Gian Ghi'] || new Date().toISOString();
    const status = (r.status || r['Trạng Thái'] || 'APPROVED') as any;

    return {
      id,
      weekNumber,
      classId,
      date,
      dayOfWeek,
      session,
      ruleId: ruleCode,
      ruleCode,
      ruleName,
      category: category === 'HOC_TAP' || category === 'PHONG_TRAO' ? category : 'NE_NEP',
      pointsDeducted,
      studentName: String(studentName),
      note: String(note),
      reporterRole: 'CO_DO',
      reporterName: String(reporterName),
      createdAt: String(createdAt),
      status: ['APPROVED', 'DISPUTED', 'RESOLVED', 'CANCELLED'].includes(status) ? status : 'APPROVED',
      disputeReason: r.disputeReason || r['Lý Do Khiếu Nại'] || '',
      disputeReply: r.disputeReply || r['Phản Hồi Khiếu Nại'] || '',
    };
  }).filter(v => v.classId);
}

function mapRawToClasses(rows: any[]): ClassInfo[] {
  return rows.map((r) => {
    const id = String(r.id || r['Mã Lớp'] || '').trim().toUpperCase();
    const name = String(r.name || r['Tên Lớp'] || `Lớp ${id}`);
    const gradeLevel = String(r.gradeLevel || r['Cấp Học'] || (id.startsWith('6') || id.startsWith('7') || id.startsWith('8') || id.startsWith('9') ? 'THCS' : 'TIEU_HOC')).toUpperCase() === 'THCS' ? 'THCS' : 'TIEU_HOC';
    const gradeNumber = Number(r.gradeNumber || r['Khối'] || parseInt(id[0] || '1', 10) || 1);
    const teacherName = String(r.teacherName || r['GVCN'] || 'Giáo viên chủ nhiệm');
    const teacherEmail = String(r.teacherEmail || r['Email'] || '');
    const studentCount = Number(r.studentCount || r['Sĩ Số'] || 30);
    const redStarStudent = String(r.redStarStudent || r['Học Sinh Cờ Đỏ'] || '');
    const roomNumber = String(r.roomNumber || r['Phòng Học'] || '');

    return {
      id,
      name,
      gradeLevel,
      gradeNumber,
      teacherName,
      teacherEmail,
      studentCount,
      redStarStudent,
      roomNumber
    };
  }).filter(c => c.id);
}

function mapRawToBonuses(rows: any[]): BonusRecord[] {
  return rows.map((r, i) => {
    const id = String(r.id || r['Mã Bản Ghi'] || `b-sheet-${i + 1}`);
    const weekNumber = Number(r.weekNumber || r['Tuần'] || 1);
    const classId = String(r.classId || r['Lớp'] || r['Mã Lớp'] || '').trim().toUpperCase();
    const date = String(r.date || r['Ngày'] || new Date().toISOString().split('T')[0]);
    const ruleCode = String(r.ruleCode || r['Mã'] || '');
    const title = String(r.title || r['Nội Dung'] || r['Tên Khen Thưởng'] || 'Điểm thưởng thi đua');
    const pointsAdded = Math.abs(Number(r.pointsAdded || r['Điểm Thưởng'] || r['Điểm Cộng'] || 1));
    const reason = String(r.reason || r['Lý Do'] || '');
    const approvedBy = String(r.approvedBy || r['Người Duyệt'] || 'Tổng Phụ Trách');
    const createdAt = String(r.createdAt || new Date().toISOString());

    return {
      id,
      weekNumber,
      classId,
      date,
      ruleCode,
      title,
      pointsAdded,
      reason,
      approvedBy,
      createdAt
    };
  }).filter(b => b.classId);
}

function mapRawToRules(rows: any[]): ViolationRule[] {
  return rows.map((r) => {
    const id = String(r.id || r.code || r['Mã Lỗi'] || 'NN01');
    const code = String(r.code || id);
    const name = String(r.name || r['Tên Lỗi'] || 'Lỗi vi phạm');
    const category = (r.category || r['Danh Mục'] || 'NE_NEP') as any;
    const defaultPoints = Math.abs(Number(r.defaultPoints || r['Điểm Trừ'] || 1));
    const applicableLevel = (r.applicableLevel || 'ALL') as any;
    const description = String(r.description || r['Mô Tả'] || '');

    return {
      id,
      code,
      name,
      category: ['NE_NEP', 'HOC_TAP', 'PHONG_TRAO'].includes(category) ? category : 'NE_NEP',
      defaultPoints,
      applicableLevel: ['ALL', 'TIEU_HOC', 'THCS'].includes(applicableLevel) ? applicableLevel : 'ALL',
      description
    };
  });
}

export function exportSummaryToCSV(scores: WeeklyClassScore[], weekNumber: number): string {
  const headers = [
    'Hạng Khối',
    'Hạng Trường',
    'Lớp',
    'Khối Cấp',
    'GVCN',
    'Điểm Nề Nếp',
    'Điểm Học Tập',
    'Điểm Phong Trào',
    'Điểm Thưởng (+)',
    'Tổng Điểm Tuần',
    'Xếp Loại',
    'Cờ Luân Lưu',
  ];

  const rows = scores.map((s) => [
    s.rankInGradeLevel,
    s.rankOverall,
    s.className,
    s.gradeLevel === 'TIEU_HOC' ? 'Tiểu học' : 'THCS',
    `"${s.teacherName}"`,
    `${s.scoreNeNep} (/${s.baseNeNep})`,
    `${s.scoreHocTap} (/${s.baseHocTap})`,
    `${s.scorePhongTrao} (/${s.basePhongTrao})`,
    `+${s.totalBonus}`,
    s.totalScore,
    s.awardTier === 'XUAT_SAC' ? 'Xuất sắc' : s.awardTier === 'TOT' ? 'Tốt' : s.awardTier === 'KHA' ? 'Khá' : 'Trung bình',
    s.hasRotatingFlag ? 'CỜ LUÂN LƯU' : '',
  ]);

  return [
    `# BẢNG TỔNG HỢP XẾP HẠNG THI ĐUA LIÊN ĐỘI TRƯỜNG TH&THCS PHƯỚC HIỆP - TUẦN ${weekNumber}`,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');
}

export function exportViolationsToCSV(violations: ViolationRecord[], weekNumber: number): string {
  const headers = [
    'Mã Ghi Nhận',
    'Tuần',
    'Lớp',
    'Ngày',
    'Thứ',
    'Buổi',
    'Mã Quy Định',
    'Tên Vi Phạm',
    'Danh Mục',
    'Điểm Trừ',
    'Học Sinh',
    'Ghi Chú',
    'Người Ghi Nhận',
    'Trạng Thái',
  ];

  const rows = violations
    .filter((v) => v.weekNumber === weekNumber)
    .map((v) => [
      v.id,
      v.weekNumber,
      v.classId,
      v.date,
      v.dayOfWeek,
      v.session === 'SANG' ? 'Sáng' : 'Chiều',
      v.ruleCode,
      `"${v.ruleName}"`,
      v.category === 'NE_NEP' ? 'Nề nếp' : v.category === 'HOC_TAP' ? 'Học tập' : 'Phong trào',
      `-${v.pointsDeducted}`,
      `"${v.studentName || ''}"`,
      `"${v.note || ''}"`,
      `"${v.reporterName}"`,
      v.status === 'APPROVED' ? 'Đã duyệt' : v.status === 'DISPUTED' ? 'Khiếu nại' : v.status === 'RESOLVED' ? 'Đã giải quyết' : 'Đã hủy',
    ]);

  return [
    `# SỔ THEO DÕI VI PHẠM THI ĐUA NỀ NẾP - TUẦN ${weekNumber}`,
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');
}

export function downloadFile(content: string, fileName: string, mimeType = 'text/csv;charset=utf-8;') {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
