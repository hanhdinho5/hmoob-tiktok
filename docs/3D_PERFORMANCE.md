# Số đo demo 3D

**Lưu ý:** đây là số đo model GLB cũ. Nhân vật mặc định đã chuyển sang ảnh 2.5D theo lựa chọn người dùng; xem [số đo 2.5D](2_5D_PERFORMANCE.md). File JSON benchmark chung có thể được cập nhật bởi lần chạy mới; số đo 2.5D được lưu riêng tại `artifacts/hmong-2_5d-performance.json`.

Bản hiện tại dùng 8 mẫu club v3. Đã kiểm tra WebGL ở 6/30/60 người, thêm khung dọc 60 người; phép chiếu giới hạn đội hình đều nằm trong khung camera. Đây là kiểm tra bố cục, không đảm bảo nhãn hoặc hiệu ứng không bị HUD che. FPS trung bình phần mềm lần lượt 7,4 / 4,3 / 2,3; cần đo GPU thật trước khi live đông người. Xem [thay đổi nhân vật](CHARACTER_REFINEMENT.md).

## Điều kiện

- Chrome headless trên Windows; render **phần mềm SwiftShader**, không dùng kết quả này để suy ra FPS GPU thật.
- Renderer báo: `ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver)`.
- User agent: `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/157.0.0.0 Safari/537.36`.
- Kích thước 960 × 540, DPR 1, WebGL2, Three.js r187, mục tiêu giới hạn 30 FPS.
- Sau khi đủ nhân vật, làm nóng ít nhất 2,2 giây; lấy 6 mẫu cách nhau khoảng 1 giây. Không phải kiểm thử tải dài hạn.
- 6, 30 và 60 người dùng cùng bộ model club/animation. Các con số là workload demo, chưa phải phiên TikTok LIVE/OBS. Sàn phản chiếu 384×256 bật khi có không quá 12 người, tắt ở crowd lớn hơn; vì vậy hai bài đo có workload hiệu ứng khác nhau.

## Kết quả đo

| Nhân vật | FPS TB | FPS min–max | Draw calls | Triangles | Geometry | Texture | JS heap MB |
|---|---|---|---|---|---|---|---|
| 6 | 7.4 | 7.2–7.7 | 134 | 155,234 | 64 | 19 | 59.2–68.8 |
| 30 | 4.3 | 4.1–4.4 | 188 | 361,544 | 78 | 67 | 73.6–81.1 |
| 60 | 2.3 | 2.2–2.7 | 326 | 719,682 | 78 | 127 | 80.6–83 |

**Môi trường phần mềm này chưa đạt mục tiêu 30 FPS**, kể cả 6 nhân vật. Không khẳng định demo chạy mượt trong OBS, không xác nhận 60/100 nhân vật. Cần đo lại với GPU thật và OBS đang mã hóa livestream.

Geometry/texture là bộ đếm tài nguyên Three.js; JS heap do Chrome cung cấp. Chúng không phải số byte bộ nhớ GPU. CPU thời gian gọi render cũng không phải GPU frame time. Xem toàn bộ mẫu và thông tin môi trường tại [JSON gốc](../artifacts/hmong-3d-performance.json).

## Tối ưu đã áp dụng

- Mỗi model club có bốn primitive skinned: thân và phần vải; dùng chung texture thêu local giữa các instance.
- Index và gộp vertex trùng; kích thước 8 GLB club hiện tại ở bảng dưới. Các số đo của bản núi/ruộng trước đây không áp dụng cho phòng club này.
- Clone skeleton độc lập; geometry/material/clip dùng chung từ 8 model cache. Không tải model cho mỗi người xem.
- InstancedMesh cho bóng đơn giản; không bật shadow map. Phông xa được tạo thành texture; sàn, bậc, cột và tia đèn có geometry 3D.
- Giới hạn DPR 1,5, vòng render mục tiêu 30 FPS; mặc định tối đa 30 người, cấu hình có hard limit 100 nhưng **không coi là cam kết hiệu năng**.
- Hàng đợi sự kiện tối đa 256, xử lý tối đa 8/frame; spawn 2 người/frame; queue spawn có giới hạn; loại user không hoạt động sau 5 phút.
- Giới hạn particle, tắt phần particle khi crowd từ 40 người; phản chiếu tự tắt trên 12 người. Giải phóng mixer, bone texture và nhãn khi xóa user; geometry/material chung chỉ giải phóng khi dispose thư viện model.

| GLB | Bytes |
|---|---|
| male-daily | 572,356 |
| female-daily | 830,672 |
| male-festival | 611,588 |
| female-festival | 895,744 |
| male-white | 579,732 |
| female-bun | 826,292 |
| male-vest | 579,168 |
| female-longhair | 829,596 |

## Kiểm tra đã qua

- Khởi động Express; game 2D dự phòng; local Three.js modules, texture và cả 8 GLB không bị 404.
- GLB magic/version, skeleton 11 bone, 9 clip; clone độc lập và thực sự thay quaternion của bone.
- Crossfade/phản ứng có thời lượng; trả về idle; rule quà lớn được ưu tiên.
- Chrome: Unicode, 6 người cố định, link Virtual Crowd cũ chuyển sang club, ảnh ngang/dọc, chat/gift, 80 event cùng người chỉ tạo một nhân vật, burst 1.200 event vẫn giữ queue ≤256.
- Điều khiển preview qua BroadcastChannel; chuyển chế độ crowd; không có JavaScript exception hoặc HTTP lỗi tài nguyên trong luồng đã kiểm tra.

## Chạy lại

```powershell
node scripts/check-three.mjs
node scripts/browser-smoke.mjs --three-only
node scripts/report-three.mjs
```

Chạy trên trình duyệt GPU thật bằng link benchmark có `metrics=1` để xem workload khác; trước khi coi là phù hợp livestream cần đo thêm 30/60/100 người, thời gian dài, nhiều quà liên tục, số nguồn OBS, độ phân giải thực và mã hóa video.
