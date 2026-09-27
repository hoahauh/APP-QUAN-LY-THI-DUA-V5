# Quản lý thi đua LĐ trường TH&THCS Phước Hiệp

Hệ thống quản lý, chấm điểm, nề nếp và xếp hạng thi đua Liên Đội Trường TH&THCS Phước Hiệp (31 Lớp Liên Cấp: Tiểu học & THCS) tích hợp nhận và đẩy dữ liệu Online 2 chiều với Google Sheets.

---

## 🌟 Tính Năng Nổi Bật

1. **Nhận dữ liệu Database Online từ Google Sheets**:
   - **Cách 1 (Nhanh nhất - Không cần cài script)**: Chỉ cần mở Google Sheet &rarr; Bấm **Chia sẻ (Share)** &rarr; Chọn **"Bất kỳ ai có đường liên kết đều có thể xem"** &rarr; Dán link/Sheet ID vào ứng dụng &rarr; Bấm **"Nhận Dữ Liệu Online"**.
   - **Cách 2 (Đồng bộ 2 chiều thời gian thực)**: Sử dụng Google Apps Script Web App được cung cấp sẵn mã nguồn trong tab *Kết Nối Google Sheets*.
   - Hỗ trợ 2 chế độ: **Hợp nhất (Merge)** hoặc **Ghi đè (Replace)**.

2. **Đầy đủ phân hệ Liên Đội Trường TH&THCS Phước Hiệp**:
   - **Khối Tiểu học (19 Lớp: 1A1 &rarr; 5A3)**: Thang chuẩn 60 điểm Nề nếp + 40 điểm Phong trào + Điểm thưởng.
   - **Khối THCS (12 Lớp: 6A1 &rarr; 9A3)**: Thang chuẩn 40 điểm Nề nếp + 30 điểm Học tập + 30 điểm Phong trào + Điểm thưởng.
   - Bảng xếp hạng tự động, cờ luân lưu danh dự, xuất báo cáo CSV, in ấn tức thì.
   - Phân quyền 3 vai trò: Tổng Phụ Trách (TPT), Giáo viên chủ nhiệm (GVCN), Đội Cờ Đỏ.

3. **Cài đặt Google Gemini API Key**:
   - Người dùng có thể nhấn nút **Settings (API Key)** trên Header (kèm dòng chữ đỏ *"Lấy API key để sử dụng app"*) để nhập API key miễn phí từ [Google AI Studio](https://aistudio.google.com/api-keys).
   - Hỗ trợ lựa chọn model: `gemini-3-flash-preview` (mặc định), `gemini-3-pro-preview`, `gemini-2.5-flash`.
   - Key lưu trực tiếp trong trình duyệt máy tính (`localStorage`).

4. **Sẵn sàng triển khai lên Vercel**:
   - Đã cấu hình sẵn file `vercel.json` hỗ trợ SPA routing hoàn hảo.

---

## 🚀 Chạy Ứng Dụng Cục Bộ (Run Locally)

1. **Cài đặt thư viện**:
   ```bash
   npm install
   ```

2. **Chạy máy chủ phát triển (Dev server)**:
   ```bash
   npm run dev
   ```

3. **Build sản phẩm**:
   ```bash
   npm run build
   ```
