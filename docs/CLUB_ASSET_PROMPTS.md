# Prompt và nguồn asset club

Texture nét mặt mới và thay đổi model v3 được ghi tại [nhân vật v3](CHARACTER_REFINEMENT.md).

Công cụ: **imagegen tích hợp**, không dùng CLI/API key riêng. Hai ảnh người dùng gửi là tham chiếu; ảnh 1 là bản ruộng bậc thang cũ cần thay, ảnh 2 là nhóm 6 nhân vật trong club LED cần lấy phong cách. Không dùng hai raster này thay cho mesh nhân vật 3D.

## Phông club

File dự án: `public/assets/hmong/club/dance-hall.png`.

```text
Use case: stylized-concept. Generate a project-ready game environment BACKDROP asset, wide landscape 16:9 composition, high detail. Use ONLY the SECOND user reference image (six fashionable chibi Hmong-inspired performers on purple neon club stage) for its environment design. The first image with rice fields is the OLD scene to replace; do not use rice fields. Recreate the SECOND reference's empty indoor dance club, NO PEOPLE OR CHARACTERS: symmetrical grand midnight-indigo dance hall, concentric ornamental LED arches behind center stage, magenta cyan electric blue and warm gold geometric diamond embroidery-like LED bands, side balcony panels, overhead trusses and thin moving spotlight beams, central stylized golden bamboo mouth-organ sculptural centerpiece inspired by the reference. Large unobstructed central performance space in lower half, dark blue polished floor with restrained purple reflections. View directly toward back of stage from standing audience camera, moderate realistic perspective (not fisheye), polished high-end stylized 3D mobile-game art consistent with reference. Keep main decor at back, foreground empty to composite real animated 3D characters. No text, logos, watermarks or UI. This is a modern creative design based on supplied visual reference, not a claim of ethnographic accuracy.
```

## Texture vải

File dự án: `public/assets/hmong/club/embroidered-fabric.png`.

```text
Use case: stylized-concept. Asset type: seamless repeatable diffuse textile texture for actual animated 3D chibi costumes in a game. Use the SECOND user reference (six chibi Hmong-inspired club performers) as clothing palette/style reference only; ignore first image rice terrace screenshot. Flat orthographic closeup textile, fill entire square, no garment silhouette, no person, no perspective or lighting gradients, no text, no watermark. Deep midnight indigo woven cotton background with small extremely crisp ornate geometric embroidered diamonds, nested angular triangles, thin woven stripe borders and tiny stitch details in electric cyan, royal blue, violet, coral-magenta, pale silver and restrained warm gold. Modern stage-costume embroidery inspired by reference, not a documented authentic ethnic pattern. Repeating small-scale motifs with visible dark indigo negative space so it remains legible on jacket lapels, sleeves, pleated skirt hems, headbands and trouser borders. Texture must look like detailed woven embroidery, not glowing LEDs. Edges visually seamless tile.
```
