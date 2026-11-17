# Nhạc nền của phòng nhảy

Đã tải riêng audio, không tải playlist YouTube:

1. `m4UT1z6jVf4.m4a` — **Es Koj Puas Nco Kuv Thiab Remix Dj || P.A.P BEAT BAND ft NT One**, khoảng 233 giây. [Nguồn](https://www.youtube.com/watch?v=m4UT1z6jVf4).
2. `RPS4tUgiTjY.m4a` — **Qaws kom siab zog - koos loos**, khoảng 234 giây. [Nguồn](https://www.youtube.com/watch?v=RPS4tUgiTjY).
3. `Un4PF7fTBbk-0230-0800.m4a` — **Poj Niam Nyaum Nyaum - koos Loos**, chỉ đoạn **02:30–08:00**, đúng **330 giây**. [Nguồn](https://www.youtube.com/watch?v=Un4PF7fTBbk).
4. `JGnhMteeRcE.m4a` — **Kuv Xav Tau Koj++ By Ntaj Neeb Yaj**, toàn bài, khoảng **3:55**. [Nguồn](https://www.youtube.com/watch?v=JGnhMteeRcE).
5. `ThlxD4LeFQo.m4a` — **Liam kom kawg | Paj huab vaj**, toàn bài khoảng **3:30**, audio M4A/AAC từ video được người dùng yêu cầu thêm ngày 16/11/2026; không tải danh sách radio. [Nguồn](https://www.youtube.com/watch?v=ThlxD4LeFQo).

Người dùng xác nhận đã được phép tải và sử dụng hai bản nhạc trong cuộc trò chuyện ngày 15/11/2026. Đây không phải nhạc CC0 và không có xác nhận quyền phân phối độc lập ngoài phạm vi đó.

Hai bài đầu giữ nguyên audio M4A/AAC từ nguồn. Bài thứ ba được cắt chính xác bằng FFmpeg từ giây 150 trong 330 giây và mã hóa AAC 160 kbps; ffprobe xác nhận cả stream và container dài `330.000000` giây. Video gốc/file đầy đủ của bài thứ ba chỉ nằm trong thư mục tạm, không nằm trong thư mục public.

Không cần ffmpeg khi chạy ứng dụng. Công cụ tải yt-dlp được lấy từ bản phát hành GitHub chính thức, FFmpeg portable từ gyan.dev (được ffmpeg.org giới thiệu); cả hai đã đối chiếu SHA-256 trước khi dùng. Không cài vào hệ thống hoặc thêm dependency npm.

## Thêm bài sau này

1. Đặt file có quyền sử dụng vào thư mục này. Định dạng hỗ trợ: `.mp3`, `.m4a`, `.mp4` audio, `.ogg`, `.webm`, `.wav`.
2. Thêm mục `id`, `title`, `src` vào `playlist.json`. Ví dụ cấu trúc:

```json
{
  "id": "bai-moi",
  "title": "Tên bài mới",
  "src": "/assets/audio/music/bai-moi.mp3"
}
```

3. Tải lại overlay và bảng điều khiển. Không phải sửa JavaScript hay cài thêm gói.

Thứ tự trong JSON là thứ tự phát. `loop: true` sẽ quay lại bài đầu khi hết danh sách; `defaultVolume` từ 0 đến 1.
