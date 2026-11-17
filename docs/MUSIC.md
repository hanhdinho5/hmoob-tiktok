# Nhạc nền local

Đã tích hợp năm file M4A thật trong `public/assets/audio/music/` theo yêu cầu người dùng, trên cơ sở xác nhận quyền sử dụng trong cuộc trò chuyện. Bài thứ ba chỉ lấy đoạn **02:30–08:00** của video `Un4PF7fTBbk`, dài đúng **5:30**; bài thứ tư `JGnhMteeRcE` lấy toàn bài, khoảng **3:55**. Xem tên bài, nguồn và cách thêm bài trong [README nhạc](../public/assets/audio/music/README.md).

## Cách dùng

- Mở club bằng link Virtual Crowd quen thuộc hoặc `/games/hmong-3d/index.html`.
- Bộ phát mặc định chọn bài `m4UT1z6jVf4`, rồi `RPS4tUgiTjY`, đoạn `Un4PF7fTBbk-0230-0800`, bài `JGnhMteeRcE`, sau đó lặp lại.
- Ở overlay, dùng **Phát nhạc / Tạm dừng**, nút bài trước/bài tiếp và thanh âm lượng. Nhạc nền độc lập với nút âm thanh hiệu ứng.
- Trong bảng điều khiển có mục **Nhạc nền** để chọn bài, bật/tắt, chuyển bài và chỉnh âm lượng. Với URL có username, lệnh đi qua Socket.IO hiện tại; không thay API hoặc cấu trúc TikTok event.
- Trình duyệt có thể chặn tự phát tiếng. Khi đó bấm **Phát nhạc** trực tiếp trong overlay một lần. Trong OBS/LIVE Studio còn cần bật/thu audio của nguồn phù hợp.
- Preview `hud=0` trong admin được muted để tránh phát trùng với overlay thật. Chế độ benchmark không tự phát nhạc. Thêm `music=0` vào URL để mở overlay với nhạc tắt ban đầu.

## Code

- `public/lib/music-player.js`: một HTMLAudioElement, tải playlist, đổi bài, tự chuyển khi kết thúc, lặp danh sách, âm lượng và xử lý autoplay/error.
- `public/assets/audio/music/playlist.json`: danh sách bài và nguồn.
- `public/games/hmong-3d/app.js`: bộ phát trên overlay.
- `public/games/hmong-3d/dashboard.js`: điều khiển cùng namespace settings 3D đang có.

Tên bài là metadata từ video; không dịch hoặc thay đổi tên H’Mông. Các nhãn UI mới vào bộ localization, tiếng H’Mông chưa duyệt dùng tiếng Việt dự phòng.

## Kiểm tra

```powershell
node scripts/check-music.mjs
node scripts/check-hmong.mjs
node scripts/browser-smoke.mjs --three-only --no-benchmark
```

Kiểm tra file M4A/MP4 header, thứ tự playlist, lặp, next/previous, pause/volume, xử lý autoplay và preview muted. Browser test xác nhận Chrome đọc được thời lượng và `currentTime` tăng trên các file thật, rồi kiểm tra chuyển/lặp bài và điều khiển. Riêng `node scripts/browser-smoke.mjs --music-only` kiểm tra nhanh đoạn mới phát được, dài 330 giây và chuyển về bài đầu. Không nghe hoặc chờ hết toàn bộ bài; sự kiện kết thúc được giả lập để kiểm tra vòng lặp. Chưa kiểm tra thu âm đầu ra trong OBS/LIVE Studio thật.

## Đèn bắt nhịp nhạc nền

Hệ đèn đọc nhạc từ chính audio element của MusicPlayer qua Web Audio AnalyserNode. Phân tích bass (40–180 Hz), trung/cao và RMS để điều chỉnh độ sáng, nhịp chạy viền LED, laser và tốc độ quét. BPM là ước lượng từ các đỉnh bass, không phải thông tin BPM đã xác minh của từng bài. Đồng hồ audio được dùng để tránh đếm nhịp theo delta đã giới hạn của game khi tốc độ khung hình thấp.

Dashboard có **Đèn bắt nhịp nhạc nền** và **Cường độ đèn**. Tắt bắt nhịp sẽ dùng nhịp tự động; tắt hiệu ứng hoặc đặt cường độ về 0 sẽ ẩn hệ đèn động. Cài đặt được nhớ và gửi sang display. Khung preview luôn tắt tiếng và dùng nhịp mô phỏng; nó không mở thêm audio context để phát nhạc.

Chỉ nhạc nền đang phát trong game được phân tích; không ghi microphone hay nghe âm thanh từ ứng dụng khác. Khi trình duyệt chặn âm thanh, dùng nút bật âm thanh trên display. Graph chỉ được gắn vào audio element khi AudioContext đã chạy để không làm mất tiếng do context đang bị treo. Đổi bài tái sử dụng cùng audio source/analyser; đóng trang sẽ giải phóng graph và audio context. MC vẫn giảm/khôi phục âm lượng nhạc như trước.

Các nhóm đèn chạy xen kẽ, không chớp trắng toàn màn hình. Thiết lập giảm chuyển động của hệ điều hành giảm tốc độ và độ sáng của hiệu ứng. Khi crowd đông, giảm số chùm và tắt laser, vẫn giữ viền LED chạy nhịp.

Kiểm tra:

```bash
node scripts/check-lighting.mjs
node scripts/check-music.mjs
node scripts/check-mc.mjs
CHROME_PATH=/usr/bin/google-chrome node scripts/browser-smoke.mjs --lighting-only
```

Bài Chrome kiểm tra nhạc M4A thật đi qua analyser, đổi bài vẫn phát tiếp, graph không tạo trùng, đáp ứng nhạc mạnh/nhẹ, các công tắc, lưu cài đặt, preview tắt tiếng và giải phóng audio context.
