# 💛 Our Love Sanctuary – Website Tình Yêu Dành Cho 2 Người

Một ứng dụng web tình yêu riêng tư, lãng mạn và hiện đại được thiết kế dành riêng cho **Anh & Em**. Website hoạt động mượt mà trên mọi thiết bị (Máy tính, Điện thoại, Máy tính bảng) với phong cách thiết kế **Antigravity Glassmorphism** mờ ảo, hiệu ứng ánh sáng dịu dàng, âm thanh phát xuyên suốt 100% và hệ thống **Bảo Mật Tập Trung (Security Engine)** chống hack/spam.

---

## 🚀 1. HƯỚNG DẪN CÁCH CHẠY WEBSITE DƯỚI LOCAL (MÁY TÍNH)

### Yêu Cầu Tiền Đề
- Đã cài đặt **Node.js** (Phiên bản 18 trở lên). Tải tại: [nodejs.org](https://nodejs.org/).

### Các Bước Khởi Chạy Web

1. **Mở Terminal / Command Prompt (CMD) / PowerShell** tại thư mục dự án:
   ```bash
   cd g:\love-website
   ```

2. **Cài đặt các gói phụ thuộc (Chỉ cần chạy lần đầu)**:
   ```bash
   npm install
   ```

3. **Khởi chạy đồng thời cả Frontend React & Backend Server Node.js**:
   - **Bước 3.1**: Mở Terminal 1 khởi chạy Express Backend (Port 5000 + MongoDB Atlas + Security Engine):
     ```bash
     node server/server.js
     ```
   - **Bước 3.2**: Mở Terminal 2 khởi chạy Vite Frontend (Port 3000):
     ```bash
     npm run dev
     ```

4. **Truy cập Website**:
   - Mở trình duyệt web (Chrome, Safari, Edge...) và truy cập:  
     👉 **`http://localhost:3000`**

---

## 🌐 2. HƯỚNG DẪN HOSTING & ĐÁNH GIÁ CÁC NỀN TẢNG (NETLIFY / RENDER / VERCEL / RAILWAY)

### ❓ Bạn đang host thử trên Netlify: Có nên chuyển sang nơi khác không?

**Đánh Giá**:
- **Netlify**: Rất xuất sắc cho phần **Frontend** (`dist/`), tự động cấp SSL HTTPS miễn phí và nén trang siêu nhanh. Tuy nhiên, Netlify **không chạy trực tiếp Node.js Express server (`server/server.js`) theo kiểu truyền thống** trừ khi chuyển thành Netlify Serverless Functions.
- **Render.com (KHUYÊN DÙNG 🌟)**: Nền tảng tuyệt vời nhất cho dự án Full-Stack MERN này! Render cho phép bạn host **trọn gói 1-Click cả Frontend React lẫn Express Backend Node.js** miễn phí 100%, tự động kết nối MongoDB Atlas & Cloudinary và cấp SSL HTTPS cực kỳ mượt mà.
- **Kiến trúc Khuyên Dùng**:
  - *Phương án 1 (Tiện lợi nhất)*: Host trọn gói Full-Stack trên **Render.com** hoặc **Railway.app**.
  - *Phương án 2 (Tách biệt)*: Host Frontend trên **Netlify** / **Vercel** và host Express Backend trên **Render** / **Railway**.

---

### 🌟 CÁCH 1: Deploy Trọn Gói Trên Render.com (Miễn Phí 100% - KHUYÊN DÙNG)

1. Truy cập **[render.com](https://render.com/)** và đăng ký tài khoản.
2. Đưa mã nguồn dự án `love-website` lên **GitHub Repository** của bạn.
3. Trên Render Dashboard -> Bấm **New +** -> Chọn **Web Service**.
4. Kết nối kho GitHub `love-website`.
5. Cấu hình thông số:
   - **Name**: `love-sanctuary`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node server/server.js`
6. Thêm các **Environment Variables** (Biến môi trường) trên Render:
   - `MONGODB_URI` = `mongodb+srv://07phananhdo:01092004do@cluster0.sza6ivg.mongodb.net/love_website`
   - `CLOUDINARY_CLOUD_NAME` = `df8kdfa66`
   - `CLOUDINARY_API_KEY` = `813361343442552`
   - `CLOUDINARY_API_SECRET` = `-sVl8_gkH3Me-bAG3kW2EEHCvjg`
7. Bấm **Create Web Service**. Render sẽ tự động đóng gói và cấp cho bạn đường link HTTPS chạy vĩnh viễn (Ví dụ: `https://love-sanctuary.onrender.com`).

---

### ⚡ CÁCH 2: Deploy Trên Netlify + Render Backend

1. **Deploy Backend Node.js lên Render**:
   - Làm theo các bước ở Cách 1 nhưng đặt Start Command là `node server/server.js`. Render sẽ cấp link API (Ví dụ: `https://love-api.onrender.com`).
2. **Deploy Frontend React lên Netlify**:
   - Truy cập **[netlify.com](https://www.netlify.com/)**.
   - Đóng gói ứng dụng ở máy tính: `npm run build`.
   - Vào mục **Sites** trên Netlify -> Kéo thả thư mục **`dist`** vừa được tạo vào ô upload.
   - Netlify sẽ cấp đường link dạng `https://our-love-sanctuary.netlify.app`.

---

## 🛡️ 3. TÍNH NĂNG BẢO MẬT TẬP TRUNG (SECURITY ENGINE)

Website được tích hợp hệ thống bảo mật tập trung **Centralized Security Layer** tại `server/middleware/security.js` và `src/components/SecurityModule.jsx`:

1. **Chống DDoS & Spam API (Rate Limiting)**:
   - Giới hạn 200 lượt tải / 15 phút cho toàn bộ IP truy cập.
   - Giới hạn tối đa 30 thao tác chỉnh sửa/xóa dữ liệu mỗi phút để ngăn chặn phá hoại hoặc spam dữ liệu.
2. **Lọc Mã Độc XSS & Injections (`sanitizeInput`)**:
   - Tự động quét và loại bỏ các đoạn mã độc `<script>`, `javascript:`, `onerror=` trong tiêu đề, thư tình hay tin nhắn trước khi lưu vào cơ sở dữ liệu.
3. **Mã Hóa HTTP Headers (`Helmet Protection`)**:
   - Thiết lập các tiêu đề bảo mật chuẩn OWASP (X-Frame-Options, X-Content-Type-Options...).
4. **Mật Mã PIN Bảo Mật Thư Bí Mật**:
   - Đặt mã PIN 4 chữ số (Mặc định `1234`) cho các bức thư tình riêng tư.
5. **Trung Tâm Quản Lý Bảo Mật UI (`SecurityModule.jsx`)**:
   - Bấm vào biểu tượng **Khiên Bảo Mật 🛡️** góc trên menu Header để xem trạng thái an ninh real-time và đổi mã PIN bí mật dễ dàng.

---

## 📖 4. HƯỚNG DẪN SỬ DỤNG CÁC TÍNH NĂNG TRÊN WEBSITE

### 👤 1. Chọn Tài Khoản Thiết Bị (Anh hoặc Em)
- Bấm vào nút ảnh đại diện góc trên thanh Menu Header để chọn **Anh** hoặc **Em**.
- Trình duyệt sẽ ghi nhớ vai trò thiết bị để cài đặt theme màu riêng và status đúng cho từng người.

### 🎨 2. Đổi Theme Màu Sắc Cá Nhân
- Bấm vào biểu tượng **Cây Cọ Màu 🎨** ở góc menu.
- Chọn 1 trong 5 bộ phối màu:
  - 💛 **Golden Sunset**: Vàng ấm & Hồng Hoàng Hôn.
  - 🌸 **Cherry Blossom**: Hồng Anh Đào & Vàng Champagne.
  - 🌙 **Midnight Starlight**: Xanh đêm Velvet & Vàng Hào Quang.
  - 🍃 **Sage & Honey**: Xanh Thảo Mộc & Vàng Mật Ôm.
  - 💜 **Amethyst Romance**: Tím Thạch Anh & Vàng Huyền Bật.

### 🎵 3. Góc Âm Nhạc Phát Xuyên Suốt (`GlobalAudioEngine`)
- Thêm bài hát yêu thích từ link YouTube, Spotify hoặc MP3 trực tiếp.
- Âm thanh và video YouTube sẽ **phát liên tục 100% không bị ngắt nhịp** khi bạn lướt xem các tab khác.

### 🗓️ 4. Lịch Hẹn Hò & Nhắc Nhở Tự Động
- Đặt lịch các buổi hẹn hò ngọt ngào.
- Hệ thống tự động đếm ngược số ngày và hiển thị **thông báo nhắc nhở rực rỡ** khi sắp đến ngày hẹn!

### 💌 5. Hộp Thư Tình Yêu & Thư Bí Mật
- Viết những lời thì thầm lãng mạn.
- Chọn tùy chọn **"🔒 Khóa thư này bằng mã PIN"** để giữ bí mật bức thư chỉ 2 đứa biết mã PIN mới đọc được.

### 🎯 6. 100 Điều Ước Mơ (Bucket List)
- Đánh dấu những việc đã cùng hoàn thành để theo dõi **thanh tiến độ % tình yêu** tăng dần theo thời gian.

---
*Love Website – Built with 💛 & Antigravity Security Engine for Anh & Em.*
