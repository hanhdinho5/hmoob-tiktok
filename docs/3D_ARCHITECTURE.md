# Nâng cấp 3D — kiến trúc và phạm vi demo đầu tiên

## Phân tích source trước khi thay đổi

- Backend: `src/server.js` phục vụ static và Socket.IO; `TikTokService` giữ kết nối theo username, normalizer và reconnect policy riêng. Không cần viết lại backend.
- Client: `public/lib/tiktok-bridge.js` chuyển member/chat/like/share/gift/control sang callback. **Chưa có follow** trong service/bridge hiện tại; không coi là đã có.
- Virtual Crowd hiện tại là Canvas 2D + PNG, chuyển động bằng phép biến đổi. Không có skeleton, model GLB hoặc mixer sẵn.
- Horse Racing độc lập bằng Canvas/DOM; giữ nguyên.
- Localization có cổng duyệt, lệnh bình luận Việt/H’Mông và bộ phát bản thu thật; tận dụng lại.
- Bảng điều khiển dùng `virtual-crowd-control` với action settings/test/clear. Có thể gửi cấu hình 3D dưới namespace `hmong3d`, không đổi cấu trúc sự kiện.

## Kiến trúc demo

`public/games/hmong-3d/` là game mới, lựa chọn riêng trong trang chủ. Giữ mọi đường dẫn game 2D.

```text
TikTokService (không đổi) → Socket.IO (không đổi) → TikTokBridge (không đổi)
  → event-buffer.js (hàng đợi hữu hạn)
  → event-router.js (ánh xạ sự kiện/quà)
  → characters.js (GLB cache, clone skeleton, giới hạn nhân vật)
  → animation.js (AnimationMixer, chuyển trạng thái)
  → renderer.js + stage.js (WebGL, môi trường, đo hiệu năng)
```

- Thêm đúng một dependency: Three.js, ghim phiên bản trong pnpm.
- Hai route static chỉ phục vụ build/addon của thư viện local. Không phụ thuộc CDN, không mở toàn bộ node_modules, không đổi kết nối TikTok.
- Import map cho trình duyệt; không thêm bundler/framework.
- GLB có skeleton, vertex colors và animation thật; geometry/material dùng lại giữa các clone. Mixer riêng cho mỗi nhân vật.
- Chế độ cố định 4 người và chế độ crowd dùng chung renderer. Mapping quà, clip, thời lượng và giới hạn ở JSON.
- Demo không cần TikTok. Overlay có username dùng bridge hiện tại; admin gửi lệnh qua Socket.IO hiện tại. Preview cùng trình duyệt không có username dùng BroadcastChannel riêng, không thay cho kiểm tra OBS.

## Rủi ro và giới hạn

- WebGL2 / GPU của trình duyệt nhúng có thể khác Chrome; cần test trực tiếp OBS và LIVE Studio.
- Không tự nhận hỗ trợ 100 người. Cần đo FPS, draw calls, triangles, số geometry/texture và heap nếu trình duyệt cung cấp; đây không phải số VRAM chính xác.
- Model demo là tạo hình chibi thử nghiệm và chuyển động thông dụng. Chưa có xác nhận trang phục hay điệu múa truyền thống H’Mông. Không gọi là sản phẩm nhân vật văn hóa hoàn chỉnh.
- Follow chưa được chuyển tiếp. Bổ sung sau sẽ cần thay service/bridge và thỏa thuận contract, không âm thầm thêm trong demo.
- Các lỗi xác thực điều khiển phòng đã báo trước đây chưa được giải quyết bởi nâng cấp renderer; không xem demo là bản production public.

## Giai đoạn

1. Phân tích và tách đường dẫn mới.
2. Demo sân khấu, GLB, animation, overlay và đo hiệu năng.
3. Duyệt tạo hình, tài nguyên trang phục địa phương, rig và điệu nhảy; thay model thử.
4. Kiểm tra TikTok LIVE thật; tích hợp follow sau khi duyệt contract.
5. Đo và tối ưu crowd trên máy dùng livestream.
6. Âm thanh, bản dịch, sân khấu và kiểm tra trực tiếp OBS/LIVE Studio.
