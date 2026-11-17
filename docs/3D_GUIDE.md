# Demo Chibi 3D đầu tiên

**Cập nhật:** phòng và bộ nhân vật hiện đã chuyển sang [Dance Club theo ảnh tham chiếu thứ hai](DANCE_CLUB_UPGRADE.md), với 6 GLB mới và texture vải. Link Virtual Crowd mặc định chuyển sang club; 2D dự phòng ở `legacy.html`. Các bước chạy dưới đây vẫn áp dụng.

## Chạy

```powershell
pnpm.cmd install
pnpm.cmd start
```

- Nhóm 6 nhân vật: http://localhost:3000/games/hmong-3d/index.html?demo=1
- Crowd thử 12 người: http://localhost:3000/games/hmong-3d/index.html?demo=1&mode=crowd
- Bảng điều khiển: http://localhost:3000/games/hmong-3d/dashboard.html
- Đo thử 30 người: http://localhost:3000/games/hmong-3d/index.html?benchmark=1&count=30&metrics=1

Trang chủ có thêm thẻ **Sân bản · Chibi 3D**.

## OBS / TikTok LIVE Studio

Nhập username trong bảng điều khiển, chọn chế độ rồi sao chép URL vào Browser Source của OBS hoặc nguồn Link của LIVE Studio. Overlay hoạt động độc lập với admin; admin không cần luôn mở. Giữ Node.js chạy. Tải lại nguồn nếu kết nối trước khi tài khoản bắt đầu LIVE.

Ví dụ URL thật: `/games/hmong-3d/index.html?id=USERNAME&mode=stage` hoặc `mode=crowd`. Thêm `hud=0` để ẩn chữ/nút trang trí; `metrics=1` để hiện số đo. Đây vẫn là sân khấu có nền 3D, không tự chuyển thành nền trong suốt.

Để trống username thì **chỉ là preview**, không nối TikTok. Bảng điều khiển gửi preview qua BroadcastChannel trong cùng trình duyệt/origin. Preview này không truyền sang OBS/LIVE Studio; với hai phần mềm đó cần URL có username và kết nối Socket.IO.

Chrome WebGL đã được kiểm tra. Chưa mở được một phiên OBS/LIVE Studio hay TikTok LIVE thật trong môi trường kiểm tra này. WebGL2, âm thanh/autoplay và GPU acceleration cần kiểm tra trên máy phát live.

## Đã tích hợp thực tế

| Phần | Hiện trạng |
|---|---|
| Renderer | Three.js 0.187.0, WebGL2, import map, thư viện local qua Express |
| Model | 6 GLB club thật, mỗi model 2 primitive skinned (thân/vải), skeleton 11 bone; geometry và texture dùng lại giữa clone |
| Tạo hình | 2 mẫu nam, 2 mẫu nữ; mẫu nữ có hình khối váy/tóc riêng, mẫu lễ hội thêm phụ kiện 3D; tất cả là prototype chờ duyệt văn hóa |
| Animation | 9 clip: idle/dance/happy/celebrate/wave/surprise/clap/gift/walk; AnimationMixer và crossfade |
| Nhóm cố định | 6 người, lệnh theo từng vị trí hoặc cả nhóm |
| Crowd | Một key theo uniqueId, không tạo trùng; xếp hàng/vòng tròn; hàng đợi spawn hữu hạn và giới hạn nhân vật |
| Tương tác | member/chat/like/share/gift từ bridge cũ; chat Việt/H’Mông dùng matcher hiện tại |
| Quà | Mapping tên, giftId, tổng giá trị; cấu hình JSON; rule giá trị lớn được ưu tiên |
| Sân khấu | Khối 3D cho núi/ruộng/sân/nhà/đèn; cây và bóng đơn giản dùng InstancedMesh; không tuyên bố nhà hay hoa văn là tái hiện dân tộc học |
| Âm thanh | Giữ CrowdSoundFX; dùng lại cổng bản thu được duyệt của HmongAssets; chưa thêm nhạc nền/bản thu mới |
| Đo đạc | FPS, calls, triangles, geometry/texture count, JS heap khi có; không gọi JS heap là VRAM |

## Cấu hình

`public/games/hmong-3d/config.json` chứa đường dẫn GLB, tên clip, thời lượng phản ứng, loop, giftRules, giới hạn và mức render mục tiêu. Ví dụ cấu hình đã có:

```json
{ "names": ["Rose"], "ids": [], "target": 0, "action": "dance" }
```

`target` là vị trí 0–5 hoặc `all`. Trong crowd, quà tác động đến nhân vật người gửi; target theo vị trí áp dụng cho sân khấu cố định. Rule `minimumValue` tính `giftValue × repeatCount` và ưu tiên hơn rule tên quà.

Admin chỉnh được chế độ, sân khấu, đội hình, mẫu cho người mới trong crowd, giới hạn, hiệu ứng, animation, volume và mapping quà. Không có trình sửa tóc/trang phục chi tiết hoặc trình dựng animation. Chỉnh mapping trong admin tồn tại trong bộ nhớ server đến khi khởi động lại; muốn lưu lâu dài sửa config.json. Đóng admin không làm dừng overlay.

Các lệnh 3D dùng `settings.payload.hmong3d` và `test.payload.type = hmong3d` trong event điều khiển sẵn có; không sửa contract, không làm các game 2D hiểu nhầm thành lệnh riêng của chúng. Nút dọn 3D không phát action clear chung để xóa crowd 2D khác.

## Thay bằng model do nghệ sĩ chuẩn bị

1. Xác minh giấy phép cho phép đưa asset trong ứng dụng web và livestream; lưu nguồn/giấy phép cùng file.
2. Duyệt trang phục/hoa văn bằng ảnh tham chiếu tại Mù Cang Chải có phép sử dụng.
3. Xuất GLB: trục Y hướng lên, chân ở mặt sàn y=0, mặt nhìn +Z, cao khoảng 2.4 đơn vị; skeleton đã bind, không có scale lạ.
4. Chứa các animation cùng skeleton. Đổi `animations.*.clip` để ánh xạ tên clip thực. Các model thử có 11 bone và không mặc định tương thích rig Mixamo; cần retarget/bake rồi mới xuất, không chỉ đổi tên file.
5. Thay URL trong `config.characters`. Model đang dùng vertex colors, không cần texture ngoài. Nếu model có texture cần đóng gói trong GLB hoặc giữ đường dẫn local đúng.
6. Kiểm tra lại độc lập mỗi clone, trọng lượng file, draw calls, skeleton và số đo trên máy phát live.

Model mẫu được tạo bởi `scripts/build-chibi-models.mjs`. Không có bước raster hóa ảnh thành nhân vật. Chạy lại bằng `node scripts/build-chibi-models.mjs`; GLB đã lưu sẵn, không phải build mỗi lần mở server.

## Chưa hoàn tất

- Trang phục và điệu múa H’Mông được người bản địa xác nhận; chất lượng nhân vật mobile game hoàn chỉnh.
- Follow: service/bridge hiện tại chưa chuyển tiếp. Chưa thay API trong demo này.
- Bản thu giọng, nhạc nền và bản dịch giao diện mới: các mục tiếng H’Mông chưa duyệt tiếp tục dùng tiếng Việt.
- Tối ưu và xác nhận 60/100 người trên GPU thật; không cam kết 100 người. Xem `3D_PERFORMANCE.md`.
- Kiểm tra LIVE thật, quà chuỗi, reconnect, nhiều nguồn OBS, nguồn LIVE Studio và chạy lâu dài.

## Kiểm tra

```powershell
node scripts/check-hmong.mjs
node scripts/check-three.mjs
node scripts/browser-smoke.mjs --three
```

GLB/skeleton/animation và cả hai game cũ có kiểm tra tự động. Browser test kiểm tra model chuyển động, mapping quà, chống trùng user, hàng đợi khi spam, preview admin, Unicode và ảnh ngang/dọc. `--three-only` chỉ chạy phần 3D. Các bài này không đăng nhập TikTok.
