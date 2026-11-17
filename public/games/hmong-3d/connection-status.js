export function connectionStatus(type,data={},username=''){
 const name=username?`@${username.replace(/^@/,'')}`:'TikTok';
 const detail=String(data?.message||data?.reason||'').slice(0,240);
 const labels={
  connecting:`Đang kết nối TikTok ${name}… Tài khoản cần đang LIVE.`,
  connected:`ĐÃ KẾT NỐI TIKTOK ${name} · Đang nhận tương tác LIVE`,
  disconnected:`MẤT KẾT NỐI TIKTOK ${name} · Đang chờ kết nối lại`,
  reconnecting:`ĐANG KẾT NỐI LẠI TIKTOK ${name}${data?.attempt?` · Lần ${data.attempt}`:''}`,
  error:`CHƯA KẾT NỐI ĐƯỢC TIKTOK ${name}${detail?` · ${detail}`:' · Kiểm tra username và tài khoản có đang LIVE không.'}`,
  local:'CHẾ ĐỘ THỬ · Chưa nhập username, chưa kết nối TikTok',
 };
 return {type,username:String(username).replace(/^@/,'').trim().toLowerCase(),message:labels[type]||labels.error};
}
