export function dashboardTikTokStatus(username,report){
 const name=String(username||'').trim().replace(/^@/,'').toLowerCase();
 if(!name)return {type:'local',message:'TikTok: Chưa nhập username — chưa kết nối TikTok.'};
 if(!report||report.username!==name)return {type:'connecting',message:`TikTok @${name}: Chưa xác nhận kết nối. Bấm “Kết nối TikTok” để bắt đầu.`};
 return {type:report.type,message:report.message};
}
