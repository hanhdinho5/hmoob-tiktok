# H'Mông TikTok Live

Game sàn nhảy 3D cho TikTok LIVE Studio: mỗi người xem là một nhân vật chibi H'Mông, điều khiển bằng bình luận, quà và tim. Express + Socket.IO, mỗi streamer là một room (room = username TikTok).

Chỉ có game H'Mông 3D này; game đua ngựa và crowd 2D cũ đã được xóa. Link cũ `/games/virtual-crowd/` được server chuyển hướng sang hmong-3d.

## Cấu trúc

```
src/
├── server.js                    # Express + Socket.IO (cổng 3000, đổi bằng PORT)
├── lib/                         # tiktokEventNormalizer, tiktokReconnectPolicy, displayControl, giftCatalog
└── services/                    # TikTokService (kết nối LIVE, tự nối lại), GiftCatalogService
public/
├── games/hmong-3d/
│   ├── dashboard.html + dashboard-simple.js   # Trang Điều khiển
│   ├── index.html + app.js                    # Trang Hiển thị (nhúng vào LIVE Studio)
│   ├── simulator.html                         # Giả lập
│   └── *.js                                   # stage, characters, gift-shows, show-director, camera-*, club-*, dance/beer/dressing commands...
├── lib/                         # tiktok-bridge, chat-commands, i18n, music-player, hmong-mc
├── locales/                     # vi.json, hmn.json, chat-commands.json
└── assets/                      # hmong/3d (.glb), hmong/club (atlas), audio, tiktok-gifts
scripts/                         # check-*.mjs (test Node), *-browser-checks.mjs (cần trình duyệt)
docs/                            # tài liệu chi tiết từng phần
```

## Lệnh

```bash
pnpm install
pnpm start        # node src/server.js
pnpm dev          # tự khởi động lại khi sửa
for f in scripts/check-*.mjs; do node "$f" || echo "FAIL $f"; done   # chạy toàn bộ test
```

Trang điều khiển: http://localhost:3000/games/hmong-3d/dashboard.html

## Luồng dữ liệu

```
TikTok LIVE → tiktok-live-connector → TikTokService → Socket.IO room → trang Hiển thị (event-router → game)
Trang Điều khiển → socket 'virtual-crowd-control' → server → trang Hiển thị
```

Sự kiện: `tiktok_chat`, `tiktok_gift`, `tiktok_like`, `tiktok_share`, `tiktok_connected`, `tiktok_disconnected`, `tiktok_reconnecting`, `tiktok_error`.

## Quy ước

- Tài liệu và giao diện bằng tiếng Việt; chuỗi hiển thị nằm trong `public/locales/`, không hard-code.
- Lệnh chat nằm trong `public/locales/chat-commands.json` (nam/nữ, nhảy 1-6, mời bia...).
- Sửa tính năng nào thì chạy script `check-*` liên quan, và cập nhật doc tương ứng trong `docs/`.
- Dữ liệu TikTok luôn qua `tiktokEventNormalizer` trước khi phát đi.

## Ranh giới

**Không:** commit `.env`, sửa `node_modules`, đổi tên sự kiện Socket.IO (client phụ thuộc).
**Hỏi trước:** thêm dependency, đổi cấu trúc sự kiện của `TikTokService`, đổi API `tiktok-bridge.js`.
