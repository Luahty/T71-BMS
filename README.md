# T71-BMS: Hệ Thống Web Monitor Quản Lý Pin 96V Cho Xe Tailg T71

Ứng dụng Web Mobile-First thay thế app JK-BMS, hỗ trợ kết nối trực tiếp nhiều khối pin qua **Web Bluetooth (BLE)**, ghép nối tiếp và tự động ghi log thống kê lên **Google Sheets**.

---

## 🚀 Tính năng Nổi bật

1. **Ghép nối tiếp nhiều khối pin (Multi-Pack Series Aggregation)**:
   - Mặc định tối ưu cho xe điện **Tailg T71 (96V 45Ah - 32 Cell nối tiếp)** từ 2 pack 48V (16S LiFePO4).
   - Tự động cộng dồn tổng điện áp nối tiếp ($U_{total} = U_1 + U_2 \approx 96V - 105V$).
   - Ma trận 32 cell pin liên tục, tự động tìm và tô màu Cell cao nhất ($V_{max}$), Cell thấp nhất ($V_{min}$) và tính độ lệch áp $\Delta V$ (mV).
2. **Web Bluetooth trực tiếp từ trình duyệt**:
   - Quét và kết nối song song nhiều bộ JK-BMS không dây qua Chrome/Edge trên điện thoại.
   - Không cần thêm mạch phần cứng trung gian.
3. **Đồng bộ Thông minh với Google Sheets**:
   - Tự động ghi nhật ký định kỳ (mỗi 45s) khi xe đang chạy.
   - Tự động ghi mốc sự kiện khi pin đầy, cảnh báo lệch áp hoặc khi bấm "Kết thúc hành trình".
4. **Bảo vệ an toàn & Điều khiển**:
   - Công tắc Bật/Tắt Mosfet Sạc, Mosfet Xả và Cân bằng chủ động.
   - Cơ chế cảnh báo xác nhận trước khi ngắt Mosfet xả để tránh dừng xe đột ngột.
5. **Chế độ Giả lập (Simulation Mode)**:
   - Cho phép test toàn bộ giao diện, hiệu ứng và đồng bộ Sheets ngay trên máy tính mà không cần kết nối xe thật.

---

## 🛠️ Hướng dẫn Triển khai Lên Google Apps Script

Dự án đã được liên kết với Script ID: `1fOmMthfHuHGfxgIGCOi1Vrf-Ki9hfGryv95KLU-in2huOiAa9zSNlXXvfs`

### Cách 1: Đẩy trực tiếp bằng Google Clasp
```bash
# 1. Đăng nhập tài khoản Google (nếu chưa đăng nhập)
clasp login

# 2. Đẩy toàn bộ mã nguồn lên Google Apps Script
clasp push
```

### Cách 2: Copy trực tiếp vào trình duyệt
1. Mở dự án Apps Script [T71-BMS](https://script.google.com/u/0/home/projects/1fOmMthfHuHGfxgIGCOi1Vrf-Ki9hfGryv95KLU-in2huOiAa9zSNlXXvfs/edit).
2. Dán nội dung file `src/Code.js` vào file `Mã.gs`.
3. Tạo thêm một tệp HTML tên `Index.html` và dán toàn bộ nội dung file `src/Index.html` vào.
4. Bấm **Triển khai (Deploy)** > **Tùy chọn triển khai mới (New deployment)** > Chọn loại **Ứng dụng web (Web app)**:
   - Thực thi dưới dạng: **Tôi (Me)**
   - Người có quyền truy cập: **Bất kỳ ai (Anyone)**
5. Mở liên kết Web App được tạo trên điện thoại để sử dụng!
