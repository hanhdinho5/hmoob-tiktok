import { validDJGift } from './dj-rules.js';
import { dashboardTikTokStatus } from './dashboard-connection.js';
import { restorePreferences, savePreferences } from './dashboard-preferences.js';
import { HmongMC } from '/lib/hmong-mc.js';
import { initDashboardPlayers } from './dashboard-players.js';
import { validGiftRules } from './event-router.js';
await HmongI18n.ready;
const t=(...args)=>HmongI18n.t(...args),$=id=>document.getElementById(id),socket=io(),preview=new BroadcastChannel('hmong3d-preview');
let localRoom=localStorage.getItem('hmong-local-control-room');
if(!/^local_[a-f0-9]{32}$/.test(localRoom||'')){localRoom=`local_${crypto.randomUUID().replaceAll('-','')}`;localStorage.setItem('hmong-local-control-room',localRoom);}
const response=await fetch('config.json');const config=await response.json();
const fields=['mode','theme','formation','variant','limit','characterScale','effects','sound','volume','animation','musicEnabled','musicVolume','musicTrack','cameraAuto','giftShows','musicLights','lightIntensity','djGiftName','djGiftId'];
try{const response=await fetch('/assets/audio/music/playlist.json');if(!response.ok)throw Error();const playlist=await response.json();for(const track of playlist.tracks||[]){const option=document.createElement('option');option.value=track.id;option.textContent=track.title;$('musicTrack').appendChild(option);}}catch{ $('notice').textContent=t('music.error'); }
$('username').value=new URLSearchParams(location.search).get('id')||localStorage.getItem('hmong-tiktok-username')||'';
for(const name of Object.keys(config.animations)){const option=document.createElement('option');option.value=name;option.textContent=t(`three.anim.${name}`);$('animation').appendChild(option);const button=document.createElement('button');button.textContent=t(`three.anim.${name}`);button.dataset.i18n=`three.anim.${name}`;button.addEventListener('click',()=>command('animation',{action:name,target:$('target').value}));$('animationButtons').appendChild(button);}
for(let index=0;index<config.characters.length;index++){const option=document.createElement('option');option.value=String(index);option.dataset.i18n=config.characters[index].nameKey;option.textContent=t(config.characters[index].nameKey);$('variant').appendChild(option);}$('characterScale').value=config.defaultCharacterScale??.85;$('mode').value=config.defaultMode||'crowd';$('animation').value='dance';restorePreferences(localStorage,fields,$,config);$('giftRules').value=JSON.stringify(config.giftRules,null,2);
if(!validDJGift({id:Number($('djGiftId').value),name:$('djGiftName').value.trim()})){$('djGiftId').value='0';$('djGiftName').value='GG';}
function username(){return $('username').value.trim().replace(/^@/,'').toLowerCase();}
function url(){const result=new URL('index.html',location.href);result.searchParams.set('lang',HmongI18n.language);result.searchParams.set('mode',$('mode').value);if(username())result.searchParams.set('id',username());result.searchParams.set('room',localRoom);return result.href;}
function notice(key){$('notice').textContent=t(key);}
let latestTikTokReport;
function refreshTikTokStatus(){const state=dashboardTikTokStatus(username(),latestTikTokReport);$('tiktokStatus').dataset.state=state.type;$('tiktokStatus').textContent=state.message;}
function showDisplayStatus(count){
 const status=$('displayStatus');status.dataset.connected=String(count>0);
 status.textContent=count>0?`Điều khiển overlay: Có ${count} trang hiển thị đang mở · Đây không phải trạng thái kết nối TikTok.`:'Điều khiển overlay: Chưa có trang hiển thị. Sao chép link vào LIVE Studio rồi tải lại nguồn web.';
 if(!count)latestTikTokReport=null;
 refreshTikTokStatus();
}
socket.on('display-status',event=>{if(event.room===localRoom)showDisplayStatus(event.displays);});
socket.on('tiktok-display-status',event=>{if(event.room!==localRoom)return;latestTikTokReport=event;refreshTikTokStatus();});
socket.on('disconnect',()=>{$('displayStatus').dataset.connected='false';$('displayStatus').textContent='Mất kết nối server · Lệnh chưa gửi được sang trang hiển thị';$('tiktokStatus').dataset.state='disconnected';$('tiktokStatus').textContent='Không xác nhận được trạng thái TikTok vì đã mất kết nối server';});
function refresh(){$('overlayUrl').textContent=url();$('displayLink').href=url();$('limitValue').textContent=$('limit').value;$('characterScaleValue').textContent=`${Math.round(Number($('characterScale').value)*100)}%`;}
function send(message){message={...message,controlId:crypto.randomUUID()};const frame=$('preview').contentWindow;if(message.action==='settings'&&frame.Hmong3D?.ready)frame.Hmong3D.settings({...message.payload.hmong3d,musicEnabled:false,mcEnabled:false,sound:false});else frame.Hmong3DEvents?.push('control',message);preview.postMessage(message);
 if(username()&&!/^[a-z0-9_.]{1,64}$/.test(username())){notice('home.invalidUsername');return;}
 socket.emit('virtual-crowd-control',{username:localRoom,...message},reply=>{if(!reply?.ok){notice('control.failed');return;}showDisplayStatus(reply.displays);});
 if(username())socket.emit('virtual-crowd-control',{username:username(),...message});}
function readSettings(){return {djGiftName:$('djGiftName').value.trim(),djGiftId:Number($('djGiftId').value),djGift:{id:Number($('djGiftId').value),name:$('djGiftName').value.trim()},musicLights:$('musicLights').checked,lightIntensity:Number($('lightIntensity').value),cameraAuto:$('cameraAuto').checked,giftShows:$('giftShows').checked,mode:$('mode').value,theme:$('theme').value,formation:$('formation').value,variant:$('variant').value,limit:Number($('limit').value),characterScale:Number($('characterScale').value),effects:$('effects').checked,sound:$('sound').checked,volume:Number($('volume').value),animation:$('animation').value,musicEnabled:$('musicEnabled').checked,musicVolume:Number($('musicVolume').value),musicTrack:$('musicTrack').value};}
preview.onmessage=event=>{if(event.data?.kind==='ready'){preview.postMessage({action:'settings',payload:{hmong3d:{...readSettings(),giftRules:config.giftRules}}});players.replay();}};
let timer;
function settings(){if(!validDJGift(readSettings().djGift)){$('djGiftStatus').textContent='Chọn tên/ID hợp lệ và khác quà đã có màn diễn (hoa, thay đồ, xe…).';return;}$('djGiftStatus').textContent='Quà DJ: '+$('djGiftName').value.trim()+' · 30 giây/lượt';savePreferences(localStorage,readSettings(),config.giftRules);refresh();clearTimeout(timer);timer=setTimeout(()=>send({action:'settings',payload:{hmong3d:{...readSettings(),giftRules:config.giftRules}}}),120);}
function command(command,extra={}){send({action:'test',payload:{type:'hmong3d',command,...extra}});}
for(const id of fields)$(id).addEventListener('input',settings);
function changeTrack(direction){const select=$('musicTrack');if(!select.options.length)return;select.selectedIndex=(select.selectedIndex+direction+select.options.length)%select.options.length;$('musicEnabled').checked=true;settings();}
$('musicNext').addEventListener('click',()=>changeTrack(1));$('musicPrevious').addEventListener('click',()=>changeTrack(-1));
$('username').addEventListener('input',()=>{localStorage.setItem('hmong-tiktok-username',username());refresh();refreshTikTokStatus();});
let catalog=[];
function renderGiftImage(){const gift=catalog.find(g=>g.id===Number($('djGiftId').value)),img=$('djGiftImage');img.hidden=!gift?.imageUrl;if(gift?.imageUrl)img.src=gift.imageUrl;else img.removeAttribute('src');}
$('djGiftImage').addEventListener('error',()=>{$('djGiftImage').hidden=true;});
$('djGiftId').addEventListener('input',renderGiftImage);
$('loadGiftCatalog').addEventListener('click',async()=>{
 const name=username();if(name&&!/^[a-z0-9_.]{1,64}$/.test(name)){$('djGiftStatus').textContent='Username TikTok không hợp lệ.';return;}
 $('loadGiftCatalog').disabled=true;$('djGiftStatus').textContent='Đang tải danh sách quà…';
 try{const response=await fetch('/api/gifts'+(name?'/'+encodeURIComponent(name):''),{signal:AbortSignal.timeout(12000)}),data=await response.json();if(!response.ok)throw Error(data.error||'Không tải được danh sách quà');catalog=data.gifts;
  $('djCatalog').replaceChildren(new Option('Chọn quà để lên DJ',''),...catalog.filter(g=>validDJGift({id:g.id,name:g.name})).map(g=>new Option(g.name+' · '+g.diamonds+' kim cương',String(g.id))));
  for(const button of document.querySelectorAll('[data-gift-id]')){const gift=catalog.find(g=>g.id===Number(button.dataset.giftId));if(!gift?.imageUrl)continue;button.querySelector('img')?.remove();const img=document.createElement('img');img.src=gift.imageUrl;img.alt='';img.width=32;img.height=32;img.referrerPolicy='no-referrer';img.addEventListener('error',()=>img.remove());button.prepend(img);}
  renderGiftImage();$('djGiftStatus').textContent='Đã tải '+catalog.length+' quà. Chọn quà DJ bên trên.';
 }catch(error){$('djGiftStatus').textContent=error.message;}finally{$('loadGiftCatalog').disabled=false;}
});
$('djCatalog').addEventListener('change',()=>{const gift=catalog.find(g=>g.id===Number($('djCatalog').value));if(!gift)return;$('djGiftName').value=gift.name;$('djGiftId').value=gift.id;renderGiftImage();settings();});
$('saveRules').addEventListener('click',()=>{try{const rules=JSON.parse($('giftRules').value);if(!validGiftRules(rules,config.animations))throw Error();config.giftRules=rules;settings();}catch{notice('three.invalidRules');}});

$('celebrate').addEventListener('click',()=>command('celebrate'));
$('clear').addEventListener('click',()=>command('clear'));
$('copy').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(url());notice('home.copied');}catch{notice('home.copyError');}});
$('open').addEventListener('click',()=>{window.open(url(),'_blank','noopener');setTimeout(settings,1800);});
window.addEventListener('languagechange',()=>{refresh();[...$('animation').options].forEach(option=>{option.textContent=t(`three.anim.${option.value}`);});});
window.addEventListener('pagehide',()=>{clearTimeout(timer);preview.close();socket.disconnect();},{once:true});
const players=initDashboardPlayers({config,readSettings,send,command});
socket.on('control-room-ready',event=>{if(event.room===localRoom&&event.socketId!==socket.id){send({action:'settings',payload:{hmong3d:{...readSettings(),giftRules:config.giftRules}}});players.replay();}});
const joinLocalControl=()=>socket.emit('join-control-room',localRoom,reply=>{if(reply?.ok){send({action:'settings',payload:{hmong3d:{...readSettings(),giftRules:config.giftRules}}});players.replay();}});socket.on('connect',joinLocalControl);if(socket.connected)joinLocalControl();
const sampleMC=new HmongMC({onChange:state=>{$('mcSample').disabled=!state.referenceReady;$('mcSample').textContent=state.audition?'Dừng nghe mẫu':'Nghe mẫu giọng nam tại đây';}});window.HmongDashboard.voiceSample=sampleMC;sampleMC.load();$('mcSample').addEventListener('click',()=>sampleMC.playReference());window.addEventListener('pagehide',()=>sampleMC.dispose(),{once:true});
HmongI18n.apply();refresh();
if(!$('displayStatus').textContent)showDisplayStatus(0);
