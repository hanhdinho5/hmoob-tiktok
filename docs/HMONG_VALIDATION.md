# Kiểm tra bản H’Mông LIVE

Ngày kiểm tra: 15/11/2026. Runtime máy kiểm tra: Node.js 22, Chrome headless; không cài thêm dependency.

## Đã kiểm tra

- `node scripts/check-hmong.mjs --write-review`: key locale và ngữ cảnh đồng bộ; chỉ dùng câu đã có nguồn/được duyệt; TODO dùng tiếng Việt; kiểm tra biến `{name}`, `{count}`; đường dẫn HTML/ảnh; cú pháp JavaScript và script inline; cổng duyệt tài nguyên.
- Hai engine: bình luận, tim và quà; 5 làn đua và alias cũ; Virtual Crowd vào phòng, hiện lời thoại, hiệu ứng quà và trạng thái animation.
- `node scripts/browser-smoke.mjs`: khởi động Express thật ở cổng tạm; bảng điều khiển kết nối Socket.IO; trang chủ tạo URL; đổi lựa chọn ngôn ngữ; giao diện desktop và mobile; demo Canvas; tắt âm; sự kiện chat/like/gift giả lập qua dispatcher của bridge; settings và clear; đếm ngược/đang đua; Unicode.
- Dữ liệu nickname chứa chuỗi HTML hiển thị dạng chữ, không thành thẻ ảnh.
- Không có exception JavaScript hoặc HTTP 4xx/5xx cho tài nguyên ứng dụng trong các luồng browser đã kiểm tra (favicon mặc định của trình duyệt không tính).
- Không sửa server, connector, normalizer, reconnect policy, bridge API hoặc tên sự kiện Socket.IO.

Ảnh kiểm tra nằm trong `artifacts/`: trang chủ và bảng điều khiển desktop/mobile, sân bản dọc và đua ngựa desktop/mobile.

## Chưa xác nhận

- Phiên LIVE TikTok thật, tính quà chuỗi và việc nối lại mạng với TikTok.
- Chạy bên trong OBS hoặc TikTok LIVE Studio, âm thanh/autoplay của hai phần mềm này.
- Độ đúng phương ngữ Mù Cang Chải của các câu mẫu, toàn bộ bản dịch còn TODO.
- Trang phục/nhân vật H’Mông, bản thu giọng và nhạc: chưa có tài nguyên được duyệt để thử.
- Không có kiểm thử tải hoặc khẳng định các lỗi bảo mật đã báo trước đây được sửa.
