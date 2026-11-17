import { dashboardTikTokStatus } from './dashboard-connection.js';
import { connectionStatus } from './connection-status.js';
import { CrowdSimulator } from './simulator-engine.js';
import { GUIDE_GIFTS } from './cheap-gifts.js';

await HmongI18n.ready;
const $=id=>document.getElementById(id);
const [config,playlist,catalog]=await Promise.all([
 fetch('config.json').then(r=>r.json()),
 fetch('/assets/audio/music/playlist.json').then(r=>r.json()).catch(()=>({tracks:[]})),
 fetch('/assets/tiktok-gifts/catalog.json').then(r=>r.json()),
]);
const preferencesKey='hmong-dance-preferences-v1';
let saved={};try{saved=JSON.parse(localStorage.getItem(preferencesKey)||'{}').settings||{};}catch{}
let localRoom=localStorage.getItem('hmong-local-control-room');
if(!/^local_[a-f0-9]{32}$/.test(localRoom||'')){localRoom='local_'+crypto.randomUUID().replaceAll('-','');localStorage.setItem('hmong-local-control-room',localRoom);}
$('username').value=new URLSearchParams(location.search).get('id')||localStorage.getItem('hmong-tiktok-username')||'';
const tracks=playlist.tracks||[];
for(const track of tracks)$('musicTrack').append(new Option(track.title,track.id));
if(tracks.some(track=>track.id===saved.musicTrack))$('musicTrack').value=saved.musicTrack;
let musicEnabled=typeof saved.musicEnabled==='boolean'?saved.musicEnabled:true;
$('musicVolume').value=Number.isFinite(saved.musicVolume)?Math.max(0,Math.min(1,saved.musicVolume)):.35;
const socket=io(),channel=new BroadcastChannel('hmong3d-preview');
let report=null,game=null,lastRoster='',closed=false;
let requestedUsername=null,connecting=false,connectionAttempt=0;
const variants=new Map();
function username(){return $('username').value.trim().replace(/^@/,'').toLowerCase();}
function url(){const value=new URL('index.html',location.href);value.searchParams.set('lang',HmongI18n.language);value.searchParams.set('mode','crowd');value.searchParams.set('room',localRoom);if(username())value.searchParams.set('id',username());return value.href;}
function notice(text){$('notice').textContent=text;}
function refreshStatus(){const state=dashboardTikTokStatus(username(),report);$('tiktokStatus').dataset.state=state.type;$('tiktokStatus').textContent=state.message;}
function displayStatus(count){$('displayStatus').textContent=count>0?`Điều khiển overlay: ${count} trang hiển thị đang mở.`:'Chưa có trang hiển thị. Dán link vào LIVE Studio để nhận hình và tương tác.';if(!count&&!requestedUsername)report=null;refreshStatus();}
function directStatus(type,data={}){if(!requestedUsername||requestedUsername!==username())return;report=connectionStatus(type,data,requestedUsername);refreshStatus();if(type==='connected'||type==='error'){connecting=false;$('connectTikTok').disabled=false;$('connectTikTok').textContent=type==='connected'?'Kết nối lại':'Thử kết nối lại';}}
function connectTikTok(){
 const name=username();if(!/^[a-z0-9_.]{1,64}$/.test(name)){notice('Nhập username TikTok hợp lệ trước khi kết nối.');$('username').focus();return;}
 if(connecting)return;requestedUsername=name;
 if(!socket.connected){directStatus('error',{message:'Chưa kết nối được server. Hãy kiểm tra server rồi thử lại.'});return;}
 const attempt=++connectionAttempt;connecting=true;$('connectTikTok').disabled=true;$('connectTikTok').textContent='Đang kết nối…';notice('');directStatus('connecting');
 socket.timeout(45000).emit('join-room',name,(error,reply)=>{
  if(attempt!==connectionAttempt||name!==username())return;
  if(error||!reply?.ok){directStatus('error',{message:error?'Kết nối mất quá lâu. Hãy bấm thử lại.':reply?.message||'Không kết nối được TikTok.'});return;}
  directStatus('connected');settings();
 });
}
$('connectTikTok').addEventListener('click',connectTikTok);
$('username').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();connectTikTok();}});
socket.on('room-joined',data=>{if(data.room===requestedUsername)directStatus('connected');});
socket.on('tiktok_connected',data=>directStatus('connected',data));socket.on('tiktok_disconnected',data=>directStatus('disconnected',data));socket.on('tiktok_reconnecting',data=>directStatus('reconnecting',data));socket.on('tiktok_error',data=>directStatus('error',data));socket.on('connection-error',data=>directStatus('error',data));
function refresh(){const link=url();$('overlayUrl').textContent=link;$('displayLink').href=link;$('musicToggle').textContent=musicEnabled?'⏸ Tạm dừng':'▶ Phát nhạc';$('musicVolumeValue').textContent=Math.round(Number($('musicVolume').value)*100)+'%';}
function readSettings(){return {mode:'crowd',formation:'free',theme:'club',variant:'auto',limit:config.maxCharacters,characterScale:config.defaultCharacterScale??.85,animation:'dance',cameraAuto:true,giftShows:true,effects:true,musicLights:true,lightIntensity:.8,sound:false,musicEnabled,musicTrack:$('musicTrack').value,musicVolume:Number($('musicVolume').value),djGift:{id:6064,name:'GG'}};}
function send(message){
 const outgoing={...message,controlId:crypto.randomUUID()},frame=$('preview').contentWindow;
 if(message.action==='settings'&&frame.Hmong3D?.ready)frame.Hmong3D.settings({...message.payload.hmong3d,musicEnabled:false,mcEnabled:false,sound:false});else frame.Hmong3DEvents?.push('control',outgoing);
 channel.postMessage(outgoing);
 socket.emit('virtual-crowd-control',{username:localRoom,...outgoing},reply=>{if(!reply?.ok){notice('Không gửi được lệnh. Kiểm tra server.');return;}displayStatus(reply.displays);});
 if(/^[a-z0-9_.]{1,64}$/.test(username()))socket.emit('virtual-crowd-control',{username:username(),...outgoing});
}
function settings(){send({action:'settings',payload:{hmong3d:readSettings()}});}
function command(command,extra={}){send({action:'test',payload:{type:'hmong3d',command,...extra}});}
function roster(){const signature=[...sim.users.keys()].join('|');if(signature===lastRoster)return;lastRoster=signature;const selected=$('testViewer').value;$('testViewer').replaceChildren(new Option('Tự thêm người mới',''),...[...sim.users.values()].map(user=>new Option(user.nickname,user.uniqueId)));if(sim.users.has(selected))$('testViewer').value=selected;}
const sim=new CrowdSimulator((event,data)=>{if(Number.isInteger(data.simulationVariant))variants.set(data.user.uniqueId,data.simulationVariant);command('simulateEvent',{event,data});},{variantCount:config.characters.length,characterIds:config.characters.map(c=>c.id),idPrefix:'dashboard_sim_'+crypto.randomUUID().replaceAll('-','').slice(0,12),onLog:roster});
function addEvent(type,extra={}){
 if(sim.users.size>=config.hardLimit){notice('Đã đạt giới hạn người thử. Xóa người thử trước khi thêm.');return;}
 const user=sim.createUser();sim.event(type,{...extra,user,simulationVariant:(sim.serial-1)%config.characters.length});return user;
}
function replay(){for(const user of sim.users.values())command('simulateEvent',{event:'member',data:{user,simulationVariant:variants.get(user.uniqueId)}});}
const actions={join:()=>sim.join(),join10:()=>sim.join(10),chat:()=>{const comment=$('testComment').value.trim();if(comment)addEvent('chat',{comment});},like:()=>addEvent('like',{likeCount:10}),reset:()=>{sim.stop();sim.users.clear();variants.clear();roster();command('clearTestViewers');}};
document.querySelectorAll('[data-action]').forEach(button=>{button.disabled=true;button.addEventListener('click',()=>actions[button.dataset.action]?.());});
$('testComment').addEventListener('keydown',event=>{if(event.key==='Enter'){event.preventDefault();actions.chat();}});
for(const rule of GUIDE_GIFTS){
 const gift=catalog.gifts.find(g=>g.id===rule.id),button=document.createElement('button');button.disabled=true;button.dataset.giftId=String(rule.id);
 const image=document.createElement('img');image.src=gift.localImage||gift.imageUrl;image.alt=gift.name;
 const label=document.createElement('span'),action=document.createElement('strong'),detail=document.createElement('small');action.textContent=rule.action;detail.textContent=`${gift.name} · ${gift.diamonds} xu`;label.append(action,detail);button.append(image,label);
 button.addEventListener('click',()=>{let user=sim.users.get($('testViewer').value);if(!user){user=addEvent('member');if(!user)return;$('testViewer').value=user.uniqueId;}
  sim.interact('gift',user.uniqueId,{giftId:gift.id,giftName:gift.name,giftValue:gift.diamonds,repeatCount:Math.max(1,Math.min(100,Math.round(Number($('testGiftCount').value)||1)))});
 });$('giftShowButtons').append(button);
}
function saveMusic(){try{const prior=JSON.parse(localStorage.getItem(preferencesKey)||'{}');localStorage.setItem(preferencesKey,JSON.stringify({...prior,version:1,settings:{...prior.settings,musicEnabled,musicTrack:$('musicTrack').value,musicVolume:Number($('musicVolume').value)}}));}catch{}refresh();settings();}
$('musicToggle').addEventListener('click',()=>{musicEnabled=!musicEnabled;saveMusic();});
function changeTrack(step){if(!tracks.length)return;const select=$('musicTrack');select.selectedIndex=(select.selectedIndex+step+tracks.length)%tracks.length;musicEnabled=true;saveMusic();}
$('musicPrevious').addEventListener('click',()=>changeTrack(-1));$('musicNext').addEventListener('click',()=>changeTrack(1));$('musicTrack').addEventListener('change',()=>{musicEnabled=true;saveMusic();});$('musicVolume').addEventListener('input',saveMusic);
$('username').addEventListener('input',()=>{if(requestedUsername&&requestedUsername!==username()){socket.emit('leave-room',requestedUsername);requestedUsername=null;report=null;connecting=false;connectionAttempt++;$('connectTikTok').disabled=false;$('connectTikTok').textContent='Kết nối TikTok';}localStorage.setItem('hmong-tiktok-username',username());refresh();refreshStatus();});
$('copy').addEventListener('click',async()=>{if(username()&&!/^[a-z0-9_.]{1,64}$/.test(username())){notice('Username không hợp lệ.');return;}try{await navigator.clipboard.writeText(url());notice('Đã sao chép link. Dán vào nguồn web 1080 × 1920 trong LIVE Studio.');}catch{notice('Chưa sao chép được. Bạn có thể sao chép đường link bên dưới.');}});
$('open').addEventListener('click',()=>window.open(url(),'_blank','noopener'));
socket.on('display-status',event=>{if(event.room===localRoom)displayStatus(event.displays);});socket.on('tiktok-display-status',event=>{if(event.room===localRoom&&!requestedUsername){report=event;refreshStatus();}});
socket.on('disconnect',()=>{connecting=false;connectionAttempt++;$('connectTikTok').disabled=false;$('connectTikTok').textContent='Thử kết nối lại';report=requestedUsername?connectionStatus('disconnected',{message:'Mất kết nối server'},requestedUsername):null;refreshStatus();$('displayStatus').textContent='Mất kết nối server. Lệnh chưa được gửi sang display.';});
socket.on('control-room-ready',event=>{if(event.room===localRoom&&event.socketId!==socket.id){settings();replay();}});
const join=()=>socket.emit('join-control-room',localRoom,reply=>{if(reply?.ok){settings();replay();}});socket.on('connect',()=>{join();if(requestedUsername)connectTikTok();});if(socket.connected)join();
channel.onmessage=event=>{if(event.data?.kind==='ready'){settings();replay();}};
const monitor=setInterval(()=>{
 const current=$('preview').contentWindow.Hmong3D;if(!current?.ready)return;
 if(current!==game){game=current;game.settings({...readSettings(),musicEnabled:false,mcEnabled:false,sound:false});document.querySelectorAll('[data-action], [data-gift-id]').forEach(button=>button.disabled=false);replay();}
 const stats=game.stats();$('testStats').textContent=`${stats.characters} người · ${stats.showQueue||0} lượt quà chờ`;
 if(!stats.queue&&!stats.pendingSpawns){const present=new Set(game.snapshot().map(item=>item.key));for(const key of sim.users.keys())if(!present.has(key)){sim.users.delete(key);variants.delete(key);}roster();}
},350);
window.HmongDashboard={sim,get ready(){return !!game;}};
window.addEventListener('languagechange',refresh);
window.addEventListener('pagehide',()=>{if(closed)return;closed=true;clearInterval(monitor);sim.stop();channel.close();socket.disconnect();},{once:true});
refresh();displayStatus(0);
