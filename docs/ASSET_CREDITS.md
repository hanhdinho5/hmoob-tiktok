# Nguồn tài nguyên H’Mông LIVE

## Ảnh quà TikTok

`public/assets/tiktok-gifts/{5655,5827,5269,6064,5487,8913,10961,6560,1354579}.webp` là ảnh Rose, Ice Cream Cone, TikTok và GG tải trực tiếp từ URL CDN TikTok trả về bởi `TikTokLiveConnection.fetchAvailableGifts()` ngày 16/11/2026. Đây là tài nguyên quà của TikTok, không phải ảnh tự vẽ hoặc ảnh AI. `catalog.json` lưu ID, tên, giá, URL gốc và thời điểm lấy để đối chiếu; không áp dụng giấy phép mã nguồn của dự án cho các ảnh này.

## Thêm 12 mẫu từ ảnh hàng 6 nam + 6 nữ

File `public/assets/hmong/club/dances-*-v1.png` của các ID mới: `male-blue-jacket`, `male-blue-headband`, `male-red-black`, `male-white-black`, `male-red-headband`, `male-white-blue`, `female-blue-bun`, `female-blue-crown`, `female-red-bun`, `female-white-headdress`, `female-red-twinbuns`, `female-white-blue-hat`. Mỗi file gồm ba điệu, tám khung mỗi điệu. Công cụ: imagegen tích hợp, theo ảnh người dùng gửi trong yêu cầu mở rộng. Giữ các mẫu cũ; bộ hoàn chỉnh có 20 mẫu và 480 khung.

Prompt và file tương ứng: [12 mẫu mới](new12-character-prompts.json). Một atlas cũ có hàng không đều đã được sửa thành `dances-male-festival-v3.png`; [prompt sửa](festival-atlas-repair.json). PNG gốc được giữ để đối chiếu. Kiểm tra biên ô phát hiện lỗi này; đã căn pivot cố định theo mép đế giày cho từng điệu bằng `node scripts/check-dance-art.mjs --write-pivots`, không sửa pixel hoặc thay tỷ lệ giữa các tư thế.

## Bộ nhảy tám mẫu, ba điệu mỗi mẫu

Tám file `public/assets/hmong/club/dances-*-v2.png` được tạo bằng imagegen tích hợp, dựa trên bộ ảnh tham chiếu người dùng và atlas nhân vật trước đó. Mỗi file 1024×1536, 24 ô RGBA; tổng 192 khung. [Prompt đầy đủ theo mẫu](all-dance-prompts.json), [cách dùng và giới hạn](DANCE_SIMULATOR.md). Đây là hoạt họa 2.5D do AI tạo, không phải model hoặc motion capture 3D; chưa xác nhận độ chính xác trang phục/điệu múa truyền thống.

## Dance Club theo tham chiếu mới

Hai file `public/assets/hmong/club/dance-hall.png` và `embroidered-fabric.png` được tạo bằng imagegen tích hợp theo ảnh thứ hai do người dùng cung cấp. Xem [prompt và vai trò từng ảnh](CLUB_ASSET_PROMPTS.md). Không phải ảnh tư liệu văn hóa. Chúng được lưu trong repository và gắn vào room/texture vải; nhân vật vẫn là mesh GLB có animation.

6 model `*-club-v2.glb` được tạo bởi `scripts/club-model-design.mjs` và `scripts/build-chibi-models.mjs`. Phong cách hiện đại theo tham chiếu, chưa phải mẫu phục trang truyền thống đã xác nhận. Các tài nguyên cũ dưới đây được giữ cho bản 2D dự phòng.

## Ảnh ruộng bậc thang

- File local: `public/assets/hmong/mu-cang-chai.jpg`.
- Tác giả đăng tải: Malock2589.
- [Trang mô tả gốc trên Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Golden-terraced-fields-in-Mu-Cang-Chai.jpg).
- Giấy phép được ghi trên trang file: [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/).
- 800 × 450 px, 255658 bytes. SHA-1: `312b467711833b3aadf68a8310d48a726aca9084` (khớp metadata nguồn).
- Lưu file nguyên bản; ứng dụng chỉ crop/scale khi hiển thị. Độ phân giải ảnh này phù hợp làm nền có lớp phủ, cần ảnh lớn hơn cho bản hình ảnh cuối cùng.
- Không dùng ảnh này để tự xác nhận trang phục, phương ngữ hoặc danh tính người trong ảnh.

## Minh họa trong repository

- Đèn, lớp sân và viền hình học do CSS/Canvas dựng; chưa được xác nhận là hoa văn văn hóa truyền thống.
- Ảnh nhân vật nấm và ảnh club: tài nguyên có sẵn của repository, được giữ nguyên. Chưa có ảnh nhân vật H’Mông được xác nhận và thay thế.

## Bản thu

Chưa thêm bản thu hoặc nhạc. Không tạo giọng giả lập người bản địa. Các slot trong manifest mặc định tắt cho đến khi có file thật, lời được duyệt và quyền sử dụng.
