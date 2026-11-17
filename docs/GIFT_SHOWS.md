# Camera và màn diễn quà

Mở `/games/hmong-3d/dashboard.html`, thêm người thử, chọn người rồi bấm một trong 10 nút quà. Các nút gửi sự kiện quà giả lập qua cùng kênh với bảng tương tác hiện có, tới cả preview và display phòng local. Không gửi quà thật lên TikTok.

| Quà | giftId | Màn diễn | Giây |
|---|---:|---|---:|
| Rose | 5655 | Cận cảnh người tặng | 5 |
| TikTok | 5269 | Buồng đổi mẫu nhân vật | 15 |
| Heart Me | 7934 | Solo và vòng sáng | 7 |
| Finger Heart | 5487 | Xe chở vào, người xuống, xe rời đi | 10 |
| Rosa (10 xu) | 8913 | Trực thăng tới, hạ cánh, người xuống, bay đi | 12 |
| Peach (5 xu) | 10961 | Đôi cánh chuyển động | 8 |
| Hand Heart | 5660 | Đuốc lửa | 8 |
| Confetti | 5585 | Cả phòng ăn mừng | 9 |
| Tiny Diny (10 xu) | 6560 | Rồng đón người, bay vòng rồi trả về | 16 |
| Magic Feather (10 xu) | 1354579 | Cưỡi phượng bay vòng rồi trả về | 16 |

Quà combo TikTok chỉ được phát xuống game một lần khi `repeatEnd` kết thúc streak (theo tài liệu tiktok-live-connector). Ví dụ các cập nhật 1 → 2 → 3 và kết thúc x3 tạo đúng một sự kiện x3; quà không phải streak vẫn phát ngay. Tên sự kiện Socket.IO và cấu trúc payload không đổi.

Quà khác dùng cận cảnh, hoặc ăn mừng khi tổng giá trị combo từ 100 kim cương. giftId được ưu tiên trước tên quà. Bảng ánh xạ chuyển động nâng cao vẫn điều khiển phản ứng animation; màn diễn và camera là một lớp bổ sung độc lập.

Camera tự động có toàn cảnh, lia đám đông, vòng cung, hạ từ trên cao, cận người, sân khấu, lượn quanh phòng, góc cao và góc bên. Có thể tắt camera tự động và màn diễn bằng hai checkbox riêng. Thiết lập giảm chuyển động của hệ điều hành tắt camera lượn tự động. Chế độ benchmark cũng tắt camera tự động.

Màn diễn xếp FIFO tối đa 24 lượt chờ. Các quà cùng loại cho cùng người gộp vào màn đang diễn hoặc lượt đang chờ, không khởi động lại camera. Lượt chờ quá 30 giây tự bỏ; khi đầy bỏ lượt mới. Từ 3 lượt chờ, timeline chạy nhanh 1,35 lần; từ 6 lượt chờ chạy nhanh 1,8 lần, vẫn đi qua đầy đủ các giai đoạn đón khách. Người rời phòng bị bỏ lượt; màn đang chạy kết thúc nếu người đó biến mất. Sau màn diễn nhân vật quay về đội hình và điệu riêng đã chọn. Đổi mẫu nhân vật áp dụng tới khi người đó rời phòng. Cánh, đuốc và thú cưỡi tồn tại trong thời lượng màn diễn.

Phượng/rồng bay theo quỹ đạo trong vùng trống trước sân khấu, không dùng vị trí người xem làm tâm vòng bay xuyên ra sau phông. Màn quà được vẽ sau phòng với bộ đệm độ sâu riêng: nhân vật và thú cưỡi vẫn che khuất nhau đúng thứ tự, nhưng phông/cột/bàn DJ không cắt mất người nhận quà. Mặt phông ảnh chỉ là trang trí, không ghi độ sâu che nhân vật ở góc quay cao. Trạng thái render/layer được khôi phục ngay sau mỗi khung hình.

Camera tính khung theo giới hạn thực của nhân vật và phương tiện. Xe/trực thăng tạo khoảng trống trong đám đông, có bụi khi đến và âm thanh phanh/cánh quạt; hết màn đội hình tự khôi phục. Các góc tự động có đường đi riêng.

Dashboard nhớ camera, đội hình, kích thước, âm lượng, nhạc và ánh xạ quà trong localStorage của trình duyệt. Không lưu người giả lập hay hàng đợi. Preview luôn tắt tiếng; âm thanh thiết lập chỉ phát ở display.

Các mô hình hình học được dựng riêng trong `show-props.js`, không lấy tài nguyên/mã từ phòng tham khảo. Đây là xe và trực thăng; chưa có biến thể limousine, xe bay hoặc máy bay chiến đấu. Dùng lại 20 mẫu H’Mông 2.5D và sân khấu Three.js của dự án.

Kiểm tra:

```bash
node scripts/check-ride-visibility.mjs
node scripts/check-gift-streaks.mjs
node scripts/check-camera-shots.mjs
node scripts/check-dashboard-preferences.mjs
node scripts/check-gift-shows.mjs
node scripts/check-show-director.mjs
CHROME_PATH=/usr/bin/google-chrome node scripts/browser-smoke.mjs --occlusion-only
CHROME_PATH=/usr/bin/google-chrome node scripts/browser-smoke.mjs --shows-only
CHROME_PATH=/usr/bin/google-chrome node scripts/browser-smoke.mjs --dashboard-only
```

Kiểm tra trình duyệt xuất ảnh từng màn vào `artifacts/hmong-show-*.png`. TikTok LIVE thật và hiệu năng trong LIVE Studio cần kiểm tra trong phiên phát thực tế.

Bài `--occlusion-only` tái hiện phông đặc che hết nhân vật rồi so sánh pixel phần đầu và toàn bộ màn diễn với ảnh render không có vật cản. Kiểm tra phượng/rồng tại 9 mốc dọc màn 16 giây, từ sàn/bục, ở màn dọc/ngang.
