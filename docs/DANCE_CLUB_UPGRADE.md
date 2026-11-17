# Phòng nhảy theo ảnh tham chiếu thứ hai

## Mở đúng phiên bản

Link cũ `/games/virtual-crowd/index.html` và `dashboard.html` được server chuyển sang `/games/hmong-3d/`, giữ nguyên query (username, demo, ngôn ngữ...).

- Nhóm 6 người: http://localhost:3000/games/hmong-3d/index.html?demo=1
- Điều khiển: http://localhost:3000/games/hmong-3d/dashboard.html

Tải lại nguồn/trang sau khi cập nhật code. Nếu vẫn thấy ảnh cũ, dùng Ctrl+F5 hoặc refresh browser source. Các file GLB mới có hậu tố `-club-v2` để tách khỏi model demo cũ.

## Các thay đổi thực tế

- 6 model GLB mới: 3 nam, 3 nữ; áo chàm/áo viền/sơ mi trắng, tóc búi/khăn thêu/phụ kiện bạc. Tóc dựng bằng các lọn có đầu thuôn; khuôn mặt, mắt, thân, bàn tay và giày được dựng lại.
- Váy xếp ly, viền áo/quần, khăn và cổ tay dùng texture thêu. Mỗi GLB gồm hai primitive skinned (thân + phần vải), cùng rig 11 bone và 9 clip chuyển động. Đây không phải 6 PNG đứng yên.
- Chân dùng skin weights chuyển tiếp tại đầu gối để giảm khe hở khi nhảy.
- Phòng mới có nền xa LED dựng theo ảnh tham chiếu, bậc/cột/vòng đèn thật bằng geometry 3D, sàn phản chiếu planar và đèn chuyển động. Không gọi nền xa là toàn bộ một phòng 3D chi tiết được model hóa.
- Phản chiếu dùng render target nhỏ 384×256; tự tắt khi quá 12 nhân vật để giảm tải. Crowd nhiều người vẫn giữ các phần sân khấu khác.
- 6 người xếp ngang ở màn hình ngang, hai hàng khi màn hình dọc; tên TikTok ở trên đầu. Giữ cơ chế một người xem một nhân vật, bình luận Việt/H’Mông, gift mapping, âm thanh hiệu ứng và Socket.IO.

## File cần chỉnh

| File | Vai trò |
|---|---|
| `public/games/hmong-3d/club-stage.js` | Phòng club, đèn, bậc, sàn phản chiếu |
| `scripts/club-model-design.mjs` | Geometry tóc/mặt/trang phục/phụ kiện và skin weights |
| `scripts/build-chibi-models.mjs` | Xuất 6 GLB với animation |
| `public/games/hmong-3d/characters.js` | Tải texture, clone model, nhãn và đội hình |
| `public/games/hmong-3d/config.json` | Model mới, clip và ánh xạ quà |
| `public/assets/hmong/club/dance-hall.png` | Phông xa club được tạo theo tham chiếu |
| `public/assets/hmong/club/embroidered-fabric.png` | Texture vải được tạo theo tham chiếu |

`public/assets/hmong/manifest.json` là cấu hình tài nguyên của **2D dự phòng** và bản thu âm dùng chung; không phải danh sách GLB của club 3D.

## Nguồn và giới hạn hình ảnh

Ảnh thứ hai do người dùng cung cấp là tham chiếu tạo hình. Hai texture raster được tạo bằng **imagegen tích hợp**, không tải từ thư viện bên ngoài. [Prompt gốc](CLUB_ASSET_PROMPTS.md). Geometry/animation là code trong repository.

Đây là bản dựng lại theo phong cách tham chiếu, không phải bản sao khớp từng pixel hoặc model gốc của ảnh. Phong cách hiện đại này và các họa tiết chưa được coi là trang phục/điệu múa truyền thống đã được người bản địa xác nhận.

Chưa thêm nhạc YouTube hoặc giọng thu mới trong đợt thay hình ảnh này. Chưa kiểm tra LIVE thật hay GPU/OBS trên máy người dùng; xem báo cáo hiệu năng và ảnh kiểm tra trong `artifacts/`.
