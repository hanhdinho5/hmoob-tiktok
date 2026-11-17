import fs from 'node:fs';
const report=JSON.parse(fs.readFileSync('artifacts/hmong-3d-performance.json','utf8'));
const rows=report.profiles.map(({count,samples})=>`| ${count} | ${(samples.reduce((sum,s)=>sum+s.fps,0)/samples.length).toFixed(1)} | ${samples[0].drawCalls} | ${samples[0].triangles} | ${samples.every(s=>s.allCharactersFramed)?'Có':'Chưa xác nhận'} |`);
fs.copyFileSync('artifacts/hmong-3d-performance.json','artifacts/hmong-2_5d-performance.json');
fs.writeFileSync('docs/2_5D_PERFORMANCE.md',`# Kiểm tra nhân vật 2.5D

Chrome headless, 960 × 540, DPR 1, làm nóng ít nhất 2,2 giây rồi lấy sáu mẫu cách nhau khoảng một giây. Renderer: ${report.environment.renderer}. Đây là GPU phần mềm SwiftShader; không dùng để cam kết FPS trên GPU thật hoặc trong OBS/LIVE Studio.

| Người | FPS trung bình | Draw calls | Tam giác | Camera bao đội hình |
|---|---|---|---|---|
${rows.join('\n')}

Đã kiểm tra thêm khung dọc 60 người, nhạc local, phản ứng quà, Unicode, chống trùng người và giới hạn queue. Giới hạn camera không bảo đảm mọi nhãn hoặc người không bị nhau/HUD che. Đây là kiểm tra ngắn, cần thử dài hạn và GPU thật trước khi live đông người.

[Số đo gốc](../artifacts/hmong-2_5d-performance.json). Ảnh: [6 người](../artifacts/hmong-3d-stage-desktop.png), [30 người](../artifacts/hmong-3d-crowd-30.png), [60 người](../artifacts/hmong-3d-crowd-60.png), [60 người dọc](../artifacts/hmong-3d-crowd-60-vertical.png).

Chạy lại: \`node scripts/browser-smoke.mjs --three-only\` rồi \`node scripts/report-sprites.mjs\`.
`);
console.log('Recorded 2.5D performance report.');
