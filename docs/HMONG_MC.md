# MC H’Mông — dùng giọng nam trước

Trong luồng hai trang mới, nút nghe/dừng mẫu nam nằm ở phần âm thanh của dashboard; trang hiển thị ẩn các nút quản trị. Chức năng nghe mẫu tại dashboard không phát trùng trong khung xem trước.

Theo yêu cầu mới nhất, chọn **giọng nam** từ mẫu `T1R-MB6tEH4-first30.wav`. Giao diện có nút nghe/dừng mẫu nam, giảm nhạc khi nghe và khôi phục khi dừng. Mẫu thu chưa được gắn vào sự kiện chào/cảm ơn vì chưa xác minh nội dung từng câu; không bật nhầm cả đoạn kể chuyện khi có người vào hoặc tặng quà. Không có chức năng nhân bản giọng/TTS tạo câu mới trong dự án hiện tại. Các ghi chú yêu cầu giọng nữ bên dưới là lịch sử trước khi người dùng đổi lựa chọn.

Đã tải mẫu giọng 00:00–00:30 từ video `T1R-MB6tEH4` theo yêu cầu và xác nhận được phép của người dùng. File: `public/assets/audio/mc/reference/T1R-MB6tEH4-first30.wav`; nguồn và hash nằm trong `reference/reference.json`. Đây là mẫu tham chiếu, chưa phải các câu chào/cảm ơn và chưa tạo giọng tổng hợp. Chưa xác minh nội dung, phương ngữ hoặc độ sạch của giọng trong đoạn này.

Người dùng đã chọn Hmoob Dawb. Hiện **chưa có các câu MC dùng để phát theo sự kiện**, đã có mẫu tham chiếu giọng riêng. Không tự dùng giọng tiếng Việt/Anh đọc chữ H’Mông hoặc tuyên bố giọng máy là chuẩn bản ngữ.

Thu từng câu thành một file riêng, cùng một MC nữ, giọng tự nhiên, không nhạc nền. Các câu dưới đây lấy từ ví dụ của người dùng; người thu có thể sửa cho tự nhiên theo phương ngữ đã chọn.

| File đề xuất | Lời H’Mông | Nghĩa / tình huống |
|---|---|---|
| welcome.mp3 | Nyob zoo! | Chào khi vào phòng hoặc bình luận chào |
| thanks.mp3 | Ua tsaug! | Cảm ơn quà, lượt thích, chia sẻ |
| specialGift.mp3 | Ua tsaug! | Cảm ơn quà lớn; có thể cung cấp câu dài hơn và nghĩa Việt |
| wellbeing.mp3 | Kuv nyob zoo. | Trả lời “Bạn khỏe không?” |
| love.mp3 | Kuv hlub koj. | Phản hồi tình cảm |
| goodbye.mp3 | Sib ntsib dua! | Hẹn gặp lại |

Đặt file trong `public/assets/audio/mc/`. Điền `src` tương ứng vào `manifest.json`, ví dụ `/assets/audio/mc/welcome.mp3`. Ghi tên MC, xác nhận giọng nữ Hmoob Dawb bằng `speaker.nativeVerified: true`; đánh dấu `reviewed: true` cho từng lời thu đã nghe kiểm tra. Các cờ ghi nhận kiểm tra thực tế, không tự làm giọng chuẩn hơn. Có thể chỉ cung cấp hai file chào/cảm ơn trước; các câu còn thiếu không phát.

- Phát câu thu sẵn theo sự kiện, độc lập ngôn ngữ giao diện. Không đọc tên người hoặc mọi bình luận bằng TTS; chỉ phản hồi ý định Việt/H’Mông đã nhận diện.
- Chỉ một câu tại một thời điểm; queue tối đa 4, hết hạn sau 20 giây; ưu tiên quà, có khoảng nghỉ để không lặp liên tục.
- Nhạc hạ xuống 25% âm lượng đã chọn khi MC nói, khôi phục khi kết thúc/lỗi/tắt MC. Không tự bật nhạc đang tạm dừng.
- Bấm vào trang để cho phép âm thanh. Nút MC độc lập với nút hiệu ứng; thêm `mc=0` trong URL để tắt. Preview quản trị và benchmark luôn im tiếng MC.
- Chưa có thu âm thì giao diện hiển thị rõ “chưa có bản thu nữ”. Chưa có sự kiện follow backend nên chưa tự cảm ơn follow.

Kiểm tra: `node scripts/check-mc.mjs`, `node scripts/check-music.mjs`, `node scripts/browser-smoke.mjs --three-only --no-benchmark`. Kiểm tra mô phỏng không xác nhận chất lượng phát âm; cần nghe bản thu thật sau khi người dùng cung cấp.
