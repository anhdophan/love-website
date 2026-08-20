# Báo Cáo Chi Tiết Kỹ Thuật & Tối Ưu Hóa Hệ Thống (Technical Details) 🛠️

Tài liệu này tổng hợp toàn bộ các kỹ thuật, kiến trúc phần mềm, cơ sở dữ liệu và thư viện được áp dụng trong ứng dụng **Love Website (Không Gian Tình Yêu)**.

---

## 🏗️ 1. Tổng Quan Kiến Trúc (Architecture Overview)

Hệ thống được thiết kế theo mô hình **Full-Stack MERN Architecture** kết hợp với dịch vụ điện mây Cloudinary:

```
[ Frontend: React 18 + Vite + Redux Toolkit + Tailwind CSS ]
                       │
                       │ REST API (JSON) + Axios
                       ▼
 [ Backend: Express 5 + Node.js (Port 5000) ]
       │                                │
       ▼                                ▼
[ Cloud Storage: Cloudinary ]  [ Database: MongoDB Atlas ]
(Lưu ảnh kỷ niệm CDN)          (Lưu vĩnh viễn 7 Collections)
```

---

## 📑 2. Danh Sách Các Chi Tiết Kỹ Thuật Được Áp Dụng

### 🗄️ 2.1. Cơ Sở Dữ Liệu Điện Mây MongoDB Atlas & Mongoose ORM
* **Nơi áp dụng**:
  * Backend Server: `server/models/Schema.js`, `server/routes/api.js`.
  * Database Cluster: `mongodb+srv://.../love_website`.
* **Chức năng**:
  * Lưu trữ vĩnh viễn và đồng bộ toàn bộ dữ liệu 7 danh mục chính:
    1. `Couple`: Hồ sơ 2 đứa, tên, avatar, status, icon, ngày yêu, passcode PIN, số tim và theme màu sắc riêng (`user1Theme`, `user2Theme`).
    2. `Milestone`: Dòng thời gian mốc kỷ niệm.
    3. `Gallery`: Album ảnh kỷ niệm.
    4. `Song`: Danh sách nhạc yêu thích.
    5. `Reminder`: Lịch hẹn hò và nhắc nhở.
    6. `LoveNote`: Hộp thư tình công khai & thư bí mật khóa PIN.
    7. `Bucket`: Danh sách 100 điều ước mơ cùng thực hiện.
* **Lý do áp dụng**:
  * Thay thế LocalStorage truyền thống (vốn chỉ lưu ở 1 trình duyệt trên 1 máy).
  * Cho phép 2 bạn ở 2 thiết bị/địa điểm khác nhau cùng xem, chỉnh sửa và nhận dữ liệu real-time.
* **Lợi ích khi áp dụng**:
  * **An toàn dữ liệu 100%**: Không bị mất khi xóa cache hay đổi thiết bị.
  * **Đồng bộ hóa 2 chiều**: Mọi thay đổi từ phía "Anh" hay "Em" được cập nhật ngay lập tức vào cơ sở dữ liệu.
  * **Khả năng mở rộng**: Dễ dàng sao lưu, khôi phục hoặc nâng cấp sau này.

---

### ☁️ 2.2. Điện Mây Lưu Trữ Hình Ảnh Cloudinary SDK
* **Nơi áp dụng**:
  * Backend Route: `POST /api/upload` trong `server/routes/api.js`.
  * Frontend Components: `GalleryModule.jsx`, `TimelineModule.jsx`, `HeaderNavbar.jsx`.
* **Chức năng**:
  * Tự động tải ảnh từ thiết bị người dùng (file ảnh đại diện, ảnh kỷ niệm, ảnh dòng thời gian) trực tiếp lên đám mây Cloudinary và sinh ra đường dẫn CDN HTTPS tốc độ cao.
* **Lý do áp dụng**:
  * Tránh việc lưu chuỗi ảnh Base64 quá lớn vào MongoDB gây quá tải dung lượng (MongoDB giới hạn 16MB/document).
* **Lợi ích khi áp dụng**:
  * **Tải ảnh cực nhanh**: Nhờ mạng lưới phân phối nội dung toàn cầu (CDN) của Cloudinary.
  * **Tự động tối ưu dung lượng**: Giảm thiểu độ trễ khi lướt album ảnh trên điện thoại di động.
  * **Tiết kiệm tài nguyên server**.

---

### ⚡ 2.3. Quản Lý Trạng Thái Tập Trung Với Redux Toolkit (`@reduxjs/toolkit` & `react-redux`)
* **Nơi áp dụng**:
  * Thư mục Store: `src/store/index.js`, `src/store/slices/coupleSlice.js`, `src/store/slices/musicSlice.js`, `src/store/slices/appDataSlices.js`.
  * Tất cả các UI components trong `src/components/`.
* **Chức năng**:
  * Quản lý toàn bộ State của ứng dụng tại một nơi tập trung duy nhất (Single Source of Truth).
  * Xử lý bất đồng bộ (AsyncThunks) để gọi API MongoDB Atlas mượt mà.
* **Lý do áp dụng**:
  * Khi ứng dụng phình to với nhiều module (nhạc, ảnh, lịch, thư tình...), việc truyền Props (Prop Drilling) hoặc dùng React Context cũ khiến ứng dụng bị re-render thừa và giật lag khi tương tác nhanh (như bấm bắn tim liên tục).
* **Lợi ích khi áp dụng**:
  * **Tối ưu hiệu năng tối đa**: Các component chỉ re-render đúng phần dữ liệu mà nó đăng ký theo dõi (`useSelector`).
  * **Code sạch sẽ & Dễ bảo trì**: Phân chia rõ ràng giữa giao diện UI và logic xử lý dữ liệu.
  * **Dễ dàng Debug**: Hỗ trợ Redux DevTools để theo dõi lịch sử thay đổi State.

---

### 🎵 2.4. Trình Phát Âm Thanh Toàn Cục Không Bị Ngắt Nhịp (`GlobalAudioEngine`)
* **Nơi áp dụng**:
  * Element cao nhất ứng dụng: `src/components/GlobalAudioEngine.jsx` nằm tại `App.jsx`.
* **Chức năng**:
  * Gắn kết vĩnh viễn thẻ phát HTML5 Audio và Iframe YouTube API trong DOM.
* **Lý do áp dụng**:
  * Khắc phục lỗi phổ biến của Web SPA: Khi trình phát nhạc nằm trong tab `Góc Nhạc`, chuyển sang tab `Trang Chủ` hay `Ảnh Kỷ Niệm` sẽ khiến tab nhạc bị unmount, làm nhạc bị tắt hoặc bị quay lại từ giây 0.
* **Lợi ích khi áp dụng**:
  * **Trải nghiệm âm nhạc liên tục 100%**: Bạn có thể vừa mở bài hát yêu thích vừa tự do lướt xem ảnh, viết thư tình hay lên lịch hẹn hò mà không bị gián đoạn.

---

### 🎨 2.5. Hệ Thống Design Antigravity & Custom CSS Glassmorphism
* **Nơi áp dụng**:
  * `src/index.css`, `HeaderNavbar.jsx`, `ThemeSelector.jsx`.
* **Chức năng**:
  * Cung cấp 5 phối màu Theme riêng biệt (Vàng Ánh Kim, Hồng Anh Đào, Tím Hoàng Hôn, Xanh Đại Dương, Đêm Huyền Báo) kèm hiệu ứng kính mờ (Glassmorphism), hiệu ứng bắn tim nổ particle và chuyển động mượt.
  * Tự động điều chỉnh màu chữ (`text-theme-text`, `text-theme-muted`) để không bao giờ bị chìm trên bất kỳ theme sáng hay tối nào.
* **Lý do áp dụng**:
  * Đảm bảo tính thẩm mỹ cao cấp, mang đến cảm giác hiện đại, lãng mạn và bay bổng (Antigravity).
* **Lợi ích khi áp dụng**:
  * Giao diện độc đáo, ấn tượng.
  * Tương thích hoàn hảo trên cả máy tính desktop, máy tính bảng và điện thoại di động.

---

## 📊 3. Bảng Tóm Tắt Giá Trị Kỹ Thuật

| Công Nghệ / Kỹ Thuật | Nơi Áp Dụng | Chức Năng Chính | Lí Do Áp Dụng | Lợi Ích Mang Lại |
| :--- | :--- | :--- | :--- | :--- |
| **MongoDB Atlas** | Backend Server API | Lưu vĩnh viễn 7 danh mục dữ liệu | Thay thế LocalStorage client tạm thời | Lưu trữ an toàn, truy cập 2 chiều từ mọi thiết bị |
| **Cloudinary SDK** | Upload API (`POST /api/upload`) | Tải ảnh trực tiếp lên đám mây CDN | Tránh nén chuỗi Base64 làm quá tải DB | Tải ảnh siêu nhanh, tiết kiệm bộ nhớ |
| **Redux Toolkit** | `src/store/` & UI Components | Quản lý state tập trung toàn ứng dụng | Khắc phục giật lag & re-render thừa của Context | Tối ưu hiệu năng, code chuẩn hóa, dễ bảo trì |
| **GlobalAudioEngine** | `App.jsx` (Root level) | Phát nhạc/video YouTube liên tục | Sửa lỗi ngắt nhạc khi chuyển giữa các tab | Âm thanh chạy xuyên suốt 100% mượt mà |
| **Theme System** | `src/index.css` & ThemeSelector | Đổi 5 Theme màu sắc & tương phản chữ | Đảm bảo tính thẩm mỹ & đọc rõ chữ sáng/tối | Giao diện lãng mạn, cá nhân hóa cho 2 người |

---
*Tài liệu được khởi tạo và cập nhật tự động vào hệ thống dự án Love Website.* 💖
