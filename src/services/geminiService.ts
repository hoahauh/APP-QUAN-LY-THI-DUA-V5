import { WeeklyClassScore, ViolationRecord, BonusRecord, SchoolConfig, GeminiModelId } from '../types';

// Danh sách Model theo thứ tự Fallback như quy định trong AI_INSTRUCTIONS.md
const FALLBACK_MODELS: GeminiModelId[] = [
  'gemini-3-flash-preview',
  'gemini-3-pro-preview',
  'gemini-2.5-flash'
];

export interface SpeechGenerationOptions {
  duration: 'SHORT' | 'STANDARD' | 'DETAILED'; // 1-2p, 3-5p, 5-7p
  tone: 'INSPIRING' | 'DISCIPLINED' | 'BALANCED'; // Truyền cảm hứng, Kỷ luật nghiêm, Chuẩn mực
  themeTopic?: string; // Chủ điểm tuần tới
  customNote?: string; // Ghi chú riêng của TPT
}

export interface GeneratedSpeechResult {
  speechText: string;
  modelUsed: GeminiModelId;
  totalTokensApprox?: number;
  keyHighlights: {
    rotatingFlagClasses: string[];
    topIssues: string[];
    actionItems: string[];
  };
}

/**
 * Gọi Google Gemini API với cơ chế tự động Retry và Fallback model
 */
export async function callGeminiWithFallback(
  apiKey: string,
  preferredModel: GeminiModelId,
  systemInstruction: string,
  prompt: string,
  onModelAttempt?: (model: GeminiModelId, attemptIndex: number) => void
): Promise<{ text: string; modelUsed: GeminiModelId }> {
  if (!apiKey || !apiKey.trim()) {
    throw new Error('Chưa cấu hình API Key. Vui lòng nhấn vào "Settings (API Key)" trên Header để nhập key từ Google AI Studio.');
  }

  // Sắp xếp danh sách model với model được chọn ưu tiên trước
  const modelsToTry: GeminiModelId[] = [
    preferredModel,
    ...FALLBACK_MODELS.filter(m => m !== preferredModel)
  ];

  let lastError: any = null;

  for (let i = 0; i < modelsToTry.length; i++) {
    const currentModel = modelsToTry[i];
    if (onModelAttempt) {
      onModelAttempt(currentModel, i + 1);
    }

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${currentModel}:generateContent?key=${apiKey.trim()}`;
      
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\n---\nYÊU CẦU DỮ LIỆU CỤ THỂ:\n${prompt}`
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          maxOutputTokens: 2500,
        }
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errMessage = errorData?.error?.message || `HTTP ${res.status} ${res.statusText}`;
        console.warn(`Model ${currentModel} gặp lỗi:`, errMessage);
        lastError = new Error(`[${currentModel}] ${errMessage}`);
        // Chuyển sang model tiếp theo trong danh sách fallback
        continue;
      }

      const data = await res.json();
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        throw new Error(`Model ${currentModel} không trả về nội dung hợp lệ.`);
      }

      return {
        text: generatedText,
        modelUsed: currentModel
      };

    } catch (err: any) {
      console.warn(`Lỗi khi gọi model ${currentModel}:`, err);
      lastError = err;
      // Thử model tiếp theo
    }
  }

  // Nếu tất cả model đều thất bại
  throw new Error(`Tất cả các model Gemini đều thất bại. Chi tiết lỗi cuối cùng: ${lastError?.message || 'Không xác định'}. Vui lòng kiểm tra lại hạn mức API Key của bạn.`);
}

/**
 * Tạo bài phát biểu nhận xét thi đua chào cờ thứ Hai tự động
 */
export async function generateFlagSaluteSpeech(
  apiKey: string,
  preferredModel: GeminiModelId,
  schoolConfig: SchoolConfig,
  scores: WeeklyClassScore[],
  violations: ViolationRecord[],
  bonuses: BonusRecord[],
  options: SpeechGenerationOptions,
  onModelAttempt?: (model: GeminiModelId, attemptIndex: number) => void
): Promise<GeneratedSpeechResult> {
  const weekNum = schoolConfig.currentWeek;
  
  // 1. Lọc dữ liệu tuần hiện tại
  const weekViolations = violations.filter(v => v.weekNumber === weekNum && v.status !== 'CANCELLED');
  const weekBonuses = bonuses.filter(b => b.weekNumber === weekNum);

  // 2. Lớp nhận Cờ Luân Lưu
  const tieuHocRank1 = scores.find(s => s.gradeLevel === 'TIEU_HOC' && s.rankInGradeLevel === 1);
  const thcsRank1 = scores.find(s => s.gradeLevel === 'THCS' && s.rankInGradeLevel === 1);

  // 3. Top 3 mỗi cấp
  const top3TieuHoc = scores
    .filter(s => s.gradeLevel === 'TIEU_HOC')
    .sort((a, b) => a.rankInGradeLevel - b.rankInGradeLevel)
    .slice(0, 3)
    .map(s => `${s.className} (${s.totalScore}đ, GVCN: ${s.teacherName})`);

  const top3Thcs = scores
    .filter(s => s.gradeLevel === 'THCS')
    .sort((a, b) => a.rankInGradeLevel - b.rankInGradeLevel)
    .slice(0, 3)
    .map(s => `${s.className} (${s.totalScore}đ, GVCN: ${s.teacherName})`);

  // 4. Thống kê lỗi vi phạm phổ biến
  const ruleCounts: Record<string, { count: number; name: string; category: string }> = {};
  weekViolations.forEach(v => {
    if (!ruleCounts[v.ruleCode]) {
      ruleCounts[v.ruleCode] = { count: 0, name: v.ruleName, category: v.category };
    }
    ruleCounts[v.ruleCode].count++;
  });

  const sortedIssues = Object.entries(ruleCounts)
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 5)
    .map(([code, item]) => `- ${item.name} (${item.count} lượt vi phạm)`);

  // 5. Thống kê khen thưởng tiêu biểu
  const bonusHighlights = weekBonuses.slice(0, 4).map(b => `- Lớp ${b.classId}: ${b.title} (+${b.pointsAdded}đ - ${b.reason || ''})`);

  // System instruction chuyên sâu theo nghiệp vụ Tổng Phụ Trách Đội
  const systemInstruction = `Bạn là Tổng Phụ Trách Đội chuyên nghiệp, giàu kinh nghiệm của Liên Đội Trường TH&THCS Phước Hiệp (trường liên cấp 31 lớp gồm Tiểu học và THCS).
Nhiệm vụ của bạn là soạn một BÀI PHÁT BIỂU NHẬN XÉT THI ĐUA HỌC ĐƯỜNG trước toàn thể Ban Giám Hiệu, thầy cô giáo và học sinh toàn trường trong Lễ Chào Cờ Đầu Tuần (Sáng Thứ Hai).

QUY TẮC NỘI DUNG VĂN BẢN:
1. Giọng văn: Chuẩn mực sư phạm Đoàn - Đội, trang trọng nhưng gần gũi, biểu cảm, truyền cảm hứng và tinh thần đoàn kết.
2. Cấu trúc bài nói gồm 5 phần rõ ràng:
   - PHẦN 1: LỜI CHÀO & MỞ ĐẦU (Kính gửi BGH, quý thầy cô và các em đội viên, nhi đồng Liên Đội Trường TH&THCS Phước Hiệp).
   - PHẦN 2: TUYÊN DƯƠNG XUẤT SẮC & TRAO CỜ LUÂN LƯU (Trang trọng xướng tên lớp dẫn đầu Khối Tiểu học và Khối THCS lên nhận Cờ Luân Lưu danh dự của tuần; biểu dương các việc tốt, tuần học tốt).
   - PHẦN 3: NHẬN XÉT CÔNG TÂM CÁC TỒN TẠI NỀ NẾP (Nêu rõ các hiện tượng cần rút kinh nghiệm như đi muộn, đồng phục, vệ sinh, truy bài... một cách xây dựng, uốn nắn tích cực).
   - PHẦN 4: PHÁT ĐỘNG THI ĐUA TUẦN TIẾP THEO (Giao nhiệm vụ cụ thể theo chủ điểm tuần tới).
   - PHẦN 5: LỜI CHÚC & KHẨU HIỆU HÀNH ĐỘNG (Lời chúc tuần mới tràn đầy năng lượng và quyết tâm).
3. Đảm bảo ngôn từ chính xác về cấp học (học sinh Tiểu học gọi là 'các em nhi đồng / đội viên', THCS gọi là 'các em đội viên lớn').`;

  const durationGuide = {
    SHORT: 'Khoảng 300 - 450 từ (trình bày nhanh gọn trong 2-3 phút, thích hợp khi chào cờ ngắn gọn).',
    STANDARD: 'Khoảng 550 - 750 từ (trình bày đầy đủ trong 4-5 phút, tiêu chuẩn của buổi chào cờ thứ Hai).',
    DETAILED: 'Khoảng 850 - 1100 từ (trình bày chi tiết, sâu sắc trong 6-7 phút, phù hợp tuần sơ kết điểm nhấn).'
  }[options.duration];

  const toneGuide = {
    INSPIRING: 'Tông giọng ấm áp, khích lệ tối đa, biểu dương mặt tốt để lan tỏa, nhắc nhở nhẹ nhàng.',
    DISCIPLINED: 'Tông giọng nghiêm nghị, kiên quyết chấn chỉnh nề nếp kỷ cương học đường, phê bình cụ thể các khuyết điểm.',
    BALANCED: 'Tông giọng cân bằng hài hòa giữa biểu dương và chấn chỉnh nề nếp theo chuẩn Đoàn - Đội.'
  }[options.tone];

  const prompt = `THÔNG TIN THI ĐUA TUẦN ${weekNum} - NĂM HỌC ${schoolConfig.academicYear}:
- Trường: ${schoolConfig.schoolName}
- Tổng Phụ Trách: ${schoolConfig.tptName}
- Tổng số lớp: 31 lớp (19 Tiểu học, 12 THCS)
- Lớp Nhận Cờ Luân Lưu Tiểu Học: ${tieuHocRank1 ? `${tieuHocRank1.className} (Đạt ${tieuHocRank1.totalScore}đ, GVCN: ${tieuHocRank1.teacherName})` : 'Đang cập nhật'}
- Lớp Nhận Cờ Luân Lưu THCS: ${thcsRank1 ? `${thcsRank1.className} (Đạt ${thcsRank1.totalScore}đ, GVCN: ${thcsRank1.teacherName})` : 'Đang cập nhật'}
- Top đầu Tiểu học: ${top3TieuHoc.join(', ') || 'Chưa có'}
- Top đầu THCS: ${top3Thcs.join(', ') || 'Chưa có'}

TỒN TẠI VI PHẠM TRONG TUẦN (${weekViolations.length} lượt ghi nhận):
${sortedIssues.join('\n') || '- Toàn trường giữ nề nếp rất tốt, không có vi phạm lớn.'}

KHEN THƯỞNG TIÊU BIỂU TRONG TUẦN:
${bonusHighlights.join('\n') || '- Khen ngợi tinh thần cố gắng chung của toàn Liên Đội.'}

YÊU CẦU CỦA TỔNG PHỤ TRÁCH:
- Độ dài mong muốn: ${durationGuide}
- Phong cách / Tông giọng: ${toneGuide}
- Chủ điểm thi đua tuần tới: ${options.themeTopic || 'Tiếp tục đẩy mạnh nề nếp học đường, thi đua Hoa Điểm 10 và giữ gìn trường lớp xanh - sạch - đẹp.'}
${options.customNote ? `- Lưu ý bổ sung từ TPT: ${options.customNote}` : ''}

Hãy xuất bản bài phát biểu hoàn chỉnh, sẵn sàng để Tổng Phụ Trách cầm đọc trước toàn trường!`;

  const { text, modelUsed } = await callGeminiWithFallback(apiKey, preferredModel, systemInstruction, prompt, onModelAttempt);

  const rotatingFlagClasses: string[] = [];
  if (tieuHocRank1) rotatingFlagClasses.push(`${tieuHocRank1.className} (Tiểu học)`);
  if (thcsRank1) rotatingFlagClasses.push(`${thcsRank1.className} (THCS)`);

  return {
    speechText: text,
    modelUsed,
    keyHighlights: {
      rotatingFlagClasses,
      topIssues: sortedIssues.map(s => s.replace(/^- /, '')),
      actionItems: [
        options.themeTopic || 'Đẩy mạnh nề nếp và thi đua hoa điểm mười',
        'Kiểm tra nghiêm ngặt trang phục, khăn quàng và giờ vào lớp',
        'Đội cờ đỏ duy trì chấm điểm công tâm, kịp thời'
      ]
    }
  };
}

/**
 * AI Phân tích chuyên sâu dữ liệu thi đua & Phát hiện hiện tượng bất thường
 */
export async function analyzeWeeklyTrendsWithAI(
  apiKey: string,
  preferredModel: GeminiModelId,
  scores: WeeklyClassScore[],
  violations: ViolationRecord[],
  weekNumber: number
): Promise<{ analysisText: string; modelUsed: GeminiModelId }> {
  const systemInstruction = `Bạn là Chuyên gia Phân tích Dữ liệu Giáo dục & Thi Đua Học Đường (School Emulation Data Analyst).
Hãy phân tích dữ liệu điểm số và vi phạm thi đua tuần của 31 lớp học liên cấp, tìm ra các phát hiện cốt lõi (Insights), các đột biến bất thường (Anomalies) và đề xuất giải pháp cụ thể cho Ban Giám Hiệu và Tổng Phụ Trách.`;

  const summaryData = scores.map(s => ({
    class: s.className,
    level: s.gradeLevel,
    rank: s.rankInGradeLevel,
    score: s.totalScore,
    deductions: { neNep: s.deductedNeNep, hocTap: s.deductedHocTap, phongTrao: s.deductedPhongTrao },
    bonuses: s.totalBonus
  }));

  const prompt = `Phân tích dữ liệu thi đua Tuần ${weekNumber}:
Số lượng lớp: ${scores.length}
Dữ liệu lớp tóm tắt: ${JSON.stringify(summaryData.slice(0, 15))} ...

Hãy cung cấp:
1. Đánh giá bức tranh toàn cảnh nề nếp tuần này (Tiểu học vs THCS).
2. Các lớp có biểu hiện bất thường hoặc cần Ban Giám Hiệu / GVCN quan tâm đặc biệt.
3. 3 Khuyến nghị hành động cụ thể cho tuần tới để cải thiện nề nếp.`;

  return await callGeminiWithFallback(apiKey, preferredModel, systemInstruction, prompt);
}
