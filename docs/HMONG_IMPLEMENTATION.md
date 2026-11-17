# H’Mông LIVE — hiện trạng và các giai đoạn

## Những gì source hiện có

- Express + Socket.IO, TikTokService và `tiktok-bridge.js` được giữ nguyên.
- Đua ngựa: Canvas + DOM; giữ 5 làn, ID làn, bảng quà, lượt bình luận và các alias cũ (`vn`, `th`, `id`, `my`, `cn`). Tên hiển thị đổi thành Đội Chàm, Núi, Rừng, Nắng, Hoa; đây là tên đội trang trí, không đại diện cho nhóm người hoặc bản làng có thật.
- Virtual Crowd: 4 ảnh PNG nhân vật; Canvas dịch chuyển, xoay, co giãn để tạo điệu nhảy. Không có model 3D, rig hoặc skeleton trong source. Các hoạt ảnh hiện tại được giữ nguyên.
- Âm thanh hiện tại do Web Audio tổng hợp; không có bản thu tiếng H’Mông hoặc nhạc bản địa.
- Ảnh club và 4 nhân vật cũ vẫn được giữ để không làm mất tài nguyên. Khi chưa có ảnh nhân vật được duyệt, game vẫn dùng các nhân vật cũ; không gọi chúng là người H’Mông.

## Giai đoạn 1 — đã triển khai trong code

1. Chuyển văn bản của trang chủ, hai overlay, bảng điều khiển và debug vào `public/locales/vi.json`, `hmn.json`. Xem bảng câu gốc, bản Việt, ngữ cảnh trong `HMONG_TRANSLATION_REVIEW.md`.
2. Chỉ dùng câu H’Mông có trạng thái `user-provided` hoặc `approved`. Mục TODO hiển thị tiếng Việt. Giữ nguyên biến như `{name}`; tên người xem, bình luận và tên quà TikTok là dữ liệu thực, không tự dịch.
3. Chọn ngôn ngữ ở trang chủ/bảng điều khiển hoặc `?lang=hmn` / `?lang=vi`. Liên kết game mang theo lựa chọn ngôn ngữ. Mặc định ưu tiên H’Mông, với tiếng Việt dự phòng.
4. Chủ đề chung: chàm, xanh rừng, đỏ và vàng; hệ thống chữ, card, trạng thái, responsive và đường viền hình học nhất quán. Đường viền hình học chỉ là trang trí, chưa được xác nhận là hoa văn truyền thống H’Mông.
5. Thêm ảnh ruộng bậc thang có nguồn/giấy phép trong `ASSET_CREDITS.md`, lớp sân hội minh họa trên Canvas và đèn trang trí. Có ảnh SVG núi/ruộng làm phương án dự phòng. Đây chưa phải bản dựng chính xác một sân bản cụ thể.
6. Manifest tài nguyên có cổng duyệt, kiểm tra đường dẫn local và giấy phép. Tài nguyên chưa được duyệt không được tải. Ảnh thay thế bị lỗi sẽ quay về ảnh cũ.
7. Bộ phát giọng thu thật nối sự kiện vào phòng, bình luận và quà; dùng volume/mute hiện tại, chống chồng lời và không tự tổng hợp lời H’Mông. Mặc định chưa có giọng nào được bật.
8. Demo dùng lời mẫu người dùng cung cấp và tên người xem thử; bỏ avatar bên thứ ba trong demo.

## Giai đoạn 2 — người bản địa duyệt bản dịch

Sửa `public/locales/hmn.json`, ví dụ cấu trúc (không phải một đề xuất bản dịch):

```json
{ "home.needUsername": { "text": "<câu do người bản địa dịch>", "status": "approved", "source": "Tên người duyệt, ngày duyệt" } }
```

Giữ các key khác. Không thay `{name}`, `{count}`, `{gift}`. Các mục `user-provided` cũng cần gia đình kiểm tra lại có đúng cách nói ở Mù Cang Chải không. Không có bản dịch tự suy đoán cho các câu còn lại.

```powershell
node scripts/check-hmong.mjs --write-review
```

Lệnh kiểm tra biến, trạng thái duyệt, key, đường dẫn và hai engine; đồng thời cập nhật bảng để gửi cho người dịch. Chỉ cần tải lại trang sau khi sửa JSON, không phải sửa JavaScript.

## Giai đoạn 3 — tài nguyên văn hóa cần cung cấp

| Tài nguyên | Yêu cầu giao nhận | Tình trạng |
|---|---|---|
| Nam thường ngày / nữ thường ngày | PNG nền trong suốt, toàn thân, khoảng 512×768; cùng tỉ lệ, chân nằm giữa mép dưới | Chờ ảnh/trang phục được duyệt |
| Nam lễ hội / nữ lễ hội | PNG cùng khung hình; khăn, họa tiết, phụ kiện dựa trên ảnh tham chiếu gia đình cho phép dùng | Chờ ảnh/trang phục được duyệt |
| Sân bản, nhà, cảnh núi địa phương | Ảnh hoặc tranh 1920×1080 và 1080×1920, khoảng trống dưới cho nhân vật | Chờ ảnh tham chiếu/chấp thuận |
| Hoa văn | SVG/PNG có nguồn; xác nhận nhóm người, cách dùng và quyền sử dụng | Chưa dùng hoa văn tự nhận là truyền thống |
| Giọng chào | `assets/audio/hmong/greetings/member-hello.mp3`, lời theo `common.hello` | Chờ thu âm |
| Giọng cảm ơn | `assets/audio/hmong/thank-you/gift-thanks.mp3`, lời theo `common.thanks` | Chờ thu âm |
| Quà lớn / nhảy / hội thoại | MP3/WAV ngắn; từng câu có key bản dịch đã duyệt | Chờ lời và bản thu |
| Nhạc nền | Quyền livestream và tái sử dụng rõ ràng, loop sạch; chưa có bộ phát nhạc nền tự động | Chờ bản quyền và file |
| Chào follow | Chuẩn bị bản thu được; chưa kích hoạt vì bridge hiện tại chưa chuyển tiếp sự kiện follow | Chờ yêu cầu tích hợp riêng |

Đặt ảnh trong `public/assets/hmong/characters/`, bản thu trong `public/assets/audio/hmong/…`, sửa `public/assets/hmong/manifest.json`: điền `src`, `license`/`permission`, tác giả/người thu và chỉ đặt `approved: true` khi đã duyệt. Giọng cần có `textKey` trỏ đến câu được duyệt. Không đặt đường dẫn đến file chưa tồn tại.

### Model 3D

Đã khảo sát nguồn model; chưa xác minh được model nam/nữ vừa đúng trang phục Mù Cang Chải, vừa rõ giấy phép, vừa tương thích trực tiếp với renderer hiện tại. Ví dụ cần thẩm định riêng: [Old man with Hmong suit trên CGTrader](https://www.cgtrader.com/3d-models/character/man/old-man-with-hmong-suit). Đây chỉ là ứng viên, không xác nhận rig, giấy phép hoặc độ đúng văn hóa; không tải/mua/tích hợp model này.

Để giữ kiến trúc hiện tại, nếu có model hợp lệ nên render thành 4 PNG theo khung trên rồi thay qua manifest. Muốn 3D có rig/animation thật sẽ cần renderer và thiết kế riêng; không âm thầm thêm Three.js hoặc thư viện mới.

## Giai đoạn 4 — kiểm tra trước buổi LIVE thật

```powershell
pnpm.cmd start
node scripts/check-hmong.mjs
node scripts/browser-smoke.mjs
```

Lệnh browser cần Chrome cài sẵn (hoặc đặt biến `CHROME_PATH`); tự chạy server ở cổng tạm, dùng profile tạm và đóng các tiến trình của chính nó khi xong. Không dùng tài khoản TikTok. Ảnh kiểm tra lưu trong `artifacts/`.

Sau đó cần người vận hành thực hiện: LIVE tài khoản thật → mở URL theo username → thử bình luận, tim, chia sẻ, quà đơn/quà chuỗi → mất mạng/kết nối lại → OBS Browser Source và nguồn Link của TikTok LIVE Studio → kiểm tra âm thanh/autoplay, bố cục ngang/dọc. Kiểm tra giả lập không thay thế được các bước này.

Các lỗi bảo mật đã báo trước đó và cảnh báo dependency không nằm trong đợt đổi ngôn ngữ/giao diện này; chưa được coi là đã sửa.
