# Nguồn tài nguyên 3D và tình trạng tích hợp

**Hiện tại:** người dùng đã chọn [8 nhân vật 2.5D](CHARACTERS_2_5D.md) trên sân khấu 3D để ưu tiên giống ảnh. Các GLB bên dưới là tài nguyên cũ được giữ lại, không phải hình thức mặc định.

**Bản club hiện tại:** 6 model `*-club-v2.glb` được dựng bởi `scripts/club-model-design.mjs`; phông LED và texture vải được tạo bằng imagegen tích hợp theo ảnh người dùng. Xem [nguồn/prompt](CLUB_ASSET_PROMPTS.md) và [thay đổi đường dẫn](DANCE_CLUB_UPGRADE.md). 4 GLB prototype cũ được giữ lại để đối chiếu.

| Tài nguyên | Nguồn / giấy phép | Tích hợp |
|---|---|---|
| Three.js | [Kho chính thức / MIT](https://github.com/mrdoob/three.js/blob/dev/LICENSE), package 0.187.0 ghim bằng pnpm | Có |
| 4 Chibi GLB | Geometry và clip tạo riêng trong `scripts/build-chibi-models.mjs`, theo giấy phép MIT khai báo của repository | Có, **prototype chưa duyệt văn hóa** |
| Núi, ruộng, sân, nhà, cây, đèn | Geometry trong `stage.js`, theo giấy phép repository | Có, minh họa tổng quát |
| [Kenney Animated Characters Protagonists](https://kenney.nl/assets/animated-characters-protagonists) | Trang chính thức ghi CC0; mẫu nhân vật có tạo hình khác mục tiêu H’Mông | Đã đánh giá nguồn, chưa tải/tích hợp |
| [Kenney Toon Characters](https://kenney.nl/assets/toon-characters) | Trang chính thức ghi CC0; cần kiểm tra rig/clip trên file thực | Chưa tải/tích hợp |
| [Mixamo / Adobe FAQ](https://helpx.adobe.com/creative-cloud/faq/mixamo-faq.html) | Adobe nêu character/animation dùng royalty-free trong dự án cá nhân/thương mại; cần tài khoản và kiểm tra điều khoản khi lấy tài nguyên | Chưa đăng nhập/tải/tích hợp; không phải asset CC0 có thể mặc định phân phối lại độc lập |
| Sketchfab | Chỉ chọn từng model có license rõ ràng; chưa xác minh được bộ chibi địa phương và rig phù hợp | Chưa tải/tích hợp |
| Ready Player Me | Không chọn API avatar cloud làm phụ thuộc cho demo; chưa xác minh được đường cung cấp/điều khoản hiện hành từ nguồn gốc | Chưa tích hợp |

Không lấy model không rõ quyền sử dụng, không đổi tên model chung thành trang phục truyền thống đã xác minh. Mẫu hiện tại dùng chàm/đỏ, hình khối khăn/váy/phụ kiện để thử pipeline; không có kết luận rằng chúng là mẫu phục trang chuẩn Mù Cang Chải.

## Cơ sở kỹ thuật

- [GLTFLoader chính thức](https://threejs.org/docs/pages/GLTFLoader.html): tải GLB/GLTF và đọc animations.
- [AnimationMixer chính thức](https://threejs.org/docs/pages/AnimationMixer.html): mixer riêng cho mỗi instance.
- [SkeletonUtils chính thức](https://threejs.org/docs/pages/module-SkeletonUtils.html): clone cây node cùng skeleton đúng binding; mesh clone dùng lại geometry/material.

Không cần plugin trả phí, API tạo avatar hoặc tài khoản bên ngoài để chạy demo local.
