# H’Mông TikTok Live

Game sàn nhảy tương tác cho TikTok LIVE Studio: mỗi người xem có một nhân vật chibi H’Mông và điều khiển bằng bình luận.

## Chức năng

- 20 mẫu nhân vật 2.5D trên sân khấu 3D, mỗi mẫu có 6 điệu nhảy (thêm chống hông lắc hông, nhún vai và bước ngang vung tay).
- Chế độ tự do: người chơi đi quanh sàn, lên/xuống bục theo bậc thang; có DJ thường trực sau bàn mixer.
- Bình luận `nam` hoặc `nữ` (có thể gõ `nu`) để chọn mẫu nhân vật của chính bạn; quà đổi mẫu giữ lựa chọn nam/nữ.
- Bình luận `nhảy 1` đến `nhảy 6`, `lắc hông`, `nhún vai`, `vung tay`, `tự động`, `đứng yên` để đổi điệu riêng.
- Hiệu ứng khi bình luận, thả tim, chia sẻ và tặng quà.
- Hai nhà lớn BIA HƠI / PHÒNG THAY ĐỒ ở hai bên sàn; chat `mời bia` để lấy hai cốc, mời người đang nhảy, chạm cốc và uống.
- Camera tự chuyển góc; 10 màn quà: zoom, đổi mẫu, solo, xe, trực thăng, cánh, đuốc, tiệc, rồng và phượng.
- Nút thử từng màn quà trên dashboard, có hàng đợi và tự trả nhân vật về đội hình/điệu riêng.
- Dashboard gọn: thêm người, giả lập bình luận/thả tim, tặng quà bằng ảnh, chuyển nhạc và âm lượng; có trạng thái kết nối và link LIVE Studio.
- Đèn quét, laser, vệt sáng và viền LED phản ứng theo bass/năng lượng nhạc nền; có chỉnh cường độ.
- Có nhạc nền local; giọng MC nam hiện mới có mẫu thu, chưa tự chào/cảm ơn.

## Chạy dự án

Yêu cầu Node.js ≥ 18 và pnpm. Dự án dùng Express, Socket.IO, Three.js và JavaScript.

```powershell
pnpm.cmd install
pnpm.cmd start
```

Khi phát triển, dùng `pnpm.cmd dev` để tự khởi động lại server khi sửa mã.

## Sử dụng

1. Mở [trang điều khiển](http://localhost:3000/games/hmong-3d/dashboard.html).
2. Nhập username TikTok khi LIVE, hoặc để trống để thử bằng các nút giả lập.
3. Bấm **Sao chép**, dán link trang hiển thị vào nguồn web của TikTok LIVE Studio và giữ server chạy.

Chỉ có hai trang chính: **Điều khiển** và **Hiển thị**. Nếu cổng 3000 đang được dùng, dừng phiên server cũ trước khi chạy lại.

Xem thêm [camera và màn diễn quà](docs/GIFT_SHOWS.md), [hướng dẫn sử dụng](docs/TWO_PAGE_WORKFLOW.md) và [nguồn tài nguyên](docs/ASSET_CREDITS.md).
