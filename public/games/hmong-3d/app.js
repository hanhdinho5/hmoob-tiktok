import { GiftGuide } from './cheap-gifts.js';
import { ResidentDJ } from './resident-dj.js';
import { connectionStatus } from './connection-status.js';
import { ShowDirector } from './show-director.js';
import { Renderer } from './renderer.js';
import { Characters } from './characters.js';
import { EventRouter, validGiftRules } from './event-router.js';
import { MusicPlayer } from '/lib/music-player.js';
import { HmongMC } from '/lib/hmong-mc.js';

const t=(...args)=>HmongI18n.t(...args),params=new URLSearchParams(location.search);
const $=id=>document.getElementById(id);
let rendering,characters,router,config,frameId,previewChannel,controlSocket,music,mc,director,dj,disposed=false;
const timers=[];const giftGuide=new GiftGuide($('giftGuide'));giftGuide.load(params.get('id')||params.get('username')||'');
let latestConnection;
function reportConnection(type,data={}){
 latestConnection=connectionStatus(type,data,params.get('id')||params.get('username')||'');
 const element=$('connection');element.removeAttribute('data-i18n');element.dataset.state=type;element.textContent=latestConnection.message;
 const room=params.get('room');if(controlSocket?.connected&&room)controlSocket.emit('display-tiktok-status',{room,...latestConnection});
}
const settings={mode:params.get('mode')==='stage'?'stage':'crowd',theme:'club',formation:'free',effects:true,sound:false,volume:.35,animation:'dance'};
const sound=new CrowdSoundFX({enabled:false,volume:settings.volume});
function status(key){$('connection').dataset.i18n=key;$('connection').textContent=t(key);}
function feed(kind,values){const line=document.createElement('p');line.textContent=kind==='chat'?`${values.name}: ${values.comment}`:t('crowd.gift',{emoji:'🎁',...values});$('feed').prepend(line);while($('feed').children.length>5)$('feed').lastElementChild.remove();}
function applySettings(next={}){
 music?.apply(next);director?.settings(next);giftGuide.configure(director?.djGift);rendering?.stage.lighting.configure(next);
 if(typeof next.mcEnabled==='boolean')mc?.setEnabled(next.mcEnabled);
 if(next.giftRules&&validGiftRules(next.giftRules,config.animations))config.giftRules=next.giftRules;
 if(next.mode&&next.mode!==characters.mode&&['stage','crowd'].includes(next.mode)){director?.clear();settings.mode=next.mode;characters.setMode(next.mode);}
 if(['club','royal','terraces','evening'].includes(next.theme)){settings.theme=next.theme;rendering.stage.setTheme(next.theme);}
 if(['free','rows','circle'].includes(next.formation)){settings.formation=next.formation;characters.setFormation(next.formation);}
 if(next.limit!==undefined)characters.setLimit(next.limit);
 if(next.variant==='auto'||Number.isInteger(Number(next.variant))&&Number(next.variant)>=0&&Number(next.variant)<config.characters.length)characters.variant=next.variant;
 if(next.characterScale!==undefined)characters.setScale(next.characterScale);
 if(typeof next.effects==='boolean')settings.effects=next.effects;
 if(typeof next.sound==='boolean'){settings.sound=next.sound;sound.setEnabled(next.sound);}
 if(next.volume!==undefined&&Number.isFinite(Number(next.volume))){settings.volume=Math.max(0,Math.min(1,Number(next.volume)));sound.setVolume(settings.volume);}
 if(Object.hasOwn(config.animations,next.animation)&&next.animation!==settings.animation){settings.animation=next.animation;characters.base=next.animation;for(const item of characters.items.values())if(!item.selectedDance)item.animation.setBase(next.animation);}
 $('djHint').textContent='🎧 Tặng '+(director?.djGift.name||'GG')+' → lên DJ 30 giây · 🌹 Hoa → zoom gần';
 $('modeName').textContent=t(characters.mode==='stage'?'three.stageMode':'three.crowdMode');
 $('sound').textContent=t(sound.enabled?'crowd.soundOn':'crowd.soundOff');
 if(music)$('musicVolume').value=music.audio.volume;
}
function control(message){
 if(message.action==='settings'&&message.payload?.hmong3d)applySettings(message.payload.hmong3d);
 if(message.action!=='test'||message.payload?.type!=='hmong3d')return;
 const {command,action,target,data,event}=message.payload;
 if(command==='simulateEvent'&&['member','chat','like','share','gift','simulationLeave'].includes(event)&&/^dashboard_sim_[a-z0-9_]{1,60}$/.test(data?.user?.uniqueId||'')){
  const key=characters.key(data.user),existing=characters.items.get(key),waiting=characters.pending.get(key);
  if(event==='simulationLeave'){if(existing?.simulated||waiting?.simulated)characters.removeViewer(data.user);return;}
  if(existing&&!existing.simulated)return;
  if(characters.mode!=='crowd')applySettings({mode:'crowd'});
  router.route(event,data);
  const pending=characters.pending.get(key);if(pending){pending.simulated=true;if(Number.isInteger(data.simulationVariant)&&data.simulationVariant>=0&&data.simulationVariant<config.characters.length)pending.simulationVariant=data.simulationVariant;}
 }
 if(command==='clearTestViewers'){
  for(const[key,item]of [...characters.items,...characters.pending])if(item.simulated)characters.removeViewer({uniqueId:key});
 }
 if(command==='animation'&&Object.hasOwn(config.animations,action))characters.act(action,target==='all'?'all':Math.max(0,Math.min(5,Number(target)||0)));
 if(command==='gift')router.route('gift',data||{user:{uniqueId:'preview',nickname:t('three.previewViewer')},giftName:'Rose',giftValue:1,repeatCount:1});
 if(command==='clear'){director?.clear();characters.clear();if(characters.mode==='stage')characters.setMode('stage');}
 if(command==='celebrate')rendering.stage.celebrate();
 if(command==='musicNext')music?.next();
 if(command==='musicPrevious')music?.previous();
}
function cleanup(){if(disposed)return;disposed=true;giftGuide.dispose();cancelAnimationFrame(frameId);timers.forEach(clearInterval);previewChannel?.close();controlSocket?.disconnect();director?.dispose();dj?.dispose();mc?.dispose();music?.dispose();characters?.dispose();rendering?.dispose();}

try {
 reportConnection(params.get('id')||params.get('username')?'connecting':'local');
 await Promise.all([HmongI18n.ready,HmongChat.ready,HmongAssets.ready]);
 const response=await fetch('config.json');if(!response.ok)throw Error('Config unavailable');config=await response.json();
 music=new MusicPlayer({preview:params.get('hud')==='0',onChange:state=>{
  $('musicToggle').textContent=t(state.playing?'music.pause':'music.play');
  $('musicTitle').textContent=state.state==='blocked'?t('music.unlock'):state.state==='error'?t('music.error'):state.track?.title||t('music.empty');
  $('audioUnlock').hidden=state.state!=='blocked';
 }});
 try{await music.load();}catch(error){console.warn('[Music]',error);$('musicTitle').textContent=t('music.error');}
 mc=new HmongMC({preview:params.get('hud')==='0'||params.get('benchmark')==='1',onSpeaking:value=>music.setDucked(value),onChange:state=>{
  $('mcToggle').disabled=!state.ready;
  $('mcToggle').dataset.blocked=String(state.status==='blocked');
  $('mcToggle').textContent=!state.ready?'Chờ lời MC':state.enabled&&state.status!=='blocked'?'Tắt MC':'Bật MC';
  $('mcReference').disabled=!state.referenceReady;
  $('mcReference').textContent=state.audition?'Dừng nghe mẫu':'Nghe giọng nam';
  $('mcStatus').textContent=state.status==='blocked'?'Bấm để cho phép âm thanh':state.status==='error'?'Không phát được bản thu MC':state.audition?'Đang nghe mẫu giọng nam':!state.ready?(state.referenceReady?'MC nam: đã có mẫu giọng; chưa có câu chào/cảm ơn':'MC: chưa có bản thu'):state.speaking?`MC: ${state.text}`:state.enabled?'MC: đang bật':'MC: đã tắt';
 }});await mc.load();mc.setEnabled(params.get('mc')!=='0');
 $('mcToggle').addEventListener('click',()=>{mc.setEnabled($('mcToggle').dataset.blocked==='true'||!mc.enabled);mc.unlock();if(mc.enabled)mc.say('welcome',{cooldown:30000});});
 $('mcReference').addEventListener('click',()=>mc.playReference());
 const unlockMC=()=>{music.reactivity.unlock();mc.unlock();if(mc.enabled)mc.say('welcome',{cooldown:30000});};
 document.addEventListener('pointerdown',unlockMC,{once:true});document.addEventListener('keydown',unlockMC,{once:true});
 rendering=new Renderer($('scene'),config);characters=new Characters(rendering.scene,config);await characters.load();
 dj=new ResidentDJ(rendering.scene,characters);rendering.residentDJ=dj;
 characters.setMode(settings.mode);
 const requested=Number(params.get('limit'));if(Number.isFinite(requested)&&requested>0)characters.setLimit(requested);
 director=new ShowDirector(rendering,characters,{sound,onCaption:text=>{const caption=$('showCaption');caption.textContent=text;caption.hidden=!text;}});rendering.director=director;
 router=new EventRouter(characters,rendering.stage,config,{sound,mc,onBeer:data=>director.enqueueBeer(data),onDressing:data=>director.enqueueDressing(data),onGift:(data,rule)=>{if(characters.mode==='crowd')director.enqueue(data);else{const item=[...characters.items.values()][Number.isInteger(rule?.target)?rule.target:0];if(item)director.enqueue({...data,user:{...item.user,nickname:data.user?.nickname||item.user.nickname}});}},onFeed:feed,onStatus:reportConnection,onControl:control});
 applySettings(settings);HmongI18n.apply();$('musicTitle').removeAttribute('data-i18n');$('musicToggle').removeAttribute('data-i18n');music.emit('selected');$('loading').hidden=true;
 if(params.get('demo')==='1'||params.get('benchmark')==='1')status('crowd.demo');else if(!params.get('id')&&!params.get('username'))status('three.previewStatus');
 const demoCount=Math.max(4,Math.min(config.hardLimit,Number(params.get('count'))||6));
 if(params.get('benchmark')==='1'){characters.setMode('crowd');characters.setLimit(demoCount);for(let i=0;i<demoCount;i++)characters.request({uniqueId:`bench_${i}`,nickname:t('three.viewerNumber',{count:i+1})},'dance');}
 else if(params.get('demo')==='1'){
  if(settings.mode==='crowd')for(let i=0;i<demoCount;i++)characters.request({uniqueId:`demo_${i}`,nickname:t('three.viewerNumber',{count:i+1})});
  timers.push(setInterval(()=>{const i=Math.floor(Math.random()*demoCount),user={uniqueId:`demo_${i}`,nickname:t('three.viewerNumber',{count:i+1})};router.route('chat',{user,comment:t('common.hello')});},6500));
 }
 const localRoom=params.get('room');
 if(params.get('simulation')!=='1'){
  if(/^local_[a-f0-9]{32}$/.test(localRoom||'')){
   controlSocket=io();controlSocket.on('connect',()=>controlSocket.emit('join-control-room',localRoom,reply=>{if(reply?.ok){controlSocket.emit('display-control-ready',localRoom);if(latestConnection)controlSocket.emit('display-tiktok-status',{room:localRoom,...latestConnection});}}));controlSocket.on('virtual_crowd_control',data=>Hmong3DEvents.push('control',data));
  }else if(!params.get('id')&&!params.get('username')){previewChannel=new BroadcastChannel('hmong3d-preview');previewChannel.onmessage=event=>Hmong3DEvents.push('control',event.data);previewChannel.postMessage({kind:'ready'});}
 }
 $('sound').addEventListener('click',()=>{sound.ensureContext();applySettings({sound:!sound.enabled});});
 $('musicToggle').addEventListener('click',()=>music.toggle());
 $('audioUnlock').addEventListener('click',()=>{sound.ensureContext();mc.unlock();music.play();});
 $('musicNext').addEventListener('click',()=>music.next(true));
 $('musicPrevious').addEventListener('click',()=>music.previous());
 $('musicVolume').value=music.audio.volume;
 $('musicVolume').addEventListener('input',event=>music.setVolume(event.target.value));
 if(params.get('music')!=='0'&&params.get('hud')!=='0'&&params.get('benchmark')!=='1')music.play();
 $('fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch{status('three.fullscreenError');}});
 const username=params.get('id')||params.get('username');
 $('admin').href=`dashboard.html${username?`?id=${encodeURIComponent(username)}`:''}`;
 if(params.get('hud')==='0')document.body.classList.add('clean-overlay');
 else document.body.classList.add('display-overlay');
 $('metrics').hidden=params.get('metrics')!=='1'&&params.get('benchmark')!=='1';
 window.addEventListener('languagechange',()=>{applySettings({});music.emit(music.audio.paused?'paused':'playing');});
 window.addEventListener('pagehide',cleanup,{once:true});
 window.addEventListener('hmong3d-context-lost',()=>status('three.contextLost'));
 window.addEventListener('hmong3d-context-restored',()=>status('three.contextRestored'));
 let previous=performance.now(),accumulator=0,lastHud=0;
 const interval=1/config.targetFps;
 function frame(now){
  if(disposed)return;frameId=requestAnimationFrame(frame);const elapsed=Math.min(.1,(now-previous)/1000);previous=now;accumulator+=elapsed;
  if(accumulator<interval)return;const delta=Math.min(.1,accumulator);accumulator%=interval;
  for(const event of Hmong3DEvents.drain(config.eventBudgetPerFrame)){if(event.type==='connectionStatus'){reportConnection(event.data.type,event.data);continue;}if(event.type==='simulationLeave'){if(params.get('simulation')==='1')characters.removeViewer(event.data?.user);continue;}if(now-event.time<15000||event.type==='control'){router.route(event.type,event.data);if(params.get('simulation')==='1'&&event.type==='member'&&Number.isInteger(event.data?.simulationVariant)&&event.data.simulationVariant>=0&&event.data.simulationVariant<config.characters.length){const pending=characters.pending.get(characters.key(event.data.user));if(pending)pending.simulationVariant=event.data.simulationVariant;}} }
  characters.update(delta);rendering.frame(characters.items.values(),delta,settings.effects,characters.bounds,characters.revision,music?.features(delta));
  if(now-lastHud>1000){lastHud=now;const metrics=rendering.metrics(characters.items.size,Hmong3DEvents.size,Hmong3DEvents.dropped);$('count').textContent=t('crowd.count',{count:metrics.characters});$('metrics').textContent=`${metrics.fps} FPS · ${metrics.characters} · ${metrics.drawCalls} calls · ${metrics.triangles.toLocaleString()} △ · ${metrics.geometries} geo · ${metrics.textures} tex · ${metrics.heapMB??'—'} MB JS`;}
 }
 frameId=requestAnimationFrame(frame);
 window.Hmong3D={ready:true,music,mc,director,dj,stats:()=>({...rendering.metrics(characters.items.size,Hmong3DEvents.size,Hmong3DEvents.dropped),...director.stats(),pendingSpawns:characters.pending.size}),snapshot:()=>[...characters.items.values()].map(item=>({key:item.key,index:item.index,selectedGender:item.selectedGender||null,location:item.motionLocation||'floor',action:item.animation.name,selectedDance:item.selectedDance||null,base:item.animation.base,frame:item.animation.frame,clip:item.animation.clip,position:item.root.position.toArray(),scale:item.root.scale.x,spriteRotation:item.model.getObjectByName('CharacterArt')?.material.rotation,presentation:config.characterPresentation||'skinned',bones:item.model.getObjectByName('Hips')?.quaternion.toArray(),head:item.model.getObjectByName('Head')?.quaternion.toArray()})),inject:(type,data)=>Hmong3DEvents.push(type,data),settings:applySettings,dispose:cleanup};
} catch(error){console.error('[Hmong3D]',error);await HmongI18n.ready;$('loading').hidden=false;$('loadingText').textContent=t('three.loadError');status('status.error');cleanup();}
