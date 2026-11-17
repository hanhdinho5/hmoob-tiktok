# Mục tiêu tạo hình theo ba ảnh cận cảnh

Người dùng đã chọn 2.5D. Đã tích hợp atlas tám nhân vật thay model mặc định; xem [bản 2.5D](CHARACTERS_2_5D.md). Các ghi chú bên dưới mô tả giai đoạn thiết kế trước lựa chọn này.

Ảnh thiết kế mới: `public/assets/hmong/concepts/three-character-target-v4.png`, tạo bằng **imagegen tích hợp**, dựa trên ba ảnh cận cảnh người dùng gửi. Đã xem ảnh kết quả: tóc, phom quần áo và chi tiết gần mục tiêu hơn model mã hiện tại. Kết quả có nền studio; chưa phải sprite nền trong suốt sẵn dùng. Không gắn ảnh này thay model trong game.

Người dùng chưa chấp nhận model hiện tại. Không coi việc chạy được animation hoặc kiểm tra kỹ thuật là bằng chứng đạt chất lượng tạo hình.

Ba mẫu cần đối chiếu:

1. Nam áo chàm: tóc xoăn rẽ ngôi nhiều lớp, mắt nâu lớn và mặt thanh; áo khoác mở có viền thêu nhỏ, đai và dải buông, quần rộng có nếp rủ, sneaker xanh trắng.
2. Nữ khăn thêu: tóc dài gợn, khăn có hạt/đồng bạc rủ, hoa tai bạc; áo lửng, váy xếp ly nhiều lớp, đai bạc, xà cạp thêu, sneaker trắng.
3. Nam áo trắng: tóc rối mềm và băng trán thêu, áo trắng phối gile/viền chàm, đai và dải vải dài, quần rộng, sneaker đen trắng.

Tỷ lệ mục tiêu khoảng 3,5–4 đầu, tay chân dài và thanh hơn model hiện tại. Tóc phải có lọn bất quy tắc, vải có phom và nếp; họa tiết nhỏ có khoảng nền chàm. Không dùng tóc dạng mũ trơn hoặc các múi đều nhau.

Ảnh dựng bằng imagegen chỉ là bản thiết kế raster. Nó không có skeleton, góc nhìn khác hay chuyển động múa của model 3D. Chưa đổi renderer nhân vật sang 2.5D khi người dùng chưa chọn. Chế độ nhảy tự do hiện có được giữ.

Nếu giữ 3D thật: cần model được tạo hình, UV và rig phù hợp rồi tích hợp vào GLTFLoader/AnimationMixer. Dựng lại bằng các khối đơn giản như hiện tại chưa đạt mục tiêu. Nếu người dùng chấp nhận 2.5D: có thể dùng asset ảnh nền trong suốt, nhưng phải nói rõ hạn chế xoay và animation.

## Prompt đã dùng

```text
Use case: stylized-concept. Deliver one very high-quality transparent-background CHARACTER DESIGN LINEUP, three separate full-body characters with generous clear gaps, no stage, no typography, no watermark. The three attached user crops are the exact visual design references: first is the indigo-jacket male, second the ornate headdress female, third the white-shirt male. Recreate those three youthful adult Hmong-inspired chibi performers with close adherence to their reference silhouettes and costumes, not generic dolls. Premium polished cinematic 3D-render LOOK, beautiful expressive large brown-violet almond eyes, small refined nose and smile, delicately tapered face, natural soft skin shading, dark hair sculpted as many fine irregular wavy overlapping strands, never a smooth helmet or parallel sausage ridges. Body proportions approximately 3.5 to 4 heads tall as in references, slim articulated limbs and detailed hands and high-top sneakers. LEFT: handsome dark wavy side-part male, open midnight-indigo embroidered jacket with fine bright cyan pink silver geometric trim and dark inner shirt, embroidered belt and long hanging sashes, voluminous draped dark trousers gathered at ankles, dark blue white-soled detailed high tops, cheerful finger-heart/point gesture. CENTER: beautiful long dark wavy-haired female, richly embroidered rounded Hmong-inspired headdress with dangling fine silver coins and pink pompom accents, delicate silver earrings and collar, cropped indigo embroidered long-sleeve top exposing a small midriff, richly pleated flared embroidered skirt with black underskirt, layered silver waist coins, embroidered leg warmers and white high-top sneakers, graceful hand on waist and another relaxed outward, smiling. RIGHT: handsome tousled layered wavy-haired male with embroidered headband, white sleeves and white shirt framed by indigo embroidered vest/collar, embroidered waist belt and long patterned apron sash, draped dark baggy pants, black-white high tops, friendly dancing gesture with one knee lightly bent. Match fabric richness, balanced navy negative space, vivid small embroidered patterns, hair softness and expressive faces from the references. Studio soft key and subtle restrained cool magenta rim light, no nightclub environment baked in. All three fully visible from headgear to shoe sole, same scale and shared ground baseline, front three-quarter view. True alpha transparency around every silhouette, no ground plane or baked drop shadows. This is a visual design sheet for reviewing target artwork, not a claim to be an actual rigged 3D model.
```
