import React, { useState } from 'react';
import { 
  Cpu, 
  Database, 
  GitBranch, 
  Code2, 
  ShieldAlert, 
  Copy, 
  Check, 
  Calculator, 
  ArrowRight,
  Sparkles,
  Lock,
  Layers,
  FileCheck
} from 'lucide-react';
import { GOOGLE_APPS_SCRIPT_TEMPLATE } from '../utils/googleSheetsHelper';

export const ArchitectDocumentation: React.FC = () => {
  const [activeSection, setActiveSection] = useState<number>(1);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Mini live simulator for formulas
  const [simLevel, setSimLevel] = useState<'TIEU_HOC' | 'THCS'>('TIEU_HOC');
  const [simNeNepDeduct, setSimNeNepDeduct] = useState<number>(3);
  const [simHocTapDeduct, setSimHocTapDeduct] = useState<number>(2);
  const [simPhongTraoDeduct, setSimPhongTraoDeduct] = useState<number>(0);
  const [simBonus, setSimBonus] = useState<number>(5);

  const baseNeNep = simLevel === 'TIEU_HOC' ? 60 : 40;
  const baseHocTap = simLevel === 'TIEU_HOC' ? 0 : 30;
  const basePhongTrao = simLevel === 'TIEU_HOC' ? 40 : 30;

  const scoreNeNep = Math.max(0, baseNeNep - simNeNepDeduct);
  const scoreHocTap = Math.max(0, baseHocTap - (simLevel === 'TIEU_HOC' ? 0 : simHocTapDeduct));
  const scorePhongTrao = Math.max(0, basePhongTrao - simPhongTraoDeduct);
  const totalScore = scoreNeNep + scoreHocTap + scorePhongTrao + simBonus;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-900 text-white p-6 rounded-2xl shadow-lg border border-indigo-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-indigo-500/20 border border-indigo-500/30 px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 text-indigo-300">
              <Cpu className="w-3.5 h-3.5" />
              <span>EdTech Architecture Blueprint</span>
            </div>
            <h2 className="text-xl font-bold">Hồ Sơ Thiết Kế Kiến Trúc Hệ Thống Quản Lý Thi Đua Học Đường</h2>
            <p className="text-xs text-indigo-200 mt-1 max-w-2xl leading-relaxed">
              Tài liệu kỹ thuật hoàn chỉnh gồm 5 phần chuẩn: Phân tích Logic, Cấu trúc CSDL, Quy trình nghiệp vụ, Giải pháp kỹ thuật (GAS / Formulas / AppSheet) và Lưu ý bảo mật đồng bộ.
            </p>
          </div>
          <div className="flex items-center space-x-2 bg-indigo-950/60 p-2 rounded-xl border border-indigo-800">
            <span className="text-xs font-mono text-indigo-300">Quy chuẩn 31 lớp • 35 tuần</span>
          </div>
        </div>

        {/* Section Navigation Tabs */}
        <div className="mt-6 flex flex-wrap gap-2 pt-4 border-t border-indigo-800/60">
          {[
            { id: 1, title: '1. Phân Tích Logic', icon: Calculator },
            { id: 2, title: '2. Cấu Trúc CSDL', icon: Database },
            { id: 3, title: '3. Quy Trình Nghiệp Vụ', icon: GitBranch },
            { id: 4, title: '4. Giải Pháp Kỹ Thuật', icon: Code2 },
            { id: 5, title: '5. Lưu Ý Quan Trọng', icon: ShieldAlert },
          ].map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-md ring-2 ring-indigo-400'
                    : 'bg-indigo-950/40 text-indigo-200 hover:bg-indigo-900/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-indigo-600' : 'text-indigo-400'}`} />
                <span>{sec.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content for Section 1: Phân Tích Logic */}
      {activeSection === 1 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calculator className="w-5 h-5 text-indigo-600" />
                1. Phân Tích Logic Tính Toán Điểm Số (Logic Analysis)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Quy định phân định thang điểm độc lập cho 2 khối cấp để đảm bảo tính công bằng và phù hợp tâm sinh lý học sinh.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Khối Tiểu học */}
              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/50 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-900 dark:text-amber-300 text-sm">Khối Tiểu Học (19 Lớp)</span>
                  <span className="text-xs bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded font-bold">
                    Tổng Chuẩn = 100đ
                  </span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-amber-200/80 font-mono text-xs text-amber-800 dark:text-amber-300 font-bold">
                  Tổng = 60 (Nề nếp) + 40 (Phong trào) + Điểm thưởng
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                  <li><strong>Nề nếp (60đ):</strong> Trọng số lớn nhất vì lứa tuổi tiểu học tập trung rèn luyện thói quen xếp hàng, lễ phép, giữ gìn vệ sinh cá nhân và lớp học.</li>
                  <li><strong>Phong trào (40đ):</strong> Đánh giá việc tham gia thể dục nhịp điệu, múa hát tập thể, chăm sóc công trình măng non.</li>
                  <li><strong>Học tập:</strong> Không tính điểm trừ Sổ đầu bài như cấp 2 nhằm tránh áp lực điểm số theo định hướng Thông tư 27/BGDĐT.</li>
                </ul>
              </div>

              {/* Khối THCS */}
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/50 dark:bg-rose-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-rose-900 dark:text-rose-300 text-sm">Khối THCS (12 Lớp)</span>
                  <span className="text-xs bg-rose-200 dark:bg-rose-900 text-rose-900 dark:text-rose-200 px-2 py-0.5 rounded font-bold">
                    Tổng Chuẩn = 100đ
                  </span>
                </div>
                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg border border-rose-200/80 font-mono text-xs text-rose-800 dark:text-rose-300 font-bold">
                  Tổng = 40 (Nề nếp) + 30 (Học tập) + 30 (Phong trào) + Điểm thưởng
                </div>
                <ul className="text-xs text-slate-600 dark:text-slate-300 space-y-1 list-disc list-inside">
                  <li><strong>Nề nếp (40đ):</strong> Kiểm tra nghiêm ngặt việc mặc đúng đồng phục, cấm sử dụng điện thoại sai quy định, đi học đúng giờ, tác phong đội viên.</li>
                  <li><strong>Học tập (30đ):</strong> Đo lường qua xếp loại tiết học Sổ đầu bài (Tiết B -2đ, Tiết C -5đ, Tiết D -10đ), 15 phút truy bài, chuẩn bị bài.</li>
                  <li><strong>Phong trào (30đ):</strong> Tham gia công tác Đội - Đoàn, báo tường, giải thể thao học sinh, Kế hoạch nhỏ.</li>
                </ul>
              </div>
            </div>

            {/* Dynamic Bonus Section */}
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <h4 className="font-bold text-emerald-900 dark:text-emerald-300 text-sm">
                  Cơ Chế Điểm Thưởng Linh Hoạt (Dynamic Bonus Architecture)
                </h4>
              </div>
              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Điểm thưởng được xử lý như một trường độc lập <code>totalBonus = Σ(pointsAdded)</code>. Nó được cộng trực tiếp vào tổng điểm cuối cùng của tuần mà không làm sai lệch thang đo tỷ lệ gốc của các tiêu chí con. Nhờ đó, các lớp có thể đạt điểm trên 100đ (ví dụ 103đ hoặc 105đ) khi có học sinh đạt thành tích xuất sắc cấp quận, thành phố hoặc làm việc tốt.
              </p>
            </div>

            {/* Interactive Simulator */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Calculator className="w-3.5 h-3.5 text-indigo-500" />
                  Mô Phỏng Trực Tiếp Công Thức Điểm
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSimLevel('TIEU_HOC')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      simLevel === 'TIEU_HOC' ? 'bg-amber-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    Tiểu học
                  </button>
                  <button
                    type="button"
                    onClick={() => setSimLevel('THCS')}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      simLevel === 'THCS' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    THCS
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Trừ Nề Nếp</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={simNeNepDeduct}
                    onChange={(e) => setSimNeNepDeduct(Number(e.target.value))}
                    className="w-full p-1.5 text-center font-bold bg-white dark:bg-slate-900 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">
                    Trừ Học Tập {simLevel === 'TIEU_HOC' ? '(Không áp dụng)' : ''}
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="30"
                    disabled={simLevel === 'TIEU_HOC'}
                    value={simLevel === 'TIEU_HOC' ? 0 : simHocTapDeduct}
                    onChange={(e) => setSimHocTapDeduct(Number(e.target.value))}
                    className="w-full p-1.5 text-center font-bold bg-white dark:bg-slate-900 border rounded disabled:opacity-40"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Trừ Phong Trào</label>
                  <input
                    type="number"
                    min="0"
                    max="40"
                    value={simPhongTraoDeduct}
                    onChange={(e) => setSimPhongTraoDeduct(Number(e.target.value))}
                    className="w-full p-1.5 text-center font-bold bg-white dark:bg-slate-900 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Điểm Thưởng (+)</label>
                  <input
                    type="number"
                    min="0"
                    max="20"
                    value={simBonus}
                    onChange={(e) => setSimBonus(Number(e.target.value))}
                    className="w-full p-1.5 text-center font-bold bg-white dark:bg-slate-900 border rounded text-emerald-600"
                  />
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-lg flex items-center justify-between border border-slate-200 dark:border-slate-700">
                <span className="text-xs font-mono">
                  {scoreNeNep} (Nề nếp) + {scoreHocTap} (Học tập) + {scorePhongTrao} (Phong trào) + {simBonus} (Thưởng)
                </span>
                <span className="text-base font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  = {totalScore} Điểm
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content for Section 2: Cấu Trúc CSDL */}
      {activeSection === 2 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-indigo-600" />
                2. Cấu Trúc Cơ Sở Dữ Liệu (Database Schema)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Thiết kế chuẩn hóa dữ liệu trên Google Sheets thành 4 bảng quan hệ (Relational Entity Architecture)
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Bảng Vi Phạm */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">1. Bảng Vi Phạm (Bang_Vi_Pham)</span>
                  <span className="text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded font-mono font-bold">Transaction Table</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Lưu trữ từng bản ghi vi phạm phát sinh theo thời gian thực (append-only)
                </p>
                <div className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <div><strong>PK:</strong> id (UUID)</div>
                  <div><strong>FK:</strong> classId &rarr; Danh_Sach_Lop(id)</div>
                  <div><strong>FK:</strong> ruleCode &rarr; DanhMuc_Loi(code)</div>
                  <div><strong>Fields:</strong> weekNumber, date, dayOfWeek, session, pointsDeducted, studentName, note, reporterName, createdAt, status</div>
                </div>
              </div>

              {/* Bảng Tổng Hợp Tuần */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">2. Bảng Tổng Hợp Tuần (Bang_Tong_Hop_Tuan)</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded font-mono font-bold">Aggregated Snapshot</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Mỗi tuần gồm đúng 31 dòng tương ứng 31 lớp để xếp hạng và kết xuất báo cáo
                </p>
                <div className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <div><strong>Composite Key:</strong> [weekNumber, classId]</div>
                  <div><strong>Fields:</strong> className, gradeLevel, teacherName, scoreNeNep, scoreHocTap, scorePhongTrao, totalBonus, totalScore, rankInGradeLevel, rankOverall, awardTier, updatedAt</div>
                </div>
              </div>

              {/* Bảng Danh Sách Lớp */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">3. Bảng Lớp Học (Danh_Sach_Lop)</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-mono font-bold">Master Reference</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Danh sách 31 lớp cố định của trường liên cấp (19 lớp 1-5, 12 lớp 6-9)
                </p>
                <div className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <div><strong>PK:</strong> id ('1A1', '1A2', ... '9A3')</div>
                  <div><strong>Fields:</strong> name, gradeLevel (TIEU_HOC/THCS), gradeNumber (1..9), teacherName, teacherEmail, studentCount, redStarStudent, roomNumber</div>
                </div>
              </div>

              {/* Bảng Danh Mục Quy Chế */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 dark:text-white">4. Danh Mục Lỗi & Thưởng (DanhMuc_QuyChe)</span>
                  <span className="text-[10px] bg-purple-100 text-purple-800 px-2 py-0.5 rounded font-mono font-bold">Lookup Config</span>
                </div>
                <p className="text-slate-500 text-[11px]">
                  Bảng tham chiếu định mức điểm trừ và điểm thưởng chuẩn
                </p>
                <div className="font-mono text-[11px] bg-white dark:bg-slate-900 p-2.5 rounded border border-slate-200 dark:border-slate-700 space-y-1">
                  <div><strong>PK:</strong> code ('NN01', 'HT01', 'PT01', 'TH01')</div>
                  <div><strong>Fields:</strong> name, category, defaultPoints, applicableLevel, description</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Content for Section 3: Quy Trình Nghiệp Vụ */}
      {activeSection === 3 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <GitBranch className="w-5 h-5 text-indigo-600" />
                3. Quy Trình Nghiệp Vụ (End-to-End Workflow)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Luồng dữ liệu khép kín từ Đội Cờ Đỏ &rarr; Google Sheets &rarr; GVCN giám sát khiếu nại &rarr; TPT thẩm duyệt &rarr; Lễ Chào Cờ trao cờ luân lưu
              </p>
            </div>

            <div className="space-y-3">
              {[
                {
                  step: 'Bước 1',
                  title: 'Đội Cờ Đỏ / Sao Đỏ trực ca & ghi nhận lỗi',
                  actor: 'Đội Cờ Đỏ',
                  color: 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-300',
                  desc: 'Học sinh đội cờ đỏ mở ứng dụng di động, chọn lớp vi phạm, chọn lỗi từ danh mục chuẩn hóa. Điểm trừ tự động nhảy theo quy chế. Nhấn nút gửi trong vòng 5 giây.',
                },
                {
                  step: 'Bước 2',
                  title: 'Đồng bộ hai chiều tức thì với Google Sheets',
                  actor: 'Hệ thống tự động',
                  color: 'border-blue-500 bg-blue-50 dark:bg-blue-950/20 text-blue-900 dark:text-blue-300',
                  desc: 'Bản ghi được ghi ngay vào bảng Bang_Vi_Pham trên Google Sheets qua Webhook Google Apps Script. Bảng tính tự động tính lại điểm còn lại của lớp.',
                },
                {
                  step: 'Bước 3',
                  title: 'GVCN theo dõi điểm & nộp khiếu nại (Dispute)',
                  actor: 'Giáo viên chủ nhiệm (31 GV)',
                  color: 'border-purple-500 bg-purple-50 dark:bg-purple-950/20 text-purple-900 dark:text-purple-300',
                  desc: 'GVCN đăng nhập chọn lớp mình, xem từng vi phạm. Nếu có nhầm lẫn (HS có phép y tế, cờ đỏ ghi nhầm tên), GVCN nhấn "Khiếu nại" và gửi minh chứng giải trình.',
                },
                {
                  step: 'Bước 4',
                  title: 'Tổng Phụ Trách (Admin) thẩm định & phân bổ điểm thưởng',
                  actor: 'Tổng Phụ Trách Đội',
                  color: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-300',
                  desc: 'TPT xem danh sách khiếu nại, phê duyệt (hủy trừ điểm) hoặc bác bỏ. Đồng thời, TPT nhập các điểm thưởng cho các lớp có thành tích xuất sắc trong tuần.',
                },
                {
                  step: 'Bước 5',
                  title: 'Chốt tuần, tự động xếp hạng & trao Cờ Luân Lưu',
                  actor: 'Ban Giám Hiệu & Toàn Trường',
                  color: 'border-rose-500 bg-rose-50 dark:bg-rose-950/20 text-rose-900 dark:text-rose-300',
                  desc: 'Vào chiều thứ Sáu, TPT khóa tuần (Freeze). Hệ thống tính Hạng 1 Tiểu học và Hạng 1 THCS để trao Cờ Luân Lưu trong tiết Sinh hoạt dưới cờ sáng thứ Hai.',
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border-l-4 ${item.color} shadow-xs flex items-start space-x-3`}
                >
                  <div className="font-black text-xs uppercase px-2 py-1 rounded bg-black/10 flex-shrink-0">
                    {item.step}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white">{item.title}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                        {item.actor}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Content for Section 4: Giải Pháp Kỹ Thuật */}
      {activeSection === 4 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Code2 className="w-5 h-5 text-indigo-600" />
                4. Giải Pháp Kỹ Thuật (Technical Recommendation)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Các giải pháp triển khai bằng Google Apps Script, Google Sheets Formulas và tích hợp No-code (AppSheet)
              </p>
            </div>

            {/* Google Sheets Formulas Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-emerald-500" />
                  A. Bộ Công Thức Chuẩn Trên Google Sheets
                </h4>
                <button
                  onClick={() => copyToClipboard(`=MAX(0, IF(D2="TIEU_HOC", 60, 40) - SUMIFS(Bang_Vi_Pham!J:J, Bang_Vi_Pham!C:C, B2, Bang_Vi_Pham!B:B, A2, Bang_Vi_Pham!I:I, "NE_NEP", Bang_Vi_Pham!O:O, "<>CANCELLED"))`, 'f1')}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCode === 'f1' ? 'Đã sao chép!' : 'Chép công thức'}</span>
                </button>
              </div>
              <pre className="bg-slate-950 text-emerald-400 p-3 rounded-xl text-[11px] font-mono overflow-x-auto leading-relaxed border border-slate-800">
{`# 1. Điểm Nề Nếp (Cột E):
=MAX(0, IF(D2="TIEU_HOC", 60, 40) - SUMIFS(Bang_Vi_Pham!J:J, Bang_Vi_Pham!C:C, B2, Bang_Vi_Pham!B:B, A2, Bang_Vi_Pham!I:I, "NE_NEP", Bang_Vi_Pham!O:O, "<>CANCELLED"))

# 2. Điểm Học Tập (Cột F, chỉ THCS):
=IF(D2="TIEU_HOC", 0, MAX(0, 30 - SUMIFS(Bang_Vi_Pham!J:J, Bang_Vi_Pham!C:C, B2, Bang_Vi_Pham!B:B, A2, Bang_Vi_Pham!I:I, "HOC_TAP", Bang_Vi_Pham!O:O, "<>CANCELLED")))

# 3. Điểm Phong Trào (Cột G):
=MAX(0, IF(D2="TIEU_HOC", 40, 30) - SUMIFS(Bang_Vi_Pham!J:J, Bang_Vi_Pham!C:C, B2, Bang_Vi_Pham!B:B, A2, Bang_Vi_Pham!I:I, "PHONG_TRAO", Bang_Vi_Pham!O:O, "<>CANCELLED"))

# 4. Điểm Thưởng (Cột H):
=SUMIFS(Bang_Diem_Thuong!E:E, Bang_Diem_Thuong!B:B, B2, Bang_Diem_Thuong!A:A, A2)

# 5. Tổng Điểm (Cột I):
=E2 + F2 + G2 + H2

# 6. Xếp Hạng Theo Khối (Cột J):
=RANK(I2, FILTER(I:I, D:D=D2))`}</pre>
            </div>

            {/* Google Apps Script Snippet */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <Code2 className="w-4 h-4 text-emerald-500" />
                  B. Webhook API Bằng Google Apps Script
                </h4>
                <button
                  onClick={() => copyToClipboard(GOOGLE_APPS_SCRIPT_TEMPLATE, 'f2')}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>{copiedCode === 'f2' ? 'Đã sao chép!' : 'Chép Code.gs'}</span>
                </button>
              </div>
              <p className="text-xs text-slate-500">
                Cho phép ghi nhận vi phạm trực tiếp từ thiết bị di động mà không cần cấp quyền truy cập chỉnh sửa file Google Sheet cho học sinh cờ đỏ.
              </p>
            </div>

            {/* AppSheet Architecture Suggestion */}
            <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/40 bg-indigo-50/50 dark:bg-indigo-950/20 space-y-2">
              <h4 className="font-bold text-indigo-900 dark:text-indigo-300 text-xs uppercase">
                C. Kiến Trúc No-Code Tùy Chọn Với AppSheet
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Nếu trường học muốn triển khai ứng dụng native di động không cần viết mã, Google AppSheet có thể liên kết trực tiếp với file Google Sheet đã tạo. Cấu hình UserSettings để xác định vai trò (Role = "CO_DO" hoặc "GVCN") bằng <code>USEREMAIL()</code>, và sử dụng Show_If expressions để ẩn/hiện các nút duyệt điểm của TPT.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Content for Section 5: Lưu Ý Quan Trọng */}
      {activeSection === 5 && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-500" />
                5. Lưu Ý Quan Trọng Về Bảo Mật & Đồng Bộ (Critical Notes)
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Các rủi ro kỹ thuật phổ biến và giải pháp phòng ngừa trong môi trường trường học
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 space-y-2">
                <div className="flex items-center space-x-2 text-rose-700 dark:text-rose-400 font-bold">
                  <Lock className="w-4 h-4" />
                  <span>Xung đột ghi đồng thời (Concurrency & Race Conditions)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Khi hàng chục bạn cờ đỏ cùng chấm điểm vào giờ truy bài (7h15 - 7h30), Google Sheets có thể bị quá tải nếu mở quyền ghi trực tiếp. Giải pháp: Sử dụng <code>LockService.getScriptLock()</code> trong Google Apps Script với thời gian chờ tối thiểu 15 giây để xếp hàng các yêu cầu ghi dữ liệu (appendRow).
                </p>
              </div>

              <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20 space-y-2">
                <div className="flex items-center space-x-2 text-amber-700 dark:text-amber-400 font-bold">
                  <ShieldAlert className="w-4 h-4" />
                  <span>Bảo vệ quyền riêng tư & phân quyền chặt chẽ (RBAC)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Học sinh cờ đỏ tuyệt đối <strong>không được cấp quyền Biên tập (Editor)</strong> vào file Google Sheet gốc để tránh nguy cơ chỉnh sửa điểm hoặc xóa nhầm dữ liệu. Mọi thao tác phải đi qua lớp trung gian API Webhook có kiểm thực mã lớp.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-blue-200 dark:border-blue-900/40 bg-blue-50/40 dark:bg-blue-950/20 space-y-2">
                <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 font-bold">
                  <FileCheck className="w-4 h-4" />
                  <span>Cơ chế đóng băng dữ liệu tuần (Weekly Record Freeze)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Sau 17h00 thứ Sáu hàng tuần, Tổng Phụ Trách thực hiện khóa tuần. Các bản ghi vi phạm của tuần cũ sẽ chuyển trạng thái <code>LOCKED</code>, ngăn chặn hoàn toàn việc sửa đổi hồi tố làm thay đổi kết quả cờ thi đua đã công bố dưới cờ.
                </p>
              </div>

              <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20 space-y-2">
                <div className="flex items-center space-x-2 text-emerald-700 dark:text-emerald-400 font-bold">
                  <Sparkles className="w-4 h-4" />
                  <span>Nhật ký kiểm toán minh bạch (Audit Trail)</span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  Mọi bản ghi vi phạm và xử lý khiếu nại đều lưu kèm dấu thời gian chuẩn ISO và họ tên người thao tác. Trường hợp tranh chấp giữa GVCN và Đội cờ đỏ, Ban Giám Hiệu có thể truy vết lịch sử đối soát chính xác 100%.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
