# Hai trang chính

1. **Điều khiển:** `/games/hmong-3d/dashboard.html` (mở `/` cũng vào đây).
2. **Hiển thị:** `/games/hmong-3d/index.html`; dùng nút **Sao chép** trên dashboard để lấy link đúng username/ngôn ngữ/chế độ cho TikTok LIVE Studio.

Dashboard chỉ giữ bốn phần: kết nối/link LIVE Studio; thêm người và tương tác thử; tặng quà bằng ảnh; nhạc nền. Có nút thêm 1 hoặc 10 người, xóa người thử, bình luận/thả tim để tạo người mới, chọn người tặng và số lượng quà. Bấm quà khi chưa chọn người sẽ tự thêm người tặng. Nhạc có chọn bài, bài trước/tiếp, phát/tạm dừng và âm lượng; thiết lập nhạc được ghi nhớ. Khung xem trước khởi đầu trống và luôn tắt tiếng.

Sau khi bật LIVE, nhập username rồi bấm **Kết nối TikTok** ngay cạnh ô nhập (hoặc Enter). Dashboard tự kết nối qua server và báo kết quả, không cần mở tab display để khởi tạo kết nối. Nếu lần trước chưa LIVE, bấm **Thử kết nối lại**. Giữ URL đã dán trong nguồn web LIVE Studio; nguồn đang mở với đúng username sẽ nhận sự kiện từ kết nối dùng chung. Nút bị khóa trong lúc chờ; các yêu cầu đồng thời dùng chung một lần kết nối và bấm thử lại không tăng trùng số client. Thay username sẽ rời phòng cũ ở dashboard. Kiểm tra: `node scripts/check-dashboard-connect.mjs`, `node scripts/browser-smoke.mjs --connect-only`.

Các bộ chỉnh đội hình, mẫu nhân vật, kích thước, camera, ánh sáng, JSON ánh xạ quà, nghe mẫu MC, chạy sự kiện tự động và các nút thử trùng lặp đã bỏ khỏi giao diện. Sân khấu dùng thiết lập mặc định: crowd tự do, camera tự động mượt, hiệu ứng và ánh sáng theo nhạc, các quà cố định theo hàng hướng dẫn. Username, mã phòng điều khiển, trạng thái TikTok/display, sao chép link và mở display vẫn giữ nguyên. Kiểm tra bằng `node scripts/browser-smoke.mjs --dashboard-only`.

Các thao tác giả lập cập nhật cả khung xem trước và trang hiển thị đang mở. Khi không nhập username, link có phòng điều khiển riêng qua server nên nguồn web trong LIVE Studio vẫn nhận lệnh dù chạy ở trình duyệt khác; không tạo kết nối TikTok để thử. Khi có username, control tới overlay của tài khoản qua Socket.IO như cũ. Quà thử chỉ tạo sự kiện trong game, không gửi/tặng quà thật lên TikTok. Các link cũ không có phòng riêng vẫn hỗ trợ điều khiển cùng trình duyệt.

Sau lần cập nhật này cần khởi động lại server để nạp kênh điều khiển phòng riêng: dừng phiên cũ bằng Ctrl+C rồi chạy `pnpm start`. Không chạy thêm một server trên cổng 3000 khi phiên cũ còn hoạt động.

Trang hiển thị ẩn nút điều khiển, thanh nhạc, nút MC và hướng dẫn quản trị. Nếu trình duyệt chặn phát âm thanh, có nút bật âm thanh để mở khóa. Khung xem trước tắt tiếng; nhạc chỉ phát ở display.

Nút **Xóa người thử** chỉ xóa đối tượng được tạo từ bảng giả lập, giữ người thật, kể cả khi tên tài khoản có tiền tố giống người thử. Nút dọn phòng cũ vẫn là thao tác dọn toàn bộ. Tương tác giả lập có định danh riêng; lựa chọn điệu qua bình luận vẫn gắn với người gửi và giữ sau phản ứng quà.

`simulator.html` là đường dẫn cũ chuyển thẳng về dashboard. Không còn trang giả lập riêng trong luồng sử dụng. Các tài nguyên và game cũ được giữ để tránh làm mất công việc trước đó, không được đưa vào điều hướng chính.

Kiểm tra: `node scripts/browser-smoke.mjs --dashboard-only`. Chrome headless dùng hai cửa sổ riêng để kiểm tra dashboard và display cùng render, thêm người, quà combo, đổi điệu riêng, rời phòng, không xóa người thật, đủ 20 mẫu, mobile không tràn ngang và chuyển hướng link cũ. Không cần kết nối TikTok thật cho bài thử này.

## Đổi nhân vật bằng bình luận

Người xem gõ đúng `nam` để chọn mẫu nam, `nữ` hoặc `nu` để chọn mẫu nữ. Chỉ đổi nhân vật của người gửi, giữ tên, vị trí và điệu nhảy đã chọn. Gửi lệnh khi chưa xuất hiện sẽ tạo nhân vật đúng lựa chọn; gửi lại cùng lệnh giữ mẫu hiện tại nếu đã đúng. Quà TikTok đổi mẫu sẽ chỉ chọn trong nhóm nam/nữ đã chọn. Có thể đổi lựa chọn bất cứ lúc nào, kể cả trong màn quà. Lựa chọn tồn tại trong lượt ở phòng hiện tại; rời phòng rồi vào lại sẽ chọn mới như trước. Chế độ sân khấu sáu nhân vật không nhận lệnh đổi cá nhân.

Kiểm tra: `node scripts/check-character-commands.mjs` và bài kiểm tra Chrome `--dashboard-only` (cả preview và display riêng).

## Sàn nhảy tự do và DJ

Chọn đội hình **Tự do · Đi quanh sàn & lên bục** để người chơi có điểm đến và tốc độ riêng, nhảy quanh sàn thay vì giữ một chỗ. Tối đa tám người cùng lên/xuống hoặc nhảy trên bục, chia các vị trí phía trước DJ. Người chơi bắt đầu đi lên sau 1–7 giây, nhảy trên bục 4–9 giây rồi xuống; nghỉ 4–10 giây trước lượt tiếp theo. Phía sau là DJ thường trực và bàn mixer; DJ mặc định không tính vào giới hạn crowd. Người tặng quà DJ có thể thay DJ mặc định theo lượt. Camera có góc riêng cho DJ.

Lệnh `đứng yên` dừng cả di chuyển; lệnh đổi điệu tiếp tục hoạt động. Màn quà tạm giữ chuyển động của người nhận và trả về vị trí trước màn diễn. Nếu đang trên bục, xe/trực thăng đón khách ở sàn dưới rồi trả nhân vật về bục. Đội hình **Theo hàng** và **Vòng tròn** vẫn giữ chỗ.

Kiểm tra chuyển động: `node scripts/check-crowd-motion.mjs`. Kiểm tra Chrome: `CHROME_PATH=/usr/bin/google-chrome node scripts/browser-smoke.mjs --motion-only`.

## Màn hình điện thoại

Preview luôn giữ tỷ lệ **9:16**, kể cả khi dashboard mở trên máy tính hoặc màn hình thấp. Chiều rộng và chiều cao cùng thu theo không gian có sẵn, không ép riêng chiều cao. Khi display là màn dọc, phòng và đường lên sân khấu hẹp/ngắn hơn; nhân vật giữ nguyên tỷ lệ. Camera tính khung dọc với khoảng đệm nhỏ hơn và các đường lia ngang nhẹ hơn, ưu tiên người chơi thay vì giữ trọn hai mép phòng. Bố cục ngang vẫn có không gian phòng rộng. Chữ sự kiện co giãn theo chiều rộng; góc trên/dưới chừa vùng tai thỏ và thanh điều hướng.

Kiểm thử Chrome `--motion-only` kiểm tra preview 9:16 ở 360×800, 390×844, 430×932 và desktop, đồng thời đo nhân vật trên khung 1080×1920 để tránh toàn cảnh thu nhỏ người chơi quá mức.

## Quán bia và mời bia

Hai nhà lớn nằm ngoài mép sàn, quán **BIA HƠI** bên trái và **PHÒNG THAY ĐỒ** bên phải; quán bia lớn hơn. Màn ngang có toàn cảnh hai nhà; màn điện thoại giữ camera gần sàn, chuyển tới quán khi có người lấy bia để không làm nhân vật quá nhỏ. Phông sân khấu vẫn là mặt tường trang trí phía sau; tường hai bên không ghi độ sâu che đầu người.

Tặng **Ice Cream Cone (ID 5827, 1 xu)**, hoặc dùng nút thử quà mời bia trên dashboard. Bình luận `mời bia` / `moi bia` cũng kích hoạt cùng hoạt cảnh. Cần ít nhất hai người đang nhảy. Người gửi đi xuống bậc thang nếu cần, vòng tới cửa quán, vào lấy hai cốc và trở ra mời một người khác. Hai người chạm cốc, uống, ném cốc ảo xuống đất rồi tự dọn và về vị trí/điệu đã chọn. Nút thử chỉ phát sự kiện trong game, không gửi quà thật.

Người nhận được chọn từ người đang nhảy, không chọn chính người gửi hoặc DJ trang trí. Cảnh dùng chung hàng đợi với quà; mỗi người có khoảng nghỉ 12 giây giữa các lệnh để tránh spam. Nếu một trong hai rời phòng, cảnh hủy và giải phóng người còn lại. Lệnh nam/nữ và điệu riêng vẫn được giữ sau cảnh. Phòng thay đồ hỗ trợ lệnh riêng, xem bên dưới.

Kiểm tra: `node scripts/check-beer-story.mjs`, `CHROME_PATH=/usr/bin/google-chrome node scripts/browser-smoke.mjs --beer-only`.

## Phòng thay đồ

Chat `thay đồ`, `thay do`, `đổi đồ` hoặc `đổi trang phục` để vào phòng bên phải, thay mẫu rồi bước ra với ánh đỏ và lời chúc mừng. Quà TikTok (ID 5269), hoặc nút thử màn đổi nhân vật trên dashboard, cũng chạy hoạt cảnh này. Nam chỉ đổi sang mẫu nam, nữ chỉ đổi sang mẫu nữ, kể cả khi chưa chat chọn giới tính. Nhân vật trở về vị trí và điệu nhảy đã chọn sau hoạt cảnh; các lượt dùng chung hàng đợi với màn quà.

## DJ khách mời và ảnh quà

Hoa giữ nguyên màn zoom. Quà DJ mặc định là `GG` (nhận theo tên); có thể chọn quà khác trong mục **Quà lên DJ**. Quà đã có màn diễn riêng không được dùng làm quà DJ. Bấm **Tải quà từ phòng LIVE** để lấy tên, ID, giá và ảnh từ TikTok: ưu tiên `availableGifts` của kết nối hiện có, nếu chưa live vẫn gọi được `fetchAvailableGifts()` mà không kết nối livestream. API `/api/gifts` hoặc `/api/gifts/:username` lưu danh sách trong bộ nhớ 5 phút và gộp các yêu cầu đồng thời. Chọn quà sẽ lưu ID và tên; khi có ID, hệ thống nhận đúng ID. Không cần đổi payload sự kiện TikTok.

Dải hướng dẫn ở đáy display có ảnh thật và giá quà: Rose 5655 → Zoom, Ice Cream Cone 5827 → Mời bia, TikTok 5269 → Thay đồ, GG 6064 → DJ. Cả bốn được xác nhận giá 1 xu từ API TikTok ngày 16/11/2026. Ảnh WebP và bản dữ liệu đã lấy trực tiếp được lưu ở `public/assets/tiktok-gifts/`; display hiện ngay bản này rồi cập nhật danh sách từ API. Không dùng emoji thay cho ảnh quà. Kiểm tra: `node scripts/check-cheap-gifts.mjs`.

Dải quà hiện đặt sát mép trên, chín mục trên một hàng, chỉ có ảnh thật và tên hành động ngắn. Ngoài bốn quà 1 xu, có Finger Heart (5487, 5 xu) → Xe; Rosa (8913, 10 xu) → Bay bằng trực thăng; Peach (10961, 5 xu) → Cánh; Tiny Diny (6560, 10 xu) → Rồng; Magic Feather (1354579, 10 xu) → Phượng. Các giá/ảnh được đối chiếu trực tiếp API TikTok ngày 16/11/2026. Các quà cũ Perfume, Doughnut/Donut, Dragon Crown, Colorful Wings vẫn kích hoạt màn diễn tương ứng để tương thích link/cấu hình cũ.

Người tặng quà DJ lên bàn mixer, biểu diễn 30 giây với sáu động tác luân phiên, rồi trở lại vị trí và điệu nhảy cũ (thêm 4 giây đi lên và 4 giây đi xuống). Mỗi người chỉ giữ một lượt DJ đang chạy hoặc đang chờ, combo không kéo dài lượt. Các lượt diễn dùng chung hàng đợi tối đa 24 mục, DJ không bị tăng tốc khi đông quà. Thời gian chờ quà khác được tạm dừng tính hết hạn trong lúc DJ đang diễn. DJ mặc định ẩn khi khách đứng bàn mixer và tiếp quản khi khách rời đi; DJ mặc định cũng đổi điệu mỗi 5 giây. Dashboard hiển thị tên DJ, thời gian còn lại và danh sách chờ. Tải lại server để nạp API danh sách quà, sau đó tải lại dashboard/display.

Kiểm tra: `node scripts/check-dj.mjs`, `node scripts/browser-smoke.mjs --dj-only`.

## Đồng bộ dashboard với LIVE Studio

Link display luôn có `room=local_…`, kể cả khi có `id=username`. Mã phòng điều khiển không đổi khi nhập username; username được lưu trong trình duyệt để mở lại dashboard không bị chuyển đích gửi lệnh. Dashboard gửi qua server tới phòng cố định, đồng thời hỗ trợ link username cũ. Mỗi lệnh có mã riêng để display/preview bỏ bản trùng khi nhận qua nhiều đường.

Trạng thái cạnh link báo số trang hiển thị đã kết nối sau khi tải game xong; iframe preview không được tính. Con số này có thể bao gồm trang display mở bằng trình duyệt, không chứng minh riêng LIVE Studio đã mở nguồn web. Khi không có trang nhận hoặc mất server, dashboard hiển thị hướng dẫn thay vì chỉ báo gửi thành công.

Sau khi cập nhật, khởi động lại server, tải lại dashboard, sao chép URL hiện tại và thay URL nguồn web trong LIVE Studio rồi tải lại nguồn. Thử một bình luận/quà giả lập và quan sát trực tiếp Studio. Kiểm tra đường truyền giữa các kết nối độc lập: `node scripts/check-display-control.mjs`.

## Display dọc và độ nét

Display luôn giữ khung 9:16, kể cả khi mở trên desktop (hai bên là vùng đen). Trong LIVE Studio đặt kích thước nguồn web **1080 × 1920**, dùng URL display từ nút Sao chép, không dùng URL dashboard hoặc chụp/phóng khung preview. Canvas display dựng tới 1080 × 1920 trên khung từ 360 px trở lên; preview riêng dựng khoảng 540 × 960 để giảm tải. Tỷ lệ điểm ảnh được tính lại khi đổi kích thước, không dùng giới hạn cũ 1.5 cho display. Quán bia và phòng thay đồ dọc thu gọn, tâm dịch từ ±4.65 vào ±3.85 và giữ mép nhà ngoài sàn đi lại.

Chỉ dashboard hiển thị đang kết nối, ĐÃ KẾT NỐI TIKTOK, mất kết nối, đang thử lại hoặc CHƯA KẾT NỐI ĐƯỢC kèm lý do. Nguồn display trên LIVE Studio luôn ẩn thông báo kết nối/lỗi để người xem không thấy thông tin quản trị. Display vẫn gửi trạng thái về dashboard qua phòng điều khiển. Kết nối trang hiển thị với server và kết nối TikTok là hai trạng thái riêng.

Kiểm tra: `node scripts/check-portrait-display.mjs`, `node scripts/browser-smoke.mjs --portrait-only`.

## Ưu tiên người chơi và tên trên điện thoại

Camera tập trung nhóm tối đa năm người gần nhau, đổi người dẫn khung khi sang đoạn quay mới để lần lượt bao quát cả phòng. Chu kỳ 40 giây gồm chính diện 8 giây, góc cao 7 giây, toàn cảnh chính diện 3 giây, gần vừa 8 giây, chính diện 7 giây và góc cao 7 giây. Không xoay nghiêng sang hai bên; camera giữ trong hành lang giữa sàn để tránh quán bia/phòng thay đồ che người. Góc cao nhìn xuống khoảng 49 độ, các góc có chuyển động tiến/lùi nhẹ. Toàn cảnh chuyển ngay về gần vừa để đọc tên. Camera chuyển mượt, giữ cùng nhóm suốt một đoạn quay. Có giới hạn kích thước người tiền cảnh và khoảng lùi bổ sung để tránh nhân vật đi ngang sát camera chiếm kín khung. Góc về sàn sau màn quà cũng trở lại chu kỳ này. Tắt camera tự động giữ góc trung đầu tiên; các màn quà vẫn có góc riêng.

Trong khung dọc, nhân vật giữ cùng tỷ lệ theo thiết lập kích thước, không thu nhỏ khi tăng số người. Tên người chơi là lớp chữ HTML được chiếu theo vị trí đầu sprite; cỡ chữ theo chiều rộng nguồn, nền tối và chữ trắng, không bị thu nhỏ theo độ sâu 3D và không tự ẩn chỉ vì phòng có hơn 12 người. Nhãn ngoài khung không hiện; nhãn gần nhau dịch lên để giảm chồng lấp. Phông nền giảm sáng và sàn dọc tắt phản chiếu để ưu tiên nhân vật. Feed bình luận phụ của game ẩn trên display vì TikTok đã có phần bình luận riêng.

Kiểm tra: `node scripts/check-player-readability.mjs` (kích thước nhân vật, lần lượt đủ người chơi, tỷ lệ chiếu tối thiểu 17% chiều cao khung và vị trí tên), `node scripts/browser-smoke.mjs --portrait-only` (giao diện thực tế).

Chuyển góc và chuyển nhóm được nội suy bằng đường cong tăng/giảm tốc trong 3.5 giây (2 giây khi đi ra toàn cảnh); vị trí và điểm nhìn liên tục cả lúc qua chu kỳ mới. Camera có giới hạn tốc độ và gia tốc để người mới vào hoặc đổi vị trí không kéo góc quay giật. Khi hệ điều hành bật giảm chuyển động, camera tự động vẫn luân phiên nếu người dùng bật chức năng này; không dùng nhánh đặt thẳng vị trí camera. Tắt **Camera tự chuyển góc** nếu muốn giữ góc tĩnh. Bộ đếm FPS không được dùng làm điều kiện đặt lại camera. Hai nhà bên hông chuyển thành lớp cắt mờ khi camera đi ngang để không che người chơi.

Kiểm tra chuyển động: `node scripts/check-camera-motion.mjs`; kiểm tra Chrome gồm chu kỳ 42 giây, giới hạn dịch chuyển/xoay, góc trái/phải/cao thật và lỗi thêm người trùng thời điểm reset FPS: `node scripts/browser-smoke.mjs --camera-only`. Ảnh các góc lưu trong `artifacts/hmong-camera-smooth-*.png`.
