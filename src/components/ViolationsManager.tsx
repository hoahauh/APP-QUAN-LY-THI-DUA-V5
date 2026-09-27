import React, { useState } from 'react';
import { 
  AlertCircle, 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  MessageSquare, 
  Download, 
  Trash2, 
  Edit3,
  Check,
  RotateCcw
} from 'lucide-react';
import { ViolationRecord, UserRole, ClassInfo, GradeLevel } from '../types';
import { exportViolationsToCSV, downloadFile } from '../utils/googleSheetsHelper';

interface ViolationsManagerProps {
  violations: ViolationRecord[];
  classes: ClassInfo[];
  weekNumber: number;
  currentRole: UserRole;
  selectedClassIdForGVCN?: string;
  onUpdateViolationStatus: (id: string, status: 'APPROVED' | 'DISPUTED' | 'RESOLVED' | 'CANCELLED', reply?: string) => void;
  onSubmitDispute: (id: string, reason: string) => void;
  onDeleteViolation: (id: string) => void;
}

export const ViolationsManager: React.FC<ViolationsManagerProps> = ({
  violations,
  classes,
  weekNumber,
  currentRole,
  selectedClassIdForGVCN,
  onUpdateViolationStatus,
  onSubmitDispute,
  onDeleteViolation
}) => {
  const [selectedWeek, setSelectedWeek] = useState<number>(weekNumber);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'APPROVED' | 'DISPUTED' | 'CANCELLED'>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal for filing a dispute
  const [disputeModalRecord, setDisputeModalRecord] = useState<ViolationRecord | null>(null);
  const [disputeReasonInput, setDisputeReasonInput] = useState<string>('');

  // Modal for TPT resolving dispute
  const [resolveModalRecord, setResolveModalRecord] = useState<ViolationRecord | null>(null);
  const [resolveReplyInput, setResolveReplyInput] = useState<string>('');

  // Filtered records
  const filteredViolations = violations.filter((v) => {
    if (v.weekNumber !== selectedWeek) return false;
    if (statusFilter !== 'ALL' && v.status !== statusFilter) return false;
    if (classFilter !== 'ALL' && v.classId !== classFilter) return false;

    // If GVCN, optionally highlight or restrict to their class
    if (currentRole === 'GVCN' && selectedClassIdForGVCN && classFilter === 'MY_CLASS') {
      if (v.classId !== selectedClassIdForGVCN) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.classId.toLowerCase().includes(q) ||
        v.ruleName.toLowerCase().includes(q) ||
        (v.studentName && v.studentName.toLowerCase().includes(q)) ||
        (v.note && v.note.toLowerCase().includes(q)) ||
        v.reporterName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const disputedCount = violations.filter((v) => v.weekNumber === selectedWeek && v.status === 'DISPUTED').length;

  const handleExportCSV = () => {
    const csv = exportViolationsToCSV(filteredViolations, selectedWeek);
    downloadFile(csv, `So_Vi_Pham_Tuan_${selectedWeek}.csv`);
  };

  const handleOpenDispute = (record: ViolationRecord) => {
    setDisputeModalRecord(record);
    setDisputeReasonInput(record.disputeReason || '');
  };

  const handleConfirmDispute = () => {
    if (!disputeModalRecord || !disputeReasonInput.trim()) return;
    onSubmitDispute(disputeModalRecord.id, disputeReasonInput.trim());
    setDisputeModalRecord(null);
    setDisputeReasonInput('');
  };

  const handleOpenResolve = (record: ViolationRecord) => {
    setResolveModalRecord(record);
    setResolveReplyInput(record.disputeReply || 'Đã kiểm tra và đồng ý miễn trừ điểm do lý do chính đáng.');
  };

  const handleApproveResolution = (cancelViolation: boolean) => {
    if (!resolveModalRecord) return;
    onUpdateViolationStatus(
      resolveModalRecord.id, 
      cancelViolation ? 'CANCELLED' : 'APPROVED',
      resolveReplyInput
    );
    setResolveModalRecord(null);
  };

  return (
    <div className="space-y-6">
      {/* Header and Disputed Alert Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-rose-500" />
              Sổ Theo Dõi Vi Phạm & Giải Quyết Khiếu Nại
            </h2>
            {disputedCount > 0 && (
              <span className="bg-amber-500 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full animate-bounce">
                {disputedCount} khiếu nại chờ xử lý
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tổng hợp dữ liệu trừ điểm từng lượt theo ngày, buổi, lỗi vi phạm và minh chứng giải trình từ GVCN
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center space-x-1"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất CSV Sổ Vi Phạm</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Week Filter */}
          <div className="flex items-center space-x-1.5 text-xs font-medium">
            <span className="text-slate-500">Tuần:</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-900 dark:text-white"
            >
              {Array.from({ length: 35 }, (_, i) => i + 1).map((w) => (
                <option key={w} value={w}>
                  Tuần {w}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center space-x-1.5 text-xs font-medium">
            <span className="text-slate-500">Trạng thái:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white"
            >
              <option value="ALL">Tất cả ({violations.filter(v => v.weekNumber === selectedWeek).length})</option>
              <option value="APPROVED">Đã duyệt / Trừ điểm</option>
              <option value="DISPUTED">Đang khiếu nại ({disputedCount})</option>
              <option value="CANCELLED">Đã hủy / Miễn trừ</option>
            </select>
          </div>

          {/* Class Filter */}
          <div className="flex items-center space-x-1.5 text-xs font-medium">
            <label htmlFor="violations-class-filter" className="text-slate-500">Lớp:</label>
            <select
              id="violations-class-filter"
              aria-label="Lọc vi phạm theo lớp"
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium text-slate-900 dark:text-white"
            >
              <option value="ALL">Tất cả 31 lớp</option>
              {currentRole === 'GVCN' && selectedClassIdForGVCN && (
                <option value="MY_CLASS">★ Chỉ lớp của tôi ({selectedClassIdForGVCN})</option>
              )}
              <optgroup label="Tiểu học (19 lớp)">
                {classes.filter(c => c.gradeLevel === 'TIEU_HOC').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
              <optgroup label="THCS (12 lớp)">
                {classes.filter(c => c.gradeLevel === 'THCS').map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </optgroup>
            </select>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo tên lỗi, HS, ghi chú..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-xs rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-rose-500 w-56"
          />
        </div>
      </div>

      {/* Violations Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="py-3 px-3">Thời Gian</th>
                <th className="py-3 px-3">Lớp</th>
                <th className="py-3 px-3">Lỗi Vi Phạm</th>
                <th className="py-3 px-3">Danh Mục</th>
                <th className="py-3 px-3 text-center">Điểm Trừ</th>
                <th className="py-3 px-3">Học Sinh / Ghi Chú</th>
                <th className="py-3 px-3">Người Chấm</th>
                <th className="py-3 px-3 text-center">Trạng Thái</th>
                <th className="py-3 px-3 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {filteredViolations.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    Không tìm thấy bản ghi vi phạm nào theo bộ lọc hiện tại.
                  </td>
                </tr>
              ) : (
                filteredViolations.map((v) => {
                  const isMyClass = currentRole === 'GVCN' && v.classId === selectedClassIdForGVCN;
                  const isDisputed = v.status === 'DISPUTED';
                  const isCancelled = v.status === 'CANCELLED';

                  return (
                    <tr
                      key={v.id}
                      className={`hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${
                        isDisputed
                          ? 'bg-amber-50/60 dark:bg-amber-950/20'
                          : isCancelled
                          ? 'opacity-50 line-through'
                          : isMyClass
                          ? 'bg-blue-50/40 dark:bg-blue-950/20'
                          : ''
                      }`}
                    >
                      {/* Time */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold text-slate-900 dark:text-white">
                          {v.dayOfWeek} ({v.date})
                        </div>
                        <span className="text-[10px] text-slate-400">
                          {v.session === 'SANG' ? '☀️ Buổi Sáng' : '🌙 Buổi Chiều'}
                        </span>
                      </td>

                      {/* Class */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="font-bold text-slate-900 dark:text-white bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                          {v.classId}
                        </span>
                      </td>

                      {/* Rule */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          [{v.ruleCode}] {v.ruleName}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                            v.category === 'NE_NEP'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300'
                              : v.category === 'HOC_TAP'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300'
                              : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          }`}
                        >
                          {v.category === 'NE_NEP' ? 'Nề Nếp' : v.category === 'HOC_TAP' ? 'Học Tập' : 'Phong Trào'}
                        </span>
                      </td>

                      {/* Deduction Points */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <span className={`font-black font-mono text-sm ${isCancelled ? 'text-slate-400' : 'text-rose-600 dark:text-rose-400'}`}>
                          -{v.pointsDeducted}đ
                        </span>
                      </td>

                      {/* Student & Note */}
                      <td className="py-3 px-3">
                        {v.studentName && (
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            HS: {v.studentName}
                          </div>
                        )}
                        {v.note && (
                          <div className="text-[11px] text-slate-500 italic">
                            "{v.note}"
                          </div>
                        )}
                        {v.disputeReason && (
                          <div className="mt-1 p-1.5 rounded bg-amber-100 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800 text-[11px]">
                            <strong>Khiếu nại:</strong> {v.disputeReason}
                            {v.disputeReply && (
                              <div className="mt-0.5 text-emerald-700 dark:text-emerald-300 font-medium">
                                ↳ <strong>TPT phản hồi:</strong> {v.disputeReply}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Reporter */}
                      <td className="py-3 px-3 whitespace-nowrap text-slate-600 dark:text-slate-400 text-[11px]">
                        {v.reporterName}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {isDisputed ? (
                          <span className="bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold px-2 py-0.5 rounded text-[10px] border border-amber-300">
                            Đang khiếu nại
                          </span>
                        ) : isCancelled ? (
                          <span className="bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded text-[10px]">
                            Đã hủy phạt
                          </span>
                        ) : (
                          <span className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-semibold px-2 py-0.5 rounded text-[10px]">
                            Đã duyệt
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center space-x-1">
                          {/* If GVCN and it's their class, allow filing dispute */}
                          {currentRole === 'GVCN' && isMyClass && !isCancelled && (
                            <button
                              onClick={() => handleOpenDispute(v)}
                              className="px-2 py-1 bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold rounded text-[10px] flex items-center space-x-1"
                              title="Gửi phản ánh hoặc khiếu nại tới Tổng phụ trách"
                            >
                              <MessageSquare className="w-3 h-3" />
                              <span>{isDisputed ? 'Sửa khiếu nại' : 'Khiếu nại'}</span>
                            </button>
                          )}

                          {/* If TPT (Admin): can resolve dispute or delete */}
                          {currentRole === 'TPT' && (
                            <>
                              {isDisputed && (
                                <button
                                  onClick={() => handleOpenResolve(v)}
                                  className="px-2 py-1 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded text-[10px] flex items-center space-x-1"
                                  title="Xử lý khiếu nại của GVCN"
                                >
                                  <Check className="w-3 h-3" />
                                  <span>Xử lý</span>
                                </button>
                              )}

                              {!isDisputed && isCancelled && (
                                <button
                                  onClick={() => onUpdateViolationStatus(v.id, 'APPROVED')}
                                  className="p-1 text-slate-400 hover:text-emerald-500"
                                  title="Khôi phục lại vi phạm"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => onDeleteViolation(v.id)}
                                className="p-1 text-slate-400 hover:text-rose-500"
                                title="Xóa bản ghi"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: GVCN File Dispute */}
      {disputeModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-amber-500" />
                Gửi Khiếu Nại / Phản Hồi Vi Phạm
              </h3>
              <button
                onClick={() => setDisputeModalRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs space-y-1">
              <div>
                <strong>Lớp:</strong> {disputeModalRecord.classId} • <strong>Thời gian:</strong> {disputeModalRecord.dayOfWeek} ({disputeModalRecord.date})
              </div>
              <div>
                <strong>Lỗi:</strong> [{disputeModalRecord.ruleCode}] {disputeModalRecord.ruleName} (-{disputeModalRecord.pointsDeducted}đ)
              </div>
              {disputeModalRecord.studentName && (
                <div><strong>Học sinh:</strong> {disputeModalRecord.studentName}</div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Lý Do Khiếu Nại (Minh chứng giải trình)
              </label>
              <textarea
                rows={4}
                value={disputeReasonInput}
                onChange={(e) => setDisputeReasonInput(e.target.value)}
                placeholder="Ví dụ: Học sinh nghỉ học có đơn xin phép từ phụ huynh gửi qua sổ liên lạc điện tử; hoặc cờ đỏ ghi nhầm tên học sinh lớp khác..."
                className="w-full text-xs p-3 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div className="flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDisputeModalRecord(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
              >
                Hủy Bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDispute}
                className="px-4 py-2 text-xs font-bold text-slate-900 bg-amber-500 hover:bg-amber-600 rounded-lg shadow"
              >
                Gửi Khiếu Nại Cho TPT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: TPT Resolve Dispute */}
      {resolveModalRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-rose-600" />
                TPT Xử Lý Khiếu Nại Lớp {resolveModalRecord.classId}
              </h3>
              <button
                onClick={() => setResolveModalRecord(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-xs space-y-1">
              <div><strong>Nội dung phạt:</strong> {resolveModalRecord.ruleName} (-{resolveModalRecord.pointsDeducted}đ)</div>
              <div><strong>GVCN giải trình:</strong> <span className="italic">{resolveModalRecord.disputeReason}</span></div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phản hồi của Tổng Phụ Trách
              </label>
              <input
                type="text"
                value={resolveReplyInput}
                onChange={(e) => setResolveReplyInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleApproveResolution(true)}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow text-center"
              >
                ✓ Đồng ý khiếu nại (Hủy trừ điểm)
              </button>
              <button
                type="button"
                onClick={() => handleApproveResolution(false)}
                className="flex-1 py-2 px-3 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow text-center"
              >
                ✕ Bác bỏ khiếu nại (Giữ nguyên trừ điểm)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
