# Sáu điệu nhảy cho 20 mẫu và phòng giả lập

**Luồng mới:** phần giả lập đã được gom vào **dashboard.html**. `simulator.html` chỉ chuyển về dashboard. Chỉ cần trang điều khiển và trang hiển thị; xem [hướng dẫn hai trang](TWO_PAGE_WORKFLOW.md). Các ghi chú phòng riêng dưới đây mô tả bản cũ.

Bộ hiện tại có 8 mẫu cũ và 12 mẫu theo ảnh mới (6 nam hàng trên, 6 nữ hàng dưới). Cả 20 mẫu có sáu chuỗi nhảy riêng, tổng 1.200 khung: 480 khung cũ và 720 khung mới. Bảng điều khiển và phòng thử đọc danh sách trực tiếp từ config; không còn giới hạn bộ chọn ở tám mẫu.

[Prompt và file 12 mẫu mới](new12-character-prompts.json). Kiểm tra PNG bao gồm nền trong suốt, ô không rỗng và silhouette không vượt biên ô; đã sửa một atlas cũ lệch hàng. Điểm đặt chân cố định của mỗi điệu được đo từ alpha, không cắt/thu phóng riêng từng tư thế.

Kích thước mặc định 85%. Khoảng cách sàn giữ nguyên khi chỉnh kích thước để camera tự bao đội hình không triệt tiêu hiệu quả thu nhỏ. Phòng thử tạo lần lượt đủ 20 mẫu bằng dữ liệu nội bộ chỉ được chấp nhận trong `simulation=1`; phiên LIVE tiếp tục chọn mẫu theo tài khoản. Giới hạn người chơi mặc định vẫn 30, có thể chỉnh tối đa 100; đây không phải cam kết FPS.

Mở `http://localhost:3000/games/hmong-3d/simulator.html` sau khi chạy `pnpm start`. Hoặc chọn liên kết phòng giả lập trong bảng điều khiển.

## Phạm vi hiện tại

Ba điệu bổ sung có 12 khung/điệu, phát 12 khung/giây: `nhảy 4` / `lắc hông` (hai tay chống hông), `nhảy 5` / `nhún vai`, `nhảy 6` / `vung tay` (bước ngang kết hợp vung tay). Các lệnh có thể viết không dấu. Mỗi mẫu có atlas riêng, không đổi trang phục khi đổi điệu.

Ảnh mở rộng có 6 cột, 6 hàng. Metadata `rowBounds` đọc đúng khoảng cách hàng trong nguồn ảnh; `rowScales` giữ chiều cao nhất quán giữa các hàng, không đổi tỉ lệ từng tư thế. `framePivots` đặt chân đỡ sát sàn. Ảnh PNG giữ nguyên đầu ra imagegen, không cắt sửa file. [Prompt và file mở rộng](extended-dance-prompts.json).


**Ba điệu cũ của cả 20 mẫu** có sprite sheet riêng 4 cột × 6 hàng (24 khung/mẫu): bước ngang đổi chân (`danceA`, khung 1–8), đánh tay/nhún gối (`danceB`, khung 9–16), disco (`danceC`, khung 17–24). Giữ nguyên tỷ lệ và UV ô giữa các khung; không cắt từng tư thế theo bounding box để tránh co giãn nhân vật. Mỗi người có texture transform riêng, dùng chung nguồn ảnh. Chế độ tự động đổi sáu điệu sau khoảng 8 giây, lệch pha theo người.

Phản ứng quà/like/chia sẻ ánh xạ sang điệu B; chào dùng điệu A. Chưa có hoạt họa chào, vỗ tay hay biểu cảm riêng. Chưa đồng bộ beat của file nhạc và chưa dùng nội suy pose. Chuyển điệu hiện đổi nhóm khung trực tiếp, chưa có frame chuyển tiếp chuyên biệt; không coi kiểm tra kỹ thuật là chứng minh chuyển động đã mượt như video múa. Đứng chờ vẫn dùng ảnh tĩnh nhún nhẹ.

## Người xem tự chọn điệu

Mặc định overlay và dashboard mở chế độ crowd: mỗi tài khoản có nhân vật riêng. Chế độ sáu người biểu diễn vẫn mở được bằng `mode=stage`, nhưng bình luận chọn điệu không điều khiển nhóm biểu diễn đó.

| Bình luận | Tác dụng lên nhân vật người gửi |
|---|---|
| `nhảy 1`, `1`, `!dance 1` | Bước ngang đổi chân |
| `nhảy 2`, `2`, `!dance 2` | Đánh tay/nhún gối |
| `nhảy 3`, `3`, `!dance 3`, `disco` | Disco |
| `tự động`, `!dance auto` | Tự đổi ba điệu |
| `đứng yên`, `stop` | Đứng chờ |

Nhận chữ hoa/thường, tiếng Việt có/không dấu. Đây là lệnh cố định, không phải dịch tự động: bình luận H’Mông thông thường vẫn nhận intent đã có; mã số 1/2/3 dùng không phụ thuộc ngôn ngữ. Chưa thêm câu H’Mông chọn điệu khi chưa được kiểm chứng.

Lựa chọn chỉ gắn với khóa tài khoản người gửi, không nhận tên người khác làm mục tiêu. Giữ lựa chọn sau phản ứng quà, tim hoặc chào; thay đổi âm lượng/cài đặt chung không xóa lựa chọn. Lệnh đến trước khi spawn được giữ trong queue; người rời phòng/xóa thì lựa chọn cũng xóa. Bình luận không nhận diện không ép đổi điệu. Không lưu lựa chọn qua lần tải lại server/trang.

## Giả lập

- Phòng thử ban đầu tạo đủ 20 mẫu. Có thể tạo thêm 1/10/30 người; chọn người, cho rời phòng; thử 20 sự kiện vào trùng.
- Bình luận tùy nhập, nhận cả Việt/H’Mông theo các intent đã khai báo; like, share, quà 1 kim cương, combo 10, quà lớn 199.
- Tự động tạo sự kiện mỗi 1,2 giây; dừng và dọn toàn bộ người/các spawn đang chờ. Giới hạn 100 người, nhật ký 80 dòng.
- Phòng thử mở iframe **không có username**, không kết nối TikTok, không gửi control lên server và không dùng BroadcastChannel điều khiển phòng thật. Nhạc và MC tắt trong phòng thử.
- `simulationLeave` chỉ được xử lý khi URL overlay có `simulation=1`. Đây là sự kiện nội bộ giả lập, không thêm hay đổi API bridge/backend. Kết nối TikTok của dự án chưa phát sự kiện người rời phòng; phiên thật vẫn dùng thời gian không hoạt động.

## Kiểm tra

```powershell
node scripts/check-hmong.mjs
node scripts/check-sprites.mjs
node scripts/check-dance-art.mjs
node scripts/check-dance-commands.mjs
node scripts/check-simulator.mjs
CHROME_PATH=/usr/bin/google-chrome node scripts/browser-smoke.mjs --dance-only
node scripts/check-music.mjs
node scripts/check-mc.mjs
node scripts/browser-smoke.mjs --three-only --no-benchmark --simulator
```

Browser kiểm tra chuyển khung A/B, người vào/ra, trùng người, rời trước khi spawn, quà lớn, bình luận, dừng tự động, reset queue và 30 người. Ảnh nằm trong `artifacts/hmong-danceA-simulator.png`, `hmong-danceB-simulator.png`, `hmong-simulator-30.png`. Cần nghe/nhìn trên máy chạy LIVE thật để đánh giá độ mượt; không có cam kết 30 FPS trên mọi máy.

Các GIF `artifacts/danceA-preview.gif` và `artifacts/danceB-preview.gif` trước đây là bản ghi bản thử một mẫu. Ảnh bộ mới: `artifacts/hmong-all-danceA.png`, `hmong-all-danceB.png`, `hmong-all-danceC.png`, `hmong-own-dance-choices.png`. Việc dùng 8 tư thế do AI tạo vẫn có thể gây thay đổi nét mặt/chi tiết và bước chuyển rõ giữa khung, cần đánh giá cảm quan thêm.

## Kết quả kiểm tra bộ 20 mẫu

- Kiểm tra PNG: đủ 20 atlas RGBA 1024×1536, từng ô trong 480 ô có nhân vật và nền trong suốt; chỉ số đầu điệu là 0/8/16, không đọc nhầm nhóm khung; kiểm tra biên ô và pivot giày.
- Unit: lệnh có/không dấu, số, `!dance`, từ không hợp lệ; không nhận mục tiêu người khác; lệnh đến trước spawn, ưu tiên phản ứng quà rồi trở về lựa chọn, bình luận thường không ép đổi điệu.
- Chrome headless: đủ 20 chỉ số mẫu khác nhau trong phòng thử và cả 20 đều chuyển khung ở cả ba điệu; hai người chọn A/B và một người đứng yên đồng thời; đổi cài đặt không mất lựa chọn; quà lớn của người thứ nhất không đổi base của người thứ hai, rồi tự trở lại A.
- Giả lập: vào/ra, trùng người, bình luận Việt/H’Mông, rời trước spawn, reset, auto start/stop, 30 người. Bài đo overlay riêng ở 6/30/60 người nằm trong [báo cáo phần mềm](2_5D_PERFORMANCE.md).
- Bảng tên được đặt theo hướng ảnh để tránh che mắt khi camera cao; ẩn khi trên 12 người. Không thêm dependency, sự kiện backend hoặc thay API TikTokBridge.

Các bài thử là mô phỏng cục bộ trên SwiftShader; chưa thử phiên LIVE thật hoặc xác nhận chất lượng phát âm/điệu múa truyền thống.
