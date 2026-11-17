# Nhân vật club v3

Model v3 bên dưới đã được thay trong chế độ mặc định bằng [nhân vật 2.5D](CHARACTERS_2_5D.md) theo lựa chọn người dùng. GLB cũ được giữ để đối chiếu.

Cập nhật theo yêu cầu: mặc định là **nhảy tự do**, nhân vật rải khắp sàn và di chuyển/xoay độc lập, áp dụng cả nhóm sáu người và crowd. Hàng/vòng tròn chỉ dùng khi chọn rõ trong bảng điều khiển. Camera bao cả phạm vi dịch chuyển; không tự ép người chơi vào hàng khi đông.

Tham chiếu: ảnh sáu nhân vật chibi người dùng gửi. Bản v3 làm lại mắt hạnh nhân, nét mặt, cằm, mảng tóc, phom áo và phụ kiện. Có tám mẫu nam/nữ, gồm áo chàm, áo trắng, áo gile, khăn thêu, tóc búi và tóc dài. Đây là model 3D cách điệu dựng bằng mã; chưa đạt độ chi tiết và chất lượng tạo hình như ảnh tham chiếu.

Sáu nhân vật biểu diễn cố định; chế độ crowd tạo người theo tương tác. Crowd tự giảm scale và bố trí hàng hoặc vòng tròn, góc máy tự bao đội hình. Bảng điều khiển có thanh kích thước 55–125%. Giới hạn mặc định 30; có thể cấu hình cao hơn nhưng cần đo GPU/OBS thực tế. Xem [kết quả kiểm tra](3D_PERFORMANCE.md).

Nguồn model: `scripts/club-model-design.mjs`, build bằng `node scripts/build-chibi-models.mjs`. File xuất: `public/assets/hmong/3d/*-club-v3.glb`. Các bộ phận là mesh có skeleton và animation; texture mặt không thay thế toàn bộ nhân vật bằng ảnh.

## Texture nét mặt

Công cụ: imagegen tích hợp, tham chiếu ảnh người dùng gửi. Hai PNG nền trong suốt dùng làm decal UV trên mesh mặt:

- `public/assets/hmong/club/male-face-v3.png`
- `public/assets/hmong/club/female-face-v3.png`

Prompt nam:

```text
Asset type: transparent facial-feature decal texture for a REAL 3D chibi male head mesh. Use attached image ONLY as style reference, first and third male performers' beautiful anime faces. ONLY features centered perfectly frontal flat orthographic square: refined almond-shaped large warm dark-brown eyes with violet brown iris gradients, small glossy catchlights, delicately tapered upper lash lines, thin expressive dark eyebrows, subtle rosy blush, tiny friendly closed smiling mouth. High-end polished cute chibi 3D mobile-game face, youthful adult. Almond not circular toy eyes, dark iris restrained sclera, forward not cross-eyed. TRUE transparency except actual marks; no skin block/head outline/nose/ears/hair/clothing/body/text/watermark/shadows. UV-mapped over rounded real 3D face, not a face-shaped skin plate or head illustration.
```

Prompt nữ cùng cấu trúc, đổi sang nữ và tham chiếu nhân vật thứ tư/thứ sáu; mắt nâu pha hồng tím, mi ngoài mảnh, lông mày thanh, má hồng nhẹ, nụ cười nhỏ, vẻ tự tin dịu dàng của người trưởng thành trẻ tuổi; không vương miện. Giữ yêu cầu nền trong suốt và chỉ có nét mặt.

Phông và vải tiếp tục dùng asset ghi tại [prompt club](CLUB_ASSET_PROMPTS.md). Ảnh kiểm tra nằm trong thư mục `artifacts/`.
