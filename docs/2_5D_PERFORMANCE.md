# Kiểm tra nhân vật 2.5D

Chrome headless, 960 × 540, DPR 1, làm nóng ít nhất 2,2 giây rồi lấy sáu mẫu cách nhau khoảng một giây. Renderer: ANGLE (Google, Vulkan 1.3.0 (SwiftShader Device (Subzero) (0x0000C0DE)), SwiftShader driver). Đây là GPU phần mềm SwiftShader; không dùng để cam kết FPS trên GPU thật hoặc trong OBS/LIVE Studio.

| Người | FPS trung bình | Draw calls | Tam giác | Camera bao đội hình |
|---|---|---|---|---|
| 6 | 15.8 | 98 | 11622 | Có |
| 30 | 23.3 | 74 | 6290 | Có |
| 60 | 24.1 | 92 | 6686 | Có |

Đã kiểm tra thêm khung dọc 60 người, nhạc local, phản ứng quà, Unicode, chống trùng người và giới hạn queue. Giới hạn camera không bảo đảm mọi nhãn hoặc người không bị nhau/HUD che. Đây là kiểm tra ngắn, cần thử dài hạn và GPU thật trước khi live đông người.

[Số đo gốc](../artifacts/hmong-2_5d-performance.json). Ảnh: [6 người](../artifacts/hmong-3d-stage-desktop.png), [30 người](../artifacts/hmong-3d-crowd-30.png), [60 người](../artifacts/hmong-3d-crowd-60.png), [60 người dọc](../artifacts/hmong-3d-crowd-60-vertical.png).

Chạy lại: `node scripts/browser-smoke.mjs --three-only` rồi `node scripts/report-sprites.mjs`.
