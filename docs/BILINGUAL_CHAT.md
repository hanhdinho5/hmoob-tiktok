# Bình luận tiếng Việt và tiếng H’Mông

Nhận cả hai ngôn ngữ đồng thời, không phụ thuộc chọn Hmoob hay tiếng Việt trên giao diện. Đây là nhận diện câu/từ khóa cấu hình sẵn, không phải AI hiểu mọi câu hoặc tự dịch bình luận.

| Tiếng Việt | H’Mông do người dùng cung cấp | Phản ứng Virtual Crowd |
|---|---|---|
| Xin chào | Nyob zoo! | Vẫy tay 👋 |
| Cảm ơn | Ua tsaug! | Tim ❤️ |
| Tôi yêu bạn | Kuv hlub koj. | Tim ❤️ |
| Hẹn gặp lại / tạm biệt | Sib ntsib dua! | Vẫy tay 👋 |
| Bạn khỏe không? | Koj nyob li cas? | Mặt cười 😊 |

Bình luận khác vẫn được hiện trong bong bóng; không tự gán nghĩa. Các hiệu ứng bình luận cũ được giữ. Không phân biệt chữ hoa/thường, dấu câu cuối, khoảng trắng và dấu tiếng Việt. Giữ nguyên các chữ chỉ thanh ở cuối âm tiết H’Mông. Không tìm chuỗi con trong câu dài để tránh kích hoạt nhầm.


Sửa danh sách lệnh trong `public/locales/chat-commands.json`, không phải sửa game. Chỉ thêm câu H’Mông sau khi người bản địa xác nhận. Tải lại overlay sau khi sửa. Bình luận từ TikTok vẫn đi qua normalizer hiện tại (đang viết thường và cắt khoảng trắng); không có bước dịch sang ngôn ngữ khác.
